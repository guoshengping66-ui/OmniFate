"""Network utilities — shared IP extraction and validation."""
import ipaddress
from fastapi import Request


def get_client_ip(request: Request) -> str:
    """Get client IP from trusted proxy headers.

    Trusts X-Forwarded-For and X-Real-IP when the direct connection is from
    a known proxy (localhost, or defined PROXY_RANGES). Uses X-Forwarded-For
    leftmost address (original client) as the canonical source.
    """
    client_host = request.client.host if request.client else "unknown"

    # Only trust proxy headers when connection is from a known proxy
    _trusted_proxies = {"127.0.0.1", "::1", "localhost"}
    if client_host not in _trusted_proxies:
        return client_host

    # X-Forwarded-For: leftmost address is the original client (RFC 7239)
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        first_ip = forwarded.split(",")[0].strip()
        try:
            ipaddress.ip_address(first_ip)
            return first_ip
        except ValueError:
            pass

    # Fall back to X-Real-IP
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        first_ip = real_ip.split(",")[0].strip()
        try:
            ipaddress.ip_address(first_ip)
            return first_ip
        except ValueError:
            pass

    return client_host
