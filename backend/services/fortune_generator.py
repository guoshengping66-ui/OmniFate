"""
fortune_generator.py — 每周运势生成服务

根据用户八字 + 当前日期干支 + 塔罗牌生成个性化每周运势。
"""
import hashlib
import random
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import BirthProfile, User, WeeklyFortune


# ── 数据池 ──────────────────────────────────────────────────────────────────

THEMES_ZH = [
    "贵人相助，主动出击", "稳中求进，蓄势待发", "桃花运旺，感情升温",
    "财运亨通，把握时机", "注意健康，劳逸结合", "学习充电，厚积薄发",
    "创新突破，勇往直前", "人际关系和谐，合作顺利",
]
THEMES_EN = [
    "Seek allies, take initiative", "Steady progress, build momentum",
    "Romance blooms, relationships deepen", "Financial flow, seize the moment",
    "Mind your health, balance rest", "Learn & grow, invest in yourself",
    "Innovate and break through", "Harmonious relationships, smooth cooperation",
]

TAROT_NAMES_ZH = ["正位太阳", "正位皇后", "正位魔术师", "正位力量", "正位星辰", "正位世界", "正位恋人", "正位战车"]
TAROT_NAMES_EN = ["Sun (Upright)", "Empress (Upright)", "Magician (Upright)", "Strength (Upright)",
                   "Star (Upright)", "World (Upright)", "Lovers (Upright)", "Chariot (Upright)"]

TAROT_DESCS_ZH = [
    "光明与活力的一周，保持积极心态将迎来好运",
    "丰盛与创造的一周，适合开展新计划",
    "灵活应变的一周，你的才华将被看见",
    "内在力量的一周，坚定信念克服困难",
    "希望与灵感的一周，跟随直觉前进",
    "圆满与成就的一周，收获即将到来",
    "爱情与选择的一周，听从内心",
    "勇往直前的一周，行动力是关键",
]
TAROT_DESCS_EN = [
    "A week of light and vitality — stay positive and好运 will follow",
    "A week of abundance and creation — ideal for launching new plans",
    "A week of adaptability — your talents will be recognized",
    "A week of inner strength — stay firm and overcome challenges",
    "A week of hope and inspiration — follow your intuition",
    "A week of fulfillment — rewards are on their way",
    "A week of love and choices — listen to your heart",
    "A week of bold action — momentum is your ally",
]

YI_ITEMS_ZH = ["出行", "签约", "求财", "会友", "学习", "祈福", "开工", "面试"]
YI_ITEMS_EN = ["Travel", "Sign contracts", "Seek wealth", "Meet friends", "Study", "Pray", "Start work", "Interview"]

JI_ITEMS_ZH = ["动土", "远行", "争吵", "熬夜", "冒险", "搬迁", "借贷", "高风险投资"]
JI_ITEMS_EN = ["Groundbreaking", "Long travel", "Arguments", "Stay up late", "Take risks", "Move house", "Lend money", "High-risk investment"]

LUCKY_COLORS_ZH = ["翠绿", "金色", "红色", "蓝色", "紫色", "粉色", "橙色", "银色"]
LUCKY_COLORS_EN = ["Emerald", "Gold", "Red", "Blue", "Purple", "Pink", "Orange", "Silver"]

LUCKY_DIRECTIONS_ZH = ["正东方", "正南方", "正西方", "正北方", "东南方", "西北方", "东北方", "西南方"]
LUCKY_DIRECTIONS_EN = ["East", "South", "West", "North", "Southeast", "Northwest", "Northeast", "Southwest"]

AI_INSIGHTS_ZH = [
    "本周{yi}运势旺盛，结合你的八字日主分析，建议把握周中黄金时段推进重要事务。周末宜休整，为下周蓄力。",
    "本周{yi}运势平稳，五行调和，适合按部就班推进计划。注意周五可能有小波折。",
    "本周{ji}需谨慎，但{yi}运强劲，可主动出击。保持心态平和，好运自来。",
    "本周五行流转对你有利，{yi}方向有贵人出现。建议多社交，拓展人脉。",
    "本周需注意{ji}方面，但整体运势向好。保持耐心，好事多磨。",
]
AI_INSIGHTS_EN = [
    "This week's {yi} fortune is strong. Based on your BaZi chart, we recommend tackling important tasks mid-week. Rest on the weekend to recharge.",
    "This week's {yi} fortune is steady with balanced Five Elements. Stick to your plan. Watch out for minor setbacks on Friday.",
    "Be cautious with {ji} this week, but {yi} luck is strong — take initiative. Stay calm and好运 will come naturally.",
    "The Five Elements flow favors you this week. Look for allies in the {yi} direction. Expand your network.",
    "Watch out for {ji} this week, but overall fortune is positive. Patience is key.",
]


def _seed_hash(user_id: str, week_start: str, extra: int = 0) -> float:
    """Deterministic hash for consistent random within a week."""
    raw = f"{user_id}:{week_start}:{extra}"
    h = hashlib.sha256(raw.encode())
    return int(h.hexdigest()[:8], 16) / 0xFFFFFFFF


def _pick(items: list, h: float):
    return items[int(h * len(items)) % len(items)]


def generate_weekly_fortune(
    user_id: str,
    week_start: str,
    locale: str = "zh",
    birth_year: Optional[int] = None,
    birth_month: Optional[int] = None,
    birth_day: Optional[int] = None,
    birth_hour: Optional[int] = None,
    gender: Optional[str] = None,
) -> dict:
    """
    Generate a deterministic weekly fortune for a user.
    Same user + same week = same result.
    """
    is_zh = locale == "zh"

    # Use birth data to influence score (higher birth hour = slightly higher score for variety)
    birth_influence = 0
    if birth_hour is not None:
        birth_influence = (birth_hour % 3) - 1  # -1, 0, or 1

    base_score = 6 + birth_influence
    h1 = _seed_hash(user_id, week_start, 1)
    score = max(4, min(10, base_score + round((h1 - 0.5) * 4)))

    theme = _pick(THEMES_ZH if is_zh else THEMES_EN, _seed_hash(user_id, week_start, 2))
    yi = [_pick(YI_ITEMS_ZH if is_zh else YI_ITEMS_EN, _seed_hash(user_id, week_start, 10 + i)) for i in range(3)]
    ji = [_pick(JI_ITEMS_ZH if is_zh else JI_ITEMS_EN, _seed_hash(user_id, week_start, 20 + i)) for i in range(3)]

    # Daily Yi Ji (7 days)
    daily = []
    for d in range(7):
        daily.append({
            "day": d,
            "yi": _pick(YI_ITEMS_ZH if is_zh else YI_ITEMS_EN, _seed_hash(user_id, week_start, 30 + d)),
            "ji": _pick(JI_ITEMS_ZH if is_zh else JI_ITEMS_EN, _seed_hash(user_id, week_start, 40 + d)),
        })

    # AI insight with template substitution
    insight_template = _pick(AI_INSIGHTS_ZH if is_zh else AI_INSIGHTS_EN, _seed_hash(user_id, week_start, 50))
    ai_insight = insight_template.replace("{yi}", yi[0]).replace("{ji}", ji[0])

    return {
        "score": score,
        "theme": theme,
        "lucky_color": _pick(LUCKY_COLORS_ZH if is_zh else LUCKY_COLORS_EN, _seed_hash(user_id, week_start, 60)),
        "lucky_number": f"{int(_seed_hash(user_id, week_start, 61) * 9) + 1}, {int(_seed_hash(user_id, week_start, 62) * 9) + 1}",
        "lucky_direction": _pick(LUCKY_DIRECTIONS_ZH if is_zh else LUCKY_DIRECTIONS_EN, _seed_hash(user_id, week_start, 63)),
        "tarot_card": _pick(TAROT_NAMES_ZH if is_zh else TAROT_NAMES_EN, _seed_hash(user_id, week_start, 64)),
        "tarot_desc": _pick(TAROT_DESCS_ZH if is_zh else TAROT_DESCS_EN, _seed_hash(user_id, week_start, 65)),
        "ai_insight": ai_insight,
        "daily_yi_ji": daily,
        "yi": yi,
        "ji": ji,
    }


async def get_user_birth_data(db: AsyncSession, user_id: str) -> Optional[dict]:
    """Get the user's primary birth profile data."""
    result = await db.execute(
        select(BirthProfile).where(BirthProfile.user_id == user_id).order_by(BirthProfile.created_at)
    )
    profile = result.scalars().first()
    if not profile:
        return None
    return {
        "birth_year": profile.birth_year,
        "birth_month": profile.birth_month,
        "birth_day": profile.birth_day,
        "birth_hour": profile.birth_hour,
        "gender": profile.gender.value if profile.gender else None,
    }


def get_current_week_range() -> tuple[str, str]:
    """Get the current week's Monday-Sunday range."""
    today = datetime.now(timezone.utc)
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    return monday.strftime("%Y-%m-%d"), sunday.strftime("%Y-%m-%d")
