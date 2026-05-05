"""
agents/tools.py
Layer 1 calculation tools: BaZi (lunar-python) + Astrology (pyswisseph) + Tarot draw
"""
from __future__ import annotations
import asyncio
from typing import Optional


# ─── BaZi ────────────────────────────────────────────────────────────────

async def compute_bazi(year: int, month: int, day: int, hour: int,
                       minute: int = 0,
                       longitude: Optional[float] = None) -> dict:
    """Async wrapper: runs BaziCalculator in thread pool (CPU-bound)."""
    from backend.calculators.bazi_calculator import BaziCalculator
    calc = BaziCalculator()
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None, lambda: calc.calculate(year, month, day, hour, minute, longitude)
    )
    return result.to_dict()


# ─── Astrology (pyswisseph) ───────────────────────────────────────────────

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]
SIGNS_ZH = [
    "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
    "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座",
]
PLANET_IDS = {
    "Sun": 0, "Moon": 1, "Mercury": 2, "Venus": 3, "Mars": 4,
    "Jupiter": 5, "Saturn": 6, "Uranus": 7, "Neptune": 8, "Pluto": 9,
}
ASPECT_ANGLES = {
    0: "conjunction", 60: "sextile", 90: "square",
    120: "trine", 150: "quincunx", 180: "opposition",
}


def _lon_to_sign(lon: float) -> tuple[str, str, float]:
    idx = int(lon / 30) % 12
    return SIGNS[idx], SIGNS_ZH[idx], lon % 30


def _compute_aspects(positions: dict) -> list[dict]:
    orb_limit = 8.0
    aspects = []
    planets = list(positions.items())
    for i, (n1, d1) in enumerate(planets):
        for n2, d2 in planets[i + 1:]:
            diff = abs(d1["longitude"] - d2["longitude"]) % 360
            if diff > 180:
                diff = 360 - diff
            for angle, name in ASPECT_ANGLES.items():
                orb = abs(diff - angle)
                if orb <= orb_limit:
                    aspects.append({
                        "planet1": n1, "planet2": n2,
                        "aspect": name, "orb": round(orb, 2),
                    })
    return aspects


def _assign_houses(positions: dict, cusps: list) -> None:
    """Placidus house assignment."""
    for name, data in positions.items():
        lon = data["longitude"]
        house = 1
        for i in range(12):
            c1, c2 = cusps[i], cusps[(i + 1) % 12]
            if c1 <= c2:
                if c1 <= lon < c2:
                    house = i + 1
                    break
            else:
                if lon >= c1 or lon < c2:
                    house = i + 1
                    break
        data["house"] = house


async def compute_natal_chart(year: int, month: int, day: int,
                               hour: int, minute: int,
                               latitude: float, longitude: float,
                               timezone_offset: float = 8.0) -> dict:
    """
    Compute natal chart using pyswisseph.
    Falls back to heuristic stub if pyswisseph is not installed.
    """
    try:
        import swisseph as swe
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: _swisseph_chart(
                year, month, day, hour, minute, latitude, longitude, timezone_offset
            )
        )
    except ImportError:
        return _stub_chart(year, month, day, hour)


def _swisseph_chart(year: int, month: int, day: int,
                    hour: int, minute: int,
                    lat: float, lon: float, tz: float) -> dict:
    import swisseph as swe

    # Julian day in UT
    hour_ut = hour + minute / 60.0 - tz
    jd = swe.julday(year, month, day, hour_ut)

    # Compute all planet positions
    positions: dict[str, dict] = {}
    for name, pid in PLANET_IDS.items():
        pos, _ = swe.calc_ut(jd, pid)
        longitude_deg = pos[0]
        sign_en, sign_zh, deg_in_sign = _lon_to_sign(longitude_deg)
        positions[name] = {
            "longitude": longitude_deg,
            "sign": sign_en,
            "sign_zh": sign_zh,
            "degree": round(deg_in_sign, 2),
            "house": 0,
        }

    # North Node (mean)
    nn_pos, _ = swe.calc_ut(jd, swe.MEAN_NODE)
    nn_lon = nn_pos[0]
    nn_sign_en, nn_sign_zh, _ = _lon_to_sign(nn_lon)

    # House cusps (Placidus)
    try:
        cusps, ascmc = swe.houses(jd, lat, lon, b"P")
        asc_lon = ascmc[0]
        mc_lon  = ascmc[1]
        _assign_houses(positions, list(cusps[:12]))
    except Exception:
        asc_lon, mc_lon = positions["Sun"]["longitude"], positions["Sun"]["longitude"]
        cusps = [i * 30.0 for i in range(12)]

    asc_en, asc_zh, _ = _lon_to_sign(asc_lon)
    mc_en, mc_zh, _   = _lon_to_sign(mc_lon)

    # Key aspect summaries for prompt
    aspects = _compute_aspects(positions)
    saturn_aspects = [
        f"Saturn {a['aspect']} {a['planet2']} (orb {a['orb']}°)"
        for a in aspects if a["planet1"] == "Saturn" or a["planet2"] == "Saturn"
    ]

    return {
        "sun_sign":        positions["Sun"]["sign"],
        "sun_sign_zh":     positions["Sun"]["sign_zh"],
        "moon_sign":       positions["Moon"]["sign"],
        "moon_sign_zh":    positions["Moon"]["sign_zh"],
        "ascendant":       asc_en,
        "ascendant_zh":    asc_zh,
        "mc":              mc_en,
        "north_node_sign": nn_sign_zh,
        "planets":         positions,
        "aspects":         aspects,
        "saturn_aspects":  " | ".join(saturn_aspects) if saturn_aspects else "",
        "transits_this_year": _current_transits(year, month, positions),
    }


def _current_transits(year: int, month: int, natal: dict) -> str:
    """Generate a brief transit description for the current period."""
    from backend.calculators.bazi_calculator import get_current_year_ganzhi
    ygz = get_current_year_ganzhi()
    sun = natal.get("Sun", {}).get("sign_zh", "")
    saturn = natal.get("Saturn", {}).get("sign_zh", "")
    return (
        f"{ygz}年：木星过境{sun}，土星持续在{saturn}，"
        "本年度变革动能较强，建议把握上半年行动窗口。"
    )


def _stub_chart(year: int, month: int, day: int, hour: int) -> dict:
    """Heuristic fallback when pyswisseph is not installed."""
    sun_idx = (month - 1) % 12
    moon_idx = (month + 2) % 12
    asc_idx = (hour // 2) % 12
    return {
        "sun_sign":     SIGNS[sun_idx],
        "sun_sign_zh":  SIGNS_ZH[sun_idx],
        "moon_sign":    SIGNS[moon_idx],
        "moon_sign_zh": SIGNS_ZH[moon_idx],
        "ascendant":    SIGNS[asc_idx],
        "ascendant_zh": SIGNS_ZH[asc_idx],
        "planets": {
            "Sun":     {"sign": SIGNS[sun_idx], "sign_zh": SIGNS_ZH[sun_idx],
                        "degree": day % 30, "house": 10, "longitude": sun_idx * 30 + day},
            "Moon":    {"sign": SIGNS[moon_idx], "sign_zh": SIGNS_ZH[moon_idx],
                        "degree": day * 2 % 30, "house": 4,
                        "longitude": moon_idx * 30 + day * 2 % 30},
            "Saturn":  {"sign": "Pisces", "sign_zh": "双鱼座",
                        "degree": 15, "house": 12, "longitude": 345},
            "Jupiter": {"sign": "Taurus", "sign_zh": "金牛座",
                        "degree": 22, "house": 2, "longitude": 52},
        },
        "aspects": [],
        "saturn_aspects": "Saturn in Pisces (12th house — spiritual lessons)",
        "transits_this_year": "Jupiter transiting personal planets this year.",
        "_stub": True,
    }


# ─── Tarot ────────────────────────────────────────────────────────────────

SPREADS = {
    "three-card":   ["过去", "现在", "未来"],
    "celtic-cross": ["现状", "挑战", "根基", "过去", "顶冠", "未来",
                     "自身", "环境", "希望/恐惧", "结果"],
    "single":       ["当下能量"],
    "love":         ["你的状态", "对方的状态", "关系走向"],
    "career":       ["现状", "障碍", "建议"],
}


def _load_all_tarot_names() -> list[str]:
    """Load all 78 card names from tarot_cards.json for drawing."""
    import json, os
    path = os.path.join(os.path.dirname(__file__), "..", "data", "tarot_cards.json")
    try:
        with open(path, encoding="utf-8") as f:
            cards = json.load(f)
        return [c["name"] for c in cards]
    except Exception:
        # Fallback to major arcana only if file can't be loaded
        return [
            "愚者", "魔术师", "女祭司", "皇后", "皇帝", "教皇", "恋人",
            "战车", "力量", "隐者", "命运之轮", "正义", "倒吊人", "死神",
            "节制", "恶魔", "塔", "星星", "月亮", "太阳", "审判", "世界",
        ]


def draw_tarot(spread: str = "three-card") -> dict:
    import random
    positions = SPREADS.get(spread, SPREADS["three-card"])
    deck = _load_all_tarot_names()
    random.shuffle(deck)
    cards = [
        {"position": pos, "card": deck[i], "reversed": random.random() > 0.65}
        for i, pos in enumerate(positions)
    ]
    return {"spread": spread, "cards": cards}
