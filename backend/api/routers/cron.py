"""定时任务 API — 月度星尘发放 + 会员状态维护 + 到期提醒 + 推命清理 + 订单超时"""
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, CreditTransaction, Reading, Order, OrderStatus
from utils.cron_auth import verify_cron_secret

logger = logging.getLogger(__name__)

router = APIRouter()

MONTHLY_GRANTS = {
    "premium_monthly": 100,
    "premium_yearly": 150,
    "founder_lifetime": 500,
}


@router.post("/monthly-stardust")
async def monthly_stardust_grant(
    _auth: str = Depends(verify_cron_secret),
    db: AsyncSession = Depends(get_db),
):
    """
    月度星尘自动注入（由 Vercel Cron / 外部 cron 触发）
    - 扫描所有有效订阅用户
    - 按 tier 注入星尘
    - 检查并过期过期会员
    """

    now = datetime.now(timezone.utc)
    granted_count = 0
    expired_count = 0
    errors = []

    # 1. 过期会员状态维护
    expired_result = await db.execute(
        select(User).where(
            and_(
                User.is_premium == True,
                User.premium_expires_at != None,
                User.premium_expires_at < now,
                User.subscription_tier != "founder_lifetime",  # 创始不过期
            )
        )
    )
    expired_users = expired_result.scalars().all()
    for user in expired_users:
        user.is_premium = False
        user.subscription_tier = "free"
        expired_count += 1

    # 2. 月度星尘发放
    grant_result = await db.execute(
        select(User).where(
            and_(
                User.is_premium == True,
                User.subscription_tier.in_(list(MONTHLY_GRANTS.keys())),
            )
        )
    )
    active_users = grant_result.scalars().all()

    for user in active_users:
        tier = user.subscription_tier
        if tier not in MONTHLY_GRANTS:
            continue

        grant_amount = MONTHLY_GRANTS[tier]

        # 幂等检查：本月是否已发放过
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        existing_grant = await db.execute(
            select(CreditTransaction).where(
                CreditTransaction.user_id == user.id,
                CreditTransaction.reason == "monthly_grant",
                CreditTransaction.created_at >= month_start,
            )
        )
        if existing_grant.scalar_one_or_none():
            continue  # 本月已发放，跳过

        # 悲观锁
        user_result = await db.execute(
            select(User).where(User.id == user.id).with_for_update()
        )
        locked_user = user_result.scalar_one_or_none()
        if not locked_user:
            logger.warning("User %s disappeared during monthly grant, skipping", user.id)
            continue
        locked_user.stardust_balance += grant_amount
        locked_user.stardust_lifetime_earned += grant_amount

        tx = CreditTransaction(
            user_id=locked_user.id,
            amount=grant_amount,
            balance_after=locked_user.stardust_balance,
            reason="monthly_grant",
            status="confirmed",
        )
        db.add(tx)
        granted_count += 1

    await db.commit()

    return {
        "status": "ok",
        "granted_count": granted_count,
        "expired_count": expired_count,
        "timestamp": now.isoformat(),
    }


@router.post("/expire-check")
async def expire_check(
    _auth: str = Depends(verify_cron_secret),
    db: AsyncSession = Depends(get_db),
):
    """单独的会员过期检查（可由更频繁的 cron 调用）"""

    now = datetime.now(timezone.utc)
    expired_count = 0

    expired_result = await db.execute(
        select(User).where(
            and_(
                User.is_premium == True,
                User.premium_expires_at != None,
                User.premium_expires_at < now,
                User.subscription_tier != "founder_lifetime",
            )
        )
    )
    for user in expired_result.scalars().all():
        user.is_premium = False
        user.subscription_tier = "free"
        expired_count += 1

    await db.commit()

    return {"status": "ok", "expired_count": expired_count}


@router.post("/expiry-reminder")
async def expiry_reminder(
    _auth: str = Depends(verify_cron_secret),
    db: AsyncSession = Depends(get_db),
):
    """
    会员到期前提醒（由 cron 每天调用）
    - 找出 3 天内到期的订阅用户
    - 发送到期提醒邮件
    """

    now = datetime.now(timezone.utc)
    reminder_cutoff = now + timedelta(days=3)

    result = await db.execute(
        select(User).where(
            and_(
                User.is_premium == True,
                User.premium_expires_at != None,
                User.premium_expires_at > now,
                User.premium_expires_at < reminder_cutoff,
                User.subscription_tier.in_(["premium_monthly", "premium_yearly"]),
            )
        )
    )
    users_to_remind = result.scalars().all()

    reminded_count = 0
    for user in users_to_remind:
        try:
            from utils.email import send_email_async
            days_left = (user.premium_expires_at - now).days
            tier_label = "年度" if user.subscription_tier == "premium_yearly" else "月度"
            await send_email_async(
                to_email=user.email,
                subject=f"您的 Fate OS {tier_label}会员将在 {days_left} 天后到期",
                html_body=f"""尊敬的用户：

您的 Fate OS {tier_label}会员将于 {user.premium_expires_at.strftime('%Y年%m月%d日')} 到期。

到期后，以下权益将受到影响：
- 推命报告将恢复为免费版预览
- 每日黄历将显示基础信息
- 事件复盘将按 ¥19.9/次 计费

如需续费，请登录后访问 pricing 页面。

—— Profile Mirror团队""",
            )
            reminded_count += 1
        except Exception as e:
            logger.warning(f"[EXPIRY-REMINDER] Failed to send email to {user.email}: {e}")

    return {
        "status": "ok",
        "reminded_count": reminded_count,
        "total_expiring": len(users_to_remind),
    }


@router.post("/cleanup-readings")
async def cleanup_old_readings(
    _auth: str = Depends(verify_cron_secret),
    db: AsyncSession = Depends(get_db),
):
    """
    清除超过 7 天的推命内容（由 cron 每天调用）
    删除 7 天前创建的 Reading 记录
    """

    cutoff = datetime.now(timezone.utc) - timedelta(days=7)

    # 删除旧推命记录（排除已付费/已解锁的报告）
    result = await db.execute(
        delete(Reading).where(
            Reading.created_at < cutoff,
            Reading.is_detail_unlocked == False,  # 保留用户付费解锁的报告
        )
    )
    deleted_count = result.rowcount
    await db.commit()

    logger.info(f"[CLEANUP-READINGS] Deleted {deleted_count} readings older than 7 days")
    return {"status": "ok", "deleted_count": deleted_count}


@router.post("/cancel-expired-orders")
async def cancel_expired_orders(
    _auth: str = Depends(verify_cron_secret),
    db: AsyncSession = Depends(get_db),
):
    """
    取消超过 30 分钟未支付的订单（由 cron 每 5 分钟调用）
    将 pending 状态超过 30 分钟的订单标记为 cancelled
    """

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=30)

    result = await db.execute(
        select(Order).where(
            and_(
                Order.status == OrderStatus.pending,
                Order.created_at < cutoff,
            )
        )
    )
    expired_orders = result.scalars().all()

    cancelled_count = 0
    for order in expired_orders:
        order.status = OrderStatus.cancelled
        cancelled_count += 1

    await db.commit()

    logger.info(f"[CANCEL-ORDERS] Cancelled {cancelled_count} orders expired > 30min")
    return {"status": "ok", "cancelled_count": cancelled_count}


@router.post("/auto-confirm-orders")
async def auto_confirm_expired_qr_orders(
    _auth: str = Depends(verify_cron_secret),
    db: AsyncSession = Depends(get_db),
):
    """
    自动确认超时的收款码订单 — ¥50 以下超过 30 分钟的 processing 订单自动激活。
    """

    from api.routers.personal_payments import _activate_order

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=30)
    result = await db.execute(
        select(Order).where(
            Order.status == OrderStatus.processing,
            Order.created_at < cutoff,
            Order.total_cny <= 50.0,
        )
    )
    orders = result.scalars().all()

    activated_count = 0
    for order in orders:
        try:
            await _activate_order(db, order)
            activated_count += 1
        except Exception as e:
            logger.warning(f"[AUTO-CONFIRM] Failed to activate {order.order_no}: {e}")

    await db.commit()
    logger.info(f"[AUTO-CONFIRM] Auto-activated {activated_count} expired QR orders (≤¥50)")
    return {"status": "ok", "activated_count": activated_count}
