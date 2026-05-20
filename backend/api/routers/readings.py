"""
api/routers/readings.py
HTTP endpoints for analysis pipeline, chat loop, event replay, and daily almanac.
"""
from __future__ import annotations
import uuid
import asyncio
from datetime import datetime, date, timezone
from typing import Optional
import json

from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks, Query, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from agents.state import (
    SystemState, BirthInfo, FaceFeatures, PalmFeatures, ChatMessage,
)
from agents.graph import run_full_analysis, run_chat
from agents.replay_prompt import replay_agent_prompt
from agents.master import _llm, _use_mock
from services.vision.face_v2t import FaceV2T
from services.vision.palm_v2t import PalmV2T
from services.product_matcher import ProductMatcher
from database.session import AsyncSessionLocal, engine
from database.models import Reading, ReadingStatus, PaymentStatus, EventLog, User
from auth.dependencies import get_current_user, require_user
from calculators.astrology_calculator import AstrologyCalculator
from calculators.bazi_calculator import BaziCalculator
from config import get_settings

settings = get_settings()

router = APIRouter()


@router.get("/ping")
async def readings_ping():
    """Quick health check — confirms readings router is loaded."""
    return {"status": "ok", "router": "readings"}


def _cleanup_sessions():
    """Evict sessions older than _SESSION_MAX_AGE to prevent memory leak."""
    global _last_session_cleanup
    import time
    now = time.time()
    if now - _last_session_cleanup < 300:  # run at most every 5 min
        return
    _last_session_cleanup = now
    expired = [
        sid for sid, created in _session_created.items()
        if (now - created) > _SESSION_MAX_AGE
    ]
    for sid in expired:
        _sessions.pop(sid, None)
        _session_created.pop(sid, None)

# In-memory session store (replace with Redis in production)
_sessions: dict[str, SystemState] = {}
_session_created: dict[str, float] = {}  # session_id -> creation timestamp
_SESSION_MAX_AGE = 3600 * 2  # 2 hours
_last_session_cleanup: float = 0.0

# Prevent background tasks from being garbage-collected
_bg_tasks: set = set()


# ─── Request / Response Schemas ───────────────────────────────────────────

class AnalysisRequest(BaseModel):
    gender: str = Field("female", pattern="^(male|female|other)$")
    birth_year: int = Field(..., ge=1920, le=2026)
    birth_month: int = Field(..., ge=1, le=12)
    birth_day: int = Field(..., ge=1, le=31)
    birth_hour: int = Field(..., ge=0, le=23)
    birth_minute: int = Field(0, ge=0, le=59)
    birth_city: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    user_question: str = "Please give me a complete multi-dimensional destiny analysis."
    is_premium: bool = False
    language: str = Field("zh", pattern="^(zh|en)$")  # "zh" or "en"
    tarot_cards: list[dict] = Field(default_factory=list)
    palm_raw_text: str = ""
    face_raw_text: str = ""


class ReadingListItem(BaseModel):
    id: str
    session_id: str = ""  # Alias for id — used by almanac and other consumers
    status: str
    master_summary: str = ""
    computed_tags: list[str] = Field(default_factory=list)
    dimension_scores: dict[str, float] = Field(default_factory=dict)
    is_detail_unlocked: bool = False
    created_at: datetime
    completed_at: Optional[datetime] = None


class ChatRequest(BaseModel):
    session_id: str
    question: str


class WorkerReportOut(BaseModel):
    agent_id: str
    report: str
    tags: list[str]
    error: Optional[str]
    duration_ms: Optional[float]


class AnalysisResponse(BaseModel):
    session_id: str
    status: str
    master_summary: str
    master_detail: str = ""               # 付费详细报告
    is_detail_unlocked: bool = False      # 是否已解锁付费内容
    astrology: WorkerReportOut
    tarot: WorkerReportOut
    bazi: WorkerReportOut
    qimen: WorkerReportOut
    ziwei: WorkerReportOut
    face: WorkerReportOut
    palm: WorkerReportOut
    recommended_product_ids: list[str]
    recommended_products: list[dict] = Field(default_factory=list)
    computed_tags: list[str]
    dimension_scores: dict[str, float]
    errors: list[str]


class ChatResponse(BaseModel):
    answer: str
    routed_to: str
    session_id: str
    loop_count: int


# ─── Helper ───────────────────────────────────────────────────────────────

def _state_to_response(state: SystemState) -> AnalysisResponse:
    def out(wo):
        return WorkerReportOut(
            agent_id=wo.agent_id,
            report=wo.report or "",
            tags=wo.tags,
            error=wo.error,
            duration_ms=wo.duration_ms,
        )
    return AnalysisResponse(
        session_id=state.session_id,
        status=state.phase,
        master_summary=state.master_summary,
        master_detail=getattr(state, "master_detail", "") or "",
        is_detail_unlocked=getattr(state, "is_detail_unlocked", False),
        astrology=out(state.astrology_output),
        tarot=out(state.tarot_output),
        bazi=out(state.bazi_output),
        qimen=out(state.qimen_output),
        ziwei=out(state.ziwei_output),
        face=out(state.face_output),
        palm=out(state.palm_output),
        recommended_product_ids=state.recommended_product_ids,
        recommended_products=state.recommended_products,
        computed_tags=state.computed_tags,
        dimension_scores=state.dimension_scores,
        errors=state.errors,
    )


# ─── Content Lock ─────────────────────────────────────────────────────────

_WORKER_REPORT_KEYS = ["astrology", "tarot", "bazi", "qimen", "ziwei", "face", "palm"]


def _apply_content_lock(resp: AnalysisResponse, current_user: Optional[User], reading: Optional[Reading] = None) -> AnalysisResponse:
    """
    Strip paid content (master_detail + long worker reports) for users who
    haven't unlocked the reading.  Called before every GET response.
    """
    is_unlocked = False
    if reading:
        # Case 1: user owns this reading AND has unlocked it
        if current_user and reading.user_id and str(reading.user_id) == str(current_user.id) and reading.is_detail_unlocked:
            is_unlocked = True
        # Case 2: user has an active premium subscription
        elif current_user and current_user.is_premium and current_user.premium_expires_at and current_user.premium_expires_at > datetime.now(timezone.utc):
            is_unlocked = True
    else:
        # In-memory session — trust the response flag
        if getattr(resp, "is_detail_unlocked", False):
            is_unlocked = True

    if not is_unlocked:
        resp.master_detail = ""
        resp.is_detail_unlocked = False
        for key in _WORKER_REPORT_KEYS:
            wo = getattr(resp, key, None)
            if wo and wo.report and len(wo.report) > 600:
                wo.report = wo.report[:600] + "\n\n🔒 解锁完整深度分析…"
    return resp


# ─── Endpoints ───────────────────────────────────────────────────────────

@router.post("", response_model=AnalysisResponse)
async def create_analysis(
    payload: AnalysisRequest,
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    POST creates session and kicks off background analysis.
    Frontend polls GET /session/{id} until status == "done".
    """
    bi = BirthInfo(
        year=payload.birth_year, month=payload.birth_month,
        day=payload.birth_day, hour=payload.birth_hour,
        minute=payload.birth_minute, city=payload.birth_city,
        latitude=payload.latitude, longitude=payload.longitude,
        gender=payload.gender,
    )

    face_feat = None
    if payload.face_raw_text:
        face_feat = FaceFeatures(raw_text=payload.face_raw_text)

    palm_feat = None
    if payload.palm_raw_text:
        palm_feat = PalmFeatures(raw_text=payload.palm_raw_text)

    # Determine premium status from server-side user record, NOT from client
    is_premium = False
    if current_user and current_user.is_premium:
        # Check if premium is still valid
        if current_user.premium_expires_at and current_user.premium_expires_at > datetime.now(timezone.utc):
            is_premium = True

    user_id = str(current_user.id) if current_user else None

    state = SystemState(
        user_id=user_id,
        birth_info=bi,
        face_features=face_feat,
        palm_features=palm_feat,
        user_question=payload.user_question,
        is_premium=is_premium,
        language=payload.language,
        tarot_raw={"spread": "Three-Card Spread", "cards": payload.tarot_cards},
    )

    # Persist session to DATABASE (with timeout to avoid blocking)
    try:
        await asyncio.wait_for(
            _persist_session(state.session_id, user_id, language=state.language),
            timeout=5,
        )
    except (asyncio.TimeoutError, Exception) as e:
        print(f"[WARN] Failed to create reading in DB: {e}")

    # Keep in-memory for same-instance fast access
    _cleanup_sessions()
    _sessions[state.session_id] = state
    import time as _time
    _session_created[state.session_id] = _time.time()

    # Start analysis in background (works on self-hosted server)
    # Keep strong reference to prevent GC before task completes
    task = asyncio.create_task(_run_analysis_bg(state, user_id))
    _bg_tasks.add(task)
    task.add_done_callback(_bg_tasks.discard)

    return _state_to_response(state)


async def _persist_session(session_id: str, user_id: Optional[str] = None, language: str = "zh"):
    """Persist a reading session to the database, auto-linking birth_profile_id."""
    from database.session import _db_available
    from database.models import BirthProfile
    if _db_available is False:
        return
    async with AsyncSessionLocal() as db:
        # Auto-link user's default birth profile
        birth_profile_id = None
        if user_id:
            stmt = (
                select(BirthProfile)
                .where(BirthProfile.user_id == user_id, BirthProfile.nickname == "本命")
                .limit(1)
            )
            result = await db.execute(stmt)
            bp = result.scalar_one_or_none()
            if not bp:
                # Fallback: use first profile
                stmt2 = (
                    select(BirthProfile)
                    .where(BirthProfile.user_id == user_id)
                    .order_by(BirthProfile.created_at.asc())
                    .limit(1)
                )
                result2 = await db.execute(stmt2)
                bp = result2.scalar_one_or_none()
            if bp:
                birth_profile_id = bp.id

        reading = Reading(
            id=session_id,
            user_id=user_id,
            birth_profile_id=birth_profile_id,
            status=ReadingStatus.pending,
            master_summary="",
            is_detail_unlocked=False,
            language=language,
        )
        db.add(reading)
        await db.commit()


async def _run_analysis_bg(state: SystemState, user_id: Optional[str] = None):
    """Background task: run the full pipeline then persist results to DB."""
    print(f"[BG] Starting analysis for {state.session_id}")
    # Update status to processing
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(Reading).where(Reading.id == state.session_id)
            result = await db.execute(stmt)
            reading = result.scalar_one_or_none()
            if reading:
                reading.status = ReadingStatus.processing
                await db.commit()
    except Exception:
        pass

    try:
        # Lazy imports to avoid cold-start cost
        from agents.graph import run_full_analysis
        print(f"[BG] Running full analysis pipeline for {state.session_id}")
        state = await run_full_analysis(state)
        print(f"[BG] Analysis completed for {state.session_id}, phase={state.phase}")
    except Exception as e:
        state.errors.append(str(e))
        state.phase = "done"
        print(f"[BG] Analysis failed for {state.session_id}: {e}")

    # Update in-memory cache
    _sessions[state.session_id] = state

    # Persist final results to database
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(Reading).where(Reading.id == state.session_id)
            result = await db.execute(stmt)
            reading = result.scalar_one_or_none()
            if reading:
                reading.status = ReadingStatus.completed
                reading.master_summary = state.master_summary
                reading.master_detail = getattr(state, "master_detail", "")
                reading.astrology_report = state.astrology_output.report if state.astrology_output else ""
                reading.tarot_report = state.tarot_output.report if state.tarot_output else ""
                reading.bazi_report = state.bazi_output.report if state.bazi_output else ""
                reading.qimen_report = state.qimen_output.report if state.qimen_output else ""
                reading.ziwei_report = state.ziwei_output.report if state.ziwei_output else ""
                reading.palm_report = state.palm_output.report if state.palm_output and state.palm_output.report != "No palm data provided. Palm analysis skipped." else None
                reading.face_analysis_text = state.face_output.report if state.face_output and state.face_output.report != "No facial image provided. Face analysis skipped." else None
                reading.dimension_scores = dict(state.dimension_scores) if state.dimension_scores else None
                reading.computed_tags = list(state.computed_tags) if state.computed_tags else None
                reading.recommended_product_ids = list(state.recommended_product_ids) if state.recommended_product_ids else None
                reading.completed_at = datetime.now(timezone.utc)
                await db.commit()
                print(f"[BG] Persisted reading {state.session_id} to DB")
    except Exception as e:
        print(f"[WARN] Failed to persist reading to DB: {e}")


@router.post("/chat", response_model=ChatResponse)
async def chat_followup(
    payload: ChatRequest,
    current_user: User = Depends(require_user),
):
    """
    Task C: Dynamic routing follow-up chat.
    Routes user question to the correct expert agent and returns a focused answer.
    需要登录，防止未授权消耗 API 额度
    """
    from agents.graph import run_chat

    state = _sessions.get(payload.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found. Run /readings/ first.")

    # 验证 session 归属
    if state.user_id and str(state.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="无权访问此 session")

    answer, agent_id, updated_state = await run_chat(payload.question, state)
    _sessions[payload.session_id] = updated_state

    return ChatResponse(
        answer=answer,
        routed_to=agent_id,
        session_id=payload.session_id,
        loop_count=updated_state.loop_count,
    )


async def _run_analysis_inline(state: SystemState) -> SystemState:
    """Run the full analysis pipeline inline (called lazily on GET poll)."""
    try:
        from agents.graph import run_full_analysis
        state = await run_full_analysis(state)
    except Exception as e:
        state.errors.append(str(e))
        state.phase = "done"
        print(f"[LAZY] Analysis failed for {state.session_id}: {e}")

    # Persist final results to database
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(Reading).where(Reading.id == state.session_id)
            result = await db.execute(stmt)
            reading = result.scalar_one_or_none()
            if reading:
                reading.status = ReadingStatus.completed
                reading.master_summary = state.master_summary
                reading.master_detail = getattr(state, "master_detail", "")
                reading.astrology_report = state.astrology_output.report if state.astrology_output else ""
                reading.tarot_report = state.tarot_output.report if state.tarot_output else ""
                reading.bazi_report = state.bazi_output.report if state.bazi_output else ""
                reading.qimen_report = state.qimen_output.report if state.qimen_output else ""
                reading.ziwei_report = state.ziwei_output.report if state.ziwei_output else ""
                reading.palm_report = state.palm_output.report if state.palm_output and state.palm_output.report != "No palm data provided. Palm analysis skipped." else None
                reading.face_analysis_text = state.face_output.report if state.face_output and state.face_output.report != "No facial image provided. Face analysis skipped." else None
                reading.dimension_scores = dict(state.dimension_scores) if state.dimension_scores else None
                reading.computed_tags = list(state.computed_tags) if state.computed_tags else None
                reading.recommended_product_ids = list(state.recommended_product_ids) if state.recommended_product_ids else None
                reading.completed_at = datetime.now(timezone.utc)
                await db.commit()
    except Exception as e:
        print(f"[WARN] Failed to persist reading to DB: {e}")

    return state


@router.get("/session/{session_id}", response_model=AnalysisResponse)
async def get_session(
    session_id: str,
    current_user: Optional[User] = Depends(get_current_user),
    lang: Optional[str] = Query(None, pattern="^(zh|en)$"),
):
    """
    Retrieve session by ID. Checks in-memory first, then DATABASE.
    Auth required — users can only access their own sessions.
    Optional lang parameter: if provided and differs from stored language,
    translates report content on-the-fly.
    """
    # Fast path: in-memory cache
    state = _sessions.get(session_id)
    if state:
        # Verify ownership if user is logged in
        if current_user and state.user_id and state.user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="无权访问此报告")
        resp = _state_to_response(state)
        # Merge DB fields: is_detail_unlocked, master_detail
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(Reading).where(Reading.id == session_id)
                )
                reading = result.scalar_one_or_none()
                if reading:
                    resp.is_detail_unlocked = reading.is_detail_unlocked
                    if reading.master_detail:
                        resp.master_detail = reading.master_detail
        except Exception:
            pass
        return _apply_content_lock(resp, current_user, reading)

    # Slow path: read from DATABASE
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Reading).where(Reading.id == session_id)
            )
            reading = result.scalar_one_or_none()
            if not reading:
                raise HTTPException(status_code=404, detail="报告不存在")

            # Verify ownership
            if current_user and reading.user_id and reading.user_id != str(current_user.id):
                raise HTTPException(status_code=403, detail="无权访问此报告")

            # If still pending/processing, return status so frontend keeps polling
            if reading.status in (ReadingStatus.pending, ReadingStatus.processing):
                return AnalysisResponse(
                    session_id=session_id,
                    status=reading.status.value,
                    master_summary="",
                    astrology=_empty_worker("astrology"),
                    tarot=_empty_worker("tarot"),
                    bazi=_empty_worker("bazi"),
                    qimen=_empty_worker("qimen"),
                    ziwei=_empty_worker("ziwei"),
                    face=_empty_worker("face"),
                    palm=_empty_worker("palm"),
                    recommended_product_ids=[],
                    computed_tags=[],
                    dimension_scores={},
                    errors=[],
                )

            # Completed or failed — reconstruct from DB
            resp = AnalysisResponse(
                session_id=session_id,
                status=reading.status.value,
                master_summary=reading.master_summary or "",
                master_detail=reading.master_detail or "",
                is_detail_unlocked=reading.is_detail_unlocked,
                astrology=_worker_from_report("astrology", reading.astrology_report),
                tarot=_worker_from_report("tarot", reading.tarot_report),
                bazi=_worker_from_report("bazi", reading.bazi_report),
                qimen=_worker_from_report("qimen", reading.qimen_report),
                ziwei=_worker_from_report("ziwei", reading.ziwei_report),
                face=_worker_from_report("face", reading.face_analysis_text),
                palm=_worker_from_report("palm", reading.palm_report),
                recommended_product_ids=reading.recommended_product_ids or [],
                computed_tags=reading.computed_tags or [],
                dimension_scores=reading.dimension_scores or {},
                errors=[reading.error_message] if reading.error_message else [],
            )

            # Apply content lock BEFORE translation (so we don't waste API calls translating locked content)
            _apply_content_lock(resp, current_user, reading)

            # On-the-fly translation if language mismatch
            stored_lang = getattr(reading, 'language', None) or "zh"
            if lang and lang != stored_lang:
                target = "English" if lang == "en" else "Chinese"
                # Translate master_summary and worker reports in parallel
                import asyncio
                translations = await asyncio.gather(
                    _translate_text(resp.master_summary, target),
                    _translate_text(resp.master_detail, target),
                    _translate_text(resp.astrology.report, target),
                    _translate_text(resp.tarot.report, target),
                    _translate_text(resp.bazi.report, target),
                    _translate_text(resp.qimen.report, target),
                    _translate_text(resp.ziwei.report, target),
                    _translate_text(resp.face.report, target),
                    _translate_text(resp.palm.report, target),
                )
                resp.master_summary = translations[0]
                resp.master_detail = translations[1]
                resp.astrology = WorkerReportOut(agent_id="astrology", report=translations[2], tags=resp.astrology.tags, error=resp.astrology.error, duration_ms=resp.astrology.duration_ms)
                resp.tarot = WorkerReportOut(agent_id="tarot", report=translations[3], tags=resp.tarot.tags, error=resp.tarot.error, duration_ms=resp.tarot.duration_ms)
                resp.bazi = WorkerReportOut(agent_id="bazi", report=translations[4], tags=resp.bazi.tags, error=resp.bazi.error, duration_ms=resp.bazi.duration_ms)
                resp.qimen = WorkerReportOut(agent_id="qimen", report=translations[5], tags=resp.qimen.tags, error=resp.qimen.error, duration_ms=resp.qimen.duration_ms)
                resp.ziwei = WorkerReportOut(agent_id="ziwei", report=translations[6], tags=resp.ziwei.tags, error=resp.ziwei.error, duration_ms=resp.ziwei.duration_ms)
                resp.face = WorkerReportOut(agent_id="face", report=translations[7], tags=resp.face.tags, error=resp.face.error, duration_ms=resp.face.duration_ms)
                resp.palm = WorkerReportOut(agent_id="palm", report=translations[8], tags=resp.palm.tags, error=resp.palm.error, duration_ms=resp.palm.duration_ms)

            return resp
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail="Session not found.")


def _empty_worker(agent_id: str) -> WorkerReportOut:
    return WorkerReportOut(agent_id=agent_id, report="", tags=[], error=None, duration_ms=None)


def _worker_from_report(agent_id: str, report: Optional[str]) -> WorkerReportOut:
    return WorkerReportOut(
        agent_id=agent_id,
        report=report or "",
        tags=[],
        error=None,
        duration_ms=None,
    )


# ─── On-the-fly Translation (for language mismatch) ────────────────────────

_translate_cache: dict[str, str] = {}  # key = f"{text_hash}:{target_lang}" -> translated text
_translate_llm = None  # Shared LLM instance (created lazily)
_translate_semaphore = asyncio.Semaphore(3)  # Max 3 concurrent translations

def _get_translate_llm():
    """Get or create a shared translation LLM instance."""
    global _translate_llm
    if _translate_llm is None:
        from langchain_openai import ChatOpenAI
        _translate_llm = ChatOpenAI(
            model=settings.MASTER_FAST_MODEL,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL or None,
            temperature=0.3,
            max_tokens=2000,
        )
    return _translate_llm

async def _translate_text(text: str, target_lang: str) -> str:
    """Translate a text block using a shared fast LLM. Caches results. Rate-limited."""
    if not text or len(text.strip()) < 10:
        return text

    # Check cache (use first 200 chars as key to avoid huge keys)
    cache_key = f"{hash(text[:200])}:{target_lang}"
    if cache_key in _translate_cache:
        return _translate_cache[cache_key]

    from agents.master import _use_mock
    if _use_mock():
        return text  # No translation in mock mode

    try:
        from langchain_core.messages import SystemMessage, HumanMessage

        _llm = _get_translate_llm()

        system = (
            f"Translate the following Chinese metaphysics analysis report to {target_lang.upper()}. "
            "Keep cultural terms like BaZi, Wu Xing, Ten Gods in parentheses. "
            "Maintain the same structure, formatting, and sections. "
            "Do NOT add any commentary — output ONLY the translated text."
        )

        # Rate-limit: max 3 concurrent LLM calls
        async with _translate_semaphore:
            resp = await asyncio.wait_for(
                _llm.ainvoke([
                    SystemMessage(content=system),
                    HumanMessage(content=text),
                ]),
                timeout=15,  # 15s max per translation
            )
        result = resp.content.strip()
        if result:
            _translate_cache[cache_key] = result
            # Evict if too large
            if len(_translate_cache) > 200:
                oldest = list(_translate_cache.keys())[:50]
                for k in oldest:
                    _translate_cache.pop(k, None)
            return result
    except Exception as e:
        print(f"[WARN] Translation failed: {e}")

    return text  # Fallback to original


# ─── SSE Streaming Endpoint ──────────────────────────────────────────────

@router.get("/session/{session_id}/stream")
async def stream_session(
    session_id: str,
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    SSE endpoint: push progress events as analysis completes.
    Events: phase, worker_done, subtask_done, complete, error.
    Auth required — users can only access their own sessions.
    """
    async def event_generator():
        state = _sessions.get(session_id)
        if not state:
            yield f"data: {json.dumps({'type': 'error', 'message': 'Session not found'})}\n\n"
            return

        # Verify ownership if user is logged in
        if current_user and state.user_id and state.user_id != str(current_user.id):
            yield f"data: {json.dumps({'type': 'error', 'message': '无权访问此报告'})}\n\n"
            return

        last_phase = ""
        streamed_workers: set[str] = set()
        streamed_subtasks: set[str] = set()
        last_pct = -1
        last_agent_status: dict[str, str] = {}

        while state.phase != "done":
            # Phase changes
            if state.phase != last_phase:
                yield f"data: {json.dumps({'type': 'phase', 'phase': state.phase})}\n\n"
                last_phase = state.phase

            # Progress events
            if state.progress_pct > last_pct:
                yield f"data: {json.dumps({'type': 'progress', 'pct': state.progress_pct, 'message': state.progress_message})}\n\n"
                last_pct = state.progress_pct

            # Agent status changes
            if state.agent_status != last_agent_status:
                yield f"data: {json.dumps({'type': 'agent_status', 'status': dict(state.agent_status)})}\n\n"
                last_agent_status = dict(state.agent_status)

            # Worker completions
            for agent_id in ["astrology", "tarot", "bazi", "qimen", "ziwei", "face", "palm"]:
                if agent_id in streamed_workers:
                    continue
                wo = getattr(state, f"{agent_id}_output", None)
                if wo and wo.report and wo.duration_ms:
                    yield f"data: {json.dumps({'type': 'worker_done', 'agent_id': agent_id, 'duration_ms': round(wo.duration_ms)})}\n\n"
                    streamed_workers.add(agent_id)

            # Sub-task completions
            for st_name, st_field in [
                ("core", "master_subtask_core"),
                ("dimensions", "master_subtask_dimensions"),
                ("actions", "master_subtask_actions"),
            ]:
                if st_name in streamed_subtasks:
                    continue
                val = getattr(state, st_field, "")
                if val:
                    yield f"data: {json.dumps({'type': 'subtask_done', 'subtask': st_name, 'length': len(val)})}\n\n"
                    streamed_subtasks.add(st_name)

            await asyncio.sleep(0.5)

        # Flush any remaining subtask events that completed at the same time as phase="done"
        for st_name, st_field in [
            ("core", "master_subtask_core"),
            ("dimensions", "master_subtask_dimensions"),
            ("actions", "master_subtask_actions"),
        ]:
            if st_name not in streamed_subtasks:
                val = getattr(state, st_field, "")
                if val:
                    yield f"data: {json.dumps({'type': 'subtask_done', 'subtask': st_name, 'length': len(val)})}\n\n"
                    streamed_subtasks.add(st_name)

        # Final complete event — apply content lock to SSE payload
        tmp_resp = _state_to_response(state)
        _apply_content_lock(tmp_resp, current_user)
        yield f"data: {json.dumps({'type': 'progress', 'pct': 100, 'message': '分析完成'})}\n\n"
        yield f"data: {json.dumps({'type': 'complete', 'master_summary': tmp_resp.master_summary[:500], 'master_detail': tmp_resp.master_detail})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/my", response_model=list[ReadingListItem])
async def list_my_readings(user: User = Depends(require_user)):
    """List all readings belonging to the current user, newest first."""
    try:
        async with AsyncSessionLocal() as db:
            stmt = (
                select(Reading)
                .where(Reading.user_id == user.id)
                .order_by(Reading.created_at.desc())
                .limit(50)
            )
            result = await db.execute(stmt)
            readings = result.scalars().all()
            items = []
            for r in readings:
                # Read from DB columns (persisted), fall back to in-memory cache
                computed_tags = list(r.computed_tags or [])
                dimension_scores = dict(r.dimension_scores or {})
                if not computed_tags or not dimension_scores:
                    state = _sessions.get(str(r.id))
                    if state:
                        if not computed_tags:
                            computed_tags = list(state.computed_tags or [])
                        if not dimension_scores:
                            dimension_scores = dict(state.dimension_scores or {})
                items.append(ReadingListItem(
                    id=str(r.id),
                    session_id=str(r.id),
                    status=r.status.value if r.status else "completed",
                    master_summary=(r.master_summary or "")[:200],
                    computed_tags=computed_tags,
                    dimension_scores=dimension_scores,
                    is_detail_unlocked=r.is_detail_unlocked,
                    created_at=r.created_at,
                    completed_at=r.completed_at,
                ))
            return items
    except Exception as exc:
        raise HTTPException(status_code=500, detail="获取报告列表失败，请稍后重试")


@router.delete("/{session_id}")
async def delete_reading(session_id: str, user: User = Depends(require_user)):
    """Delete a reading belonging to the current user."""
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(Reading).where(
                Reading.id == session_id,
                Reading.user_id == user.id,
            )
            result = await db.execute(stmt)
            reading = result.scalar_one_or_none()
            if not reading:
                raise HTTPException(status_code=404, detail="报告不存在")
            await db.delete(reading)
            await db.commit()
            # Also clean up in-memory session
            _sessions.pop(session_id, None)
            _session_created.pop(session_id, None)
            return {"ok": True}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="删除失败，请稍后重试")


MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload-face/{session_id}")
async def upload_face_image(
    session_id: str,
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Upload a face image -> V2T via MediaPipe FaceMesh 468 landmarks
    -> structured physiognomy text -> update session state.
    Uses the new FaceV2T engine for richer analysis.
    """
    # Verify session ownership
    state = _sessions.get(session_id)
    if state and current_user and state.user_id and state.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="无权访问此报告")
    from services.vision.face_v2t import FaceV2T
    face_v2t = FaceV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    try:
        result = face_v2t.analyze_bytes(content)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"视觉分析模块未安装: {e}")
    if not result:
        raise HTTPException(status_code=422,
                            detail="无法检测到面部。请上传清晰正面照。")
    feat_text = result.to_prompt_text()

    if session_id in _sessions:
        _sessions[session_id].face_features = FaceFeatures(
            three_zones_ratio=result.three_zones_ratio,
            face_shape=result.face_shape,
            forehead=result.forehead,
            eyes=result.eyes,
            nose=result.nose,
            mouth=result.mouth,
            chin=result.chin,
            cheekbones=result.cheekbones,
            ears=result.ears,
            zhun_tou=result.zhun_tou,
            shan_gen=result.shan_gen,
            di_ge=result.di_ge,
            e_tou=result.e_tou,
            liang_quan=result.liang_quan,
            yan_shen=result.yan_shen,
            eyebrows=result.eyebrows,
            ren_zhong=result.ren_zhong,
            summary=result.summary,
            raw_metrics=result.raw_metrics,
            raw_text=feat_text,
        )

    return {
        "session_id": session_id,
        "face_text": feat_text,
        "features": {
            "face_shape": result.face_shape,
            "three_zones_ratio": result.three_zones_ratio,
            "zhun_tou": result.zhun_tou,
            "shan_gen": result.shan_gen,
            "di_ge":    result.di_ge,
            "e_tou":    result.e_tou,
            "liang_quan": result.liang_quan,
            "yan_shen": result.yan_shen,
            "ren_zhong": result.ren_zhong,
            "summary":  result.summary,
        },
    }


@router.post("/analyze-face")
async def analyze_face_image(file: UploadFile = File(...)):
    """
    Stateless face V2T analysis.
    Upload a face image -> returns structured physiognomy text without creating a session.
    Frontend can call this during Step 2 to auto-analyze before submitting the full form.
    """
    from services.vision.face_v2t import FaceV2T
    face_v2t = FaceV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    try:
        result = face_v2t.analyze_bytes(content)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"视觉分析模块未安装: {e}")
    if not result:
        raise HTTPException(status_code=422,
                            detail="无法检测到面部。请上传清晰正面照。")
    return {
        "face_text": result.to_prompt_text(),
        "features": {
            "face_shape": result.face_shape,
            "three_zones_ratio": result.three_zones_ratio,
            "forehead": result.forehead,
            "eyes": result.eyes,
            "nose": result.nose,
            "mouth": result.mouth,
            "chin": result.chin,
            "cheekbones": result.cheekbones,
            "ears": result.ears,
            "eyebrows": result.eyebrows,
            "zhun_tou": result.zhun_tou,
            "shan_gen": result.shan_gen,
            "di_ge":    result.di_ge,
            "e_tou":    result.e_tou,
            "liang_quan": result.liang_quan,
            "yan_shen": result.yan_shen,
            "ren_zhong": result.ren_zhong,
            "summary":  result.summary,
            "quality_warning": result.quality_warning,
        },
    }


@router.post("/upload-palm/{session_id}")
async def upload_palm_description(
    session_id: str,
    hand_shape: str = "",
    life_line: str = "",
    head_line: str = "",
    heart_line: str = "",
    fate_line: str = "",
    sun_line: str = "",
    marriage_lines: str = "",
    health_line: str = "",
    special_marks: str = "",
    palm_mounds: str = "",
    thumb_type: str = "",
    finger_proportions: str = "",
    palm_color: str = "",
    nail_halfmoon: str = "",
    palm_flexibility: str = "",
    raw_text: str = "",
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Accept palm feature descriptions (text-based fallback).
    """
    # Verify session ownership
    state = _sessions.get(session_id)
    if state and current_user and state.user_id and state.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="无权访问此报告")
    pf = PalmFeatures(
        hand_shape=hand_shape,
        life_line=life_line, head_line=head_line, heart_line=heart_line,
        fate_line=fate_line, sun_line=sun_line, marriage_lines=marriage_lines,
        health_line=health_line, special_marks=special_marks,
        palm_mounds=palm_mounds, thumb_type=thumb_type,
        finger_proportions=finger_proportions, palm_color=palm_color,
        nail_halfmoon=nail_halfmoon, palm_flexibility=palm_flexibility,
        raw_text=raw_text,
    )
    if session_id in _sessions:
        _sessions[session_id].palm_features = pf

    return {"session_id": session_id, "palm_features": pf.model_dump()}


@router.post("/upload-palm-image/{session_id}")
async def upload_palm_image(
    session_id: str,
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Upload a palm image -> V2T via MediaPipe Hands + OpenCV line detection
    -> structured palmistry text -> update session state.
    """
    # Verify session ownership
    state = _sessions.get(session_id)
    if state and current_user and state.user_id and state.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="无权访问此报告")
    from services.vision.palm_v2t import PalmV2T
    palm_v2t = PalmV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    try:
        result = palm_v2t.analyze_bytes(content)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"视觉分析模块未安装: {e}")
    if not result:
        raise HTTPException(status_code=422,
                            detail="无法检测到手掌。请上传清晰手掌照片。")
    feat_text = result.to_prompt_text()

    if session_id in _sessions:
        _sessions[session_id].palm_features = PalmFeatures(
            hand_shape=result.hand_shape,
            hand_side=result.hand_side,
            life_line=result.life_line,
            head_line=result.head_line,
            heart_line=result.heart_line,
            fate_line=result.fate_line,
            sun_line=result.sun_line,
            marriage_lines=result.marriage_lines,
            health_line=result.health_line,
            special_marks=result.special_marks,
            palm_mounds=result.palm_mounds,
            thumb_type=result.thumb_type,
            finger_proportions=result.finger_proportions,
            finger_gaps=result.finger_gaps,
            wrist_lines=result.wrist_lines,
            palm_color=result.palm_color,
            nail_halfmoon=result.nail_halfmoon,
            palm_flexibility=result.palm_flexibility,
            raw_metrics=result.raw_metrics,
            raw_text=feat_text,
        )

    return {
        "session_id": session_id,
        "palm_text": feat_text,
        "features": {
            "hand_shape": result.hand_shape,
            "hand_side": result.hand_side,
            "life_line": result.life_line,
            "head_line": result.head_line,
            "heart_line": result.heart_line,
            "fate_line": result.fate_line,
            "sun_line": result.sun_line,
            "marriage_lines": result.marriage_lines,
            "health_line": result.health_line,
            "special_marks": result.special_marks,
            "palm_mounds": result.palm_mounds,
            "thumb_type": result.thumb_type,
            "finger_proportions": result.finger_proportions,
            "finger_gaps": result.finger_gaps,
            "wrist_lines": result.wrist_lines,
            "palm_color": result.palm_color,
            "nail_halfmoon": result.nail_halfmoon,
            "palm_flexibility": result.palm_flexibility,
            "line_direction_hint": result.line_direction_hint,
            "quality_warning": result.quality_warning,
            "summary": result.summary,
        },
    }


@router.post("/analyze-palm")
async def analyze_palm_image(file: UploadFile = File(...)):
    """
    Stateless palm V2T analysis.
    Upload a palm image -> returns structured palmistry text without creating a session.
    Frontend can call this during Step 2 to auto-analyze before submitting the full form.
    """
    from services.vision.palm_v2t import PalmV2T
    palm_v2t = PalmV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    try:
        result = palm_v2t.analyze_bytes(content)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"视觉分析模块未安装: {e}")
    if not result:
        raise HTTPException(status_code=422,
                            detail="无法检测到手掌。请上传清晰手掌照片。")
    return {
        "palm_text": result.to_prompt_text(),
        "features": {
            "hand_shape": result.hand_shape,
            "hand_side": result.hand_side,
            "life_line": result.life_line,
            "head_line": result.head_line,
            "heart_line": result.heart_line,
            "fate_line": result.fate_line,
            "sun_line": result.sun_line,
            "marriage_lines": result.marriage_lines,
            "health_line": result.health_line,
            "special_marks": result.special_marks,
            "palm_mounds": result.palm_mounds,
            "thumb_type": result.thumb_type,
            "finger_proportions": result.finger_proportions,
            "finger_gaps": result.finger_gaps,
            "wrist_lines": result.wrist_lines,
            "palm_color": result.palm_color,
            "nail_halfmoon": result.nail_halfmoon,
            "palm_flexibility": result.palm_flexibility,
            "line_direction_hint": result.line_direction_hint,
            "quality_warning": result.quality_warning,
            "summary": result.summary,
        },
    }


# ─── Event Analyzer (事件复盘) ─────────────────────────────────────────────────


class AnalyzeEventRequest(BaseModel):
    session_id: str
    event_description: str = Field(..., min_length=2, max_length=2000)
    event_datetime: datetime
    emotion_score: Optional[int] = Field(None, ge=1, le=10)


class AnalyzeEventResponse(BaseModel):
    event_id: str
    causal_analysis: str
    current_advice: str
    future_prevention: str
    remedy_keywords: list[str]
    recommended_products: list[dict] = Field(default_factory=list)


class EventListItem(BaseModel):
    id: str
    event_description: str
    event_datetime: datetime
    emotion_score: Optional[int]
    causal_analysis: Optional[str]
    created_at: datetime


class EventDetailResponse(BaseModel):
    id: str
    event_description: str
    event_datetime: datetime
    emotion_score: Optional[int]
    causal_analysis: Optional[str]
    current_advice: Optional[str]
    future_prevention: Optional[str]
    remedy_keywords: list
    recommended_products: list[dict] = Field(default_factory=list)
    created_at: datetime


# ─── Daily Almanac (个人黄历) ───────────────────────────────────────────────────


class DailyAlmanacResponse(BaseModel):
    date: str
    lunar_date: str = ""
    bazi_day_pillar: str = ""
    energy_score: int
    yi: list[str]
    ji: list[str]
    hu: list[dict] = Field(default_factory=list)
    daily_quote: str
    wuxing_analysis: str = ""


# ─── Daily Almanac Cache ─────────────────────────────────────────────────────
_almanac_cache: dict[str, dict] = {}  # key = f"{session_id}:{date}" -> cached response dict
_ALMANAC_CACHE_TTL = 3600 * 12  # 12 hours


# ─── Helpers ──────────────────────────────────────────────────────────────────


def _get_birth_info_for_session(session_id: str) -> Optional[dict]:
    """Extract birth info from cached session state."""
    state = _sessions.get(session_id)
    if not state or not state.birth_info:
        return None
    bi = state.birth_info
    return {
        "year": bi.year,
        "month": bi.month,
        "day": bi.day,
        "hour": bi.hour,
        "minute": bi.minute,
        "latitude": bi.latitude,
        "longitude": bi.longitude,
        "gender": bi.gender,
    }


async def _call_replay_llm(system_prompt: str) -> tuple[str, list[str], list[str]]:
    """Call the LLM for event replay analysis. Returns (analysis_text, remedy_keywords, boost_elements)."""
    from agents.master import _llm, _use_mock

    if _use_mock():
        return (
            "【因果溯源】\n"
            "根据用户命盘与事件时刻的流时数据综合分析，该事件与当前流年运势中的"
            "五行制化关系密切相关。\n\n"
            "【当下对策】\n"
            "建议关注当前五行平衡，适当补充缺失元素。\n\n"
            "【未来预防】\n"
            "注意定期复盘，建立命理预警机制。",
            ["#补火", "#增强决策力"],
            ["fire"],
        )

    llm = _llm(temperature=0.4)
    from langchain_core.messages import SystemMessage, HumanMessage

    resp = await llm.ainvoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content="请对以上事件进行完整的复盘分析。"),
    ])
    text = resp.content

    # Extract JSON tags from the response
    remedy_keywords = []
    boost_elements = []
    try:
        import re
        json_match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
        if json_match:
            tag_data = json.loads(json_match.group(1))
            remedy_keywords = tag_data.get("remedy_keywords", [])
            boost_elements = tag_data.get("boost_elements", [])
            # Remove the JSON block from the main text
            text = text[:json_match.start()].strip()
    except (json.JSONDecodeError, AttributeError):
        pass

    return text, remedy_keywords, boost_elements


def _compute_energy_score(
    dimension_scores: dict[str, float],
    bazi_scores: dict[str, float] | None = None,
) -> int:
    """Compute a 0-100 daily energy score from dimension scores + bazi harmony."""
    if not dimension_scores:
        return 50
    avg_dim = sum(dimension_scores.values()) / max(len(dimension_scores), 1)
    score = int(avg_dim * 10)  # 0-10 -> 0-100
    # Penalize for missing/weak elements
    if bazi_scores:
        missing_penalty = sum(1 for v in bazi_scores.values() if v < 0.5) * 5
        score -= missing_penalty
    return max(10, min(100, score))


# ─── Event Analyzer Endpoint ──────────────────────────────────────────────────


@router.post("/analyze-event", response_model=AnalyzeEventResponse)
async def analyze_event(
    payload: AnalyzeEventRequest,
    current_user: User = Depends(require_user),
):
    """
    Analyze a user event against their birth chart + transit data.

    Steps:
    1. Load session state
    2. Compute transit astrology + bazi for event datetime
    3. Call ReplayAgent LLM for causal analysis
    4. Match products from remedy keywords
    5. Save EventLog to database
    """
    # 1. Load session
    state = _sessions.get(payload.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found. Run /readings/ first.")
    if not state.birth_info:
        raise HTTPException(status_code=400, detail="Session missing birth info.")

    bi = state.birth_info
    event_dt = payload.event_datetime

    # 2a. Compute transit astrology
    from calculators.astrology_calculator import AstrologyCalculator
    astro_calc = AstrologyCalculator()
    try:
        natal_chart = astro_calc.calculate(
            year=bi.year, month=bi.month, day=bi.day,
            hour=bi.hour, minute=bi.minute,
            latitude=bi.latitude or 0.0,
            longitude=bi.longitude or 0.0,
        )
        natal_planets = natal_chart.planets  # raw planet data for transit calc

        transit_astro = astro_calc.calculate_transit_for_date(
            target_date=event_dt,
            natal_planets=natal_planets,
        )
    except Exception as exc:
        transit_astro = {"transit_planets": {}, "transit_natal_aspects": []}

    # 2b. Compute transit bazi pillars
    from calculators.bazi_calculator import BaziCalculator
    try:
        transit_bazi = BaziCalculator.calculate_transit_pillars(
            year=event_dt.year,
            month=event_dt.month,
            day=event_dt.day,
        )
    except Exception:
        transit_bazi = None

    # 3. Build replay prompt and call LLM
    from agents.replay_prompt import replay_agent_prompt
    bazi_weak = list(state.bazi_output.weakness_tags) if state.bazi_output else []
    bazi_strong = list(state.bazi_output.strength_tags) if state.bazi_output else []
    astro_weak = list(state.astrology_output.weakness_tags) if state.astrology_output else []

    system_prompt = replay_agent_prompt(
        master_summary=state.master_summary,
        computed_tags=state.computed_tags,
        dimension_scores=state.dimension_scores,
        bazi_weakness_tags=bazi_weak,
        bazi_strength_tags=bazi_strong,
        astro_weakness_tags=astro_weak,
        event_description=payload.event_description,
        event_datetime_str=event_dt.isoformat(),
        transit_bazi=transit_bazi,
        transit_astrology=transit_astro,
    )

    analysis_text, remedy_keywords, boost_elements = await _call_replay_llm(system_prompt)

    # Parse 3 sections from the analysis text (flexible header matching)
    sections = {"causal_analysis": "", "current_advice": "", "future_prevention": ""}
    current_key = "causal_analysis"
    header_map = {
        "因果溯源": "causal_analysis",
        "当下对策": "current_advice",
        "未来预防": "future_prevention",
    }
    lines = analysis_text.split("\n")
    for line in lines:
        stripped = line.strip()
        matched = False
        for keyword, section_name in header_map.items():
            if keyword in stripped:
                current_key = section_name
                matched = True
                break
        if matched:
            continue
        sections[current_key] += line + "\n"
    for k in sections:
        sections[k] = sections[k].strip()

    # 4. Match products from remedy keywords
    from services.product_matcher import ProductMatcher
    matcher = ProductMatcher()
    matched_products = matcher.match_with_reasons(
        weakness_tags=remedy_keywords,
        boost_elements=boost_elements,
        astro_weakness_tags=[],
        top_k=4,
    )
    # Add LLM explanations
    for p in matched_products:
        explanation = matcher.explain_why(
            product=p,
            master_summary=state.master_summary,
            weakness_tags=remedy_keywords,
            boost_elements=boost_elements,
        )
        p["recommendation_text"] = explanation

    # 5. Save EventLog to database
    # Ensure event_logs table exists (safe to call multiple times)
    try:
        from database.models import Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception:
        pass

    event_id = uuid.uuid4()
    try:
        # Ensure JSON-serializable types (strip numpy types, UUIDs, etc.)
        def _clean_json(val):
            """Round-trip through json to strip non-standard types (numpy, etc)."""
            if val is None:
                return None
            return json.loads(json.dumps(val, default=str, ensure_ascii=False))

        _product_ids = _clean_json([p.get("id") or p.get("_id") for p in matched_products])
        _remedy_kw = _clean_json(list(remedy_keywords) if remedy_keywords else [])
        _transit_bazi = _clean_json(transit_bazi)
        _transit_astro = _clean_json(transit_astro)

        async with AsyncSessionLocal() as db:
            evt = EventLog(
                id=event_id,
                session_id=payload.session_id,
                user_id=None,  # anonymous sessions
                event_description=payload.event_description,
                event_datetime=event_dt,
                emotion_score=payload.emotion_score,
                transit_bazi=_transit_bazi,
                transit_astrology=_transit_astro,
                causal_analysis=sections["causal_analysis"],
                current_advice=sections["current_advice"],
                future_prevention=sections["future_prevention"],
                remedy_keywords=_remedy_kw,
                recommended_product_ids=_product_ids,
            )
            db.add(evt)
            await db.commit()
    except Exception as db_err:
        # Log but don't fail the response
        import traceback
        traceback.print_exc()
        print(f"[EventLog] Save error: {db_err}")
        state.errors.append(f"EventLog save error: {str(db_err)}")

    return AnalyzeEventResponse(
        event_id=str(event_id),
        causal_analysis=sections["causal_analysis"],
        current_advice=sections["current_advice"],
        future_prevention=sections["future_prevention"],
        remedy_keywords=remedy_keywords,
        recommended_products=matched_products,
    )


# ─── Event List Endpoint ──────────────────────────────────────────────────────


@router.get("/events", response_model=list[EventListItem])
async def list_events(
    session_id: str = Query(...),
    current_user: User = Depends(require_user),
):
    """List all events for a session, newest first. 需要登录且验证 session 归属。"""
    try:
        # 验证 session 归属
        state = _sessions.get(session_id)
        if state and state.user_id and str(state.user_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="无权访问此 session")

        async with AsyncSessionLocal() as db:
            # 验证数据库中的 session 归属
            reading_result = await db.execute(
                select(Reading).where(Reading.id == session_id)
            )
            reading = reading_result.scalar_one_or_none()
            if reading and reading.user_id and str(reading.user_id) != str(current_user.id):
                raise HTTPException(status_code=403, detail="无权访问此报告")

            stmt = (
                select(EventLog)
                .where(EventLog.session_id == session_id)
                .order_by(EventLog.created_at.desc())
                .limit(50)
            )
            result = await db.execute(stmt)
            events = result.scalars().all()
            return [
                EventListItem(
                    id=str(e.id),
                    event_description=e.event_description,
                    event_datetime=e.event_datetime,
                    emotion_score=e.emotion_score,
                    causal_analysis=e.causal_analysis[:200] if e.causal_analysis else None,
                    created_at=e.created_at,
                )
                for e in events
            ]
    except Exception as exc:
        raise HTTPException(status_code=500, detail="获取事件列表失败，请稍后重试")


# ─── Event Detail Endpoint ────────────────────────────────────────────────────


@router.get("/events/{event_id}", response_model=EventDetailResponse)
async def get_event_detail(
    event_id: str,
    current_user: User = Depends(require_user),
):
    """Get full event analysis detail."""
    event_uuid = event_id

    try:
        async with AsyncSessionLocal() as db:
            stmt = select(EventLog).where(EventLog.id == event_uuid)
            result = await db.execute(stmt)
            evt = result.scalar_one_or_none()
            if not evt:
                raise HTTPException(status_code=404, detail="Event not found.")

            # Load products from product IDs
            from services.product_matcher import ProductMatcher
            matcher = ProductMatcher()
            matched = []
            if evt.remedy_keywords:
                matched = matcher.match_with_reasons(
                    weakness_tags=evt.remedy_keywords or [],
                    boost_elements=[],
                    top_k=4,
                )
                for p in matched:
                    p["recommendation_text"] = matcher.explain_why(
                        product=p,
                        master_summary="",
                        weakness_tags=evt.remedy_keywords or [],
                    )

            return EventDetailResponse(
                id=str(evt.id),
                event_description=evt.event_description,
                event_datetime=evt.event_datetime,
                emotion_score=evt.emotion_score,
                causal_analysis=evt.causal_analysis,
                current_advice=evt.current_advice,
                future_prevention=evt.future_prevention,
                remedy_keywords=evt.remedy_keywords or [],
                recommended_products=matched,
                created_at=evt.created_at,
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="获取事件详情失败，请稍后重试")


# ─── Daily Fortune (Personalized) ───────────────────────────────────────────

class DailyFortuneResponse(BaseModel):
    date: str
    greeting: str
    overall_score: int
    wealth_fortune: int
    career_fortune: int
    love_fortune: int
    health_fortune: int
    lucky_color: str
    lucky_number: int
    advice: str
    warning: str
    personalized: bool = False  # 是否基于用户命盘数据个性化


@router.get("/daily-fortune")
async def get_daily_fortune(
    birth_year: Optional[int] = Query(None, ge=1920, le=2026),
    birth_month: Optional[int] = Query(None, ge=1, le=12),
    birth_day: Optional[int] = Query(None, ge=1, le=31),
    birth_hour: Optional[int] = Query(None, ge=0, le=23),
    lang: str = Query("zh", pattern="^(zh|en)$"),
):
    """
    Daily fortune — personalized based on user birth chart.
    Without birth info, returns date-based generic fortune.
    Supports lang=zh|en for localized output.
    """
    from calculators.bazi_calculator import TIANGAN, DIZHI, TIANGAN_WUXING, DIZHI_WUXING, BaziCalculator

    today = date.today()
    seed = today.year * 10000 + today.month * 100 + today.day

    def _hash(n: int) -> float:
        import math
        x = math.sin(seed * 9301 + n * 49297) * 49297
        return x - math.floor(x)

    def _score(base: float, variance: float, n: int) -> int:
        return max(1, min(10, round(base + (_hash(n) - 0.5) * variance)))

    # 通用运势（无用户数据时）
    overall = _score(6, 4, 0)
    wealth = _score(5, 5, 1)
    career = _score(6, 4, 2)
    love = _score(5, 5, 3)
    health = _score(6, 3, 4)
    personalized = False

    if birth_year and birth_month and birth_day and birth_hour is not None:
        personalized = True
        try:
            calc = BaziCalculator(birth_year, birth_month, birth_day, birth_hour, 0)
            result = calc.calculate()
            dm_element = result.day_master_element  # 用户日主五行

            # 今日天干地支
            today_lunar = Solar.fromYmd(today.year, today.month, today.day).getLunar()
            today_tg = today_lunar.getDayGan()
            today_dz = today_lunar.getDayZhi()
            today_element = TIANGAN_WUXING.get(today_tg, "土")

            # 五行生克关系
            SHENG = {"木": "火", "火": "土", "土": "金", "金": "水", "水": "木"}  # 我生
            KE = {"木": "土", "土": "水", "水": "火", "火": "金", "金": "木"}  # 我克
            SHENG_ME = {v: k for k, v in SHENG.items()}  # 生我
            KE_ME = {v: k for k, v in KE.items()}  # 克我

            # 今日五行对用户日主的影响
            if today_element == dm_element:
                # 比肩 — 同类，平稳
                mod = 0
            elif SHENG.get(dm_element) == today_element:
                # 我生 — 泄气，略低
                mod = -1
            elif KE.get(dm_element) == today_element:
                # 我克 — 得财，财运好
                mod = 1
            elif SHENG_ME.get(dm_element) == today_element:
                # 生我 — 有助力，整体好
                mod = 1
            elif KE_ME.get(dm_element) == today_element:
                # 克我 — 压力，需注意
                mod = -1
            else:
                mod = 0

            # 应用五行调制
            overall = max(1, min(10, overall + mod))
            wealth = max(1, min(10, wealth + (1 if KE.get(dm_element) == today_element else mod)))
            career = max(1, min(10, career + (1 if SHENG_ME.get(dm_element) == today_element else mod)))
            love = max(1, min(10, love + (0 if mod > 0 else -1 if mod < 0 else 0)))
            health = max(1, min(10, health + (1 if today_element == dm_element else 0)))

            # 地支影响 — 三合/六合加分
            dz_element = DIZHI_WUXING.get(today_dz, "土")
            if dz_element == dm_element:
                overall = min(10, overall + 1)
                health = min(10, health + 1)

        except Exception:
            pass  # 降级为通用运势

    # 幸运色 — 基于日主五行
    WUXING_COLORS = {
        "木": [("翠绿", "#52B788"), ("青色", "#2ECC71")],
        "火": [("红色", "#E63946"), ("橙色", "#F97316")],
        "土": [("金色", "#C9A84C"), ("黄色", "#EAB308")],
        "金": [("白色", "#E8E8E8"), ("银色", "#94A3B8")],
        "水": [("蓝色", "#2980B9"), ("黑色", "#333333")],
    }
    if personalized:
        try:
            calc = BaziCalculator(birth_year, birth_month, birth_day, birth_hour, 0)
            dm = calc.calculate().day_master_element
            colors = WUXING_COLORS.get(dm, [("金色", "#C9A84C")])
            lucky_color_name, lucky_color_hex = colors[int(_hash(100) * len(colors))]
        except Exception:
            lucky_color_name, lucky_color_hex = "金色", "#C9A84C"
    else:
        all_colors = [
            ("金色", "#C9A84C"), ("红色", "#E63946"), ("蓝色", "#2980B9"),
            ("绿色", "#52B788"), ("紫色", "#9B59B6"), ("白色", "#E8E8E8"),
            ("黑色", "#333333"), ("粉色", "#F472B6"), ("橙色", "#F97316"),
        ]
        idx = int(_hash(100) * len(all_colors))
        lucky_color_name, lucky_color_hex = all_colors[idx]

    lucky_number = int(_hash(200) * 9) + 1

    # 运势建议 — bilingual arrays
    ADVICES_ZH = [
        "今日适合制定长期规划，把灵感转化为行动步骤。",
        "主动社交能带来意外惊喜，不妨联系一位老朋友。",
        "学习新技能的好时机，专注力处于高峰期。",
        "整理财务状况，检查近期支出是否有优化空间。",
        "适度运动能显著提升今日效率和心情。",
        "创意工作者今日灵感旺盛，适合突破性创作。",
        "与家人共度时光能带来深层的情感满足。",
        "处理积压的邮件和消息，保持沟通畅通。",
        "尝试一种新的饮食或烹饪方式，给味蕾换个心情。",
        "适合安静独处，深度思考能带来重要洞见。",
    ]
    ADVICES_EN = [
        "A great day for long-term planning — turn your ideas into actionable steps.",
        "Proactive socializing can bring unexpected surprises. Reach out to an old friend.",
        "Ideal time to learn a new skill — your focus is at its peak.",
        "Review your finances and check where recent spending can be optimized.",
        "Moderate exercise will significantly boost your efficiency and mood today.",
        "Creative minds are inspired today — perfect for breakthrough work.",
        "Quality time with family brings deep emotional fulfillment.",
        "Clear your inbox and messages to keep communication flowing smoothly.",
        "Try a new cuisine or cooking method to refresh your senses.",
        "A good day for quiet solitude — deep thinking can reveal important insights.",
    ]
    WARNINGS_ZH = [
        "避免在情绪激动时做重要决定，给自己10分钟冷静期。",
        "交通出行注意安全，预留充足时间避免匆忙。",
        "不宜借贷或担保，今日财运需要保守策略。",
        "小心言辞，无心之语可能被误解，沟通前多想想。",
        "避免熬夜，今日身体需要充分休息来恢复能量。",
        "网络购物容易冲动消费，把商品加入购物车明天再决定。",
        "不宜签署重要合同，细节容易被忽略。",
        "远离是非之地，今日容易卷入不必要的纷争。",
        "饮食注意清淡，肠胃较为敏感。",
        "减少屏幕使用时间，让眼睛和大脑得到休息。",
    ]
    WARNINGS_EN = [
        "Avoid making important decisions when emotional — give yourself a 10-minute cool-down.",
        "Be cautious when traveling today. Allow extra time to avoid rushing.",
        "Avoid lending or guaranteeing loans — today calls for conservative financial strategies.",
        "Watch your words — innocent remarks may be misunderstood. Think before you speak.",
        "Avoid staying up late — your body needs adequate rest to recharge today.",
        "Impulse buying is tempting online — add to cart and decide tomorrow instead.",
        "Avoid signing important contracts — details may be easily overlooked.",
        "Stay away from contentious situations — you may get drawn into unnecessary disputes.",
        "Keep meals light and mild — your stomach may be sensitive today.",
        "Reduce screen time to give your eyes and brain a well-deserved break.",
    ]

    if lang == "en":
        advice = ADVICES_EN[int(_hash(300) * len(ADVICES_EN))]
        warning = WARNINGS_EN[int(_hash(400) * len(WARNINGS_EN))]
    else:
        advice = ADVICES_ZH[int(_hash(300) * len(ADVICES_ZH))]
        warning = WARNINGS_ZH[int(_hash(400) * len(WARNINGS_ZH))]

    WEEKDAYS_ZH = ["一", "二", "三", "四", "五", "六", "日"]
    WEEKDAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    if lang == "en":
        weekday_en = WEEKDAYS_EN[today.weekday()]
        date_str = f"{weekday_en}, {today.strftime('%B')} {today.day}, {today.year}"
        greeting = f"{today.strftime('%B')} {today.day} Fortune"
    else:
        weekday_zh = WEEKDAYS_ZH[today.weekday()]
        date_str = f"{today.month}月{today.day}日 星期{weekday_zh}"
        greeting = f"{today.month}月{today.day}日运势"

    return DailyFortuneResponse(
        date=date_str,
        greeting=greeting,
        overall_score=overall,
        wealth_fortune=wealth,
        career_fortune=career,
        love_fortune=love,
        health_fortune=health,
        lucky_color=lucky_color_name,
        lucky_number=lucky_number,
        advice=advice,
        warning=warning,
        personalized=personalized,
    )


# ─── Daily Almanac Cache ─────────────────────────────────────────────────────
_almanac_cache: dict[str, dict] = {}  # key = f"{session_id}:{date}" -> cached response dict
_ALMANAC_CACHE_TTL = 3600 * 12  # 12 hours


# ─── Daily Almanac Endpoint ────────────────────────────────────────────────────


@router.get("/daily-almanac", response_model=DailyAlmanacResponse)
async def get_daily_almanac(
    session_id: str = Query(...),
    lang: str = Query("zh", pattern="^(zh|en)$"),
):
    """
    Get personalized daily almanac (yi/ji/hu) based on user's birth chart vs today's transits.

    Real-time computation, no storage.
    Supports lang=zh|en for localized output.
    """
    state = _sessions.get(session_id)

    # Reconstruct from database if session was lost (e.g. after server restart)
    if not state:
        try:
            from database.models import Reading, BirthProfile
            from agents.state import SystemState, BirthInfo
            from sqlalchemy import select

            async with AsyncSessionLocal() as db:
                reading = (await db.execute(
                    select(Reading).where(Reading.id == session_id)
                )).scalar_one_or_none()
                if not reading:
                    raise HTTPException(status_code=404, detail="Session not found.")

                # Try to get birth profile if available
                bi = None
                if reading.birth_profile_id:
                    bp = (await db.execute(
                        select(BirthProfile).where(BirthProfile.id == reading.birth_profile_id)
                    )).scalar_one_or_none()
                    if bp:
                        gender_str = bp.gender.value if hasattr(bp.gender, "value") else str(bp.gender)
                        bi = BirthInfo(
                            year=bp.birth_year, month=bp.birth_month, day=bp.birth_day,
                            hour=bp.birth_hour, minute=bp.birth_minute,
                            city=bp.birth_city or "",
                            latitude=bp.latitude, longitude=bp.longitude,
                            gender=gender_str,
                        )

                state = SystemState(
                    session_id=session_id,
                    birth_info=bi,
                    dimension_scores=getattr(reading, 'dimension_scores', None) or {},
                    computed_tags=reading.computed_tags or [],
                    master_summary=reading.master_summary or "",
                    bazi_raw=reading.bazi_raw or {},
                    astrology_raw=reading.astrology_raw or {},
                )
                # Cache for future requests
                _sessions[session_id] = state
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to restore session: {e}")

    # Check cache — same user + same day = instant response
    from fastapi.responses import JSONResponse
    cache_key = f"{session_id}:{date.today()}:{lang}"
    import time as _time
    cached = _almanac_cache.get(cache_key)
    if cached and (_time.time() - cached.get("_ts", 0)) < _ALMANAC_CACHE_TTL:
        return JSONResponse(content={k: v for k, v in cached.items() if k != "_ts"})

    bi = state.birth_info
    today = date.today()

    # 1. Compute natal chart (if birth info available)
    natal_planets = {}
    transit = {"transit_planets": {}, "transit_natal_aspects": []}
    from calculators.astrology_calculator import AstrologyCalculator
    astro_calc = AstrologyCalculator()
    if bi:
        try:
            natal_chart = astro_calc.calculate(
                year=bi.year, month=bi.month, day=bi.day,
                hour=bi.hour, minute=bi.minute,
                latitude=bi.latitude or 0.0,
                longitude=bi.longitude or 0.0,
            )
            natal_planets = natal_chart.planets
        except Exception:
            pass

        # 2. Compute today's transits
        try:
            today_dt = datetime(today.year, today.month, today.day, 12, 0, tzinfo=timezone.utc)
            transit = astro_calc.calculate_transit_for_date(today_dt, natal_planets)
        except Exception:
            pass

    # 3. Compute today's bazi pillars + lunar date
    from calculators.bazi_calculator import BaziCalculator
    today_bazi = None
    lunar_date_str = ""
    bazi_day_pillar_str = ""
    try:
        today_bazi = BaziCalculator.calculate_transit_pillars(today.year, today.month, today.day)
        if today_bazi:
            dp = today_bazi.get("day_pillar", {})
            raw_gz = dp.get("ganzhi", "")
            if lang == "en" and raw_gz and len(raw_gz) >= 2:
                _g_map = {"甲":"Jia","乙":"Yi","丙":"Bing","丁":"Ding","戊":"Wu",
                          "己":"Ji","庚":"Geng","辛":"Xin","壬":"Ren","癸":"Gui"}
                _z_map = {"子":"Zi","丑":"Chou","寅":"Yin","卯":"Mao","辰":"Chen","巳":"Si",
                          "午":"Wu","未":"Wei","申":"Shen","酉":"You","戌":"Xu","亥":"Hai"}
                g_en = _g_map.get(raw_gz[0], raw_gz[0])
                z_en = _z_map.get(raw_gz[1], raw_gz[1])
                bazi_day_pillar_str = f"{g_en}-{z_en}"
            else:
                bazi_day_pillar_str = raw_gz
    except Exception:
        pass
    try:
        from lunar_python import Solar
        today_lunar = Solar.fromYmd(today.year, today.month, today.day).getLunar()

        if lang == "en":
            # Build English lunar date string
            gan_zhi_map = {
                "甲":"Jia","乙":"Yi","丙":"Bing","丁":"Ding","戊":"Wu",
                "己":"Ji","庚":"Geng","辛":"Xin","壬":"Ren","癸":"Gui",
            }
            zhi_map = {
                "子":"Zi","丑":"Chou","寅":"Yin","卯":"Mao","辰":"Chen","巳":"Si",
                "午":"Wu","未":"Wei","申":"Shen","酉":"You","戌":"Xu","亥":"Hai",
            }
            animal_map = {
                "鼠":"Rat","牛":"Ox","虎":"Tiger","兔":"Rabbit","龙":"Dragon","蛇":"Snake",
                "马":"Horse","羊":"Goat","猴":"Monkey","鸡":"Rooster","狗":"Dog","猪":"Pig",
            }
            month_names = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
            day_names = ["","1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th",
                        "11th","12th","13th","14th","15th","16th","17th","18th","19th","20th",
                        "21st","22nd","23rd","24th","25th","26th","27th","28th","29th","30th","31st"]
            weekday_map = {"一":"Mon","二":"Tue","三":"Wed","四":"Thu","五":"Fri","六":"Sat","日":"Sun"}

            def translate_gz(gz: str) -> str:
                if len(gz) >= 2:
                    g = gan_zhi_map.get(gz[0], gz[0])
                    z = zhi_map.get(gz[1], gz[1])
                    return f"{g}-{z}"
                return gz

            def translate_animal(a: str) -> str:
                return animal_map.get(a, a)

            year_gz = translate_gz(today_lunar.getYearInGanZhi())
            month_gz = translate_gz(today_lunar.getMonthInGanZhi())
            day_gz = translate_gz(today_lunar.getDayInGanZhi())
            time_gz = translate_gz(today_lunar.getTimeInGanZhi())
            year_animal = translate_animal(today_lunar.getYearShengXiao())
            month_animal = translate_animal(today_lunar.getMonthShengXiao())
            day_animal = translate_animal(today_lunar.getDayShengXiao())
            time_animal = translate_animal(today_lunar.getTimeShengXiao())

            weekday_cn = today_lunar.getWeek()
            weekday_en = weekday_map.get(str(weekday_cn), "")

            lunar_date_str = (
                f"Lunar: {today_lunar.getYearInChinese()}"
                f" Year {year_gz}({year_animal})"
                f" Month {month_gz}({month_animal})"
                f" Day {day_gz}({day_animal})"
                f" Hour {time_gz}({time_animal})"
                f" | {weekday_en}"
            )
        else:
            lunar_date_str = today_lunar.toFullString()
    except Exception:
        pass

    # 4. Compute energy score
    energy_score = _compute_energy_score(
        state.dimension_scores,
        state.bazi_raw.get("wuxing_scores") if state.bazi_raw else None,
    )

    # 5. Generate yi/ji/hu via LLM or rule-based
    almanac_data = await _generate_almanac(
        state=state,
        today=today,
        transit_bazi=today_bazi,
        transit_astro=transit,
        energy_score=energy_score,
        lang=lang,
    )

    # 6. Match products for 'hu' (护) — use template explanations (fast, no LLM)
    from services.product_matcher import ProductMatcher
    matcher = ProductMatcher()
    all_weakness = list(state.computed_tags or [])
    matched = matcher.match_with_reasons(
        weakness_tags=all_weakness,
        boost_elements=almanac_data.get("boost_elements", []),
        top_k=3,
    )
    for p in matched:
        p["recommendation_text"] = matcher.explain_why_template(
            product=p,
            weakness_tags=all_weakness,
            boost_elements=almanac_data.get("boost_elements", []),
        )

    hu_items = [
        {
            "product": p,
            "reason": p.get("match_reasons", [""])[0] if p.get("match_reasons") else "今日能量匹配",
        }
        for p in matched
    ]

    result = DailyAlmanacResponse(
        date=today.isoformat(),
        lunar_date=lunar_date_str,
        bazi_day_pillar=bazi_day_pillar_str,
        energy_score=energy_score,
        yi=almanac_data.get("yi", []),
        ji=almanac_data.get("ji", []),
        hu=hu_items,
        daily_quote=almanac_data.get("daily_quote", "顺势而为，方得始终。"),
        wuxing_analysis=almanac_data.get("wuxing_analysis", ""),
    )

    # Cache the result for 12 hours
    _almanac_cache[cache_key] = {**result.model_dump(), "_ts": _time.time()}
    # Evict old entries
    if len(_almanac_cache) > 500:
        oldest_keys = sorted(_almanac_cache, key=lambda k: _almanac_cache[k].get("_ts", 0))[:200]
        for k in oldest_keys:
            _almanac_cache.pop(k, None)

    return result


async def _generate_almanac(
    state: SystemState,
    today: date,
    transit_bazi: dict | None,
    transit_astro: dict | None,
    energy_score: int,
    lang: str = "zh",
) -> dict:
    """
    Generate yi/ji/hu recommendations using LLM when available, fallback to rule-based.
    lang: "zh" or "en" — controls output language.
    """
    from agents.master import _llm, _use_mock
    if _use_mock():
        data = _rule_based_almanac(state, today, transit_bazi, transit_astro, energy_score)
        if lang == "en":
            data = _translate_almanac_to_en(data)
        return data

    # Build a concise prompt for the LLM
    master_excerpt = state.master_summary[:300] if state.master_summary else ""
    tags_str = "、".join(state.computed_tags) if state.computed_tags else "无"

    bazi_str = ""
    if transit_bazi:
        bazi_str = (
            f"今日流日柱: {transit_bazi.get('day_pillar', {}).get('ganzhi', '')} "
            f"(年: {transit_bazi.get('year_pillar', {}).get('ganzhi', '')}, "
            f"月: {transit_bazi.get('month_pillar', {}).get('ganzhi', '')})"
        )

    astro_str = ""
    if transit_astro:
        tp = transit_astro.get("transit_planets", {})
        parts = []
        for pname in ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]:
            if pname in tp:
                parts.append(f"{pname} in {tp[pname].get('sign', '?')}")
        if parts:
            astro_str = "今日天象: " + ", ".join(parts)

    system = (
        "你是一位精通八字和占星的命理顾问，每天为用户生成个性化的黄历指南。\n"
        "你的输出必须严格遵循JSON格式，不要包含其他文字。\n\n"
        f"用户命盘摘要: {master_excerpt}\n"
        f"命盘标签: {tags_str}\n"
        f"能量评分: {energy_score}/100\n"
        f"{bazi_str}\n"
        f"{astro_str}\n\n"
        "请根据用户命盘与今日天象的互动，生成以下JSON：\n"
        "```json\n"
        "{\n"
        '  "yi": ["宜沟通", "宜签约", ...],\n'
        '  "ji": ["忌争执", "忌投资", ...],\n'
        '  "boost_elements": ["fire", "water"],\n'
        '  "wuxing_analysis": "今日金气过旺...",\n'
        '  "daily_quote": "一句简短的古风每日寄语"\n'
        "}\n"
        "```\n"
        "规则:\n"
        "- yi: 2-4条建议，根据今日对用户最有利的能量方向\n"
        "- ji: 1-3条建议，根据今日能量冲突的领域\n"
        "- boost_elements: 需要补充的五行元素（英文）\n"
        "- wuxing_analysis: 一句话五行分析（30-60字）\n"
        "- daily_quote: 一句古典风格每日寄语（10-30字），引用古诗或哲言\n\n"
        + (
            "IMPORTANT: Output yi/ji items in ENGLISH. Use modern financial/behavioral language.\n"
            "Example yi: 'Good for signing contracts', 'Ideal for networking'\n"
            "Example ji: 'Avoid impulsive investments', 'Refrain from major commitments'\n"
            "daily_quote: a short philosophical quote in English.\n"
            if lang == "en" else
            "重要：yi 和 ji 的内容必须全部使用中文！例如：宜沟通、宜签约、忌争执、忌投资。\n"
            "daily_quote: 必须使用中文古风寄语。\n"
        )
    )

    from langchain_core.messages import SystemMessage, HumanMessage
    # Use fast model with low max_tokens for speed
    from langchain_openai import ChatOpenAI
    _fast_llm = ChatOpenAI(
        model=settings.MASTER_FAST_MODEL,
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL or None,
        temperature=0.7,
        max_tokens=256,
    )
    try:
        resp = await _fast_llm.ainvoke([
            SystemMessage(content=system),
            HumanMessage(content="请根据以上信息生成今日黄历JSON。"),
        ])
        text = resp.content.strip()
        import re
        json_match = re.search(r"\{.*?\}", text, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            result = {
                "yi": data.get("yi", ["宜静心"]),
                "ji": data.get("ji", ["忌冲动"]),
                "boost_elements": data.get("boost_elements", []),
                "wuxing_analysis": data.get("wuxing_analysis", ""),
                "daily_quote": data.get("daily_quote", "顺天应时，修身养性。"),
            }
            if lang == "en":
                result = _translate_almanac_to_en(result)
            elif lang == "zh":
                # Safety: if LLM returned English items when Chinese was requested, use rule-based fallback
                _has_english = any(
                    any(c.isascii() and c.isalpha() for c in item)
                    for item in result.get("yi", []) + result.get("ji", [])
                )
                if _has_english:
                    result = _rule_based_almanac(state, today, transit_bazi, transit_astro, energy_score)
            return result
    except Exception:
        pass

    data = _rule_based_almanac(state, today, transit_bazi, transit_astro, energy_score)
    if lang == "en":
        data = _translate_almanac_to_en(data)
    return data


# ─── Yi/Ji Translation Maps (for backend lang=en) ───────────────────────────

_YI_EN: dict[str, str] = {
    "宜沟通": "Good for communication",
    "宜签约": "Good for signing contracts",
    "宜合作": "Good for collaboration",
    "宜行动": "Good for taking action",
    "宜决策": "Good for making decisions",
    "宜复盘": "Good for reviewing and reflecting",
    "宜整理": "Good for organizing and tidying",
    "宜社交": "Good for socializing",
    "宜外出": "Good for going out",
    "宜休息": "Good for resting",
    "宜冥想": "Good for meditation",
    "宜静心": "Good for calming the mind",
    "宜规划": "Good for planning",
    "宜学习": "Good for studying",
    "宜投资": "Good for investing",
    "宜守成": "Good for maintaining stability",
    "宜静养": "Good for quiet recuperation",
    "宜反思": "Good for introspection",
    "宜热情行动": "Good for enthusiastic action",
    "宜冷静思考": "Good for calm reflection",
    "宜决断": "Good for decisive action",
    "宜稳健积累": "Good for steady accumulation",
    "诸事皆宜": "All actions auspicious",
    "安床": "Settling & grounding",
    "祈福": "Energy realignment",
    "嫁娶": "Union & celebration",
    "开市": "Business launch",
    "交易": "Trading & transactions",
    "搬迁": "Relocation",
    "修造": "Renovation & building",
    "动土": "Initiating new projects",
    "栽种": "Planting & cultivation",
    "出行": "Travel & departure",
    "会友": "Networking & socializing",
    "求医": "Health & healing",
    "开工": "Starting work",
    "纳财": "Wealth collection",
}

_JI_EN: dict[str, str] = {
    "忌争执": "Avoid arguments",
    "忌投资": "Avoid investing",
    "忌冲动": "Avoid impulsiveness",
    "忌冒进": "Avoid being reckless",
    "忌重大决定": "Avoid major decisions",
    "忌急躁": "Avoid impatience",
    "忌犹豫": "Avoid indecisiveness",
    "忌固执": "Avoid stubbornness",
    "忌过度扩张": "Avoid overexpansion",
    "忌僵化": "Avoid rigidity",
    "诸事不宜": "Caution: avoid major actions",
    "动土": "Avoid disrupting established plans",
    "开仓": "Avoid aggressive trading",
    "诉讼": "Avoid legal disputes",
    "远行": "Avoid long journeys",
    "搬迁": "Avoid relocation",
    "嫁娶": "Avoid major unions",
    "开市": "Avoid new business launches",
    "交易": "Avoid large transactions",
    "签约": "Avoid signing contracts",
    "修造": "Avoid construction",
    "栽种": "Avoid planting",
    "出行": "Avoid travel",
    "祈福": "Avoid spiritual rituals",
}

_DAILY_QUOTES_EN = [
    "Flow with the current, not against it.",
    "Stillness reveals what motion conceals.",
    "The wise adapt; the foolish resist.",
    "What you seek is seeking you.",
    "Patience is the companion of wisdom.",
    "In stillness, clarity emerges.",
    "Every ending is a new beginning in disguise.",
    "The universe conspires in favor of the bold.",
    "Today's effort is tomorrow's harvest.",
    "Listen to the silence between the words.",
]


def _translate_almanac_to_en(data: dict) -> dict:
    """Translate yi/ji items and quote from Chinese to English."""
    import random
    yi_items = []
    for item in data.get("yi", []):
        yi_items.append(_YI_EN.get(item, item))
    ji_items = []
    for item in data.get("ji", []):
        ji_items.append(_JI_EN.get(item, item))

    quote = data.get("daily_quote", "")
    # If the quote is still Chinese, replace with an English one
    if any(ord(c) > 0x4E00 for c in quote):
        quote = random.choice(_DAILY_QUOTES_EN)

    # Translate wuxing_analysis if still Chinese
    wx = data.get("wuxing_analysis", "")
    if any(ord(c) > 0x4E00 for c in wx):
        # Simple pattern replacement for common wuxing analysis
        wx_en_map = {
            "金": "Metal", "木": "Wood", "水": "Water", "火": "Fire", "土": "Earth",
            "过旺": "is dominant today", "不足": "is weak today",
            "今日": "Today", "日支": "day branch",
        }
        for zh, en in wx_en_map.items():
            wx = wx.replace(zh, en)
        # If still mostly Chinese after simple replacements, provide a generic English version
        if sum(1 for c in wx if ord(c) > 0x4E00) > len(wx) * 0.3:
            wx = "Today's elemental balance influences your energy flow."

    return {
        "yi": yi_items,
        "ji": ji_items,
        "boost_elements": data.get("boost_elements", []),
        "wuxing_analysis": wx,
        "daily_quote": quote,
    }


def _rule_based_almanac(
    state: SystemState,
    today: date,
    transit_bazi: dict | None,
    transit_astro: dict | None,
    energy_score: int,
) -> dict:
    """Rule-based fallback for daily almanac when LLM is unavailable."""
    # Determine day of week for basic guidance
    weekday = today.weekday()  # 0=Monday
    base_yi = ["宜静心", "宜规划", "宜学习"]
    base_ji = ["忌冲动"]

    if weekday < 2:
        base_yi = ["宜行动", "宜决策"]
    elif weekday < 4:
        base_yi = ["宜沟通", "宜合作"]
    elif weekday == 4:
        base_yi = ["宜复盘", "宜整理"]
    elif weekday == 5:
        base_yi = ["宜社交", "宜外出"]
    else:
        base_yi = ["宜休息", "宜冥想"]

    # Adjust by energy score
    if energy_score >= 70:
        yi = base_yi + ["宜签约", "宜投资"]
        ji = base_ji
    elif energy_score >= 40:
        yi = base_yi
        ji = base_ji + ["忌冒进"]
    else:
        yi = ["宜守成", "宜静养", "宜反思"]
        ji = ["忌重大决定", "忌投资", "忌争执"]

    # Add bazi-based adjustments
    wuxing_analysis = ""
    if transit_bazi:
        dp = transit_bazi.get("day_pillar", {})
        dz_wx = dp.get("dizhi_wuxing", "")
        if dz_wx:
            wuxing_analysis = f"今日日支五行属{dz_wx}"
            if dz_wx == "火":
                yi.append("宜热情行动")
                ji.append("忌急躁")
            elif dz_wx == "水":
                yi.append("宜冷静思考")
                ji.append("忌犹豫")
            elif dz_wx == "金":
                yi.append("宜决断")
                ji.append("忌固执")
            elif dz_wx == "木":
                yi.append("宜学习成长")
                ji.append("忌过度扩张")
            elif dz_wx == "土":
                yi.append("宜稳健积累")
                ji.append("忌僵化")

    return {
        "yi": yi[:5],
        "ji": ji[:4],
        "boost_elements": ["fire"] if energy_score < 40 else [],
        "wuxing_analysis": wuxing_analysis,
        "daily_quote": "天行健，君子以自强不息。",
    }