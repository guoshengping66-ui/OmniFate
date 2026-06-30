"""PayPal payment endpoints."""

from __future__ import annotations

import base64
import logging
import secrets
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import require_user
from config import get_settings
from database.models import Order, OrderItem, OrderStatus, User
from database.session import get_db
from services.pricing import get_price_quote, lock_user_region, resolve_pricing_region, validate_payment_method

from .founder import activate_founder_seat_logic
from .subscriptions import activate_subscription

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


class PayPalPay:
    def __init__(self) -> None:
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.secret = settings.PAYPAL_SECRET
        self.base_url = "https://api-m.sandbox.paypal.com" if settings.PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com"

    async def _get_access_token(self) -> str:
        if not self.client_id or not self.secret:
            raise HTTPException(status_code=400, detail="PayPal is not configured")
        token = base64.b64encode(f"{self.client_id}:{self.secret}".encode()).decode()
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{self.base_url}/v1/oauth2/token",
                headers={"Authorization": f"Basic {token}", "Content-Type": "application/x-www-form-urlencoded"},
                data={"grant_type": "client_credentials"},
            )
        data = resp.json()
        if resp.status_code >= 400 or not data.get("access_token"):
            logger.error("[PAYPAL] access token failed: %s", data)
            raise HTTPException(status_code=400, detail="PayPal auth failed")
        return data["access_token"]

    async def create_order(self, order_no: str, amount_usd: float, description: str, custom_id: str = "") -> dict:
        access_token = await self._get_access_token()
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": order_no,
                "custom_id": custom_id or order_no,
                "description": description[:120],
                "amount": {"currency_code": "USD", "value": f"{amount_usd:.2f}"},
            }],
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{self.base_url}/v2/checkout/orders",
                headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
                json=payload,
            )
        data = resp.json()
        if resp.status_code >= 400:
            logger.error("[PAYPAL] create order failed: %s", data)
            raise HTTPException(status_code=400, detail="PayPal order creation failed")
        approve_url = next((l.get("href") for l in data.get("links", []) if l.get("rel") == "approve"), "")
        return {"order_id": data["id"], "approve_url": approve_url}

    async def capture_order(self, paypal_order_id: str) -> dict:
        access_token = await self._get_access_token()
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{self.base_url}/v2/checkout/orders/{paypal_order_id}/capture",
                headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            )
        data = resp.json()
        if resp.status_code >= 400:
            logger.error("[PAYPAL] capture failed: %s", data)
            raise HTTPException(status_code=400, detail="PayPal capture failed")
        return data


async def _activate_order(order: Order, db: AsyncSession) -> None:
    if order.status == OrderStatus.paid:
        return
    order.status = OrderStatus.paid
    order.paid_at = datetime.now(timezone.utc)
    if not order.user_id:
        return
    result = await db.execute(select(User).where(User.id == order.user_id).with_for_update())
    user = result.scalar_one_or_none()
    if not user:
        return
    item_type = order.item_type or ""
    if item_type in ("premium_monthly", "premium_yearly"):
        await activate_subscription(user, item_type, db)
    elif item_type == "founder_lifetime":
        await activate_founder_seat_logic(user, order.order_no, db, region=order.pricing_region)
    elif item_type == "onetime_unlock":
        from .unlock import handle_onetime_unlock_activation
        await handle_onetime_unlock_activation(user, order, db)


@router.get("/paypal/config")
async def paypal_config():
    return {"client_id": settings.PAYPAL_CLIENT_ID, "currency": "USD", "intent": "capture", "mode": settings.PAYPAL_MODE}


@router.post("/paypal/create")
async def create_paypal_order(
    request: Request,
    item_type: str = Query("unlock_report"),
    reading_id: str = Query(""),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if not settings.PAYPAL_ENABLED:
        raise HTTPException(status_code=400, detail="PayPal is not enabled")
    region = resolve_pricing_region(request, current_user)
    validate_payment_method(region, "paypal")
    quote = get_price_quote(item_type, region)
    lock_user_region(current_user, region)
    if current_user.pricing_region == region and not current_user.pricing_region_locked_at:
        current_user.pricing_region_locked_at = datetime.now(timezone.utc)

    order_no = f"PP{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"
    order = Order(
        user_id=current_user.id,
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=quote.cny_amount,
        total_usd=quote.usd_amount,
        pricing_region=quote.region,
        currency=quote.currency.upper(),
        amount_minor=quote.amount_minor,
        price_snapshot=quote.snapshot(),
        payment_method="paypal",
        payment_ref=order_no,
        item_type=item_type,
        notes=f"item_type:{item_type}|reading_id:{reading_id}|region:{quote.region}",
    )
    db.add(order)
    await db.commit()

    paypal = PayPalPay()
    result = await paypal.create_order(order_no, quote.usd_amount, quote.label, custom_id=current_user.id)
    order.payment_ref = result["order_id"]
    await db.commit()
    return {"order_no": order_no, "paypal_order_id": result["order_id"], "approve_url": result["approve_url"], "total_amount": quote.usd_amount, "currency": "USD"}


@router.post("/paypal/create-shop-order")
async def create_shop_paypal_order(
    order_no: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if not settings.PAYPAL_ENABLED:
        raise HTTPException(status_code=400, detail="PayPal is not enabled")
    result = await db.execute(select(Order).where(Order.order_no == order_no).with_for_update())
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id and str(order.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Unauthorized order")
    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=400, detail=f"Order status is {order.status.value}")
    if order.pricing_region != "overseas":
        raise HTTPException(status_code=403, detail="PayPal is only available for overseas orders")

    if order.payment_ref and order.payment_ref != order.order_no:
        return {"paypal_order_id": order.payment_ref, "order_no": order_no, "total_usd": float(order.total_usd or 0)}

    item_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    items = item_result.scalars().all()
    description = ", ".join(f"{i.product_name} x{i.quantity}" for i in items) or "Shop Order"
    amount_usd = float(order.total_usd or 0)
    if amount_usd < 0.01:
        raise HTTPException(status_code=400, detail="Invalid order amount")

    paypal = PayPalPay()
    pay_result = await paypal.create_order(order_no, amount_usd, f"Profile Mirror - {description}", custom_id=str(current_user.id))
    order.payment_ref = pay_result["order_id"]
    order.payment_method = "paypal"
    await db.commit()
    return {"paypal_order_id": pay_result["order_id"], "order_no": order_no, "total_usd": amount_usd}


@router.post("/paypal/capture")
async def capture_paypal_order(
    paypal_order_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    paypal = PayPalPay()
    result = await paypal.capture_order(paypal_order_id)
    if result.get("status") != "COMPLETED":
        raise HTTPException(status_code=400, detail="PayPal payment not completed")
    order_result = await db.execute(
        select(Order).where(or_(Order.payment_ref == paypal_order_id, Order.order_no == paypal_order_id)).with_for_update()
    )
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id and str(order.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Unauthorized order")
    await _activate_order(order, db)
    await db.commit()
    return {"status": "completed"}


@router.get("/paypal/return/{order_no}")
async def paypal_return(
    order_no: str,
    token: str = Query(""),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if not token:
        return RedirectResponse(f"{settings.FRONTEND_URL}/payment?paypal=missing_token")
    paypal = PayPalPay()
    result = await paypal.capture_order(token)
    if result.get("status") != "COMPLETED":
        return RedirectResponse(f"{settings.FRONTEND_URL}/payment?paypal=failed")
    order_result = await db.execute(select(Order).where(Order.order_no == order_no).with_for_update())
    order = order_result.scalar_one_or_none()
    if order and str(order.user_id) == str(current_user.id):
        order.payment_ref = token
        await _activate_order(order, db)
        await db.commit()
        return RedirectResponse(f"{settings.FRONTEND_URL}/payment?paypal=success&order_no={order.order_no}")
    return RedirectResponse(f"{settings.FRONTEND_URL}/payment?paypal=unauthorized")


@router.get("/paypal/cancel/{order_no}")
async def paypal_cancel(order_no: str):
    return RedirectResponse(f"{settings.FRONTEND_URL}/payment?paypal=cancelled&order_no={order_no}")
