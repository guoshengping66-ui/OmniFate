"""api/routers/users.py — User profile, favorites, orders"""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.session import AsyncSessionLocal
from backend.database.models import User, Order, OrderItem, UserFavorite, Product
from backend.auth.dependencies import require_user

router = APIRouter()

PRODUCTS_PATH = Path(__file__).parent.parent.parent / "data" / "products.json"


def _load_products() -> list[dict]:
    try:
        return json.loads(PRODUCTS_PATH.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return []


# ── Favorites (DB-backed) ──────────────────────────────────────────────────

@router.get("/favorites")
async def list_favorites(user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        stmt = (
            select(UserFavorite)
            .where(UserFavorite.user_id == user.id)
            .order_by(UserFavorite.created_at.desc())
        )
        result = await db.execute(stmt)
        favs = result.scalars().all()
        if not favs:
            return []

        product_ids = [f.product_id for f in favs]

        # Try DB products first, fall back to JSON
        db_stmt = select(Product).where(Product.id.in_(product_ids))
        db_result = await db.execute(db_stmt)
        db_products = {str(p.id): p for p in db_result.scalars().all()}

        if db_products:
            return [_product_to_dict(db_products[str(pid)]) for pid in product_ids if str(pid) in db_products]

        # Fallback: load from JSON
        all_products = _load_products()
        product_map = {p.get("id"): p for p in all_products}
        return [product_map[str(pid)] for pid in product_ids if str(pid) in product_map]


@router.post("/favorites/{product_id}")
async def add_favorite(product_id: str, user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        # Check if already exists
        existing = await db.execute(
            select(UserFavorite).where(
                UserFavorite.user_id == user.id,
                UserFavorite.product_id == product_id,
            )
        )
        if existing.scalar_one_or_none():
            return {"status": "already_exists"}

        fav = UserFavorite(user_id=user.id, product_id=product_id)
        db.add(fav)
        await db.commit()
        return {"status": "added"}


@router.delete("/favorites/{product_id}")
async def remove_favorite(product_id: str, user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        stmt = select(UserFavorite).where(
            UserFavorite.user_id == user.id,
            UserFavorite.product_id == product_id,
        )
        result = await db.execute(stmt)
        fav = result.scalar_one_or_none()
        if fav:
            await db.delete(fav)
            await db.commit()
        return {"status": "removed"}


def _product_to_dict(p: Product) -> dict:
    return {
        "id": str(p.id),
        "name": p.name,
        "description": p.description,
        "short_pitch": p.short_pitch,
        "category": p.category.value if p.category else "other",
        "price_cny": p.price_cny,
        "price_usd": p.price_usd,
        "image_url": p.image_url,
        "keyword_tags": p.keyword_tags or [],
        "wuxing_tags": p.wuxing_tags or [],
        "astro_tags": p.astro_tags or [],
        "material": None,
        "rating": p.rating,
        "sales_count": p.sales_count,
    }


# ── Orders ──────────────────────────────────────────────────────────────────

@router.get("/orders")
async def list_orders(user: User = Depends(require_user)):
    try:
        async with AsyncSessionLocal() as db:
            stmt = (
                select(Order)
                .where(Order.user_id == user.id)
                .order_by(Order.created_at.desc())
                .limit(30)
            )
            result = await db.execute(stmt)
            orders = result.scalars().all()
            items = []
            for o in orders:
                item_stmt = select(OrderItem).where(OrderItem.order_id == o.id)
                item_result = await db.execute(item_stmt)
                order_items = item_result.scalars().all()
                items.append({
                    "id": str(o.id),
                    "order_no": o.order_no,
                    "status": o.status.value if o.status else "pending",
                    "total_cny": o.total_cny,
                    "item_count": len(order_items),
                    "created_at": o.created_at.isoformat() if o.created_at else "",
                    "paid_at": o.paid_at.isoformat() if o.paid_at else None,
                })
            return items
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list orders: {str(exc)}")
