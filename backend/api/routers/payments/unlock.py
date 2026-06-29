"""Report unlock endpoints and logic."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import (
    Reading, User, Order, CreditTransaction, PaymentStatus, OrderStatus,
)
from auth.dependencies import require_user
from api.routers.readings import _invalidate_reading_cache

from .constants import (
    SHOP_COUPON_AMOUNT, TRIAL_DAYS, GRANT_ON_REPORT_UNLOCK,
)

logger = logging.getLogger(__name__)
router = APIRouter()


async def activate_onetime_unlock(user: User, reading_id: str, db: AsyncSession) -> dict:
    """
    激活一次性解锁 — 解锁指定报告 + 赠送 20 商城代金券 + 50 星尘 + 3天会员试用。
    每个账户限一次。回调场景幂等：已激活则返回空结果，不抛异常。
    """
    existing = await db.execute(
        select(Order).where(
            Order.user_id == user.id,
            Order.item_type == "onetime_unlock",
            Order.status == OrderStatus.paid,
        ).with_for_update()
    )
    if existing.first():
        return {"coupon_granted": 0, "stardust_granted": 0, "reading_id": reading_id, "already_activated": True}

    coupon_amount = 20
    stardust_amount = 50

    user.shop_coupon_balance = (user.shop_coupon_balance or 0) + coupon_amount

    user.stardust_balance += stardust_amount
    user.stardust_lifetime_earned += stardust_amount

    tx = CreditTransaction(
        user_id=user.id,
        amount=stardust_amount,
        balance_after=user.stardust_balance,
        reason="onetime_unlock_grant",
        reference_id=reading_id,
        status="confirmed",
    )
    db.add(tx)

    trial_activated = False
    if not user.is_premium:
        user.is_premium = True
        user.subscription_tier = "trial"
        user.premium_expires_at = datetime.now(timezone.utc) + timedelta(days=TRIAL_DAYS)
        user.free_event_quota = 2
        user.free_event_quota_reset_at = datetime.now(timezone.utc) + timedelta(days=TRIAL_DAYS)
        trial_activated = True

    return {
        "coupon_granted": coupon_amount,
        "stardust_granted": stardust_amount,
        "trial_activated": trial_activated,
        "reading_id": reading_id,
    }


async def handle_onetime_unlock_activation(user, order, db) -> dict:
    """
    一次性解锁统一激活入口 — 解锁报告 + 赠送代金券/星尘。
    供 WeChat/Alipay/PayPal/管理端等多处调用，消除重复代码。
    """
    notes = order.notes or ""
    reading_id = notes.split("reading_id:")[1].split("|")[0] if "reading_id:" in notes else ""
    if reading_id:
        reading_result = await db.execute(
            select(Reading).where(Reading.id == reading_id).with_for_update()
        )
        reading = reading_result.scalar_one_or_none()
        if reading and not reading.is_detail_unlocked:
            reading.is_detail_unlocked = True
            reading.payment_status = PaymentStatus.paid
            reading.stripe_payment_intent = "paid_" + reading_id[:8]
    return await activate_onetime_unlock(user, reading_id or order.order_no, db)


async def _unlock_reading(reading_id: str, db: AsyncSession, skip_stardust_grant: bool = False, requester_user_id: str | None = None) -> dict:
    """解锁报告

    Args:
        requester_user_id: If provided, verifies the requester owns this reading.
    """
    reading_result = await db.execute(
        select(Reading).where(Reading.id == reading_id).with_for_update()
    )
    reading = reading_result.scalar_one_or_none()
    if not reading:
        return {"error": "报告不存在"}

    # Ownership verification (defense-in-depth)
    if requester_user_id and reading.user_id != requester_user_id:
        return {"error": "无权操作此报告"}

    if reading.is_detail_unlocked:
        return {
            "already_unlocked": True,
            "reading_id": reading_id,
            "tier": "full",
            "is_detail_unlocked": True,
            "is_detailed_unlocked": True,
        }

    reading.is_detail_unlocked = True
    reading.payment_status = PaymentStatus.paid

    coupon_issued = False
    stardust_granted = 0
    trial_activated = False

    if reading.user_id and not skip_stardust_grant:
        user_result = await db.execute(select(User).where(User.id == reading.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            user.shop_coupon_balance = (user.shop_coupon_balance or 0) + SHOP_COUPON_AMOUNT
            coupon_issued = True

            user.stardust_balance += GRANT_ON_REPORT_UNLOCK
            user.stardust_lifetime_earned += GRANT_ON_REPORT_UNLOCK

            tx = CreditTransaction(
                user_id=user.id,
                amount=GRANT_ON_REPORT_UNLOCK,
                balance_after=user.stardust_balance,
                reason="report_unlock_grant",
                reference_id=reading_id,
                status="confirmed",
            )
            db.add(tx)
            stardust_granted = GRANT_ON_REPORT_UNLOCK

    await db.commit()
    # Invalidate reading cache so next GET re-fetches with worker reports included
    _invalidate_reading_cache(reading_id)
    return {
        "unlocked": True,
        "reading_id": reading_id,
        "message": "报告已解锁",
        "tier": "full",
        "is_detail_unlocked": True,
        "is_detailed_unlocked": True,
        "shop_coupon_issued": coupon_issued,
        "trial_activated": trial_activated,
        "stardust_granted": stardust_granted,
    }


@router.get("/payment-methods")
async def get_payment_methods():
    """Return available payment methods."""
    from config import get_settings
    settings = get_settings()

    methods = []
    if settings.STRIPE_ENABLED:
        methods.extend([
            {
                "id": "stripe",
                "name": "Stripe",
                "name_en": "Stripe",
                "icon": "credit-card",
                "category": "china",
                "enabled": True,
            },
            {
                "id": "stripe",
                "name": "Stripe",
                "name_en": "Stripe",
                "icon": "credit-card",
                "category": "global",
                "enabled": True,
            },
        ])

    return {"methods": methods}


@router.get("/paypal/config")
async def paypal_config():
    """返回 PayPal 客户端配置（用于前端 SDK 初始化）"""
    from config import get_settings
    settings = get_settings()
    return {
        "client_id": settings.PAYPAL_CLIENT_ID,
        "currency": "USD",
        "intent": "capture",
        "mode": settings.PAYPAL_MODE,
    }


@router.get("/paypal/sdk")
async def paypal_sdk_proxy():
    """代理 PayPal SDK JS，避免前端直连 paypal.com"""
    from config import get_settings
    settings = get_settings()
    import httpx

    mode = settings.PAYPAL_MODE
    sdk_url = f"https://www.paypal.com/sdk/js?client-id={settings.PAYPAL_CLIENT_ID}&currency=USD&intent=capture"

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(sdk_url)

    # Don't cache error responses or non-JavaScript responses from PayPal
    ct = response.headers.get("content-type", "").lower()
    is_javascript = "javascript" in ct or "ecmascript" in ct
    if response.status_code != 200 or not is_javascript:
        from fastapi.responses import Response
        return Response(
            content=response.content,
            status_code=response.status_code,
            media_type="application/javascript",
        )

    from fastapi.responses import Response
    return Response(
        content=response.content,
        media_type="application/javascript",
        headers={"Cache-Control": "public, max-age=86400"},
    )


@router.post("/unlock/{reading_id}")
async def unlock_report(
    reading_id: str,
    source: str = Query("payment", description="payment 或 stardust"),
    tier: str = Query("full", description="detailed(精读/30星尘) 或 full(全维/100星尘)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    解锁报告 — 支持两档解锁：
    - tier=detailed (精读): 30 星尘，解锁 master_detail（深度分析文本）
    - tier=full (全维): 100 星尘，解锁 master_detail + 所有工人报告
    """
    tier = (tier or "full").lower()
    if tier not in {"detailed", "full"}:
        raise HTTPException(status_code=400, detail="Invalid unlock tier")

    logger.info(f"[UNLOCK] reading_id={reading_id}, source={source}, tier={tier}, user={current_user.id}")

    reading_result = await db.execute(
        select(Reading).where(Reading.id == reading_id).with_for_update()
    )
    reading = reading_result.scalar_one_or_none()
    if not reading:
        raise HTTPException(status_code=404, detail="报告不存在")

    if reading.is_detail_unlocked:
        return {
            "already_unlocked": True,
            "reading_id": reading_id,
            "tier": "full",
            "is_detail_unlocked": True,
            "is_detailed_unlocked": True,
        }
    if tier == "detailed" and getattr(reading, "is_detailed_unlocked", False):
        return {
            "already_unlocked": True,
            "reading_id": reading_id,
            "tier": "detailed",
            "is_detail_unlocked": False,
            "is_detailed_unlocked": True,
        }

    if reading.user_id is None:
        # Orphan reading — claim it for the current user
        reading.user_id = current_user.id
    elif reading.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此报告")

    if source == "stardust":
        detailed_cost = 30
        full_cost = 100
        already_detailed = bool(getattr(reading, "is_detailed_unlocked", False))
        cost = detailed_cost if tier == "detailed" else full_cost
        if tier == "full" and already_detailed:
            cost = full_cost - detailed_cost

        # Pessimistic lock: prevent concurrent double-spend
        user_result = await db.execute(
            select(User).where(User.id == current_user.id).with_for_update()
        )
        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=403, detail="用户不存在或已被禁用")

        if user.stardust_balance < cost:
            raise HTTPException(status_code=400, detail=f"星尘不足，需要 {cost} 星尘")

        user.stardust_balance -= cost
        tx = CreditTransaction(
            user_id=user.id,
            amount=-cost,
            balance_after=user.stardust_balance,
            reason="report_unlock_stardust",
            reference_id=reading_id,
            status="confirmed",
        )
        db.add(tx)

        if tier == "detailed":
            reading.is_detailed_unlocked = True
        else:
            reading.is_detail_unlocked = True
            reading.is_detailed_unlocked = True
        reading.payment_status = PaymentStatus.paid

        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            _invalidate_reading_cache(reading_id)
            return {"already_unlocked": True, "reading_id": reading_id}

        _invalidate_reading_cache(reading_id)
        return {
            "unlocked": True,
            "reading_id": reading_id,
            "stardust_spent": cost,
            "tier": tier,
            "upgraded_from": "detailed" if tier == "full" and already_detailed else None,
            "is_detail_unlocked": reading.is_detail_unlocked,
            "is_detailed_unlocked": getattr(reading, "is_detailed_unlocked", False),
        }
    else:
        result = await _unlock_reading(reading_id, db, requester_user_id=current_user.id)
        return result
