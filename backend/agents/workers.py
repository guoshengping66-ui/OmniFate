"""
agents/workers.py
5 vertical expert agents, each strictly isolated to its domain.
Merged workers (qimen+ziwei, astrology+bazi) reduce LLM calls from 7 to 5.
All run in PARALLEL via asyncio.gather().
"""
from __future__ import annotations
import asyncio
import logging
import time
import json
import re

logger = logging.getLogger(__name__)
from collections import OrderedDict
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
    "\n\n== CRITICAL: OUTPUT FORMAT (结构化元数据版) ==\n"
    "你必须以严格的JSON格式输出分析结果，不要输出任何其他文本。\n"
    "所有文字值必须使用纯中文，不要中英文混杂。\n"
    "使用现代行为心理学和量化黑话，禁止出现任何玄学术语（如官杀、桃花、驿马等）。\n"
    "```json\n"
    '{\n'
    '  "summary": "50字核心结论（用互联网黑话包装，如：能量场、阻尼点、破局点）",\n'
    '  "dimensions": {\n'
    '    "wealth": {\n'
    '      "score": 7.5,\n'
    '      "label": "财富能级",\n'
    '      "conflictBalance": {\n'
    '        "left": { "tag": "倾向A描述", "weight": 45 },\n'
    '        "right": { "tag": "倾向B描述", "weight": 55 },\n'
    '        "conflictPoint": "核心冲突对撞点描述"\n'
    '      },\n'
    '      "negativeTags": ["负面阻尼点1", "负面阻尼点2"],\n'
    '      "positiveTags": ["破局能量点1", "破局能量点2"],\n'
    '      "actionCommands": [\n'
    '        { "period": "短期（1-3个月）", "command": "具体行动指令" },\n'
    '        { "period": "中期（半年）", "command": "具体行动指令" }\n'
    '      ]\n'
    '    },\n'
    '    "relationship": {\n'
    '      "score": 6.2,\n'
    '      "label": "感情能级",\n'
    '      "energyBars": [\n'
    '        { "label": "责任担当能级", "value": 8.8, "status": "过度代偿", "statusType": "warning" },\n'
    '        { "label": "情绪滋养能级", "value": 3.2, "status": "极度干涸", "statusType": "critical" }\n'
    '      ],\n'
    '      "interactionMirror": {\n'
    '        "behaviorPattern": "隐性行为模式描述",\n'
    '        "painReflection": "痛点折射描述"\n'
    '      },\n'
    '      "resolution": "一句话高优先解决方案"\n'
    '    },\n'
    '    "career": {\n'
    '      "score": 7.0,\n'
    '      "label": "事业能级",\n'
    '      "conflictBalance": {\n'
    '        "left": { "tag": "倾向A描述", "weight": 45 },\n'
    '        "right": { "tag": "倾向B描述", "weight": 55 },\n'
    '        "conflictPoint": "核心冲突对撞点描述"\n'
    '      },\n'
    '      "negativeTags": ["负面阻尼点1", "负面阻尼点2"],\n'
    '      "positiveTags": ["破局能量点1", "破局能量点2"],\n'
    '      "actionCommands": [\n'
    '        { "period": "短期（1-3个月）", "command": "具体行动指令" },\n'
    '        { "period": "中期（半年）", "command": "具体行动指令" }\n'
    '      ]\n'
    '    },\n'
    '    "health": {\n'
    '      "score": 6.8,\n'
    '      "label": "健康能级",\n'
    '      "radarChart": {\n'
    '        "physicalHardware": { "value": 8.5, "label": "体质能扛度" },\n'
    '        "mentalSoftware": { "value": 9.5, "label": "神经紧绷度", "riskLevel": "极高风险" },\n'
    '        "conclusion": "核心结论（身体代偿机制描述）"\n'
    '      }\n'
    '    },\n'
    '    "spiritual": {\n'
    '      "score": 5.5,\n'
    '      "label": "精神能级",\n'
    '      "creativeFilter": {\n'
    '        "mechanism": "创造力审查机制描述"\n'
    '      },\n'
    '      "resetActions": [\n'
    '        "执行动作1描述",\n'
    '        "执行动作2描述"\n'
    '      ]\n'
    '    }\n'
    '  },\n'
    '  "key_findings": ["发现1(含置信度)", "发现2", "发现3"],\n'
    '  "weakness_tags": ["#标签1", "#标签2"],\n'
    '  "strength_tags": ["#标签1", "#标签2"],\n'
    '  "boost_elements": ["火", "水"],\n'
    '  "conflict_warnings": ["矛盾信号1"]\n'
    '}\n'
    "```\n"
    "规则：\n"
    "1. summary必填，50字以内，用互联网黑话包装\n"
    "2. dimensions中每个维度必须包含score（1-10分）和label\n"
    "3. 财富/事业维度：必须包含conflictBalance、negativeTags、positiveTags、actionCommands\n"
    "4. 感情维度：必须包含energyBars、interactionMirror、resolution\n"
    "5. 健康维度：必须包含radarChart\n"
    "6. 精神维度：必须包含creativeFilter、resetActions\n"
    "7. 所有描述禁止使用玄学术语，必须转化为现代行为心理学语言\n"
    "8. boost_elements必须使用中文五行名称（火、水、木、金、土）\n"
)

_JSON_OUTPUT_INSTRUCTION_EN = (
    "\n\n== CRITICAL: OUTPUT FORMAT (Structured Metadata) ==\n"
    "You MUST output the analysis in strict JSON format. Do NOT output any other text.\n"
    "ALL text values MUST be in English. Do NOT mix Chinese and English.\n"
    "Use modern behavioral psychology and tech jargon. NO mystical/metaphysical terms.\n"
    "MANDATORY TERMINOLOGY — use these exact terms:\n"
    "- energy field (not energy场)\n"
    "- resistance balance / dampening (not friction)\n"
    "- breakthrough activator (not breakthrough energy)\n"
    "- energy drain (not friction point)\n"
    "- compensation mirror (not compensation mechanism)\n"
    "- behavior pattern (not hidden behavior)\n"
    "- pain point refraction (not pain reflection)\n"
    "- creativity audit (not creative filter)\n"
    "- decompression action (not action)\n"
    "Scoring anchors: 8-10=Excellent, 6-7.9=Good, 4-5.9=Fair, 1-3.9=Weak\n"
    "Forbid: fortune-telling, destiny, predict, guaranteed results. Frame as behavioral insight only.\n"
    "```json\n"
    '{\n'
    '  "summary": "50-word core finding (use tech jargon like: energy field, resistance balance, breakthrough activator)",\n'
    '  "dimensions": {\n'
    '    "wealth": {\n'
    '      "score": 7.5,\n'
    '      "label": "Wealth Energy Level",\n'
    '      "conflictBalance": {\n'
    '        "left": { "tag": "Tendency A description", "weight": 45 },\n'
    '        "right": { "tag": "Tendency B description", "weight": 55 },\n'
    '        "conflictPoint": "Core collision point description"\n'
    '      },\n'
    '      "negativeTags": ["Energy drain 1", "Energy drain 2"],\n'
    '      "positiveTags": ["Breakthrough activator 1", "Breakthrough activator 2"],\n'
    '      "actionCommands": [\n'
    '        { "period": "Short-term (1-3 months)", "command": "Specific action directive" },\n'
    '        { "period": "Mid-term (6 months)", "command": "Specific action directive" }\n'
    '      ]\n'
    '    },\n'
    '    "relationship": {\n'
    '      "score": 6.2,\n'
    '      "label": "Relationship Energy Level",\n'
    '      "energyBars": [\n'
    '        { "label": "Responsibility Energy", "value": 8.8, "status": "Over-compensating", "statusType": "warning" },\n'
    '        { "label": "Emotional Nourishment", "value": 3.2, "status": "Critically Depleted", "statusType": "critical" }\n'
    '      ],\n'
    '      "interactionMirror": {\n'
    '        "behaviorPattern": "Hidden behavior pattern description",\n'
    '        "painReflection": "Pain point refraction description"\n'
    '      },\n'
    '      "resolution": "One-line high-priority resolution"\n'
    '    },\n'
    '    "career": {\n'
    '      "score": 7.0,\n'
    '      "label": "Career Energy Level",\n'
    '      "conflictBalance": {\n'
    '        "left": { "tag": "Tendency A description", "weight": 45 },\n'
    '        "right": { "tag": "Tendency B description", "weight": 55 },\n'
    '        "conflictPoint": "Core collision point description"\n'
    '      },\n'
    '      "negativeTags": ["Energy drain 1", "Energy drain 2"],\n'
    '      "positiveTags": ["Breakthrough activator 1", "Breakthrough activator 2"],\n'
    '      "actionCommands": [\n'
    '        { "period": "Short-term (1-3 months)", "command": "Specific action directive" },\n'
    '        { "period": "Mid-term (6 months)", "command": "Specific action directive" }\n'
    '      ]\n'
    '    },\n'
    '    "health": {\n'
    '      "score": 6.8,\n'
    '      "label": "Health Energy Level",\n'
    '      "radarChart": {\n'
    '        "physicalHardware": { "value": 8.5, "label": "Physical Resilience" },\n'
    '        "mentalSoftware": { "value": 9.5, "label": "Neural Tension Level", "riskLevel": "High Risk" },\n'
    '        "conclusion": "Core conclusion (body compensation mirror description)"\n'
    '      }\n'
    '    },\n'
    '    "spiritual": {\n'
    '      "score": 5.5,\n'
    '      "label": "Spiritual Energy Level",\n'
    '      "creativeFilter": {\n'
    '        "mechanism": "Creativity audit mechanism description"\n'
    '      },\n'
    '      "resetActions": [\n'
    '        "Decompression action 1 description",\n'
    '        "Decompression action 2 description"\n'
    '      ]\n'
    '    }\n'
    '  },\n'
    '  "key_findings": ["Finding 1 (with confidence level)", "Finding 2", "Finding 3"],\n'
    '  "weakness_tags": ["#tag1", "#tag2"],\n'
    '  "strength_tags": ["#tag1", "#tag2"],\n'
    '  "boost_elements": ["fire", "water"],\n'
    '  "conflict_warnings": ["Contradiction signal 1"]\n'
    '}\n'
    "```\n"
    "Rules:\n"
    "1. summary required, max 50 words, use tech jargon framing\n"
    "2. Each dimension must include score (1-10) and label\n"
    "3. Wealth/Career: must include conflictBalance, negativeTags, positiveTags, actionCommands\n"
    "4. Relationship: must include energyBars, interactionMirror, resolution\n"
    "5. Health: must include radarChart\n"
    "6. Spiritual: must include creativeFilter, resetActions\n"
    "7. ALL descriptions must use modern behavioral psychology language — NO mystical terms\n"
    "8. ALL text values in the JSON MUST be in English. Do NOT mix languages.\n"
)


def _get_json_instruction(language: str = "zh", is_premium: bool = False) -> str:
    """Return the appropriate JSON output instruction based on language and premium status."""
    if is_premium:
        return _JSON_OUTPUT_INSTRUCTION_EN if language == "en" else _JSON_OUTPUT_INSTRUCTION
    # Free users: compact format (summary + 3 core dimensions + tags)
    return _JSON_OUTPUT_INSTRUCTION_COMPACT_EN if language == "en" else _JSON_OUTPUT_INSTRUCTION_COMPACT


# Compact JSON format for free users: 结构化元数据精简版
_JSON_OUTPUT_INSTRUCTION_COMPACT = (
    "\n\n== CRITICAL: OUTPUT FORMAT (结构化精简版) ==\n"
    "你必须以严格的JSON格式输出分析结果，不要输出任何其他文本。\n"
    "所有文字值必须使用纯中文，不要中英文混杂。\n"
    "使用现代行为心理学和量化黑话，禁止出现任何玄学术语。\n"
    "```json\n"
    '{\n'
    '  "summary": "50字核心结论（互联网黑话包装）",\n'
    '  "dimensions": {\n'
    '    "wealth": {\n'
    '      "score": 7.5,\n'
    '      "label": "财富能级",\n'
    '      "conflictBalance": {\n'
    '        "left": { "tag": "倾向A", "weight": 45 },\n'
    '        "right": { "tag": "倾向B", "weight": 55 },\n'
    '        "conflictPoint": "核心冲突点"\n'
    '      },\n'
    '      "negativeTags": ["阻尼点1", "阻尼点2"],\n'
    '      "positiveTags": ["破局点1", "破局点2"],\n'
    '      "actionCommands": [\n'
    '        { "period": "短期", "command": "行动指令" },\n'
    '        { "period": "中期", "command": "行动指令" }\n'
    '      ]\n'
    '    },\n'
    '    "relationship": {\n'
    '      "score": 6.2,\n'
    '      "label": "感情能级",\n'
    '      "energyBars": [\n'
    '        { "label": "责任担当", "value": 8.8, "status": "过度代偿", "statusType": "warning" },\n'
    '        { "label": "情绪滋养", "value": 3.2, "status": "极度干涸", "statusType": "critical" }\n'
    '      ],\n'
    '      "interactionMirror": {\n'
    '        "behaviorPattern": "行为模式",\n'
    '        "painReflection": "痛点折射"\n'
    '      },\n'
    '      "resolution": "解决方案"\n'
    '    },\n'
    '    "career": {\n'
    '      "score": 7.0,\n'
    '      "label": "事业能级",\n'
    '      "conflictBalance": {\n'
    '        "left": { "tag": "倾向A", "weight": 45 },\n'
    '        "right": { "tag": "倾向B", "weight": 55 },\n'
    '        "conflictPoint": "核心冲突点"\n'
    '      },\n'
    '      "negativeTags": ["阻尼点1", "阻尼点2"],\n'
    '      "positiveTags": ["破局点1", "破局点2"],\n'
    '      "actionCommands": [\n'
    '        { "period": "短期", "command": "行动指令" },\n'
    '        { "period": "中期", "command": "行动指令" }\n'
    '      ]\n'
    '    },\n'
    '    "health": {\n'
    '      "score": 6.8,\n'
    '      "label": "健康能级",\n'
    '      "radarChart": {\n'
    '        "physicalHardware": { "value": 8.5, "label": "体质能扛度" },\n'
    '        "mentalSoftware": { "value": 9.5, "label": "神经紧绷度", "riskLevel": "极高风险" },\n'
    '        "conclusion": "核心结论"\n'
    '      }\n'
    '    },\n'
    '    "spiritual": {\n'
    '      "score": 5.5,\n'
    '      "label": "精神能级",\n'
    '      "creativeFilter": {\n'
    '        "mechanism": "创造力审查机制"\n'
    '      },\n'
    '      "resetActions": ["动作1", "动作2"]\n'
    '    }\n'
    '  },\n'
    '  "key_findings": ["发现1", "发现2", "发现3"],\n'
    '  "weakness_tags": ["#标签1", "#标签2"],\n'
    '  "strength_tags": ["#标签1", "#标签2"],\n'
    '  "boost_elements": ["火", "水"],\n'
    '  "conflict_warnings": ["矛盾信号"]\n'
    '}\n'
    "```\n"
    "规则：summary必填（50字内）；五个维度都要输出，每个维度必须包含score和label；"
    "key_findings 3-5条；禁止玄学术语，使用互联网黑话。\n"
)

_JSON_OUTPUT_INSTRUCTION_COMPACT_EN = (
    "\n\n== CRITICAL: OUTPUT FORMAT (Structured Compact) ==\n"
    "You MUST output the analysis in strict JSON format. Do NOT output any other text.\n"
    "ALL text values MUST be in English. Do NOT mix Chinese and English.\n"
    "Use modern behavioral psychology and tech jargon. NO mystical terms.\n"
    "MANDATORY TERMINOLOGY: energy drain, breakthrough activator, resistance balance, "
    "compensation mirror, behavior pattern, pain point refraction, creativity audit, decompression action.\n"
    "Scoring: 8-10=Excellent, 6-7.9=Good, 4-5.9=Fair, 1-3.9=Weak.\n"
    "```json\n"
    '{\n'
    '  "summary": "50-word core finding (tech jargon framing)",\n'
    '  "dimensions": {\n'
    '    "wealth": {\n'
    '      "score": 7.5,\n'
    '      "label": "Wealth Energy Level",\n'
    '      "conflictBalance": {\n'
    '        "left": { "tag": "Tendency A", "weight": 45 },\n'
    '        "right": { "tag": "Tendency B", "weight": 55 },\n'
    '        "conflictPoint": "Core collision point"\n'
    '      },\n'
    '      "negativeTags": ["Energy drain 1", "Energy drain 2"],\n'
    '      "positiveTags": ["Breakthrough activator 1", "Breakthrough activator 2"],\n'
    '      "actionCommands": [\n'
    '        { "period": "Short-term", "command": "Action directive" },\n'
    '        { "period": "Mid-term", "command": "Action directive" }\n'
    '      ]\n'
    '    },\n'
    '    "relationship": {\n'
    '      "score": 6.2,\n'
    '      "label": "Relationship Energy Level",\n'
    '      "energyBars": [\n'
    '        { "label": "Responsibility Energy", "value": 8.8, "status": "Over-compensating", "statusType": "warning" },\n'
    '        { "label": "Emotional Nourishment", "value": 3.2, "status": "Critically Depleted", "statusType": "critical" }\n'
    '      ],\n'
    '      "interactionMirror": {\n'
    '        "behaviorPattern": "Hidden behavior pattern",\n'
    '        "painReflection": "Pain point refraction"\n'
    '      },\n'
    '      "resolution": "High-priority resolution"\n'
    '    },\n'
    '    "career": {\n'
    '      "score": 7.0,\n'
    '      "label": "Career Energy Level",\n'
    '      "conflictBalance": {\n'
    '        "left": { "tag": "Tendency A", "weight": 45 },\n'
    '        "right": { "tag": "Tendency B", "weight": 55 },\n'
    '        "conflictPoint": "Core collision point"\n'
    '      },\n'
    '      "negativeTags": ["Energy drain 1", "Energy drain 2"],\n'
    '      "positiveTags": ["Breakthrough activator 1", "Breakthrough activator 2"],\n'
    '      "actionCommands": [\n'
    '        { "period": "Short-term", "command": "Action directive" },\n'
    '        { "period": "Mid-term", "command": "Action directive" }\n'
    '      ]\n'
    '    },\n'
    '    "health": {\n'
    '      "score": 6.8,\n'
    '      "label": "Health Energy Level",\n'
    '      "radarChart": {\n'
    '        "physicalHardware": { "value": 8.5, "label": "Physical Resilience" },\n'
    '        "mentalSoftware": { "value": 9.5, "label": "Neural Tension Level", "riskLevel": "High Risk" },\n'
    '        "conclusion": "Core conclusion (compensation mirror)"\n'
    '      }\n'
    '    },\n'
    '    "spiritual": {\n'
    '      "score": 5.5,\n'
    '      "label": "Spiritual Energy Level",\n'
    '      "creativeFilter": {\n'
    '        "mechanism": "Creativity audit mechanism"\n'
    '      },\n'
    '      "resetActions": ["Decompression action 1", "Decompression action 2"]\n'
    '    }\n'
    '  },\n'
    '  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],\n'
    '  "weakness_tags": ["#tag1", "#tag2"],\n'
    '  "strength_tags": ["#tag1", "#tag2"],\n'
    '  "boost_elements": ["fire", "water"],\n'
    '  "conflict_warnings": ["Contradiction signal"]\n'
    '}\n'
    "```\n"
    "Rules: summary required (max 50 words); all 5 dimensions with score and label; "
    "3-5 key_findings; NO mystical terms - use tech jargon; ALL text in English.\n"
)


# ─── LLM Connection Pool (reuse across calls) ────────────────────────────
_llm_cache: OrderedDict[str, ChatOpenAI] = OrderedDict()
_MAX_LLM_CACHE = 10


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
        while len(_llm_cache) > _MAX_LLM_CACHE:
            _llm_cache.popitem(last=False)
    return _llm_cache[cache_key]


# Common Chinese命理 terms → English mapping for post-processing cleanup
_ZH_EN_MAP = {
    # 八字核心术语
    "日主": "Core Profile", "月令": "Seasonal Influence", "用神": "Strength Pattern",
    "忌神": "Growth Area", "喜神": "Support Pattern", "闲神": "Neutral Pattern",
    "正官": "Structured Trait", "七杀": "Challenge Pattern", "正印": "Support Pattern",
    "偏印": "Indirect Support", "食神": "Creative Expression", "伤官": "Independent Thinking",
    "正财": "Steady Earnings", "偏财": "Variable Income", "比肩": "Peer Trait",
    "劫财": "Competitive Trait", "天干": "Upper Cycle", "地支": "Lower Cycle",
    # 命宫系统
    "命宫": "Foundation Profile", "财帛宫": "Financial Pattern", "官禄宫": "Career Trajectory",
    "疾厄宫": "Health Pattern", "迁移宫": "Travel Tendency", "田宅宫": "Property Trend",
    "夫妻宫": "Relationship Pattern", "子女宫": "Family Dynamics", "兄弟宫": "Social Network",
    "父母宫": "Heritage Influence", "交友宫": "Community Circle",
    # 五行
    "金": "Metal", "木": "Wood", "水": "Water", "火": "Fire", "土": "Earth",
    # 身强身弱
    "身旺": "strong core profile", "身弱": "developing core profile",
    "调候": "climate adjustment", "通关": "bridging element",
    # 神煞
    "桃花": "Social Charm", "驿马": "Mobility Pattern", "华盖": "Scholarly Pattern",
    "天乙贵人": "Support Network", "文昌贵人": "Learning Pattern",
    "羊刃": "Intensity Pattern", "空亡": "Not Applicable",
    "天德贵人": "Heavenly Virtue", "月德贵人": "Monthly Virtue",
    "将星": "Leadership Pattern", "红鸾": "Romance Star", "天喜": "Joy Star",
    "孤辰": "Solitude Pattern", "寡宿": "Independence Pattern",
    "劫煞": "Obstacle Pattern", "亡神": "Loss Pattern", "咸池": "Passion Pattern",
    # 运势
    "大运": "Development Phase", "流年": "Annual Trend", "流月": "Monthly Trend",
    "流日": "Daily Trend", "转运": "Phase Transition",
    # 星盘术语
    "上升星座": "Ascendant Sign", "太阳星座": "Sun Sign", "月亮星座": "Moon Sign",
    "金星": "Venus", "火星": "Mars", "木星": "Jupiter", "土星": "Saturn",
    "天王星": "Uranus", "海王星": "Neptune", "冥王星": "Pluto",
    "水星": "Mercury", "北交点": "North Node", "南交点": "South Node",
    "合相": "Conjunction", "对冲": "Opposition", "三分相": "Trine",
    "四分相": "Square", "六分相": "Sextile",
    # 紫微斗数
    "紫微": "Emperor Star", "天府": "Treasury Star", "太阴": "Moon Star",
    "贪狼": "Desire Star", "巨门": "Gateway Star", "天相": "Minister Star",
    "天梁": "Pillar Star", "破军星": "Pioneer Star",
    # 奇门遁甲
    "值符": "Ruling Star", "值使": "Ruling Gate",
    "天心": "Heart Gate", "天英": "Fire Gate",
    # 通用命理
    "命格": "Chart Pattern", "命局": "Chart Structure", "格局": "Pattern Type",
    "刑冲合害": "Interaction Pattern", "三合三会": "Triple Combination",
    "相生": "Supportive", "相克": "Challenging", "相合": "Harmonious",
    "相冲": "Conflicting", "相刑": "Tension", "相害": "Friction",
}


def _clean_english(text: str) -> str:
    """Replace common Chinese命理 terms with English equivalents in English output.

    Strategy: process multi-char terms first (longer matches first to avoid
    partial replacements like "金" inside "庚金"), then strip remaining CJK.
    """
    if not text:
        return text
    # Replace multi-character terms first (longer = higher priority)
    for zh, en in sorted(
        ((k, v) for k, v in _ZH_EN_MAP.items() if len(k) > 1),
        key=lambda x: -len(x[0]),
    ):
        text = text.replace(zh, en)
    # Remove any remaining CJK characters (Chinese/Japanese/Korean)
    # Covers CJK Unified Ideographs, Extension A, Extension B, and Compatibility
    text = re.sub(r'[一-鿿㐀-䶿\U00020000-\U0002a6df豈-﫿]+', '', text)
    # Clean up double spaces left by removal
    text = re.sub(r'  +', ' ', text)
    return text.strip()


_CJK_PATTERN = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")
_LATIN_WORD_PATTERN = re.compile(r"[A-Za-z]{3,}")
_ZH_SAFE_LATIN_TERMS = {"ai", "mbti", "kpi", "okr", "bazi", "bazI", "tarot", "qimen", "ziwei"}


def is_report_language_consistent(text: str, language: str) -> bool:
    """Reject an output when it contains a sentence in the other report locale."""
    if not text.strip():
        return False
    if language == "en":
        return not bool(_CJK_PATTERN.search(text))

    latin_words = [word.lower() for word in _LATIN_WORD_PATTERN.findall(text)]
    disallowed = [word for word in latin_words if word not in _ZH_SAFE_LATIN_TERMS]
    has_latin_sentence = bool(re.search(r"(?:[A-Za-z]{3,}\s+){2,}[A-Za-z]{3,}", text))
    return not has_latin_sentence and len(disallowed) <= 2


def _language_correction_instruction(language: str) -> str:
    if language == "en":
        return "\n\nLANGUAGE CORRECTION: Rewrite every value in English only. Do not include any CJK characters."
    return "\n\n语言校正：请将所有字段值重写为纯中文。不要出现完整英文句子或英文段落。"


async def _call(system: str, user: str, append_json_format: bool = True, model: str | None = None,
                language: str = "zh", is_premium: bool = False, max_tokens: int | None = None) -> str:
    """Single async LLM call. append_json_format adds JSON output instruction."""
    from langchain_core.messages import SystemMessage, HumanMessage
    llm = _llm(model=model, max_tokens=max_tokens)

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
        logger.warning("Worker LLM timed out after 90s")
        raise TimeoutError("Worker LLM timed out after 90s")
    result = resp.content
    # Detect truncation
    resp_meta = getattr(resp, "response_metadata", {}) or {}
    finish_reason = resp_meta.get("finish_reason", "")
    if finish_reason == "length":
        logger.warning("Worker output TRUNCATED (finish_reason=length)")
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
        "summary": clean if clean else text,
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
        logger.warning("[%s] summary too short (%d chars)", agent_id, len(summary))
        return False

    # Check 2: at least 2 dimensions must have content
    filled_dims = sum(1 for v in dims.values() if v and len(str(v)) > 10)
    if filled_dims < 2:
        logger.warning("[%s] only %d dimensions filled", agent_id, filled_dims)
        return False

    # Check 3: at least 2 tags
    if len(tags) < 2:
        logger.warning("[%s] only %d tags", agent_id, len(tags))
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


_SINGLE_ASPECT_INTENTS = {"BAZI", "ASTROLOGY", "TAROT", "FACE_HAND"}


def _worker_output_token_limit(agent_id: str, state: SystemState) -> int | None:
    if state.intent in _SINGLE_ASPECT_INTENTS:
        return settings.SINGLE_ASPECT_WORKER_MAX_TOKENS
    return None


def _worker_content_text(value) -> str:
    if isinstance(value, dict):
        return "\n".join(_worker_content_text(item) for item in value.values())
    if isinstance(value, list):
        return "\n".join(_worker_content_text(item) for item in value)
    return str(value or "")


def _localized_worker_repair(agent_id: str, language: str) -> dict:
    """Safe display fallback when a worker response violates the report locale.

    It intentionally avoids translating or inventing the rejected expert text.
    A regenerated report will replace this fallback with source-specific content.
    """
    subject_zh = {
        "bazi": "八字", "qimen": "奇门遁甲", "ziwei": "紫微斗数",
        "astrology": "星盘", "tarot": "塔罗", "face": "面相", "palm": "手相",
    }.get(agent_id, "单项")
    subject_en = {
        "bazi": "Bazi", "qimen": "Qimen", "ziwei": "Ziwei",
        "astrology": "Astrology", "tarot": "Tarot", "face": "Face Reading", "palm": "Palm Reading",
    }.get(agent_id, "single-aspect")
    if language == "en":
        return {
            "summary": f"This {subject_en} reading keeps the focus on observable patterns and practical choices.",
            "key_findings": [
                "Use one real situation to test the pattern before drawing a conclusion.",
                "Prioritize a small, reversible action over a high-pressure decision.",
            ],
            "dimensions": {"career": {"finding": "Notice which task gives steady progress rather than short-lived urgency."}},
            "boost_elements": ["Review the outcome after one week and adjust from evidence."],
        }
    return {
        "summary": f"这份{subject_zh}解读应聚焦可观察的模式与可执行的选择，而不是给出确定性结论。",
        "key_findings": [
            "先用一个真实场景验证当前模式，再决定是否调整方向。",
            "优先选择成本可控、可以复盘的小行动，避免在压力下做不可逆决定。",
        ],
        "dimensions": {"career": {"finding": "留意哪些任务能带来稳定推进，而不是只带来短暂紧迫感。"}},
        "boost_elements": ["一周后复盘结果，再根据真实反馈调整。"],
    }


async def _call_and_parse(system: str, user_msg: str, agent_id: str, state: SystemState, model: str | None = None) -> dict:
    """
    Call LLM, parse JSON output, validate quality, retry once if low quality.
    Returns parsed data dict.
    """
    max_tokens = _worker_output_token_limit(agent_id, state)
    report = _mock(agent_id, user_msg[:80]) if _use_mock() else await _call(
        system, user_msg, language=state.language, is_premium=state.is_premium, model=model, max_tokens=max_tokens,
    )
    data = _parse_worker_report(report)
    language_ok = is_report_language_consistent(_worker_content_text(data), state.language)

    # Validate quality — retry once if output is poor, with exponential backoff
    if not _use_mock() and (not _validate_worker_output(data, agent_id) or not language_ok):
        reason = "language mismatch" if not language_ok else "validation failed"
        logger.warning("[%s] low quality output (%s), retrying once after backoff...", agent_id, reason)
        await asyncio.sleep(5)  # Longer backoff before retry (was 2s)
        try:
            report = await _call(
                system + _language_correction_instruction(state.language), user_msg,
                language=state.language, is_premium=state.is_premium, model=model, max_tokens=max_tokens,
            )
            retry_data = _parse_worker_report(report)
            retry_language_ok = is_report_language_consistent(_worker_content_text(retry_data), state.language)
            if _validate_worker_output(retry_data, agent_id) and retry_language_ok:
                data = retry_data
            else:
                logger.warning("[%s] retry did not meet content contract, using localized repair", agent_id)
                data = _localized_worker_repair(agent_id, state.language)
        except (Exception, asyncio.CancelledError) as e:
            logger.error("[%s] retry failed with exception: %s, using localized repair", agent_id, e)
            data = _localized_worker_repair(agent_id, state.language)

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


_DIMENSION_DISPLAY_NAMES = {
    "wealth": ("财富与资源", "Wealth and Resources"),
    "relationship": ("关系与互动", "Relationships"),
    "career": ("事业与执行", "Career and Execution"),
    "health": ("身心节律", "Wellbeing"),
    "spiritual": ("心智与成长", "Mindset and Growth"),
}


def _format_worker_detail(value, indent: int = 0) -> list[str]:
    """Convert nested worker JSON into readable lines without discarding evidence."""
    prefix = "  " * indent
    if isinstance(value, str):
        return [prefix + value] if value.strip() else []
    if isinstance(value, (int, float)):
        return [prefix + str(value)]
    if isinstance(value, list):
        lines: list[str] = []
        for item in value:
            rendered = _format_worker_detail(item, indent + 1)
            if rendered:
                lines.append(prefix + "- " + rendered[0].lstrip())
                lines.extend(rendered[1:])
        return lines
    if isinstance(value, dict):
        lines = []
        for key, item in value.items():
            if item in (None, "", [], {}):
                continue
            label = str(key).replace("_", " ")
            if isinstance(item, (str, int, float)):
                lines.append(f"{prefix}{label}: {item}")
            else:
                lines.append(f"{prefix}{label}:")
                lines.extend(_format_worker_detail(item, indent + 1))
        return lines
    return []


def _worker_text_values(value) -> list[str]:
    """Flatten worker values for readers without exposing implementation keys."""
    if value in (None, "", [], {}):
        return []
    if isinstance(value, str):
        return [value.strip()] if value.strip() else []
    if isinstance(value, (int, float)):
        return [str(value)]
    if isinstance(value, list):
        lines: list[str] = []
        for item in value:
            lines.extend(_worker_text_values(item))
        return lines
    if isinstance(value, dict):
        preferred = ["finding", "analysis", "detail", "description", "summary", "insight", "reason"]
        lines: list[str] = []
        for key in preferred:
            if key in value:
                lines.extend(_worker_text_values(value[key]))
        if lines:
            return lines
        for item in value.values():
            lines.extend(_worker_text_values(item))
        return lines
    return []


def _worker_action_values(value) -> list[str]:
    if not isinstance(value, dict):
        return []
    lines: list[str] = []
    for key in ("action", "action_commands", "actionCommands", "recommendation", "next_step"):
        if key in value:
            lines.extend(_worker_text_values(value[key]))
    return lines


def _build_worker_display_report(data: dict, fallback_text: str = "", language: str = "zh") -> str:
    """Create a single-aspect report with reader-facing semantic sections."""
    if not data:
        return fallback_text.strip()
    if not is_report_language_consistent(_worker_content_text(data), language):
        data = _localized_worker_repair("single_aspect", language)

    is_en = language == "en"
    labels = {
        "core": "【Core conclusion】" if is_en else "【核心结论】",
        "evidence": "【Evidence】" if is_en else "【分析依据】",
        "scenarios": "【Observable scenarios】" if is_en else "【可观察场景】",
        "action": "【Action to try】" if is_en else "【行动建议】",
        "limits": "【How to use this】" if is_en else "【使用边界】",
    }
    fallback = (
        "Use this as one perspective for reflection and verify it through real situations."
        if is_en else "把这份内容当作一个观察角度，并用真实经历来验证。"
    )
    core = _worker_text_values(data.get("summary"))[:1]
    evidence = []
    for key in ("key_findings", "strength_tags", "weakness_tags", "conflict_warnings"):
        evidence.extend(_worker_text_values(data.get(key)))

    scenarios: list[str] = []
    actions: list[str] = []
    dimensions = data.get("dimensions", {}) or {}
    for key in ["wealth", "relationship", "career", "health", "spiritual"]:
        detail = dimensions.get(key)
        if detail in (None, "", [], {}):
            continue
        zh_label, en_label = _DIMENSION_DISPLAY_NAMES[key]
        name = en_label if is_en else zh_label
        details = _worker_text_values(detail)
        if details:
            scenarios.append(f"{name}：{details[0]}")
        actions.extend(_worker_action_values(detail))

    actions.extend(_worker_text_values(data.get("boost_elements")))
    if not core:
        core = [_worker_text_values(fallback_text)[:1][0] if _worker_text_values(fallback_text) else fallback]
    if not evidence:
        evidence = [fallback]
    if not scenarios:
        scenarios = [evidence[0]]
    if not actions:
        actions = [fallback]

    parts = [
        labels["core"], *core[:1],
        "", labels["evidence"], *evidence[:3],
        "", labels["scenarios"], *scenarios[:3],
        "", labels["action"], *actions[:3],
        "", labels["limits"], fallback,
    ]
    return "\n".join(line for line in parts if line is not None).strip()


def _build_compact_report(data: dict) -> str:
    """Backward-compatible name; the master layer applies its own bounded evidence excerpts."""
    return _build_worker_display_report(data)


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
    except (Exception, asyncio.CancelledError) as e:
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
    except (Exception, asyncio.CancelledError) as e:
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
    except (Exception, asyncio.CancelledError) as e:
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
    except (Exception, asyncio.CancelledError) as e:
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
    except (Exception, asyncio.CancelledError) as e:
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
    logger.info("QIMEN_ZIWEI started, birth_info=%s, mock=%s", bi is not None, _use_mock())
    if bi is None:
        logger.error("QIMEN_ZIWEI: birth_info is None, skipping")
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
        logger.info("QIMEN_ZIWEI: Using MOCK data (no API key)")
        report_q = _mock("qimen", "merged qimen+ziwei")
        report_z = _mock("ziwei", "merged qimen+ziwei")
    else:
        logger.info("QIMEN_ZIWEI: Calling LLM, model=%s, timeout=180s", settings.OPENAI_MODEL)
        try:
            report = await asyncio.wait_for(llm.ainvoke(msgs), timeout=180)
            logger.info("QIMEN_ZIWEI: LLM response received, length=%d", len(report.content))
        except asyncio.TimeoutError:
            logger.warning("QIMEN_ZIWEI: LLM timed out after 180s")
            report = type('obj', (object,), {'content': '{"error":"timeout"}', 'response_metadata': {}})()
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
            logger.info("qimen (combined): low quality, using raw text as summary")
            qimen_data["summary"] = qimen_text

        # Parse ziwei output
        ziwei_data = _parse_worker_report(ziwei_text)
        if not _use_mock() and not _validate_worker_output(ziwei_data, "ziwei"):
            logger.info("ziwei (combined): low quality, using raw text as summary")
            ziwei_data["summary"] = ziwei_text

        report_q = _build_compact_report(qimen_data)
        report_z = _build_compact_report(ziwei_data)

    t_elapsed = (time.time() - t0) * 1000
    logger.info("QIMEN_ZIWEI done in %.0fms, qimen=%dchars, ziwei=%dchars", t_elapsed, len(report_q), len(report_z))

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
            logger.info("FACE: no face features, skipping")
            return WorkerOutput(agent_id=agent_id,
                                report="No facial image provided. Face analysis skipped.",
                                duration_ms=(time.time() - t0) * 1000)

        face_text = ff.to_prompt_text()
        logger.info("FACE: starting LLM call, features length=%d", len(face_text))

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
                report = await _call(system, user_msg, language=state.language, is_premium=state.is_premium,
                                     max_tokens=_worker_output_token_limit(agent_id, state))
                if report.strip():
                    break
                if attempt < 2:
                    logger.info("FACE: empty response on attempt %d, retrying in 3s...", attempt+1)
                    await asyncio.sleep(2 ** (attempt + 1))  # Exponential backoff: 2s, 4s, 8s

        data = _parse_worker_report(report)
        # Validate and retry once more if quality is low
        if not _use_mock() and (not _validate_worker_output(data, agent_id) or not is_report_language_consistent(_worker_content_text(data), state.language)):
            logger.info("[%s] low quality output, retrying once...", agent_id)
            report = await _call(system + _language_correction_instruction(state.language), user_msg,
                                 language=state.language, is_premium=state.is_premium,
                                 max_tokens=_worker_output_token_limit(agent_id, state))
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
        logger.info("FACE completed in %.0fms, report length=%d", out.duration_ms, len(out.report))
        return out
    except (Exception, asyncio.CancelledError) as e:
        logger.error("FACE error: %s", e)
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
            logger.info("PALM: no palm features, skipping")
            return WorkerOutput(agent_id=agent_id,
                                report="No palm data provided. Palm analysis skipped.",
                                duration_ms=(time.time() - t0) * 1000)

        palm_text = pf.to_prompt_text()
        logger.info("PALM: starting LLM call, features length=%d", len(palm_text))
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
                report = await _call(system, user_msg, language=state.language, is_premium=state.is_premium,
                                     max_tokens=_worker_output_token_limit(agent_id, state))
                if report.strip():
                    break
                if attempt < 2:
                    logger.info("PALM: empty response on attempt %d, retrying in 3s...", attempt+1)
                    await asyncio.sleep(2 ** (attempt + 1))  # Exponential backoff: 2s, 4s, 8s

        data = _parse_worker_report(report)
        # Validate and retry once more if quality is low
        if not _use_mock() and (not _validate_worker_output(data, agent_id) or not is_report_language_consistent(_worker_content_text(data), state.language)):
            logger.info("[%s] low quality output, retrying once...", agent_id)
            report = await _call(system + _language_correction_instruction(state.language), user_msg,
                                 language=state.language, is_premium=state.is_premium,
                                 max_tokens=_worker_output_token_limit(agent_id, state))
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
        logger.info("PALM completed in %.0fms, report length=%d", out.duration_ms, len(out.report))
        return out
    except (Exception, asyncio.CancelledError) as e:
        logger.error("PALM error: %s", e)
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
                    logger.info("PARTNER_FACE: empty response on attempt %d, retrying in 3s...", attempt+1)
                    await asyncio.sleep(2 ** (attempt + 1))  # Exponential backoff: 2s, 4s, 8s

        data = _parse_worker_report(report)
        if not _use_mock() and not _validate_worker_output(data, "face"):
            logger.info("[%s] low quality output, retrying once...", agent_id)
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
    except (Exception, asyncio.CancelledError) as e:
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
                    logger.info("PARTNER_PALM: empty response on attempt %d, retrying in 3s...", attempt+1)
                    await asyncio.sleep(2 ** (attempt + 1))  # Exponential backoff: 2s, 4s, 8s

        data = _parse_worker_report(report)
        if not _use_mock() and not _validate_worker_output(data, "palm"):
            logger.info("[%s] low quality output, retrying once...", agent_id)
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
    except (Exception, asyncio.CancelledError) as e:
        return WorkerOutput(agent_id=agent_id, error=str(e),
                            duration_ms=(time.time() - t0) * 1000)


# ─── PARALLEL DISPATCHER ──────────────────────────────────────────────────

# Merged workers: qimen+ziwei combined into one LLM call
_WORKER_IDS = ["astrology", "tarot", "bazi", "qimen_ziwei", "face", "palm"]
_WORKER_RUNNERS = [run_astrology, run_tarot, run_bazi, run_qimen_ziwei, run_face, run_palm]
from config import get_settings
_settings = get_settings()
_WORKER_TIMEOUTS = [
    _settings.ASTROLOGY_WORKER_TIMEOUT,
    _settings.TAROT_WORKER_TIMEOUT,
    _settings.BAZI_WORKER_TIMEOUT,
    _settings.QIMEN_ZIWEI_WORKER_TIMEOUT,
    _settings.FACE_WORKER_TIMEOUT,
    _settings.PALM_WORKER_TIMEOUT,
]
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
        except (Exception, asyncio.CancelledError) as e:
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
