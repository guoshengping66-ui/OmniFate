"""api/routers/users.py — User profile, favorites, orders, settings"""
from typing import Optional
from datetime import datetime, timezone

import json
from pathlib import Path
from pydantic import BaseModel, Field
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import AsyncSessionLocal
from database.models import User, Order, OrderItem, UserFavorite, UserAddress, Product, OrderStatus, BirthProfile, Gender
from auth.dependencies import require_user
from auth.jwt import verify_password, hash_password

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
                .options(selectinload(Order.items))
                .order_by(Order.created_at.desc())
                .limit(30)
            )
            result = await db.execute(stmt)
            orders = result.scalars().unique().all()
            items = []
            for o in orders:
                items.append({
                    "id": str(o.id),
                    "order_no": o.order_no,
                    "status": o.status.value if o.status else "pending",
                    "total_cny": o.total_cny,
                    "item_count": len(o.items),
                    "created_at": o.created_at.isoformat() if o.created_at else "",
                    "paid_at": o.paid_at.isoformat() if o.paid_at else None,
                })
            return items
    except Exception as exc:
        raise HTTPException(status_code=500, detail="获取订单列表失败，请稍后重试")


# ── Profile Settings ──────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.put("/profile")
async def update_profile(
    req: UpdateProfileRequest,
    user: User = Depends(require_user),
):
    """修改用户昵称"""
    async with AsyncSessionLocal() as db:
        db_user = await db.get(User, user.id)
        if not db_user:
            raise HTTPException(status_code=404, detail="用户不存在")
        if req.display_name is not None:
            db_user.display_name = req.display_name.strip() or None
        await db.commit()
        await db.refresh(db_user)
        return {
            "id": str(db_user.id),
            "email": db_user.email,
            "display_name": db_user.display_name,
        }


@router.put("/password")
async def change_password(
    req: ChangePasswordRequest,
    user: User = Depends(require_user),
):
    """修改密码（需验证旧密码）"""
    async with AsyncSessionLocal() as db:
        db_user = await db.get(User, user.id)
        if not db_user:
            raise HTTPException(status_code=404, detail="用户不存在")
        if not db_user.hashed_password:
            raise HTTPException(status_code=400, detail="该账户使用第三方登录，无法修改密码")
        if not verify_password(req.old_password, db_user.hashed_password):
            raise HTTPException(status_code=400, detail="旧密码不正确")
        from api.routers.auth import _validate_password_strength
        _validate_password_strength(req.new_password)
        db_user.hashed_password = hash_password(req.new_password)
        await db.commit()
        return {"message": "密码修改成功"}


# ── Addresses ──────────────────────────────────────────────────────────────

class AddressRequest(BaseModel):
    recipient_name: str
    phone: str
    country: str = "CN"
    province: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    postal_code: Optional[str] = None
    is_default: bool = False


def _address_to_dict(a: UserAddress) -> dict:
    return {
        "id": str(a.id),
        "recipient_name": a.recipient_name,
        "phone": a.phone,
        "country": a.country,
        "province": a.province,
        "city": a.city,
        "district": a.district,
        "address_line1": a.address_line1,
        "address_line2": a.address_line2,
        "postal_code": a.postal_code,
        "is_default": a.is_default,
        "created_at": a.created_at.isoformat() if a.created_at else "",
    }


@router.get("/addresses")
async def list_addresses(user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        stmt = (
            select(UserAddress)
            .where(UserAddress.user_id == user.id)
            .order_by(UserAddress.is_default.desc(), UserAddress.created_at.desc())
        )
        result = await db.execute(stmt)
        return [_address_to_dict(a) for a in result.scalars().all()]


@router.post("/addresses")
async def create_address(req: AddressRequest, user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        if req.is_default:
            await db.execute(
                UserAddress.__table__.update()
                .where(UserAddress.user_id == user.id)
                .values(is_default=False)
            )
        addr = UserAddress(
            user_id=user.id,
            recipient_name=req.recipient_name,
            phone=req.phone,
            country=req.country,
            province=req.province,
            city=req.city,
            district=req.district,
            address_line1=req.address_line1,
            address_line2=req.address_line2,
            postal_code=req.postal_code,
            is_default=req.is_default,
        )
        db.add(addr)
        await db.commit()
        await db.refresh(addr)
        return _address_to_dict(addr)


@router.put("/addresses/{address_id}")
async def update_address(address_id: str, req: AddressRequest, user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(UserAddress).where(UserAddress.id == address_id, UserAddress.user_id == user.id)
        )
        addr = result.scalar_one_or_none()
        if not addr:
            raise HTTPException(status_code=404, detail="地址不存在")
        if req.is_default and not addr.is_default:
            await db.execute(
                UserAddress.__table__.update()
                .where(UserAddress.user_id == user.id)
                .values(is_default=False)
            )
        for field in ("recipient_name", "phone", "country", "province", "city", "district",
                       "address_line1", "address_line2", "postal_code", "is_default"):
            setattr(addr, field, getattr(req, field))
        await db.commit()
        await db.refresh(addr)
        return _address_to_dict(addr)


@router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(UserAddress).where(UserAddress.id == address_id, UserAddress.user_id == user.id)
        )
        addr = result.scalar_one_or_none()
        if not addr:
            raise HTTPException(status_code=404, detail="地址不存在")
        await db.delete(addr)
        await db.commit()
        return {"status": "deleted"}


@router.put("/addresses/{address_id}/default")
async def set_default_address(address_id: str, user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(UserAddress).where(UserAddress.id == address_id, UserAddress.user_id == user.id)
        )
        addr = result.scalar_one_or_none()
        if not addr:
            raise HTTPException(status_code=404, detail="地址不存在")
        await db.execute(
            UserAddress.__table__.update()
            .where(UserAddress.user_id == user.id)
            .values(is_default=False)
        )
        addr.is_default = True
        await db.commit()
        return {"status": "ok"}


# ── Order Detail & Actions ─────────────────────────────────────────────────

@router.get("/orders/{order_id}")
async def get_order_detail(order_id: str, user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Order).where(Order.id == order_id, Order.user_id == user.id)
        )
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="订单不存在")

        item_stmt = select(OrderItem).where(OrderItem.order_id == order.id)
        item_result = await db.execute(item_stmt)
        items = [
            {
                "id": str(i.id),
                "product_name": i.product_name,
                "quantity": i.quantity,
                "unit_price_cny": i.unit_price_cny,
                "subtotal_cny": i.subtotal_cny,
                "recommendation_reason": i.recommendation_reason,
            }
            for i in item_result.scalars().all()
        ]

        # Load address info
        address_info = None
        if order.shipping_address:
            addr_data = order.shipping_address
            if isinstance(addr_data, dict):
                address_info = addr_data

        return {
            "id": str(order.id),
            "order_no": order.order_no,
            "status": order.status.value if order.status else "pending",
            "total_cny": order.total_cny,
            "total_usd": order.total_usd,
            "payment_method": order.payment_method,
            "recipient_name": order.recipient_name,
            "recipient_phone": order.recipient_phone,
            "shipping_address": address_info,
            "tracking_number": order.tracking_number,
            "shipping_carrier": order.shipping_carrier,
            "notes": order.notes,
            "items": items,
            "created_at": order.created_at.isoformat() if order.created_at else "",
            "paid_at": order.paid_at.isoformat() if order.paid_at else None,
            "shipped_at": order.shipped_at.isoformat() if order.shipped_at else None,
            # Refund fields
            "refund_reason": order.refund_reason,
            "refund_amount": float(order.refund_amount) if order.refund_amount else None,
            "refund_note": order.refund_note,
            "refund_requested_at": order.refund_requested_at.isoformat() if order.refund_requested_at else None,
            "refund_processed_at": order.refund_processed_at.isoformat() if order.refund_processed_at else None,
        }


@router.post("/orders/{order_id}/cancel")
async def cancel_order(order_id: str, user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Order).where(Order.id == order_id, Order.user_id == user.id)
        )
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="订单不存在")
        if order.status not in (OrderStatus.pending,):
            raise HTTPException(status_code=400, detail="当前订单状态不允许取消")
        order.status = OrderStatus.cancelled
        await db.commit()
        return {"status": "cancelled", "message": "订单已取消"}


@router.post("/orders/{order_id}/confirm-receive")
async def confirm_receive(order_id: str, user: User = Depends(require_user)):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Order).where(Order.id == order_id, Order.user_id == user.id)
        )
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="订单不存在")
        if order.status != OrderStatus.shipped:
            raise HTTPException(status_code=400, detail="只有已发货的订单才能确认收货")
        order.status = OrderStatus.delivered
        await db.commit()
        return {"status": "delivered", "message": "已确认收货"}


class RefundRequest(BaseModel):
    reason: str  # 退款原因（必填）


@router.post("/orders/{order_id}/request-refund")
async def request_refund(
    order_id: str,
    req: RefundRequest,
    user: User = Depends(require_user),
):
    if not req.reason or not req.reason.strip():
        raise HTTPException(status_code=400, detail="请填写退款原因")

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Order).where(Order.id == order_id, Order.user_id == user.id)
        )
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="订单不存在")
        if order.status not in (OrderStatus.paid, OrderStatus.shipped):
            raise HTTPException(status_code=400, detail="当前订单状态不允许申请退款")

        # 退款时间窗口校验：付款后 30 天内
        if order.paid_at:
            from datetime import timedelta
            paid_time = order.paid_at.replace(tzinfo=timezone.utc) if order.paid_at.tzinfo is None else order.paid_at
            if datetime.now(timezone.utc) - paid_time > timedelta(days=30):
                raise HTTPException(status_code=400, detail="已超过30天退款期限，如需帮助请联系客服")

        order.status = OrderStatus.pending_refund
        order.refund_reason = req.reason.strip()
        order.refund_requested_at = datetime.now(timezone.utc)
        await db.commit()

        # 异步通知管理员（不阻塞响应）
        try:
            import asyncio
            from utils.email import send_refund_request_notification
            await asyncio.to_thread(
                send_refund_request_notification,
                order_no=order.order_no,
                total_cny=float(order.total_cny),
                user_email=user.email or "",
                reason=req.reason.strip(),
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"[REFUND] Failed to notify admin: {e}")

        return {"status": "pending_refund", "message": "退款申请已提交，等待管理员审核"}


# ── Birth Profiles (出生档案 CRUD) ─────────────────────────────────────────

class BirthProfileRequest(BaseModel):
    nickname: str = "本命"
    gender: str = "female"
    birth_year: int  # validated below
    birth_month: int
    birth_day: int
    birth_hour: int
    birth_minute: int = 0
    birth_city: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    def model_post_init(self, __context) -> None:
        if not (1900 <= self.birth_year <= 2100):
            raise ValueError("birth_year must be between 1900 and 2100")
        if not (1 <= self.birth_month <= 12):
            raise ValueError("birth_month must be between 1 and 12")
        if not (1 <= self.birth_day <= 31):
            raise ValueError("birth_day must be between 1 and 31")
        if not (0 <= self.birth_hour <= 23):
            raise ValueError("birth_hour must be between 0 and 23")


def _birth_profile_to_dict(bp: BirthProfile) -> dict:
    return {
        "id": str(bp.id),
        "nickname": bp.nickname,
        "gender": bp.gender.value if hasattr(bp.gender, "value") else str(bp.gender),
        "birth_year": bp.birth_year,
        "birth_month": bp.birth_month,
        "birth_day": bp.birth_day,
        "birth_hour": bp.birth_hour,
        "birth_minute": bp.birth_minute,
        "birth_city": bp.birth_city or "",
        "latitude": bp.latitude,
        "longitude": bp.longitude,
        "created_at": bp.created_at.isoformat() if bp.created_at else "",
    }


@router.get("/birth-profiles")
async def list_birth_profiles(user: User = Depends(require_user)):
    """列出当前用户所有出生档案"""
    async with AsyncSessionLocal() as db:
        stmt = (
            select(BirthProfile)
            .where(BirthProfile.user_id == user.id)
            .order_by(BirthProfile.created_at.asc())
        )
        result = await db.execute(stmt)
        profiles = result.scalars().all()
        return [_birth_profile_to_dict(p) for p in profiles]


@router.get("/birth-profiles/active")
async def get_active_birth_profile(user: User = Depends(require_user)):
    """获取当前激活的出生档案（默认'本命'）"""
    async with AsyncSessionLocal() as db:
        stmt = (
            select(BirthProfile)
            .where(BirthProfile.user_id == user.id, BirthProfile.nickname == "本命")
            .limit(1)
        )
        result = await db.execute(stmt)
        bp = result.scalar_one_or_none()
        if not bp:
            # Fallback: return the first profile
            stmt2 = (
                select(BirthProfile)
                .where(BirthProfile.user_id == user.id)
                .order_by(BirthProfile.created_at.asc())
                .limit(1)
            )
            result2 = await db.execute(stmt2)
            bp = result2.scalar_one_or_none()
        if not bp:
            raise HTTPException(status_code=404, detail="尚未设置出生档案，请先完善个人信息")
        return _birth_profile_to_dict(bp)


@router.post("/birth-profiles")
async def create_birth_profile(
    req: BirthProfileRequest,
    user: User = Depends(require_user),
):
    """创建新出生档案"""
    async with AsyncSessionLocal() as db:
        # Limit: max 10 profiles per user
        from sqlalchemy import func
        count_stmt = select(func.count()).select_from(BirthProfile).where(BirthProfile.user_id == user.id)
        count_result = await db.execute(count_stmt)
        existing = count_result.scalar() or 0
        if existing >= 10:
            raise HTTPException(status_code=400, detail="最多保存 10 个出生档案")

        gender_val = req.gender if req.gender in ("male", "female", "other") else "other"
        bp = BirthProfile(
            user_id=user.id,
            nickname=req.nickname or "本命",
            gender=Gender(gender_val),
            birth_year=req.birth_year,
            birth_month=req.birth_month,
            birth_day=req.birth_day,
            birth_hour=req.birth_hour,
            birth_minute=req.birth_minute,
            birth_city=req.birth_city or "",
            latitude=req.latitude,
            longitude=req.longitude,
        )
        db.add(bp)
        await db.commit()
        await db.refresh(bp)
        return _birth_profile_to_dict(bp)


@router.put("/birth-profiles/{profile_id}")
async def update_birth_profile(
    profile_id: str,
    req: BirthProfileRequest,
    user: User = Depends(require_user),
):
    """更新出生档案"""
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(BirthProfile).where(
                BirthProfile.id == profile_id,
                BirthProfile.user_id == user.id,
            )
        )
        bp = result.scalar_one_or_none()
        if not bp:
            raise HTTPException(status_code=404, detail="出生档案不存在")

        gender_val = req.gender if req.gender in ("male", "female", "other") else "other"
        bp.nickname = req.nickname or bp.nickname
        bp.gender = Gender(gender_val)
        bp.birth_year = req.birth_year
        bp.birth_month = req.birth_month
        bp.birth_day = req.birth_day
        bp.birth_hour = req.birth_hour
        bp.birth_minute = req.birth_minute
        bp.birth_city = req.birth_city or ""
        bp.latitude = req.latitude
        bp.longitude = req.longitude
        await db.commit()
        await db.refresh(bp)
        return _birth_profile_to_dict(bp)


@router.delete("/birth-profiles/{profile_id}")
async def delete_birth_profile(
    profile_id: str,
    user: User = Depends(require_user),
):
    """删除出生档案"""
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(BirthProfile).where(
                BirthProfile.id == profile_id,
                BirthProfile.user_id == user.id,
            )
        )
        bp = result.scalar_one_or_none()
        if not bp:
            raise HTTPException(status_code=404, detail="出生档案不存在")
        if bp.nickname == "本命":
            raise HTTPException(status_code=400, detail="不能删除本命档案")
        await db.delete(bp)
        await db.commit()
        return {"status": "deleted", "message": "出生档案已删除"}
