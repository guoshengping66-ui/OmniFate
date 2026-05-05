"""
agents/replay_prompt.py — Event Replay (事件复盘) Agent prompt

Analyzes life events against the user's birth chart + transit data,
producing a structured 3-part causal analysis.
"""
from __future__ import annotations


def replay_agent_prompt(
    master_summary: str,
    computed_tags: list[str],
    dimension_scores: dict[str, float],
    bazi_weakness_tags: list[str],
    bazi_strength_tags: list[str],
    astro_weakness_tags: list[str],
    event_description: str,
    event_datetime_str: str,
    transit_bazi: dict | None,
    transit_astrology: dict | None,
) -> str:
    """
    Build the system prompt for the Event Replay agent.

    Args:
        master_summary: 命盘总览摘要（来自 master agent）
        computed_tags: 命盘计算标签
        dimension_scores: 五维度评分
        bazi_weakness_tags / bazi_strength_tags: 八字弱点/优势标签
        astro_weakness_tags: 星盘弱点标签
        event_description: 用户描述的事件
        event_datetime_str: 事件发生时间（字符串）
        transit_bazi: 事件时刻的流年/月/日柱数据
        transit_astrology: 事件时刻的星盘流时数据

    Returns:
        完整的 System Prompt 字符串
    """
    # ── 命盘摘要 ──
    chart_summary = (
        f"【用户命盘摘要】\n"
        f"{master_summary[:600] if master_summary else '（无详盘数据）'}\n"
    )

    tags_str = "、".join(computed_tags) if computed_tags else "无标签"
    scores_str = " | ".join(
        f"{k}:{v}" for k, v in (dimension_scores or {}).items()
    )
    bazi_weak = "、".join(bazi_weakness_tags) if bazi_weakness_tags else "无"
    bazi_strong = "、".join(bazi_strength_tags) if bazi_strength_tags else "无"
    astro_weak = "、".join(astro_weakness_tags) if astro_weakness_tags else "无"

    tags_section = (
        f"【命盘标签】\n"
        f"  核心标签: {tags_str}\n"
        f"  五维度评分: {scores_str}\n"
        f"  八字弱点: {bazi_weak}\n"
        f"  八字优势: {bazi_strong}\n"
        f"  星盘弱点: {astro_weak}\n"
    )

    # ── 事件描述 ──
    event_section = (
        f"【事件信息】\n"
        f"  描述: {event_description}\n"
        f"  发生时间: {event_datetime_str}\n"
    )

    # ── 流时数据 ──
    transit_section = "【事件时刻流时数据】\n"
    if transit_bazi:
        yp = transit_bazi.get("year_pillar", {})
        mp = transit_bazi.get("month_pillar", {})
        dp = transit_bazi.get("day_pillar", {})
        transit_section += (
            f"  流年柱: {yp.get('ganzhi', '')} ({yp.get('tiangan_wuxing', '')}性)\n"
            f"  流月柱: {mp.get('ganzhi', '')} ({mp.get('tiangan_wuxing', '')}性)\n"
            f"  流日柱: {dp.get('ganzhi', '')} ({dp.get('tiangan_wuxing', '')}性)\n"
        )

    if transit_astrology:
        tp = transit_astrology.get("transit_planets", {})
        if tp:
            transit_section += "  流年星盘外行星位置:\n"
            for pname, pdata in tp.items():
                retro = "逆" if pdata.get("retrograde") else "顺"
                transit_section += (
                    f"    {pname}: {pdata.get('sign', '')} "
                    f"{pdata.get('degree', '')}° ({retro})\n"
                )
        aspects = transit_astrology.get("transit_natal_aspects", [])
        if aspects:
            transit_section += "  流年与本命盘相位:\n"
            for asp in aspects[:8]:
                transit_section += (
                    f"    {asp['transit_planet']} {asp['aspect']} "
                    f"{asp['natal_planet']} (容许度{asp['orb']}°)\n"
                )

    # ── 完整的 System Prompt ──
    return (
        "你是一位精通八字命理与西方占星学的命运因果分析师，擅长从命理角度"
        "对人生事件进行深度复盘与因果溯源。\n"
        "你的风格：理性、透彻、有洞察力而不宿命论。"
        "全中文输出。\n\n"
        f"{chart_summary}\n"
        f"{tags_section}\n"
        f"{event_section}\n"
        f"{transit_section}\n\n"
        "请基于以上信息，对用户描述的事件进行三段式复盘分析：\n\n"
        "【因果溯源】\n"
        "  分析为什么这个事件在今时今日发生在用户身上，从以下维度交叉论证：\n"
        "  - 流年/月/日柱与命局八字十神的生克关系：事件时刻的干支是否冲克了命局中的用神"
        "或触动了忌神？\n"
        "  - 流年星盘外行星与本命行星的相位：事件时刻是否有外行星触发本命盘中的敏感点？\n"
        "  - 命局自身结构是否「埋下了伏笔」：用户的命盘是否有结构性的倾向（如七杀无制易招小人、"
        "财星破印易破财）？\n"
        "  结论应该清楚明确：这件事的命理根源是什么。\n\n"
        "【当下对策】\n"
        "  基于当前的流时状态（不是事件发生时刻，而是现在），给出知行合一的行动建议：\n"
        "  - 能量层面：当前天象/流月/流日格局下，用什么五行、什么行为可以转化局势\n"
        "  - 心理层面：结合命盘的心理倾向（如印旺者易纠结，杀旺者易冲动），给出心态调整建议\n"
        "  - 具体可执行：每条对策应是具体的行动（佩戴某五行饰品 / 在某时间做某事等）\n\n"
        "【未来预防】\n"
        "  - 如果事件是负面的：如何避免类似的命理格局再次触发？\n"
        "  - 如果事件是正面的：如何延续这种好运，让相似的能量模式再次出现？\n"
        "  - 需要关注的未来时间窗口：下次类似的流年/流月配置何时出现？\n\n"
        "要求：\n"
        "  - 每条分析必须引用具体的命理数据（干支/五行/星座/相位/容许度），不可笼统概括\n"
        "  - 如果数据不足以判断，承认「数据有限」而非编造\n"
        "  - 整体语气：像一位智慧的导师在帮助用户「理解命运的逻辑」而非「预测未来」\n"
        "  - 300-600字，每段以一句断言收尾\n\n"
        "最后，单独输出以下 JSON 标签（用于商品匹配）：\n"
        "```json\n"
        "{\n"
        '  "remedy_keywords": ["补火", "增强决策力", "防小人"],\n'
        '  "boost_elements": ["fire", "wood"]\n'
        "}\n"
        "```\n"
        "remedy_keywords: 3-6个标签，描述需要改善的方向。"
        "基于因果分析和命盘中的弱点生成。\n"
        "boost_elements: 需要补充的五行元素（英文列表）。"
        "基于命盘缺什么、事件暴露了什么不足来定。\n"
        "注意：这两个JSON字段将用于自动匹配改运商品，请确保它们精准反映用户的需求。"
    )
