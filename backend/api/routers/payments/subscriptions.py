"""Subscription activation logic."""

from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import User, CreditTransaction
from .constants import SUBSCRIPTION_GRANTS


async def activate_subscription(user: User, tier: str, db: AsyncSession) -> dict:
    """
    激活订阅会员 — 单一事实来源（Single Source of Truth）。
    由 QR 支付确认、正式支付回调、mock 订阅 共同调用。
    """
    if tier not in ("premium_monthly", "premium_yearly"):
        return {}

    now = datetime.now(timezone.utc)
    grant_amount = SUBSCRIPTION_GRANTS.get(tier, 0)

    if tier == "premium_yearly":
        expires = now + timedelta(days=365)
        free_events = 5
    else:
        expires = now + timedelta(days=30)
        free_events = 2

    user.is_premium = True
    user.subscription_tier = tier
    user.premium_expires_at = expires
    user.free_event_quota = free_events
    user.free_event_quota_reset_at = now + timedelta(days=30)

    # 注入首月星尘
    user.stardust_balance += grant_amount
    user.stardust_lifetime_earned += grant_amount

    tx = CreditTransaction(
        user_id=user.id,
        amount=grant_amount,
        balance_after=user.stardust_balance,
        reason="subscription_grant",
        reference_id=None,
        status="confirmed",
    )
    db.add(tx)

    return {
        "grant_amount": grant_amount,
        "expires": expires.isoformat(),
        "free_events": free_events,
    }
