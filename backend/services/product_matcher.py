"""
services/product_matcher.py
根据命盘标签从商品库中匹配改运商品
提供 explain_why() 方法 — 基于用户命盘用 LLM 生成个性化推荐文案
"""
from __future__ import annotations
import json
from pathlib import Path
from typing import Optional


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

    def __init__(self, products_path: Optional[str] = None):
        path = products_path or str(
            Path(__file__).parent.parent / "data" / "products.json"
        )
        try:
            with open(path, encoding="utf-8") as f:
                self._products: list[dict] = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self._products = []
            print(f"[WARN] 商品数据文件不存在或格式错误: {path}")

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

    def match_with_reasons(
        self,
        weakness_tags: list[str],
        boost_elements: list[str],
        astro_weakness_tags: Optional[list[str]] = None,
        top_k: int = 4,
    ) -> list[dict]:
        """
        Like match(), but each result includes 'match_reasons' explaining
        which weakness/boost/astro tag caused the match.
        Returns list of product dicts with extra 'match_reasons' key.
        """
        astro_tags = astro_weakness_tags or []
        scored: list[tuple[float, dict, list[str]]] = []

        for product in self._products:
            if not product.get("is_active", True):
                continue
            score, reasons = self._score_with_reasons(
                product, weakness_tags, boost_elements, astro_tags,
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
    ) -> tuple[float, list[str]]:
        score = 0.0
        reasons: list[str] = []
        p_keywords = set(product.get("keyword_tags") or [])
        p_wuxing = set(product.get("wuxing_tags") or [])
        p_astro = set(product.get("astro_tags") or [])

        for tag in weakness_tags:
            if tag in p_keywords:
                score += 3.0
                reasons.append(f"命盘标签「{tag}」匹配商品标签")

        for element in boost_elements:
            element_zh = self.WUXING_EN_ZH.get(element, element)
            element_en = element if element in self.WUXING_EN_ZH else element
            if element_en in p_wuxing or element_zh in p_keywords:
                score += 2.0
                if element_zh not in {r for r in reasons}:
                    reasons.append(f"五行缺失「{element_zh}」需补充")

        for tag in astro_tags:
            if tag in p_astro or tag in p_keywords:
                score += 1.5
                reasons.append(f"星盘配置「{tag}」对应")

        sales_bonus = min(product.get("sales_count", 0) / 1000, 0.5)
        rating_bonus = (product.get("rating", 3.0) - 3.0) * 0.2
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
        p_wuxing   = set(product.get("wuxing_tags") or [])
        p_astro    = set(product.get("astro_tags") or [])

        for tag in weakness_tags:
            if tag in p_keywords:
                score += 3.0

        for element in boost_elements:
            element_zh = self.WUXING_EN_ZH.get(element, element)
            element_en = element if element in self.WUXING_EN_ZH else element
            if element_en in p_wuxing or element_zh in p_keywords:
                score += 2.0

        for tag in astro_tags:
            if tag in p_astro or tag in p_keywords:
                score += 1.5

        sales_bonus = min(product.get("sales_count", 0) / 1000, 0.5)
        rating_bonus = (product.get("rating", 3.0) - 3.0) * 0.2
        score += sales_bonus + rating_bonus

        return score

    # LLM recommend text generation

    def explain_why(
        self,
        product: dict,
        master_summary: str = "",
        weakness_tags: Optional[list[str]] = None,
        boost_elements: Optional[list[str]] = None,
    ) -> str:
        """
        Generate personalized recommendation text for a product based on the user's fate analysis.
        Uses LLM when available, falls back to template text.
        """
        weakness_tags = weakness_tags or []
        boost_elements = boost_elements or []

        def _fallback() -> str:
            p_name = product.get("name", "")
            p_funcs = product.get("function_tags", [])
            p_elems = product.get("elements", [])
            boosts = "、".join(
                self.WUXING_EN_ZH.get(e, e) for e in boost_elements
            ) or "能量"

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
            return self._llm_explain(product, master_summary, weakness_tags, boost_elements)
        except Exception:
            return _fallback()

    def _llm_explain(
        self,
        product: dict,
        master_summary: str,
        weakness_tags: list[str],
        boost_elements: list[str],
    ) -> str:
        """Internal: generate recommendation via OpenAI-compatible LLM."""
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import SystemMessage, HumanMessage
        from backend.config import get_settings

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

        p_name = product.get("name", "")
        p_desc = product.get("description", "")
        p_funcs = "、".join(product.get("function_tags", []) or [])
        p_elems = "、".join(product.get("elements", []) or [])
        p_chakras = "、".join(product.get("chakras", []) or [])

        weak_str = "、".join(weakness_tags) if weakness_tags else "无明显突出弱点"
        boost_str = "、".join(
            self.WUXING_EN_ZH.get(e, e) for e in boost_elements
        ) if boost_elements else "综合平衡"
        summary_excerpt = master_summary[:300] if master_summary else "（无详细命盘数据）"

        system = SystemMessage(content=(
            "你是命盘智镜平台的资深命理推荐师。你的任务是为改运商品撰写个性化的「处方级」推荐语。\n"
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
