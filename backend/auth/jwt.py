"""
JWT authentication utilities for AlphaMirror.
Uses python-jose for token creation/verification and bcrypt for password hashing.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt

from config import get_settings

settings = get_settings()

ALGORITHM = "HS256"

# ── Refresh Token Blacklist ───────────────────────────────────────────────────
# In-memory blacklist for revoked refresh tokens.
# Production: migrate to Redis for distributed support.
_refresh_blacklist: set[str] = set()


def is_token_blacklisted(jti: str) -> bool:
    """Check if a token has been revoked."""
    return jti in _refresh_blacklist


def blacklist_token(jti: str) -> None:
    """Add a token to the blacklist (called on logout/password change)."""
    _refresh_blacklist.add(jti)
    # Prevent unbounded growth: keep only last 10k entries
    if len(_refresh_blacklist) > 10000:
        # In production with Redis, use TTL-based expiry instead
        _blacklist_list = list(_refresh_blacklist)
        _refresh_blacklist.clear()
        _refresh_blacklist.update(_blacklist_list[-5000:])


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


def verify_token(token: str) -> Optional[str]:
    """Verify a JWT token and return the user_id (sub claim). Returns None if invalid."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        # Check blacklist for refresh tokens
        jti = payload.get("jti")
        if jti and is_token_blacklisted(jti):
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
