"""星尘积分系统 API"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, CreditTransaction
from auth.dependencies import get_current_user, require_user

router = APIRouter()

# ── 星尘消耗规则 ────────────────────────────────────────────────────────────
COST_CHAT = 3          # AI 聊天每轮
COST_FOLLOWUP = 5      # 追问每轮
COST_EVENT_RETRO = 20  # 事件复盘

# ── 会员月度额度 ────────────────────────────────────────────────────────────
MONTHLY_QUOTA = {
    None: 0,           # 免费用户（仅首次赠送100）
    "trial": 100,
    "premium_monthly": 500,
    "premium_yearly": 2000,
    "founder_lifetime": 999999,  # 无限
}


class DeductRequest(BaseModel):
    amount: int
    transaction_type: str  # chat/followup/event/reading
    description: Optional[str] = None
    reference_id: Optional[str] = None


class GrantRequest(BaseModel):
    user_id: str
    amount: int
    transaction_type: str = "grant"
    description: Optional[str] = None
    reference_id: Optional[str] = None


@router.get("/balance")
async def get_balance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """查询星尘余额"""
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    return {
        "balance": user.stardust_balance,
        "lifetime_earned": user.stardust_lifetime_earned,
        "monthly_quota": MONTHLY_QUOTA.get(user.subscription_tier, 0),
    }


@router.get("/history")
async def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """查询星尘流水"""
    offset = (page - 1) * page_size

    # 获取总数
    count_result = await db.execute(
        select(func.count(CreditTransaction.id)).where(CreditTransaction.user_id == current_user.id)
    )
    total = count_result.scalar() or 0

    # 获取流水
    result = await db.execute(
        select(CreditTransaction)
        .where(CreditTransaction.user_id == current_user.id)
        .order_by(CreditTransaction.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    transactions = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "id": t.id,
                "amount": t.amount,
                "balance_after": t.balance_after,
                "transaction_type": t.transaction_type,
                "description": t.description,
                "reference_id": t.reference_id,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in transactions
        ],
    }


@router.post("/deduct")
async def deduct_credits(
    req: DeductRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """扣除星尘（用户调用）"""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="扣除数量必须大于0")

    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    # 创始会员无限星尘
    if user.is_founder:
        # 记录流水但不实际扣除
        tx = CreditTransaction(
            user_id=user.id,
            amount=-req.amount,
            balance_after=user.stardust_balance,
            transaction_type=req.transaction_type,
            description=req.description or f"消耗 {req.amount} 星尘",
            reference_id=req.reference_id,
        )
        db.add(tx)
        await db.commit()
        return {"success": True, "balance": user.stardust_balance, "deducted": 0}

    # 会员免费：聊天和追问不扣星尘
    if user.is_premium and req.transaction_type in ("chat", "followup"):
        tx = CreditTransaction(
            user_id=user.id,
            amount=0,
            balance_after=user.stardust_balance,
            transaction_type=req.transaction_type,
            description="会员免费",
            reference_id=req.reference_id,
        )
        db.add(tx)
        await db.commit()
        return {"success": True, "balance": user.stardust_balance, "deducted": 0}

    # 检查余额
    if user.stardust_balance < req.amount:
        raise HTTPException(status_code=400, detail=f"星尘不足，当前余额 {user.stardust_balance}")

    # 扣除
    user.stardust_balance -= req.amount

    tx = CreditTransaction(
        user_id=user.id,
        amount=-req.amount,
        balance_after=user.stardust_balance,
        transaction_type=req.transaction_type,
        description=req.description or f"消耗 {req.amount} 星尘",
        reference_id=req.reference_id,
    )
    db.add(tx)
    await db.commit()

    return {"success": True, "balance": user.stardust_balance, "deducted": req.amount}


@router.post("/grant")
async def grant_credits(
    req: GrantRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """赠送星尘（管理员或系统调用）"""
    # 简单权限检查：只能给自己赠送（开发模式）
    # 生产环境应加 admin 权限检查
    user_id = req.user_id if req.user_id == current_user.id else current_user.id

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="赠送数量必须大于0")

    user.stardust_balance += req.amount
    user.stardust_lifetime_earned += req.amount

    tx = CreditTransaction(
        user_id=user.id,
        amount=req.amount,
        balance_after=user.stardust_balance,
        transaction_type=req.transaction_type,
        description=req.description or f"获得 {req.amount} 星尘",
        reference_id=req.reference_id,
    )
    db.add(tx)
    await db.commit()

    return {"success": True, "balance": user.stardust_balance, "granted": req.amount}


@router.post("/monthly-grant")
async def monthly_grant(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """月度星尘额度发放（每月1号自动触发，或手动调用）"""
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    quota = MONTHLY_QUOTA.get(user.subscription_tier, 0)
    if quota <= 0:
        raise HTTPException(status_code=400, detail="当前等级无月度额度")

    user.stardust_balance += quota
    user.stardust_lifetime_earned += quota

    tx = CreditTransaction(
        user_id=user.id,
        amount=quota,
        balance_after=user.stardust_balance,
        transaction_type="monthly_grant",
        description=f"{user.subscription_tier} 月度额度 +{quota}",
    )
    db.add(tx)
    await db.commit()

    return {"success": True, "balance": user.stardust_balance, "granted": quota}
