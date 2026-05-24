"""
services/session_store.py — Redis-backed analysis session store.

Replaces the in-memory `_sessions` dict in readings.py.
Supports distributed session storage across multiple worker processes.
Falls back to in-memory dict when Redis is unavailable.

NOTE: Session data is stored as pickle (binary). We must NOT use
decode_responses=True on the Redis connection, otherwise hiredis will
try to decode binary pickle data as UTF-8 and throw UnicodeDecodeError.
"""
from __future__ import annotations

import pickle
import time
from typing import Optional

import redis.asyncio as aioredis

from config import get_settings

SESSION_TTL = 3600 * 2  # 2 hours

# ── Binary Redis client (for pickle-serialized session data) ──────────────────
_session_redis = None
_session_redis_available: Optional[bool] = None  # None = not checked yet


async def _get_session_redis():
    """Return a Redis client with decode_responses=False for binary data."""
    global _session_redis, _session_redis_available
    if _session_redis_available is False:
        return None
    if _session_redis is not None:
        return _session_redis
    settings = get_settings()
    if not settings.REDIS_URL:
        _session_redis_available = False
        return None
    try:
        _session_redis = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=False,  # Binary mode — pickle data is NOT UTF-8
            socket_connect_timeout=3,
            socket_timeout=3,
        )
        await _session_redis.ping()
        _session_redis_available = True
        return _session_redis
    except Exception as e:
        _session_redis_available = False
        _session_redis = None
        print(f"[SESSION-REDIS] Connection failed: {e}")
        return None


# ── In-memory fallback ───────────────────────────────────────────────────────
_memory_sessions: dict[str, tuple[float, object]] = {}  # key -> (expire_ts, pickled_obj)
_last_cleanup: float = 0.0


async def get_session(key: str) -> Optional[object]:
    """Get a session by key. Returns None if not found or expired."""
    r = await _get_session_redis()
    if r:
        data = await r.get(f"sess:{key}")
        if data:
            try:
                return pickle.loads(data)
            except Exception:
                return None
        return None

    # In-memory fallback
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
            data = pickle.dumps(obj)
            await r.setex(f"sess:{key}", ttl, data)
        except Exception as e:
            print(f"[SESSION-REDIS] Failed to store session {key}: {e}")
        return

    # In-memory fallback
    global _last_cleanup
    now = time.time()
    if now - _last_cleanup > 300:
        expired = [k for k, v in _memory_sessions.items() if v[0] <= now]
        for k in expired:
            del _memory_sessions[k]
        _last_cleanup = now
    _memory_sessions[key] = (now + ttl, obj)


async def delete_session(key: str) -> None:
    """Delete a session by key."""
    r = await _get_session_redis()
    if r:
        await r.delete(f"sess:{key}")
        return
    _memory_sessions.pop(key, None)


async def session_exists(key: str) -> bool:
    """Check if a session exists (without retrieving it)."""
    r = await _get_session_redis()
    if r:
        return await r.exists(f"sess:{key}") > 0
    entry = _memory_sessions.get(key)
    if entry and time.time() < entry[0]:
        return True
    return False
