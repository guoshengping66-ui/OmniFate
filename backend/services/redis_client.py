"""
services/redis_client.py — Shared Redis client with graceful in-memory fallback.

If REDIS_URL is configured, all distributed state (rate limits, session store,
token blacklist) uses Redis.  Otherwise, falls back to in-memory dicts/sets
with per-process isolation.
"""
from __future__ import annotations

import asyncio
import logging
import time
from collections import defaultdict
from typing import Optional

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Redis connection (lazy, shared) ──────────────────────────────────────────
_redis_client = None
_redis_available: Optional[bool] = None  # None = not checked yet
_last_reconnect_attempt: float = 0.0
_RECONNECT_INTERVAL = 300  # Retry connection every 5 minutes if previously failed
_reconnect_lock = asyncio.Lock()


async def _get_redis():
    """Return an async Redis client if REDIS_URL is configured and reachable."""
    global _redis_client, _redis_available, _last_reconnect_attempt
    if _redis_available is False:
        # Periodically retry connection after initial failure
        now = time.time()
        if now - _last_reconnect_attempt < _RECONNECT_INTERVAL:
            return None
        # Fall through to attempt reconnection (lock prevents concurrent attempts)
    if _redis_client is not None:
        return _redis_client
    if not settings.REDIS_URL:
        _redis_available = False
        logger.info("No REDIS_URL configured — using in-memory fallback")
        return None
    async with _reconnect_lock:
        # Double-check after acquiring lock
        if _redis_client is not None:
            return _redis_client
        _last_reconnect_attempt = time.time()
        try:
            import redis.asyncio as aioredis
            client = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=3,
                socket_timeout=3,
            )
            # Quick connectivity check
            await asyncio.wait_for(client.ping(), timeout=3)
            _redis_client = client
            _redis_available = True
            logger.info("Connected to %s", settings.REDIS_URL.split('@')[-1])
            return _redis_client
        except Exception as e:
            _redis_available = False
            # Explicitly close leaked connection on failure
            if 'client' in dir() and client is not None:
                try:
                    await client.close()
                except Exception:
                    pass
            _redis_client = None
            logger.warning("Redis connection failed: %s — using in-memory fallback", e)
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
