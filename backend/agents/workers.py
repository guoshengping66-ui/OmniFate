"""
agents/workers.py
5 vertical expert agents, each strictly isolated to its domain.
Merged workers (qimen+ziwei, astrology+bazi) reduce LLM calls from 7 to 5.
All run in PARALLEL via asyncio.gather().
"""
from __future__ import annotations
import asyncio
import time
import json
import re
from typing import Optional

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from config import get_settings
from agents.state import SystemState, WorkerOutput
from agents.prompts import (
    astrology_prompt, tarot_prompt, bazi_prompt,
    face_prompt, palm_prompt, qimen_prompt, ziwei_prompt,
    qimen_ziwei_combined_prompt,
)
from agents.tools import draw_tarot
from calculators.bazi_calculator import (
    BaziCalculator, get_current_year_ganzhi,
)
from calculators.qimen_calculator import QimenCalculator, calculate_qimen
from calculators.ziwei_calculator import ZiweiCalculator, calculate_ziwei

settings = get_settings()


# ─── LLM factory ──────────────────────────────────────────────────────────

_JSON_OUTPUT_INSTRUCTION = (
    "\n\n== CRITICAL: OUTPUT FORMAT ==\n"
    "你必须以严格的JSON格式输出分析结果，不要输出任何其他文本。\n"
    "所有文字值必须使用纯中文，不要中英文混杂。\n"
    "```json\n"
    '{\n'
    '  "summary": "200字核心结论，概括命格特质和关键发现",\n'
    '  "dimensions": {\n'
    '    "wealth": "80-120字财运分析",\n'
    '    "relationship": "80-120字感情分析",\n'
    '    "career": "80-120字事业分析",\n'
    '    "health": "80-120字健康分析",\n'
    '    "spiritual": "80-120字精神/灵性分析"\n'
    '  },\n'
    '  "key_findings": ["发现1(含置信度)", "发现2", "发现3"],\n'
    '  "weakness_tags": ["#缺火", "#官杀混杂"],\n'
    '  "strength_tags": ["#领导力强"],\n'
    '  "boost_elements": ["火", "水"],\n'
    '  "conflict_warnings": ["矛盾信号1"]\n'
    '}\n'
    "```\n"
    "规则：summary必填；dimensions中无数据的维度填空字符串""；key_findings 3-5条。\n"
    "注意：boost_elements必须使用中文五行名称（火、水、木、金、土），不要使用英文。\n"
)

_JSON_OUTPUT_INSTRUCTION_EN = (
    "\n\n== CRITICAL: OUTPUT FORMAT ==\n"
    "You MUST output the analysis in strict JSON format. Do NOT output any other text.\n"
    "ALL text values MUST be in English. Do NOT mix Chinese and English.\n"
    "```json\n"
    '{\n'
    '  "summary": "200-word core conclusion summarizing chart traits and key findings",\n'
    '  "dimensions": {\n'
    '    "wealth": "80-120 word wealth analysis",\n'
    '    "relationship": "80-120 word love/relationship analysis",\n'
    '    "career": "80-120 word career analysis",\n'
    '    "health": "80-120 word health analysis",\n'
    '    "spiritual": "80-120 word spiritual analysis"\n'
    '  },\n'
    '  "key_findings": ["finding 1 (with confidence)", "finding 2", "finding 3"],\n'
    '  "weakness_tags": ["#weakness1", "#weakness2"],\n'
    '  "strength_tags": ["#strength1"],\n'
    '  "boost_elements": ["fire", "water"],\n'
    '  "conflict_warnings": ["conflict signal 1"]\n'
    '}\n'
    "```\n"
    "Rules: summary is required; leave empty string for dimensions without data; 3-5 key_findings.\n"
    "IMPORTANT: ALL text values in the JSON MUST be in English. Do NOT mix languages.\n"
)


def _get_json_instruction(language: str = "zh", is_premium: bool = False) -> str:
    """Return the appropriate JSON output instruction based on language and premium status."""
    if is_premium:
        return _JSON_OUTPUT_INSTRUCTION_EN if language == "en" else _JSON_OUTPUT_INSTRUCTION
    # Free users: compact format (summary + 3 core dimensions + tags)
    return _JSON_OUTPUT_INSTRUCTION_COMPACT_EN if language == "en" else _JSON_OUTPUT_INSTRUCTION_COMPACT


# Compact JSON format for free users: reduces output tokens by ~40%
_JSON_OUTPUT_INSTRUCTION_COMPACT = (
    "\n\n== CRITICAL: OUTPUT FORMAT ==\n"
    "你必须以严格的JSON格式输出分析结果，不要输出任何其他文本。\n"
    "所有文字值必须使用纯中文，不要中英文混杂。\n"
    "```json\n"
    '{\n'
    '  "summary": "150字核心结论，概括命格特质和关键发现",\n'
    '  "dimensions": {\n'
    '    "wealth": "60字财运分析",\n'
    '    "relationship": "60字感情分析",\n'
    '    "career": "60字事业分析",\n'
    '    "health": "60字健康分析",\n'
    '    "spiritual": "60字精神/灵性分析"\n'
    '  },\n'
    '  "key_findings": ["发现1(含置信度)", "发现2", "发现3"],\n'
    '  "weakness_tags": ["#缺火", "#官杀混杂"],\n'
    '  "strength_tags": ["#领导力强"],\n'
    '  "boost_elements": ["火", "水"],\n'
    '  "conflict_warnings": ["矛盾信号1"]\n'
    '}\n'
    "```\n"
    "规则：summary必填；dimensions五个维度都要输出，每个60字左右；"
    "key_findings 3-5条；boost_elements必须使用中文五行名称。\n"
)

_JSON_OUTPUT_INSTRUCTION_COMPACT_EN = (
    "\n\n== CRITICAL: OUTPUT FORMAT ==\n"
    "You MUST output the analysis in strict JSON format. Do NOT output any other text.\n"
    "ALL text values MUST be in English. Do NOT mix Chinese and English.\n"
    "```json\n"
    '{\n'
    '  "summary": "150-word core conclusion summarizing chart traits and key findings",\n'
    '  "dimensions": {\n'
    '    "wealth": "60-word wealth analysis",\n'
    '    "relationship": "60-word love/relationship analysis",\n'
    '    "career": "60-word career analysis",\n'
    '    "health": "60-word health analysis",\n'
    '    "spiritual": "60-word spiritual/inner growth analysis"\n'
    '  },\n'
    '  "key_findings": ["finding 1 (with confidence)", "finding 2", "finding 3"],\n'
    '  "weakness_tags": ["#weakness1", "#weakness2"],\n'
    '  "strength_tags": ["#strength1"],\n'
    '  "boost_elements": ["fire", "water"],\n'
    '  "conflict_warnings": ["conflict signal 1"]\n'
    '}\n'
    "```\n"
    "Rules: summary required; all 5 dimensions must be included; "
    "3-5 key_findings; ALL text values in English.\n"
)


# ─── LLM Connection Pool (reuse across calls) ────────────────────────────
_llm_cache: dict[str, ChatOpenAI] = {}


def _llm(temperature: float = 0.35, model: str | None = None, max_tokens: int | None = None):
    from langchain_openai import ChatOpenAI
    model_key = model or settings.OPENAI_MODEL
    tokens = max_tokens or settings.WORKER_MAX_TOKENS
    cache_key = f"{model_key}:{temperature}:{tokens}"
    if cache_key not in _llm_cache:
        kwargs = dict(
            model=model_key,
            api_key=settings.OPENAI_API_KEY,
            temperature=temperature,
            max_tokens=tokens,
        )
        if settings.OPENAI_BASE_URL:
            kwargs["base_url"] = settings.OPENAI_BASE_URL
        _llm_cache[cache_key] = ChatOpenAI(**kwargs)
    return _llm_cache[cache_key]


# Common Chinese命理 terms → English mapping for post-processing cleanup
_ZH_EN_MAP = {
    "日主": "Core Profile", "月令": "Seasonal Influence", "用神": "Strength Pattern",
    "忌神": "Growth Area", "喜神": "Support Pattern", "闲神": "Neutral Pattern",
    "正官": "Structured Trait", "七杀": "Challenge Pattern", "正印": "Support Pattern",
    "偏印": "Indirect Support", "食神": "Creative Expression", "伤官": "Independent Thinking",
    "正财": "Steady Earnings", "偏财": "Variable Income", "比肩": "Peer Trait",
    "劫财": "Competitive Trait", "天干": "Upper Cycle", "地支": "Lower Cycle",
    "命宫": "Foundation Profile", "财帛宫": "Financial Pattern", "官禄宫": "Career Trajectory",
    "疾厄宫": "Health Pattern", "迁移宫": "Travel Tendency", "田宅宫": "Property Trend",
    "夫妻宫": "Relationship Pattern", "子女宫": "Family Dynamics", "兄弟宫": "Social Network",
    "父母宫": "Heritage Influence", "交友宫": "Community Circle",
    "金": "Metal", "木": "Wood", "水": "Water", "火": "Fire", "土": "Earth",
    "身旺": "strong core profile", "身弱": "developing core profile",
    "调候": "climate adjustment", "通关": "bridging element",
    "桃花": "Social Charm", "驿马": "Mobility Pattern", "华盖": "Scholarly Pattern",
    "天乙贵人": "Support Network", "文昌贵人": "Learning Pattern",
    "羊刃": "Intensity Pattern", "空亡": "Not Applicable",
    "大运": "Development Phase", "流年": "Annual Trend", "流月": "Monthly Trend",
}


def _clean_english(text: str) -> str:
    """Replace common Chinese命理 terms with English equivalents in English output."""
    if not text:
        return text
    for zh, en in _ZH_EN_MAP.items():
        text = text.replace(zh, en)
    # Remove any remaining CJK characters (Chinese/Japanese/Korean)
    # But keep punctuation and numbers
    text = re.sub(r'[一-鿿㐀-䶿]+', '', text)
    # Clean up double spaces left by removal
    text = re.sub(r'  +', ' ', text)
    return text.strip()


async def _call(system: str, user: str, append_json_format: bool = True, model: str | None = None, language: str = "zh", is_premium: bool = False) -> str:
    """Single async LLM call. append_json_format adds JSON output instruction."""
    from langchain_core.messages import SystemMessage, HumanMessage
    llm = _llm(model=model)

    # Add explicit language instruction to prevent mixing
    if language == "en":
        lang_instruction = (
            "\n\n== STRICT LANGUAGE REQUIREMENT ==\n"
            "CRITICAL: Output the ENTIRE analysis in English. ZERO Chinese characters allowed.\n"
            "Translate ALL Chinese terms to behavioral/psychological English equivalents:\n"
            "  日主→Day Core Profile, 月令→Seasonal Pattern, 用神→Supporting Element, 忌神→Conflicting Element\n"
            "  正官→Structured Pattern, 七杀→Challenge Pattern, 正印→Resource Pattern, 偏印→Alternative Resource\n"
            "  食神→Creative Expression, 伤官→Independent Thinking, 正财→Direct Wealth, 偏财→Indirect Wealth\n"
            "  比肩→Peer Pattern, 劫财→Competitive Pattern, 天干→Core Trait, 地支→Hidden Trait\n"
            "  五行→Five Elements, 金→Metal, 木→Wood, 水→Water, 火→Fire, 土→Earth\n"
            "  子→Zi(Rat), 丑→Chou(Ox), 寅→Yin(Tiger), 卯→Mao(Rabbit), 辰→Chen(Dragon)\n"
            "  巳→Si(Snake), 午→Wu(Horse), 未→Wei(Goat), 申→Shen(Monkey), 酉→You(Rooster)\n"
            "  戌→Xu(Dog), 亥→Hai(Pig)\n"
            "Do NOT use fortune-telling, metaphysical, or spiritual terminology.\n"
            "Do NOT output any Chinese characters. If unsure, use pinyin transliteration."
        )
    else:
        lang_instruction = (
            "\n\n== 语言要求 ==\n"
            "重要：整个分析必须使用纯中文输出。"
            "所有文字值、描述和解释都必须使用中文。"
            "不要中英文混杂。五行元素名称请使用中文（如：火、水、木、金、土）。"
        )

    sys_content = system + lang_instruction + (_get_json_instruction(language, is_premium) if append_json_format else "")
    msgs = [SystemMessage(content=sys_content), HumanMessage(content=user)]
    try:
        resp = await asyncio.wait_for(llm.ainvoke(msgs), timeout=90)
    except asyncio.TimeoutError:
        print(f"[_call] Worker LLM timed out after 90s")
        return ""
    result = resp.content
    # Detect truncation
    resp_meta = getattr(resp, "response_metadata", {}) or {}
    finish_reason = resp_meta.get("finish_reason", "")
    if finish_reason == "length":
        print(f"[_call] ⚠️  Worker output TRUNCATED (finish_reason=length)")
    # Post-process: clean residual Chinese in English output
    if language == "en":
        result = _clean_english(result)
    return result


def _parse_worker_report(text: str) -> dict:
    """Parse worker JSON output. Returns structured dict with fallback to free text."""
    _DEFAULTS = {
        "summary": "",
        "dimensions": {},
        "key_findings": [],
        "weakness_tags": [],
        "strength_tags": [],
        "boost_elements": [],
        "conflict_warnings": [],
    }

    def _fill(data: dict) -> dict:
        for k, v in _DEFAULTS.items():
            data.setdefault(k, v)
        return data

    # 1. Greedy extraction from ```json block (handles nested JSON objects)
    m = re.search(r"```json\s*(\{.*\})\s*```", text, re.DOTALL)
    if m:
        try:
            return _fill(json.loads(m.group(1)))
        except json.JSONDecodeError:
            pass

    # 2. Try parsing entire text as JSON (handles raw JSON without code fences)
    stripped = text.strip()
    if stripped.startswith("{"):
        try:
            return _fill(json.loads(stripped))
        except (json.JSONDecodeError, TypeError):
            pass

    # 3. Fallback: strip any JSON blocks from free text, use as summary
    clean = re.sub(r"```json\s*\{.*?\}\s*```", "", text, flags=re.DOTALL)
    clean = re.sub(r"```\w*\s*", "", clean).strip()
    return {
        **_DEFAULTS,
        "summary": clean[:500] if clean else text[:500],
    }


def _validate_worker_output(data: dict, agent_id: str) -> bool:
    """
    Validate parsed worker output quality. Returns True if output meets minimum standards.
    Used to trigger automatic retry for low-quality outputs.
    """
    summary = data.get("summary", "")
    dims = data.get("dimensions", {})
    tags = data.get("weakness_tags", []) + data.get("strength_tags", [])

    # Check 1: summary must exist and be substantial
    if len(summary) < 50:
        print(f"[VALIDATE] {agent_id}: summary too short ({len(summary)} chars)")
        return False

    # Check 2: at least 2 dimensions must have content
    filled_dims = sum(1 for v in dims.values() if v and len(str(v)) > 10)
    if filled_dims < 2:
        print(f"[VALIDATE] {agent_id}: only {filled_dims} dimensions filled")
        return False

    # Check 3: at least 2 tags
    if len(tags) < 2:
        print(f"[VALIDATE] {agent_id}: only {len(tags)} tags")
        return False

    return True


def _extract_json_tags(text: str) -> dict:
    m = re.search(r"```json\s*(\{.*\})\s*```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    return {}


# ─── Mock response (when OPENAI_API_KEY is not set) ──────────────────────

def _mock(agent_id: str, context: str) -> str:
    return (
        f"[MOCK] {agent_id.upper()} Agent analysis for: {context[:80]}\n"
        "This is a placeholder response. Configure OPENAI_API_KEY to enable real AI analysis.\n"
        '```json\n{"weakness_tags": ["mock"], "boost_elements": []}\n```'
    )


def _use_mock() -> bool:
    return not settings.OPENAI_API_KEY


async def _call_and_parse(system: str, user_msg: str, agent_id: str, state: SystemState, model: str | None = None) -> dict:
    """
    Call LLM, parse JSON output, validate quality, retry once if low quality.
    Returns parsed data dict.
    """
    report = _mock(agent_id, user_msg[:80]) if _use_mock() else await _call(
        system, user_msg, language=state.language, is_premium=state.is_premium, model=model,
    )
    data = _parse_worker_report(report)

    # Validate quality — retry once if output is poor
    if not _use_mock() and not _validate_worker_output(data, agent_id):
        print(f"[RETRY] {agent_id}: low quality output, retrying once...")
        report = await _call(
            system, user_msg, language=state.language, is_premium=state.is_premium, model=model,
        )
        data = _parse_worker_report(report)

    return data


def _extract_json_block(text: str) -> str:
    """Extract the first ```json ... ``` block from text.
    If none found, try to find a bare { ... } JSON object.
    Returns the raw JSON string (no code fences)."""
    # 1. Try ```json block (greedy to handle nested braces)
    m = re.search(r"```json\s*(\{.*\})\s*```", text, re.DOTALL)
    if m:
        return m.group(1)
    # 2. Try bare JSON (first { ... } that parses)
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            import json as _json
            _json.loads(m.group(0))
            return m.group(0)
        except _json.JSONDecodeError:
            pass
    # 3. Fallback: return text as-is
    return text


def _find_json_blocks(text: str) -> list[str]:
    """Find all ```json ... ``` blocks using brace counting for nested JSON.
    Unlike regex with .*?, this correctly handles nested { } inside JSON objects."""
    blocks = []
    i = 0
    while True:
        start = text.find("```json", i)
        if start == -1:
            break
        # Find the opening { after ```json
        brace_start = text.find("{", start)
        if brace_start == -1:
            i = start + 7
            continue
        # Count braces to find matching closing }
        depth = 0
        in_string = False
        escape = False
        for j in range(brace_start, len(text)):
            ch = text[j]
            if escape:
                escape = False
                continue
            if ch == "\\":
                escape = True
                continue
            if ch == '"':
                in_string = not in_string
                continue
            if in_string:
                continue
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    blocks.append(text[brace_start:j + 1])
                    break
        i = brace_start + 1
    return blocks


def _build_compact_report(data: dict) -> str:
    """Convert structured JSON worker output to compact text for Master consumption."""
    parts = []
    summary = data.get("summary", "")
    if summary:
        parts.append(summary)

    dims = data.get("dimensions", {})
    dim_parts = []
    for dim in ["wealth", "relationship", "career", "health", "spiritual"]:
        text = dims.get(dim, "")
        if text:
            dim_parts.append(f"【{dim}】{text}")
    if dim_parts:
        parts.append("\n".join(dim_parts))

    findings = data.get("key_findings", [])
    if findings:
        parts.append("【关键发现】\n" + "\n".join(f"  - {f}" for f in findings))

    return "\n".join(parts)


# ─── ASTROLOGY WORKER ─────────────────────────────────────────────────────

async def run_astrology(state: SystemState) -> WorkerOutput:
    from agents.prompts import astrology_prompt
    t0 = time.time()
    agent_id = "astrology"
    try:
        raw = state.astrology_raw
        planets = raw.get("planets", {})
        chart_summary = " | ".join(
            f"{p}: {info.get('sign','')} House {info.get('house','')}"
            for p, info in planets.items()
        ) or "Natal chart data pending calculation"

        import datetime
        current_year = str(datetime.date.today().year)

        # ── Format new structured data ──
        dignities = raw.get("dignities", {})
        dignities_lines = []
        for pname, d in dignities.items():
            flags = ", ".join(k for k, v in d.items() if v and k != "score")
            dignities_lines.append(f"  {pname}: score={d.get('score', 0)} [{flags}]")
        dignities_text = "\n".join(dignities_lines)

        ranking = raw.get("dignity_ranking", [])
        ranking_lines = [f"  {r['planet']}: {r['score']} ({r['status']})" for r in ranking]
        ranking_text = "\n".join(ranking_lines)

        patterns = raw.get("aspect_patterns", [])
        patterns_lines = []
        for p in patterns:
            planets_str = ", ".join(p.get("planets", []))
            patterns_lines.append(f"  {p['name']}: [{planets_str}] — {p.get('description', '')}")
        aspect_patterns_text = "\n".join(patterns_lines)

        elem = raw.get("element_summary", {})
        missing = raw.get("missing_elements", [])
        dom = raw.get("dominant_element", "")
        element_text = (
            f"  火:{elem.get('fire',0)} 土:{elem.get('earth',0)} "
            f"风:{elem.get('air',0)} 水:{elem.get('water',0)}"
            f" | 主导:{dom} | 缺失:{', '.join(missing) if missing else '无'}"
        )

        mod = raw.get("modality_summary", {})
        modality_text = (
            f"  基本:{mod.get('cardinal',0)} 固定:{mod.get('fixed',0)} 变动:{mod.get('mutable',0)}"
        )

        hemi = raw.get("hemisphere", {})
        hemisphere_text = (
            f"  东西:{hemi.get('east_west','unknown')}"
            f" 南北:{hemi.get('north_south','unknown')}"
            f" | {hemi.get('description','')}"
        )

        stars = raw.get("fixed_star_conjunctions", [])
        stars_lines = []
        for s in stars:
            stars_lines.append(
                f"  {s['planet']} 合 {s['star']}({s.get('star_cn','')}) "
                f"容许度{s.get('orb',0)}° — {s.get('meaning','')}"
            )
        fixed_stars_text = "\n".join(stars_lines)

        # ── P0: Lunar Nodes ──
        ln = raw.get("lunar_nodes", {})
        nn = ln.get("north_node", {})
        sn = ln.get("south_node", {})
        lunar_nodes_text = (
            f"  北交点: {nn.get('sign','')} {nn.get('degree',0)}° ({nn.get('sign_cn','')})\n"
            f"  南交点: {sn.get('sign','')} {sn.get('degree',0)}° ({sn.get('sign_cn','')})"
        )

        # ── P0: House Cusps & Lords ──
        hcs = raw.get("house_cusp_signs", {})
        hl = raw.get("house_lords", {})
        house_cusps_lines = []
        for hnum in range(1, 13):
            hkey = str(hnum)
            sign = hcs.get(hkey, "")
            rulers = hl.get(hkey, [])
            rulers_str = "/".join(rulers) if rulers else "—"
            house_cusps_lines.append(
                f"  第{hnum}宫: {sign} (宫主星: {rulers_str})"
            )
        house_cusps_text = "\n".join(house_cusps_lines)

        # ── P1: Accidental Dignity ──
        acc = raw.get("accidental_dignities", {})
        acc_lines = []
        for pname, ad in acc.items():
            factors_str = " + ".join(ad.get("factors", []))
            acc_lines.append(f"  {pname}: {factors_str} = {ad.get('score', 0)}")
        accidental_dignities_text = "\n".join(acc_lines)

        # ── P1: Total Dignity Ranking ──
        tot = raw.get("total_dignity_ranking", [])
        tot_lines = []
        for r in tot:
            tot_lines.append(
                f"  {r['planet']}: 先天{r.get('essential_score',0)}"
                f" + 后天{r.get('accidental_score',0)}"
                f" = {r.get('total_score',0)} ({r.get('status','')})"
            )
        total_dignity_text = "\n".join(tot_lines)

        # ── P1: Chart Shape ──
        cs = raw.get("chart_shape", {})
        chart_shape_text = (
            f"  形态: {cs.get('shape', '')} — {cs.get('description', '')}"
        )

        # ── P1: Critical Degrees ──
        cd = raw.get("critical_degrees", {})
        critical_degrees_lines = []
        for pname, info in cd.items():
            annotations = ", ".join(info.get("annotations", []))
            critical_degrees_lines.append(
                f"  {pname}: {info.get('sign','')} {info.get('degree',0)}° [{annotations}]"
            )
        critical_degrees_text = "\n".join(critical_degrees_lines) if critical_degrees_lines else "  无关键度数"

        # ── P1: Sect ──
        sect_val = raw.get("sect", "")
        sect_text = "昼盘(日生)" if sect_val == "day" else ("夜盘(夜生)" if sect_val == "night" else "")

        # ── P1: Planet Returns ──
        pr = raw.get("planet_returns", [])
        planet_returns_lines = []
        for r in pr:
            status_cn = {"past": "已过", "current": "进行中", "upcoming": "即将到来"}.get(r.get("status", ""), r.get("status", ""))
            label = r.get("label", f"{r['planet']} Return {r['return_number']}")
            planet_returns_lines.append(
                f"  {label}: {r.get('age',0)}岁 [{status_cn}]"
            )
        planet_returns_text = "\n".join(planet_returns_lines) if planet_returns_lines else "  无重大回归周期"

        # ── P1: Transit-Natal Aspects ──
        tp = raw.get("transit_planets", {})
        ta = raw.get("transit_natal_aspects", [])
        transit_planets_lines = []
        for pname, info in tp.items():
            retro_str = "R" if info.get("retrograde") else "D"
            transit_planets_lines.append(
                f"  {pname}: {info.get('sign','')} {info.get('degree',0)}° ({retro_str})"
            )
        transit_planets_text = "\n".join(transit_planets_lines) if transit_planets_lines else "  无流年数据"

        transit_aspects_lines = []
        for a in ta:
            transit_aspects_lines.append(
                f"  流年{a['transit_planet']} {a['aspect']} 本命{a['natal_planet']} (容许度{a.get('orb',0)}°)"
            )
        transit_aspects_text = "\n".join(transit_aspects_lines) if transit_aspects_lines else "  无精准流年相位"

        system = astrology_prompt(
            sun_sign=raw.get("sun_sign", "Unknown"),
            moon_sign=raw.get("moon_sign", "Unknown"),
            ascendant=raw.get("ascendant", "Unknown"),
            chart_summary=chart_summary,
            saturn_aspects=raw.get("saturn_aspects", ""),
            transits=raw.get("transits_this_year", ""),
            current_year=current_year,
            # Structured data — skip ranking_text when total_dignity is present (superset)
            dignities_text=dignities_text,
            ranking_text="" if total_dignity_text else ranking_text,
            aspect_patterns_text=aspect_patterns_text,
            element_text=element_text,
            modality_text="",  # Minor data, skip to save tokens
            hemisphere_text=hemisphere_text,
            fixed_stars_text=fixed_stars_text,
            # P0 new params
            lunar_nodes_text=lunar_nodes_text,
            house_cusps_text=house_cusps_text,
            accidental_dignities_text=accidental_dignities_text,
            total_dignity_text=total_dignity_text,
            # P1 new params
            chart_shape_text=chart_shape_text,
            critical_degrees_text=critical_degrees_text,
            sect_text=sect_text,
            planet_returns_text=planet_returns_text,
            transit_planets_text=transit_planets_text,
            transit_aspects_text=transit_aspects_text,
            language=state.language,
        )
        user_msg = "Please deliver a complete Western astrology analysis based on the chart data above."

        data = await _call_and_parse(system, user_msg, agent_id, state)
        return WorkerOutput(
            agent_id=agent_id,
            report=_build_compact_report(data),
            tags=data.get("weakness_tags", []),
            strength_tags=data.get("strength_tags", []),
            boost_elements=data.get("boost_elements", []),
            conflict_warnings=data.get("conflict_warnings", []),
            duration_ms=(time.time() - t0) * 1000,
        )
    except Exception as e:
        return WorkerOutput(agent_id=agent_id, error=str(e),
                            duration_ms=(time.time() - t0) * 1000)


# ─── TAROT WORKER ────────────────────────────────────────────────────────

async def run_tarot(state: SystemState) -> WorkerOutput:
    from agents.prompts import tarot_prompt
    from agents.tools import draw_tarot
    t0 = time.time()
    agent_id = "tarot"
    try:
        raw = state.tarot_raw
        cards = raw.get("cards", [])
        if not cards:
            # Auto-draw from full 78-card deck
            fallback = draw_tarot(raw.get("spread", "three-card"))
            cards = fallback["cards"]
            state.tarot_raw["cards"] = cards

        system = tarot_prompt(
            user_question=state.user_question,
            spread_name=raw.get("spread", "Three-Card Spread"),
            cards=cards,
            language=state.language,
        )
        user_msg = "Please deliver a complete Tarot reading based on the cards drawn above."

        data = await _call_and_parse(system, user_msg, agent_id, state)
        return WorkerOutput(
            agent_id=agent_id,
            report=_build_compact_report(data),
            tags=data.get("weakness_tags", []),
            strength_tags=data.get("strength_tags", []),
            boost_elements=data.get("boost_elements", []),
            conflict_warnings=data.get("conflict_warnings", []),
            duration_ms=(time.time() - t0) * 1000,
        )
    except Exception as e:
        return WorkerOutput(agent_id=agent_id, error=str(e),
                            duration_ms=(time.time() - t0) * 1000)


# ─── BAZI WORKER ─────────────────────────────────────────────────────────

async def run_bazi(state: SystemState) -> WorkerOutput:
    from agents.prompts import bazi_prompt
    from calculators.bazi_calculator import BaziCalculator, get_current_year_ganzhi
    t0 = time.time()
    agent_id = "bazi"
    try:
        bi = state.birth_info
        if bi is None:
            return WorkerOutput(agent_id=agent_id, error="birth_info missing")

        # Compute BaZi (CPU-bound, run in executor to avoid blocking event loop)
        _bazi_calc = BaziCalculator()
        loop = asyncio.get_event_loop()
        bazi_result = await loop.run_in_executor(
            None,
            lambda: _bazi_calc.calculate(
                bi.year, bi.month, bi.day, bi.hour, bi.minute,
                bi.longitude, gender=bi.gender,
            ),
        )
        state.bazi_raw = bazi_result.to_dict()
        raw = state.bazi_raw

        pillars = {
            "year":  {"gan_zhi": raw["year_gz"],  "gan": raw["year_gz"][0],  "zhi": raw["year_gz"][1],  "nayin": raw.get("nayin_year", "")},
            "month": {"gan_zhi": raw["month_gz"], "gan": raw["month_gz"][0], "zhi": raw["month_gz"][1], "nayin": ""},
            "day":   {"gan_zhi": raw["day_gz"],   "gan": raw["day_gz"][0],   "zhi": raw["day_gz"][1],   "nayin": ""},
            "hour":  {"gan_zhi": raw["hour_gz"],  "gan": raw["hour_gz"][0],  "zhi": raw["hour_gz"][1],  "nayin": ""},
        }
        birth_str = f"{bi.year}-{bi.month:02d}-{bi.day:02d} {bi.hour:02d}:00"

        face_sup = ""
        if state.face_features:
            face_sup = state.face_features.raw_text or ", ".join([
                f"{k}:{v}" for k, v in state.face_features.dict().items() if v and k != "raw_text"
            ])

        # Format shishen as readable text
        shishen = raw.get("shishen", {})
        shishen_lines = [f"  {k}: {v}" for k, v in shishen.items()]
        shishen_str = "\n".join(shishen_lines)

        # Format shensha as readable text
        shensha = raw.get("shensha", {})
        shensha_lines = [f"  {k}: {'、'.join(v)}" for k, v in shensha.items()]
        shensha_str = "\n".join(shensha_lines)

        # Format da_yun as readable text
        da_yun = raw.get("da_yun", [])
        da_yun_lines = []
        for dy in da_yun:
            da_yun_lines.append(
                f"  {dy.get('gan_zhi','')} ({dy.get('start_age','')}-{dy.get('end_age','')}岁) "
                f"[纳音:{dy.get('nayin','')}]"
            )
        da_yun_str = "\n".join(da_yun_lines)

        system = bazi_prompt(
            gender=bi.gender,
            birth_datetime=birth_str,
            pillars=pillars,
            wuxing_scores=raw.get("wuxing_scores", {}),
            missing=raw.get("missing_elements", []),
            day_master=raw.get("day_master", ""),
            current_year_gz=get_current_year_ganzhi(),
            day_master_element=raw.get("day_master_element", ""),
            day_master_yinyang=raw.get("day_master_yinyang", ""),
            strong_elements=raw.get("strong_elements", []),
            pattern=raw.get("pattern", ""),
            yong_shen=raw.get("yong_shen", ""),
            xi_shen=raw.get("xi_shen", ""),
            ji_shen=raw.get("ji_shen", ""),
            shishen_str=shishen_str,
            face_supplement=face_sup,
            birth_city=bi.city or "",
            longitude=bi.longitude,
            # New structured data from calculator
            shensha_str=shensha_str,
            shi_er_chang_sheng=raw.get("shi_er_chang_sheng", ""),
            nayin_year=raw.get("nayin_year", ""),
            da_yun_str=da_yun_str,
            language=state.language,
        )
        user_msg = "Please deliver a complete BaZi analysis based on the Four Pillars data above."

        data = await _call_and_parse(system, user_msg, agent_id, state)
        return WorkerOutput(
            agent_id=agent_id,
            report=_build_compact_report(data),
            tags=data.get("weakness_tags", []),
            strength_tags=data.get("strength_tags", []),
            boost_elements=data.get("boost_elements", []),
            conflict_warnings=data.get("conflict_warnings", []),
            duration_ms=(time.time() - t0) * 1000,
        )
    except Exception as e:
        return WorkerOutput(agent_id=agent_id, error=str(e),
                            duration_ms=(time.time() - t0) * 1000)


# ─── QIMEN WORKER ────────────────────────────────────────────────────────

async def run_qimen(state: SystemState) -> WorkerOutput:
    from agents.prompts import qimen_prompt
    from calculators.qimen_calculator import QimenCalculator
    t0 = time.time()
    agent_id = "qimen"
    try:
        bi = state.birth_info
        if bi is None:
            return WorkerOutput(agent_id=agent_id, error="birth_info missing")

        # Compute Qimen (CPU-bound, run in executor)
        _qimen_calc = QimenCalculator()
        loop = asyncio.get_event_loop()
        qimen_result = await loop.run_in_executor(
            None,
            lambda: _qimen_calc.calculate(
                bi.year, bi.month, bi.day, bi.hour, bi.minute,
                longitude=bi.longitude,
            ),
        )
        state.qimen_raw = qimen_result.to_dict()
        raw = state.qimen_raw

        birth_str = f"{bi.year}-{bi.month:02d}-{bi.day:02d} {bi.hour:02d}:00"

        system = qimen_prompt(
            dun_ju=raw.get("dun_ju", "阳遁一局"),
            zhi_fu_star=raw.get("zhi_fu_star", "天禽"),
            zhi_shi_door=raw.get("zhi_shi_door", "死门"),
            shi_chen_dizhi=raw.get("shi_chen_dizhi", "子"),
            shi_chen_gong=raw.get("shi_chen_gong", "坎一宫"),
            shi_chen_direction=raw.get("shi_chen_direction", "正北"),
            jieqi_name=raw.get("jieqi_name", ""),
            good_doors=raw.get("good_doors", []),
            bad_doors=raw.get("bad_doors", []),
            door_hints=raw.get("door_hints", {}),
            god_sequence=raw.get("god_sequence", []),
            gender=bi.gender,
            birth_datetime=birth_str,
            language=state.language,
        )
        user_msg = "Please deliver a complete Qimen Dunjia analysis based on the time plate data above."

        data = await _call_and_parse(system, user_msg, agent_id, state)
        return WorkerOutput(
            agent_id=agent_id,
            report=_build_compact_report(data),
            tags=data.get("weakness_tags", []),
            strength_tags=data.get("strength_tags", []),
            boost_elements=data.get("boost_elements", []),
            conflict_warnings=data.get("conflict_warnings", []),
            duration_ms=(time.time() - t0) * 1000,
        )
    except Exception as e:
        return WorkerOutput(agent_id=agent_id, error=str(e),
                            duration_ms=(time.time() - t0) * 1000)


# ─── ZIWEI WORKER ─────────────────────────────────────────────────────────

async def run_ziwei(state: SystemState) -> WorkerOutput:
    from agents.prompts import ziwei_prompt
    from calculators.ziwei_calculator import ZiweiCalculator
    t0 = time.time()
    agent_id = "ziwei"
    try:
        bi = state.birth_info
        if bi is None:
            return WorkerOutput(agent_id=agent_id, error="birth_info missing")

        # Compute Ziwei (CPU-bound, run in executor)
        _ziwei_calc = ZiweiCalculator()
        loop = asyncio.get_event_loop()
        ziwei_result = await loop.run_in_executor(
            None,
            lambda: _ziwei_calc.calculate(
                bi.year, bi.month, bi.day, bi.hour,
                gender=bi.gender,
            ),
        )
        state.ziwei_raw = ziwei_result.to_dict()
        raw = state.ziwei_raw

        birth_str = f"{bi.year}-{bi.month:02d}-{bi.day:02d} {bi.hour:02d}:00"

        system = ziwei_prompt(
            ming_gong_dizhi=raw.get("ming_gong_dizhi", ""),
            shen_gong_dizhi=raw.get("shen_gong_dizhi", ""),
            twelve_palaces=raw.get("twelve_palaces", {}),
            wu_xing_ju=raw.get("wu_xing_ju", "木三局"),
            wu_xing_ju_num=raw.get("wu_xing_ju_num", 3),
            ziwei_gong_dizhi=raw.get("ziwei_gong_dizhi", ""),
            ziwei_gong_name=raw.get("ziwei_gong_name", ""),
            main_star_positions=raw.get("main_star_positions", {}),
            si_hua=raw.get("si_hua", {}),
            ming_gong_main_stars=raw.get("ming_gong_main_stars", []),
            gender=bi.gender,
            birth_datetime=birth_str,
            language=state.language,
        )
        user_msg = "Please deliver a complete Ziwei Doushu analysis based on the natal chart data above."

        ziwei_model = settings.ZIWEI_MODEL or None
        data = await _call_and_parse(system, user_msg, agent_id, state, model=ziwei_model)
        return WorkerOutput(
            agent_id=agent_id,
            report=_build_compact_report(data),
            tags=data.get("weakness_tags", []),
            strength_tags=data.get("strength_tags", []),
            boost_elements=data.get("boost_elements", []),
            conflict_warnings=data.get("conflict_warnings", []),
            duration_ms=(time.time() - t0) * 1000,
        )
    except Exception as e:
        return WorkerOutput(agent_id=agent_id, error=str(e),
                            duration_ms=(time.time() - t0) * 1000)


# ─── COMBINED QIMEN + ZIWEI WORKER (1 LLM call instead of 2) ────────────

async def run_qimen_ziwei(state: SystemState) -> list[WorkerOutput]:
    """
    Merged worker: runs both Qimen and Ziwei calculators,
    then makes a SINGLE LLM call to produce both analyses.
    Returns list of 2 WorkerOutput objects [qimen_output, ziwei_output].

    Estimated time savings: ~30s (avoids one full LLM call).
    """
    t0 = time.time()
    bi = state.birth_info
    print(f"[QIMEN_ZIWEI] Worker started, birth_info={bi is not None}, mock={_use_mock()}", flush=True)
    if bi is None:
        print("[QIMEN_ZIWEI] ERROR: birth_info is None, skipping", flush=True)
        return [
            WorkerOutput(agent_id="qimen", error="birth_info missing"),
            WorkerOutput(agent_id="ziwei", error="birth_info missing"),
        ]

    birth_str = f"{bi.year}-{bi.month:02d}-{bi.day:02d} {bi.hour:02d}:00"

    # ── Run both calculators in parallel (CPU-bound) ──
    loop = asyncio.get_event_loop()
    _qimen_calc = QimenCalculator()
    _ziwei_calc = ZiweiCalculator()

    qimen_result, ziwei_result = await asyncio.gather(
        loop.run_in_executor(
            None,
            lambda: _qimen_calc.calculate(
                bi.year, bi.month, bi.day, bi.hour, bi.minute,
                longitude=bi.longitude,
            ),
        ),
        loop.run_in_executor(
            None,
            lambda: _ziwei_calc.calculate(
                bi.year, bi.month, bi.day, bi.hour,
                gender=bi.gender,
            ),
        ),
    )

    state.qimen_raw = qimen_result.to_dict()
    state.ziwei_raw = ziwei_result.to_dict()
    qimen_raw = state.qimen_raw
    ziwei_raw = state.ziwei_raw

    # ── Format ziwei data ──
    ming_stars = ", ".join(ziwei_raw.get("ming_gong_main_stars", [])) or "无主星"
    palaces_str = "\n".join(
        f"  {name}: {', '.join(stars) if isinstance(stars, list) else stars}"
        for name, stars in ziwei_raw.get("twelve_palaces", {}).items()
    ) if ziwei_raw.get("twelve_palaces") else "无数据"
    sihua_str = "\n".join(
        f"  {star}: {action}" for star, action in ziwei_raw.get("si_hua", {}).items()
    ) if ziwei_raw.get("si_hua") else "无四化"

    # ── Build combined prompt ──
    system = qimen_ziwei_combined_prompt(
        # Qimen params
        dun_ju=qimen_raw.get("dun_ju", "阳遁一局"),
        zhi_fu_star=qimen_raw.get("zhi_fu_star", "天禽"),
        zhi_shi_door=qimen_raw.get("zhi_shi_door", "死门"),
        shi_chen_dizhi=qimen_raw.get("shi_chen_dizhi", "子"),
        shi_chen_gong=qimen_raw.get("shi_chen_gong", "坎一宫"),
        shi_chen_direction=qimen_raw.get("shi_chen_direction", "正北"),
        jieqi_name=qimen_raw.get("jieqi_name", ""),
        good_doors=qimen_raw.get("good_doors", []),
        bad_doors=qimen_raw.get("bad_doors", []),
        door_hints=qimen_raw.get("door_hints", {}),
        god_sequence=qimen_raw.get("god_sequence", []),
        # Ziwei params
        ming_gong_dizhi=ziwei_raw.get("ming_gong_dizhi", ""),
        shen_gong_dizhi=ziwei_raw.get("shen_gong_dizhi", ""),
        twelve_palaces=ziwei_raw.get("twelve_palaces", {}),
        wu_xing_ju=ziwei_raw.get("wu_xing_ju", "木三局"),
        wu_xing_ju_num=ziwei_raw.get("wu_xing_ju_num", 3),
        ziwei_gong_dizhi=ziwei_raw.get("ziwei_gong_dizhi", ""),
        ziwei_gong_name=ziwei_raw.get("ziwei_gong_name", ""),
        main_star_positions=ziwei_raw.get("main_star_positions", {}),
        si_hua=ziwei_raw.get("si_hua", {}),
        ming_gong_main_stars=ziwei_raw.get("ming_gong_main_stars", []),
        ming_stars=ming_stars,
        palaces_str=palaces_str,
        sihua_str=sihua_str,
        # Common params
        gender=bi.gender,
        birth_datetime=birth_str,
        language=state.language,
    )
    user_msg = (
        "请同时完成奇门遁甲和紫微斗数两个维度的完整分析。"
        "分别输出两个独立的JSON对象，用===QIMEN_END===分隔。"
    )

    # ── Single LLM call (needs more tokens: two full analyses in one response) ──
    llm = _llm(temperature=0.35, max_tokens=4096)
    lang_instruction = (
        "\n\n== 语言要求 ==\n"
        "重要：整个分析必须使用纯中文输出。所有文字值、描述和解释都必须使用中文。"
        "不要中英文混杂。五行元素名称请使用中文（如：火、水、木、金、土）。"
    ) if state.language == "zh" else (
        "\n\n== LANGUAGE REQUIREMENT ==\n"
        "CRITICAL: Output the ENTIRE analysis in English. "
        "ALL text values, descriptions, and explanations MUST be in English. "
        "Do NOT mix Chinese and English."
    )

    sys_content = system + lang_instruction
    msgs = [SystemMessage(content=sys_content), HumanMessage(content=user_msg)]

    if _use_mock():
        print("[QIMEN_ZIWEI] Using MOCK data (no API key)", flush=True)
        report_q = _mock("qimen", "merged qimen+ziwei")
        report_z = _mock("ziwei", "merged qimen+ziwei")
    else:
        print(f"[QIMEN_ZIWEI] Calling LLM, model={settings.FREE_MODEL}, timeout=80s", flush=True)
        try:
            report = await asyncio.wait_for(llm.ainvoke(msgs), timeout=80)
            print(f"[QIMEN_ZIWEI] LLM response received, length={len(report.content)}", flush=True)
        except asyncio.TimeoutError:
            print("[QIMEN_ZIWEI] LLM timed out after 80s", flush=True)
            report = type('obj', (object,), {'content': '{"error":"timeout"}'})()
        full_text = report.content
        # Post-process: clean residual Chinese in English output
        if state.language == "en":
            full_text = _clean_english(full_text)

        # Split the combined response into qimen and ziwei parts
        separator = "===QIMEN_END==="
        if separator in full_text:
            raw_q, raw_z = full_text.split(separator, 1)
            # Strip non-JSON text (headings, etc.) and extract ```json blocks
            qimen_text = _extract_json_block(raw_q)
            ziwei_text = _extract_json_block(raw_z)
        else:
            # Fallback: find ```json blocks using brace counting (handles nested JSON)
            json_blocks = _find_json_blocks(full_text)
            if len(json_blocks) >= 2:
                qimen_text = json_blocks[0]
                ziwei_text = json_blocks[1]
            elif len(json_blocks) == 1:
                qimen_text = json_blocks[0]
                ziwei_text = ""
            else:
                # Last resort: use the whole text for qimen, empty for ziwei
                qimen_text = full_text
                ziwei_text = ""

        # Parse qimen output
        qimen_data = _parse_worker_report(qimen_text)
        if not _use_mock() and not _validate_worker_output(qimen_data, "qimen"):
            print("[RETRY] qimen (combined): low quality, using raw text as summary")
            qimen_data["summary"] = qimen_text[:500]

        # Parse ziwei output
        ziwei_data = _parse_worker_report(ziwei_text)
        if not _use_mock() and not _validate_worker_output(ziwei_data, "ziwei"):
            print("[RETRY] ziwei (combined): low quality, using raw text as summary")
            ziwei_data["summary"] = ziwei_text[:500]

        report_q = _build_compact_report(qimen_data)
        report_z = _build_compact_report(ziwei_data)

    t_elapsed = (time.time() - t0) * 1000
    print(f"[QIMEN_ZIWEI] Done in {t_elapsed:.0f}ms, qimen report={len(report_q)}chars, ziwei report={len(report_z)}chars", flush=True)

    # Return two separate WorkerOutput objects
    return [
        WorkerOutput(
            agent_id="qimen",
            report=report_q if not _use_mock() else report_q,
            tags=qimen_data.get("weakness_tags", []) if not _use_mock() else [],
            strength_tags=qimen_data.get("strength_tags", []) if not _use_mock() else [],
            boost_elements=qimen_data.get("boost_elements", []) if not _use_mock() else [],
            conflict_warnings=qimen_data.get("conflict_warnings", []) if not _use_mock() else [],
            duration_ms=t_elapsed,
        ),
        WorkerOutput(
            agent_id="ziwei",
            report=report_z if not _use_mock() else report_z,
            tags=ziwei_data.get("weakness_tags", []) if not _use_mock() else [],
            strength_tags=ziwei_data.get("strength_tags", []) if not _use_mock() else [],
            boost_elements=ziwei_data.get("boost_elements", []) if not _use_mock() else [],
            conflict_warnings=ziwei_data.get("conflict_warnings", []) if not _use_mock() else [],
            duration_ms=t_elapsed,
        ),
    ]


# ─── FACE WORKER ─────────────────────────────────────────────────────────

async def run_face(state: SystemState) -> WorkerOutput:
    from agents.prompts import face_prompt
    t0 = time.time()
    agent_id = "face"
    try:
        ff = state.face_features
        if ff is None:
            print(f"[FACE] no face features, skipping")
            return WorkerOutput(agent_id=agent_id,
                                report="No facial image provided. Face analysis skipped.",
                                duration_ms=(time.time() - t0) * 1000)

        face_text = ff.to_prompt_text()
        print(f"[FACE] starting LLM call, features length={len(face_text)}")

        # Inject raw_metrics as supplementary numerical data (same pattern as run_palm)
        if ff.raw_metrics:
            metrics_str = "\n".join(f"  {k}: {v}" for k, v in ff.raw_metrics.items())
            face_text += f"\n\n== 原始测量指标 ==\n{metrics_str}"

        gender = state.birth_info.gender if state.birth_info else "unknown"
        bazi_sup = ""
        if state.bazi_raw:
            raw = state.bazi_raw
            bazi_sup = (
                f"Day Master: {raw.get('day_master','')} | "
                f"Missing: {raw.get('missing_elements',[])} | "
                f"Pattern: {raw.get('pattern','')}"
            )

        system = face_prompt(face_text, gender, bazi_sup, language=state.language)
        user_msg = "Please deliver a complete face reading based on the facial feature data above."

        if _use_mock():
            report = _mock(agent_id, face_text)
        else:
            # Retry up to 3 times with delay to handle LLM empty responses / rate limits
            report = ""
            for attempt in range(3):
                report = await _call(system, user_msg, language=state.language, is_premium=state.is_premium)
                if report.strip():
                    break
                if attempt < 2:
                    print(f"[FACE] empty response on attempt {attempt+1}, retrying in 3s...")
                    await asyncio.sleep(3)

        data = _parse_worker_report(report)
        # Validate and retry once more if quality is low
        if not _use_mock() and not _validate_worker_output(data, agent_id):
            print(f"[RETRY] {agent_id}: low quality output, retrying once...")
            report = await _call(system, user_msg, language=state.language, is_premium=state.is_premium)
            data = _parse_worker_report(report)

        out = WorkerOutput(
            agent_id=agent_id,
            report=_build_compact_report(data),
            tags=data.get("weakness_tags", []),
            strength_tags=data.get("strength_tags", []),
            boost_elements=data.get("boost_elements", []),
            conflict_warnings=data.get("conflict_warnings", []),
            duration_ms=(time.time() - t0) * 1000,
        )
        print(f"[FACE] completed in {out.duration_ms:.0f}ms, report length={len(out.report)}")
        return out
    except Exception as e:
        print(f"[FACE] ERROR: {e}")
        return WorkerOutput(agent_id=agent_id, error=str(e),
                            duration_ms=(time.time() - t0) * 1000)


# ─── PALM WORKER ─────────────────────────────────────────────────────────

async def run_palm(state: SystemState) -> WorkerOutput:
    from agents.prompts import palm_prompt
    t0 = time.time()
    agent_id = "palm"
    try:
        pf = state.palm_features
        if pf is None:
            print(f"[PALM] no palm features, skipping")
            return WorkerOutput(agent_id=agent_id,
                                report="No palm data provided. Palm analysis skipped.",
                                duration_ms=(time.time() - t0) * 1000)

        palm_text = pf.to_prompt_text()
        print(f"[PALM] starting LLM call, features length={len(palm_text)}")
        # Inject raw_metrics as supplementary numerical data
        if pf.raw_metrics:
            metrics_str = "\n".join(f"  {k}: {v}" for k, v in pf.raw_metrics.items())
            palm_text += f"\n\n== 原始测量指标 ==\n{metrics_str}"
        gender = state.birth_info.gender if state.birth_info else "unknown"

        bazi_sup = ""
        if state.bazi_raw:
            raw = state.bazi_raw
            bazi_sup = f"Day Master: {raw.get('day_master','')} | Missing: {raw.get('missing_elements',[])}"

        system = palm_prompt(palm_text, gender, bazi_sup, pf.hand_side, language=state.language)
        user_msg = "Please deliver a complete palm reading based on the hand line data above."

        if _use_mock():
            report = _mock(agent_id, palm_text)
        else:
            # Retry up to 3 times with delay to handle LLM empty responses / rate limits
            report = ""
            for attempt in range(3):
                report = await _call(system, user_msg, language=state.language, is_premium=state.is_premium)
                if report.strip():
                    break
                if attempt < 2:
                    print(f"[PALM] empty response on attempt {attempt+1}, retrying in 3s...")
                    await asyncio.sleep(3)

        data = _parse_worker_report(report)
        # Validate and retry once more if quality is low
        if not _use_mock() and not _validate_worker_output(data, agent_id):
            print(f"[RETRY] {agent_id}: low quality output, retrying once...")
            report = await _call(system, user_msg, language=state.language, is_premium=state.is_premium)
            data = _parse_worker_report(report)

        out = WorkerOutput(
            agent_id=agent_id,
            report=_build_compact_report(data),
            tags=data.get("weakness_tags", []),
            strength_tags=data.get("strength_tags", []),
            boost_elements=data.get("boost_elements", []),
            conflict_warnings=data.get("conflict_warnings", []),
            duration_ms=(time.time() - t0) * 1000,
        )
        print(f"[PALM] completed in {out.duration_ms:.0f}ms, report length={len(out.report)}")
        return out
    except Exception as e:
        print(f"[PALM] ERROR: {e}")
        return WorkerOutput(agent_id=agent_id, error=str(e),
                            duration_ms=(time.time() - t0) * 1000)


# ─── PARTNER FACE WORKER ────────────────────────────────────────────────

async def run_partner_face(state: SystemState) -> WorkerOutput:
    """Analyze partner's face for RELATIONSHIP intent."""
    from agents.prompts import face_prompt
    t0 = time.time()
    agent_id = "partner_face"
    try:
        ff = state.partner_face_features
        if ff is None:
            return WorkerOutput(agent_id=agent_id,
                                report="",
                                duration_ms=(time.time() - t0) * 1000)

        face_text = ff.to_prompt_text()

        # Inject raw_metrics as supplementary numerical data
        if ff.raw_metrics:
            metrics_str = "\n".join(f"  {k}: {v}" for k, v in ff.raw_metrics.items())
            face_text += f"\n\n== 原始测量指标 ==\n{metrics_str}"

        gender = state.partner_birth_info.gender if state.partner_birth_info else "unknown"
        bazi_sup = ""
        if state.partner_bazi_raw:
            raw = state.partner_bazi_raw
            bazi_sup = (
                f"Day Master: {raw.get('day_master','')} | "
                f"Missing: {raw.get('missing_elements',[])} | "
                f"Pattern: {raw.get('pattern','')}"
            )

        system = face_prompt(face_text, gender, bazi_sup, language=state.language)
        user_msg = "Please deliver a complete face reading for the partner based on the facial feature data above."

        if _use_mock():
            report = _mock(agent_id, face_text)
        else:
            report = ""
            for attempt in range(3):
                report = await _call(system, user_msg, language=state.language, is_premium=state.is_premium)
                if report.strip():
                    break
                if attempt < 2:
                    print(f"[PARTNER_FACE] empty response on attempt {attempt+1}, retrying in 3s...")
                    await asyncio.sleep(3)

        data = _parse_worker_report(report)
        if not _use_mock() and not _validate_worker_output(data, "face"):
            print(f"[RETRY] {agent_id}: low quality output, retrying once...")
            report = await _call(system, user_msg, language=state.language, is_premium=state.is_premium)
            data = _parse_worker_report(report)

        return WorkerOutput(
            agent_id=agent_id,
            report=_build_compact_report(data),
            tags=data.get("weakness_tags", []),
            strength_tags=data.get("strength_tags", []),
            boost_elements=data.get("boost_elements", []),
            conflict_warnings=data.get("conflict_warnings", []),
            duration_ms=(time.time() - t0) * 1000,
        )
    except Exception as e:
        return WorkerOutput(agent_id=agent_id, error=str(e),
                            duration_ms=(time.time() - t0) * 1000)


# ─── PARTNER PALM WORKER ────────────────────────────────────────────────

async def run_partner_palm(state: SystemState) -> WorkerOutput:
    """Analyze partner's palm for RELATIONSHIP intent."""
    from agents.prompts import palm_prompt
    t0 = time.time()
    agent_id = "partner_palm"
    try:
        pf = state.partner_palm_features
        if pf is None:
            return WorkerOutput(agent_id=agent_id,
                                report="",
                                duration_ms=(time.time() - t0) * 1000)

        palm_text = pf.to_prompt_text()
        # Inject raw_metrics as supplementary numerical data
        if pf.raw_metrics:
            metrics_str = "\n".join(f"  {k}: {v}" for k, v in pf.raw_metrics.items())
            palm_text += f"\n\n== 原始测量指标 ==\n{metrics_str}"
        gender = state.partner_birth_info.gender if state.partner_birth_info else "unknown"

        bazi_sup = ""
        if state.partner_bazi_raw:
            raw = state.partner_bazi_raw
            bazi_sup = f"Day Master: {raw.get('day_master','')} | Missing: {raw.get('missing_elements',[])}"

        system = palm_prompt(palm_text, gender, bazi_sup, pf.hand_side, language=state.language)
        user_msg = "Please deliver a complete palm reading for the partner based on the hand line data above."

        if _use_mock():
            report = _mock(agent_id, palm_text)
        else:
            report = ""
            for attempt in range(3):
                report = await _call(system, user_msg, language=state.language, is_premium=state.is_premium)
                if report.strip():
                    break
                if attempt < 2:
                    print(f"[PARTNER_PALM] empty response on attempt {attempt+1}, retrying in 3s...")
                    await asyncio.sleep(3)

        data = _parse_worker_report(report)
        if not _use_mock() and not _validate_worker_output(data, "palm"):
            print(f"[RETRY] {agent_id}: low quality output, retrying once...")
            report = await _call(system, user_msg, language=state.language, is_premium=state.is_premium)
            data = _parse_worker_report(report)

        return WorkerOutput(
            agent_id=agent_id,
            report=_build_compact_report(data),
            tags=data.get("weakness_tags", []),
            strength_tags=data.get("strength_tags", []),
            boost_elements=data.get("boost_elements", []),
            conflict_warnings=data.get("conflict_warnings", []),
            duration_ms=(time.time() - t0) * 1000,
        )
    except Exception as e:
        return WorkerOutput(agent_id=agent_id, error=str(e),
                            duration_ms=(time.time() - t0) * 1000)


# ─── PARALLEL DISPATCHER ──────────────────────────────────────────────────

# Merged workers: qimen+ziwei combined into one LLM call
_WORKER_IDS = ["astrology", "tarot", "bazi", "qimen_ziwei", "face", "palm"]
_WORKER_RUNNERS = [run_astrology, run_tarot, run_bazi, run_qimen_ziwei, run_face, run_palm]
_WORKER_TIMEOUTS = [60, 45, 45, 120, 90, 90]  # qimen_ziwei 120s (calculators+LLM); face/palm 90s (LLM inner timeout)
# Which worker IDs are merged (return list of WorkerOutput instead of single)
_MERGED_WORKERS = {"qimen_ziwei"}


async def run_all_workers(state: SystemState) -> dict[str, asyncio.Event]:
    """
    Launch all workers in parallel. Returns completion events for each worker.
    Results are written back into the shared state.
    Merged workers (qimen_ziwei) return lists of WorkerOutput.
    """
    state.phase = "parallel"

    events = {aid: asyncio.Event() for aid in _WORKER_IDS}

    async def _wrap(runner, agent_id: str, timeout: int):
        try:
            result = await asyncio.wait_for(runner(state), timeout=timeout)
        except Exception as e:
            result = WorkerOutput(agent_id=agent_id, error=str(e))
        events[agent_id].set()
        return result

    results = await asyncio.gather(*[
        _wrap(runner, aid, timeout)
        for runner, aid, timeout in zip(_WORKER_RUNNERS, _WORKER_IDS, _WORKER_TIMEOUTS)
    ])

    # Flatten results (merged workers return lists)
    flat_results = []
    for aid, r in zip(_WORKER_IDS, results):
        if isinstance(r, list):
            flat_results.extend(r)
        else:
            flat_results.append(r)

    # Assign results to state by agent_id
    for r in flat_results:
        attr = f"{r.agent_id}_output"
        if hasattr(state, attr):
            setattr(state, attr, r)

    # Merge all tags into computed_tags
    all_tags: list[str] = []
    for r in flat_results:
        all_tags.extend(r.tags)
        if r.error:
            state.errors.append(f"{r.agent_id}: {r.error}")
    state.computed_tags = list(set(all_tags))

    return events