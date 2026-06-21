"""
services/rate_limiter.py — Redis-backed sliding window rate limiter.

Uses Redis sorted sets for precise sliding window counting.
Falls back to in-memory dicts when Redis is unavailable.
NOTE: In-memory fallback is PER-WORKER — limits are shared only with Redis.
"""
from __future__ import annotations

import logging
import multiprocessing
import time
from collections import defaultdict
from typing import Optional

from services.redis_client import _get_redis

logger = logging.getLogger(__name__)

# ── In-memory fallback ───────────────────────────────────────────────────────
_memory_store: dict[str, list[float]] = defaultdict(list)
_last_cleanup: float = 0.0
CLEANUP_INTERVAL = 600  # purge stale entries every 10 min
_MEMORY_MAX_ENTRIES = 10000
_warned_multi_worker = False


async def check_rate_limit(
    key: str,
    limit: int,
    window: int = 60,
) -> bool:
    """
    Check if `key` has exceeded `limit` requests within `window` seconds.
    Returns True if rate limit is EXCEEDED.
    """
    global _warned_multi_worker
    r = await _get_redis()
    if r:
        return await _check_redis(r, key, limit, window)
    # Warn once on first fallback if multiple workers detected
    if not _warned_multi_worker:
        workers = multiprocessing.cpu_count()
        if workers > 1:
            logger.warning(
                "Rate limiter using in-memory fallback with %d CPU cores — "
                "limits are PER-WORKER and will not be shared. Configure REDIS_URL for production.",
                workers,
            )
        _warned_multi_worker = True
    return _check_memory(key, limit, window)


async def _check_redis(r, key: str, limit: int, window: int) -> bool:
    """Redis sliding window using sorted sets — atomic add-then-count to prevent TOCTOU race."""
    now = time.time()
    redis_key = f"rl:{key}"
    # Atomic: add the request first, then check count. If over limit, remove it.
    pipe = r.pipeline()
    pipe.zremrangebyscore(redis_key, 0, now - window)  # Remove expired entries
    pipe.zadd(redis_key, {str(now): now})               # Add this request
    pipe.zcard(redis_key)                                # Count AFTER adding
    pipe.expire(redis_key, window + 10)                  # Auto-cleanup
    results = await pipe.execute()
    count = results[2]  # count after adding
    if count > limit:
        # Over limit — remove the just-added entry
        pipe2 = r.pipeline()
        pipe2.zrem(redis_key, str(now))
        await pipe2.execute()
        return True
    return False


def _check_memory(key: str, limit: int, window: int) -> bool:
    """In-memory sliding window with periodic cleanup."""
    global _last_cleanup
    now = time.time()

    # Aggressive cleanup when approaching capacity
    if len(_memory_store) > _MEMORY_MAX_ENTRIES * 0.9:
        stale = [k for k, v in _memory_store.items() if not v or v[-1] <= now - window]
        for k in stale:
            del _memory_store[k]

    # Hard cap: reject new entries if at max capacity
    if len(_memory_store) >= _MEMORY_MAX_ENTRIES and key not in _memory_store:
        return True  # Rate limit to protect memory

    # Periodic cleanup
    if now - _last_cleanup > CLEANUP_INTERVAL:
        stale = [k for k, v in _memory_store.items() if not v or v[-1] <= now - window]
        for k in stale:
            del _memory_store[k]
        _last_cleanup = now

    # Clean old entries for this key
    _memory_store[key] = [t for t in _memory_store[key] if t > now - window]
    if len(_memory_store[key]) >= limit:
        return True
    _memory_store[key].append(now)
    return False
