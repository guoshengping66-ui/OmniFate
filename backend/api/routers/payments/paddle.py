"""Digital-only Paddle Checkout endpoints."""

from __future__ import annotations

import logging
import secrets
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import require_user
from config import get_settings
from database.models import CreditTransaction, Order, OrderStatus, User
from database.session import get_db
from services.paddle import verify_webhook_signature
from services.payment_events import mark_payment_event_processed, record_payment_event
from services.pricing import get_price_quote, resolve_pricing_region

from .subscriptions import activate_subscription

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


class PaddleCheckoutRequest(BaseModel):
    sku: str


def _order_no() -> str:
    return f"PDL-{secrets.token_hex(10).upper()}"


@router.post("/paddle/checkout")
async def create_paddle_checkout(
    payload: PaddleCheckoutRequest,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    if not settings.PADDLE_ENABLED or not settings.PADDLE_API_KEY:
        raise HTTPException(status_code=503, detail="Paddle checkout is not configured")

    quote = get_price_quote(payload.sku, resolve_pricing_region(user=current_user))
    if not quote.paddle_price_id:
        raise HTTPException(status_code=503, detail="This Paddle price is not configured")

    order = Order(
        user_id=current_user.id,
        order_no=_order_no(),
        total_cny=quote.cny_amount,
        total_usd=quote.usd_amount,
        pricing_region=quote.region,
        currency=quote.currency,
        amount_minor=quote.amount_minor,
        price_snapshot=quote.snapshot(),
        payment_method="paddle",
        item_type=quote.sku,
    )
    db.add(order)
    await db.flush()

    body = {
        "items": [{"price_id": quote.paddle_price_id, "quantity": 1}],
        "custom_data": {"order_no": order.order_no, "user_id": current_user.id, "sku": quote.sku},
    }
    headers = {
        "Authorization": f"Bearer {settings.PADDLE_API_KEY}",
        "Content-Type": "application/json",
        "Paddle-Version": "1",
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(f"{settings.PADDLE_API_BASE_URL.rstrip('/')}/transactions", json=body, headers=headers)
            response.raise_for_status()
            transaction = response.json()["data"]
    except (httpx.HTTPError, KeyError, TypeError) as exc:
        await db.rollback()
        logger.warning("Paddle transaction creation failed: %s", exc)
        raise HTTPException(status_code=502, detail="Unable to create Paddle checkout") from exc

    order.paddle_transaction_id = transaction["id"]
    order.payment_ref = transaction["id"]
    await db.commit()
    return {"order_no": order.order_no, "transaction_id": transaction["id"], "checkout_url": transaction.get("checkout", {}).get("url")}


def _event_country(event_data: dict[str, Any]) -> str | None:
    address = event_data.get("billing_details", {}).get("address", {})
    country = address.get("country_code")
    return country.upper() if isinstance(country, str) and len(country) == 2 else None


@router.post("/webhooks/paddle", status_code=204)
async def paddle_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    raw_payload = await request.body()
    signature = request.headers.get("paddle-signature", "")
    if not verify_webhook_signature(raw_payload, signature, settings.PADDLE_WEBHOOK_SECRET):
        raise HTTPException(status_code=401, detail="Invalid Paddle webhook signature")

    try:
        event = await request.json()
        event_id = event["event_id"]
        event_type = event["event_type"]
        event_data = event["data"]
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Malformed Paddle webhook") from exc

    custom_data = event_data.get("custom_data") or {}
    payment_event, created = await record_payment_event(
        db, provider="paddle", event_id=event_id, event_type=event_type,
        order_no=custom_data.get("order_no"), payload=event,
    )
    if not created:
        return

    if event_type != "transaction.completed":
        mark_payment_event_processed(payment_event, "ignored")
        await db.commit()
        return

    user_id = custom_data.get("user_id")
    sku = custom_data.get("sku")
    if not isinstance(user_id, str) or not isinstance(sku, str):
        mark_payment_event_processed(payment_event, "rejected")
        await db.commit()
        return

    result = await db.execute(select(User).where(User.id == user_id).with_for_update())
    user = result.scalar_one_or_none()
    if user is None:
        mark_payment_event_processed(payment_event, "rejected")
        await db.commit()
        return

    country = _event_country(event_data)
    if country:
        user.billing_country = country
    user.paddle_customer_id = event_data.get("customer_id") or user.paddle_customer_id

    order_result = await db.execute(select(Order).where(Order.order_no == custom_data.get("order_no")).with_for_update())
    order = order_result.scalar_one_or_none()
    if order:
        order.status = OrderStatus.paid
        order.paddle_transaction_id = event_data.get("id")
        order.payment_ref = event_data.get("id")
        order.paid_at = datetime.now(timezone.utc)

    if sku == "membership_monthly":
        user.paddle_subscription_id = event_data.get("subscription_id") or user.paddle_subscription_id
        await activate_subscription(user, "premium_monthly", db)
    elif sku == "membership_yearly":
        user.paddle_subscription_id = event_data.get("subscription_id") or user.paddle_subscription_id
        await activate_subscription(user, "premium_yearly", db)
    else:
        quote = get_price_quote(sku, "cn" if country == "CN" else "international")
        if quote.credits:
            user.stardust_balance += quote.credits
            user.stardust_lifetime_earned += quote.credits
            db.add(CreditTransaction(
                user_id=user.id,
                amount=quote.credits,
                balance_after=user.stardust_balance,
                reason="paddle_credit_purchase",
                reference_id=event_id,
                status="confirmed",
            ))

    mark_payment_event_processed(payment_event)
    await db.commit()
