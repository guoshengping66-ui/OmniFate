"""星盟邀请系统 API — 含防刷风控"""
import secrets
import time
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, ReferralReward, CreditTransaction
from auth.dependencies import get_current_user, require_user

router = APIRouter()

REFERRAL_REWARD = 20  # 邀请奖励星尘
MAX_REFERRALS = 50    # 每人最多邀请 50 人

# ── 防刷: 内存限流 (IP + 设备指纹) ────────────────────────────────────────────
_apply_cooldown: dict[str, float] = {}  # key → last_apply_timestamp
COOLDOWN_HOURS = 24
_last_cleanup: float = 0.0  # timestamp of last cleanup


def _cleanup_cooldown() -> None:
    """Periodically remove expired entries to prevent unbounded memory growth."""
    global _last_cleanup
    now = time.time()
    # Only clean up at most once per hour
    if now - _last_cleanup < 3600:
        return
    _last_cleanup = now
    expired_keys = [k for k, ts in _apply_cooldown.items() if now - ts > COOLDOWN_HOURS * 3600]
    for k in expired_keys:
        del _apply_cooldown[k]


def _generate_referral_code() -> str:
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(secrets.choice(chars) for _ in range(8))


class ApplyCodeRequest(BaseModel):
    code: str
    device_fingerprint: Optional[str] = None


@router.get("/my-code")
async def get_my_code(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """获取或生成邀请码"""
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if not user.referral_code:
        code = _generate_referral_code()
        for _ in range(20):  # Max 20 attempts to find unique code
            existing = await db.execute(select(User).where(User.referral_code == code))
            if not existing.scalar_one_or_none():
                break
            code = _generate_referral_code()
        else:
            raise HTTPException(status_code=500, detail="无法生成唯一邀请码，请稍后重试")
        user.referral_code = code
        await db.commit()

    referral_link = f"https://khanfate.com/register?ref={user.referral_code}"

    return {"code": user.referral_code, "link": referral_link}


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """获取邀请统计"""
    count_result = await db.execute(
        select(func.count(User.id)).where(User.referred_by == current_user.id)
    )
    invited_count = count_result.scalar() or 0

    rewards_result = await db.execute(
        select(func.coalesce(func.sum(ReferralReward.reward_amount), 0))
        .where(ReferralReward.referrer_id == current_user.id)
    )
    rewards_earned = rewards_result.scalar() or 0

    return {"invited_count": invited_count, "rewards_earned": rewards_earned}


@router.post("/apply")
async def apply_referral_code(
    req: ApplyCodeRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    被邀请人输入邀请码（含防刷逻辑）
    - 同一 IP 24h 内仅能被邀请一次
    - 同一设备指纹 24h 内仅能被邀请一次
    """
    _cleanup_cooldown()

    # ── 防刷: IP 限流 ──
    client_ip = request.client.host if request.client else "unknown"
    ip_key = f"ip:{client_ip}"
    now = time.time()
    if ip_key in _apply_cooldown:
        elapsed_hours = (now - _apply_cooldown[ip_key]) / 3600
        if elapsed_hours < COOLDOWN_HOURS:
            remaining = int((COOLDOWN_HOURS - elapsed_hours) * 60)
            raise HTTPException(
                status_code=429,
                detail=f"邀请码使用过于频繁，请 {remaining} 分钟后重试"
            )

    # ── 防刷: 设备指纹限流 ──
    if req.device_fingerprint:
        fp_key = f"fp:{req.device_fingerprint}"
        if fp_key in _apply_cooldown:
            elapsed_hours = (now - _apply_cooldown[fp_key]) / 3600
            if elapsed_hours < COOLDOWN_HOURS:
                remaining = int((COOLDOWN_HOURS - elapsed_hours) * 60)
                raise HTTPException(
                    status_code=429,
                    detail=f"该设备已使用过邀请码，请 {remaining} 分钟后重试"
                )

    # 检查是否已经被邀请过
    result = await db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if user.referred_by:
        raise HTTPException(status_code=400, detail="您已经使用过邀请码")

    # 查找邀请人 (lock row early to prevent TOCTOU race)
    referrer_result = await db.execute(
        select(User).where(User.referral_code == req.code.upper()).with_for_update()
    )
    referrer = referrer_result.scalar_one_or_none()
    if not referrer:
        raise HTTPException(status_code=404, detail="邀请码无效")

    if referrer.id == user.id:
        raise HTTPException(status_code=400, detail="不能使用自己的邀请码")

    # 检查邀请人数上限 (referrer row is already locked)
    ref_count_result = await db.execute(
        select(func.count(User.id)).where(User.referred_by == referrer.id)
    )
    ref_count = ref_count_result.scalar() or 0
    if ref_count >= MAX_REFERRALS:
        raise HTTPException(status_code=400, detail="该邀请人已达邀请上限")

    # 设置邀请关系
    user.referred_by = referrer.id

    # 给被邀请者加星尘
    user.stardust_balance += REFERRAL_REWARD
    tx_referred = CreditTransaction(
        user_id=user.id,
        amount=REFERRAL_REWARD,
        balance_after=user.stardust_balance,
        reason="referral",
        reference_id=referrer.id,
        status="confirmed",
    )
    db.add(tx_referred)

    # 给邀请者加星尘 (referrer already locked from earlier query)
    referrer.stardust_balance += REFERRAL_REWARD
    tx_referrer = CreditTransaction(
        user_id=referrer.id,
        amount=REFERRAL_REWARD,
        balance_after=referrer.stardust_balance,
        reason="referral",
        reference_id=user.id,
        status="confirmed",
    )
    db.add(tx_referrer)

    # 插入奖励记录
    reward = ReferralReward(
        referrer_id=referrer.id,
        referred_user_id=user.id,
        reward_amount=REFERRAL_REWARD,
    )
    db.add(reward)

    # 更新冷却时间
    _apply_cooldown[ip_key] = now
    if req.device_fingerprint:
        _apply_cooldown[f"fp:{req.device_fingerprint}"] = now

    await db.commit()

    return {"success": True, "referrer_name": referrer.display_name}


@router.get("/rewards")
async def get_rewards(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """获取奖励流水"""
    result = await db.execute(
        select(ReferralReward)
        .where(ReferralReward.referrer_id == current_user.id)
        .order_by(ReferralReward.created_at.desc())
        .limit(50)
    )
    rewards = result.scalars().all()

    return {
        "items": [
            {
                "id": r.id,
                "referred_user_id": r.referred_user_id,
                "reward_amount": r.reward_amount,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rewards
        ],
    }
