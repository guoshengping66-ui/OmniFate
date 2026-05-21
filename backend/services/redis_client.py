"""
services/redis_client.py — Shared Redis client with graceful in-memory fallback.

If REDIS_URL is configured, all distributed state (rate limits, session store,
token blacklist) uses Redis.  Otherwise, falls back to in-memory dicts/sets
with per-process isolation.
"""
from __future__ import annotations

import asyncio
import time
from collections import defaultdict
from typing import Optional

from config import get_settings

settings = get_settings()

# ── Redis connection (lazy, shared) ──────────────────────────────────────────
_redis_client = None
_redis_available: Optional[bool] = None  # None = not checked yet


async def _get_redis():
    """Return an async Redis client if REDIS_URL is configured and reachable."""
    global _redis_client, _redis_available
    if _redis_available is False:
        return None
    if _redis_client is not None:
        return _redis_client
    if not settings.REDIS_URL:
        _redis_available = False
        print("[REDIS] No REDIS_URL configured — using in-memory fallback")
        return None
    try:
        import redis.asyncio as aioredis
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=3,
        )
        # Quick connectivity check
        await asyncio.wait_for(_redis_client.ping(), timeout=3)
        _redis_available = True
        print(f"[REDIS] Connected to {settings.REDIS_URL.split('@')[-1]}")
        return _redis_client
    except Exception as e:
        _redis_available = False
        _redis_client = None
        print(f"[REDIS] Connection failed: {e} — using in-memory fallback")
        return None


async def redis_available() -> bool:
    """Check if Redis is available (cached)."""
    global _redis_available
    if _redis_available is None:
        await _get_redis()
    return _redis_available is True


# ── In-memory fallback stores ────────────────────────────────────────────────
# These are used when Redis is unavailable.  They are per-process only,
# so they don't work with multiple workers/instances.

# Token blacklist
_memory_blacklist: set[str] = set()

# Rate limiting
_memory_rate_store: dict[str, list[float]] = defaultdict(list)

# Session store
_memory_sessions: dict[str, tuple[float, object]] = {}  # key -> (expire_ts, value)
