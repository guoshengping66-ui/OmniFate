"""定时任务 API — 月度星尘发放 + 会员状态维护 + 到期提醒"""
import hmac
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, CreditTransaction
from config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter()
settings = get_settings()

MONTHLY_GRANTS = {
    "premium_monthly": 100,
    "premium_yearly": 150,
    "founder_lifetime": 500,
}


def _verify_cron_secret(authorization: str = Header(None)):
    """验证 CRON_SECRET 防止外部滥用"""
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    # 支持 "Bearer <token>" 格式
    token = authorization.replace("Bearer ", "").strip()
    if not hmac.compare_digest(token, settings.CRON_SECRET):
        raise HTTPException(status_code=403, detail="Invalid cron secret")


@router.post("/monthly-stardust")
async def monthly_stardust_grant(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """
    月度星尘自动注入（由 Vercel Cron / 外部 cron 触发）
    - 扫描所有有效订阅用户
    - 按 tier 注入星尘
    - 检查并过期过期会员
    """
    _verify_cron_secret(authorization)

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

        # 悲观锁
        user_result = await db.execute(
            select(User).where(User.id == user.id).with_for_update()
        )
        locked_user = user_result.scalar_one()
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
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """单独的会员过期检查（可由更频繁的 cron 调用）"""
    _verify_cron_secret(authorization)

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
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """
    会员到期前提醒（由 cron 每天调用）
    - 找出 3 天内到期的订阅用户
    - 发送到期提醒邮件
    """
    _verify_cron_secret(authorization)

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
            from api.routers.auth import _send_email
            days_left = (user.premium_expires_at - now).days
            tier_label = "年度" if user.subscription_tier == "premium_yearly" else "月度"
            await _send_email(
                to_email=user.email,
                subject=f"您的 Fate OS {tier_label}会员将在 {days_left} 天后到期",
                body=f"""尊敬的用户：

您的 Fate OS {tier_label}会员将于 {user.premium_expires_at.strftime('%Y年%m月%d日')} 到期。

到期后，以下权益将受到影响：
- 推命报告将恢复为免费版预览
- 每日黄历将显示基础信息
- 事件复盘将按 ¥19.9/次 计费

如需续费，请登录后访问 pricing 页面。

—— 命盘智镜团队""",
            )
            reminded_count += 1
        except Exception as e:
            logger.warning(f"[EXPIRY-REMINDER] Failed to send email to {user.email}: {e}")

    return {
        "status": "ok",
        "reminded_count": reminded_count,
        "total_expiring": len(users_to_remind),
    }
