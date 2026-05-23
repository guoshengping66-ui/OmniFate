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

# ── Daily Fortune Data Pools ───────────────────────────────────────────────

DAILY_THEMES_ZH = [
    "宜静不宜动", "行动力满满", "灵感涌现日", "稳扎稳打",
    "贵人临门", "桃花悄然至", "财运小高峰", "适合独处充电",
    "社交好日子", "事业突破口", "学习黄金期", "家庭和睦",
]
DAILY_THEMES_EN = [
    "Stay calm, act less", "Day of action", "Inspiration day", "Steady and solid",
    "Helpful people arrive", "Romance sneaks in", "Financial peak", "Great day to recharge",
    "Good social day", "Career breakthrough", "Learning day", "Family harmony",
]

DAILY_TAROT_NAMES_ZH = [
    "正位愚者", "正位魔术师", "正位女祭司", "正位皇后",
    "正位皇帝", "正位教皇", "正位恋人", "正位战车",
    "正位力量", "正位隐者", "正位命运之轮", "正位正义",
]
DAILY_TAROT_NAMES_EN = [
    "Fool (Upright)", "Magician (Upright)", "High Priestess (Upright)", "Empress (Upright)",
    "Emperor (Upright)", "Hierophant (Upright)", "Lovers (Upright)", "Chariot (Upright)",
    "Strength (Upright)", "Hermit (Upright)", "Wheel of Fortune (Upright)", "Justice (Upright)",
]

DAILY_TAROT_DESCS_ZH = [
    "新的开始，勇敢迈出第一步",
    "创造力爆棚，今天适合展示才华",
    "直觉敏锐，倾听内心的声音",
    "温柔而有力量的一天，适合照顾他人",
    "权威与掌控，今天适合做重要决定",
    "智慧指引方向，跟随经验前行",
    "心与心的连接，今天适合表达感情",
    "意志力强大，克服障碍的最佳时机",
    "内在力量充沛，相信自己能做到",
    "独处思考，今天适合沉淀和复盘",
    "命运之轮转动，变化即将到来",
    "公平与公正，今天适合处理法律事务",
]
DAILY_TAROT_DESCS_EN = [
    "A fresh start — take the first brave step",
    "Creativity peaks — show your talents today",
    "Sharp intuition — listen to your inner voice",
    "Gentle strength — a day for caring for others",
    "Authority and control — make important decisions",
    "Wisdom guides — follow your experience",
    "Heart-to-heart connection — express your feelings",
    "Strong willpower — perfect time to overcome obstacles",
    "Inner strength overflows — believe in yourself",
    "Solitude for reflection — review and recalibrate",
    "The wheel turns — change is coming",
    "Fairness and justice — handle legal matters today",
]

DAILY_AI_INSIGHTS_ZH = [
    "今日{yi}运势旺盛，把握上午黄金时段。午后稍作休息，晚间宜与家人相聚。",
    "今日五行木气旺盛，{yi}相关事务进展顺利。注意控制情绪，{ji}方面需谨慎。",
    "今日{yi}运极佳，适合推进搁置已久的计划。但{ji}方面要留心，避免冲动。",
    "今日贵人运强，{yi}方向有意外惊喜。保持谦虚态度，{ji}之事暂缓。",
    "今日整体运势平稳，{yi}方面按计划进行即可。避免{ji}，保持内心平静。",
]
DAILY_AI_INSIGHTS_EN = [
    "Today's {yi} fortune is strong in the morning. Rest in the afternoon, gather with family in the evening.",
    "Wood element dominates today — {yi} matters progress smoothly. Control emotions, be careful with {ji}.",
    "Excellent {yi} luck today — ideal for reviving stalled plans. But watch out for {ji}, avoid impulsiveness.",
    "Strong ally luck — the {yi} direction holds surprises. Stay humble, postpone {ji} matters.",
    "Steady day overall — proceed with {yi} as planned. Avoid {ji}, keep inner peace.",
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


def get_current_day_str() -> str:
    """Get today's date string."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def generate_daily_fortune(
    user_id: str,
    date_str: str,
    locale: str = "zh",
    birth_year: Optional[int] = None,
    birth_month: Optional[int] = None,
    birth_day: Optional[int] = None,
    birth_hour: Optional[int] = None,
    gender: Optional[str] = None,
) -> dict:
    """
    Generate a deterministic daily fortune for a user.
    Same user + same date = same result.
    Different from weekly fortune: single theme, single yi/ji, daily tarot.
    """
    is_zh = locale == "zh"

    # Use birth data to influence score (higher birth hour = slightly higher score for variety)
    birth_influence = 0
    if birth_hour is not None:
        birth_influence = (birth_hour % 3) - 1  # -1, 0, or 1

    base_score = 6 + birth_influence
    h1 = _seed_hash(user_id, date_str, 100)
    score = max(4, min(10, base_score + round((h1 - 0.5) * 4)))

    theme = _pick(DAILY_THEMES_ZH if is_zh else DAILY_THEMES_EN, _seed_hash(user_id, date_str, 101))

    # Single yi and ji for the day (not 3 like weekly)
    yi = [_pick(YI_ITEMS_ZH if is_zh else YI_ITEMS_EN, _seed_hash(user_id, date_str, 110))]
    ji = [_pick(JI_ITEMS_ZH if is_zh else JI_ITEMS_EN, _seed_hash(user_id, date_str, 120))]

    # AI insight
    insight_template = _pick(DAILY_AI_INSIGHTS_ZH if is_zh else DAILY_AI_INSIGHTS_EN, _seed_hash(user_id, date_str, 150))
    ai_insight = insight_template.replace("{yi}", yi[0]).replace("{ji}", ji[0])

    return {
        "score": score,
        "theme": theme,
        "lucky_color": _pick(LUCKY_COLORS_ZH if is_zh else LUCKY_COLORS_EN, _seed_hash(user_id, date_str, 160)),
        "lucky_number": f"{int(_seed_hash(user_id, date_str, 161) * 9) + 1}",
        "lucky_direction": _pick(LUCKY_DIRECTIONS_ZH if is_zh else LUCKY_DIRECTIONS_EN, _seed_hash(user_id, date_str, 163)),
        "tarot_card": _pick(DAILY_TAROT_NAMES_ZH if is_zh else DAILY_TAROT_NAMES_EN, _seed_hash(user_id, date_str, 164)),
        "tarot_desc": _pick(DAILY_TAROT_DESCS_ZH if is_zh else DAILY_TAROT_DESCS_EN, _seed_hash(user_id, date_str, 165)),
        "ai_insight": ai_insight,
        "yi": yi,
        "ji": ji,
    }
