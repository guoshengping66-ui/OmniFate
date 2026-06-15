"""能量雷达 API — 基于用户出生盘计算近期天象对各维度的影响"""
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, Reading, ReadingStatus, BirthProfile, CreditTransaction
from auth.dependencies import require_user

logger = logging.getLogger("events")
router = APIRouter()

# ── 星尘消耗规则 ──────────────────────────────────────────────────────────────
STARDUST_COST_ENERGY_RADAR = 5
MEMBER_FREE = True  # 会员免费查看


def _calc_energy_events(birth_chart: dict, transits: dict) -> list[dict]:
    """根据出生盘 + 当前流年计算能量雷达事件"""
    events = []
    now = datetime.now(timezone.utc)
    event_id_base = hashlib.md5(f"radar_{now.strftime('%Y%m%d')}".encode()).hexdigest()[:8]

    # 获取流年行星位置
    transit_planets = transits.get("transit_planets", {})
    transit_aspects = transits.get("transit_natal_aspects", [])

    # 行星能量映射
    PLANET_ENERGY = {
        "sun": {"type": "vitality", "base": 3},
        "moon": {"type": "emotion", "base": 2},
        "mercury": {"type": "communication", "base": 2},
        "venus": {"type": "love", "base": 3},
        "mars": {"type": "action", "base": 4},
        "jupiter": {"type": "expansion", "base": 3},
        "saturn": {"type": "discipline", "base": 4},
        "uranus": {"type": "change", "base": 4},
        "neptune": {"type": "intuition", "base": 2},
        "pluto": {"type": "transformation", "base": 5},
    }

    # 相位能量映射
    ASPECT_ENERGY = {
        "conjunction": 4,
        "opposition": 5,
        "trine": 2,
        "square": 5,
        "sextile": 2,
    }

    # 生成主要相位事件
    for i, aspect in enumerate(transit_aspects[:8]):
        tp = aspect.get("transit_planet", "")
        np = aspect.get("natal_planet", "")
        asp_type = aspect.get("aspect", "")
        orb = aspect.get("orb", 0)

        planet_info = PLANET_ENERGY.get(tp, {"type": "cosmic", "base": 3})
        aspect_energy = ASPECT_ENERGY.get(asp_type, 3)

        # 综合能量等级 (1-5)
        energy_level = min(5, max(1, (planet_info["base"] + aspect_energy) // 2))

        # 判断是否危险（刑相位、对冲）
        is_dangerous = asp_type in ("opposition", "square") and orb < 5

        # 生成事件描述
        EVENT_TITLES = {
            "love": f"金星流年{asp_type}本命{np}",
            "action": f"火星流年{asp_type}本命{np}",
            "expansion": f"木星流年{asp_type}本命{np}",
            "discipline": f"土星流年{asp_type}本命{np}",
            "change": f"天王星流年{asp_type}本命{np}",
            "transformation": f"冥王星流年{asp_type}本命{np}",
            "emotion": f"月亮流年{asp_type}本命{np}",
            "communication": f"水星流年{asp_type}本命{np}",
            "vitality": f"太阳流年{asp_type}本命{np}",
            "intuition": f"海王星流年{asp_type}本命{np}",
            "cosmic": f"流年{tp}{asp_type}本命{np}",
        }

        ADVICE_MAP = {
            "love": "适合社交和感情表达，注意平衡付出与收获",
            "action": "行动力增强，但需控制冲动，适合推进重要项目",
            "expansion": "机遇期，适合学习新技能或拓展视野",
            "discipline": "考验期，需要耐心和纪律，避免走捷径",
            "change": "变革信号，适合打破常规，但要准备应对意外",
            "transformation": "深层转变期，适合自我反思和放下旧模式",
            "emotion": "情绪敏感期，适合内省和情感表达",
            "communication": "沟通活跃期，适合谈判和学习",
            "vitality": "精力充沛期，适合展示自我和领导",
            "intuition": "直觉敏锐期，适合冥想和创意工作",
            "cosmic": "宇宙能量变化，保持觉察和平衡",
        }

        title = EVENT_TITLES.get(planet_info["type"], f"流年{tp}{asp_type}本命{np}")
        advice = ADVICE_MAP.get(planet_info["type"], "保持觉察，顺势而为")

        events.append({
            "id": f"{event_id_base}_{i}",
            "date": now.strftime("%Y-%m-%d"),
            "event_type": planet_info["type"],
            "title": title,
            "description": f"流年{tp}正在{asp_type}你的本命{np}（容许度{orb}°），"
                          f"这会影响你的{planet_info['type']}能量场",
            "energy_level": energy_level,
            "trading_advice": advice,
            "is_dangerous": is_dangerous,
        })

    # 如果没有显著相位，返回基础能量事件
    if not events:
        events.append({
            "id": f"{event_id_base}_base",
            "date": now.strftime("%Y-%m-%d"),
            "event_type": "ambient",
            "title": "今日宇宙能量场",
            "description": "当前没有显著的流年相位影响，能量场相对平稳",
            "energy_level": 2,
            "trading_advice": "平稳期，适合巩固基础和日常事务",
            "is_dangerous": False,
        })

    return events


@router.get("/radar")
async def energy_radar(
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """
    能量雷达 — 基于用户出生盘计算近期天象影响
    非会员需消耗 5 星尘，24 小时内重复查看不扣费
    """
    now = datetime.now(timezone.utc)
    today = now.date()

    # 1. 检查是否最近 24 小时内已查看过（缓存避免重复扣费）
    cache_result = await db.execute(
        select(CreditTransaction).where(
            CreditTransaction.user_id == current_user.id,
            CreditTransaction.reason == "energy_radar",
            CreditTransaction.status == "confirmed",
            CreditTransaction.created_at >= now - timedelta(hours=24),
        )
    )
    cache_tx = cache_result.scalar_one_or_none()

    if cache_tx:
        # 24 小时内已查看，返回缓存（不重新扣费）
        # 从用户最新 Reading 获取出生盘数据
        reading_result = await db.execute(
            select(Reading).where(
                Reading.user_id == current_user.id,
                Reading.status == ReadingStatus.completed,
            ).order_by(Reading.created_at.desc()).limit(1)
        )
        reading = reading_result.scalar_one_or_none()
        if not reading:
            raise HTTPException(status_code=404, detail="请先完成一次推命分析")

        # 使用存储的 transit 数据或重新计算
        birth_info = {}
        if reading.birth_profile_id:
            bp_result = await db.execute(
                select(BirthProfile).where(BirthProfile.id == reading.birth_profile_id)
            )
            bp = bp_result.scalar_one_or_none()
            if bp:
                birth_info = {
                    "year": bp.birth_year, "month": bp.birth_month,
                    "day": bp.birth_day, "hour": bp.birth_hour,
                }

        # 简化的能量事件计算
        events = _calc_energy_events(
            birth_info,
            reading.astrology_raw or {},
        )

        return {
            "events": events,
            "cached": True,
            "balance_after": current_user.stardust_balance,
        }

    # 2. 先获取用户出生盘数据（在扣费之前验证）
    reading_result = await db.execute(
        select(Reading).where(
            Reading.user_id == current_user.id,
            Reading.status == ReadingStatus.completed,
        ).order_by(Reading.created_at.desc()).limit(1)
    )
    reading = reading_result.scalar_one_or_none()
    if not reading:
        raise HTTPException(status_code=404, detail="请先完成一次推命分析后再使用能量雷达")

    # 3. 非会员扣费 5 星尘（已验证有可用的 Reading）
    stardust_deducted = 0
    new_balance = None
    if not current_user.is_premium:
        user_result = await db.execute(
            select(User).where(User.id == current_user.id).with_for_update()
        )
        user = user_result.scalar_one()
        if user.stardust_balance < STARDUST_COST_ENERGY_RADAR:
            raise HTTPException(
                status_code=402,
                detail=f"星尘不足: 需要 {STARDUST_COST_ENERGY_RADAR}，当前 {user.stardust_balance}",
            )
        user.stardust_balance -= STARDUST_COST_ENERGY_RADAR
        new_balance = user.stardust_balance
        tx = CreditTransaction(
            user_id=user.id,
            amount=-STARDUST_COST_ENERGY_RADAR,
            balance_after=user.stardust_balance,
            reason="energy_radar",
            reference_id=None,
            status="confirmed",
        )
        db.add(tx)
        stardust_deducted = STARDUST_COST_ENERGY_RADAR
        await db.flush()

    # 4. 计算能量事件
    birth_info = {}
    if reading.birth_profile_id:
        bp_result = await db.execute(
            select(BirthProfile).where(BirthProfile.id == reading.birth_profile_id)
        )
        bp = bp_result.scalar_one_or_none()
        if bp:
            birth_info = {
                "year": bp.birth_year, "month": bp.birth_month,
                "day": bp.birth_day, "hour": bp.birth_hour,
            }
    events = _calc_energy_events(
        birth_info,
        reading.astrology_raw or {},
    )

    await db.commit()

    return {
        "events": events,
        "cached": False,
        "stardust_deducted": stardust_deducted,
        "balance_after": new_balance if stardust_deducted > 0 else None,
    }
