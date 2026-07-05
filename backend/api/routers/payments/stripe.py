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
from services.pricing import (
    PriceQuote,
    get_price_quote,
    lock_user_region,
    quote_custom_amount,
    resolve_pricing_region,
    validate_payment_method,
)
from services.payment_events import mark_payment_event_processed, record_payment_event

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
    quote: PriceQuote,
    name: str,
    user: User,
    item_type: str,
    reading_id: str = "",
) -> dict:
    if not settings.STRIPE_ENABLED or not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=400, detail="Stripe is not configured")

    success_url, cancel_url = _stripe_return_urls(order_no)
    metadata = {
        "order_no": order_no,
        "user_id": user.id,
        "item_type": item_type,
        "region": quote.region,
        "currency": quote.currency,
        "amount_minor": str(quote.amount_minor),
        "reading_id": reading_id or "",
    }
    data = {
        "mode": quote.mode,
        "success_url": success_url,
        "cancel_url": cancel_url,
        "client_reference_id": order_no,
        "customer_email": user.email,
        "metadata[order_no]": metadata["order_no"],
        "metadata[user_id]": metadata["user_id"],
        "metadata[item_type]": metadata["item_type"],
        "metadata[region]": metadata["region"],
        "metadata[currency]": metadata["currency"],
        "metadata[amount_minor]": metadata["amount_minor"],
        "metadata[reading_id]": metadata["reading_id"],
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": quote.currency.lower(),
        "line_items[0][price_data][unit_amount]": str(quote.amount_minor),
        "line_items[0][price_data][product_data][name]": name[:120],
    }
    if quote.stripe_price_id:
        data.pop("line_items[0][price_data][currency]", None)
        data.pop("line_items[0][price_data][unit_amount]", None)
        data.pop("line_items[0][price_data][product_data][name]", None)
        data["line_items[0][price]"] = quote.stripe_price_id
    if quote.mode == "subscription":
        data["subscription_data[metadata][order_no]"] = metadata["order_no"]
        data["subscription_data[metadata][user_id]"] = metadata["user_id"]
        data["subscription_data[metadata][item_type]"] = metadata["item_type"]
        data["subscription_data[metadata][region]"] = metadata["region"]
        if quote.interval and not quote.stripe_price_id:
            data["line_items[0][price_data][recurring][interval]"] = quote.interval
    else:
        data["payment_intent_data[metadata][order_no]"] = metadata["order_no"]
        data["payment_intent_data[metadata][user_id]"] = metadata["user_id"]
        data["payment_intent_data[metadata][item_type]"] = metadata["item_type"]
        data["payment_intent_data[metadata][region]"] = metadata["region"]
        data["payment_intent_data[metadata][reading_id]"] = metadata["reading_id"]
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
        await activate_founder_seat_logic(user, order.order_no, db, region=order.pricing_region)
    elif item_type == "onetime_unlock":
        from .unlock import handle_onetime_unlock_activation
        await handle_onetime_unlock_activation(user, order, db)


@router.post("/stripe/create")
async def create_stripe_checkout(
    request: Request,
    item_type: str = Query("unlock_report"),
    reading_id: str = Query(""),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    region = resolve_pricing_region(request, current_user)
    validate_payment_method(region, "stripe")
    is_premium = bool(getattr(current_user, "is_premium", False))
    quote = get_price_quote(item_type, region, is_premium=is_premium)

    order_no = f"ST{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"
    lock_user_region(current_user, region)
    if current_user.pricing_region == region and not current_user.pricing_region_locked_at:
        current_user.pricing_region_locked_at = datetime.now(timezone.utc)
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
        payment_method="stripe",
        payment_ref=order_no,
        item_type=item_type,
        notes=f"item_type:{item_type}|reading_id:{reading_id or ''}|region:{region}",
    )
    db.add(order)
    await db.commit()

    session = await _create_checkout_session(
        order_no=order_no,
        quote=quote,
        name=quote.label,
        user=current_user,
        item_type=item_type,
        reading_id=reading_id,
    )
    order.payment_ref = session["id"]
    order.stripe_checkout_session_id = session["id"]
    order.stripe_subscription_id = session.get("subscription")
    await db.commit()
    return {"checkout_url": session["url"], "session_id": session["id"], "order_no": order_no}


@router.post("/stripe/create-shop-order")
async def create_shop_stripe_checkout(
    request: Request,
    order_no: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    region = resolve_pricing_region(request, current_user)
    validate_payment_method(region, "stripe")
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
    quote = quote_custom_amount(
        sku="shop",
        region=order.pricing_region or region,
        amount_cny=amount_cny,
        amount_usd=amount_usd,
        label=name,
    )
    order.payment_method = "stripe"
    order.pricing_region = quote.region
    order.currency = quote.currency.upper()
    order.amount_minor = quote.amount_minor
    order.price_snapshot = quote.snapshot()
    await db.commit()

    session = await _create_checkout_session(
        order_no=order.order_no,
        quote=quote,
        name=name,
        user=current_user,
        item_type="shop",
    )
    order.payment_ref = session["id"]
    order.stripe_checkout_session_id = session["id"]
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
            order.stripe_payment_intent_id = session.get("payment_intent")
            order.stripe_subscription_id = session.get("subscription")
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
    event_id = event.get("id") or hashlib.sha256(payload).hexdigest()
    event_type = event.get("type")
    session = event.get("data", {}).get("object", {})
    order_no = session.get("client_reference_id") or session.get("metadata", {}).get("order_no")
    payment_event, is_new = await record_payment_event(
        db,
        provider="stripe",
        event_id=event_id,
        event_type=event_type,
        order_no=order_no,
        payload=event,
    )
    if not is_new:
        await db.commit()
        return {"status": "duplicate"}

    if event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        subscription = session
        user_result = await db.execute(select(User).where(User.stripe_subscription_id == subscription.get("id")).with_for_update())
        user = user_result.scalar_one_or_none()
        if user:
            user.subscription_status = subscription.get("status")
            period_end = subscription.get("current_period_end")
            if period_end:
                user.subscription_current_period_end = datetime.fromtimestamp(int(period_end), tz=timezone.utc)
            if subscription.get("status") in ("active", "trialing"):
                user.is_premium = True
            elif subscription.get("status") in ("canceled", "unpaid", "incomplete_expired", "incomplete"):
                user.is_premium = False
        mark_payment_event_processed(payment_event)
        await db.commit()
        return {"status": "subscription_synced"}

    if event_type != "checkout.session.completed":
        mark_payment_event_processed(payment_event, "ignored")
        await db.commit()
        return {"status": "ignored"}
    if session.get("payment_status") != "paid":
        mark_payment_event_processed(payment_event, "ignored")
        await db.commit()
        return {"status": "ignored"}
    session_id = session.get("id")
    result = await db.execute(
        select(Order).where(
            or_(Order.payment_ref == session_id, Order.order_no == order_no)
        ).with_for_update()
    )
    order = result.scalar_one_or_none()
    if not order:
        logger.warning("[STRIPE-WEBHOOK] Order not found for session=%s order_no=%s", session_id, order_no)
        mark_payment_event_processed(payment_event, "order_not_found")
        await db.commit()
        return {"status": "order_not_found"}
    order.payment_ref = session_id
    order.stripe_checkout_session_id = session_id
    order.stripe_payment_intent_id = session.get("payment_intent")
    order.stripe_subscription_id = session.get("subscription")
    await _activate_paid_order(order, db)
    if order.user_id and session.get("customer"):
        user_result = await db.execute(select(User).where(User.id == order.user_id).with_for_update())
        user = user_result.scalar_one_or_none()
        if user:
            user.stripe_customer_id = session.get("customer")
            if session.get("subscription"):
                user.stripe_subscription_id = session.get("subscription")
                user.subscription_status = "active"
    mark_payment_event_processed(payment_event)
    await db.commit()
    return {"status": "completed"}
