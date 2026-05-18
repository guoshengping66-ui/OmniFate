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
from lunar_python import Solar
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
            _persist_session(state.session_id, user_id),
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


async def _persist_session(session_id: str, user_id: Optional[str] = None):
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
):
    """
    Retrieve session by ID. Checks in-memory first, then DATABASE.
    Auth required — users can only access their own sessions.
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
                    # Only return master_detail to users who have unlocked
                    if reading.is_detail_unlocked and reading.master_detail:
                        resp.master_detail = reading.master_detail
        except Exception:
            pass
        return resp

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
            # Gate master_detail: only return to users who have unlocked
            detail_text = reading.master_detail or "" if reading.is_detail_unlocked else ""
            return AnalysisResponse(
                session_id=session_id,
                status=reading.status.value,
                master_summary=reading.master_summary or "",
                master_detail=detail_text,
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

        # Final complete event
        yield f"data: {json.dumps({'type': 'progress', 'pct': 100, 'message': '分析完成'})}\n\n"
        # Gate master_detail: only send to users who have unlocked
        detail_for_sse = ""
        try:
            async with AsyncSessionLocal() as _db:
                _r = await _db.execute(select(Reading).where(Reading.id == session_id))
                _reading = _r.scalar_one_or_none()
                if _reading and _reading.is_detail_unlocked:
                    detail_for_sse = state.master_detail
        except Exception:
            pass
        yield f"data: {json.dumps({'type': 'complete', 'master_summary': state.master_summary[:500], 'master_detail': detail_for_sse})}\n\n"

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
                # Try to load computed_tags from session cache
                computed_tags = []
                dimension_scores = {}
                state = _sessions.get(str(r.id))
                if state:
                    computed_tags = list(state.computed_tags or [])
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
    hourly_energy: list = []    # 12时辰能量 [{hour: "子时", score: 8}, ...]
    wuxing_today: dict = {}     # 今日五行 {element: "火", emoji: "🔥", interaction: "比肩助力"}
    daily_summary: str = ""     # 一句话今日总结


@router.get("/daily-fortune")
async def get_daily_fortune(
    birth_year: Optional[int] = Query(None, ge=1920, le=2026),
    birth_month: Optional[int] = Query(None, ge=1, le=12),
    birth_day: Optional[int] = Query(None, ge=1, le=31),
    birth_hour: Optional[int] = Query(None, ge=0, le=23),
):
    """
    今日运势 — 基于用户出生信息个性化。
    无出生信息时返回基于日期的通用运势。
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

    # 运势建议
    ADVICES = [
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
    WARNINGS = [
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

    advice = ADVICES[int(_hash(300) * len(ADVICES))]
    warning = WARNINGS[int(_hash(400) * len(WARNINGS))]

    weekdays = ["一", "二", "三", "四", "五", "六", "日"]
    weekday = weekdays[today.weekday()]

    # ── 12时辰能量计算（纯算法，无 LLM）──────────────────────────────
    SHICHEN = [
        ("子时", 23, 1), ("丑时", 1, 3), ("寅时", 3, 5), ("卯时", 5, 7),
        ("辰时", 7, 9), ("巳时", 9, 11), ("午时", 11, 13), ("未时", 13, 15),
        ("申时", 15, 17), ("酉时", 17, 19), ("戌时", 19, 21), ("亥时", 21, 23),
    ]
    SHICHEN_WUXING = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"]
    hourly_energy = []
    try:
        today_lunar_calc = Solar.fromYmd(today.year, today.month, today.day).getLunar()
        today_dz_str = today_lunar_calc.getDayZhi()
        today_dz_element = DIZHI_WUXING.get(today_dz_str, "土")
        for idx, (name, h_start, h_end) in enumerate(SHICHEN):
            sc_element = SHICHEN_WUXING[idx]
            # 基础能量：生我+2，同我+1，我生-1，我克+1，克我-1
            base = 6
            if sc_element == today_dz_element:
                base = 7  # 比肩
            elif SHENG.get(today_dz_element) == sc_element:
                base = 5  # 我生（泄气）
            elif KE.get(today_dz_element) == sc_element:
                base = 8  # 我克（得财）
            elif SHENG_ME.get(today_dz_element) == sc_element:
                base = 8  # 生我（助力）
            elif KE_ME.get(today_dz_element) == sc_element:
                base = 4  # 克我（压力）
            # 加入时辰本身的阴阳能量波动
            hour_mod = [0, -1, 1, 2, 2, 1, 0, -1, -1, 0, 1, 0][idx]
            score = max(1, min(10, base + hour_mod))
            hourly_energy.append({"hour": name, "score": score})
    except Exception:
        pass

    # ── 今日五行卡片 ──────────────────────────────────────────────────
    WUXING_EMOJI = {"木": "🌳", "火": "🔥", "土": "⛰️", "金": "⚙️", "水": "💧"}
    wuxing_today_data = {}
    try:
        today_lunar_wx = Solar.fromYmd(today.year, today.month, today.day).getLunar()
        wx_element = DIZHI_WUXING.get(today_lunar_wx.getDayZhi(), "土")
        interaction = "平稳"
        if personalized and dm_element:
            if wx_element == dm_element:
                interaction = "比肩助力，精力充沛"
            elif SHENG.get(dm_element) == wx_element:
                interaction = "泄气之象，宜收敛专注"
            elif KE.get(dm_element) == wx_element:
                interaction = "我克为财，利于进账"
            elif SHENG_ME.get(dm_element) == wx_element:
                interaction = "有贵人相助，顺势而为"
            elif KE_ME.get(dm_element) == wx_element:
                interaction = "压力偏大，宜低调行事"
        wuxing_today_data = {
            "element": wx_element,
            "emoji": WUXING_EMOJI.get(wx_element, "✨"),
            "interaction": interaction,
        }
    except Exception:
        pass

    # ── 一句话今日总结 ────────────────────────────────────────────────
    daily_summary = ""
    if personalized:
        if overall >= 8:
            daily_summary = f"今日{wuxing_today_data.get('element', '')}气当旺，整体运势很棒，适合主动出击。"
        elif overall >= 6:
            daily_summary = f"今日运势平稳，{wuxing_today_data.get('interaction', '宜稳中求进')}。"
        else:
            daily_summary = f"今日{wuxing_today_data.get('interaction', '运势偏低')}，建议保守行事。"
    else:
        daily_summary = advice

    return DailyFortuneResponse(
        date=f"{today.month}月{today.day}日 星期{weekday}",
        greeting=f"{today.month}月{today.day}日运势",
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
        hourly_energy=hourly_energy,
        wuxing_today=wuxing_today_data,
        daily_summary=daily_summary,
    )


# ─── Daily Almanac Cache ─────────────────────────────────────────────────────
_almanac_cache: dict[str, dict] = {}  # key = f"{session_id}:{date}" -> cached response dict
_ALMANAC_CACHE_TTL = 3600 * 12  # 12 hours


# ─── Daily Almanac Endpoint ────────────────────────────────────────────────────


@router.get("/daily-almanac", response_model=DailyAlmanacResponse)
async def get_daily_almanac(session_id: str = Query(...)):
    """
    Get personalized daily almanac (yi/ji/hu) based on user's birth chart vs today's transits.

    Real-time computation, no storage.
    Supports two modes:
    1. With birth info: personalized almanac based on natal chart + transits
    2. Without birth info: generic almanac based on today's date only
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
    cache_key = f"{session_id}:{date.today()}"
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
            bazi_day_pillar_str = dp.get("ganzhi", "")
    except Exception:
        pass
    try:
        today_lunar = Solar.fromYmd(today.year, today.month, today.day).getLunar()
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
) -> dict:
    """
    Generate yi/ji/hu — 规则优先（毫秒级），LLM 仅作为可选增强。
    """
    # 1. 立即返回规则版（快）
    rule_result = _rule_based_almanac(state, today, transit_bazi, transit_astro, energy_score)

    # 2. 如果有 LLM，尝试异步增强（可选，不影响响应速度）
    from agents.master import _use_mock
    if _use_mock():
        return rule_result

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
        "你是一位亲切的命理顾问，用大白话给用户写每日黄历。\n"
        "输出必须严格JSON格式，不要包含其他文字。\n\n"
        f"用户命盘摘要: {master_excerpt}\n"
        f"命盘标签: {tags_str}\n"
        f"能量评分: {energy_score}/100\n"
        f"{bazi_str}\n"
        f"{astro_str}\n\n"
        "生成以下JSON：\n"
        "```json\n"
        "{\n"
        '  "yi": ["适合跟朋友聊天谈心", "可以学习新技能"],\n'
        '  "ji": ["不要冲动花钱", "避免跟人争论"],\n'
        '  "boost_elements": ["fire", "water"],\n'
        '  "wuxing_analysis": "今日五行属火，适合积极行动",\n'
        '  "daily_quote": "一句简单温暖的每日寄语"\n'
        "}\n"
        "```\n"
        "规则:\n"
        "- yi: 2-4条，每条8-15字，口语化表达，避免生僻术语\n"
        "- ji: 1-3条，每条6-12字，口语化表达\n"
        "- boost_elements: 需要补充的五行元素（英文）\n"
        "- wuxing_analysis: 一句话五行分析（20-40字），通俗易懂\n"
        "- daily_quote: 一句温暖的每日寄语（10-20字）"
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
            return {
                "yi": data.get("yi", ["宜静心"]),
                "ji": data.get("ji", ["忌冲动"]),
                "boost_elements": data.get("boost_elements", []),
                "wuxing_analysis": data.get("wuxing_analysis", ""),
                "daily_quote": data.get("daily_quote", "顺天应时，修身养性。"),
            }
    except Exception:
        pass

    return _rule_based_almanac(state, today, transit_bazi, transit_astro, energy_score)


def _rule_based_almanac(
    state: SystemState,
    today: date,
    transit_bazi: dict | None,
    transit_astro: dict | None,
    energy_score: int,
) -> dict:
    """Rule-based fallback for daily almanac — 通俗易懂版本"""
    weekday = today.weekday()  # 0=Monday

    # 基于星期的通俗宜忌
    weekday_yi = [
        ["适合制定计划、开始新项目", "主动出击效率高"],
        ["适合谈判、签合同", "有贵人运，多社交"],
        ["适合团队合作、开会讨论", "跟同事朋友多互动"],
        ["适合复盘总结、整理思路", "把没做完的事收尾"],
        ["适合放松娱乐、外出走走", "周末前给自己充充电"],
        ["适合社交聚会、逛街购物", "享受生活的好日子"],
        ["适合休息充电、陪伴家人", "给自己放个假"],
    ]
    weekday_ji = [
        ["别把计划拖太久", "少刷手机多行动"],
        ["别冲动做决定", "说话前多想想"],
        ["别单打独斗", "遇事多商量"],
        ["别钻牛角尖", "换个角度想问题"],
        ["别熬夜太晚", "明天还要早起"],
        ["别乱花钱", "想买的东西明天再决定"],
        ["别安排太多事", "留点时间给自己"],
    ]
    yi = list(weekday_yi[weekday])
    ji = list(weekday_ji[weekday])

    # 根据能量分数微调
    if energy_score >= 70:
        yi.append("今天状态很好，可以挑战高难度任务")
    elif energy_score >= 40:
        yi.append("保持正常节奏就好")
    else:
        yi = ["今天适合安静独处", "做些轻松的事放松一下", "早点休息养精蓄锐"]
        ji = ["别给自己太大压力", "避免跟人起冲突", "重要的事改天再说"]

    # 五行相关的通俗建议
    wuxing_analysis = ""
    if transit_bazi:
        dp = transit_bazi.get("day_pillar", {})
        dz_wx = dp.get("dizhi_wuxing", "")
        if dz_wx:
            wuxing_analysis = f"今日五行属{dz_wx}"
            WUXING_ADVICE = {
                "火": ("今天精力旺盛，适合积极行动", "别太急躁，深呼吸冷静一下"),
                "水": ("头脑清醒，适合思考和学习", "别犹豫不决，该做就做"),
                "金": ("做事果断有魄力，适合做决定", "别太固执，听听别人意见"),
                "木": ("适合学习成长、尝试新事物", "别贪多嚼不烂，专注一件事"),
                "土": ("脚踏实地，适合处理日常事务", "别太死板，偶尔灵活变通"),
            }
            if dz_wx in WUXING_ADVICE:
                yi.append(WUXING_ADVICE[dz_wx][0])
                ji.append(WUXING_ADVICE[dz_wx][1])

    return {
        "yi": yi[:5],
        "ji": ji[:4],
        "boost_elements": ["fire"] if energy_score < 40 else [],
        "wuxing_analysis": wuxing_analysis,
        "daily_quote": "天行健，君子以自强不息。",
    }