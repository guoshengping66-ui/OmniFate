"""
services/cache.py — Redis-backed API response cache with in-memory fallback.

Provides a simple get/set/delete interface and a decorator for caching
endpoint responses. Falls back to in-memory LRU when Redis is unavailable.
"""
from __future__ import annotations

import asyncio
import functools
import hashlib
import json
import time
from collections import OrderedDict
from typing import Any, Callable, Optional

from services.redis_client import _get_redis

# ── In-memory fallback ───────────────────────────────────────────────────────
_memory_cache: OrderedDict[str, tuple[float, str]] = OrderedDict()
_MEMORY_MAX = 500  # max entries


def _memory_get(key: str) -> Optional[str]:
    entry = _memory_cache.get(key)
    if entry is None:
        return None
    expire_at, value = entry
    if time.time() > expire_at:
        _memory_cache.pop(key, None)
        return None
    _memory_cache.move_to_end(key)
    return value


def _memory_set(key: str, value: str, ttl: int):
    _memory_cache[key] = (time.time() + ttl, value)
    _memory_cache.move_to_end(key)
    while len(_memory_cache) > _MEMORY_MAX:
        _memory_cache.popitem(last=False)


def _memory_delete(key: str):
    _memory_cache.pop(key, None)


# ── Public API ───────────────────────────────────────────────────────────────

async def cache_get(key: str) -> Optional[str]:
    """Get a cached string value by key. Returns None if miss or expired."""
    r = await _get_redis()
    if r:
        try:
            return await r.get(f"cache:{key}")
        except Exception:
            return None
    return _memory_get(key)


async def cache_set(key: str, value: str, ttl: int = 300):
    """Set a cached string value with TTL in seconds."""
    r = await _get_redis()
    if r:
        try:
            await r.set(f"cache:{key}", value, ex=ttl)
        except Exception:
            pass
    else:
        _memory_set(key, value, ttl)


async def cache_delete(key: str):
    """Delete a cached key."""
    r = await _get_redis()
    if r:
        try:
            await r.delete(f"cache:{key}")
        except Exception:
            pass
    else:
        _memory_delete(key)


async def cache_delete_pattern(pattern: str):
    """Delete all keys matching a glob pattern (Redis only)."""
    r = await _get_redis()
    if r:
        try:
            cursor = 0
            while True:
                cursor, keys = await r.scan(cursor, match=f"cache:{pattern}", count=100)
                if keys:
                    await r.delete(*keys)
                if cursor == 0:
                    break
        except Exception:
            pass


# ── JSON cache helpers ───────────────────────────────────────────────────────

async def cache_get_json(key: str) -> Optional[Any]:
    """Get a cached JSON value."""
    raw = await cache_get(key)
    if raw:
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return None
    return None


async def cache_set_json(key: str, value: Any, ttl: int = 300):
    """Set a cached JSON value with TTL."""
    try:
        await cache_set(key, json.dumps(value, ensure_ascii=False, default=str), ttl=ttl)
    except (TypeError, ValueError):
        pass


# ── Decorator for caching endpoint responses ─────────────────────────────────

def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator that caches an async endpoint's return value.

    Usage:
        @cached(ttl=600, key_prefix="products")
        async def get_products():
            ...

    The cache key is derived from the function name + arguments.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key from function name + args (skip db/self/first positional)
            key_parts = [key_prefix or func.__name__]
            for arg in args[1:]:  # skip 'self' or 'db'
                if hasattr(arg, 'model_dump'):
                    key_parts.append(str(hash(arg.model_dump_json())))
                elif isinstance(arg, (str, int, float, bool)):
                    key_parts.append(str(arg))
            for k, v in sorted(kwargs.items()):
                if k in ("db", "request", "current_user"):
                    continue
                if isinstance(v, (str, int, float, bool)):
                    key_parts.append(f"{k}={v}")
            cache_key = hashlib.md5(":".join(key_parts).encode()).hexdigest()

            # Try cache
            cached_val = await cache_get_json(cache_key)
            if cached_val is not None:
                return cached_val

            # Execute and cache
            result = await func(*args, **kwargs)
            if result is not None:
                if hasattr(result, 'model_dump'):
                    await cache_set_json(cache_key, result.model_dump(), ttl=ttl)
                elif isinstance(result, dict):
                    await cache_set_json(cache_key, result, ttl=ttl)
                elif isinstance(result, list):
                    await cache_set_json(cache_key, result, ttl=ttl)
            return result
        return wrapper
    return decorator
