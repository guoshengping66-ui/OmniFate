"""
api/routers/fortune.py — 每周运势订阅 API

端点:
  POST /api/fortune/subscribe    — 保存订阅偏好
  GET  /api/fortune/subscription — 获取订阅状态
  GET  /api/fortune/weekly       — 获取本周运势
  POST /api/fortune/generate-all — cron 触发，为所有订阅用户生成本周运势
"""
import hmac
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import FortuneSubscription, WeeklyFortune, User
from auth.dependencies import require_user, get_current_user
from services.fortune_generator import (
    generate_weekly_fortune,
    get_user_birth_data,
    get_current_week_range,
)
from config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


# ── Request / Response Models ────────────────────────────────────────────────

class SubscribeRequest(BaseModel):
    frequency: str  # "weekly" | "daily" | "off"


# ── Subscribe ────────────────────────────────────────────────────────────────

@router.post("/subscribe")
async def subscribe(
    body: SubscribeRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """保存用户的运势订阅偏好"""
    if body.frequency not in ("weekly", "daily", "off"):
        raise HTTPException(status_code=400, detail="Invalid frequency")

    # Upsert subscription
    result = await db.execute(
        select(FortuneSubscription).where(FortuneSubscription.user_id == user.id)
    )
    sub = result.scalars().first()

    if sub:
        sub.frequency = body.frequency
        sub.is_active = body.frequency != "off"
        sub.updated_at = datetime.now(timezone.utc)
    else:
        sub = FortuneSubscription(
            user_id=user.id,
            frequency=body.frequency,
            is_active=body.frequency != "off",
        )
        db.add(sub)

    await db.commit()

    return {
        "status": "ok",
        "frequency": sub.frequency,
        "is_active": sub.is_active,
    }


# ── Get Subscription Status ─────────────────────────────────────────────────

@router.get("/subscription")
async def get_subscription(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取用户的订阅状态"""
    if not user:
        return {"frequency": "weekly", "is_active": False}

    result = await db.execute(
        select(FortuneSubscription).where(FortuneSubscription.user_id == user.id)
    )
    sub = result.scalars().first()

    if not sub:
        return {"frequency": "weekly", "is_active": False}

    return {
        "frequency": sub.frequency,
        "is_active": sub.is_active,
    }


# ── Get Weekly Fortune ──────────────────────────────────────────────────────

@router.get("/weekly")
async def get_weekly_fortune(
    locale: str = "zh",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取本周运势（如果已生成则返回缓存，否则实时生成）"""
    week_start, week_end = get_current_week_range()

    # Check if already generated
    if user:
        result = await db.execute(
            select(WeeklyFortune).where(
                and_(
                    WeeklyFortune.user_id == user.id,
                    WeeklyFortune.week_start == week_start,
                )
            )
        )
        existing = result.scalars().first()
        if existing:
            return _fortune_to_dict(existing, locale)

        # Get birth data for personalized fortune
        birth = await get_user_birth_data(db, user.id)
    else:
        birth = None

    # Generate on-the-fly
    fortune_data = generate_weekly_fortune(
        user_id=user.id if user else "anonymous",
        week_start=week_start,
        locale=locale,
        birth_year=birth.get("birth_year") if birth else None,
        birth_month=birth.get("birth_month") if birth else None,
        birth_day=birth.get("birth_day") if birth else None,
        birth_hour=birth.get("birth_hour") if birth else None,
        gender=birth.get("gender") if birth else None,
    )

    return {
        "week_start": week_start,
        "week_end": week_end,
        "is_read": False,
        **fortune_data,
    }


def _fortune_to_dict(f: WeeklyFortune, locale: str) -> dict:
    """Convert a WeeklyFortune model to API response dict."""
    return {
        "id": f.id,
        "week_start": f.week_start,
        "week_end": f.week_end,
        "score": f.score,
        "theme": f.theme,
        "lucky_color": f.lucky_color,
        "lucky_number": f.lucky_number,
        "lucky_direction": f.lucky_direction,
        "tarot_card": f.tarot_card,
        "tarot_desc": f.tarot_desc,
        "ai_insight": f.ai_insight,
        "daily_yi_ji": f.daily_yi_ji,
        "is_read": f.is_read,
    }


# ── Generate All (Cron) ─────────────────────────────────────────────────────

def _verify_cron_secret(authorization: str = Header(None)):
    """验证 CRON_SECRET"""
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.replace("Bearer ", "").strip()
    if not hmac.compare_digest(token, settings.CRON_SECRET):
        raise HTTPException(status_code=403, detail="Invalid cron secret")


@router.post("/generate-all")
async def generate_all_weekly_fortunes(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """
    由 cron 每周一触发，为所有活跃订阅用户生成本周运势。
    同时为所有有出生数据的用户生成（即使未订阅，也生成一份以供查看）。
    """
    _verify_cron_secret(authorization)

    week_start, week_end = get_current_week_range()
    generated_count = 0
    skipped_count = 0
    errors = []

    # Get all users with birth profiles
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(User).options(selectinload(User.birth_profiles))
    )
    all_users = result.scalars().unique().all()

    for user in all_users:
        try:
            # Skip if already generated this week
            existing = await db.execute(
                select(WeeklyFortune).where(
                    and_(
                        WeeklyFortune.user_id == user.id,
                        WeeklyFortune.week_start == week_start,
                    )
                )
            )
            if existing.scalars().first():
                skipped_count += 1
                continue

            # Get birth data
            birth = None
            if user.birth_profiles:
                bp = user.birth_profiles[0]
                birth = {
                    "birth_year": bp.birth_year,
                    "birth_month": bp.birth_month,
                    "birth_day": bp.birth_day,
                    "birth_hour": bp.birth_hour,
                    "gender": bp.gender.value if bp.gender else None,
                }

            if not birth:
                continue  # Skip users without birth data

            # Generate fortune
            fortune_data = generate_weekly_fortune(
                user_id=user.id,
                week_start=week_start,
                locale="zh",  # Default locale, will be re-generated per-request if needed
                birth_year=birth.get("birth_year"),
                birth_month=birth.get("birth_month"),
                birth_day=birth.get("birth_day"),
                birth_hour=birth.get("birth_hour"),
                gender=birth.get("gender"),
            )

            # Save to database
            wf = WeeklyFortune(
                user_id=user.id,
                week_start=week_start,
                week_end=week_end,
                score=fortune_data["score"],
                theme=fortune_data["theme"],
                lucky_color=fortune_data["lucky_color"],
                lucky_number=fortune_data["lucky_number"],
                lucky_direction=fortune_data["lucky_direction"],
                tarot_card=fortune_data["tarot_card"],
                tarot_desc=fortune_data["tarot_desc"],
                ai_insight=fortune_data["ai_insight"],
                daily_yi_ji=fortune_data["daily_yi_ji"],
            )
            db.add(wf)
            generated_count += 1

        except Exception as e:
            logger.warning(f"[FORTUNE-GEN] Failed for user {user.id}: {e}")
            errors.append(str(user.id))

    await db.commit()

    return {
        "status": "ok",
        "week_start": week_start,
        "generated_count": generated_count,
        "skipped_count": skipped_count,
        "errors": errors,
    }
