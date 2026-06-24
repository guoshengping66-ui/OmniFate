"""Network utilities — shared IP extraction and validation."""
import ipaddress
from fastapi import Request


def get_client_ip(request: Request) -> str:
    """Get client IP from trusted sources only.

    Only trusts X-Real-IP when the direct connection is from localhost
    (i.e., we're behind our Nginx proxy). This prevents attackers from
    spoofing IP addresses to bypass rate limits.
    """
    client_host = request.client.host if request.client else "unknown"
    if client_host in ("127.0.0.1", "::1", "localhost"):
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            try:
                ipaddress.ip_address(real_ip.split(",")[0].strip())
                return real_ip.split(",")[0].strip()
            except ValueError:
                pass
    return client_host
