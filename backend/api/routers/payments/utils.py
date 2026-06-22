"""Payment utility functions."""

import ipaddress
from fastapi import HTTPException, Request

from .constants import ALLOWED_METHODS, _admin_emails_cached


def get_client_region(request: Request) -> str:
    """
    Get user's region using server-side detection (defense-in-depth).
    Priority: CF-IPCountry header > Accept-Language > client cookie > default overseas.
    """
    # 1. Cloudflare's CF-IPCountry header (only trust when CF-Ray present = verified CF request)
    cf_ray = request.headers.get("cf-ray", "")
    cf_country = request.headers.get("cf-ipcountry", "").upper()
    if cf_country and cf_ray:
        # China mainland countries
        if cf_country in ("CN", "HK", "MO", "TW"):
            return "domestic"
        return "overseas"

    # 2. Accept-Language header heuristic
    accept_lang = request.headers.get("accept-language", "")
    if accept_lang.startswith("zh"):
        # Check if it's specifically zh-CN (mainland)
        if "zh-CN" in accept_lang or "zh_CN" in accept_lang:
            return "domestic"
        # Other zh variants (zh-TW, zh-HK) are still domestic for payment
        return "domestic"

    # 3. Client IP geolocation fallback (basic)
    client_ip = request.client.host if request.client else ""
    if client_ip:
        try:
            ip = ipaddress.ip_address(client_ip)
            # Private IPs are likely domestic
            if ip.is_private or ip.is_loopback:
                return "domestic"
        except ValueError:
            pass

    # 4. Fall back to cookie (least reliable, can be forged)
    region = request.cookies.get("region", "overseas")
    return region if region in ("domestic", "overseas") else "overseas"


def validate_payment_region(request: Request, payment_method: str):
    """Validate that the payment method matches the user's detected region.
    Raises HTTP 403 if cross-region payment is attempted.
    """
    region = get_client_region(request)
    allowed = ALLOWED_METHODS.get(region, set())
    if payment_method not in allowed:
        raise HTTPException(
            status_code=403,
            detail="Payment method not available for your region",
        )


def is_effective_founder(user) -> bool:
    """Check if user is effectively a founder (DB flag or admin auto-upgrade)."""
    return user.is_founder or user.email.lower() in _admin_emails_cached
