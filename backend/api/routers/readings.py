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

from backend.agents.state import (
    SystemState, BirthInfo, FaceFeatures, PalmFeatures, ChatMessage,
)
from backend.database.session import AsyncSessionLocal, engine
from backend.database.models import Reading, ReadingStatus, PaymentStatus, EventLog, User
from backend.auth.dependencies import get_current_user, require_user
from backend.config import get_settings

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


# ─── Request / Response Schemas ───────────────────────────────────────────

class AnalysisRequest(BaseModel):
    gender: str = Field("female", pattern="^(male|female|other)$")
    birth_year: int = Field(..., ge=1920, le=2010)
    birth_month: int = Field(..., ge=1, le=12)
    birth_day: int = Field(..., ge=1, le=31)
    birth_hour: int = Field(..., ge=0, le=23)
    birth_minute: int = Field(0, ge=0, le=59)
    birth_city: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    user_question: str = "Please give me a complete multi-dimensional destiny analysis."
    is_premium: bool = False
    tarot_cards: list[dict] = Field(default_factory=list)
    palm_raw_text: str = ""
    face_raw_text: str = ""


class ReadingListItem(BaseModel):
    id: str
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
    background_tasks: BackgroundTasks,
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    POST creates session, runs analysis inline, returns full results.
    BackgroundTasks don't work on Vercel Lambda (env destroyed after response).
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

    state = SystemState(
        birth_info=bi,
        face_features=face_feat,
        palm_features=palm_feat,
        user_question=payload.user_question,
        is_premium=payload.is_premium,
        tarot_raw={"spread": "Three-Card Spread", "cards": payload.tarot_cards},
    )

    user_id = current_user.id if current_user else None

    # Persist session to DATABASE (with timeout to avoid blocking on Vercel)
    try:
        async with asyncio.wait_for(
            _persist_session(state.session_id, user_id),
            timeout=5,
        ):
            pass
    except (asyncio.TimeoutError, Exception) as e:
        print(f"[WARN] Failed to create reading in DB: {e}")

    # Also keep in-memory for same-instance fast access
    _cleanup_sessions()
    _sessions[state.session_id] = state
    import time as _time
    _session_created[state.session_id] = _time.time()

    # Run analysis inline (BackgroundTasks don't work on Vercel Lambda)
    try:
        from backend.agents.graph import run_full_analysis
        state = await run_full_analysis(state)
    except Exception as e:
        state.errors.append(str(e))
        state.phase = "done"
        print(f"[SYNC] Analysis failed for {state.session_id}: {e}")

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
                reading.face_analysis_text = state.face_output.report if state.face_output and state.face_output.report != "No facial image provided. Face analysis skipped." else None
                reading.completed_at = datetime.now(timezone.utc)
                await db.commit()
    except Exception as e:
        print(f"[WARN] Failed to persist reading to DB: {e}")

    return _state_to_response(state)


async def _persist_session(session_id: str, user_id: Optional[str] = None):
    """Persist a reading session to the database."""
    from backend.database.session import _db_available
    if _db_available is False:
        return
    async with AsyncSessionLocal() as db:
        reading = Reading(
            id=session_id,
            user_id=user_id,
            status=ReadingStatus.pending,
            master_summary="",
            is_detail_unlocked=False,
        )
        db.add(reading)
        await db.commit()


async def _run_analysis_bg(state: SystemState, user_id: Optional[str] = None):
    """Background task: run the full pipeline then persist results to DB."""
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
        from backend.agents.graph import run_full_analysis
        state = await run_full_analysis(state)
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
                reading.face_analysis_text = state.face_output.report if state.face_output and state.face_output.report != "No facial image provided. Face analysis skipped." else None
                reading.completed_at = datetime.now(timezone.utc)
                await db.commit()
                print(f"[BG] Persisted reading {state.session_id} to DB")
    except Exception as e:
        print(f"[WARN] Failed to persist reading to DB: {e}")


@router.post("/chat", response_model=ChatResponse)
async def chat_followup(payload: ChatRequest):
    """
    Task C: Dynamic routing follow-up chat.
    Routes user question to the correct expert agent and returns a focused answer.
    """
    from backend.agents.graph import run_chat

    state = _sessions.get(payload.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found. Run /readings/ first.")

    answer, agent_id, updated_state = await run_chat(payload.question, state)
    _sessions[payload.session_id] = updated_state

    return ChatResponse(
        answer=answer,
        routed_to=agent_id,
        session_id=payload.session_id,
        loop_count=updated_state.loop_count,
    )


@router.get("/session/{session_id}", response_model=AnalysisResponse)
async def get_session(session_id: str):
    """
    Retrieve session by ID. Checks in-memory first, then DATABASE.
    Returns current status so frontend can poll until "done".
    """
    # Fast path: in-memory cache (same Vercel instance)
    state = _sessions.get(session_id)
    if state:
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
        return resp

    # Slow path: read from DATABASE (different Vercel instance or process restarted)
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Reading).where(Reading.id == session_id)
            )
            reading = result.scalar_one_or_none()
            if not reading:
                raise HTTPException(status_code=404, detail="Session not found.")

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
            return AnalysisResponse(
                session_id=session_id,
                status=reading.status.value,
                master_summary=reading.master_summary or "",
                master_detail=reading.master_detail or "",
                is_detail_unlocked=reading.is_detail_unlocked,
                astrology=_worker_from_report("astrology", reading.astrology_report),
                tarot=_worker_from_report("tarot", reading.tarot_report),
                bazi=_worker_from_report("bazi", reading.bazi_report),
                qimen=_empty_worker("qimen"),
                ziwei=_empty_worker("ziwei"),
                face=_worker_from_report("face", reading.face_analysis_text),
                palm=_empty_worker("palm"),
                recommended_product_ids=reading.recommended_product_ids or [],
                computed_tags=reading.computed_tags or [],
                dimension_scores={},
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
        raise HTTPException(status_code=500, detail=f"Failed to list readings: {str(exc)}")


MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload-face/{session_id}")
async def upload_face_image(session_id: str, file: UploadFile = File(...)):
    """
    Upload a face image -> V2T via MediaPipe FaceMesh 468 landmarks
    -> structured physiognomy text -> update session state.
    Uses the new FaceV2T engine for richer analysis.
    """
    from backend.services.vision.face_v2t import FaceV2T
    face_v2t = FaceV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    result = face_v2t.analyze_bytes(content)
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
    from backend.services.vision.face_v2t import FaceV2T
    face_v2t = FaceV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    result = face_v2t.analyze_bytes(content)
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
):
    """
    Accept palm feature descriptions (text-based fallback).
    """
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
async def upload_palm_image(session_id: str, file: UploadFile = File(...)):
    """
    Upload a palm image -> V2T via MediaPipe Hands + OpenCV line detection
    -> structured palmistry text -> update session state.
    """
    from backend.services.vision.palm_v2t import PalmV2T
    palm_v2t = PalmV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    result = palm_v2t.analyze_bytes(content)
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
    from backend.services.vision.palm_v2t import PalmV2T
    palm_v2t = PalmV2T()

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件大小超过限制（最大 10MB）")
    result = palm_v2t.analyze_bytes(content)
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
    energy_score: int
    yi: list[str]
    ji: list[str]
    hu: list[dict] = Field(default_factory=list)
    daily_quote: str
    wuxing_analysis: str = ""


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
    from backend.agents.master import _llm, _use_mock

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
async def analyze_event(payload: AnalyzeEventRequest):
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
    from backend.calculators.astrology_calculator import AstrologyCalculator
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
    from backend.calculators.bazi_calculator import BaziCalculator
    try:
        transit_bazi = BaziCalculator.calculate_transit_pillars(
            year=event_dt.year,
            month=event_dt.month,
            day=event_dt.day,
        )
    except Exception:
        transit_bazi = None

    # 3. Build replay prompt and call LLM
    from backend.agents.replay_prompt import replay_agent_prompt
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
    from backend.services.product_matcher import ProductMatcher
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
        from backend.database.models import Base
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
async def list_events(session_id: str = Query(...)):
    """List all events for a session, newest first."""
    try:
        async with AsyncSessionLocal() as db:
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
        raise HTTPException(status_code=500, detail=f"Failed to list events: {str(exc)}")


# ─── Event Detail Endpoint ────────────────────────────────────────────────────


@router.get("/events/{event_id}", response_model=EventDetailResponse)
async def get_event_detail(event_id: str):
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
            from backend.services.product_matcher import ProductMatcher
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
        raise HTTPException(status_code=500, detail=f"Failed to get event: {str(exc)}")


# ─── Daily Almanac Endpoint ────────────────────────────────────────────────────


@router.get("/daily-almanac", response_model=DailyAlmanacResponse)
async def get_daily_almanac(session_id: str = Query(...)):
    """
    Get personalized daily almanac (yi/ji/hu) based on user's birth chart vs today's transits.

    Real-time computation, no storage.
    """
    state = _sessions.get(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found. Run /readings/ first.")
    if not state.birth_info:
        raise HTTPException(status_code=400, detail="Session missing birth info.")

    bi = state.birth_info
    today = date.today()

    # 1. Compute natal chart
    from backend.calculators.astrology_calculator import AstrologyCalculator
    astro_calc = AstrologyCalculator()
    try:
        natal_chart = astro_calc.calculate(
            year=bi.year, month=bi.month, day=bi.day,
            hour=bi.hour, minute=bi.minute,
            latitude=bi.latitude or 0.0,
            longitude=bi.longitude or 0.0,
        )
        natal_planets = natal_chart.planets
    except Exception:
        natal_planets = {}

    # 2. Compute today's transits
    transit = {"transit_planets": {}, "transit_natal_aspects": []}
    try:
        today_dt = datetime(today.year, today.month, today.day, 12, 0, tzinfo=timezone.utc)
        transit = astro_calc.calculate_transit_for_date(today_dt, natal_planets)
    except Exception:
        pass

    # 3. Compute today's bazi pillars
    from backend.calculators.bazi_calculator import BaziCalculator
    today_bazi = None
    try:
        today_bazi = BaziCalculator.calculate_transit_pillars(today.year, today.month, today.day)
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

    # 6. Match products for 'hu' (护)
    from backend.services.product_matcher import ProductMatcher
    matcher = ProductMatcher()
    all_weakness = list(state.computed_tags or [])
    matched = matcher.match_with_reasons(
        weakness_tags=all_weakness,
        boost_elements=almanac_data.get("boost_elements", []),
        top_k=3,
    )
    for p in matched:
        explanation = matcher.explain_why(
            product=p,
            master_summary=state.master_summary,
            weakness_tags=all_weakness,
        )
        p["recommendation_text"] = explanation

    hu_items = [
        {
            "product": p,
            "reason": p.get("match_reasons", [""])[0] if p.get("match_reasons") else "今日能量匹配",
        }
        for p in matched
    ]

    return DailyAlmanacResponse(
        date=today.isoformat(),
        energy_score=energy_score,
        yi=almanac_data.get("yi", []),
        ji=almanac_data.get("ji", []),
        hu=hu_items,
        daily_quote=almanac_data.get("daily_quote", "顺势而为，方得始终。"),
        wuxing_analysis=almanac_data.get("wuxing_analysis", ""),
    )


async def _generate_almanac(
    state: SystemState,
    today: date,
    transit_bazi: dict | None,
    transit_astro: dict | None,
    energy_score: int,
) -> dict:
    """
    Generate yi/ji/hu recommendations using LLM when available, fallback to rule-based.
    """
    from backend.agents.master import _llm, _use_mock
    if _use_mock():
        return _rule_based_almanac(state, today, transit_bazi, transit_astro, energy_score)

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
        "- daily_quote: 一句古典风格每日寄语（10-30字），引用古诗或哲言"
    )

    from langchain_core.messages import SystemMessage, HumanMessage
    llm = _llm(temperature=0.7)
    try:
        resp = await llm.ainvoke([
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