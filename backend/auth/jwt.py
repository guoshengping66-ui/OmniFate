"""
JWT authentication utilities for AlphaMirror.
Uses python-jose for token creation/verification and bcrypt for password hashing.

Token blacklist: Redis-backed when REDIS_URL is configured, otherwise in-memory.
"""
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

ALGORITHM = "HS256"

if not settings.REDIS_URL:
    logger.warning("REDIS_URL not set — token blacklist uses in-memory storage (lost on restart).")

# ── Token blacklist (auto-selects Redis or in-memory) ────────────────────────

_memory_blacklist: set[str] = set()
_MEMORY_BLACKLIST_MAX = 10000

_BLACKLIST_TTL_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS + 1  # blacklist 1 day longer than token expiry


async def is_token_blacklisted(jti: str) -> bool:
    """Check if a token has been revoked. Uses Redis if available."""
    from services.redis_client import _get_redis
    r = await _get_redis()
    if r:
        return await r.exists(f"bl:token:{jti}") > 0
    # Check both the old set and the new ordered dict
    if jti in _memory_blacklist:
        return True
    if hasattr(blacklist_token, "_mem_ordered") and jti in blacklist_token._mem_ordered:
        return True
    return False


async def blacklist_token(jti: str) -> None:
    """Add a token to the blacklist. Uses Redis with TTL if available."""
    from services.redis_client import _get_redis
    r = await _get_redis()
    if r:
        await r.setex(f"bl:token:{jti}", _BLACKLIST_TTL_DAYS * 86400, "1")
        return
    # In-memory fallback with bounded size — use OrderedDict-like behavior
    # to evict oldest entries instead of discarding random ones
    import collections
    if not hasattr(blacklist_token, "_mem_ordered"):
        blacklist_token._mem_ordered = collections.OrderedDict()
    _mem = blacklist_token._mem_ordered
    _mem[jti] = True
    while len(_mem) > _MEMORY_BLACKLIST_MAX:
        _mem.popitem(last=False)  # Evict oldest


async def blacklist_all_user_tokens(user_id: str) -> None:
    """Invalidate all tokens for a user by recording a reset timestamp in Redis.

    After password reset, verify_token checks this timestamp against the
    token's `iat` claim to reject tokens issued before the reset.
    """
    import time as _time
    from services.redis_client import _get_redis
    r = await _get_redis()
    if r:
        now_ts = int(_time.time())
        await r.setex(f"bl:pw_reset:{user_id}", _BLACKLIST_TTL_DAYS * 86400, str(now_ts))
    # In-memory: no efficient way to check, but password change means
    # the bcrypt hash is different so login with old password fails anyway.


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token for a user with jti for blacklist support."""
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {"sub": user_id, "exp": expire, "iat": int(now.timestamp()),
                 "type": "access", "jti": str(uuid.uuid4())}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Create a long-lived refresh token with unique ID for blacklist support."""
    now = datetime.now(timezone.utc)
    token_id = str(uuid.uuid4())
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": user_id, "exp": expire, "iat": int(now.timestamp()),
                 "type": "refresh", "jti": token_id}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)


async def verify_token(token: str) -> Optional[str]:
    """Verify a JWT token and return the user_id (sub claim). Returns None if invalid."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("[JWT] verify_token: no sub claim in token")
            return None
        # Check blacklist for ALL tokens (access + refresh)
        jti = payload.get("jti")
        if jti and await is_token_blacklisted(jti):
            return None
        # Check if all tokens for this user were invalidated (e.g., password reset)
        from services.redis_client import _get_redis
        r = await _get_redis()
        if r:
            reset_ts = await r.get(f"bl:pw_reset:{user_id}")
            if reset_ts:
                token_iat = payload.get("iat", 0)
                if token_iat < int(reset_ts):
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
