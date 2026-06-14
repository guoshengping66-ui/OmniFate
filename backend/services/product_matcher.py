"""
services/product_matcher.py
根据命盘标签从商品库中匹配改运商品
提供 explain_why() 方法 — 基于用户命盘用 LLM 生成个性化推荐文案
"""
from __future__ import annotations
import json
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class ProductMatcher:
    """
    标签匹配引擎:
      - 将 BaziAgent / AstrologyAgent 输出的弱点标签
        与 products.json 中的 keyword_tags / wuxing_tags 做加权匹配
      - 返回相关度排序后的候选商品列表
      - explain_why() 利用 LLM 为推荐商品生成个性化「处方级」推荐语
    """

    WUXING_EN_ZH = {
        "metal": "金", "wood": "木", "water": "水",
        "fire":  "火", "earth": "土",
    }

    # Reverse mapping for Chinese to English
    WUXING_ZH_EN = {
        "金": "metal", "木": "wood", "水": "water",
        "火": "fire", "土": "earth",
    }

    # Tag translation mapping (Chinese -> English)
    TAG_ZH_EN = {
        "#缺土": "#lack_earth",
        "#缺木": "#lack_wood",
        "#缺水": "#lack_water",
        "#缺火": "#lack_fire",
        "#缺金": "#lack_metal",
        "#财库空空": "#depleted_wealth",
        "#招财": "#wealth_attraction",
        "#财运受损": "#poor_fortune",
        "#事业动荡": "#career_turbulence",
        "#事业瓶颈": "#career_plateau",
        "#事业": "#career",
        "#桃花运": "#romance",
        "#感情": "#love",
        "#婚姻": "#marriage",
        "#行动力": "#initiative",
        "#领导力强": "#strong_leadership",
        "#学业瓶颈": "#academic_plateau",
        "#健康": "#health",
        "#健康警告": "#health_warning",
        "#压力大": "#high_stress",
        "#焦虑": "#anxiety",
        "#睡眠": "#calm_mind",
        "#人际关系": "#relationships",
        "#小人是非": "#gossip",
        "#口舌是非": "#gossip",
        "#官非": "#legal_disputes",
        "#诉讼": "#persistent_litigation",
        "#投资失败": "#investment_loss",
        "#破财": "#investment_loss",
        "#家庭": "#home",
        "#子女运弱": "#weak_children_luck",
        "#搬家": "#moving_in",
        "#旅行": "#travel_safety",
        "#驿马": "#travel_star",
        "#贵人": "#noble_people",
        "#阻碍": "#obstacles",
        "#变革": "#transformation",
        "#转型": "#midlife_transition",
        "#灵性": "#spirituality",
        "#直觉": "#intuition",
        "#能量不足": "#energy_depletion",
        "#能量阻塞": "#energy_blockage",
        "#内耗": "#inner_drain",
        "#体质弱": "#weak_constitution",
        "#气血不足": "#blood_qi_deficiency",
        "#皮肤问题": "#dull_skin",
        "#肝": "#liver_concern",
        "#思维僵化": "#rigid_thinking",
        "#固执": "#rigidity",
        "#决策困难": "#decision_difficulty",
        "#沟通障碍": "#communication_block",
        "#合作问题": "#cooperation_issues",
        "#团队摩擦": "#team_friction",
        "#合同纠纷": "#contract_conflicts",
        "#创意枯竭": "#creative_block",
        "#华盖孤": "#huagai_solitude",
        "#孤独": "#huagai_solitude",
        "#五行缺": "#lack_",
        "#偏财受损": "#investment_loss",
        "#暗桃花": "#troubled_love",
        "#感情复杂": "#complex_relationships",
        "#情绪纠结": "#emotional_knots",
        "#情感连接": "#emotional_connection",
        "#子女性格": "#unique_aesthetic",
        "#学业运弱": "#academic_plateau",
        "#考试": "#certification_exam",
        "#创业": "#startup_phase",
        "#海外发展": "#overseas_growth",
        "#父母健康": "#elder_health",
        "#孝道": "#filial_piety",
        "#家庭责任": "#family_responsibility",
        "#风水": "#feng_shui",
        "#风水失调": "#feng_shui_disorder",
        "#装修": "#feng_shui_disorder",
        "#怀孕": "#preconception",
        "#备孕": "#preconception",
        "#伤官见官": "#clashing_killing",
        "#枭神夺食": "#subconscious_issues",
        "#羊刃": "#weak_body",
        "#驿马星动": "#frequent_changes",
        "#桃花劫": "#troubled_love",
        "#红鸾星动": "#romance",
        "#天喜星动": "#romance",
        "#华盖星": "#focused_creativity",
        "#天乙贵人": "#noble_people",
        "#文昌星": "#academic_plateau",
        "#武曲星": "#career",
        "#贪狼星": "#romance",
        "#紫微星": "#strong_leadership",
        "#天府星": "#depleted_wealth",
        "#太阳": "#strong_leadership",
        "#太阴": "#emotional_connection",
        "#天机": "#intuition",
        "#巨门": "#communication_block",
        "#天相": "#cooperation_issues",
        "#天梁": "#noble_people",
                "#七杀": "#clashing_killing",
        "#破军": "#transformation",
        "#廉贞": "#inner_drain",
        "#武曲": "#career",
        "#贪狼": "#romance",
        "#天府": "#depleted_wealth",
        "#太阴": "#emotional_connection",
        "#天机": "#intuition",
        "#巨门": "#communication_block",
        "#天相": "#cooperation_issues",
        "#天梁": "#noble_people",
        "#七杀": "#clashing_killing",
        "#破军": "#transformation",
        "#廉贞": "#inner_drain",
        "#左辅": "#noble_people",
        "#右弼": "#noble_people",
        "#文曲": "#academic_plateau",
        "#文昌": "#academic_plateau",
        "#天魁": "#noble_people",
        "#天钺": "#noble_people",
        "#禄存": "#depleted_wealth",
        "#擎羊": "#clashing_killing",
                "#陀罗": "#inner_drain",
        "#火星": "#fire",
        "#铃星": "#fire",
        "#地空": "#energy_depletion",
        "#地劫": "#energy_depletion",
        "#天刑": "#legal_disputes",
        "#天姚": "#romance",
        "#天喜": "#romance",
        "#红鸾": "#romance",
        "#龙德": "#noble_people",
        "#凤阁": "#unique_aesthetic",
        "#天德": "#noble_people",
        "#月德": "#noble_people",
        "#福德": "#calm_mind",
        "#禄勋": "#depleted_wealth",
        "#帝旺": "#strong_leadership",
        "#长生": "#startup_phase",
        "#墓库": "#depleted_wealth",
        "#绝地": "#energy_depletion",
        "#胎养": "#preconception",
        "#冠带": "#career",
        "#临官": "#career",
        "#衰病": "#health_warning",
        "#死绝": "#energy_depletion",
    }

    def __init__(self, products_path: Optional[str] = None):
        path = products_path or str(
            Path(__file__).parent.parent / "data" / "products.json"
        )
        try:
            with open(path, encoding="utf-8") as f:
                self._products: list[dict] = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self._products = []
            logger.warning("商品数据文件不存在或格式错误: %s", path)

    def match(
        self,
        weakness_tags: list[str],
        boost_elements: list[str],
        astro_weakness_tags: Optional[list[str]] = None,
        top_k: int = 6,
    ) -> list[dict]:
        astro_tags = astro_weakness_tags or []
        scored: list[tuple[float, dict]] = []

        for product in self._products:
            if not product.get("is_active", True):
                continue
            score = self._score_product(product, weakness_tags, boost_elements, astro_tags)
            if score > 0:
                scored.append((score, product))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored[:top_k]]

    def translate_tags_to_en(self, tags: list[str]) -> list[str]:
        """Translate Chinese tags to English equivalents."""
        translated = []
        for tag in tags:
            if tag in self.TAG_ZH_EN:
                translated.append(self.TAG_ZH_EN[tag])
            else:
                # Try partial match (e.g., "#五行缺土" -> "#lack_earth")
                for zh, en in self.TAG_ZH_EN.items():
                    if zh in tag:
                        translated.append(en)
                        break
                else:
                    translated.append(tag)  # Keep original if no translation
        return translated

    def match_with_reasons(
        self,
        weakness_tags: list[str],
        boost_elements: list[str],
        astro_weakness_tags: Optional[list[str]] = None,
        top_k: int = 4,
        lang: str = "zh",
    ) -> list[dict]:
        """
        Like match(), but each result includes 'match_reasons' explaining
        which weakness/boost/astro tag caused the match.
        Returns list of product dicts with extra 'match_reasons' key.
        """
        astro_tags = astro_weakness_tags or []

        # Translate tags to English if needed for matching
        if lang == "en":
            # Convert Chinese tags to English for matching
            weakness_tags = self.translate_tags_to_en(weakness_tags)
            astro_tags = self.translate_tags_to_en(astro_tags)
        scored: list[tuple[float, dict, list[str]]] = []

        for product in self._products:
            if not product.get("is_active", True):
                continue
            score, reasons = self._score_with_reasons(
                product, weakness_tags, boost_elements, astro_tags, lang=lang,
            )
            if score > 0:
                scored.append((score, product, reasons))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for _, p, reasons in scored[:top_k]:
            p = dict(p)
            p["match_reasons"] = reasons
            p["match_score"] = round(_, 1)
            results.append(p)
        return results

    def _score_with_reasons(
        self,
        product: dict,
        weakness_tags: list[str],
        boost_elements: list[str],
        astro_tags: list[str],
        lang: str = "zh",
    ) -> tuple[float, list[str]]:
        score = 0.0
        reasons: list[str] = []
        p_keywords = set(product.get("keyword_tags") or [])
        p_keywords_en = set(product.get("keyword_tags_en") or [])
        p_wuxing = set(product.get("wuxing_tags") or [])
        p_astro = set(product.get("astro_tags") or [])

        for tag in weakness_tags:
            # Check against both Chinese and English tags
            if tag in p_keywords or tag in p_keywords_en:
                score += 3.0
                if lang == "en":
                    reasons.append(f"Chart tag \"{tag}\" matches product tag")
                else:
                    reasons.append(f"命盘标签「{tag}」匹配商品标签")

        for element in boost_elements:
            # Handle both English and Chinese element names
            if element in self.WUXING_EN_ZH:
                # English input: convert to Chinese
                element_zh = self.WUXING_EN_ZH[element]
                element_en = element
            elif element in self.WUXING_ZH_EN:
                # Chinese input: get English equivalent
                element_zh = element
                element_en = self.WUXING_ZH_EN[element]
            else:
                # Unknown element, try as-is
                element_zh = element
                element_en = element
            if element_en in p_wuxing or element_zh in p_keywords:
                score += 2.0
                if element_zh not in {r.split("」")[0].split("「")[-1] for r in reasons if "「" in r}:
                    if lang == "en":
                        reasons.append(f"Element balance opportunity: \"{element_en}\" recommended")
                    else:
                        reasons.append(f"元素平衡建议：「{element_zh}」推荐补充")

        for tag in astro_tags:
            if tag in p_astro or tag in p_keywords or tag in p_keywords_en:
                score += 1.5
                if lang == "en":
                    reasons.append(f"Astrology config \"{tag}\" corresponds")
                else:
                    reasons.append(f"星盘配置「{tag}」对应")

        sales_bonus = min((product.get("sales_count") or 0) / 1000, 0.5)
        rating_bonus = ((product.get("rating") or 3.0) - 3.0) * 0.2
        score += sales_bonus + rating_bonus

        return score, reasons

    def _score_product(
        self,
        product: dict,
        weakness_tags: list[str],
        boost_elements: list[str],
        astro_tags: list[str],
    ) -> float:
        score = 0.0
        p_keywords = set(product.get("keyword_tags") or [])
        p_keywords_en = set(product.get("keyword_tags_en") or [])
        p_wuxing   = set(product.get("wuxing_tags") or [])
        p_astro    = set(product.get("astro_tags") or [])

        for tag in weakness_tags:
            # Check against both Chinese and English tags
            if tag in p_keywords or tag in p_keywords_en:
                score += 3.0

        for element in boost_elements:
            # Handle both English and Chinese element names
            if element in self.WUXING_EN_ZH:
                # English input: convert to Chinese
                element_zh = self.WUXING_EN_ZH[element]
                element_en = element
            elif element in self.WUXING_ZH_EN:
                # Chinese input: get English equivalent
                element_zh = element
                element_en = self.WUXING_ZH_EN[element]
            else:
                # Unknown element, try as-is
                element_zh = element
                element_en = element
            if element_en in p_wuxing or element_zh in p_keywords:
                score += 2.0

        for tag in astro_tags:
            if tag in p_astro or tag in p_keywords or tag in p_keywords_en:
                score += 1.5

        sales_bonus = min((product.get("sales_count") or 0) / 1000, 0.5)
        rating_bonus = ((product.get("rating") or 3.0) - 3.0) * 0.2
        score += sales_bonus + rating_bonus

        return score

    # LLM recommend text generation

    def explain_why(
        self,
        product: dict,
        master_summary: str = "",
        weakness_tags: Optional[list[str]] = None,
        boost_elements: Optional[list[str]] = None,
        lang: str = "zh",
    ) -> str:
        """
        Generate personalized recommendation text for a product based on the user's fate analysis.
        Uses LLM when available, falls back to template text.
        """
        weakness_tags = weakness_tags or []
        boost_elements = boost_elements or []

        def _fallback() -> str:
            p_name = product.get("name_en" if lang == "en" else "name", "")
            p_funcs = product.get("function_tags_en" if lang == "en" else "function_tags", []) or product.get("function_tags", [])
            p_elems = product.get("elements_en" if lang == "en" else "elements", []) or product.get("elements", [])

            if lang == "en":
                boosts = ", ".join(boost_elements) or "energy"
                if weakness_tags:
                    main_weak = weakness_tags[0].lstrip("#")
                    if p_funcs:
                        return (
                            f"Addressing \"{main_weak}\" in your chart, {p_name} carries "
                            f"{', '.join(p_elems)} energy that helps "
                            f"{', '.join(p_funcs[:2])} to balance your five elements."
                        )
                if p_elems:
                    return (
                        f"{p_name} is rich in {', '.join(p_elems)} energy, "
                        f"ideal for supplementing {boosts} to harmonize your aura."
                    )
                return f"{p_name} is precisely matched to your chart and helps improve your current fortune."
            else:
                boosts = "、".join(boost_elements) or "能量"
                if weakness_tags:
                    main_weak = weakness_tags[0].lstrip("#")
                    if p_funcs:
                        return (
                            f"针对您命盘中「{main_weak}」的问题，{p_name}蕴含"
                            f"{'、'.join(p_elems)}性能量，"
                            f"能{'、'.join(p_funcs[:2])}，帮助您平衡五行、改善运势。"
                        )
                if p_elems:
                    return (
                        f"这款{p_name}富含{'、'.join(p_elems)}性能量，"
                        f"适合需要补充{boosts}的您，助您调和气场、提升运势。"
                    )
                return f"这款{p_name}根据您的命盘精准匹配，能有效改善当前运势状态。"

        try:
            return self._llm_explain(product, master_summary, weakness_tags, boost_elements, lang=lang)
        except Exception:
            return _fallback()

    def explain_why_template(
        self,
        product: dict,
        weakness_tags: Optional[list[str]] = None,
        boost_elements: Optional[list[str]] = None,
        lang: str = "zh",
    ) -> str:
        """
        Generate template-based recommendation text WITHOUT LLM.
        Fast fallback for almanac/product-list contexts where speed matters.
        """
        weakness_tags = weakness_tags or []
        boost_elements = boost_elements or []

        if lang == "en":
            # Always prefer _en fields for English output
            p_name = product.get("name_en") or product.get("name", "")
            p_funcs = product.get("function_tags_en") or product.get("function_tags", [])
            p_elems = product.get("elements_en") or product.get("elements", [])
            boosts = ", ".join(boost_elements) or "energy"

            # Translate weakness tag if it's Chinese
            def _translate_weakness_tag(tag: str) -> str:
                tag_clean = tag.lstrip("#")
                # Try to find English translation
                en_tag = self.TAG_ZH_EN.get(f"#{tag_clean}", "")
                if en_tag:
                    return en_tag.lstrip("#")
                # Try partial match
                for zh, en in self.TAG_ZH_EN.items():
                    if tag_clean in zh or zh.lstrip("#") in tag_clean:
                        return en.lstrip("#")
                return tag_clean  # Return as-is if no translation

            if weakness_tags and p_funcs:
                main_weak = _translate_weakness_tag(weakness_tags[0])
                return (
                    f"Addressing the \"{main_weak}\" pattern in your chart, "
                    f"{p_name} carries {', '.join(p_elems)} energy that helps {', '.join(p_funcs[:2])}, "
                    f"restoring elemental balance and improving your fortune."
                )
            if p_elems:
                return (
                    f"Rich in {', '.join(p_elems)} energy, {p_name} is ideal for those needing "
                    f"more {boosts}, helping harmonize your aura and elevate fortune."
                )
            return f"{p_name} is precisely matched to your chart and helps improve your current fortune."

        # Chinese mode
        p_name = product.get("name", "")
        p_funcs = product.get("function_tags", [])
        p_elems = product.get("elements", [])
        boosts = "、".join(self.WUXING_EN_ZH.get(e, e) for e in boost_elements) or "能量"

        if weakness_tags and p_funcs:
            main_weak = weakness_tags[0].lstrip("#")
            return (
                f"针对您命盘中「{main_weak}」的问题，{p_name}蕴含"
                f"{'、'.join(p_elems)}性能量，"
                f"能{'、'.join(p_funcs[:2])}，帮助您平衡五行、改善运势。"
            )
        if p_elems:
            return (
                f"这款{p_name}富含{'、'.join(p_elems)}性能量，"
                f"适合需要补充{boosts}的您，助您调和气场、提升运势。"
            )
        return f"这款{p_name}根据您的命盘精准匹配，能有效改善当前运势状态。"

    def _llm_explain(
        self,
        product: dict,
        master_summary: str,
        weakness_tags: list[str],
        boost_elements: list[str],
        lang: str = "zh",
    ) -> str:
        """Internal: generate recommendation via OpenAI-compatible LLM."""
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import SystemMessage, HumanMessage
        from config import get_settings

        settings = get_settings()
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("no LLM key")

        kwargs = dict(
            model=settings.OPENAI_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.7,
            max_tokens=256,
        )
        if settings.OPENAI_BASE_URL:
            kwargs["base_url"] = settings.OPENAI_BASE_URL
        llm = ChatOpenAI(**kwargs)

        p_name = product.get("name_en" if lang == "en" else "name", "")
        p_desc = product.get("description_en" if lang == "en" else "description", "") or product.get("description", "")
        p_funcs = "、".join(product.get("function_tags", []) or []) if lang == "zh" else ", ".join(product.get("function_tags_en" if lang == "en" else "function_tags", []) or product.get("function_tags", []) or [])
        p_elems = "、".join(product.get("elements", []) or []) if lang == "zh" else ", ".join(product.get("elements_en" if lang == "en" else "elements", []) or product.get("elements", []) or [])
        p_chakras = "、".join(product.get("chakras", []) or [])

        if lang == "en":
            weak_str = ", ".join(weakness_tags) if weakness_tags else "no notable weaknesses"
            boost_str = ", ".join(boost_elements) if boost_elements else "general balance"
            summary_excerpt = master_summary[:300] if master_summary else "(no detailed chart data)"

            system = SystemMessage(content=(
                "You are a senior fortune advisor at Destiny Mirror. Write a personalized "
                "'prescription-level' product recommendation.\n"
                "Rules:\n"
                "1. Explain why this product is especially effective for the user based on their chart\n"
                "2. Tone: authoritative, warm, precise — like a doctor writing a prescription\n"
                "3. Start with phrases like \"Given your chart's...\" or \"Addressing your...\"\n"
                "4. 40-80 words in English, no emoji\n"
                "5. Do not fabricate information not in the user's chart"
            ))

            user = HumanMessage(content=(
                f"【Product Info】\n"
                f"Name: {p_name}\n"
                f"Description: {p_desc}\n"
                f"Five-element: {p_elems}\n"
                f"Function tags: {p_funcs}\n"
                f"Chakras: {p_chakras}\n\n"
                f"【User Chart Info】\n"
                f"Weakness tags: {weak_str}\n"
                f"Elements to boost: {boost_str}\n"
                f"Chart summary: {summary_excerpt}\n\n"
                f"Generate a personalized recommendation for this product."
            ))
        else:
            weak_str = "、".join(weakness_tags) if weakness_tags else "无明显突出弱点"
            boost_str = "、".join(
                self.WUXING_EN_ZH.get(e, e) for e in boost_elements
            ) if boost_elements else "综合平衡"
            summary_excerpt = master_summary[:300] if master_summary else "（无详细命盘数据）"

            system = SystemMessage(content=(
                "你是Profile Mirror平台的资深命理推荐师。你的任务是为改运商品撰写个性化的「处方级」推荐语。\n"
                "规则：\n"
                "1. 必须结合用户的命盘信息（如下）来解释为什么这个商品对他特别有效\n"
                "2. 语言风格：权威、温暖、精准，像中医开药方一样有说服力\n"
                "3. 使用「由于你的命局中…」或「针对你…」等个性化开头\n"
                "4. 60-120 字，中文，不要用 emoji\n"
                "5. 不要编造用户命盘中没有提到的信息"
            ))

            user = HumanMessage(content=(
                f"【商品信息】\n"
                f"名称：{p_name}\n"
                f"描述：{p_desc}\n"
                f"五行属性：{p_elems}\n"
                f"功能标签：{p_funcs}\n"
                f"对应脉轮：{p_chakras}\n\n"
                f"【用户命盘信息】\n"
                f"弱点标签：{weak_str}\n"
                f"需补五行：{boost_str}\n"
                f"命盘总览摘要：{summary_excerpt}\n\n"
                f"请为这款商品生成一段个性化的推荐语。"
            ))

        resp = llm.invoke([system, user])
        text = resp.content.strip().strip('"').strip("'")
        return text[:200] if len(text) > 200 else text
