"""
JWT authentication utilities for AlphaMirror.
Uses python-jose for token creation/verification and bcrypt for password hashing.

Token blacklist: Redis-backed when REDIS_URL is configured, otherwise in-memory.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt

from config import get_settings

settings = get_settings()

ALGORITHM = "HS256"

if not settings.REDIS_URL:
    print("[JWT] ⚠️ REDIS_URL 未设置，token 黑名单将使用内存存储（重启后丢失）。")

# ── Token blacklist (auto-selects Redis or in-memory) ────────────────────────

_memory_blacklist: set[str] = set()
_MEMORY_BLACKLIST_MAX = 10000

_BLACKLIST_TTL_DAYS = 31  # refresh tokens expire in 30 days, blacklist for 31


async def is_token_blacklisted(jti: str) -> bool:
    """Check if a token has been revoked. Uses Redis if available."""
    from services.redis_client import _get_redis
    r = await _get_redis()
    if r:
        return await r.exists(f"bl:token:{jti}") > 0
    return jti in _memory_blacklist


async def blacklist_token(jti: str) -> None:
    """Add a token to the blacklist. Uses Redis with TTL if available."""
    from services.redis_client import _get_redis
    r = await _get_redis()
    if r:
        await r.setex(f"bl:token:{jti}", _BLACKLIST_TTL_DAYS * 86400, "1")
        return
    # In-memory fallback with bounded size
    _memory_blacklist.add(jti)
    if len(_memory_blacklist) > _MEMORY_BLACKLIST_MAX:
        _lst = list(_memory_blacklist)
        _memory_blacklist.clear()
        _memory_blacklist.update(_lst[-_MEMORY_BLACKLIST_MAX // 2:])


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token for a user."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {"sub": user_id, "exp": expire, "type": "access"}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Create a long-lived refresh token with unique ID for blacklist support."""
    token_id = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(days=30)
    to_encode = {"sub": user_id, "exp": expire, "type": "refresh", "jti": token_id}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)


async def verify_token(token: str) -> Optional[str]:
    """Verify a JWT token and return the user_id (sub claim). Returns None if invalid."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        # Check blacklist for refresh tokens
        jti = payload.get("jti")
        if jti and await is_token_blacklisted(jti):
            return None
        return user_id
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash."""
    if isinstance(plain_password, str):
        plain_password = plain_password.encode("utf-8")
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode("utf-8")
    return bcrypt.checkpw(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hash a password with bcrypt (truncate to 72 bytes for bcrypt compat)."""
    if isinstance(password, str):
        password = password.encode("utf-8")
    # bcrypt only uses the first 72 bytes of the password
    password = password[:72]
    return bcrypt.hashpw(password, bcrypt.gensalt()).decode("utf-8")
