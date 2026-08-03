"""Paddle API and webhook primitives.

The signature check is deliberately kept independent from HTTP handlers so all
webhook processing uses the exact raw request body Paddle signed.
"""

from __future__ import annotations

import hashlib
import hmac
import time


def verify_webhook_signature(
    payload: bytes,
    signature_header: str,
    secret: str,
    *,
    now: int | None = None,
    tolerance_seconds: int = 300,
) -> bool:
    """Validate Paddle's ``ts``/``h1`` HMAC header with replay protection."""
    if not payload or not signature_header or not secret:
        return False

    parts: dict[str, list[str]] = {}
    for part in signature_header.split(";"):
        key, separator, value = part.strip().partition("=")
        if separator and key and value:
            parts.setdefault(key, []).append(value)

    timestamps = parts.get("ts", [])
    signatures = parts.get("h1", [])
    if len(timestamps) != 1 or not signatures:
        return False

    try:
        timestamp = int(timestamps[0])
    except ValueError:
        return False

    current_time = int(time.time()) if now is None else now
    if abs(current_time - timestamp) > tolerance_seconds:
        return False

    signed_payload = f"{timestamp}:".encode("utf-8") + payload
    expected = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return any(hmac.compare_digest(expected, supplied) for supplied in signatures)
