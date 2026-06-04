"""
FastAPI dependency for extracting the current user from JWT.
Supports both Bearer token (Authorization header) and httpOnly cookies.
"""

from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select

from auth.jwt import verify_token
from database.session import AsyncSessionLocal, _db_available
from database.models import User

bearer_scheme = HTTPBearer(auto_error=False)

ACCESS_TOKEN_COOKIE = "access_token"


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[User]:
    """
    Extract and validate the current user from JWT.
    Accepts Bearer token (Authorization header) or httpOnly cookie.
    Returns the User ORM object, or None if no valid token is present.
    Use `require_user` below for endpoints that MUST have auth.
    """
    # Try Authorization header first, then fall back to cookie
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    else:
        token = request.cookies.get(ACCESS_TOKEN_COOKIE)

    if not token:
        return None

    # SECURITY: When DB is down, raise 503 so protected endpoints fail closed
    if _db_available is False:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable",
        )
    user_id = await verify_token(token)
    if user_id is None:
        return None
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(User).where(User.id == user_id))
            return result.scalar_one_or_none()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database temporarily unavailable",
        )


async def require_user(
    user: Optional[User] = Depends(get_current_user),
) -> User:
    """Like get_current_user but raises 401 if not authenticated."""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="请先登录",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
