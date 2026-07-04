"""Shared authentication helpers for cron and admin endpoints."""

import hmac
import logging
from typing import Optional

from fastapi import Header, HTTPException, Request
from sqlalchemy import select

from config import get_settings

logger = logging.getLogger(__name__)


def _admin_emails() -> frozenset[str]:
    settings = get_settings()
    return frozenset(e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip())


def _extract_bearer_or_raw(value: Optional[str]) -> str:
    if not value:
        return ""
    return value.split(" ", 1)[-1].strip() if " " in value else value.strip()


def verify_cron_secret(
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """Verify CRON_SECRET for machine-triggered cron jobs."""
    settings = get_settings()
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")

    auth_token = _extract_bearer_or_raw(authorization)
    if auth_token and hmac.compare_digest(auth_token, settings.CRON_SECRET):
        return
    if x_admin_key and hmac.compare_digest(x_admin_key, settings.CRON_SECRET):
        return
    raise HTTPException(status_code=401, detail="Unauthorized")


async def require_admin(
    request: Request,
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """Require both admin key AND a logged-in admin user session.

    Two-step verification:
    1. X-Admin-Key header OR Authorization header must match CRON_SECRET
    2. A valid admin JWT must be present in either Authorization header
       (when it's NOT the cron secret) or the access_token cookie

    For machine-to-machine cron endpoints, use verify_cron_secret() instead.
    """
    settings = get_settings()
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")

    auth_token = _extract_bearer_or_raw(authorization)
    secret_verified = (
        bool(auth_token and hmac.compare_digest(auth_token, settings.CRON_SECRET))
        or bool(x_admin_key and hmac.compare_digest(x_admin_key, settings.CRON_SECRET))
    )
    if not secret_verified:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_token = ""
    if auth_token and not hmac.compare_digest(auth_token, settings.CRON_SECRET):
        user_token = auth_token
    if not user_token:
        user_token = request.cookies.get("access_token", "")
    if not user_token:
        raise HTTPException(status_code=401, detail="Admin login required")

    from auth.jwt import verify_token

    user_id = await verify_token(user_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid admin session")

    from database.session import AsyncSessionLocal
    from database.models import User

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or user.email.lower() not in _admin_emails():
            if user:
                logger.warning("[ADMIN] Non-admin user %s attempted admin action", user.email)
            raise HTTPException(status_code=403, detail="需要管理员权限")
        logger.info("[ADMIN] Admin action by %s", user.email)
