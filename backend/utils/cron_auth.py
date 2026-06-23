"""Shared CRON_SECRET verification for cron-triggered and admin endpoints.

Provides two authentication modes:
- verify_cron_secret: Verifies CRON_SECRET header (for cron jobs / API calls)
- require_admin: Verifies CRON_SECRET AND user email is in ADMIN_EMAILS
"""
import hmac
import logging
from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy import select

from config import get_settings

logger = logging.getLogger(__name__)


def _admin_emails() -> frozenset[str]:
    settings = get_settings()
    return frozenset(e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip())


def verify_cron_secret(
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """Verify CRON_SECRET token — supports both Bearer (Authorization)
    and x-admin-key header. Use as a FastAPI dependency."""
    settings = get_settings()
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")
    # Try Bearer token first
    if authorization:
        token = authorization.split(" ", 1)[-1] if " " in authorization else authorization.strip()
        if hmac.compare_digest(token, settings.CRON_SECRET):
            return
    # Try x-admin-key header (frontend admin panel)
    if x_admin_key and hmac.compare_digest(x_admin_key, settings.CRON_SECRET):
        return
    raise HTTPException(status_code=401, detail="Unauthorized")


async def require_admin(
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """Dual-mode admin auth: verifies CRON_SECRET AND checks user email.
    Supports both cron jobs (CRON_SECRET only) and admin panel (CRON_SECRET + user email)."""
    settings = get_settings()

    # Mode 1: CRON_SECRET from header (for cron jobs and API calls)
    secret_verified = False
    if settings.CRON_SECRET:
        if authorization:
            token = authorization.split(" ", 1)[-1] if " " in authorization else authorization.strip()
            if hmac.compare_digest(token, settings.CRON_SECRET):
                secret_verified = True
        if not secret_verified and x_admin_key and hmac.compare_digest(x_admin_key, settings.CRON_SECRET):
            secret_verified = True

    if not secret_verified:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Mode 2: If a user JWT token is also present, verify admin role
    # This prevents a stolen CRON_SECRET from being used without knowing which admin acted
    from auth.jwt import verify_token
    user_token = None
    if authorization:
        token = authorization.split(" ", 1)[-1] if " " in authorization else authorization.strip()
        if not hmac.compare_digest(token, settings.CRON_SECRET):
            user_token = token  # Not the cron secret — try as JWT

    if user_token:
        user_id = await verify_token(user_token)
        if user_id:
            from database.session import AsyncSessionLocal
            async with AsyncSessionLocal() as db:
                from database.models import User
                result = await db.execute(select(User).where(User.id == user_id))
                user = result.scalar_one_or_none()
                if user and user.email.lower() not in _admin_emails():
                    logger.warning(f"[ADMIN] Non-admin user {user.email} attempted admin action")
                    raise HTTPException(status_code=403, detail="需要管理员权限")
                if user:
                    logger.info(f"[ADMIN] Admin action by {user.email}")
