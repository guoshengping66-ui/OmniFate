"""
services/rate_limiter.py — Redis-backed sliding window rate limiter.

Uses Redis sorted sets for precise sliding window counting.
Falls back to in-memory dicts when Redis is unavailable.
"""
from __future__ import annotations

import time
from collections import defaultdict
from typing import Optional

from services.redis_client import _get_redis

# ── In-memory fallback ───────────────────────────────────────────────────────
_memory_store: dict[str, list[float]] = defaultdict(list)
_last_cleanup: float = 0.0
CLEANUP_INTERVAL = 600  # purge stale entries every 10 min


async def check_rate_limit(
    key: str,
    limit: int,
    window: int = 60,
) -> bool:
    """
    Check if `key` has exceeded `limit` requests within `window` seconds.
    Returns True if rate limit is EXCEEDED.
    """
    r = await _get_redis()
    if r:
        return await _check_redis(r, key, limit, window)
    return _check_memory(key, limit, window)


async def _check_redis(r, key: str, limit: int, window: int) -> bool:
    """Redis sliding window using sorted sets — count before adding for accuracy."""
    now = time.time()
    redis_key = f"rl:{key}"
    pipe = r.pipeline()
    pipe.zremrangebyscore(redis_key, 0, now - window)  # Remove expired entries
    pipe.zcard(redis_key)                                # Count BEFORE adding
    pipe.expire(redis_key, window + 10)                  # Auto-cleanup
    results = await pipe.execute()
    count = results[1]
    if count >= limit:
        return True  # Rate limit exceeded — don't add this request
    # Only add if under limit
    pipe2 = r.pipeline()
    pipe2.zadd(redis_key, {str(now): now})
    pipe2.expire(redis_key, window + 10)
    await pipe2.execute()
    return False


def _check_memory(key: str, limit: int, window: int) -> bool:
    """In-memory sliding window with periodic cleanup."""
    global _last_cleanup
    now = time.time()

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
