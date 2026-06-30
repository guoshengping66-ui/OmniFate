"""Stripe Checkout payment endpoints."""

import hmac
import hashlib
import logging
import secrets
import time
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

from .constants import PRODUCT_PRICES
from .founder import activate_founder_seat_logic
from .subscriptions import activate_subscription

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


def _frontend_url(path: str) -> str:
    base = (settings.FRONTEND_URL or settings.BASE_URL).rstrip("/")
    return f"{base}{path}"


def _stripe_return_urls(order_no: str) -> tuple[str, str]:
    success = settings.STRIPE_SUCCESS_URL or _frontend_url(f"/payment?stripe=success&order_no={order_no}")
    cancel = settings.STRIPE_CANCEL_URL or _frontend_url(f"/payment?stripe=cancelled&order_no={order_no}")
    separator = "&" if "?" in success else "?"
    success = f"{success}{separator}session_id={{CHECKOUT_SESSION_ID}}"
    return success, cancel


async def _create_checkout_session(
    *,
    order_no: str,
    amount: float,
    currency: str,
    name: str,
    user: User,
    item_type: str,
    region: str = "overseas",
    reading_id: str = "",
) -> dict:
    if not settings.STRIPE_ENABLED or not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=400, detail="Stripe is not configured")

    success_url, cancel_url = _stripe_return_urls(order_no)
    metadata = {
        "order_no": order_no,
        "user_id": user.id,
        "item_type": item_type,
        "region": region,
        "reading_id": reading_id or "",
    }
    data = {
        "mode": "payment",
        "success_url": success_url,
        "cancel_url": cancel_url,
        "client_reference_id": order_no,
        "customer_email": user.email,
        "metadata[order_no]": metadata["order_no"],
        "metadata[user_id]": metadata["user_id"],
        "metadata[item_type]": metadata["item_type"],
        "metadata[region]": metadata["region"],
        "metadata[reading_id]": metadata["reading_id"],
        "payment_intent_data[metadata][order_no]": metadata["order_no"],
        "payment_intent_data[metadata][user_id]": metadata["user_id"],
        "payment_intent_data[metadata][item_type]": metadata["item_type"],
        "payment_intent_data[metadata][region]": metadata["region"],
        "payment_intent_data[metadata][reading_id]": metadata["reading_id"],
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": currency.lower(),
        "line_items[0][price_data][unit_amount]": str(int(round(amount * 100))),
        "line_items[0][price_data][product_data][name]": name[:120],
    }
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            "https://api.stripe.com/v1/checkout/sessions",
            auth=(settings.STRIPE_SECRET_KEY, ""),
            headers={"Idempotency-Key": f"checkout-{order_no}"},
            data=data,
        )
    try:
        result = response.json()
    except Exception:
        logger.error("[STRIPE] Non-JSON response: status=%s", response.status_code)
        raise HTTPException(status_code=502, detail="Stripe returned an invalid response")
    if response.status_code >= 400:
        logger.error("[STRIPE] Checkout session failed: %s", result)
        raise HTTPException(status_code=400, detail=result.get("error", {}).get("message", "Stripe checkout failed"))
    return result


async def _activate_paid_order(order: Order, db: AsyncSession) -> None:
    if order.status == OrderStatus.paid:
        return
    order.status = OrderStatus.paid
    order.paid_at = datetime.now(timezone.utc)
    order.notes = (order.notes or "") + f"\n[STRIPE] Payment confirmed {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"

    if not order.user_id:
        return
    item_type = order.item_type or ""
    user_result = await db.execute(select(User).where(User.id == order.user_id).with_for_update())
    user = user_result.scalar_one_or_none()
    if not user:
        return
    if item_type in ("premium_monthly", "premium_yearly"):
        await activate_subscription(user, item_type, db)
    elif item_type == "founder_lifetime":
        await activate_founder_seat_logic(user, order.order_no, db)
    elif item_type == "onetime_unlock":
        from .unlock import handle_onetime_unlock_activation
        await handle_onetime_unlock_activation(user, order, db)


@router.post("/stripe/create")
async def create_stripe_checkout(
    item_type: str = Query("unlock_report"),
    reading_id: str = Query(""),
    region: str = Query("overseas"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    region = "domestic" if region == "domestic" else "overseas"
    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info:
        raise HTTPException(status_code=400, detail="Invalid item type")

    order_no = f"ST{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"
    amount_usd = float(price_info["usd"])
    amount_cny = float(price_info["cny"])
    amount = amount_cny if region == "domestic" else amount_usd
    currency = "cny" if region == "domestic" else "usd"
    name_map = {
        "premium_monthly": "Profile Mirror Monthly Membership",
        "premium_yearly": "Profile Mirror Yearly Membership",
        "unlock_report": "Profile Mirror Report Unlock",
        "founder_lifetime": "Profile Mirror Founder Lifetime Membership",
        "onetime_unlock": "Profile Mirror One-time Unlock",
    }
    order = Order(
        user_id=current_user.id,
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount_cny,
        total_usd=amount_usd,
        payment_method="stripe",
        payment_ref=order_no,
        item_type=item_type,
        notes=f"item_type:{item_type}|reading_id:{reading_id or ''}|region:{region}",
    )
    db.add(order)
    await db.commit()

    session = await _create_checkout_session(
        order_no=order_no,
        amount=amount,
        currency=currency,
        name=name_map.get(item_type, "Profile Mirror"),
        user=current_user,
        item_type=item_type,
        region=region,
        reading_id=reading_id,
    )
    order.payment_ref = session["id"]
    await db.commit()
    return {"checkout_url": session["url"], "session_id": session["id"], "order_no": order_no}


@router.post("/stripe/create-shop-order")
async def create_shop_stripe_checkout(
    order_no: str = Query(...),
    region: str = Query("overseas"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    region = "domestic" if region == "domestic" else "overseas"
    result = await db.execute(select(Order).where(Order.order_no == order_no).with_for_update())
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id and str(order.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Unauthorized order")
    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=400, detail=f"Order status is {order.status.value}")

    item_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    items = item_result.scalars().all()
    name = ", ".join(f"{i.product_name} x{i.quantity}" for i in items) or "Profile Mirror Shop Order"
    amount_cny = float(order.total_cny or 0)
    amount_usd = float(order.total_usd or 0)
    if region == "domestic":
        amount = amount_cny
        currency = "cny"
    else:
        if amount_usd <= 0:
            amount_usd = round(amount_cny / (settings.CNY_TO_USD_RATE or 7.0), 2)
            order.total_usd = amount_usd
        amount = amount_usd
        currency = "usd"
    order.payment_method = "stripe"
    await db.commit()

    session = await _create_checkout_session(
        order_no=order.order_no,
        amount=amount,
        currency=currency,
        name=name,
        user=current_user,
        item_type="shop",
        region=region,
    )
    order.payment_ref = session["id"]
    await db.commit()
    return {"checkout_url": session["url"], "session_id": session["id"], "order_no": order.order_no}


@router.get("/stripe/return")
async def stripe_return(
    session_id: str = Query(""),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if not session_id:
        return RedirectResponse(_frontend_url("/payment?stripe=missing_session"))
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            f"https://api.stripe.com/v1/checkout/sessions/{session_id}",
            auth=(settings.STRIPE_SECRET_KEY, ""),
        )
    session = response.json()
    if session.get("payment_status") == "paid":
        result = await db.execute(select(Order).where(Order.payment_ref == session_id).with_for_update())
        order = result.scalar_one_or_none()
        if order and str(order.user_id) == str(current_user.id):
            await _activate_paid_order(order, db)
            await db.commit()
            return RedirectResponse(_frontend_url(f"/payment?stripe=success&order_no={order.order_no}"))
    return RedirectResponse(_frontend_url("/payment?stripe=failed"))


def _verify_webhook_signature(payload: bytes, sig_header: str) -> bool:
    if not settings.STRIPE_WEBHOOK_SECRET:
        return False
    parts = dict(part.split("=", 1) for part in sig_header.split(",") if "=" in part)
    timestamp = parts.get("t", "")
    signature = parts.get("v1", "")
    if not timestamp or not signature:
        return False
    try:
        if abs(time.time() - int(timestamp)) > 300:
            return False
    except ValueError:
        return False
    signed_payload = f"{timestamp}.{payload.decode('utf-8')}".encode("utf-8")
    expected = hmac.new(settings.STRIPE_WEBHOOK_SECRET.encode(), signed_payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    if not _verify_webhook_signature(payload, request.headers.get("stripe-signature", "")):
        raise HTTPException(status_code=403, detail="Invalid Stripe signature")
    event = await request.json()
    if event.get("type") != "checkout.session.completed":
        return {"status": "ignored"}
    session = event.get("data", {}).get("object", {})
    if session.get("payment_status") != "paid":
        return {"status": "ignored"}
    order_no = session.get("client_reference_id") or session.get("metadata", {}).get("order_no")
    session_id = session.get("id")
    result = await db.execute(
        select(Order).where(
            or_(Order.payment_ref == session_id, Order.order_no == order_no)
        ).with_for_update()
    )
    order = result.scalar_one_or_none()
    if not order:
        logger.warning("[STRIPE-WEBHOOK] Order not found for session=%s order_no=%s", session_id, order_no)
        return {"status": "order_not_found"}
    order.payment_ref = session_id
    await _activate_paid_order(order, db)
    await db.commit()
    return {"status": "completed"}
