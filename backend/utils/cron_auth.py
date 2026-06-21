"""Shared CRON_SECRET verification for cron-triggered endpoints."""
import hmac

from fastapi import Header, HTTPException

from config import get_settings


def verify_cron_secret(authorization: str = Header(None)):
    """Verify CRON_SECRET token — use as a FastAPI dependency."""
    settings = get_settings()
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.split(" ", 1)[-1] if " " in authorization else authorization.strip()
    if not hmac.compare_digest(token, settings.CRON_SECRET):
        raise HTTPException(status_code=403, detail="Invalid cron secret")
