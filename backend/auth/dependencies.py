"""
FastAPI dependency for extracting the current user from JWT.
Supports both Bearer token (Authorization header) and httpOnly cookies.
"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select

from auth.jwt import verify_token
from database.session import AsyncSessionLocal, _db_available
from database.models import User

logger = logging.getLogger("auth")

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

    # DEBUG: Log cookie state for auth diagnosis (temporary)
    path = request.url.path
    has_cookie = bool(request.cookies.get(ACCESS_TOKEN_COOKIE))
    has_refresh = bool(request.cookies.get("refresh_token"))
    cookie_names = list(request.cookies.keys())
    logger.info(
        "[AUTH] %s %s — has_access=%s has_refresh=%s cookie_names=%s token_source=%s",
        request.method, path, has_cookie, has_refresh, cookie_names,
        "header" if (credentials and credentials.credentials) else "cookie",
    )

    if not token:
        logger.warning("[AUTH] %s %s — NO TOKEN FOUND (cookie=%s, header=%s)",
                       request.method, path, has_cookie, bool(credentials and credentials.credentials))
        return None

    # SECURITY: When DB is down, raise 503 so protected endpoints fail closed
    if _db_available is False:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable",
        )
    user_id = await verify_token(token)
    if user_id is None:
        logger.warning("[AUTH] %s %s — TOKEN INVALID (user_id=None)", request.method, path)
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
    request: Request,
    user: Optional[User] = Depends(get_current_user),
) -> User:
    """Like get_current_user but raises 401 if not authenticated."""
    if user is None:
        lang = request.query_params.get("lang", "zh")
        msg = "Please log in first" if lang == "en" else "请先登录"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=msg,
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
