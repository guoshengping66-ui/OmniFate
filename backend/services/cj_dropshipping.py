"""
CJ Dropshipping API service.
Docs: https://developers.cjdropshipping.com/
"""
import logging
import time
from typing import Optional

import httpx
from config import get_settings

logger = logging.getLogger(__name__)

BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1"

# ── Token cache (module-level) ──────────────────────────────────────────────
_token: Optional[str] = None
_token_expires: float = 0
_refresh_token: Optional[str] = None


async def _ensure_token() -> str:
    """Get or refresh the CJ access token."""
    global _token, _token_expires, _refresh_token

    settings = get_settings()
    if not settings.CJ_API_ENABLED:
        raise RuntimeError("CJ API is not enabled (CJ_API_ENABLED=false)")

    now = time.time()

    # Token still valid (with 5-min buffer)
    if _token and now < _token_expires - 300:
        return _token

    # Try refresh if we have a refresh token
    if _refresh_token and now < _token_expires + 86400 * 30:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{BASE_URL}/authentication/refreshAccessToken",
                    json={"refreshToken": _refresh_token},
                )
                data = resp.json()
                if data.get("code") == 200 and data.get("result"):
                    result = data["result"]
                    _token = result["accessToken"]
                    _token_expires = _parse_iso(result.get("accessTokenExpiryDate", ""))
                    _refresh_token = result.get("refreshToken", _refresh_token)
                    logger.info("[CJ] Token refreshed successfully")
                    return _token
        except Exception as e:
            logger.warning(f"[CJ] Token refresh failed: {e}")

    # Fresh login
    if not settings.CJ_API_EMAIL or not settings.CJ_API_PASSWORD:
        raise RuntimeError("CJ API credentials not configured (CJ_API_EMAIL / CJ_API_PASSWORD)")

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{BASE_URL}/authentication/getAccessToken",
            json={"email": settings.CJ_API_EMAIL, "password": settings.CJ_API_PASSWORD},
        )
        data = resp.json()
        if data.get("code") != 200 or not data.get("result"):
            raise RuntimeError(f"CJ auth failed: {data.get('message', 'unknown error')}")

        result = data["result"]
        _token = result["accessToken"]
        _token_expires = _parse_iso(result.get("accessTokenExpiryDate", ""))
        _refresh_token = result.get("refreshToken")
        logger.info("[CJ] Access token obtained")
        return _token


def _parse_iso(iso_str: str) -> float:
    """Parse ISO datetime to timestamp. Returns 0 on failure."""
    if not iso_str:
        return 0
    try:
        from datetime import datetime, timezone
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.timestamp()
    except Exception:
        return 0


async def _cj_request(method: str, path: str, **kwargs) -> dict:
    """Make an authenticated request to CJ API."""
    token = await _ensure_token()
    headers = {"CJ-Access-Token": token, **kwargs.pop("headers", {})}

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.request(method, f"{BASE_URL}{path}", headers=headers, **kwargs)
        data = resp.json()

    code = data.get("code")
    if code != 200:
        logger.error(f"[CJ] API error on {method} {path}: code={code} msg={data.get('message')}")
        raise RuntimeError(f"CJ API error: {data.get('message', f'code={code}')}")

    return data


# ── Public API functions ────────────────────────────────────────────────────

async def create_order(order_data: dict) -> dict:
    """
    Push an order to CJ for fulfillment.
    order_data: {
        "orderNumber": "ORD...",
        "shippingMethod": "CJPacket Ordinary",
        "shippingCountry": "US",
        "shippingProvince": "California",
        "shippingCity": "Los Angeles",
        "shippingAddress": "123 Main St",
        "shippingZipCode": "90001",
        "shippingPhone": "+1234567890",
        "shippingName": "John Doe",
        "recipientEmail": "john@example.com",
        "products": [{"vid": "VARIANT_ID", "quantity": 1}]
    }
    """
    logger.info(f"[CJ] Creating order: {order_data.get('orderNumber')}")
    result = await _cj_request("POST", "/order/open/createOrder", json=order_data)
    logger.info(f"[CJ] Order created: {result.get('data', {})}")
    return result


async def get_order_status(cj_order_numbers: list[str]) -> dict:
    """Query CJ order status by order numbers."""
    result = await _cj_request("POST", "/order/list", json={
        "orderNumberList": cj_order_numbers,
    })
    return result


async def get_tracking(order_number: str = None, tracking_code: str = None) -> dict:
    """Query logistics tracking."""
    params = {}
    if order_number:
        params["orderNumber"] = order_number
    if tracking_code:
        params["trackingCode"] = tracking_code

    result = await _cj_request("GET", "/logistic/trace", params=params)
    return result


async def search_product(keyword: str, page_num: int = 1, page_size: int = 20) -> dict:
    """Search CJ product catalog."""
    result = await _cj_request("POST", "/product/list", json={
        "productNameEn": keyword,
        "pageNum": page_num,
        "pageSize": page_size,
    })
    return result


async def get_shipping_methods(country_code: str, variant_ids: list[dict]) -> dict:
    """
    Calculate shipping methods and costs.
    variant_ids: [{"vid": "VARIANT_ID", "quantity": 1}]
    """
    result = await _cj_request("POST", "/logistic/freightCalculate", json={
        "startCountryCode": "CN",
        "endCountryCode": country_code,
        "products": variant_ids,
    })
    return result


def is_enabled() -> bool:
    """Check if CJ integration is configured."""
    settings = get_settings()
    return settings.CJ_API_ENABLED and bool(settings.CJ_API_EMAIL)
