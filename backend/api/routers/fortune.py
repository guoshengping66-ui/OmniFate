"""
api/routers/fortune.py — 运势订阅 API

端点:
  POST /api/fortune/subscribe    — 保存订阅偏好
  GET  /api/fortune/subscription — 获取订阅状态
  GET  /api/fortune/weekly       — 获取本周运势
  GET  /api/fortune/daily        — 获取今日运势
  POST /api/fortune/generate-all — cron 触发，为所有订阅用户生成运势并发送邮件
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
from database.models import FortuneSubscription, WeeklyFortune, DailyFortune, User
from auth.dependencies import require_user, get_current_user
from services.fortune_generator import (
    generate_weekly_fortune,
    generate_daily_fortune,
    get_user_birth_data,
    get_current_week_range,
    get_current_day_str,
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
    """保存用户的运势订阅偏好，订阅时立即生成运势并发送邮件"""
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

    # ── If subscribing (not off), generate fortune + send email immediately ──
    email_sent = False
    if body.frequency != "off":
        try:
            birth = await get_user_birth_data(db, user.id)

            if body.frequency == "daily":
                # Generate daily fortune
                day_str = get_current_day_str()
                fortune_data = generate_daily_fortune(
                    user_id=user.id,
                    date_str=day_str,
                    locale="zh",
                    **(birth or {}),
                )

                # Check if already generated today
                existing = await db.execute(
                    select(DailyFortune).where(
                        and_(
                            DailyFortune.user_id == user.id,
                            DailyFortune.fortune_date == day_str,
                        )
                    )
                )
                if not existing.scalars().first():
                    df = DailyFortune(
                        user_id=user.id,
                        fortune_date=day_str,
                        score=fortune_data["score"],
                        theme=fortune_data["theme"],
                        lucky_color=fortune_data["lucky_color"],
                        lucky_number=fortune_data["lucky_number"],
                        lucky_direction=fortune_data["lucky_direction"],
                        tarot_card=fortune_data["tarot_card"],
                        tarot_desc=fortune_data["tarot_desc"],
                        ai_insight=fortune_data["ai_insight"],
                        yi=fortune_data["yi"],
                        ji=fortune_data["ji"],
                    )
                    db.add(df)
                    await db.commit()

                # Send email
                if user.email:
                    from utils.email import send_daily_fortune_email
                    fortune_data["date"] = day_str
                    email_sent = send_daily_fortune_email(user.email, fortune_data, locale="zh")
            else:
                # Generate weekly fortune
                week_start, week_end = get_current_week_range()
                fortune_data = generate_weekly_fortune(
                    user_id=user.id,
                    week_start=week_start,
                    locale="zh",
                    **(birth or {}),
                )

                # Check if already generated this week
                existing = await db.execute(
                    select(WeeklyFortune).where(
                        and_(
                            WeeklyFortune.user_id == user.id,
                            WeeklyFortune.week_start == week_start,
                        )
                    )
                )
                if not existing.scalars().first():
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
                    await db.commit()

                # Send email
                if user.email:
                    from utils.email import send_fortune_email
                    fortune_data["week_start"] = week_start
                    fortune_data["week_end"] = week_end
                    email_sent = send_fortune_email(user.email, fortune_data, locale="zh")

        except Exception as e:
            logger.warning(f"[FORTUNE-SUB] Generate/email failed for user {user.id}: {e}")

    return {
        "status": "ok",
        "frequency": sub.frequency,
        "is_active": sub.is_active,
        "email_sent": email_sent,
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
    lang: str = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取本周运势（如果已生成则返回缓存，否则实时生成）"""
    if lang in ("zh", "en"):
        locale = lang
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


# ── Get Daily Fortune ───────────────────────────────────────────────────────

@router.get("/daily")
async def get_daily_fortune(
    locale: str = "zh",
    lang: str = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取今日运势（如果已生成则返回缓存，否则实时生成）"""
    if lang in ("zh", "en"):
        locale = lang
    day_str = get_current_day_str()

    # Check if already generated
    if user:
        result = await db.execute(
            select(DailyFortune).where(
                and_(
                    DailyFortune.user_id == user.id,
                    DailyFortune.fortune_date == day_str,
                )
            )
        )
        existing = result.scalars().first()
        if existing:
            return _daily_to_dict(existing, locale)

        # Get birth data for personalized fortune
        birth = await get_user_birth_data(db, user.id)
    else:
        birth = None

    # Generate on-the-fly
    fortune_data = generate_daily_fortune(
        user_id=user.id if user else "anonymous",
        date_str=day_str,
        locale=locale,
        birth_year=birth.get("birth_year") if birth else None,
        birth_month=birth.get("birth_month") if birth else None,
        birth_day=birth.get("birth_day") if birth else None,
        birth_hour=birth.get("birth_hour") if birth else None,
        gender=birth.get("gender") if birth else None,
    )

    return {
        "date": day_str,
        "is_read": False,
        **fortune_data,
    }


def _fortune_to_dict(f: WeeklyFortune, locale: str) -> dict:
    """Convert a WeeklyFortune model to API response dict, translating if needed."""
    d = {
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
    if locale == "en":
        from services.fortune_generator import (
            THEMES_EN, THEMES_ZH, TAROT_NAMES_EN, TAROT_NAMES_ZH,
            TAROT_DESCS_EN, TAROT_DESCS_ZH, LUCKY_COLORS_EN, LUCKY_COLORS_ZH,
            LUCKY_DIRECTIONS_EN, LUCKY_DIRECTIONS_ZH,
            YI_ITEMS_EN, YI_ITEMS_ZH, JI_ITEMS_EN, JI_ITEMS_ZH,
            AI_INSIGHTS_EN,
        )
        _safe_translate = lambda val, zh_list, en_list: en_list[zh_list.index(val)] if val in zh_list else val
        d["theme"] = _safe_translate(f.theme, THEMES_ZH, THEMES_EN)
        d["tarot_card"] = _safe_translate(f.tarot_card, TAROT_NAMES_ZH, TAROT_NAMES_EN)
        d["tarot_desc"] = _safe_translate(f.tarot_desc, TAROT_DESCS_ZH, TAROT_DESCS_EN)
        d["lucky_color"] = _safe_translate(f.lucky_color, LUCKY_COLORS_ZH, LUCKY_COLORS_EN)
        d["lucky_direction"] = _safe_translate(f.lucky_direction, LUCKY_DIRECTIONS_ZH, LUCKY_DIRECTIONS_EN)
        # Regenerate ai_insight with English yi/ji values
        yi_en = [_safe_translate(y, YI_ITEMS_ZH, YI_ITEMS_EN) for y in (f.yi or [])]
        ji_en = [_safe_translate(j, JI_ITEMS_ZH, JI_ITEMS_EN) for j in (f.ji or [])]
        if yi_en or ji_en:
            import hashlib as _hl
            seed = hash(f"{f.user_id}:{f.week_start}")
            template_idx = abs(seed) % len(AI_INSIGHTS_EN)
            d["ai_insight"] = AI_INSIGHTS_EN[template_idx].replace("{yi}", yi_en[0] if yi_en else "").replace("{ji}", ji_en[0] if ji_en else "")
        # Translate daily_yi_ji items
        if f.daily_yi_ji:
            d["daily_yi_ji"] = [
                {
                    "day": dyj.get("day", i),
                    "yi": _safe_translate(dyj.get("yi", ""), YI_ITEMS_ZH, YI_ITEMS_EN),
                    "ji": _safe_translate(dyj.get("ji", ""), JI_ITEMS_ZH, JI_ITEMS_EN),
                }
                for i, dyj in enumerate(f.daily_yi_ji)
            ]
    return d


def _daily_to_dict(f: DailyFortune, locale: str) -> dict:
    """Convert a DailyFortune model to API response dict, translating if needed."""
    d = {
        "id": f.id,
        "date": f.fortune_date,
        "score": f.score,
        "theme": f.theme,
        "lucky_color": f.lucky_color,
        "lucky_number": f.lucky_number,
        "lucky_direction": f.lucky_direction,
        "tarot_card": f.tarot_card,
        "tarot_desc": f.tarot_desc,
        "ai_insight": f.ai_insight,
        "yi": f.yi,
        "ji": f.ji,
        "is_read": f.is_read,
    }
    if locale == "en":
        from services.fortune_generator import (
            DAILY_THEMES_EN, DAILY_THEMES_ZH, DAILY_TAROT_NAMES_EN, DAILY_TAROT_NAMES_ZH,
            DAILY_TAROT_DESCS_EN, DAILY_TAROT_DESCS_ZH, LUCKY_COLORS_EN, LUCKY_COLORS_ZH,
            LUCKY_DIRECTIONS_EN, LUCKY_DIRECTIONS_ZH,
            YI_ITEMS_EN, YI_ITEMS_ZH, JI_ITEMS_EN, JI_ITEMS_ZH,
            DAILY_AI_INSIGHTS_EN,
        )
        _safe_translate = lambda val, zh_list, en_list: en_list[zh_list.index(val)] if val in zh_list else val
        d["theme"] = _safe_translate(f.theme, DAILY_THEMES_ZH, DAILY_THEMES_EN)
        d["tarot_card"] = _safe_translate(f.tarot_card, DAILY_TAROT_NAMES_ZH, DAILY_TAROT_NAMES_EN)
        d["tarot_desc"] = _safe_translate(f.tarot_desc, DAILY_TAROT_DESCS_ZH, DAILY_TAROT_DESCS_EN)
        d["lucky_color"] = _safe_translate(f.lucky_color, LUCKY_COLORS_ZH, LUCKY_COLORS_EN)
        d["lucky_direction"] = _safe_translate(f.lucky_direction, LUCKY_DIRECTIONS_ZH, LUCKY_DIRECTIONS_EN)
        # Regenerate ai_insight with English yi/ji values (stored ai_insight has Chinese embedded)
        yi_en = [_safe_translate(y, YI_ITEMS_ZH, YI_ITEMS_EN) for y in (f.yi or [])]
        ji_en = [_safe_translate(j, JI_ITEMS_ZH, JI_ITEMS_EN) for j in (f.ji or [])]
        if yi_en or ji_en:
            import hashlib as _hl
            seed = hash(f"{f.user_id}:{f.fortune_date}")
            template_idx = abs(seed) % len(DAILY_AI_INSIGHTS_EN)
            d["ai_insight"] = DAILY_AI_INSIGHTS_EN[template_idx].replace("{yi}", yi_en[0] if yi_en else "").replace("{ji}", ji_en[0] if ji_en else "")
    return d


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
    由 cron 触发:
    - 每周一: 为 weekly 订阅用户生成本周运势并发送邮件
    - 每天: 为 daily 订阅用户生成今日运势并发送邮件
    """
    _verify_cron_secret(authorization)

    from sqlalchemy.orm import selectinload
    from utils.email import send_fortune_email, send_daily_fortune_email

    week_start, week_end = get_current_week_range()
    day_str = get_current_day_str()
    generated_weekly = 0
    generated_daily = 0
    emails_sent = 0
    errors = []

    # Get active subscribers first (smaller set)
    sub_result = await db.execute(
        select(FortuneSubscription).where(FortuneSubscription.is_active == True)
    )
    active_subs = {s.user_id: s for s in sub_result.scalars().all()}

    if not active_subs:
        return {"status": "ok", "emails_sent": 0, "message": "No active subscribers"}

    # Load users in batches to avoid memory issues
    BATCH_SIZE = 100
    user_ids = list(active_subs.keys())
    all_users = []
    for i in range(0, len(user_ids), BATCH_SIZE):
        batch_ids = user_ids[i:i + BATCH_SIZE]
        result = await db.execute(
            select(User).where(User.id.in_(batch_ids)).options(selectinload(User.birth_profiles))
        )
        all_users.extend(result.scalars().unique().all())

    sub_map = active_subs
    processed_count = 0

    for user in all_users:
        sub = sub_map.get(user.id)
        if not sub or not sub.is_active or sub.frequency == "off":
            continue

        try:
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
                continue

            if sub.frequency == "daily":
                # ── Daily fortune ──
                existing = await db.execute(
                    select(DailyFortune).where(
                        and_(
                            DailyFortune.user_id == user.id,
                            DailyFortune.fortune_date == day_str,
                        )
                    )
                )
                if existing.scalars().first():
                    continue

                fortune_data = generate_daily_fortune(
                    user_id=user.id,
                    date_str=day_str,
                    locale="zh",
                    **birth,
                )

                df = DailyFortune(
                    user_id=user.id,
                    fortune_date=day_str,
                    score=fortune_data["score"],
                    theme=fortune_data["theme"],
                    lucky_color=fortune_data["lucky_color"],
                    lucky_number=fortune_data["lucky_number"],
                    lucky_direction=fortune_data["lucky_direction"],
                    tarot_card=fortune_data["tarot_card"],
                    tarot_desc=fortune_data["tarot_desc"],
                    ai_insight=fortune_data["ai_insight"],
                    yi=fortune_data["yi"],
                    ji=fortune_data["ji"],
                )
                db.add(df)
                generated_daily += 1

                # Send daily email
                if user.email:
                    fortune_data["date"] = day_str
                    if send_daily_fortune_email(user.email, fortune_data, locale="zh"):
                        emails_sent += 1

            elif sub.frequency == "weekly":
                # ── Weekly fortune ──
                existing = await db.execute(
                    select(WeeklyFortune).where(
                        and_(
                            WeeklyFortune.user_id == user.id,
                            WeeklyFortune.week_start == week_start,
                        )
                    )
                )
                if existing.scalars().first():
                    continue

                fortune_data = generate_weekly_fortune(
                    user_id=user.id,
                    week_start=week_start,
                    locale="zh",
                    **birth,
                )

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
                generated_weekly += 1

                # Send weekly email
                if user.email:
                    fortune_data["week_start"] = week_start
                    fortune_data["week_end"] = week_end
                    if send_fortune_email(user.email, fortune_data, locale="zh"):
                        emails_sent += 1

        except Exception as e:
            logger.warning(f"[FORTUNE-GEN] Failed for user {user.id}: {e}")
            errors.append(str(user.id))

        processed_count += 1
        # Intermediate commit every 50 users to avoid huge single-transaction
        if processed_count % 50 == 0:
            await db.commit()

    await db.commit()

    return {
        "status": "ok",
        "week_start": week_start,
        "day": day_str,
        "generated_weekly": generated_weekly,
        "generated_daily": generated_daily,
        "emails_sent": emails_sent,
        "errors": errors,
    }
