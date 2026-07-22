"""
api/routers/readings.py
HTTP endpoints for analysis pipeline, chat loop, event replay, and daily almanac.
"""
from __future__ import annotations
import uuid
import asyncio
import time
import re
from collections import OrderedDict
from datetime import datetime, date, timezone
from typing import Optional
import json
import logging
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, BackgroundTasks, Query, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select, delete, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from agents.state import (
    SystemState, BirthInfo, FaceFeatures, PalmFeatures, ChatMessage,
)
from agents.graph import run_full_analysis, run_chat
from agents.replay_prompt import replay_agent_prompt
from agents.master import _llm, _use_mock, build_generated_quick_insights, build_recoverable_paid_detail
from agents.workers import _localized_worker_repair, is_report_language_consistent
from services.vision.face_v2t import FaceV2T
from services.vision.palm_v2t import PalmV2T
from services.product_matcher import ProductMatcher
from database.session import AsyncSessionLocal, engine, get_db
from database.models import Reading, ReadingStatus, PaymentStatus, EventLog, User, CreditTransaction
from auth.dependencies import get_current_user, require_user
from calculators.astrology_calculator import AstrologyCalculator
from calculators.bazi_calculator import BaziCalculator
from config import get_settings
from services.rate_limiter import check_rate_limit

settings = get_settings()
logger = logging.getLogger(__name__)

# ── Stardust costs ────────────────────────────────────────────────────────
STARDUST_COST_FOLLOW_UP = 10  # AI 追问每次消耗

router = APIRouter()

# ── Session store: Redis-backed with in-memory fallback ───────────────────────
from services.session_store import get_session as _store_get_session, set_session as _store_set_session, delete_session as _store_delete_session, get_sessions_batch as _store_get_sessions_batch


async def _get_session(session_id: str) -> Optional[SystemState]:
    """Get an analysis session from Redis (or in-memory fallback)."""
    return await _store_get_session(session_id)


async def _set_session(session_id: str, state: SystemState) -> None:
    """Store an analysis session in Redis (or in-memory fallback)."""
    await _store_set_session(session_id, state)


async def _delete_session(session_id: str) -> None:
    """Delete an analysis session."""
    await _store_delete_session(session_id)


@router.get("/ping")
async def readings_ping():
    """Quick health check — confirms readings router is loaded."""
    return {"status": "ok", "router": "readings"}

# ── LRU cache for completed readings (avoids repeated DB queries) ──────────
_reading_cache: OrderedDict[str, tuple[float, AnalysisResponse, int]] = OrderedDict()  # (time, response, size_bytes)
_READING_CACHE_TTL = 600  # 10 minutes
_READING_CACHE_MAX = 200  # max cached readings
_READING_CACHE_MAX_BYTES = 50 * 1024 * 1024  # 50MB total cache limit

# Prevent background tasks from being garbage-collected
_bg_tasks: set = set()


def _invalidate_reading_cache(session_id: str) -> None:
    """Remove a cached reading response (called on unlock so next GET re-fetches)."""
    _reading_cache.pop(session_id, None)


def _get_reading_cache(session_id: str) -> Optional[AnalysisResponse]:
    """Return cached AnalysisResponse if fresh, else None.
    Moves hit to end (most-recently-used) for LRU eviction."""
    now = time.time()
    entry = _reading_cache.get(session_id)
    if entry and (now - entry[0]) < _READING_CACHE_TTL:
        # Move to end (MRU position) for LRU
        _reading_cache.move_to_end(session_id)
        return entry[1]
    # Lazy eviction: remove expired entries (skip if cache is small)
    if len(_reading_cache) > 20:
        expired = [k for k, v in _reading_cache.items() if (now - v[0]) >= _READING_CACHE_TTL]
        for k in expired:
            del _reading_cache[k]
    return None


def _estimate_cache_size(resp: AnalysisResponse) -> int:
    """Estimate memory size of a cached response in bytes (UTF-8 encoded).
    Includes ALL text fields: master summary/detail + all worker reports."""
    size = 0
    # Master fields
    for s in (resp.master_summary or "", resp.master_detail or ""):
        size += len(s.encode("utf-8"))
    # Worker report fields (bazi, astrology, tarot, qimen, ziwei, palm, etc.)
    for key in _WORKER_REPORT_KEYS:
        wo = getattr(resp, key, None)
        if wo and wo.report:
            size += len(wo.report.encode("utf-8"))
    # Dimension scores and tags (small but count them)
    if resp.dimension_scores:
        size += len(str(resp.dimension_scores).encode("utf-8"))
    if resp.computed_tags:
        size += len(str(resp.computed_tags).encode("utf-8"))
    return size


def _set_reading_cache(session_id: str, resp: AnalysisResponse):
    """Cache an AnalysisResponse with LRU eviction and size limits."""
    import time
    resp_size = _estimate_cache_size(resp)

    # Skip caching oversized responses (>200KB per entry)
    if resp_size > 200 * 1024:
        return

    # Aggressively prune expired entries on every write (prevents memory leak
    # when traffic is low and lazy eviction on reads doesn't trigger)
    now = time.time()
    expired = [k for k, v in _reading_cache.items() if (now - v[0]) >= _READING_CACHE_TTL]
    for k in expired:
        del _reading_cache[k]

    # LRU eviction: pop oldest (first) items until under limits
    total_size = sum(entry[2] for entry in _reading_cache.values())
    while total_size > _READING_CACHE_MAX_BYTES or len(_reading_cache) >= _READING_CACHE_MAX:
        if not _reading_cache:
            break
        _oldest_key, (_ts, _resp, _size) = _reading_cache.popitem(last=False)
        total_size -= _size

    _reading_cache[session_id] = (time.time(), resp, resp_size)


# ─── Request / Response Schemas ───────────────────────────────────────────

class AnalysisRequest(BaseModel):
    gender: str = Field("female", pattern="^(male|female|other)$")
    birth_year: int = Field(..., ge=1920, le=datetime.now().year)
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
    intent: Optional[str] = None  # GENERAL_DAILY | FULL_MULTIMODAL | RELATIONSHIP
    # Relationship analysis fields
    partner_name: str = ""
    partner_gender: str = Field("female", pattern="^(male|female|other)$")
    partner_birth_year: Optional[int] = Field(None, ge=1920, le=datetime.now().year)
    partner_birth_month: Optional[int] = Field(None, ge=1, le=12)
    partner_birth_day: Optional[int] = Field(None, ge=1, le=31)
    partner_birth_hour: Optional[int] = Field(None, ge=0, le=23)
    partner_birth_minute: int = 0
    partner_birth_city: str = ""
    partner_latitude: Optional[float] = None
    partner_longitude: Optional[float] = None
    relationship_type: str = ""  # lover/friend/colleague/family
    partner_face_raw_text: str = ""
    partner_palm_raw_text: str = ""


class ReadingListItem(BaseModel):
    id: str
    session_id: str = ""  # Alias for id — used by almanac and other consumers
    status: str
    master_summary: str = ""
    computed_tags: list[str] = Field(default_factory=list)
    dimension_scores: dict[str, float] = Field(default_factory=dict)
    is_detail_unlocked: bool = False
    is_detailed_unlocked: bool = False    # 精读解锁 (30星尘)
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
    progress_pct: float = 0              # 进度百分比（轮询也能获取）
    progress_message: str = ""           # 进度描述
    master_summary: str
    master_detail: str = ""               # 付费详细报告
    report_version: str = "legacy"
    report_recovery_status: str = "not_required"
    quick_insights: list[str] = Field(default_factory=list)
    is_detail_unlocked: bool = False      # 全维解锁 (100星尘)
    is_detailed_unlocked: bool = False    # 精读解锁 (30星尘)
    astrology: WorkerReportOut
    tarot: WorkerReportOut
    bazi: WorkerReportOut
    qimen: WorkerReportOut
    ziwei: WorkerReportOut
    face: WorkerReportOut
    palm: WorkerReportOut
    partner_face: Optional[WorkerReportOut] = None
    partner_palm: Optional[WorkerReportOut] = None
    recommended_product_ids: list[str]
    recommended_products: list[dict] = Field(default_factory=list)
    computed_tags: list[str]
    dimension_scores: dict[str, float]
    errors: list[str]
    intent: Optional[str] = None
    partner_name: Optional[str] = None
    relationship_type: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    routed_to: str
    session_id: str
    loop_count: int
    free_followup_used: bool = False   # 本次是否为首次免费追问
    has_used_free_followup: bool = False  # 是否曾经使用过免费追问


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
    detail = getattr(state, "master_detail", "") or ""
    version, recovery_status = _report_contract_meta(detail)
    return AnalysisResponse(
        session_id=state.session_id,
        status=state.phase,
        progress_pct=state.progress_pct,
        progress_message=state.progress_message,
        master_summary=state.master_summary,
        master_detail=detail,
        report_version=version,
        report_recovery_status=recovery_status,
        quick_insights=build_generated_quick_insights(state.dimension_scores, state.language or "zh"),
        is_detail_unlocked=getattr(state, "is_detail_unlocked", False),
        is_detailed_unlocked=getattr(state, "is_detailed_unlocked", False),
        astrology=out(state.astrology_output),
        tarot=out(state.tarot_output),
        bazi=out(state.bazi_output),
        qimen=out(state.qimen_output),
        ziwei=out(state.ziwei_output),
        face=out(state.face_output),
        palm=out(state.palm_output),
        partner_face=out(state.partner_face_output) if state.partner_face_output and state.partner_face_output.report else None,
        partner_palm=out(state.partner_palm_output) if state.partner_palm_output and state.partner_palm_output.report else None,
        recommended_product_ids=state.recommended_product_ids,
        recommended_products=state.recommended_products,
        computed_tags=state.computed_tags,
        dimension_scores=state.dimension_scores,
        errors=state.errors,
        intent=state.intent or None,
        partner_name=state.partner_name or None,
        relationship_type=state.relationship_type or None,
    )


# ─── Content Lock ─────────────────────────────────────────────────────────

_WORKER_REPORT_KEYS = ["astrology", "tarot", "bazi", "qimen", "ziwei", "face", "palm", "partner_face", "partner_palm"]


def _report_contract_meta(detail: str) -> tuple[str, str]:
    """Expose report state without leaking or parsing prose in the client."""
    match = re.search(r"```json\s*([\s\S]*?)```", detail or "")
    if not match:
        return "legacy", "not_required"
    try:
        payload = json.loads(match.group(1))
    except (TypeError, ValueError):
        return "legacy", "not_required"
    version = str(payload.get("report_type") or "legacy")
    return version, "recovering" if payload.get("status") == "recovering" else "ready"


def _persisted_expert_reports(reading: Reading) -> dict[str, str]:
    """Return persisted specialist findings for evidence-bound legacy recovery."""
    fields = {
        "astrology": "astrology_report", "tarot": "tarot_report", "bazi": "bazi_report",
        "qimen": "qimen_report", "ziwei": "ziwei_report", "face": "face_analysis_text", "palm": "palm_report",
        "partner_face": "partner_face_report", "partner_palm": "partner_palm_report",
    }
    return {key: str(getattr(reading, field, "") or "") for key, field in fields.items()}


def _apply_content_lock(resp: AnalysisResponse, current_user: Optional[User], reading: Optional[Reading] = None, lang: str = "zh") -> AnalysisResponse:
    """
    Strip paid content based on unlock tier:
    - Free: master_summary only (Sections A-E)
    - 精读 (30 stardust): master_summary + master_detail
    - 全维 (100 stardust): everything (master_detail + all worker reports)
    SECURITY: Anonymous reports show minimal data only.
    """
    # ── Determine unlock tier ──
    # "full" = everything, "detailed" = master_detail only, "free" = summary only
    tier = "free"

    if reading:
        # Anonymous report — strip paid content, keep summary as teaser
        if not reading.user_id:
            resp.master_detail = ""
            resp.is_detail_unlocked = False
            resp.is_detailed_unlocked = False
            for key in _WORKER_REPORT_KEYS:
                wo = getattr(resp, key, None)
                if wo:
                    wo.report = ""
            return resp
        # User owns this reading — check tier from DB flags
        if current_user and str(reading.user_id) == str(current_user.id):
            if reading.is_detail_unlocked:
                tier = "full"
            elif getattr(reading, "is_detailed_unlocked", False):
                tier = "detailed"
    else:
        # Redis / in-memory session — check resp flags
        if current_user and getattr(resp, "is_detail_unlocked", False):
            tier = "full"
        elif current_user and getattr(resp, "is_detailed_unlocked", False):
            tier = "detailed"

    # Active premium subscription overrides to full unlock
    # Ensure timezone-aware comparison (SQLite may store naive datetimes)
    _now_utc = datetime.now(timezone.utc)
    if current_user:
        _expires = current_user.premium_expires_at
        if _expires and _expires.tzinfo is None:
            _expires = _expires.replace(tzinfo=timezone.utc)
        if tier != "full" and current_user.is_premium and _expires and _expires > _now_utc:
            tier = "full"

    # ── Apply tier restrictions ──
    if tier == "full":
        pass  # 全维 — show everything
    elif tier == "detailed":
        resp.is_detail_unlocked = False
        resp.is_detailed_unlocked = True
        _hide_worker_reports(resp)
    else:
        resp.master_detail = ""
        resp.is_detail_unlocked = False
        resp.is_detailed_unlocked = False
        _hide_worker_reports(resp)

    resp.report_version, resp.report_recovery_status = _report_contract_meta(resp.master_detail)
    return resp


def _hydrate_unlocked_legacy_report(reading: Reading) -> bool:
    """Restore the paid payload for pre-contract reports on their next read."""
    has_paid_access = reading.is_detail_unlocked or getattr(reading, "is_detailed_unlocked", False)
    if not has_paid_access or (reading.master_detail or "").strip():
        return False

    reading.master_detail = build_recoverable_paid_detail(
        reading.master_summary or "",
        reading.dimension_scores or {},
        getattr(reading, "language", None) or "zh",
        expert_reports=_persisted_expert_reports(reading),
    )
    return True


async def _localize_response_content(resp: AnalysisResponse, language: str) -> AnalysisResponse:
    """Translate only fields that violate the requested locale, including old mixed reports."""
    if language not in {"zh", "en"}:
        return resp
    target = "Chinese" if language == "zh" else "English"
    if resp.master_summary and not is_report_language_consistent(resp.master_summary, language):
        translated_summary = await _translate_text(resp.master_summary, target)
        if is_report_language_consistent(translated_summary, language):
            resp.master_summary = translated_summary

        # If master_detail already embeds a decision_report_v3 JSON payload, the
    # language inconsistency comes from the JSON property keys like
    # "executive_summary" / "evidence_chain" — not from report content.
    # Keep the original payload to preserve the full premium analysis.
    if resp.master_detail and "decision_report_v3" not in resp.master_detail:
        if not is_report_language_consistent(resp.master_detail, language):
            resp.master_detail = build_recoverable_paid_detail(
                resp.master_summary,
                resp.dimension_scores,
                language,
            )

    names = list(_WORKER_REPORT_KEYS)
    values: list[str] = []
    invalid: list[str] = []
    for name in names:
        value = getattr(resp, name, "")
        text = value.report if isinstance(value, WorkerReportOut) else value
        if text and not is_report_language_consistent(text, language):
            invalid.append(name)
            values.append(text)
        else:
            values.append("")
    if not invalid:
        resp.quick_insights = build_generated_quick_insights(resp.dimension_scores, language)
        return resp

    translations = await asyncio.gather(*[_translate_text(value, target) if value else asyncio.sleep(0, result="") for value in values])
    for name, original, translated in zip(names, values, translations):
        if not original:
            continue
        repaired = translated if is_report_language_consistent(translated, language) else ""
        if name in _WORKER_REPORT_KEYS:
            worker = getattr(resp, name, None)
            if worker:
                worker.report = repaired or _build_worker_repair_text(name, language)
    resp.quick_insights = build_generated_quick_insights(resp.dimension_scores, language)
    return resp


def _build_worker_repair_text(agent_id: str, language: str) -> str:
    """Convert the validated worker fallback into the stored report's display format."""
    from agents.workers import _build_worker_display_report
    return _build_worker_display_report(_localized_worker_repair(agent_id, language), language=language)


def _hide_worker_reports(resp: AnalysisResponse) -> None:
    """Clear all worker report content (used by content lock)."""
    for key in _WORKER_REPORT_KEYS:
        wo = getattr(resp, key, None)
        if wo:
            wo.report = ""
            wo.tags = []
            wo.error = None


# ─── Endpoints ───────────────────────────────────────────────────────────

@router.post("", response_model=AnalysisResponse)
async def create_analysis(
    request: Request,
    payload: AnalysisRequest,
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    POST creates session and kicks off background analysis.
    Frontend polls GET /session/{id} until status == "done".
    """
    # Rate limit: N analyses/hour for logged-in users, M/hour for anonymous (by IP)
    from config import get_settings
    _settings = get_settings()
    _analysis_limit = getattr(_settings, 'ANALYSIS_RATE_LIMIT_PER_HOUR', 15)
    _analysis_anon_limit = getattr(_settings, 'ANALYSIS_ANON_RATE_LIMIT_PER_HOUR', 3)
    if current_user:
        if await check_rate_limit(f"analysis:{current_user.id}", limit=_analysis_limit, window=3600):
            raise HTTPException(status_code=429, detail="分析次数过于频繁，请稍后再试")
    else:
        client_ip = request.client.host if request.client else "unknown"
        if await check_rate_limit(f"analysis:anon:{client_ip}", limit=_analysis_anon_limit, window=3600):
            raise HTTPException(status_code=429, detail="匿名用户分析次数限制，请登录后使用")
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
        intent=payload.intent or "",
        partner_name=payload.partner_name,
        relationship_type=payload.relationship_type,
    )

    # Build partner BirthInfo if relationship analysis
    if payload.intent == "RELATIONSHIP" and payload.partner_birth_year:
        state.partner_birth_info = BirthInfo(
            year=payload.partner_birth_year,
            month=payload.partner_birth_month or 1,
            day=payload.partner_birth_day or 1,
            hour=payload.partner_birth_hour or 0,
            minute=payload.partner_birth_minute,
            city=payload.partner_birth_city,
            latitude=payload.partner_latitude,
            longitude=payload.partner_longitude,
            gender=payload.partner_gender,
        )
        # Partner face/palm features
        if payload.partner_face_raw_text:
            state.partner_face_features = FaceFeatures(raw_text=payload.partner_face_raw_text)
        if payload.partner_palm_raw_text:
            state.partner_palm_features = PalmFeatures(raw_text=payload.partner_palm_raw_text)

    # Persist session to DATABASE (with timeout to avoid blocking)
    try:
        await asyncio.wait_for(
            _persist_session(state.session_id, user_id, language=state.language),
            timeout=5,
        )
    except (asyncio.TimeoutError, Exception) as e:
        logger.warning("Failed to create reading in DB: %s", e)

    # Store in Redis (or in-memory fallback) for fast access
    await _set_session(state.session_id, state)

    # Start analysis in background (works on self-hosted server)
    # Keep strong reference to prevent GC before task completes
    task = asyncio.create_task(_run_analysis_bg(state, user_id))
    _bg_tasks.add(task)
    task.add_done_callback(_bg_tasks.discard)

    return _state_to_response(state)


async def _persist_session(session_id: str, user_id: Optional[str] = None, language: str = "zh"):
    """Persist a reading session to the database, auto-linking birth_profile_id.
    Includes retry logic for transient DB failures — if this fails, the analysis
    results will be lost because the background task can't find the reading in DB.
    """
    from database.session import _db_available
    from database.models import BirthProfile
    if _db_available is False:
        return

    for attempt in range(3):
        try:
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
                return  # Success
        except Exception as e:
            logger.warning("_persist_session attempt %d/3 failed: %s", attempt + 1, e)
            if attempt < 2:
                await asyncio.sleep(1)


async def _run_analysis_bg(state: SystemState, user_id: Optional[str] = None):
    """Background task: run the full pipeline then persist results to DB.
    SECURITY: Includes timeout protection to prevent infinite-running tasks.
    """
    ANALYSIS_TIMEOUT_SECONDS = 600  # 10 minutes max
    logger.info("Starting analysis for %s", state.session_id)
    # Update status to processing
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(Reading).where(Reading.id == state.session_id)
            result = await db.execute(stmt)
            reading = result.scalar_one_or_none()
            if reading:
                reading.status = ReadingStatus.processing
                await db.commit()
    except Exception as e:
        logger.debug("Failed to update reading status to processing: %s", e)

    # Periodically persist state to Redis so SSE stream can see live updates
    _persist_done = asyncio.Event()

    async def _periodic_persist():
        while not _persist_done.is_set():
            try:
                await _set_session(state.session_id, state)
            except Exception as e:
                logger.debug("Failed to persist session to Redis: %s", e)
            await asyncio.sleep(3)  # persist every 3 seconds

    persist_task = asyncio.create_task(_periodic_persist())

    try:
        # Lazy imports to avoid cold-start cost
        from agents.graph import run_full_analysis
        logger.info("Running full analysis pipeline for %s", state.session_id)
        state = await asyncio.wait_for(
            run_full_analysis(state),
            timeout=ANALYSIS_TIMEOUT_SECONDS,
        )
        logger.info("Analysis completed for %s, phase=%s", state.session_id, state.phase)
    except asyncio.TimeoutError:
        state.errors.append("分析超时，部分结果可能不完整")
        # Timeout with partial results → "done" (user may still see partial output)
        state.phase = "done" if (state.master_summary or state.master_detail) else "failed"
        logger.error("Analysis timed out for %s after %ds", state.session_id, ANALYSIS_TIMEOUT_SECONDS)
    except Exception as e:
        state.errors.append(str(e))
        # Complete failure → "failed" so UI shows error state instead of empty "completed"
        state.phase = "failed"
        logger.error("Analysis failed for %s: %s", state.session_id, e)
    finally:
        _persist_done.set()
        persist_task.cancel()
        try:
            await persist_task
        except asyncio.CancelledError:
            pass

    # Final persist to session store
    try:
        await _set_session(state.session_id, state)
    except Exception as e:
        logger.error("Failed to persist session to Redis: %s", e)

    # Safety net: recompute dimension_scores if still at defaults
    default_scores = {"wealth": 5.0, "relationship": 5.0, "career": 5.0, "health": 5.0, "spiritual": 5.0}
    if state.dimension_scores == default_scores:
        logger.warning("dimension_scores still at defaults, recomputing...")
        try:
            from agents.master import _compute_dimension_scores
            state.dimension_scores = _compute_dimension_scores(state)
            logger.info("Recomputed dimension_scores: %s", state.dimension_scores)
            await _set_session(state.session_id, state)
        except Exception as e:
            logger.error("Failed to recompute dimension_scores: %s", e)

    # Persist final results to database (with retry for transient failures)
    for _persist_attempt in range(3):
        try:
            async with AsyncSessionLocal() as db:
                stmt = select(Reading).where(Reading.id == state.session_id)
                result = await db.execute(stmt)
                reading = result.scalar_one_or_none()

                # Safety net: if reading doesn't exist (initial persist failed), create it
                if not reading:
                    logger.info("Reading %s not in DB — creating (safety net)", state.session_id)
                    reading = Reading(
                        id=state.session_id,
                        user_id=user_id,
                        status=ReadingStatus.pending,
                        master_summary="",
                        is_detail_unlocked=False,
                        language=state.language or "zh",
                    )
                    db.add(reading)
                    await db.flush()

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
                    reading.partner_face_report = state.partner_face_output.report if state.partner_face_output and state.partner_face_output.report else None
                    reading.partner_palm_report = state.partner_palm_output.report if state.partner_palm_output and state.partner_palm_output.report else None
                    reading.dimension_scores = dict(state.dimension_scores) if state.dimension_scores else None
                    logger.info("Persisting dimension_scores to DB: %s", state.dimension_scores)
                    reading.computed_tags = list(state.computed_tags) if state.computed_tags else None
                    reading.recommended_product_ids = list(state.recommended_product_ids) if state.recommended_product_ids else None
                    # Persist worker tags and errors so they survive Redis expiry
                    _wtags: dict[str, list[str]] = {}
                    _werrs: dict[str, str] = {}
                    for _attr in ("astrology_output", "tarot_output", "bazi_output",
                                  "qimen_output", "ziwei_output", "face_output", "palm_output",
                                  "partner_face_output", "partner_palm_output"):
                        _wo = getattr(state, _attr, None)
                        if _wo and _wo.agent_id:
                            if _wo.tags:
                                _wtags[_wo.agent_id] = _wo.tags
                            if _wo.error:
                                _werrs[_wo.agent_id] = _wo.error
                    reading.worker_tags = _wtags if _wtags else None
                    reading.worker_errors = _werrs if _werrs else None
                    reading.completed_at = datetime.now(timezone.utc)
                    await db.commit()
                    logger.info("Persisted reading %s to DB (attempt %d)", state.session_id, _persist_attempt + 1)

                # Send completion notification email
                try:
                    from utils.email import send_analysis_complete_email, is_smtp_configured
                    if is_smtp_configured() and reading.user_id:
                        user_stmt = select(User).where(User.id == reading.user_id)
                        user_result = await db.execute(user_stmt)
                        user = user_result.scalar_one_or_none()
                        if user and user.email:
                            reading_lang = reading.language or "zh"
                            send_analysis_complete_email(user.email, state.session_id, locale=reading_lang)
                            logger.info("Sent completion email to %s", user.email)
                except Exception as email_err:
                    logger.warning("Failed to send completion email: %s", email_err)
                break  # Success — exit retry loop
        except Exception as e:
            logger.warning("Failed to persist reading to DB (attempt %d/3): %s", _persist_attempt + 1, e)
            if _persist_attempt < 2:
                await asyncio.sleep(2)  # Wait before retry


@router.post("/chat", response_model=ChatResponse)
async def chat_followup(
    payload: ChatRequest,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Task C: Dynamic routing follow-up chat.
    Routes user question to the correct expert agent and returns a focused answer.
    需要登录，防止未授权消耗 API 额度
    非会员每次追问消耗 10 星尘，会员免费。
    """
    import re as _re
    from agents.graph import run_chat

    state = await _get_session(payload.session_id)

    # Redis session 过期时，从数据库 Reading 回退重建
    if not state:
        from database.models import BirthProfile
        reading_result = await db.execute(
            select(Reading)
            .where(
                Reading.id == payload.session_id,
                Reading.user_id == current_user.id,
                Reading.status == ReadingStatus.completed,
            )
            .limit(1)
        )
        reading = reading_result.scalar_one_or_none()
        if not reading:
            raise HTTPException(status_code=404, detail="Session not found. Run /readings/ first.")

        # 从 BirthProfile 重建 BirthInfo
        bi = None
        if reading.birth_profile_id:
            bp_result = await db.execute(
                select(BirthProfile).where(BirthProfile.id == reading.birth_profile_id)
            )
            bp = bp_result.scalar_one_or_none()
            if bp:
                bi = BirthInfo(
                    year=bp.birth_year, month=bp.birth_month, day=bp.birth_day,
                    hour=bp.birth_hour, minute=bp.birth_minute,
                    city=bp.birth_city or "",
                    latitude=bp.latitude, longitude=bp.longitude,
                )

        from agents.state import WorkerOutput
        state = SystemState(
            session_id=reading.id,
            user_id=current_user.id,
            birth_info=bi,
            master_summary=reading.master_summary or "",
            dimension_scores=reading.dimension_scores or {},
            computed_tags=reading.computed_tags or [],
            bazi_raw=reading.bazi_raw or {},
            astrology_raw=reading.astrology_raw or {},
        )
        state.bazi_output = WorkerOutput(agent_id="bazi", report=reading.bazi_report or "")
        state.astrology_output = WorkerOutput(agent_id="astrology", report=reading.astrology_report or "")
        # 重建后存回 Redis，后续追问不再需要查库
        await _set_session(payload.session_id, state)
        logger.info("Reconstructed session %s from DB for user %s", payload.session_id, current_user.id)

    # 验证 session 归属 (Redis path — DB path already filters by user_id)
    if state.user_id and str(state.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="无权访问此 session")
    if not state.user_id and current_user:
        # Anonymous session in Redis — don't let authenticated users hijack it
        raise HTTPException(status_code=403, detail="此 session 不属于当前用户")

    # ── SECURITY: Sanitize user input to prevent prompt injection ──
    question = payload.question[:2000] if payload.question else ""
    # Normalize Unicode: NFKC collapses Cyrillic/Latin homoglyphs
    # (e.g. Cyrillic "і" → Latin "i", fullwidth "Ａ" → "A")
    import unicodedata
    import base64 as _b64mod
    question = unicodedata.normalize("NFKC", question)

    # Strip zero-width characters (U+200B, U+200C, U+200D, U+FEFF, etc.)
    question = _re.sub(r'[​-‏ - ⁠-⁩﻿]', '', question)

    injection_patterns = [
        # Chinese
        r"忽略.*指令", r"忽略.*规则", r"无视.*规则", r"你是.*助手",
        r"系统提示", r"新的指令", r"忘记.*之前",
        # English — role override
        r"ignore.*instructions", r"ignore.*rules", r"disregard.*previous",
        r"disregard.*all", r"forget.*everything", r"forget.*previous",
        r"pretend.*you.*are", r"act\s+as\s+", r"roleplay\s+as",
        r"you\s+are\s+now", r"you\s+are\s+a", r"new\s+instructions",
        r"override.*instructions", r"system\s*prompt", r"system\s*message",
        r"developer\s*mode", r"bypass.*safety", r"jailbreak", r"DAN\s+mode",
        r"do\s+anything\s+now", r"ignore\s+safety", r"no\s+restrictions",
        r"unlock\s+all", r"reveal.*prompt", r"show.*system\s*prompt",
        r"what\s+is\s+your\s+system\s*prompt", r"repeat.*above",
        r"translate.*to.*chinese", r"decode.*base64", r"exec.*code",
        # English — data exfil / encoding tricks
        r"output.*your.*instructions", r"print.*your.*rules",
        r"respond\s+in\s+(spanish|japanese|korean|french|arabic)",
        r"from\s+now\s+on.*you\s+(will|must|should)",
        r"you\s+are\s+no\s+longer", r"enter\s+debug\s+mode",
        # Multi-language: universal injection patterns
        r"\{\{.*\}\}",             # Template injection {{system}}
        r"<\s*(system|assistant|user)\s*>",  # XML tag injection
        r"^\s*/\s*nofilter",       # /nofilter bypass
    ]

    def _is_injection(q: str) -> bool:
        """Check if question matches known injection patterns."""
        for pattern in injection_patterns:
            if _re.search(pattern, q, _re.IGNORECASE):
                return True
        # Base64-encoded injection detection (catch encoded payloads)
        # Look for base64 strings > 20 chars that decode to English injection phrases
        b64_matches = _re.findall(r'[A-Za-z0-9+/]{20,}={0,2}', q)
        for b64 in b64_matches:
            try:
                decoded = _b64mod.b64decode(b64).decode("utf-8", errors="ignore").lower()
                decoded = unicodedata.normalize("NFKC", decoded)
                if any(_re.search(p, decoded, _re.IGNORECASE) for p in injection_patterns):
                    return True
            except Exception:
                pass
        return False

    if _is_injection(question):
        lang = getattr(payload, 'lang', 'zh')
        question = "请围绕命理主题提问。" if lang != "en" else "Please ask questions related to destiny analysis."

    # ── 星尘扣费（会员免费 + 新用户首次免费） ──
    # Uses two-phase commit: balance is only deducted AFTER LLM succeeds.
    # A "pending" transaction is created first (balance untouched), then confirmed
    # or cancelled based on LLM outcome. This prevents double-spend races.
    deducted = False
    tx_id = None
    is_first_followup = False
    followup_count = 0
    if not current_user.is_premium:
        # 检查是否是首次追问（新用户免费 1 次）
        existing_followups = await db.execute(
            select(func.count(CreditTransaction.id)).where(
                and_(
                    CreditTransaction.user_id == current_user.id,
                    CreditTransaction.reason == "follow_up",
                )
            )
        )
        followup_count = existing_followups.scalar() or 0
        is_first_followup = followup_count == 0

        if not is_first_followup:
            user_result = await db.execute(
                select(User).where(User.id == current_user.id).with_for_update()
            )
            try:
                from sqlalchemy import text as _sa_text
                await db.execute(_sa_text("SET LOCAL lock_timeout = '30s'"))
            except Exception:
                pass
            user = user_result.scalar_one_or_none()
            if not user:
                raise HTTPException(status_code=403, detail="用户不存在或已被禁用")
            if user.stardust_balance < STARDUST_COST_FOLLOW_UP:
                raise HTTPException(
                    status_code=402,
                    detail=f"星尘不足: 需要 {STARDUST_COST_FOLLOW_UP}，当前 {user.stardust_balance}",
                )
            # Phase 1: create pending transaction WITHOUT deducting balance yet
            tx = CreditTransaction(
                user_id=user.id,
                amount=-STARDUST_COST_FOLLOW_UP,
                balance_after=user.stardust_balance,  # balance unchanged for now
                reason="follow_up",
                reference_id=payload.session_id,
                status="pending",
            )
            db.add(tx)
            await db.commit()
            deducted = True
            tx_id = tx.id

    # ── 执行 LLM 追问 ──
    try:
        answer, agent_id, updated_state = await run_chat(question, state)
        await _set_session(payload.session_id, updated_state)

        # Phase 2: LLM succeeded — deduct balance and confirm transaction atomically
        if deducted and tx_id:
            confirm_user_result = await db.execute(
                select(User).where(User.id == current_user.id).with_for_update()
            )
            confirm_user = confirm_user_result.scalar_one_or_none()
            if confirm_user and confirm_user.stardust_balance >= STARDUST_COST_FOLLOW_UP:
                confirm_user.stardust_balance -= STARDUST_COST_FOLLOW_UP
                confirm_result = await db.execute(
                    select(CreditTransaction).where(CreditTransaction.id == tx_id)
                )
                pending_tx = confirm_result.scalar_one_or_none()
                if pending_tx:
                    pending_tx.status = "confirmed"
                    pending_tx.balance_after = confirm_user.stardust_balance
                await db.commit()

        return ChatResponse(
            answer=answer,
            routed_to=agent_id,
            session_id=payload.session_id,
            loop_count=updated_state.loop_count,
            free_followup_used=is_first_followup,
            has_used_free_followup=followup_count > 0 if not current_user.is_premium else False,
        )
    except Exception:
        # LLM failed — cancel pending transaction, balance was never touched
        if deducted and tx_id:
            try:
                cancel_result = await db.execute(
                    select(CreditTransaction).where(CreditTransaction.id == tx_id)
                )
                orig_tx = cancel_result.scalar_one_or_none()
                if orig_tx:
                    orig_tx.status = "cancelled"
                    await db.commit()
            except Exception as e:
                logger.warning("Failed to cancel pending transaction: %s", e)
        raise


async def _run_analysis_inline(state: SystemState) -> SystemState:
    """Run the full analysis pipeline inline (called lazily on GET poll)."""
    try:
        from agents.graph import run_full_analysis
        state = await run_full_analysis(state)
    except Exception as e:
        state.errors.append(str(e))
        state.phase = "done"
        logger.error("Analysis failed for %s: %s", state.session_id, e)

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
                reading.partner_face_report = state.partner_face_output.report if state.partner_face_output and state.partner_face_output.report else None
                reading.partner_palm_report = state.partner_palm_output.report if state.partner_palm_output and state.partner_palm_output.report else None
                reading.dimension_scores = dict(state.dimension_scores) if state.dimension_scores else None
                reading.computed_tags = list(state.computed_tags) if state.computed_tags else None
                reading.recommended_product_ids = list(state.recommended_product_ids) if state.recommended_product_ids else None
                # Persist worker tags and errors so they survive Redis expiry
                _wtags2: dict[str, list[str]] = {}
                _werrs2: dict[str, str] = {}
                for _attr2 in ("astrology_output", "tarot_output", "bazi_output",
                              "qimen_output", "ziwei_output", "face_output", "palm_output",
                              "partner_face_output", "partner_palm_output"):
                    _wo2 = getattr(state, _attr2, None)
                    if _wo2 and _wo2.agent_id:
                        if _wo2.tags:
                            _wtags2[_wo2.agent_id] = _wo2.tags
                        if _wo2.error:
                            _werrs2[_wo2.agent_id] = _wo2.error
                reading.worker_tags = _wtags2 if _wtags2 else None
                reading.worker_errors = _werrs2 if _werrs2 else None
                reading.completed_at = datetime.now(timezone.utc)
                await db.commit()
    except Exception as e:
        logger.warning("Failed to persist reading to DB: %s", e)

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
    # Fastest path: completed reading cache (skip DB entirely)
    cached = _get_reading_cache(session_id)
    if cached:
        cached_needs_refresh = False
        # ── SECURITY: Verify ownership — anonymous users cannot access user-owned sessions ──
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(Reading).where(Reading.id == session_id)
                )
                reading = result.scalar_one_or_none()
                if reading and reading.user_id:
                    if not current_user:
                        raise HTTPException(status_code=401, detail="请登录后查看此报告")
                    if str(reading.user_id) != str(current_user.id):
                        raise HTTPException(status_code=403, detail="无权访问此报告")
                if reading and _hydrate_unlocked_legacy_report(reading):
                    await db.commit()
                    _invalidate_reading_cache(session_id)
                    cached_needs_refresh = True
                # Cached responses may have been created while the report was
                # locked, which intentionally removed master_detail and worker
                # content. Never serve that permission-filtered copy once the
                # database grants paid access.
                if reading and (reading.is_detail_unlocked or getattr(reading, "is_detailed_unlocked", False)):
                    cached_needs_refresh = True
        except HTTPException:
            raise
        except Exception as e:
            logger.warning("DB ownership check failed: %s", e)
            raise HTTPException(status_code=503, detail="Service temporarily unavailable")
        if not cached_needs_refresh:
            # Deep-copy before content lock: prevents cached shared reference from
            # being permanently mutated for all subsequent cache-hit requests.
            cached_copy = cached.model_copy(deep=True)
            _apply_content_lock(cached_copy, current_user, None, lang=lang or "zh")
            return await _localize_response_content(cached_copy, lang or "zh")

    # Fast path: in-memory cache
    state = await _get_session(session_id)
    if state:
        # ── SECURITY: Deny anonymous access to user-owned sessions ──
        if state.user_id:
            if not current_user:
                raise HTTPException(status_code=401, detail="请登录后查看此报告")
            if state.user_id != str(current_user.id):
                raise HTTPException(status_code=403, detail="无权访问此报告")
        resp = _state_to_response(state)
        # Merge DB fields: is_detail_unlocked, master_detail (skip if no user — defaults to false)
        if current_user:
            try:
                async with AsyncSessionLocal() as db:
                    result = await db.execute(
                        select(Reading).where(Reading.id == session_id)
                    )
                    reading = result.scalar_one_or_none()
                    if reading:
                        if _hydrate_unlocked_legacy_report(reading):
                            await db.commit()
                            _invalidate_reading_cache(session_id)
                        resp.is_detail_unlocked = reading.is_detail_unlocked
                        resp.is_detailed_unlocked = getattr(reading, "is_detailed_unlocked", False)
                        if reading.master_detail:
                            resp.master_detail = reading.master_detail
            except Exception as e:
                logger.debug("Failed to load reading details from DB: %s", e)
        _apply_content_lock(resp, current_user, None, lang=lang or "zh")
        return await _localize_response_content(resp, lang or state.language or "zh")

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

            if _hydrate_unlocked_legacy_report(reading):
                await db.commit()
                _invalidate_reading_cache(session_id)

            # If still pending/processing, check for stuck sessions
            if reading.status in (ReadingStatus.pending, ReadingStatus.processing):
                # Heuristic 1: if DB has worker reports or master_summary, the analysis
                # actually completed but status wasn't updated (server crash/restart).
                has_results = bool(
                    reading.master_summary
                    or reading.astrology_report
                    or reading.bazi_report
                    or reading.tarot_report
                )
                if has_results:
                    logger.warning("Session %s has results but status=%s — fixing to completed", session_id, reading.status)
                    reading.status = ReadingStatus.completed
                    await db.commit()
                    # Fall through to the "completed" path below

                else:
                    # No results yet — check if analysis is still running in-memory
                    state = await _get_session(session_id)
                    if state and state.phase in ("init", "parallel", "master"):
                        # Analysis is actively running — return live state
                        resp = _state_to_response(state)
                        _apply_content_lock(resp, current_user, None, lang=lang or "zh")
                        return await _localize_response_content(resp, lang or state.language or "zh")

                    # No active in-memory session AND no results = orphaned session
                    # (server crashed/restarted during analysis). Fail immediately.
                    session_age = datetime.now(timezone.utc) - reading.created_at.replace(tzinfo=timezone.utc)
                    logger.warning("Orphaned session %s: status=%s, age=%ss, no active session — marking as failed", session_id, reading.status, session_age)
                    reading.status = ReadingStatus.failed
                    reading.error_message = "Analysis did not complete — background task may have crashed"
                    await db.commit()
                    return AnalysisResponse(
                        session_id=session_id,
                        status="failed",
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
                        errors=["Analysis did not complete — please retry"],
                    )

            # Completed or failed — reconstruct from DB
            resp = AnalysisResponse(
                session_id=session_id,
                status=reading.status.value,
                progress_pct=100.0 if reading.status == ReadingStatus.completed else 0.0,
                progress_message="分析完成" if reading.status == ReadingStatus.completed else (reading.error_message or ""),
                master_summary=reading.master_summary or "",
                master_detail=reading.master_detail or "",
                quick_insights=build_generated_quick_insights(
                    reading.dimension_scores or {},
                    lang or getattr(reading, "language", None) or "zh",
                ),
                is_detail_unlocked=reading.is_detail_unlocked,
                is_detailed_unlocked=getattr(reading, "is_detailed_unlocked", False),
                astrology=_worker_from_report("astrology", reading.astrology_report,
                    _wt(reading, "astrology"), _we(reading, "astrology")),
                tarot=_worker_from_report("tarot", reading.tarot_report,
                    _wt(reading, "tarot"), _we(reading, "tarot")),
                bazi=_worker_from_report("bazi", reading.bazi_report,
                    _wt(reading, "bazi"), _we(reading, "bazi")),
                qimen=_worker_from_report("qimen", reading.qimen_report,
                    _wt(reading, "qimen"), _we(reading, "qimen")),
                ziwei=_worker_from_report("ziwei", reading.ziwei_report,
                    _wt(reading, "ziwei"), _we(reading, "ziwei")),
                face=_worker_from_report("face", reading.face_analysis_text,
                    _wt(reading, "face"), _we(reading, "face")),
                palm=_worker_from_report("palm", reading.palm_report,
                    _wt(reading, "palm"), _we(reading, "palm")),
                partner_face=_worker_from_report("partner_face", reading.partner_face_report,
                    _wt(reading, "partner_face"), _we(reading, "partner_face")) if reading.partner_face_report else None,
                partner_palm=_worker_from_report("partner_palm", reading.partner_palm_report,
                    _wt(reading, "partner_palm"), _we(reading, "partner_palm")) if reading.partner_palm_report else None,
                recommended_product_ids=reading.recommended_product_ids or [],
                computed_tags=reading.computed_tags or [],
                dimension_scores=reading.dimension_scores or {},
                errors=[reading.error_message] if reading.error_message else [],
            )

            # Apply content lock BEFORE translation (so we don't waste API calls translating locked content)
            _apply_content_lock(resp, current_user, reading, lang=lang or "zh")

            # Repair mixed legacy fields even when the saved report language says
            # "zh". Older records can contain English worker output inside a
            # Chinese report, so stored_lang alone is not a sufficient signal.
            await _localize_response_content(resp, lang or getattr(reading, "language", None) or "zh")

            # Cache the repaired locale-safe representation. Cache hits still
            # copy and re-apply locking for ownership and tier safety.
            if reading.status == ReadingStatus.completed:
                _set_reading_cache(session_id, resp)

            return resp
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail="Session not found.")


def _empty_worker(agent_id: str) -> WorkerReportOut:
    return WorkerReportOut(agent_id=agent_id, report="", tags=[], error=None, duration_ms=None)


def _wt(reading, agent_id: str) -> Optional[list[str]]:
    """Extract worker tags from reading's worker_tags JSON column."""
    wtags = getattr(reading, "worker_tags", None) or {}
    return wtags.get(agent_id)

def _we(reading, agent_id: str) -> Optional[str]:
    """Extract worker error from reading's worker_errors JSON column."""
    werrs = getattr(reading, "worker_errors", None) or {}
    return werrs.get(agent_id)


def _worker_from_report(agent_id: str, report: Optional[str],
                        tags: Optional[list[str]] = None,
                        error: Optional[str] = None) -> WorkerReportOut:
    return WorkerReportOut(
        agent_id=agent_id,
        report=report or "",
        tags=list(tags) if tags else [],
        error=error,
        duration_ms=None,
    )


# ─── On-the-fly Translation (for language mismatch) ────────────────────────

_translate_cache: OrderedDict[str, str] = OrderedDict()  # LRU cache: key = f"{text_hash}:{target_lang}"
_TRANSLATE_CACHE_MAX = 300  # max cached translations
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
    # NOTE: Do NOT use hash() — Python's hash is salted per-process (PYTHONHASHSEED),
    # making it unreliable for cache keys that need to survive within a single process.
    cache_key = f"{text[:200]}:{target_lang}"
    if cache_key in _translate_cache:
        _translate_cache.move_to_end(cache_key)
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
            # LRU eviction: remove oldest entries when cache is full
            while len(_translate_cache) > _TRANSLATE_CACHE_MAX:
                _translate_cache.popitem(last=False)
            return result
    except Exception as e:
        logger.warning("Translation failed: %s", e)

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
        state = await _get_session(session_id)
        if not state:
            # Session not in memory — mark DB status as failed if still pending/processing
            try:
                async with AsyncSessionLocal() as db:
                    stmt = select(Reading).where(Reading.id == session_id)
                    result = await db.execute(stmt)
                    reading = result.scalar_one_or_none()
                    if reading and reading.status in (ReadingStatus.pending, ReadingStatus.processing):
                        logger.warning("Session %s not in memory but status=%s — marking as failed", session_id, reading.status)
                        reading.status = ReadingStatus.failed
                        reading.error_message = "Analysis did not complete — background task may have crashed"
                        await db.commit()
            except Exception as e:
                logger.debug("Failed to update failed session status: %s", e)
            yield f"data: {json.dumps({'type': 'error', 'message': 'Session not found'})}\n\n"
            return

        # ── SECURITY: Deny anonymous access to user-owned sessions ──
        if state.user_id:
            if not current_user:
                yield f"data: {json.dumps({'type': 'error', 'message': '请登录后查看此报告'})}\n\n"
                return
            if state.user_id != str(current_user.id):
                yield f"data: {json.dumps({'type': 'error', 'message': '无权访问此报告'})}\n\n"
                return

        last_phase = ""
        streamed_workers: set[str] = set()
        streamed_subtasks: set[str] = set()
        last_pct = -1
        last_agent_status: dict[str, str] = {}
        phase_changed_at = time.time()
        last_heartbeat_at = time.time()

        while state.phase != "done":
            # Re-read state from session store to get live updates from background task
            _fresh = await _get_session(session_id)
            if _fresh:
                state = _fresh

            # Phase changes
            if state.phase != last_phase:
                yield f"data: {json.dumps({'type': 'phase', 'phase': state.phase})}\n\n"
                last_phase = state.phase
                phase_changed_at = time.time()

            # Stuck detection: if phase hasn't changed for 180s, mark as failed
            if time.time() - phase_changed_at > 180:
                logger.warning("SSE stuck detection: session %s stuck in phase=%s for >180s", session_id, state.phase)
                # NOTE: Do NOT mutate shared `state` object (race with background task).
                # Just persist failure to DB and send error event. The frontend's own
                # stuck timer (120s) will show the retry UI independently.
                try:
                    async with AsyncSessionLocal() as db:
                        stmt = select(Reading).where(Reading.id == session_id)
                        result = await db.execute(stmt)
                        reading = result.scalar_one_or_none()
                        if reading:
                            reading.status = ReadingStatus.failed
                            reading.error_message = "Analysis timed out — stuck in phase for too long"
                            await db.commit()
                except Exception as e:
                    logger.debug("Failed to update stuck session status: %s", e)
                yield f"data: {json.dumps({'type': 'error', 'message': 'Analysis timed out'})}\n\n"
                return

            # Progress events
            if state.progress_pct > last_pct:
                yield f"data: {json.dumps({'type': 'progress', 'pct': state.progress_pct, 'message': state.progress_message})}\n\n"
                last_pct = state.progress_pct

            # Agent status changes
            if state.agent_status != last_agent_status:
                yield f"data: {json.dumps({'type': 'agent_status', 'status': dict(state.agent_status)})}\n\n"
                last_agent_status = dict(state.agent_status)

            # Worker completions — emit when output exists (even with empty report on error)
            for agent_id in ["astrology", "tarot", "bazi", "qimen", "ziwei", "face", "palm", "partner_face", "partner_palm"]:
                if agent_id in streamed_workers:
                    continue
                wo = getattr(state, f"{agent_id}_output", None)
                if wo and wo.duration_ms is not None:
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

            # ── SECURITY: Send heartbeat every 15s to prevent proxy timeout ──
            now = time.time()
            if now - last_heartbeat_at >= 15:
                yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"
                last_heartbeat_at = now
                await asyncio.sleep(0.1)  # Ensure heartbeat is sent

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
        _apply_content_lock(tmp_resp, current_user, lang=state.language or "zh")
        yield f"data: {json.dumps({'type': 'progress', 'pct': 100, 'message': '分析完成'})}\n\n"
        yield f"data: {json.dumps({'type': 'complete', 'master_summary': tmp_resp.master_summary, 'master_detail': tmp_resp.master_detail})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/my", response_model=list[ReadingListItem])
async def list_my_readings(
    user: User = Depends(require_user),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """List all readings belonging to the current user, newest first."""
    try:
        async with AsyncSessionLocal() as db:
            stmt = (
                select(Reading)
                .where(Reading.user_id == user.id)
                .order_by(Reading.created_at.desc())
                .offset(offset)
                .limit(limit)
            )
            result = await db.execute(stmt)
            readings = result.scalars().all()

            # Batch-fetch sessions to avoid N+1 queries
            missing_ids = [
                str(r.id) for r in readings
                if not r.computed_tags or not r.dimension_scores
            ]
            session_cache = await _store_get_sessions_batch(missing_ids) if missing_ids else {}

            items = []
            for r in readings:
                # Read from DB columns (persisted), fall back to session cache
                computed_tags = list(r.computed_tags or [])
                dimension_scores = dict(r.dimension_scores or {})
                if not computed_tags or not dimension_scores:
                    state = session_cache.get(str(r.id))
                    if state:
                        if not computed_tags:
                            computed_tags = list(state.computed_tags or [])
                        if not dimension_scores:
                            dimension_scores = dict(state.dimension_scores or {})
                items.append(ReadingListItem(
                    id=str(r.id),
                    session_id=str(r.id),
                    status=(getattr(r.status, "value", r.status) if r.status else "completed"),
                    master_summary=(r.master_summary or "")[:200],
                    computed_tags=computed_tags,
                    dimension_scores=dimension_scores,
                    is_detail_unlocked=r.is_detail_unlocked,
                    is_detailed_unlocked=getattr(r, "is_detailed_unlocked", False),
                    created_at=r.created_at,
                    completed_at=r.completed_at,
                ))
            return items
    except Exception as exc:
        logger.exception("list_my_readings failed for user %s: %s", user.id, exc)
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
            # Clean up orphaned OrderItem rows: items whose reading was deleted
            # (FK ondelete="SET NULL" leaves rows with reading_id=NULL, product_id=NULL)
            from database.models import OrderItem
            from sqlalchemy import delete as sa_delete
            await db.execute(
                sa_delete(OrderItem).where(
                    OrderItem.reading_id.is_(None),
                    OrderItem.product_id.is_(None),
                )
            )
            await db.commit()
            # Also clean up session store
            await _delete_session(session_id)
            return {"ok": True}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="删除失败，请稍后重试")


MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

# ── SECURITY: File type validation constants ──────────────────────────────────
ALLOWED_IMAGE_MIME_PREFIXES = ("image/jpeg", "image/png", "image/webp", "image/bmp", "image/heic")
# Magic bytes for common image formats
IMAGE_MAGIC_BYTES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG": "image/png",
    b"RIFF": "image/webp",   # WebP starts with RIFF header
    b"BM": "image/bmp",
}


def _validate_image_file(content: bytes, filename: str = "") -> None:
    """Validate uploaded file is a real image by checking magic bytes."""
    if len(content) < 12:
        raise HTTPException(status_code=400, detail="文件过小，无法识别格式")

    # Check magic bytes against known image signatures
    detected_type = None
    for magic, mime in IMAGE_MAGIC_BYTES.items():
        if content[:len(magic)] == magic:
            detected_type = mime
            break

    # HEIC detection: ISOBMFF format with "ftyp" at offset 4
    if not detected_type and content[4:8] == b"ftyp":
        brand = content[8:12]
        if brand in (b"heic", b"heix", b"mif1", b"msf1", b"hevc"):
            detected_type = "image/heic"

    if not detected_type:
        raise HTTPException(
            status_code=400,
            detail="不支持的文件格式，请上传 JPEG/PNG/WebP 图片"
        )

    # Additional check: reject SVG (can contain JavaScript)
    if content[:5] in (b"<svg ", b"<?xml", b"<SVG "):
        raise HTTPException(
            status_code=400,
            detail="不支持 SVG 格式，请上传 JPEG/PNG/WebP 图片"
        )


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
    # ── SECURITY: Verify session ownership — deny anonymous access to user-owned sessions ──
    state = await _get_session(session_id)
    if state and state.user_id:
        if not current_user:
            raise HTTPException(status_code=401, detail="请登录后操作")
        if state.user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="无权访问此报告")
    from services.vision.face_v2t import FaceV2T
    face_v2t = FaceV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    _validate_image_file(content, file.filename or "")
    try:
        result = face_v2t.analyze_bytes(content)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail="视觉分析服务暂不可用")
    if not result:
        raise HTTPException(status_code=422,
                            detail="无法检测到面部。请上传清晰正面照。")
    feat_text = result.to_prompt_text()

    state = await _get_session(session_id)
    if state:
        state.face_features = FaceFeatures(
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
            quality_warning=result.quality_warning,
            raw_metrics=result.raw_metrics,
            raw_text=feat_text,
        )
        await _set_session(session_id, state)

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
async def analyze_face_image(file: UploadFile = File(...), request: Request = None):
    """
    Stateless face V2T analysis.
    Upload a face image -> returns structured physiognomy text without creating a session.
    Frontend can call this during Step 2 to auto-analyze before submitting the full form.
    """
    # Rate limit: 5 per minute per IP (CPU-intensive MediaPipe processing)
    client_ip = request.client.host if request and request.client else "unknown"
    if await check_rate_limit(f"face-upload:{client_ip}", limit=5, window=60):
        raise HTTPException(status_code=429, detail="上传过于频繁，请稍后再试")
    from services.vision.face_v2t import FaceV2T
    face_v2t = FaceV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    _validate_image_file(content, file.filename or "")
    try:
        result = face_v2t.analyze_bytes(content)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail="视觉分析服务暂不可用")
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
    # ── SECURITY: Verify session ownership — deny anonymous access to user-owned sessions ──
    state = await _get_session(session_id)
    if state and state.user_id:
        if not current_user:
            raise HTTPException(status_code=401, detail="请登录后操作")
        if state.user_id != str(current_user.id):
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
    state = await _get_session(session_id)
    if state:
        state.palm_features = pf
        await _set_session(session_id, state)

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
    # ── SECURITY: Verify session ownership — deny anonymous access to user-owned sessions ──
    state = await _get_session(session_id)
    if state and state.user_id:
        if not current_user:
            raise HTTPException(status_code=401, detail="请登录后操作")
        if state.user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="无权访问此报告")
    from services.vision.palm_v2t import PalmV2T
    palm_v2t = PalmV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    _validate_image_file(content, file.filename or "")
    try:
        result = palm_v2t.analyze_bytes(content)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail="视觉分析服务暂不可用")
    if not result:
        raise HTTPException(status_code=422,
                            detail="无法检测到手掌。请上传清晰手掌照片。")
    feat_text = result.to_prompt_text()

    state = await _get_session(session_id)
    if state:
        state.palm_features = PalmFeatures(
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
            quality_warning=result.quality_warning,
            raw_metrics=result.raw_metrics,
            raw_text=feat_text,
        )
        await _set_session(session_id, state)

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
async def analyze_palm_image(file: UploadFile = File(...), request: Request = None):
    """
    Stateless palm V2T analysis.
    Upload a palm image -> returns structured palmistry text without creating a session.
    Frontend can call this during Step 2 to auto-analyze before submitting the full form.
    """
    # Rate limit: 5 per minute per IP (CPU-intensive MediaPipe processing)
    client_ip = request.client.host if request and request.client else "unknown"
    if await check_rate_limit(f"palm-upload:{client_ip}", limit=5, window=60):
        raise HTTPException(status_code=429, detail="上传过于频繁，请稍后再试")

    from services.vision.palm_v2t import PalmV2T
    palm_v2t = PalmV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    _validate_image_file(content, file.filename or "")
    try:
        result = palm_v2t.analyze_bytes(content)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail="视觉分析服务暂不可用")
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
    session_id: Optional[str] = None
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


async def _get_birth_info_for_session(session_id: str) -> Optional[dict]:
    """Extract birth info from cached session state."""
    state = await _get_session(session_id)
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
    db: AsyncSession = Depends(get_db),
):
    """
    Analyze a user event against their birth chart + transit data.

    Steps:
    1. Load session state (from Redis or fall back to latest Reading in DB)
    2. Compute transit astrology + bazi for event datetime
    3. Call ReplayAgent LLM for causal analysis
    4. Match products from remedy keywords
    5. Save EventLog to database
    """
    try:
        return await _analyze_event_inner(payload, current_user, db)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("analyze_event crashed for user %s", current_user.id)
        raise HTTPException(
            status_code=500,
            detail="Event analysis failed. Please try again.",
        )


async def _analyze_event_inner(
    payload: AnalyzeEventRequest,
    current_user: User,
    db: AsyncSession,
):
    """Inner handler — wrapped by analyze_event for error handling."""
    # 1. Load session — try Redis first, then fall back to latest Reading
    state = None
    if payload.session_id:
        state = await _get_session(payload.session_id)

    if not state:
        # Fall back: reconstruct from user's latest completed Reading
        from database.models import BirthProfile
        reading_result = await db.execute(
            select(Reading)
            .where(
                Reading.user_id == current_user.id,
                Reading.status == ReadingStatus.completed,
            )
            .order_by(Reading.created_at.desc())
            .limit(1)
        )
        reading = reading_result.scalar_one_or_none()
        if not reading:
            raise HTTPException(
                status_code=404,
                detail="请先完成一次推命分析后再使用复盘功能",
            )

        # Reconstruct BirthInfo from BirthProfile
        bi = None
        if reading.birth_profile_id:
            bp_result = await db.execute(
                select(BirthProfile).where(BirthProfile.id == reading.birth_profile_id)
            )
            bp = bp_result.scalar_one_or_none()
            if bp:
                bi = BirthInfo(
                    year=bp.birth_year, month=bp.birth_month, day=bp.birth_day,
                    hour=bp.birth_hour, minute=bp.birth_minute,
                    city=bp.birth_city or "",
                    latitude=bp.latitude, longitude=bp.longitude,
                )

        from agents.state import WorkerOutput
        state = SystemState(
            session_id=reading.id,
            user_id=current_user.id,
            birth_info=bi,
            master_summary=reading.master_summary or "",
            dimension_scores=reading.dimension_scores or {},
            computed_tags=reading.computed_tags or [],
            bazi_raw=reading.bazi_raw or {},
            astrology_raw=reading.astrology_raw or {},
        )
        # Worker outputs — tags are empty but report text is preserved
        state.bazi_output = WorkerOutput(
            agent_id="bazi", report=reading.bazi_report or "",
        )
        state.astrology_output = WorkerOutput(
            agent_id="astrology", report=reading.astrology_report or "",
        )

    if not state.birth_info:
        # No birth info available (e.g. Reading without birth_profile_id).
        # Proceed with empty transit data — LLM can still analyze based on
        # master_summary + computed_tags.
        logger.info("No birth_info for user %s, proceeding without transit data", current_user.id)
        state.birth_info = None

    bi = state.birth_info
    event_dt = payload.event_datetime

    # 2a. Compute transit astrology (skip if no birth info)
    transit_astro = {"transit_planets": {}, "transit_natal_aspects": []}
    if bi:
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
            logger.warning("Transit astrology calculation failed: %s", exc)
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
        lang=state.language or "zh",
    )
    # Add LLM explanations
    for p in matched_products:
        explanation = matcher.explain_why(
            product=p,
            master_summary=state.master_summary,
            weakness_tags=remedy_keywords,
            boost_elements=boost_elements,
            lang=state.language or "zh",
        )
        p["recommendation_text"] = explanation

    # 5. Save EventLog to database
    # Ensure event_logs table exists (safe to call multiple times)
    try:
        from database.models import Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        logger.debug("Table creation check failed: %s", e)

    event_id = str(uuid.uuid4())
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
                session_id=payload.session_id or state.session_id,
                user_id=current_user.id,
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
        logger.warning("EventLog save error: %s", db_err)
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
        state = await _get_session(session_id)
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
    """Get full event analysis detail — with ownership verification."""
    event_uuid = event_id

    try:
        async with AsyncSessionLocal() as db:
            stmt = select(EventLog).where(EventLog.id == event_uuid)
            result = await db.execute(stmt)
            evt = result.scalar_one_or_none()
            if not evt:
                raise HTTPException(status_code=404, detail="Event not found.")

            # ── SECURITY: Verify event ownership ──
            if evt.user_id and str(evt.user_id) != str(current_user.id):
                raise HTTPException(status_code=403, detail="无权访问此事件")

            # Load products from product IDs
            from services.product_matcher import ProductMatcher
            matcher = ProductMatcher()
            matched = []
            if evt.remedy_keywords:
                matched = matcher.match_with_reasons(
                    weakness_tags=evt.remedy_keywords or [],
                    boost_elements=[],
                    top_k=4,
                    lang="zh",
                )
                for p in matched:
                    p["recommendation_text"] = matcher.explain_why(
                        product=p,
                        master_summary="",
                        weakness_tags=evt.remedy_keywords or [],
                        lang="zh",
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
    birth_year: Optional[int] = Query(None, ge=1920, le=datetime.now().year),
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
    dm_element = None
    today_element = None
    relation_key = "neutral"

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
                relation_key = "same"
            elif SHENG.get(dm_element) == today_element:
                # 我生 — 泄气，略低
                mod = -1
                relation_key = "output"
            elif KE.get(dm_element) == today_element:
                # 我克 — 得财，财运好
                mod = 1
                relation_key = "wealth"
            elif SHENG_ME.get(dm_element) == today_element:
                # 生我 — 有助力，整体好
                mod = 1
                relation_key = "support"
            elif KE_ME.get(dm_element) == today_element:
                # 克我 — 压力，需注意
                mod = -1
                relation_key = "pressure"
            else:
                mod = 0
                relation_key = "neutral"

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

        except Exception as e:
            logger.debug("Fortune score calculation failed: %s", e)

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
        except Exception as e:
            logger.debug("Lucky color calculation failed: %s", e)
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

    def _lowest_focus() -> str:
        scores = {
            "wealth": wealth,
            "career": career,
            "love": love,
            "health": health,
        }
        return min(scores, key=scores.get)

    def _personalized_action_text() -> tuple[str, str]:
        focus = _lowest_focus()
        if lang == "en":
            relation_advice = {
                "same": "Your chart meets similar daily energy today, so use the day for steady execution and avoid scattering your attention.",
                "output": "Today's energy asks you to spend output carefully; finish one visible deliverable before opening a new direction.",
                "wealth": "Today's rhythm supports resource judgment; review money, opportunities, and commitments with concrete numbers.",
                "support": "Today's energy gives your chart support; schedule the hardest task in the first focused block of the day.",
                "pressure": "Today's energy presses your chart; reduce avoidable conflict and choose one controllable task first.",
                "neutral": "Today's rhythm is neutral for your chart; use it for calibration, review, and one small practical step.",
            }
            focus_advice = {
                "wealth": " Keep financial decisions conservative: compare costs, cash flow, and risk before saying yes.",
                "career": " Prioritize work with clear feedback: one proposal, one delivery, or one conversation that moves the project forward.",
                "love": " In relationships, slow the reaction speed and ask for clarification before interpreting tone.",
                "health": " Protect energy first: sleep, meals, and light movement matter more than forcing extra output today.",
            }
            focus_warning = {
                "wealth": "Do not use emotion to justify spending, lending, or high-risk commitments.",
                "career": "Avoid changing direction just because progress feels slow.",
                "love": "Avoid testing the other person through silence or indirect messages.",
                "health": "Avoid overdrawing your body to prove productivity.",
            }
            return (
                relation_advice.get(relation_key, relation_advice["neutral"]) + focus_advice[focus],
                focus_warning[focus],
            )

        relation_advice = {
            "same": "今日命盘遇到同类能量，适合稳步执行，把注意力集中在一件确定能推进的事上。",
            "output": "今日对你的命盘有输出消耗感，先完成一个看得见的交付，再开启新的方向。",
            "wealth": "今日节奏利于资源判断，适合复盘钱、机会和承诺，用具体数字做决定。",
            "support": "今日能量对你的命盘有扶助感，适合把最难的一项任务放在第一个专注时段。",
            "pressure": "今日对你的命盘有压力感，先减少不必要冲突，选择一件可控的小事稳住节奏。",
            "neutral": "今日与你的命盘关系偏平稳，适合校准状态、复盘计划，并完成一个实际动作。",
        }
        focus_advice = {
            "wealth": "财富面先保守判断，比较成本、现金流和风险，再决定是否投入。",
            "career": "事业面优先做有明确反馈的事：一份方案、一次交付或一次关键沟通。",
            "love": "关系面放慢反应速度，先确认对方真实意思，不要急着解读情绪。",
            "health": "状态面先保能量，睡眠、饮食和轻运动比硬撑效率更重要。",
        }
        focus_warning = {
            "wealth": "避免用情绪为消费、借贷或高风险承诺找理由。",
            "career": "避免因为进展慢就临时换方向。",
            "love": "避免用沉默或试探来确认关系安全感。",
            "health": "避免透支身体去证明效率。",
        }
        return (
            relation_advice.get(relation_key, relation_advice["neutral"]) + focus_advice[focus],
            focus_warning[focus],
        )

    if personalized:
        advice, warning = _personalized_action_text()
    elif lang == "en":
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

    # Translate lucky color for English
    COLOR_ZH_TO_EN = {
        "金色": "Gold", "红色": "Red", "蓝色": "Blue", "绿色": "Green",
        "紫色": "Purple", "白色": "White", "粉色": "Pink", "橙色": "Orange",
        "翠绿": "Emerald", "青色": "Cyan", "黑色": "Black", "黄色": "Yellow", "银色": "Silver",
    }
    if lang == "en":
        lucky_color_name = COLOR_ZH_TO_EN.get(lucky_color_name, lucky_color_name)

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
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Get personalized daily almanac (yi/ji/hu) based on user's birth chart vs today's transits.

    Real-time computation, no storage.
    Supports lang=zh|en for localized output.
    Requires authentication — users can only access their own sessions.
    """
    state = await _get_session(session_id)

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

                # Verify ownership: only the session owner can access the almanac
                if reading.user_id:
                    if not current_user:
                        raise HTTPException(status_code=401, detail="请登录后查看此报告")
                    if str(reading.user_id) != str(current_user.id):
                        raise HTTPException(status_code=403, detail="无权访问此报告")

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
                await _set_session(session_id, state)
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
        except Exception as e:
            logger.debug("Natal chart calculation failed: %s", e)

        # 2. Compute today's transits
        try:
            today_dt = datetime(today.year, today.month, today.day, 12, 0, tzinfo=timezone.utc)
            transit = astro_calc.calculate_transit_for_date(today_dt, natal_planets)
        except Exception as e:
            logger.debug("Transit calculation failed: %s", e)

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
    except Exception as e:
        logger.debug("Bazi day pillar calculation failed: %s", e)
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
            weekday_map = {1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat",0:"Sun"}

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
            weekday_en = weekday_map.get(weekday_cn, "")

            lunar_date_str = (
                f"Lunar: {today_lunar.getYearInChinese()}"
                f" Year {year_gz}({year_animal})"
                f" Month {month_gz}({month_animal})"
                f" Day {day_gz}({day_animal})"
                f" Hour {time_gz}({time_animal})"
                f" | {weekday_en}"
            )
        else:
            # Build proper Chinese lunar date string
            _year_cn = today_lunar.getYearInChinese()
            _year_gz = today_lunar.getYearInGanZhi()
            _year_animal = today_lunar.getYearShengXiao()
            _month_gz = today_lunar.getMonthInGanZhi()
            _month_animal = today_lunar.getMonthShengXiao()
            _day_gz = today_lunar.getDayInGanZhi()
            _day_animal = today_lunar.getDayShengXiao()
            lunar_date_str = (
                f"{_year_cn}{_year_gz}({_year_animal})年 "
                f"{_month_gz}({_month_animal})月 "
                f"{_day_gz}({_day_animal})日"
            )
    except Exception as e:
        logger.debug("Lunar date calculation failed: %s", e)

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
        lang=lang,
    )
    for p in matched:
        p["recommendation_text"] = matcher.explain_why_template(
            product=p,
            weakness_tags=all_weakness,
            boost_elements=almanac_data.get("boost_elements", []),
            lang=lang,
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


# ─── Personalized Almanac (birth-profile based, no session required) ──────

class PersonalizedAlmanacRequest(BaseModel):
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: int = 12
    birth_minute: int = 0
    gender: str = "male"
    birth_city: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    lang: str = "zh"


@router.post("/personalized-almanac", response_model=DailyAlmanacResponse)
async def get_personalized_almanac(payload: PersonalizedAlmanacRequest):
    """
    Get personalized daily almanac from birth profile params directly.
    Used by the dashboard when user has no reading sessions yet.
    """
    from agents.state import SystemState, BirthInfo

    bi = BirthInfo(
        year=payload.birth_year, month=payload.birth_month, day=payload.birth_day,
        hour=payload.birth_hour, minute=payload.birth_minute,
        city=payload.birth_city,
        latitude=payload.latitude, longitude=payload.longitude,
        gender=payload.gender,
    )

    state = SystemState(
        session_id="personalized",
        birth_info=bi,
        dimension_scores={},
        computed_tags=[],
        master_summary="",
        bazi_raw={},
        astrology_raw={},
    )

    today = date.today()
    cache_key = f"personalized:{payload.birth_year}-{payload.birth_month}-{payload.birth_day}:{today}:{payload.lang}"
    cached = _almanac_cache.get(cache_key)
    if cached and (time.time() - cached.get("_ts", 0)) < _ALMANAC_CACHE_TTL:
        from fastapi.responses import JSONResponse as _JSONResp
        return _JSONResp(content={k: v for k, v in cached.items() if k != "_ts"})

    # Compute natal chart
    natal_planets = {}
    transit = {"transit_planets": {}, "transit_natal_aspects": []}
    from calculators.astrology_calculator import AstrologyCalculator
    astro_calc = AstrologyCalculator()
    try:
        natal_chart = astro_calc.calculate(
            year=bi.year, month=bi.month, day=bi.day,
            hour=bi.hour, minute=bi.minute,
            latitude=bi.latitude or 0.0, longitude=bi.longitude or 0.0,
        )
        natal_planets = natal_chart.planets
    except Exception as e:
        logger.debug("Natal chart calculation failed: %s", e)
    try:
        today_dt = datetime(today.year, today.month, today.day, 12, 0, tzinfo=timezone.utc)
        transit = astro_calc.calculate_transit_for_date(today_dt, natal_planets)
    except Exception as e:
        logger.debug("Transit calculation failed: %s", e)

    # Compute today's bazi + lunar
    today_bazi = None
    lunar_date_str = ""
    bazi_day_pillar_str = ""
    try:
        today_bazi = BaziCalculator.calculate_transit_pillars(today.year, today.month, today.day)
        if today_bazi:
            dp = today_bazi.get("day_pillar", {})
            raw_gz = dp.get("ganzhi", "")
            if payload.lang == "en" and len(raw_gz) >= 2:
                _g_map_en_inner = {
                    "甲":"Jia","乙":"Yi","丙":"Bing","丁":"Ding","戊":"Wu",
                    "己":"Ji","庚":"Geng","辛":"Xin","壬":"Ren","癸":"Gui",
                }
                _z_map_en_inner = {
                    "子":"Zi","丑":"Chou","寅":"Yin","卯":"Mao","辰":"Chen","巳":"Si",
                    "午":"Wu","未":"Wei","申":"Shen","酉":"You","戌":"Xu","亥":"Hai",
                }
                g_en = _g_map_en_inner.get(raw_gz[0], raw_gz[0])
                z_en = _z_map_en_inner.get(raw_gz[1], raw_gz[1])
                bazi_day_pillar_str = f"{g_en} ({raw_gz[0]}) · {z_en} ({raw_gz[1]})"
            else:
                bazi_day_pillar_str = raw_gz
    except Exception as e:
        logger.debug("Bazi day pillar calculation failed: %s", e)
    try:
        from lunar_python import Solar
        today_lunar = Solar.fromYmd(today.year, today.month, today.day).getLunar()
        if payload.lang == "en":
            _g_map_en = {
                "甲":"Jia","乙":"Yi","丙":"Bing","丁":"Ding","戊":"Wu",
                "己":"Ji","庚":"Geng","辛":"Xin","壬":"Ren","癸":"Gui",
            }
            _z_map_en = {
                "子":"Zi","丑":"Chou","寅":"Yin","卯":"Mao","辰":"Chen","巳":"Si",
                "午":"Wu","未":"Wei","申":"Shen","酉":"You","戌":"Xu","亥":"Hai",
            }
            _animal_map_en = {
                "鼠":"Rat","牛":"Ox","虎":"Tiger","兔":"Rabbit","龙":"Dragon","蛇":"Snake",
                "马":"Horse","羊":"Goat","猴":"Monkey","鸡":"Rooster","狗":"Dog","猪":"Pig",
            }
            def _gz_en(gz):
                if len(gz) >= 2:
                    return f"{_g_map_en.get(gz[0], gz[0])}-{_z_map_en.get(gz[1], gz[1])}"
                return gz
            def _an_en(a):
                return _animal_map_en.get(a, a)
            lunar_date_str = (
                f"Lunar: {today_lunar.getYearInChinese()}"
                f" Year {_gz_en(today_lunar.getYearInGanZhi())}({_an_en(today_lunar.getYearShengXiao())})"
                f" Month {_gz_en(today_lunar.getMonthInGanZhi())}({_an_en(today_lunar.getMonthShengXiao())})"
                f" Day {_gz_en(today_lunar.getDayInGanZhi())}({_an_en(today_lunar.getDayShengXiao())})"
                f" Hour {_gz_en(today_lunar.getTimeInGanZhi())}({_an_en(today_lunar.getTimeShengXiao())})"
            )
        else:
            _year_cn = today_lunar.getYearInChinese()
            _year_gz = today_lunar.getYearInGanZhi()
            _year_animal = today_lunar.getYearShengXiao()
            _month_gz = today_lunar.getMonthInGanZhi()
            _month_animal = today_lunar.getMonthShengXiao()
            _day_gz = today_lunar.getDayInGanZhi()
            _day_animal = today_lunar.getDayShengXiao()
            lunar_date_str = (
                f"{_year_cn}{_year_gz}({_year_animal})年 "
                f"{_month_gz}({_month_animal})月 "
                f"{_day_gz}({_day_animal})日"
            )
    except Exception as e:
        logger.debug("Lunar date calculation failed: %s", e)

    energy_score = _compute_energy_score({}, None)

    almanac_data = await _generate_almanac(
        state=state, today=today,
        transit_bazi=today_bazi, transit_astro=transit,
        energy_score=energy_score,
        lang=payload.lang,
    )

    from services.product_matcher import ProductMatcher
    matcher = ProductMatcher()
    matched = matcher.match_with_reasons(
        weakness_tags=[], boost_elements=almanac_data.get("boost_elements", []), top_k=3,
        lang=payload.lang,
    )
    for p in matched:
        p["recommendation_text"] = matcher.explain_why_template(
            product=p, weakness_tags=[], boost_elements=almanac_data.get("boost_elements", []),
            lang=payload.lang,
        )

    hu_items = [{"product": p, "reason": p.get("match_reasons", [""])[0] if p.get("match_reasons") else "今日能量匹配"} for p in matched]

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

    _almanac_cache[cache_key] = {**result.model_dump(), "_ts": time.time()}
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
    except Exception as e:
        logger.debug("LLM almanac generation failed, using rule-based: %s", e)

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
    "求财": "Good for seeking wealth",
    "面试": "Good for interviews",
    "求学": "Good for academic pursuits",
    "求医问药": "Good for health matters",
    "修缮": "Good for repairs",
    "祈愿": "Good for making wishes",
    "读书": "Good for reading & study",
    "运动": "Good for exercise",
    "约会": "Good for dates",
    "创业": "Good for entrepreneurship",
    "谈判": "Good for negotiations",
    "拜访": "Good for visits",
    "聚餐": "Good for gatherings",
    "烹饪": "Good for cooking",
    "散步": "Good for walks",
    "绘画": "Good for creative arts",
    "音乐": "Good for music & arts",
    "健身": "Good for fitness",
    "旅行": "Good for travel",
    "购物": "Good for shopping",
    "打扫": "Good for cleaning",
    "收纳": "Good for organizing",
    "宜出行": "Good for travel",
    "宜签约": "Good for signing contracts",
    "宜求财": "Good for seeking wealth",
    "宜会友": "Good for meeting friends",
    "宜学习": "Good for studying",
    "宜祈福": "Good for spiritual practice",
    "宜开工": "Good for starting work",
    "宜面试": "Good for interviews",
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
    "忌熬夜": "Avoid staying up late",
    "忌争吵": "Avoid quarrels",
    "忌借贷": "Avoid lending money",
    "忌冒险": "Avoid taking risks",
    "忌搬迁": "Avoid moving house",
    "忌高风险投资": "Avoid high-risk investments",
    "忌网购": "Avoid impulse online shopping",
    "忌签约": "Avoid signing contracts",
    "忌远行": "Avoid long trips",
    "忌动土": "Avoid groundbreaking activities",
    "忌诉讼": "Avoid legal proceedings",
    "忌嫁娶": "Avoid weddings",
    "忌开市": "Avoid opening new businesses",
    "忌修造": "Avoid renovations",
    "忌栽种": "Avoid planting",
    "忌求医": "Avoid medical procedures",
    "忌谈判": "Avoid negotiations",
    "忌赌博": "Avoid gambling",
    "忌酗酒": "Avoid excessive drinking",
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
    import random, re

    def _smart_translate(text: str, is_yi: bool) -> str:
        """If text is still Chinese after map lookup, provide a generic English equivalent."""
        if not any(ord(c) > 0x4E00 for c in text):
            return text  # Already English
        # Strip 宜/忌 prefix for cleaner matching
        core = re.sub(r"^[宜忌]", "", text)
        if core in _YI_EN:
            return _YI_EN[core]
        if core in _JI_EN:
            return _JI_EN[core]
        # Generic fallback
        if is_yi:
            return f"Good for {core}"
        else:
            return f"Avoid {core}"

    yi_items = []
    for item in data.get("yi", []):
        yi_items.append(_smart_translate(item, is_yi=True))
    ji_items = []
    for item in data.get("ji", []):
        ji_items.append(_smart_translate(item, is_yi=False))

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
    }# trigger deploy
