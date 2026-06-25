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
COOLDOWN_HOURS = 24

# ── 防刷: Redis 优先，内存 fallback ──────────────────────────────────────────
_apply_cooldown: dict[str, float] = {}  # 内存 fallback
_last_cleanup: float = 0.0


async def _check_cooldown(key: str) -> int:
    """检查冷却时间。返回剩余秒数（0=可申请）。"""
    from services.redis_client import _get_redis
    r = await _get_redis()
    if r:
        ttl = await r.ttl(f"ref_cooldown:{key}")
        return max(0, ttl)
    # 内存 fallback
    now = time.time()
    ts = _apply_cooldown.get(key)
    if ts and (now - ts) < COOLDOWN_HOURS * 3600:
        return int((COOLDOWN_HOURS * 3600) - (now - ts))
    return 0


async def _set_cooldown(key: str) -> None:
    """设置冷却时间（24h）。"""
    from services.redis_client import _get_redis
    r = await _get_redis()
    if r:
        await r.setex(f"ref_cooldown:{key}", COOLDOWN_HOURS * 3600, "1")
        return
    # 内存 fallback
    global _last_cleanup
    now = time.time()
    if now - _last_cleanup > 3600:
        expired = [k for k, ts in _apply_cooldown.items() if now - ts > COOLDOWN_HOURS * 3600]
        for k in expired:
            del _apply_cooldown[k]
        _last_cleanup = now
    _apply_cooldown[key] = now


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

    from config import get_settings as _gs
    referral_link = f"{_gs().FRONTEND_URL.rstrip('/')}/register?ref={user.referral_code}"

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
    # ── 防刷: IP 限流 ──
    client_ip = request.client.host if request.client else "unknown"
    ip_key = f"ip:{client_ip}"
    ip_remaining = await _check_cooldown(ip_key)
    if ip_remaining > 0:
        raise HTTPException(
            status_code=429,
            detail=f"邀请码使用过于频繁，请 {ip_remaining // 60} 分钟后重试"
        )

    # ── 防刷: 设备指纹限流 ──
    if req.device_fingerprint:
        fp_key = f"fp:{req.device_fingerprint}"
        fp_remaining = await _check_cooldown(fp_key)
        if fp_remaining > 0:
            raise HTTPException(
                status_code=429,
                detail=f"该设备已使用过邀请码，请 {fp_remaining // 60} 分钟后重试"
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

    # 查找邀请人
    referrer_result = await db.execute(
        select(User).where(User.referral_code == req.code.upper())
    )
    referrer = referrer_result.scalar_one_or_none()
    if not referrer:
        raise HTTPException(status_code=404, detail="邀请码无效")

    if referrer.id == user.id:
        raise HTTPException(status_code=400, detail="不能使用自己的邀请码")

    # 检查邀请人数上限
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

    # 给邀请者加星尘
    referrer_result2 = await db.execute(
        select(User).where(User.id == referrer.id).with_for_update()
    )
    referrer_user = referrer_result2.scalar_one_or_none()
    if not referrer_user:
        raise HTTPException(status_code=500, detail="推荐人账户异常，请稍后重试")
    referrer_user.stardust_balance += REFERRAL_REWARD
    tx_referrer = CreditTransaction(
        user_id=referrer_user.id,
        amount=REFERRAL_REWARD,
        balance_after=referrer_user.stardust_balance,
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
    await _set_cooldown(ip_key)
    if req.device_fingerprint:
        await _set_cooldown(f"fp:{req.device_fingerprint}")

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
