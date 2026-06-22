"""星尘积分系统 API — 支持预扣/确认/回滚原子操作 + 阈值监控"""
import logging
from datetime import datetime, timezone, date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, CreditTransaction
from auth.dependencies import get_current_user, require_user
from config import get_settings
from utils.cron_auth import verify_cron_secret

logger = logging.getLogger("credits")

router = APIRouter()
settings = get_settings()

# ── 星尘消耗规则 ──────────────────────────────────────────────────────────────
STARDUST_COST = {
    "report_detailed": 30,     # 精读报告（五维诊断+行动建议，不含工人详细报告）
    "report_unlock": 100,      # 全维报告（完整工人报告+AI追问资格）
    "event_retro": 30,         # 事件复盘
    "follow_up": 10,           # AI 追问
    "energy_radar": 5,         # 能量雷达
    "divination": 1,           # 额外抽签
}

# 会员免费项
MEMBER_FREE_ITEMS = {"energy_radar"}

# 年度会员星尘折扣
YEARLY_DISCOUNT = 0.88
FOUNDER_DISCOUNT = 0  # 创始会员无限

MONTHLY_GRANTS = {
    "premium_monthly": 100,
    "premium_yearly": 150,
    "founder_lifetime": 500,
}


class DeductRequest(BaseModel):
    action: str  # report_unlock|event_retro|follow_up|energy_radar|divination
    reference_id: Optional[str] = None


class RefundRequest(BaseModel):
    transaction_id: str
    reason: Optional[str] = None


class GrantRequest(BaseModel):
    amount: int
    reason: str  # monthly_grant|register_bonus|referral|manual
    reference_id: Optional[str] = None


def _calc_discount(user: User, action: str) -> float:
    """根据会员等级计算星尘折扣"""
    if user.is_founder:
        return FOUNDER_DISCOUNT
    if user.subscription_tier == "premium_yearly":
        return YEARLY_DISCOUNT
    return 1.0


@router.get("/balance")
async def get_balance(
    current_user: User = Depends(require_user),
):
    """查询星尘余额"""
    return {
        "balance": current_user.stardust_balance,
        "lifetime_earned": current_user.stardust_lifetime_earned,
    }


@router.get("/history")
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
    limit: int = Query(50, le=200),
):
    """查询星尘流水"""
    result = await db.execute(
        select(CreditTransaction)
        .where(CreditTransaction.user_id == current_user.id)
        .order_by(CreditTransaction.created_at.desc())
        .limit(limit)
    )
    txs = result.scalars().all()
    return {
        "items": [
            {
                "id": tx.id,
                "amount": tx.amount,
                "balance_after": tx.balance_after,
                "reason": tx.reason,
                "reference_id": tx.reference_id,
                "status": tx.status,
                "created_at": tx.created_at.isoformat() if tx.created_at else None,
            }
            for tx in txs
        ]
    }


@router.post("/deduct")
async def deduct_stardust(
    req: DeductRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    预扣星尘（原子操作）
    流程: 检查余额 → 悲观锁扣减 → 创建 pending 流水 → 返回 transaction_id
    前端完成 AI 推演后调用 /confirm 或 /refund
    """
    if req.action not in STARDUST_COST:
        raise HTTPException(status_code=400, detail=f"未知操作: {req.action}")

    # 会员免费检查
    if req.action in MEMBER_FREE_ITEMS and current_user.is_premium:
        # 记录但不扣费
        tx = CreditTransaction(
            user_id=current_user.id,
            amount=0,
            balance_after=current_user.stardust_balance,
            reason=req.action,
            reference_id=req.reference_id,
            status="confirmed",
        )
        db.add(tx)
        await db.commit()
        return {"transaction_id": tx.id, "deducted": 0, "message": "会员免费"}

    # 计算实际消耗
    base_cost = STARDUST_COST[req.action]
    discount = _calc_discount(current_user, req.action)
    actual_cost = int(base_cost * discount) if discount > 0 else 0

    # 悲观锁: SELECT ... FOR UPDATE
    result = await db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    )
    user = result.scalar_one()

    if user.stardust_balance < actual_cost:
        raise HTTPException(
            status_code=402,
            detail=f"星辰能量不足: 需要 {actual_cost} 颗，当前仅 {user.stardust_balance} 颗"
        )

    # 扣减
    user.stardust_balance -= actual_cost

    # 创建 pending 流水
    tx = CreditTransaction(
        user_id=user.id,
        amount=-actual_cost,
        balance_after=user.stardust_balance,
        reason=req.action,
        reference_id=req.reference_id,
        status="pending",
    )
    db.add(tx)
    await db.commit()

    # ── 异常消费阈值监控 ──────────────────────────────────────────────────────
    if not current_user.is_founder:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        daily_result = await db.execute(
            select(func.coalesce(func.sum(func.abs(CreditTransaction.amount)), 0)).where(
                and_(
                    CreditTransaction.user_id == current_user.id,
                    CreditTransaction.amount < 0,
                    CreditTransaction.created_at >= today_start,
                )
            )
        )
        daily_consumed = daily_result.scalar() or 0
        if daily_consumed > 200:
            logger.warning(
                f"[THRESHOLD] 用户 {current_user.id} 今日消耗 {daily_consumed} 星尘，超过阈值 200"
            )

    return {
        "transaction_id": tx.id,
        "deducted": actual_cost,
        "base_cost": base_cost,
        "discount": discount,
        "balance_after": user.stardust_balance,
    }


@router.post("/confirm")
async def confirm_deduct(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """确认扣费（AI 推演成功后调用）"""
    result = await db.execute(
        select(CreditTransaction).where(
            CreditTransaction.id == transaction_id,
            CreditTransaction.user_id == current_user.id,
        ).with_for_update()
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="交易记录不存在")
    if tx.status != "pending":
        raise HTTPException(status_code=400, detail=f"交易状态异常: {tx.status}")

    # Auto-refund if pending transaction has expired (30 min timeout)
    if tx.created_at:
        now_utc = datetime.now(timezone.utc)
        created_at = tx.created_at if tx.created_at.tzinfo else tx.created_at.replace(tzinfo=timezone.utc)
        age = now_utc - created_at
        if age > timedelta(minutes=30):
            user_result = await db.execute(
                select(User).where(User.id == current_user.id).with_for_update()
            )
            user = user_result.scalar_one()
            user.stardust_balance -= tx.amount  # tx.amount is negative, so -= negative = add back
            tx.status = "refunded"
            refund_tx = CreditTransaction(
                user_id=user.id,
                amount=-tx.amount,
                balance_after=user.stardust_balance,
                reason="refund",
                reference_id=transaction_id,
                status="confirmed",
            )
            db.add(refund_tx)
            await db.commit()
            raise HTTPException(status_code=400, detail="Pending transaction expired and has been refunded")

    tx.status = "confirmed"
    await db.commit()
    return {"status": "confirmed"}


@router.post("/refund")
async def refund_deduct(
    req: RefundRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """回滚扣费（AI 推演失败后调用）"""
    result = await db.execute(
        select(CreditTransaction).where(
            CreditTransaction.id == req.transaction_id,
            CreditTransaction.user_id == current_user.id,
        ).with_for_update()
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="交易记录不存在")
    if tx.status != "pending":
        raise HTTPException(status_code=400, detail=f"交易状态异常: {tx.status}")

    # 悲观锁恢复余额
    user_result = await db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    )
    user = user_result.scalar_one()

    user.stardust_balance -= tx.amount  # tx.amount 是负数，减去负数=加回

    # 标记原交易为已退款
    tx.status = "refunded"

    # 创建退款流水
    refund_tx = CreditTransaction(
        user_id=user.id,
        amount=-tx.amount,  # 正数
        balance_after=user.stardust_balance,
        reason="refund",
        reference_id=req.transaction_id,
        status="confirmed",
    )
    db.add(refund_tx)
    await db.commit()

    return {
        "status": "refunded",
        "balance_after": user.stardust_balance,
    }


@router.post("/grant")
async def grant_stardust(
    req: GrantRequest,
    db: AsyncSession = Depends(get_db),
    _auth: str = Depends(verify_cron_secret),
):
    """
    赠送星尘 — 仅限管理员/系统调用（CRON_SECRET 鉴权）
    不再允许普通用户自行调用
    """
    if req.amount <= 0 or req.amount > 10000:
        raise HTTPException(status_code=400, detail="赠送数量必须在 1-10000 之间")

    # 需要指定 user_id（管理员为其他用户发放）
    if not req.reference_id:
        raise HTTPException(status_code=400, detail="管理员调用需在 reference_id 中指定目标用户 ID")

    result = await db.execute(
        select(User).where(User.id == req.reference_id).with_for_update()
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="目标用户不存在")

    user.stardust_balance += req.amount
    user.stardust_lifetime_earned += req.amount

    tx = CreditTransaction(
        user_id=user.id,
        amount=req.amount,
        balance_after=user.stardust_balance,
        reason=req.reason,
        reference_id=req.reference_id,
        status="confirmed",
    )
    db.add(tx)
    await db.commit()

    return {
        "status": "granted",
        "amount": req.amount,
        "balance_after": user.stardust_balance,
    }


@router.post("/monthly-grant")
async def monthly_grant(
    db: AsyncSession = Depends(get_db),
    _auth: str = Depends(verify_cron_secret),
    user_id: Optional[str] = Query(None, description="目标用户 ID（管理员调用时指定）"),
):
    """
    月度星尘发放 — 仅限管理员/cron 调用（CRON_SECRET 鉴权）
    包含幂等性检查：同一用户同一月只发放一次
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="需指定 user_id")

    result = await db.execute(
        select(User).where(User.id == user_id).with_for_update()
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    tier = user.subscription_tier
    if tier not in MONTHLY_GRANTS:
        raise HTTPException(status_code=400, detail="用户无月度额度")

    # 幂等性检查：查询本月是否已发放
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    existing = await db.execute(
        select(CreditTransaction).where(
            CreditTransaction.user_id == user_id,
            CreditTransaction.reason == "monthly_grant",
            CreditTransaction.created_at >= month_start,
        )
    )
    if existing.scalar_one_or_none():
        return {
            "status": "already_granted",
            "message": "本月已发放，跳过",
            "balance_after": user.stardust_balance,
        }

    grant_amount = MONTHLY_GRANTS[tier]

    user.stardust_balance += grant_amount
    user.stardust_lifetime_earned += grant_amount

    tx = CreditTransaction(
        user_id=user.id,
        amount=grant_amount,
        balance_after=user.stardust_balance,
        reason="monthly_grant",
        status="confirmed",
    )
    db.add(tx)
    await db.commit()

    return {
        "status": "granted",
        "amount": grant_amount,
        "balance_after": user.stardust_balance,
    }


# ── 管理审计接口 ────────────────────────────────────────────────────────────────


@router.get("/admin/audit")
async def admin_audit(
    _auth: str = Depends(verify_cron_secret),
    db: AsyncSession = Depends(get_db),
):
    """
    管理侧审计聚合（CRON_SECRET 鉴权）：
    - 全站总星尘存量
    - 今日消耗总量
    - 异常消耗用户（今日消耗 > 200）
    """
    # 全站总星尘存量
    total_balance_result = await db.execute(
        select(func.coalesce(func.sum(User.stardust_balance), 0))
    )
    total_balance = total_balance_result.scalar() or 0

    # 今日消耗总量
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_consumption_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(CreditTransaction.amount)), 0)).where(
            and_(
                CreditTransaction.amount < 0,
                CreditTransaction.created_at >= today_start,
            )
        )
    )
    today_consumption = today_consumption_result.scalar() or 0

    # 异常消耗用户（今日消耗 > 200）
    anomaly_result = await db.execute(
        select(
            CreditTransaction.user_id,
            func.sum(func.abs(CreditTransaction.amount)).label("daily_total"),
        )
        .where(
            and_(
                CreditTransaction.amount < 0,
                CreditTransaction.created_at >= today_start,
            )
        )
        .group_by(CreditTransaction.user_id)
        .having(func.sum(func.abs(CreditTransaction.amount)) > 200)
    )
    anomaly_users = [
        {"user_id": row.user_id, "daily_consumed": row.daily_total}
        for row in anomaly_result.all()
    ]

    return {
        "total_stardust_balance": total_balance,
        "today_consumption": today_consumption,
        "anomaly_users": anomaly_users,
        "anomaly_count": len(anomaly_users),
    }
