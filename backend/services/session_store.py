"""
services/session_store.py — Redis-backed analysis session store.

Replaces the in-memory `_sessions` dict in readings.py.
Supports distributed session storage across multiple worker processes.
Falls back to in-memory dict when Redis is unavailable.

NOTE: Session data is stored as JSON (not pickle) for security.
"""
from __future__ import annotations

import json
import logging
import time
from typing import Optional

import redis.asyncio as aioredis

from config import get_settings

logger = logging.getLogger(__name__)

SESSION_TTL = 3600 * 2  # 2 hours

# ── Redis client ─────────────────────────────────────────────────────────────
_session_redis = None
_session_redis_available: Optional[bool] = None  # None = not checked yet
_last_reconnect_attempt: float = 0.0
_RECONNECT_INTERVAL = 300  # Retry every 5 minutes if previously failed


async def _get_session_redis():
    """Return a Redis client with decode_responses=True for JSON string data."""
    global _session_redis, _session_redis_available, _last_reconnect_attempt
    if _session_redis_available is False:
        # Periodically retry connection
        now = time.time()
        if now - _last_reconnect_attempt < _RECONNECT_INTERVAL:
            return None
        _last_reconnect_attempt = now
        _session_redis_available = None  # Fall through to attempt reconnection
    if _session_redis is not None:
        return _session_redis
    settings = get_settings()
    if not settings.REDIS_URL:
        _session_redis_available = False
        return None
    try:
        _session_redis = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,  # JSON strings — safe UTF-8
            socket_connect_timeout=3,
            socket_timeout=3,
        )
        await _session_redis.ping()
        _session_redis_available = True
        return _session_redis
    except Exception as e:
        _session_redis_available = False
        _session_redis = None
        logger.warning("Session Redis connection failed: %s", e)
        return None


# ── In-memory fallback ───────────────────────────────────────────────────────
_memory_sessions: dict[str, tuple[float, object]] = {}  # key -> (expire_ts, pickled_obj)
_last_cleanup: float = 0.0
_MEMORY_MAX_SESSIONS = 100  # Max cached sessions in memory mode


async def _memory_cleanup():
    """Proactively evict expired entries from in-memory store."""
    now = time.time()
    expired = [k for k, v in list(_memory_sessions.items()) if v[0] <= now]
    for k in expired:
        _memory_sessions.pop(k, None)


async def get_session(key: str) -> Optional[object]:
    """Get a session by key. Returns None if not found or expired."""
    r = await _get_session_redis()
    if r:
        data = await r.get(f"sess:{key}")
        if data:
            try:
                obj = json.loads(data)
                # Redis stores JSON dicts — reconstruct SystemState with proper
                # nested model deserialization (BirthInfo, WorkerOutput, etc.)
                if isinstance(obj, dict) and "session_id" in obj and "phase" in obj:
                    from agents.state import SystemState
                    return SystemState.model_validate(obj)
                return obj
            except Exception:
                return None
        return None

    # In-memory fallback — proactively clean expired entries
    await _memory_cleanup()
    entry = _memory_sessions.get(key)
    if entry:
        expire_ts, obj = entry
        if time.time() < expire_ts:
            return obj
        del _memory_sessions[key]
    return None


async def set_session(key: str, obj: object, ttl: int = SESSION_TTL) -> None:
    """Store a session with TTL."""
    r = await _get_session_redis()
    if r:
        try:
            # Use Pydantic model_dump() for SystemState to properly serialize
            # nested models (BirthInfo, WorkerOutput, etc.) as dicts, not strings.
            if hasattr(obj, "model_dump"):
                data = json.dumps(obj.model_dump(), ensure_ascii=False)
            else:
                data = json.dumps(obj, ensure_ascii=False, default=str)
            await r.setex(f"sess:{key}", ttl, data)
        except Exception as e:
            logger.warning("Failed to store session %s: %s", key, e)
        return

    # In-memory fallback
    global _last_cleanup
    now = time.time()
    if now - _last_cleanup > 120:  # Cleanup every 2 min (was 5 min)
        expired = [k for k, v in _memory_sessions.items() if v[0] <= now]
        for k in expired:
            del _memory_sessions[k]
        _last_cleanup = now
    # Evict oldest if at capacity
    if len(_memory_sessions) >= _MEMORY_MAX_SESSIONS:
        try:
            oldest_key = min(_memory_sessions, key=lambda k: _memory_sessions[k][0])
            del _memory_sessions[oldest_key]
        except (ValueError, KeyError):
            pass  # Session was already evicted
    _memory_sessions[key] = (now + ttl, obj)


async def delete_session(key: str) -> None:
    """Delete a session by key."""
    r = await _get_session_redis()
    if r:
        await r.delete(f"sess:{key}")
        return
    _memory_sessions.pop(key, None)


async def get_sessions_batch(keys: list[str]) -> dict[str, object]:
    """Get multiple sessions by keys in one round-trip (Redis mget)."""
    if not keys:
        return {}
    r = await _get_session_redis()
    if r:
        try:
            raw = await r.mget(f"sess:{k}" for k in keys)
            result = {}
            for key, data in zip(keys, raw):
                if data:
                    try:
                        obj = json.loads(data)
                        if isinstance(obj, dict) and "session_id" in obj and "phase" in obj:
                            from agents.state import SystemState
                            obj = SystemState.model_validate(obj)
                        result[key] = obj
                    except Exception:
                        pass
            return result
        except Exception:
            # Fallback to individual gets on mget failure
            pass

    # In-memory fallback
    now = time.time()
    result = {}
    for key in keys:
        entry = _memory_sessions.get(key)
        if entry:
            expire_ts, obj = entry
            if now < expire_ts:
                result[key] = obj
            else:
                del _memory_sessions[key]
    return result


async def session_exists(key: str) -> bool:
    """Check if a session exists (without retrieving it)."""
    r = await _get_session_redis()
    if r:
        return await r.exists(f"sess:{key}") > 0
    entry = _memory_sessions.get(key)
    if entry and time.time() < entry[0]:
        return True
    return False
