"""api/routers/payments.py — Stripe 付费解锁 + Mock 支付完整流程"""
import uuid
import random
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.session import get_db
from backend.database.models import (
    Reading, User, Order, OrderItem, EventLog,
    PaymentStatus, OrderStatus,
)
from backend.auth.dependencies import get_current_user, require_user
from backend.config import get_settings

router = APIRouter()
settings = get_settings()

SHOP_COUPON_AMOUNT = 60   # ¥60 coupon on first report purchase

# ─── Payment Methods ──────────────────────────────────────────────────────────

@router.get("/payment-methods")
async def get_payment_methods():
    """返回可用的支付方式列表"""
    methods = [
        {
            "id": "card",
            "name": "信用卡/借记卡",
            "name_en": "Credit/Debit Card",
            "icon": "credit-card",
            "category": "global",
            "enabled": True,
        },
    ]

    if settings.ALIPAY_ENABLED:
        methods.append({
            "id": "alipay",
            "name": "支付宝",
            "name_en": "Alipay",
            "icon": "alipay",
            "category": "china",
            "enabled": True,
        })

    if settings.WECHAT_PAY_ENABLED:
        methods.append({
            "id": "wechat_pay",
            "name": "微信支付",
            "name_en": "WeChat Pay",
            "icon": "wechat",
            "category": "china",
            "enabled": True,
        })

    if settings.APPLE_PAY_ENABLED:
        methods.append({
            "id": "apple_pay",
            "name": "Apple Pay",
            "name_en": "Apple Pay",
            "icon": "apple",
            "category": "global",
            "enabled": True,
        })

    if settings.GOOGLE_PAY_ENABLED:
        methods.append({
            "id": "google_pay",
            "name": "Google Pay",
            "name_en": "Google Pay",
            "icon": "google",
            "category": "global",
            "enabled": True,
        })

    if settings.PAYPAL_ENABLED:
        methods.append({
            "id": "paypal",
            "name": "PayPal",
            "name_en": "PayPal",
            "icon": "paypal",
            "category": "global",
            "enabled": True,
        })

    return {"methods": methods, "count": len(methods)}
TRIAL_DAYS = 3
EVENT_RETRO_PRICE = 19.9


# ─── Shared helpers ──────────────────────────────────────────────────────────

async def _unlock_reading(reading_id: str, db: AsyncSession) -> dict:
    """Shared unlock logic: mark reading paid, issue coupon, activate trial."""
    rid = uuid.UUID(reading_id)

    reading_result = await db.execute(select(Reading).where(Reading.id == rid))
    reading = reading_result.scalar_one_or_none()
    if not reading:
        raise HTTPException(status_code=404, detail="报告不存在")
    if reading.is_detail_unlocked:
        return {
            "unlocked": True,
            "reading_id": reading_id,
            "message": "报告已解锁，无需重复支付",
            "shop_coupon_issued": 0,
            "trial_activated": False,
        }

    reading.is_detail_unlocked = True
    reading.payment_status = PaymentStatus.paid
    reading.stripe_payment_intent = "mock_pi_" + reading_id[:8]

    coupon_issued = 0
    trial_activated = False

    if reading.user_id:
        user_result = await db.execute(select(User).where(User.id == reading.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            # Issue ¥60 shop coupon (only once — check if first unlock)
            if (user.shop_coupon_balance or 0) == 0:
                user.shop_coupon_balance = SHOP_COUPON_AMOUNT
                coupon_issued = SHOP_COUPON_AMOUNT

            # Activate 3-day trial if not already premium
            if not user.is_premium:
                user.is_premium = True
                user.subscription_tier = "trial"
                user.premium_expires_at = datetime.utcnow() + timedelta(days=TRIAL_DAYS)
                user.free_event_quota = 2  # trial gets 2 free events
                user.free_event_quota_reset_at = datetime.utcnow() + timedelta(days=TRIAL_DAYS)
                trial_activated = True

    await db.commit()
    return {
        "unlocked": True,
        "reading_id": reading_id,
        "message": "报告已解锁",
        "shop_coupon_issued": coupon_issued,
        "trial_activated": trial_activated,
    }


# ─── Report Unlock ───────────────────────────────────────────────────────────

@router.post("/unlock/{reading_id}")
async def mock_unlock(
    reading_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """Mock 支付解锁报告（开发环境）— 需要登录"""
    return await _unlock_reading(reading_id, db)


@router.post("/create-checkout/{reading_id}")
async def create_checkout(reading_id: str, payment_method: str = "card"):
    """Stripe Checkout（支持多支付方式）"""
    # Map frontend payment method IDs to Stripe payment method types
    PAYMENT_METHOD_MAP = {
        "card": ["card"],
        "alipay": ["alipay"],
        "wechat_pay": ["wechat_pay"],
        "paypal": ["paypal"],
    }

    payment_method_types = PAYMENT_METHOD_MAP.get(payment_method, ["card"])

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        session = stripe.checkout.Session.create(
            payment_method_types=payment_method_types,
            line_items=[{"price": settings.STRIPE_PRICE_ID_PREMIUM, "quantity": 1}],
            mode="payment",
            success_url=f"{settings.FRONTEND_URL or 'http://localhost:3000'}/reading/{reading_id}?unlocked=true",
            cancel_url=f"{settings.FRONTEND_URL or 'http://localhost:3000'}/reading/{reading_id}",
            metadata={
                "reading_id": reading_id,
                "payment_method": payment_method,
            },
        )
        return {"checkout_url": session.url, "payment_method": payment_method}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    import stripe
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, settings.STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        reading_id = session.get("metadata", {}).get("reading_id")
        if reading_id:
            await _unlock_reading(reading_id, db)

    return {"received": True}


# ─── Event Retrospection Payment ─────────────────────────────────────────────

class PayEventRequest(BaseModel):
    event_id: str
    use_free_quota: bool = True   # 订阅用户优先使用免费次数


@router.post("/pay-event")
async def pay_event(
    req: PayEventRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """支付事件复盘：订阅用户免费额度 → 超量 ¥19.9/次"""
    try:
        eid = uuid.UUID(req.event_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="无效的事件 ID 格式")
    event_result = await db.execute(select(EventLog).where(EventLog.id == eid))
    event = event_result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="事件不存在")

    # Check if already paid
    if getattr(event, "is_paid", False):
        return {"paid": True, "event_id": req.event_id, "charge": 0, "message": "已支付"}

    charge = 0.0
    used_free = False

    if current_user:
        # Check/reset monthly free quota
        now = datetime.utcnow()
        if current_user.free_event_quota_reset_at and now > current_user.free_event_quota_reset_at:
            # Reset quota monthly
            current_user.free_event_quota = 2 if current_user.subscription_tier != "premium_yearly" else 5
            current_user.free_event_quota_reset_at = now + timedelta(days=30)

        if req.use_free_quota and (current_user.free_event_quota or 0) > 0:
            current_user.free_event_quota -= 1
            used_free = True
        else:
            charge = EVENT_RETRO_PRICE
    else:
        charge = EVENT_RETRO_PRICE

    # Mark event as paid
    setattr(event, "is_paid", True)

    await db.commit()
    return {
        "paid": True,
        "event_id": req.event_id,
        "charge": charge,
        "used_free_quota": used_free,
        "remaining_free_quota": current_user.free_event_quota if current_user else 0,
        "message": "使用免费额度" if used_free else f"已支付 ¥{charge}",
    }


# ─── Order with Coupon ───────────────────────────────────────────────────────

class OrderItemIn(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price_cny: float


class CreateOrderRequest(BaseModel):
    items: list[OrderItemIn]
    total_cny: float
    use_coupon: bool = False   # 是否使用代金券抵扣


@router.post("/create-order")
async def create_order(
    req: CreateOrderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Mock 创建订单，支持代金券抵扣"""
    final_total = req.total_cny
    coupon_used = 0.0

    # Handle coupon
    if req.use_coupon and current_user:
        balance = current_user.shop_coupon_balance or 0
        if balance <= 0:
            raise HTTPException(status_code=400, detail="没有可用的代金券余额")
        coupon_used = min(balance, final_total)
        current_user.shop_coupon_balance = balance - coupon_used
        final_total = round(final_total - coupon_used, 2)

    order_no = f"MOCK-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}"

    order = Order(
        user_id=current_user.id if current_user else None,
        order_no=order_no,
        status=OrderStatus.paid,
        total_cny=final_total,
        payment_method="mock",
        payment_ref=f"mock_ref_{order_no}",
        paid_at=datetime.utcnow(),
    )
    db.add(order)
    await db.flush()

    for item in req.items:
        # Resolve product_id — allow non-UUID strings for mock products
        try:
            pid = uuid.UUID(item.product_id) if item.product_id else None
        except (ValueError, AttributeError):
            pid = None  # non-UUID product_id → store as NULL
        oi = OrderItem(
            order_id=order.id,
            product_id=pid,
            product_name=item.product_name,
            quantity=item.quantity,
            unit_price_cny=item.unit_price_cny,
            subtotal_cny=round(item.unit_price_cny * item.quantity, 2),
        )
        db.add(oi)

    await db.commit()
    return {
        "order_id": str(order.id),
        "order_no": order_no,
        "status": "paid",
        "original_total": req.total_cny,
        "coupon_used": coupon_used,
        "final_total": final_total,
    }


# ─── Subscription ────────────────────────────────────────────────────────────

@router.post("/subscribe")
async def mock_subscribe(
    tier: str = Query("premium_monthly", pattern="^(premium_monthly|premium_yearly)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),  # MUST be logged in
):
    """Mock 订阅 — 实际更新 User 模型的会员状态"""
    now = datetime.utcnow()

    if tier == "premium_yearly":
        expires = now + timedelta(days=365)
        free_events = 5
        price_label = "¥298/年"
    else:
        expires = now + timedelta(days=30)
        free_events = 2
        price_label = "¥49/月"

    current_user.is_premium = True
    current_user.subscription_tier = tier
    current_user.premium_expires_at = expires
    current_user.free_event_quota = free_events
    current_user.free_event_quota_reset_at = now + timedelta(days=30)

    await db.commit()
    await db.refresh(current_user)

    return {
        "subscription_id": f"sub_mock_{uuid.uuid4().hex[:8]}",
        "tier": tier,
        "status": "active",
        "current_period_end": expires.isoformat(),
        "message": f"订阅成功: {price_label} (Mock)",
        "user": {
            "is_premium": current_user.is_premium,
            "subscription_tier": current_user.subscription_tier,
            "premium_expires_at": current_user.premium_expires_at.isoformat() if current_user.premium_expires_at else None,
            "free_event_quota": current_user.free_event_quota,
            "shop_coupon_balance": current_user.shop_coupon_balance,
        },
    }


@router.post("/cancel-subscription")
async def mock_cancel_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """Mock 取消订阅 — 保留当前周期，到期后恢复免费"""
    # Don't immediately remove premium — let it expire naturally
    # In production, this would update Stripe subscription
    return {
        "status": "cancelled",
        "premium_expires_at": current_user.premium_expires_at.isoformat() if current_user.premium_expires_at else None,
        "message": "订阅已取消，当前周期结束后恢复免费 (Mock)",
    }
