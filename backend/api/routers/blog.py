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
        "title": "八字命理入门：天干地支与五行",
        "summary": "了解八字命理的基础知识，包括天干地支、五行生克关系，以及如何排出自己的八字命盘。",
        "content": "八字命理是中国传统命理学的核心体系之一...\n\n## 天干地支\n\n天干有十个：甲乙丙丁戊己庚辛壬癸。\n地支有十二个：子丑寅卯辰巳午未申酉戌亥。\n\n## 五行关系\n\n五行相生：木生火、火生土、土生金、金生水、水生木。\n五行相克：木克土、土克水、水克火、火克金、金克木。",
        "category": "命理基础",
        "tags": ["八字", "天干地支", "五行"],
        "read_time": 5,
        "cover_emoji": "☯",
        "created_at": "2025-01-15",
    },
    {
        "id": "astrology-natal",
        "title": "西方星盘解读：上升星座与十大行星",
        "summary": "深入理解星盘中上升星座、太阳、月亮及十大行星的含义，掌握个人星盘的基本解读方法。",
        "content": "星盘（Natal Chart）是出生时刻天空的快照...\n\n## 上升星座\n\n上升星座代表你给世界的第一印象...\n\n## 十大行星\n\n太阳代表核心自我，月亮代表情感内在...",
        "category": "星盘解读",
        "tags": ["星盘", "上升星座", "行星"],
        "read_time": 7,
        "cover_emoji": "✦",
        "created_at": "2025-02-10",
    },
    {
        "id": "tarot-guide",
        "title": "塔罗牌基础：78张牌的智慧",
        "summary": "从大阿尔卡纳到小阿尔卡纳，全面了解塔罗牌的象征意义和占卜方法。",
        "content": "塔罗牌由78张牌组成...\n\n## 大阿尔卡纳\n\n22张大阿尔卡纳代表人生的重大主题...\n\n## 小阿尔卡纳\n\n56张小阿尔卡纳代表日常生活中的具体事务...",
        "category": "塔罗占卜",
        "tags": ["塔罗", "大阿尔卡纳", "占卜"],
        "read_time": 6,
        "cover_emoji": "🃏",
        "created_at": "2025-03-05",
    },
    {
        "id": "fengshui-home",
        "title": "家居风水：如何布置旺运之家",
        "summary": "实用的家居风水指南，从客厅到卧室，教你如何通过环境布局提升运势。",
        "content": "家居风水直接影响居住者的运势...\n\n## 客厅风水\n\n客厅宜明亮宽敞，沙发靠墙摆放...\n\n## 卧室风水\n\n床头宜靠实墙，避免镜子对床...",
        "category": "风水布局",
        "tags": ["风水", "家居", "运势"],
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
