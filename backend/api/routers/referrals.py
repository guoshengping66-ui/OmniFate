"""星盟邀请系统 API"""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, ReferralReward
from auth.dependencies import get_current_user, require_user

router = APIRouter()

MAX_REFERRALS = 50  # 每人最多邀请人数
TRIAL_DAYS_REWARD = 3  # 邀请奖励：3天会员试用
ACCURACY_BOOST_PERCENT = 10  # 邀请奖励：10%精准度提升


def _generate_referral_code() -> str:
    """生成6位邀请码"""
    return secrets.token_hex(3).upper()


class ApplyCodeRequest(BaseModel):
    referral_code: str


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

    # 如果没有邀请码，生成一个
    if not user.referral_code:
        code = _generate_referral_code()
        # 确保唯一
        while True:
            existing = await db.execute(select(User).where(User.referral_code == code))
            if not existing.scalar_one_or_none():
                break
            code = _generate_referral_code()
        user.referral_code = code
        await db.commit()

    referral_link = f"https://khanfate.com/referral?code={user.referral_code}"

    return {
        "referral_code": user.referral_code,
        "referral_link": referral_link,
    }


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """获取邀请统计"""
    # 已邀请人数
    count_result = await db.execute(
        select(func.count(User.id)).where(User.referred_by == current_user.id)
    )
    invited_count = count_result.scalar() or 0

    # 已获得奖励
    rewards_result = await db.execute(
        select(func.count(ReferralReward.id)).where(
            ReferralReward.referrer_id == current_user.id,
            ReferralReward.is_claimed == True,
        )
    )
    rewards_claimed = rewards_result.scalar() or 0

    # 待领取奖励
    pending_result = await db.execute(
        select(func.count(ReferralReward.id)).where(
            ReferralReward.referrer_id == current_user.id,
            ReferralReward.is_claimed == False,
        )
    )
    pending_rewards = pending_result.scalar() or 0

    return {
        "invited_count": invited_count,
        "max_referrals": MAX_REFERRALS,
        "rewards_claimed": rewards_claimed,
        "pending_rewards": pending_rewards,
        "can_invite": invited_count < MAX_REFERRALS,
    }


@router.post("/apply")
async def apply_referral_code(
    req: ApplyCodeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """被邀请人输入邀请码"""
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    # 检查是否已经被邀请过
    if user.referred_by:
        raise HTTPException(status_code=400, detail="您已经使用过邀请码")

    # 查找邀请人
    referrer_result = await db.execute(
        select(User).where(User.referral_code == req.referral_code.upper())
    )
    referrer = referrer_result.scalar_one_or_none()
    if not referrer:
        raise HTTPException(status_code=404, detail="邀请码无效")

    # 不能邀请自己
    if referrer.id == user.id:
        raise HTTPException(status_code=400, detail="不能使用自己的邀请码")

    # 检查邀请人是否达到上限
    count_result = await db.execute(
        select(func.count(User.id)).where(User.referred_by == referrer.id)
    )
    if (count_result.scalar() or 0) >= MAX_REFERRALS:
        raise HTTPException(status_code=400, detail="该邀请人已达邀请上限")

    # 设置邀请关系
    user.referred_by = referrer.id
    await db.commit()

    return {"success": "邀请码使用成功", "referrer_display_name": referrer.display_name}


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
                "reward_type": r.reward_type,
                "reward_value": r.reward_value,
                "is_claimed": r.is_claimed,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rewards
        ],
    }


@router.post("/claim-reward/{reward_id}")
async def claim_reward(
    reward_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """领取奖励"""
    result = await db.execute(
        select(ReferralReward).where(
            ReferralReward.id == reward_id,
            ReferralReward.referrer_id == current_user.id,
        )
    )
    reward = result.scalar_one_or_none()
    if not reward:
        raise HTTPException(status_code=404, detail="奖励不存在")

    if reward.is_claimed:
        raise HTTPException(status_code=400, detail="奖励已领取")

    # 领取奖励
    user_result = await db.execute(select(User).where(User.id == current_user.id))
    user = user_result.scalar_one_or_none()

    if reward.reward_type == "trial_days":
        # 延长会员时间
        if user.is_premium and user.premium_expires_at:
            user.premium_expires_at += timedelta(days=reward.reward_value)
        else:
            user.is_premium = True
            user.subscription_tier = "trial"
            user.premium_expires_at = datetime.now(timezone.utc) + timedelta(days=reward.reward_value)

    reward.is_claimed = True
    await db.commit()

    return {"success": True, "message": f"奖励已领取：{reward.reward_type}"}
