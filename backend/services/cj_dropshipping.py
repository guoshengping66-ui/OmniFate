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
    """Get or refresh the CJ access token.

    CJ API 2.0 auth flow (per official docs):
      POST /authentication/getAccessToken  {"apiKey": "CJxxxx@api@xxxx"}
      → returns accessToken + refreshToken
      Use accessToken in CJ-Access-Token header for subsequent calls.
    """
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
                    payload = data.get("data", {})
                    _token = payload.get("accessToken", "")
                    _token_expires = _parse_iso(payload.get("accessTokenExpiryDate", ""))
                    _refresh_token = payload.get("refreshToken", _refresh_token)
                    logger.info("[CJ] Token refreshed successfully")
                    return _token
        except Exception as e:
            logger.warning(f"[CJ] Token refresh failed: {e}")

    # Fresh auth: prefer apiKey (recommended by CJ docs), fallback to email+password
    if not settings.CJ_API_KEY and not settings.CJ_API_EMAIL:
        raise RuntimeError("CJ API credentials not configured (set CJ_API_KEY in .env)")

    # Build auth payload — apiKey is the recommended method per CJ docs
    auth_payload = {}
    if settings.CJ_API_KEY:
        auth_payload = {"apiKey": settings.CJ_API_KEY}
    elif settings.CJ_API_EMAIL and settings.CJ_API_PASSWORD:
        auth_payload = {"email": settings.CJ_API_EMAIL, "password": settings.CJ_API_PASSWORD}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{BASE_URL}/authentication/getAccessToken",
            json=auth_payload,
        )
        data = resp.json()
        logger.info(f"[CJ] Auth response code={data.get('code')} msg={data.get('message')}")
        if data.get("code") != 200 or not data.get("result"):
            raise RuntimeError(f"CJ auth failed: {data.get('message', 'unknown error')}")

        payload = data.get("data", {})
        _token = payload.get("accessToken", "")
        _token_expires = _parse_iso(payload.get("accessTokenExpiryDate", ""))
        _refresh_token = payload.get("refreshToken")
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
    Push an order to CJ for fulfillment via Create Order V2.
    Docs: POST /shopping/order/createOrderV2

    order_data: {
        "orderNumber": "ORD...",
        "logisticName": "CJPacket Ordinary",
        "shippingCountryCode": "US",
        "shippingCountry": "United States",
        "shippingProvince": "California",
        "shippingCity": "Los Angeles",
        "shippingAddress": "123 Main St",
        "shippingZip": "90001",
        "shippingPhone": "+1234567890",
        "shippingCustomerName": "John Doe",
        "email": "john@example.com",
        "payType": 3,               # 3=create order only (no CJ payment)
        "platform": "api",
        "products": [{"vid": "VARIANT_ID", "quantity": 1}]
    }
    """
    logger.info(f"[CJ] Creating order: {order_data.get('orderNumber')}")
    result = await _cj_request("POST", "/shopping/order/createOrderV2", json=order_data)
    logger.info(f"[CJ] Order created: {result.get('data', {})}")
    return result


async def list_orders(page_num: int = 1, page_size: int = 20,
                      order_ids: list[str] = None, status: str = None) -> dict:
    """
    List CJ orders.  GET /shopping/order/list
    """
    params = {"pageNum": page_num, "pageSize": page_size}
    if order_ids:
        # CJ API accepts repeated orderIds query params
        # httpx handles list params via params list
        params["orderIds"] = order_ids
    if status:
        params["status"] = status
    result = await _cj_request("GET", "/shopping/order/list", params=params)
    return result


async def get_tracking(tracking_numbers: list[str]) -> dict:
    """
    Get logistics tracking info.  GET /logistic/trackInfo
    tracking_numbers: list of CJ tracking numbers (supports batch query)
    """
    # CJ API accepts repeated trackNumber params for batch query
    params = [("trackNumber", tn) for tn in tracking_numbers]
    result = await _cj_request("GET", "/logistic/trackInfo", params=params)
    return result


async def search_product(keyword: str, page_num: int = 1, page_size: int = 20) -> dict:
    """
    Search CJ product catalog via Product List V2 (elasticsearch).
    GET /product/listV2?keyWord=xxx&page=1&size=20
    """
    result = await _cj_request("GET", "/product/listV2", params={
        "keyWord": keyword,
        "page": page_num,
        "size": page_size,
    })
    return result


async def get_shipping_methods(country_code: str, variant_ids: list[dict]) -> dict:
    """
    Calculate shipping methods and costs.
    POST /logistic/freightCalculate
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
    return settings.CJ_API_ENABLED and bool(settings.CJ_API_KEY)
