"""api/routers/products.py"""
import copy
import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field

from fastapi import APIRouter, Query, HTTPException, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.product_matcher import ProductMatcher
from services.rate_limiter import check_rate_limit
from database.session import AsyncSessionLocal, get_db
from database.models import User, Product, ProductReview
from auth.dependencies import require_user

router = APIRouter()
_matcher = ProductMatcher()

# ── Per-user review rate limiting (max 3 reviews per hour) ──────────────────
_review_rate_store: dict[str, list[float]] = {}
_REVIEW_RATE_LIMIT = 3
_REVIEW_RATE_WINDOW = 3600  # 1 hour in seconds
_REVIEW_RATE_EVICT_MAX = 10000

PRODUCTS_PATH = Path(__file__).parent.parent.parent / "data" / "products.json"
PRODUCTS_EN_PATH = Path(__file__).parent.parent.parent / "data" / "products_en.json"


# ── Cached product loader (avoids re-reading JSON on every request) ────────
_product_cache: dict[str, tuple[float, list[dict]]] = {}
_PRODUCT_CACHE_TTL = 300  # 5 minutes


def _is_pure_english(text: str) -> bool:
    """Check if a string contains no Chinese characters."""
    for ch in text:
        if "一" <= ch <= "鿿":
            return False
    return True


def _load_products(lang: str = "zh") -> list[dict]:
    import time
    now = time.time()
    cache_key = lang

    # Return cached if fresh
    if cache_key in _product_cache:
        ts, cached = _product_cache[cache_key]
        if now - ts < _PRODUCT_CACHE_TTL:
            return cached

    try:
        products = json.loads(PRODUCTS_PATH.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        products = []

    if lang == "en":
        # Deep copy to avoid mutating cached Chinese data when applying translations
        products = copy.deepcopy(products)
        try:
            en_products = {
                p["id"]: p for p in json.loads(PRODUCTS_EN_PATH.read_text(encoding="utf-8"))
            }
            for p in products:
                en = en_products.get(p["id"])
                if en:
                    for key in ("name", "description", "short_pitch"):
                        val = en.get(f"{key}_en")
                        if val and _is_pure_english(val):
                            p[key] = val
                    for key in ("keyword_tags", "elements", "planets", "chakras", "function_tags", "material"):
                        val = en.get(f"{key}_en")
                        if val is not None:
                            # For list fields, keep only if items are English
                            if isinstance(val, list):
                                if all(_is_pure_english(str(v)) for v in val):
                                    p[key] = val
                            elif isinstance(val, str):
                                if _is_pure_english(val):
                                    p[key] = val
                            else:
                                p[key] = val
                    # Translate detail fields
                    for key in ("usage", "precautions", "efficacy"):
                        val = en.get(f"{key}_en")
                        if val and _is_pure_english(val):
                            p[key] = val
                    spec_en = en.get("specifications_en")
                    if spec_en and isinstance(spec_en, dict):
                        # Keep only if all values are English
                        if all(_is_pure_english(str(v)) for v in spec_en.values()):
                            p["specifications"] = spec_en
        except (FileNotFoundError, json.JSONDecodeError):
            pass

    # Cache the result
    _product_cache[cache_key] = (now, products)
    # Evict old entries
    if len(_product_cache) > 10:
        oldest = min(_product_cache, key=lambda k: _product_cache[k][0])
        del _product_cache[oldest]

    return products


class MatchRequest(BaseModel):
    weakness_tags: list[str] = []
    boost_elements: list[str] = []
    astro_weakness_tags: list[str] = []
    master_summary: str = ""
    top_k: int = 6
    include_explain: bool = False


class ReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    content: str = Field(..., min_length=2, max_length=500)
    tags: list[str] = Field(default_factory=list)


@router.get("")
async def list_products(category: str = Query(None), search: str = Query(None), lang: str = Query("zh"), limit: int = Query(50, le=200)):
    products = _load_products(lang)
    if category:
        products = [p for p in products if p.get("category") == category]
    if search:
        q = search.lower()
        products = [p for p in products if q in p.get("name", "").lower() or q in p.get("description", "").lower()]
    return products[:limit]


@router.get("/{product_id}")
async def get_product(product_id: str, lang: str = Query("zh")):
    products = _load_products(lang)
    for p in products:
        if str(p.get("id")) == product_id:
            return p
    raise HTTPException(status_code=404, detail="商品不存在")


# ── Reviews (DB-backed) ─────────────────────────────────────────────────────

@router.get("/{product_id}/reviews")
async def list_reviews(product_id: str):
    try:
        async with AsyncSessionLocal() as db:
            stmt = (
                select(ProductReview)
                .where(ProductReview.product_id == product_id)
                .order_by(ProductReview.created_at.desc())
                .limit(50)
            )
            result = await db.execute(stmt)
            reviews = result.scalars().all()
            return [
                {
                    "id": str(r.id),
                    "product_id": str(r.product_id),
                    "user_name": r.user_name,
                    "rating": r.rating,
                    "content": r.content,
                    "tags": r.tags or [],
                    "created_at": r.created_at.isoformat() if r.created_at else "",
                }
                for r in reviews
            ]
    except Exception as e:
        # Fallback if table doesn't exist yet
        import logging
        logging.getLogger(__name__).warning(f"Failed to load reviews for {product_id}: {e}")
        return []


@router.post("/{product_id}/reviews")
async def create_review(
    product_id: str,
    payload: ReviewRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    products = _load_products()
    product_exists = any(str(p.get("id")) == product_id for p in products)
    if not product_exists:
        raise HTTPException(status_code=404, detail="商品不存在")

    # ── Rate limit: max 3 reviews per hour per user ──
    user_key = str(user.id)
    now = time.time()
    # Evict stale entries if store grows too large
    if len(_review_rate_store) > _REVIEW_RATE_EVICT_MAX:
        stale = [k for k, v in _review_rate_store.items() if not v or v[-1] <= now - _REVIEW_RATE_WINDOW]
        for k in stale:
            del _review_rate_store[k]
    timestamps = _review_rate_store.get(user_key, [])
    # Prune old timestamps
    timestamps = [t for t in timestamps if now - t < _REVIEW_RATE_WINDOW]
    if len(timestamps) >= _REVIEW_RATE_LIMIT:
        raise HTTPException(status_code=429, detail="评论过于频繁，请稍后再试")
    timestamps.append(now)
    _review_rate_store[user_key] = timestamps

    review = ProductReview(
        product_id=product_id,
        user_id=user.id,
        user_name=user.display_name or user.email.split("@")[0],
        rating=payload.rating,
        content=payload.content,
        tags=payload.tags if payload.tags else None,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return {
        "id": str(review.id),
        "product_id": str(review.product_id),
        "user_name": review.user_name,
        "rating": review.rating,
        "content": review.content,
        "tags": review.tags or [],
        "created_at": review.created_at.isoformat() if review.created_at else "",
    }


# ── Match ───────────────────────────────────────────────────────────────────

@router.post("/match")
async def match_products(payload: MatchRequest, lang: str = Query("zh"), request: Request = None):
    # Rate limit: 10 per minute per IP (CPU-intensive product matching)
    client_ip = request.client.host if request and request.client else "unknown"
    if await check_rate_limit(f"product-match:{client_ip}", limit=10, window=60):
        raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")

    matched = _matcher.match_with_reasons(
        weakness_tags=payload.weakness_tags,
        boost_elements=payload.boost_elements,
        astro_weakness_tags=payload.astro_weakness_tags,
        top_k=payload.top_k,
        lang=lang,
    )

    # Apply language translations to matched results
    if lang == "en":
        translated = {p["id"]: p for p in _load_products("en")}
        for p in matched:
            en = translated.get(p["id"])
            if en:
                # Copy all translated fields from the pre-filtered English product
                for key in ("name", "description", "short_pitch", "material",
                            "keyword_tags", "elements", "planets", "chakras",
                            "function_tags", "usage", "precautions", "efficacy",
                            "specifications"):
                    if key in en and en[key] is not None:
                        p[key] = en[key]

    if payload.include_explain:
        for p in matched:
            explanation = _matcher.explain_why_template(
                product=p,
                weakness_tags=payload.weakness_tags,
                boost_elements=payload.boost_elements,
                lang=lang,
            )
            p["recommendation_text"] = explanation

    return matched[: payload.top_k]