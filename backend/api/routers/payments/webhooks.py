"""Webhook endpoints for PayPal and CJ Dropshipping."""

import json
import hashlib
import hmac
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, Order, OrderStatus
from config import get_settings

from .subscriptions import activate_subscription
from .founder import activate_founder_seat_logic

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


@router.post("/webhooks/paypal")
async def paypal_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Receive PayPal webhook notifications — server-side payment confirmation.
    Handles PAYMENT.CAPTURE.COMPLETED as a fallback for client-side capture.
    """
    body = await request.json()
    logger.info(f"[PAYPAL-WEBHOOK] Received: {json.dumps(body, ensure_ascii=False)[:500]}")

    # SECURITY: Reject webhooks when PAYPAL_WEBHOOK_ID is not configured
    # to prevent unauthorized payment confirmations
    if not settings.PAYPAL_WEBHOOK_ID:
        logger.error("[PAYPAL-WEBHOOK] PAYPAL_WEBHOOK_ID not configured — rejecting for safety")
        raise HTTPException(status_code=503, detail="Webhook not configured")

    webhook_id = request.headers.get("PayPal-Webhook-Id", "")
    if settings.PAYPAL_WEBHOOK_ID and webhook_id != settings.PAYPAL_WEBHOOK_ID:
        logger.warning(f"[PAYPAL-WEBHOOK] Webhook ID mismatch: got={webhook_id}")
        raise HTTPException(status_code=403, detail="Invalid webhook ID")

    if settings.PAYPAL_WEBHOOK_ID:
        try:
            from .paypal import PayPalPay
            paypal = PayPalPay()
            access_token = await paypal._get_access_token()
            import httpx
            paypal_headers = {k: v for k, v in request.headers.items() if k.lower().startswith("paypal-")}
            verify_payload = {
                "auth_algo": paypal_headers.get("paypal-auth-algo", ""),
                "cert_url": paypal_headers.get("paypal-cert-url", ""),
                "encoding": paypal_headers.get("paypal-encoding", ""),
                "sig": paypal_headers.get("paypal-transmission-sig", ""),
                "timestamp": paypal_headers.get("paypal-transmission-time", ""),
                "webhook_id": settings.PAYPAL_WEBHOOK_ID,
                "webhook_event": body,
            }
            async with httpx.AsyncClient(timeout=10) as client:
                verify_resp = await client.post(
                    f"{paypal.base_url}/v1/notifications/verify-webhook-signature",
                    headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
                    json=verify_payload,
                )
            verify_result = verify_resp.json()
            if verify_result.get("verification_status") != "SUCCESS":
                logger.warning(f"[PAYPAL-WEBHOOK] Signature verification failed: {verify_result}")
                raise HTTPException(status_code=403, detail="Signature verification failed")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"[PAYPAL-WEBHOOK] Signature verification error: {e}")

    event_type = body.get("event_type", "")
    resource = body.get("resource", {})

    if event_type == "PAYMENT.CAPTURE.COMPLETED":
        capture_id = resource.get("id", "")
        custom_id = resource.get("custom_id", "")

        logger.info(f"[PAYPAL-WEBHOOK] CAPTURE.COMPLETED: capture_id={capture_id}, custom_id={custom_id}")

        order_no = resource.get("supplementary_data", {}).get("related_ids", {}).get("order_id", "")
        if not order_no:
            logger.warning(f"[PAYPAL-WEBHOOK] No order_id in resource, attempting lookup by capture_id")
            result = await db.execute(
                select(Order).where(
                    Order.payment_ref == capture_id,
                    Order.status == OrderStatus.pending,
                ).with_for_update()
            )
        else:
            result = await db.execute(
                select(Order).where(
                    Order.order_no == order_no,
                    Order.status == OrderStatus.pending,
                ).with_for_update()
            )

        order = result.scalar_one_or_none()
        if not order:
            if order_no:
                result2 = await db.execute(select(Order).where(Order.order_no == order_no))
                existing = result2.scalar_one_or_none()
                if existing and existing.status == OrderStatus.paid:
                    logger.info(f"[PAYPAL-WEBHOOK] Order {order_no} already paid — idempotent skip")
                    return {"status": "already_processed"}
            logger.warning(f"[PAYPAL-WEBHOOK] Order not found for capture {capture_id}, order_no={order_no}")
            return {"status": "order_not_found"}

        order.status = OrderStatus.paid
        order.paid_at = datetime.now(timezone.utc)
        order.payment_ref = capture_id
        order.notes = (order.notes or "") + f"\n[WEBHOOK] PayPal capture confirmed {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"

        if order.user_id:
            item_type = order.item_type or ""
            user_result = await db.execute(
                select(User).where(User.id == order.user_id).with_for_update()
            )
            user = user_result.scalar_one_or_none()
            if user and item_type in ("premium_monthly", "premium_yearly"):
                grant_info = await activate_subscription(user, item_type, db)
                logger.info(f"[PAYPAL-WEBHOOK] 激活订阅: 用户 {user.id}, {item_type}, 星尘 +{grant_info.get('grant_amount', 0)}")
            elif user and item_type == "founder_lifetime":
                grant_info = await activate_founder_seat_logic(user, order.order_no, db)
                logger.info(f"[PAYPAL-WEBHOOK] 激活创始席位: 用户 {user.id}, 席位 #{grant_info.get('seat_no')}")
            elif user and item_type == "onetime_unlock":
                from .unlock import handle_onetime_unlock_activation
                grant_info = await handle_onetime_unlock_activation(user, order, db)
                if not grant_info.get("already_activated"):
                    logger.info(f"[PAYPAL-WEBHOOK] 激活一次性解锁: 用户 {user.id}")

        await db.commit()
        logger.info(f"[PAYPAL-WEBHOOK] Order {order.order_no} confirmed via webhook")
        return {"status": "completed"}

    logger.info(f"[PAYPAL-WEBHOOK] Unhandled event type: {event_type}")
    return {"status": "ignored"}


@router.post("/webhooks/cj")
async def cj_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Receive CJ Dropshipping webhook notifications.
    """
    body = await request.json()
    logger.info(f"[CJ Webhook] Received: {json.dumps(body, ensure_ascii=False)[:500]}")

    if settings.CJ_WEBHOOK_SECRET:
        signature = request.headers.get("X-CJ-Signature", "")
        expected = hashlib.sha256(
            (json.dumps(body, separators=(",", ":")) + settings.CJ_WEBHOOK_SECRET).encode()
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            logger.warning("[CJ Webhook] Invalid signature")
            raise HTTPException(status_code=403, detail="Invalid signature")

    cj_order_number = body.get("orderId") or body.get("orderNumber") or body.get("cjOrderNumber")
    tracking_number = body.get("trackingNumber") or body.get("trackingNumber1")
    cj_status = body.get("status") or body.get("orderStatus", "")

    if not cj_order_number:
        logger.warning("[CJ Webhook] No order number in payload")
        return {"success": True}

    result = await db.execute(
        select(Order).where(Order.cj_order_number == cj_order_number)
    )
    order = result.scalar_one_or_none()
    if not order:
        logger.warning(f"[CJ Webhook] No matching order for CJ order {cj_order_number}")
        return {"success": True}

    if cj_status.lower() in ("shipped", "in transit") and order.status == OrderStatus.shipped:
        return {"success": True}
    if cj_status.lower() == "delivered" and order.status == OrderStatus.delivered:
        return {"success": True}

    order.cj_order_status = cj_status
    if tracking_number:
        order.tracking_number = tracking_number
        order.shipping_carrier = body.get("shippingMethod", body.get("carrierName", "CJ Logistics"))

    if cj_status.lower() in ("shipped", "in transit"):
        order.status = OrderStatus.shipped
        if not order.shipped_at:
            order.shipped_at = datetime.now(timezone.utc)
    elif cj_status.lower() == "delivered":
        order.status = OrderStatus.delivered

    await db.commit()
    logger.info(f"[CJ Webhook] Order {order.order_no} updated: status={order.status.value}, tracking={tracking_number}")

    try:
        if order.user and order.user.email:
            from utils.email import _send_email
            import asyncio

            status_text = {"shipped": "已发货", "in transit": "运输中", "delivered": "已签收"}.get(cj_status.lower(), cj_status)
            subject = f"订单 {order.order_no} {status_text}"
            html = f"""
            <div style="font-family:sans-serif;padding:20px;">
                <h2>📦 订单状态更新</h2>
                <p>您的订单 <strong>{order.order_no}</strong> 状态已更新为: <strong>{status_text}</strong></p>
                {f'<p>快递单号: <strong>{tracking_number}</strong></p>' if tracking_number else ''}
                {f'<p>快递公司: {order.shipping_carrier}</p>' if order.shipping_carrier else ''}
            </div>
            """
            await asyncio.to_thread(_send_email, order.user.email, subject, html)
    except Exception as e:
        logger.warning(f"[CJ Webhook] Failed to notify user: {e}")

    return {"success": True}
