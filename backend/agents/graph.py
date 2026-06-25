"""
agents/graph.py
Custom orchestrator with speculative master execution.

Pipeline (after optimization):
  init → workers(5 parallel, ~30s) ──┐
           └── core子任务(启动于~25s, Bazi完成时) ──┐
                                dims/actions(启动于~80s) ──┤→ done(~95s)

Optimizations applied:
  - Merged qimen+ziwei → 1 LLM call (saves ~30s)
  - Speculative master starts as soon as bazi completes
"""
from __future__ import annotations
import asyncio
import logging

logger = logging.getLogger(__name__)
import uuid
from typing import Any

from agents.state import SystemState, BirthInfo
from agents.workers import _WORKER_IDS
from agents.master import (
    run_master_preprocessing,
    run_subtask_core, run_subtask_dims, run_subtask_actions,
    handle_followup,
)
from calculators.bazi_calculator import get_current_year_ganzhi
from calculators.astrology_calculator import AstrologyCalculator

# Singleton calculator instance
_astro_calc = AstrologyCalculator(house_system="Equal")

# Store AstrologyResult objects for synastry calculation (keyed by session_id)
_astro_results: dict[str, dict] = {}  # session_id -> {"self": AstrologyResult, "partner": AstrologyResult}
_bazi_results: dict[str, dict] = {}   # session_id -> {"self": BaziResult, "partner": BaziResult}
_astro_dict_lock = asyncio.Lock()      # Protects _astro_results from concurrent access
_bazi_dict_lock = asyncio.Lock()       # Protects _bazi_results from concurrent access
_worker_count_lock = asyncio.Lock()    # Protects _completed_workers counter


# ─── Node functions ──────────────────────────────────────────────────────

async def node_init(state: SystemState) -> SystemState:
    """Validate inputs, assign session_id, set initial tarot/astrology stubs."""
    if not state.session_id:
        state.session_id = str(uuid.uuid4())

    # Astrology calculation via Skyfield (JPL ephemeris)
    if not state.astrology_raw and state.birth_info:
        bi = state.birth_info
        try:
            import asyncio as _aio
            astro_dict, astro_obj = await _aio.wait_for(
                _aio.get_event_loop().run_in_executor(None, _calculate_astrology, bi),
                timeout=30,
            )
            state.astrology_raw = astro_dict
            # Store AstrologyResult for synastry calculation (no global needed)
            if astro_obj is not None:
                async with _astro_dict_lock:
                    _astro_results.setdefault(state.session_id, {})["self"] = astro_obj
        except Exception as e:
            # Fallback to stub if real calculation fails or times out
            state.astrology_raw = _stub_astrology(bi)
            state.errors.append(f"astrology_real_fallback: {e}")

    # Tarot stub (draw random if not provided)
    if not state.tarot_raw:
        state.tarot_raw = {"spread": "Three-Card Spread", "cards": []}

    state.phase = "init"
    return state


def _estimate_utc_offset(longitude: float | None, latitude: float | None) -> float:
    """
    Estimate UTC offset from coordinates using regional timezone rules.
    Uses political timezone boundaries where known (e.g., China is all UTC+8),
    falls back to longitude/15.0 approximation for unknown regions.
    """
    if longitude is None:
        return 8.0  # default CST for China

    lat = latitude if latitude is not None else 0

    # ── Asia ──
    # China: entire country uses UTC+8
    if 18 <= lat <= 54 and 73 <= longitude <= 135:
        return 8.0
    # Japan: UTC+9
    if 24 <= lat <= 46 and 122 <= longitude <= 146:
        return 9.0
    # Korea: UTC+9
    if 33 <= lat <= 43 and 124 <= longitude <= 132:
        return 9.0
    # India: UTC+5:30
    if 6 <= lat <= 37 and 68 <= longitude <= 98:
        return 5.5
    # Nepal: UTC+5:45
    if 26 <= lat <= 31 and 80 <= longitude <= 89:
        return 5.75
    # Myanmar: UTC+6:30
    if 9 <= lat <= 29 and 92 <= longitude <= 102:
        return 6.5
    # Thailand/Vietnam/Cambodia/Laos: UTC+7
    if 5 <= lat <= 24 and 98 <= longitude <= 110:
        return 7.0
    # Indonesia (Western): UTC+7
    if -8 <= lat <= 6 and 95 <= longitude <= 115:
        return 7.0
    # Indonesia (Central): UTC+8
    if -8 <= lat <= 2 and 115 <= longitude <= 125:
        return 8.0
    # Philippines: UTC+8
    if 4 <= lat <= 21 and 116 <= longitude <= 127:
        return 8.0
    # Malaysia/Singapore: UTC+8
    if -1 <= lat <= 7 and 99 <= longitude <= 119:
        return 8.0
    # Iran: UTC+3:30
    if 25 <= lat <= 40 and 44 <= longitude <= 64:
        return 3.5
    # Saudi Arabia/Gulf: UTC+3
    if 12 <= lat <= 32 and 35 <= longitude <= 60:
        return 3.0
    # Turkey: UTC+3
    if 36 <= lat <= 42 and 26 <= longitude <= 45:
        return 3.0

    # ── Europe ──
    # UK/Ireland: UTC+0 (UTC+1 summer)
    if 49 <= lat <= 61 and -11 <= longitude <= 2:
        return 0.0
    # Western Europe (France, Spain, etc.): UTC+1
    if 36 <= lat <= 51 and -10 <= longitude <= 15:
        return 1.0
    # Central Europe (Germany, Italy, etc.): UTC+1
    if 42 <= lat <= 56 and 5 <= longitude <= 18:
        return 1.0
    # Eastern Europe: UTC+2
    if 42 <= lat <= 58 and 18 <= longitude <= 32:
        return 2.0
    # Russia (European): UTC+3
    if 45 <= lat <= 70 and 28 <= longitude <= 45:
        return 3.0

    # ── Americas ──
    # US East Coast: UTC-5
    if 24 <= lat <= 50 and -82 < longitude <= -67:
        return -5.0
    # US Central: UTC-6
    if 25 <= lat <= 49 and -105 < longitude <= -82:
        return -6.0
    # US Mountain: UTC-7
    if 31 <= lat <= 49 and -115 < longitude <= -105:
        return -7.0
    # US Pacific: UTC-8
    if 32 <= lat <= 49 and -125 <= longitude <= -115:
        return -8.0
    # Mexico: UTC-6 (most)
    if 14 <= lat <= 33 and -118 <= longitude <= -86:
        return -6.0
    # Brazil (most): UTC-3
    if -34 <= lat <= 5 and -74 <= longitude <= -35:
        return -3.0
    # Argentina: UTC-3
    if -55 <= lat <= -22 and -74 <= longitude <= -54:
        return -3.0

    # ── Oceania ──
    # Australia East: UTC+10 (east of Papua to avoid Indonesia overlap)
    if -44 <= lat <= -10 and 140 <= longitude <= 155:
        return 10.0
    # New Zealand: UTC+12
    if -48 <= lat <= -34 and 166 <= longitude <= 179:
        return 12.0

    # ── Africa ──
    # South Africa: UTC+2
    if -35 <= lat <= -22 and 16 <= longitude <= 33:
        return 2.0
    # West Africa (Nigeria etc.): UTC+1
    if 0 <= lat <= 15 and -18 <= longitude <= 16:
        return 1.0

    # Default: solar time approximation
    return round(longitude / 15.0)


def _calculate_astrology(bi: BirthInfo) -> tuple[dict, Any]:
    """
    Real astrology calculation via Skyfield (JPL DE421 ephemeris).
    Computes planetary positions, houses, ASC, MC, and aspects.
    Returns (dict, AstrologyResult) tuple so callers can store both the
    serialized dict (for state) and the live object (for synastry) without
    relying on shared global state.
    """
    utc_offset = _estimate_utc_offset(bi.longitude, bi.latitude)

    lon_for_calc = bi.longitude if bi.longitude is not None else 120.0
    lat_for_calc = bi.latitude if bi.latitude is not None else 39.9

    result = _astro_calc.calculate(
        year=bi.year, month=bi.month, day=bi.day,
        hour=bi.hour, minute=bi.minute,
        latitude=lat_for_calc, longitude=lon_for_calc,
        utc_offset=utc_offset,
    )
    return result.to_dict(), result


def _stub_astrology(bi: BirthInfo) -> dict:
    """Fallback stub when Skyfield calculation fails."""
    from lunar_python import Solar
    solar = Solar.fromYmd(bi.year, bi.month, bi.day)
    month = bi.month
    cy = get_current_year_ganzhi()

    sign_map = {
        1: "Capricorn", 2: "Aquarius", 3: "Pisces", 4: "Aries",
        5: "Taurus", 6: "Gemini", 7: "Cancer", 8: "Leo",
        9: "Virgo", 10: "Libra", 11: "Scorpio", 12: "Sagittarius",
    }
    sun_sign = sign_map.get(month, "Unknown")
    moon_sign = sign_map.get((month + 2) % 12 + 1, "Unknown")
    ascendant = sign_map.get((bi.hour // 2) % 12 + 1, "Unknown")

    # 2026 transit context (updated yearly)
    transit_note = (
        f"In {cy} year (2026): "
        f"Jupiter in Cancer (expansion in home/family), "
        f"Saturn in Pisces (spiritual lessons), "
        f"Uranus in Taurus (financial innovation), "
        f"Pluto in Aquarius (collective transformation). "
        f"Eclipses in Virgo-Pisces axis affecting health and spirituality."
    )

    return {
        "sun_sign": sun_sign,
        "moon_sign": moon_sign,
        "ascendant": ascendant,
        "planets": {
            "Sun":    {"sign": sun_sign, "house": 10, "degree": bi.day},
            "Moon":   {"sign": moon_sign, "house": 4, "degree": bi.day * 2 % 30},
            "Saturn": {"sign": "Pisces", "house": 12, "degree": 15},
            "Jupiter":{"sign": "Cancer", "house": 2, "degree": 22},
            "Uranus": {"sign": "Taurus", "house": 1, "degree": 18},
            "Neptune":{"sign": "Pisces", "house": 12, "degree": 25},
            "Pluto":  {"sign": "Aquarius", "house": 11, "degree": 3},
        },
        "aspects": [],
        "saturn_aspects": "Saturn in Pisces (retrograde until Nov 2026). Saturn conjunct Neptune (orb 3 deg) — dissolving boundaries, spiritual awakening vs confusion.",
        "transits_this_year": transit_note,
        # New structured data (empty defaults for stub)
        "dignities": {},
        "dignity_ranking": [],
        "aspect_patterns": [],
        "element_summary": {"fire": 0, "earth": 0, "air": 0, "water": 0},
        "modality_summary": {"cardinal": 0, "fixed": 0, "mutable": 0},
        "missing_elements": [],
        "dominant_element": "",
        "hemisphere": {"east_west": "unknown", "north_south": "unknown", "description": ""},
        "fixed_star_conjunctions": [],
        # P0 stub defaults
        "lunar_nodes": {
            "north_node": {"sign": "", "sign_cn": "", "degree": 0, "longitude": 0},
            "south_node": {"sign": "", "sign_cn": "", "degree": 0, "longitude": 0},
        },
        "house_cusp_signs": {},
        "house_lords": {},
        "accidental_dignities": {},
        "total_dignity_ranking": [],
        # P1 stub defaults
        "chart_shape": {},
        "critical_degrees": {},
        "sect": "",
        "planet_returns": [],
        "transit_planets": {},
        "transit_natal_aspects": [],
    }


def _build_free_summary(core_result: str, state: SystemState) -> str:
    """
    Build a complete free version with enhanced sections:
      1. 【A·核心性格底色】 — full personality overview
      2. 【B·跨维度共鸣】 — full cross-dimension resonance (all sub-dimensions)
      3. 【C·五维速览】 — dimension scores visualization
      4. 【D·近期关键提醒】 — near-term alerts
      5. 【E·行动建议速览】 — quick action suggestions
      6. 【F·你的独特优势】 — user's unique strengths
      7. 【G·深度报告预览】 — preview of premium report

    Rules:
      - Each section is COMPLETE (never cut off mid-sentence)
      - Total length capped at ~4000 chars (concise but comprehensive)
      - Ends with a compelling upgrade CTA
    """
    import re as _re
    is_en = state.language == "en"

    def _extract_section(text: str, marker: str) -> str:
        """Extract a complete section, stopping at the next 【X· marker.
        Uses regex for flexible matching (handles optional spaces around ·)."""
        # Build a regex from the first character after 【 to match the section letter
        # e.g. marker="【A·" → regex r'【A\s*·'
        letter = marker[1] if len(marker) > 1 else marker[0]
        start_match = _re.search(_re.escape(marker[0]) + letter + r'\s*·', text)
        if not start_match:
            return ""
        rest = text[start_match.end():]
        # Find next section marker
        end_match = _re.search(r'[【\[]\s*[A-Za-z一-鿿]\s*·', rest)
        if end_match:
            section = rest[:end_match.start()].strip()
        else:
            section = rest.strip()
        return section

    def _ensure_complete(text: str, max_len: int) -> str:
        """Ensure text ends at a complete sentence within max_len."""
        if len(text) <= max_len:
            return text
        # Find last sentence-ending punctuation within limit
        seps = [".", "!", "?"] if is_en else ["。", "！", "？"]
        best_pos = -1
        for sep in seps:
            pos = text.rfind(sep, 0, max_len)
            if pos > best_pos:
                best_pos = pos
        if best_pos > max_len // 3:
            return text[:best_pos + 1]
        # Fallback: paragraph break
        pos = text.rfind("\n\n", 0, max_len)
        if pos > max_len // 3:
            return text[:pos].strip()
        # Last resort: comma break
        for sep in ["，", ",", "；", ";"]:
            pos = text.rfind(sep, max_len // 2, max_len)
            if pos > max_len // 3:
                return text[:pos + 1]
        ellipsis = "..." if is_en else "……"
        return text[:max_len].rstrip() + ellipsis

    # ── Extract Section A: Personality (full, no truncation) ──
    personality = ""
    for marker in ["【A·", "【A ·", "【命盘底色】"]:
        section = _extract_section(core_result, marker)
        if section and len(section) > 50:
            personality = section  # Keep full section
            break

    # ── Extract behavioral patterns and growth edge from personality ──
    behavioral_patterns = ""
    growth_edge = ""
    if personality:
        # Try to extract "关键行为模式" / "Key Behavioral Patterns"
        bp_patterns = [
            r'(?:关键行为模式|Key Behavioral Patterns)[：:]\s*(.+?)(?=\n\n|成长建议|Growth Edge|$)',
        ]
        for pattern in bp_patterns:
            m = _re.search(pattern, personality, _re.DOTALL)
            if m:
                behavioral_patterns = m.group(1).strip()
                break
        # Try to extract "成长建议" / "Growth Edge"
        ge_patterns = [
            r'(?:成长建议|Growth Edge)[：:]\s*(.+?)(?:\n\n|$)',
        ]
        for pattern in ge_patterns:
            m = _re.search(pattern, personality, _re.DOTALL)
            if m:
                growth_edge = m.group(1).strip()
                break

    # ── Extract Section B: Cross-dimension Resonance (full, no truncation) ──
    resonance = ""
    for marker in ["【B·", "【B ·", "【跨维度共鸣】"]:
        section = _extract_section(core_result, marker)
        if section and len(section) > 50:
            resonance = section  # Keep full section
            break

    # ── Extract Section D: Near-term Alerts ──
    near_term = ""
    for marker in ["【D·", "【D ·", "【近期关键提醒】"]:
        section = _extract_section(core_result, marker)
        if section and len(section) > 20:
            near_term = section
            break

    # ── Extract Section E: Action Suggestions ──
    action_tips = ""
    for marker in ["【E·", "【E ·", "【行动建议速览】"]:
        section = _extract_section(core_result, marker)
        if section and len(section) > 20:
            action_tips = section
            break

    # ── Build Section F: Unique Strengths (from personality section) ──
    unique_strengths = ""
    if personality:
        # Multi-strategy extraction: try structured fields first, then regex fallback
        strengths = []
        # Strategy 1: Look for explicit strength mentions in behavioral patterns
        if behavioral_patterns:
            bp_items = _re.findall(r'[•·\-\d]+[、.．]?\s*(.+?)(?:\n|$)', behavioral_patterns)
            for item in bp_items[:2]:
                cleaned = item.strip().rstrip("。，")
                if len(cleaned) > 8:
                    strengths.append(f"• {cleaned}")
        # Strategy 2: Regex fallback on personality text
        if not strengths:
            strength_patterns = [
                r'(?:优势|strength|擅长|擅长)[：:](.+?)(?:\n|$)',
                r'(?:天赋|gift|天赋)[：:](.+?)(?:\n|$)',
                r'(?:核心特质|Core Trait)[：:](.+?)(?:\n|$)',
            ]
            for pattern in strength_patterns:
                matches = _re.findall(pattern, personality, _re.IGNORECASE)
                for m in matches[:2]:
                    cleaned = m.strip().rstrip("。，")
                    if len(cleaned) > 8:
                        strengths.append(f"• {cleaned}")
        if strengths:
            unique_strengths = "\n".join(strengths[:3])

    # ── Build Section G: Premium Preview (teaser from resonance) ──
    premium_preview = ""
    if resonance:
        # Take first meaningful sentence as preview
        sentences = _re.split(r'[。！？\n]', resonance)
        for s in sentences:
            s = s.strip()
            _preview_kw_cn = ['问题', '瓶颈', '挑战', '需要注意', '建议', '关键']
            _preview_kw_en = ['problem', 'bottleneck', 'challenge', 'attention', 'suggest', 'key', 'important', 'difficulty']
            _preview_kws = _preview_kw_cn + _preview_kw_en
            if len(s) > 30 and any(kw in s.lower() for kw in _preview_kws):
                premium_preview = s.rstrip("。，")
                break

    # ── Apply total length cap ──
    TOTAL_MAX = 5500  # Increased to accommodate behavioral patterns + growth edge + insights
    combined_sections = personality + resonance + near_term + action_tips
    if len(combined_sections) > TOTAL_MAX:
        # Prioritize: personality > resonance > action_tips > near_term
        if len(personality) > TOTAL_MAX // 2:
            personality = _ensure_complete(personality, TOTAL_MAX // 2)
        if len(resonance) > TOTAL_MAX // 2:
            resonance = _ensure_complete(resonance, TOTAL_MAX // 2)

    # ── Fallback: if sections not found, use first 2000 chars ──
    if not personality and not resonance:
        return _ensure_complete(core_result, 2000)

    # ── Assemble enhanced report ──
    lines = []

    # Section 1: Core Personality
    if personality:
        if is_en:
            lines.append("【A · Core Personality Blueprint】")
        else:
            lines.append("【A · 核心性格底色】")
        lines.append(personality)

    # Section 2: Cross-dimension Resonance
    if resonance:
        lines.append("")
        if is_en:
            lines.append("【B · Cross-Dimension Resonance (Pain Points)】")
        else:
            lines.append("【B · 跨维度共鸣（现状痛点）】")
        lines.append(resonance)

    # ── Dimension scores (visual + personalized insights) ──
    scores = state.dimension_scores or {}
    if scores and state.intent != "RELATIONSHIP":
        dim_names = (
            {"wealth": "Wealth", "relationship": "Love", "career": "Career",
             "health": "Health", "spiritual": "Spirit"}
            if is_en else
            {"wealth": "财运", "relationship": "感情", "career": "事业",
             "health": "健康", "spiritual": "精神"}
        )
        # Personalized insights per score range (zero LLM cost)
        _INSIGHTS_EN = {
            (9.0, 10.01): "Clear breakthrough opportunity ahead — take initiative",
            (7.5, 9.0): "Solid foundation — maintain momentum for steady growth",
            (6.0, 7.5): "Stable but lacking highlights — consider targeted investment",
            (4.0, 6.0): "Volatile — prepare a contingency plan",
            (0.0, 4.0): "Biggest weak point — prioritize focused improvement",
        }
        _INSIGHTS_ZH = {
            (9.0, 10.01): "近期有明显突破机会，建议主动出击",
            (7.5, 9.0): "基础扎实，保持节奏即可稳步提升",
            (6.0, 7.5): "平稳但缺少亮点，可适当投入精力突破",
            (4.0, 6.0): "需要重点关注意外波动，建议制定应对计划",
            (0.0, 4.0): "当前最大短板，建议优先投入资源改善",
        }
        _insights = _INSIGHTS_EN if is_en else _INSIGHTS_ZH

        lines.append("")
        if is_en:
            lines.append("【C · Five-Dimension Energy Overview】")
        else:
            lines.append("【C · 五维能量速览】")
        score_lines = []
        for dim, val in scores.items():
            name = dim_names.get(dim, dim)
            # Visual bar
            bar_len = int(val)
            if val < 5:
                bar = "▓" * bar_len + "░" * (10 - bar_len)
                indicator = "⚠️"
            elif val > 7:
                bar = "▓" * bar_len + "░" * (10 - bar_len)
                indicator = "✨"
            else:
                bar = "▓" * bar_len + "░" * (10 - bar_len)
                indicator = "📊"
            # Find insight for score range
            insight = ""
            for (lo, hi), text in _insights.items():
                if lo <= val < hi:
                    insight = text
                    break
            score_line = f"{indicator} {name}: {bar} {val}/10"
            if insight:
                score_line += f" → {insight}"
            score_lines.append(score_line)
        lines.append("\n".join(score_lines))

    # Section D: Near-term Alerts
    if near_term:
        lines.append("")
        if is_en:
            lines.append("【D · Near-Term Key Alerts】")
        else:
            lines.append("【D · 近期关键提醒】")
        lines.append(near_term)

    # Section E: Quick Action Tips
    if action_tips:
        lines.append("")
        if is_en:
            lines.append("【E · Quick Action Tips】")
        else:
            lines.append("【E · 行动建议速览】")
        lines.append(action_tips)

    # Section F: Unique Strengths
    if unique_strengths:
        lines.append("")
        if is_en:
            lines.append("【F · Your Unique Strengths】")
        else:
            lines.append("【F · 你的独特优势】")
        if is_en:
            lines.append("Based on your chart analysis, your unique strengths are:")
        else:
            lines.append("根据分析，你拥有以下独特优势：")
        lines.append(unique_strengths)

    # Section G: Premium Preview
    if premium_preview:
        lines.append("")
        if is_en:
            lines.append("【G · Premium Report Preview】")
            lines.append(f"💡 Unlock to see: {premium_preview}...")
        else:
            lines.append("【G · 深度报告预览】")
            lines.append(f"💡 解锁后可查看：{premium_preview}...")

    # ── Upgrade CTA ──
    lines.append("")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    if is_en:
        lines.append("🔓 Your complete analysis report is ready — unlock it now:")
        lines.append("")
        lines.append("• Complete 5-dimension diagnosis with confidence ratings")
        lines.append("• Cross-dimension contradiction analysis")
        lines.append("• Your next 12 months: key turning points & optimal timing windows")
        lines.append("• Deep-dive answer to your specific question")
        lines.append("• Energy harmonization plan + product recommendations")
        lines.append("")
        lines.append("💡 First-time unlock: 100 Stardust FREE!")
    else:
        lines.append("🔓 你的完整分析报告已就绪，立即解锁：")
        lines.append("")
        lines.append("• 五维详细诊断（财富/感情/事业/健康/精神）+ 置信度评分")
        lines.append("• 跨维度矛盾解释 — 哪些体系一致、哪些存在分歧")
        lines.append("• 未来12个月关键转折点 & 黄金窗口期")
        lines.append("• 针对你问题的专项深度分析（附专家数据支撑）")
        lines.append("• 专属能量调和方案 + 助运物推荐")
        lines.append("")
        lines.append("💡 新用户首次解锁赠送 100 星尘 — 足够解锁你的第一份完整报告！")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    return "\n".join(lines)


# ─── Public API ──────────────────────────────────────────────────────────

async def run_full_analysis(state: SystemState) -> SystemState:
    """
    Custom orchestrator with speculative master execution.

    Timeline (after optimization):
      0s   : init (astrology calc)
      5s   : workers start (5 parallel, merged qimen+ziwei)
      ~25s : Bazi complete → preprocessing + master_core starts
      ~60s : master_core done
      ~80s : all workers done → master_dims + master_actions start
      ~95s : all done → assemble final report

    User-perceived latency via SSE: ~60s (when master_core first appears)
    """
    from agents.workers import (
        run_astrology, run_tarot, run_bazi,
        run_qimen_ziwei, run_face, run_palm,
        run_partner_face, run_partner_palm,
        _WORKER_TIMEOUTS,
    )

    # ── Phase 1: Init ──
    state.phase = "init"
    state = await node_init(state)

    is_en = state.language == "en"

    # ── Phase 1b: Partner calculations (RELATIONSHIP intent) ──
    if state.intent == "RELATIONSHIP" and state.partner_birth_info:
        state.progress_message = "Calculating partner's chart…" if is_en else "正在计算对方数据…"
        try:
            import asyncio as _aio
            pi = state.partner_birth_info
            partner_astro, partner_astro_obj = await _aio.wait_for(
                _aio.get_event_loop().run_in_executor(None, _calculate_astrology, pi),
                timeout=30,
            )
            state.partner_astrology_raw = partner_astro
            # Store partner AstrologyResult for synastry calculation (no global needed)
            if partner_astro_obj is not None:
                async with _astro_dict_lock:
                    _astro_results.setdefault(state.session_id, {})["partner"] = partner_astro_obj
        except Exception as e:
            state.partner_astrology_raw = _stub_astrology(state.partner_birth_info)
            state.errors.append(f"partner_astrology_fallback: {e}")

        # Partner bazi calculation
        try:
            from calculators.bazi_calculator import BaziCalculator
            pi = state.partner_birth_info
            bazi_calc = BaziCalculator()
            loop = asyncio.get_event_loop()
            partner_bazi_result = await loop.run_in_executor(
                None, lambda: bazi_calc.calculate(
                    year=pi.year, month=pi.month, day=pi.day,
                    hour=pi.hour, minute=pi.minute, gender=pi.gender,
                )
            )
            state.partner_bazi_raw = partner_bazi_result.to_dict()
            # Store BaziResult for compatibility calculation
            async with _bazi_dict_lock:
                _bazi_results.setdefault(state.session_id, {})["partner"] = partner_bazi_result
        except Exception as e:
            state.errors.append(f"partner_bazi_error: {e}")

    state.phase = "parallel"
    state.progress_pct = 5
    state.progress_message = "Loading analysis data…" if is_en else "正在调取分析数据…"
    for aid in _WORKER_IDS:
        if aid == "qimen_ziwei":
            # Merged worker: set individual sub-worker statuses the frontend expects
            state.agent_status["qimen"] = "running"
            state.agent_status["ziwei"] = "running"
        else:
            state.agent_status[aid] = "running"

    # ── Launch all workers as background tasks ──
    worker_events = {aid: asyncio.Event() for aid in _WORKER_IDS}
    worker_outputs: dict[str, Any] = {}
    _completed_workers = 0
    _total_workers = len(_WORKER_IDS)

    # Runners: qimen_ziwei is a merged worker returning list[WorkerOutput]
    # Conditionally add partner face/palm workers for RELATIONSHIP intent
    _runners = [run_astrology, run_tarot, run_bazi, run_qimen_ziwei, run_face, run_palm]
    _runner_ids = list(_WORKER_IDS)
    _runner_timeouts = list(_WORKER_TIMEOUTS)

    if state.intent == "RELATIONSHIP":
        if state.partner_face_features:
            _runners.append(run_partner_face)
            _runner_ids.append("partner_face")
            _runner_timeouts.append(60)
            state.agent_status["partner_face"] = "running"
            worker_events["partner_face"] = asyncio.Event()
            _total_workers += 1
        if state.partner_palm_features:
            _runners.append(run_partner_palm)
            _runner_ids.append("partner_palm")
            _runner_timeouts.append(60)
            state.agent_status["partner_palm"] = "running"
            worker_events["partner_palm"] = asyncio.Event()
            _total_workers += 1

    # Stagger face/palm worker start to avoid concurrent LLM API rate limits
    _START_DELAYS = {
        "face": 1,
        "palm": 2,
        "partner_face": 3,
        "partner_palm": 4,
    }

    async def _run_one(runner, agent_id: str, timeout: int):
        nonlocal _completed_workers
        delay = _START_DELAYS.get(agent_id, 0)
        if delay:
            await asyncio.sleep(delay)
        try:
            result = await asyncio.wait_for(runner(state), timeout=timeout)
        except asyncio.TimeoutError:
            from agents.state import WorkerOutput
            err_msg = f"Analysis timed out after {timeout}s"
            logger.warning("%s: %s", agent_id, err_msg)
            if agent_id == "qimen_ziwei":
                result = [
                    WorkerOutput(agent_id="qimen", error=err_msg),
                    WorkerOutput(agent_id="ziwei", error=err_msg),
                ]
            else:
                result = WorkerOutput(agent_id=agent_id, error=err_msg)
        except Exception as e:
            from agents.state import WorkerOutput
            err_msg = str(e) or f"Unknown error in {agent_id}"
            logger.error("%s error: %s", agent_id, err_msg)
            if agent_id == "qimen_ziwei":
                result = [
                    WorkerOutput(agent_id="qimen", error=err_msg),
                    WorkerOutput(agent_id="ziwei", error=err_msg),
                ]
            else:
                result = WorkerOutput(agent_id=agent_id, error=err_msg)

        # Handle merged workers that return lists of WorkerOutput
        if isinstance(result, list):
            # Merged worker: extract individual outputs
            from agents.state import WorkerOutput as WO
            for r in result:
                if isinstance(r, WO):
                    worker_outputs[r.agent_id] = r
                    setattr(state, f"{r.agent_id}_output", r)
                    # Update agent status for each sub-worker
                    state.agent_status[r.agent_id] = "error" if r.error else "done"
                    async with _worker_count_lock:
                        _completed_workers += 1
                        state.progress_pct = 5 + int(60 * _completed_workers / _total_workers)
                        state.progress_message = f"Completed {_completed_workers}/{_total_workers} analyses…" if is_en else f"已完成 {_completed_workers}/{_total_workers} 项分析…"
            # Remove stale merged-worker key so frontend completedCount is correct
            state.agent_status.pop("qimen_ziwei", None)
        else:
            worker_outputs[agent_id] = result
            attr = f"{agent_id}_output"
            if hasattr(state, attr):
                setattr(state, attr, result)
            state.agent_status[agent_id] = "error" if result.error else "done"
            async with _worker_count_lock:
                _completed_workers += 1
                state.progress_pct = 5 + int(60 * _completed_workers / _total_workers)
                state.progress_message = f"Completed {_completed_workers}/{_total_workers} analyses…" if is_en else f"已完成 {_completed_workers}/{_total_workers} 项分析…"

        # Mark the merged worker event too
        worker_events[agent_id].set()
        return result

    worker_tasks = [
        asyncio.create_task(_run_one(r, aid, t))
        for r, aid, t in zip(_runners, _runner_ids, _runner_timeouts)
    ]

    # ── Continuous progress updater: interpolates between discrete worker completions ──
    # Without this, progress jumps abruptly (e.g., 5% → 14% → 28%) and stays
    # flat for 15-30s between completions, making the bar look stuck.
    _worker_start_time = asyncio.get_event_loop().time()
    _WORKER_PHASE_DURATION = 120  # expected total time for all workers in seconds (qimen_ziwei can take ~100s)

    async def _continuous_progress():
        """Smoothly advance progress_pct between worker completions using time interpolation."""
        _last_msg_time = asyncio.get_event_loop().time()
        while state.phase == "parallel":
            await asyncio.sleep(1)
            if state.phase != "parallel":
                break
            elapsed = asyncio.get_event_loop().time() - _worker_start_time
            # Time-based progress: linearly interpolate from 5% to 65% over expected duration
            time_pct = 5 + int(60 * min(elapsed / _WORKER_PHASE_DURATION, 0.95))
            # Use max of time-based and actual worker-completion progress
            actual_pct = 5 + int(60 * _completed_workers / _total_workers)
            blended = max(time_pct, actual_pct)
            async with _worker_count_lock:
                if blended > state.progress_pct:
                    state.progress_pct = blended
                    # Throttle message updates to max once per 5s to avoid SSE re-render storms
                    now = asyncio.get_event_loop().time()
                    if now - _last_msg_time >= 5:
                        _last_msg_time = now
                        state.progress_message = (
                            f"Completed {_completed_workers}/{_total_workers} analyses…"
                            if is_en else f"已完成 {_completed_workers}/{_total_workers} 项分析…"
                        )

    progress_updater = asyncio.create_task(_continuous_progress())

    # ── Speculative Master: start core when Bazi completes (fastest worker) ──
    async def _speculative_core():
        """Wait for Bazi (typically fastest ~20-30s), then run preprocessing + core sub-task."""
        try:
            await asyncio.wait_for(
                worker_events["bazi"].wait(),
                timeout=120,
            )
        except asyncio.TimeoutError:
            pass  # proceed with whatever is available

        # If bazi data is still missing, wait a bit more
        if not state.bazi_raw and not (state.bazi_output and state.bazi_output.report):
            logger.warning("Bazi data not available, waiting 10s more...")
            try:
                await asyncio.wait_for(worker_events.get("bazi", asyncio.Event()).wait(), timeout=10)
            except (asyncio.TimeoutError, KeyError):
                pass

        state.phase = "master"
        state.progress_pct = 70
        state.progress_message = "Cross-validating across dimensions…" if is_en else "正在进行跨维度交叉验证…"
        prep = run_master_preprocessing(state)
        result = await run_subtask_core(state, prep)
        state.progress_pct = 75
        state.progress_message = "Core synthesis done, generating dimension analysis…" if is_en else "核心综合完成，生成维度分析…"
        return result

    core_task = asyncio.create_task(_speculative_core())

    # ── Synastry computation: run IN PARALLEL with workers (RELATIONSHIP only) ──
    async def _compute_synastry():
        """Compute synastry data (astrology aspects + bazi compatibility) in background."""
        if state.intent != "RELATIONSHIP":
            return
        try:
            async with _astro_dict_lock:
                session_results = _astro_results.get(state.session_id, {}).copy()
            astro_self = session_results.get("self")
            astro_partner = session_results.get("partner")

            if astro_self and astro_partner:
                try:
                    synastry = _astro_calc.calculate_synastry(astro_self, astro_partner)
                    state.synastry_aspects = synastry.get("aspects", [])
                    composite = _astro_calc.calculate_composite(astro_self, astro_partner)
                    state.composite_chart = composite
                    logger.info("Synastry: %d cross-aspects computed", len(state.synastry_aspects))
                    logger.info("Composite ASC=%s", composite.get('ascendant', {}).get('sign_cn', '?'))
                except Exception as e:
                    state.errors.append(f"synastry_error: {e}")
                    logger.error("Synastry error: %s", e)

            if state.bazi_raw and state.partner_bazi_raw:
                try:
                    from calculators.bazi_calculator import BaziCalculator
                    loop = asyncio.get_event_loop()
                    bazi_compat = await loop.run_in_executor(
                        None, lambda: BaziCalculator.calculate_compatibility(
                            state.bazi_raw, state.partner_bazi_raw,
                        )
                    )
                    state.bazi_compatibility = bazi_compat
                    logger.info("Bazi compat score: %d/100", bazi_compat.get('score', 0))
                except Exception as e:
                    state.errors.append(f"bazi_compat_error: {e}")
                    state.bazi_compatibility = {}
                    logger.error("Bazi compat error: %s", e)
        finally:
            # Always clean up global state to prevent memory leak
            async with _astro_dict_lock:
                _astro_results.pop(state.session_id, None)
            async with _bazi_dict_lock:
                _bazi_results.pop(state.session_id, None)

    synastry_task = asyncio.create_task(_compute_synastry())

    # ── Wait for ALL workers to finish ──
    try:
        await asyncio.gather(*worker_tasks)
    finally:
        # Stop continuous progress updater — workers are all done (or errored)
        progress_updater.cancel()
        try:
            await progress_updater
        except asyncio.CancelledError:
            pass

    # ── Wait for synastry computation to finish (if RELATIONSHIP) ──
    if state.intent == "RELATIONSHIP":
        try:
            await asyncio.wait_for(synastry_task, timeout=15)
        except asyncio.TimeoutError:
            pass

    # Merge tags
    all_tags: list[str] = []
    for r in worker_outputs.values():
        all_tags.extend(r.tags)
        if r.error:
            state.errors.append(f"{r.agent_id}: {r.error}")
    state.computed_tags = list(set(all_tags))

    # ── Wait for speculative core to finish (may already be done) ──
    core_result = await core_task

    # ── Run remaining sub-tasks (dims + actions) with full worker data ──
    state.phase = "master"
    state.progress_pct = 80

    is_relationship = state.intent == "RELATIONSHIP"

    # Free users: skip dims + actions sub-tasks (saves 2 LLM calls)
    if state.is_premium:
        state.progress_message = "AI generating 5-dimension diagnosis & action plan…" if is_en else "AI 正在生成五维诊断与行动建议…"
        prep = run_master_preprocessing(state)  # re-run with complete data
        state.progress_pct = 85
        state.progress_message = "Generating dimension analysis…" if is_en else "正在生成维度分析…"
        tasks = [
            run_subtask_dims(state, prep),
            run_subtask_actions(state, prep),
        ]
        if is_relationship:
            from agents.master import run_subtask_synastry
            tasks.append(run_subtask_synastry(state))

        results = await asyncio.gather(*tasks)
        dims_result = results[0]
        actions_result = results[1]
        synastry_result = results[2] if is_relationship else ""

        state.progress_pct = 90
        state.progress_message = "Generating action plan…" if is_en else "正在生成行动建议…"
        state.master_summary = core_result[:500]
        parts = [core_result]
        if synastry_result:
            parts.append(synastry_result)
        parts.append(dims_result)
        parts.append(actions_result)
        state.master_detail = "\n\n".join(parts)
    else:
        state.progress_pct = 85
        state.progress_message = "Core synthesis done, finalizing…" if is_en else "核心综合完成，收尾中…"
        # Free version: complete teaser that answers user question and creates upgrade desire
        state.master_summary = _build_free_summary(core_result, state)

        # Free users don't need synastry subtask — it's behind paywall
        # This avoids the extra LLM call that causes 80% hang
        state.master_detail = ""

    state.progress_pct = 95
    state.progress_message = "Finalizing report…" if is_en else "正在整理报告…"
    await asyncio.sleep(0.5)  # Brief pause so user sees 95%

    try:
        state.progress_pct = 100
        state.progress_message = "Analysis complete" if is_en else "分析完成"
        state.phase = "done"

        return state
    finally:
        # Clean up global dicts to prevent memory leak
        # Protected by locks to prevent race with concurrent accesses
        sid = state.session_id or ""
        async with _astro_dict_lock:
            _astro_results.pop(sid, None)
        async with _bazi_dict_lock:
            _bazi_results.pop(sid, None)


async def run_chat(question: str, state: SystemState) -> tuple[str, str, SystemState]:
    """
    Entry point for follow-up chat.
    Returns (answer, routed_agent_id, updated_state).
    """
    answer, agent_id = await handle_followup(question, state)
    # handle_followup mutates state in-place, no dict conversion needed here
    return answer, agent_id, state