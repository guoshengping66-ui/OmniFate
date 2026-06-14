"""GET /api/blog  GET /api/blog/{id} — 知识库文章"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()


class BlogArticle(BaseModel):
    id: str
    title: str
    summary: str
    content: str
    category: str
    tags: list[str]
    read_time: int
    cover_emoji: str
    created_at: str


# Mock blog articles
_ARTICLES: list[dict] = [
    {
        "id": "bazi-intro",
        "title": "四柱行为档案入门：天干地支与元素模型",
        "summary": "了解四柱行为档案的基础知识，包括天干地支、元素生克关系，以及如何排出自己的行为档案。",
        "content": "四柱行为档案是中国传统元素分析体系的核心之一...\n\n## 天干地支\n\n天干有十个：甲乙丙丁戊己庚辛壬癸。\n地支有十二个：子丑寅卯辰巳午未申酉戌亥。\n\n## 元素关系\n\n元素相生：木生火、火生土、土生金、金生水、水生木。\n元素相克：木克土、土克水、水克火、火克金、金克木。",
        "category": "元素分析基础",
        "tags": ["四柱", "天干地支", "元素"],
        "read_time": 5,
        "cover_emoji": "☯",
        "created_at": "2025-01-15",
    },
    {
        "id": "astrology-natal",
        "title": "行为图表解读：上升标记与十大行星",
        "summary": "深入理解行为图表中上升标记、太阳、月亮及十大行星的含义，掌握个人图表的基本解读方法。",
        "content": "行为图表是出生时刻天空的快照...\n\n## 上升标记\n\n上升标记代表你给世界的第一印象...\n\n## 十大行星\n\n太阳代表核心自我，月亮代表情感内在...",
        "category": "图表解读",
        "tags": ["行为图表", "上升标记", "行星"],
        "read_time": 7,
        "cover_emoji": "✦",
        "created_at": "2025-02-10",
    },
    {
        "id": "tarot-guide",
        "title": "符号提问卡基础：78张牌的象征意义",
        "summary": "从大阿尔卡纳到小阿尔卡纳，全面了解符号提问卡的象征意义和使用方法。",
        "content": "符号提问卡由78张牌组成...\n\n## 大阿尔卡纳\n\n22张大阿尔卡纳代表人生的重大主题...\n\n## 小阿尔卡纳\n\n56张小阿尔卡纳代表日常生活中的具体事务...",
        "category": "符号分析",
        "tags": ["符号提问卡", "大阿尔卡纳", "象征分析"],
        "read_time": 6,
        "cover_emoji": "🃏",
        "created_at": "2025-03-05",
    },
    {
        "id": "fengshui-home",
        "title": "环境布局优化：如何打造高效能居家空间",
        "summary": "实用的环境布局指南，从客厅到卧室，教你如何通过空间布局提升生活效率。",
        "content": "环境布局直接影响居住者的生活效率...\n\n## 客厅布局\n\n客厅宜明亮宽敞，沙发靠墙摆放...\n\n## 卧室布局\n\n床头宜靠实墙，避免镜子对床...",
        "category": "环境优化",
        "tags": ["环境布局", "家居", "生活效率"],
        "read_time": 8,
        "cover_emoji": "🏠",
        "created_at": "2025-04-01",
    },
]


@router.get("", response_model=list[BlogArticle])
async def list_articles(category: Optional[str] = Query(None)):
    articles = _ARTICLES
    if category:
        articles = [a for a in articles if a["category"] == category]
    return articles


@router.get("/{article_id}", response_model=BlogArticle)
async def get_article(article_id: str):
    for a in _ARTICLES:
        if a["id"] == article_id:
            return a
    raise HTTPException(status_code=404, detail="文章不存在")
