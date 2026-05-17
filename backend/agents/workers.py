"""
agents/workers.py
5 vertical expert agents, each strictly isolated to its domain.
All five run in PARALLEL via asyncio.gather().
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


def _get_json_instruction(language: str = "zh") -> str:
    """Return the appropriate JSON output instruction based on language."""
    return _JSON_OUTPUT_INSTRUCTION_EN if language == "en" else _JSON_OUTPUT_INSTRUCTION


def _llm(temperature: float = 0.35, model: str | None = None):
    from langchain_openai import ChatOpenAI
    kwargs = dict(
        model=model or settings.OPENAI_MODEL,
        api_key=settings.OPENAI_API_KEY,
        temperature=temperature,
        max_tokens=settings.WORKER_MAX_TOKENS,
    )
    if settings.OPENAI_BASE_URL:
        kwargs["base_url"] = settings.OPENAI_BASE_URL
    return ChatOpenAI(**kwargs)


async def _call(system: str, user: str, append_json_format: bool = True, model: str | None = None, language: str = "zh") -> str:
    """Single async LLM call. append_json_format adds JSON output instruction."""
    from langchain_core.messages import SystemMessage, HumanMessage
    llm = _llm(model=model)

    # Add explicit language instruction to prevent mixing
    if language == "en":
        lang_instruction = (
            "\n\n== LANGUAGE REQUIREMENT ==\n"
            "CRITICAL: Output the ENTIRE analysis in English. "
            "ALL text values, descriptions, and explanations MUST be in English. "
            "Do NOT mix Chinese and English. Keep technical terms (like element names) in English only."
        )
    else:
        lang_instruction = (
            "\n\n== 语言要求 ==\n"
            "重要：整个分析必须使用纯中文输出。"
            "所有文字值、描述和解释都必须使用中文。"
            "不要中英文混杂。五行元素名称请使用中文（如：火、水、木、金、土）。"
        )

    sys_content = system + lang_instruction + (_get_json_instruction(language) if append_json_format else "")
    msgs = [SystemMessage(content=sys_content), HumanMessage(content=user)]
    resp = await llm.ainvoke(msgs)
    return resp.content


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

    # 2. Try parsing entire text as JSON
    try:
        return _fill(json.loads(text))
    except (json.JSONDecodeError, TypeError):
        pass

    # 3. Fallback: strip any JSON blocks from free text, use as summary
    clean = re.sub(r"```json\s*\{.*?\}\s*```", "", text, flags=re.DOTALL)
    clean = re.sub(r"```\w*\s*", "", clean).strip()
    return {
        **_DEFAULTS,
        "summary": clean[:500] if clean else text[:500],
    }


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

        report = _mock(agent_id, chart_summary) if _use_mock() else await _call(system, user_msg, language=state.language)
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

        report = _mock(agent_id, str(cards)) if _use_mock() else await _call(system, user_msg, language=state.language)
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

        report = _mock(agent_id, str(pillars)) if _use_mock() else await _call(system, user_msg, language=state.language)
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

        report = _mock(agent_id, str(raw)) if _use_mock() else await _call(system, user_msg, language=state.language)
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
        report = _mock(agent_id, str(raw)) if _use_mock() else await _call(system, user_msg, model=ziwei_model, language=state.language)
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


# ─── FACE WORKER ─────────────────────────────────────────────────────────

async def run_face(state: SystemState) -> WorkerOutput:
    from agents.prompts import face_prompt
    t0 = time.time()
    agent_id = "face"
    try:
        ff = state.face_features
        if ff is None:
            return WorkerOutput(agent_id=agent_id,
                                report="No facial image provided. Face analysis skipped.",
                                duration_ms=(time.time() - t0) * 1000)

        face_text = ff.to_prompt_text()

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
                report = await _call(system, user_msg, language=state.language)
                if report.strip():
                    break
                if attempt < 2:
                    print(f"[FACE] empty response on attempt {attempt+1}, retrying in 3s...")
                    await asyncio.sleep(3)

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


# ─── PALM WORKER ─────────────────────────────────────────────────────────

async def run_palm(state: SystemState) -> WorkerOutput:
    from agents.prompts import palm_prompt
    t0 = time.time()
    agent_id = "palm"
    try:
        pf = state.palm_features
        if pf is None:
            return WorkerOutput(agent_id=agent_id,
                                report="No palm data provided. Palm analysis skipped.",
                                duration_ms=(time.time() - t0) * 1000)

        palm_text = pf.to_prompt_text()
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
                report = await _call(system, user_msg, language=state.language)
                if report.strip():
                    break
                if attempt < 2:
                    print(f"[PALM] empty response on attempt {attempt+1}, retrying in 3s...")
                    await asyncio.sleep(3)

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

_WORKER_IDS = ["astrology", "tarot", "bazi", "qimen", "ziwei", "face", "palm"]
_WORKER_RUNNERS = [run_astrology, run_tarot, run_bazi, run_qimen, run_ziwei, run_face, run_palm]
_WORKER_TIMEOUTS = [120, 120, 120, 120, 120, 30, 30]


async def run_all_workers(state: SystemState) -> dict[str, asyncio.Event]:
    """
    Launch all 7 workers in parallel. Returns completion events for each worker.
    Results are written back into the shared state.
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

    # Assign results to state
    state.astrology_output = results[0]
    state.tarot_output     = results[1]
    state.bazi_output      = results[2]
    state.qimen_output     = results[3]
    state.ziwei_output     = results[4]
    state.face_output      = results[5]
    state.palm_output      = results[6]

    # Merge all tags into computed_tags
    all_tags: list[str] = []
    for r in results:
        all_tags.extend(r.tags)
        if r.error:
            state.errors.append(f"{r.agent_id}: {r.error}")
    state.computed_tags = list(set(all_tags))

    return events