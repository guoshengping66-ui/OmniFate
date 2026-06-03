"""api/routers/products.py"""
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.product_matcher import ProductMatcher
from database.session import AsyncSessionLocal
from database.models import User, Product, ProductReview
from auth.dependencies import require_user

router = APIRouter()
_matcher = ProductMatcher()

PRODUCTS_PATH = Path(__file__).parent.parent.parent / "data" / "products.json"
PRODUCTS_EN_PATH = Path(__file__).parent.parent.parent / "data" / "products_en.json"


# ── Cached product loader (avoids re-reading JSON on every request) ────────
_product_cache: dict[str, tuple[float, list[dict]]] = {}
_PRODUCT_CACHE_TTL = 300  # 5 minutes


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
        try:
            en_products = {
                p["id"]: p for p in json.loads(PRODUCTS_EN_PATH.read_text(encoding="utf-8"))
            }
            for p in products:
                en = en_products.get(p["id"])
                if en:
                    for key in ("name", "description", "short_pitch"):
                        if en.get(f"{key}_en"):
                            p[key] = en[f"{key}_en"]
                    for key in ("keyword_tags", "elements", "planets", "chakras", "function_tags", "material"):
                        if en.get(f"{key}_en") is not None:
                            p[key] = en[f"{key}_en"]
                    # Translate detail fields
                    for key in ("usage", "precautions", "efficacy"):
                        if en.get(f"{key}_en"):
                            p[key] = en[f"{key}_en"]
                    if en.get("specifications_en"):
                        p["specifications"] = en["specifications_en"]
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
):
    products = _load_products()
    product_exists = any(str(p.get("id")) == product_id for p in products)
    if not product_exists:
        raise HTTPException(status_code=404, detail="商品不存在")

    async with AsyncSessionLocal() as db:
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
async def match_products(payload: MatchRequest, lang: str = Query("zh")):
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
                for key in ("name", "description", "short_pitch"):
                    if en.get(key):
                        p[key] = en[key]
                for key in ("keyword_tags", "elements", "planets", "chakras", "function_tags", "material"):
                    if en.get(key) is not None:
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