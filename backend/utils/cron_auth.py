"""Shared CRON_SECRET verification for cron-triggered and admin endpoints."""
import hmac
from typing import Optional

from fastapi import Header, HTTPException

from config import get_settings


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
