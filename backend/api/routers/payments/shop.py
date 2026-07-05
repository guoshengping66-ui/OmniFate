"""Shop order endpoints."""

import secrets
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import (
    User, Order, OrderItem, UserAddress, OrderStatus,
)
from auth.dependencies import get_current_user
from config import get_settings
from services.pricing import lock_user_region, quote_custom_amount, quote_shop_totals, resolve_pricing_region, validate_payment_method

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


class OrderItemIn(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price_cny: float


class CreateOrderRequest(BaseModel):
    items: list[OrderItemIn]
    total_cny: float
    use_coupon: bool = False
    address_id: Optional[str] = None
    payment_method: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    shipping_address: Optional[dict] = None
    notes: Optional[str] = None


@router.post("/create-order")
async def create_order(
    req: CreateOrderRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """创建订单，支持代金券抵扣 — 服务端验证价格"""
    user = None
    if current_user:
        result = await db.execute(
            select(User).where(User.id == current_user.id).with_for_update()
        )
        user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="请先登录后再下单")

    region = resolve_pricing_region(request, user)
    if req.payment_method:
        validate_payment_method(region, req.payment_method)
    lock_user_region(user, region)
    if user.pricing_region == region and not user.pricing_region_locked_at:
        user.pricing_region_locked_at = datetime.now(timezone.utc)

    from api.routers.products import _load_products
    all_products = _load_products("zh")
    product_map = {p["id"]: p for p in all_products}

    server_subtotal_cny = 0.0
    server_subtotal_usd = 0.0
    validated_items = []
    for item in req.items:
        if item.product_id:
            prod = product_map.get(item.product_id)
            if not prod:
                raise HTTPException(status_code=400, detail=f"商品不存在: {item.product_id}")
            server_price_cny = float(prod["price_cny"])
            server_price_usd = float(prod.get("price_usd") or 0)
            if region == "overseas" and server_price_usd <= 0:
                raise HTTPException(status_code=400, detail=f"Product is not available in overseas pricing: {item.product_id}")
            server_subtotal_cny += server_price_cny * item.quantity
            server_subtotal_usd += server_price_usd * item.quantity
            validated_items.append({
                "product_id": item.product_id,
                "product_name": prod["name"],
                "quantity": item.quantity,
                "unit_price_cny": server_price_cny,
                "unit_price_usd": server_price_usd,
            })
        else:
            raise HTTPException(status_code=400, detail=f"商品不存在: {item.product_id or item.product_name}，请通过正确渠道购买")

    coupon_used = 0.0

    if req.use_coupon and user:
        balance = float(user.shop_coupon_balance or 0)
        if balance <= 0:
            raise HTTPException(status_code=400, detail="没有可用的代金券余额")
        coupon_used = float(min(balance, server_subtotal_cny))
        # NOTE: coupon deduction is in the same transaction as order creation.
        # If commit fails, both roll back. If server crashes after commit,
        # the order exists and coupon is correctly deducted.
        user.shop_coupon_balance = float(balance) - coupon_used

    is_premium = bool(getattr(user, "is_premium", False))
    order_no = f"ORD{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"
    totals = quote_shop_totals(
        region=region,
        subtotal_cny=server_subtotal_cny,
        subtotal_usd=server_subtotal_usd,
        coupon_cny=coupon_used,
        is_premium=is_premium,
    )
    total_cny = totals["total_cny"]
    total_usd = totals["total_usd"]
    quote = quote_custom_amount(
        sku="shop",
        region=region,
        amount_cny=total_cny,
        amount_usd=total_usd,
        label="Profile Mirror Shop Order",
    )

    recipient_name = req.recipient_name
    recipient_phone = req.recipient_phone
    shipping_address = req.shipping_address

    if req.address_id and current_user:
        addr_result = await db.execute(
            select(UserAddress).where(
                UserAddress.id == req.address_id,
                UserAddress.user_id == current_user.id,
            )
        )
        addr = addr_result.scalar_one_or_none()
        if addr:
            recipient_name = addr.recipient_name
            recipient_phone = addr.phone
            shipping_address = {
                "country": addr.country,
                "province": addr.province,
                "city": addr.city,
                "district": addr.district,
                "address_line1": addr.address_line1,
                "address_line2": addr.address_line2,
                "postal_code": addr.postal_code,
            }

    order = Order(
        user_id=user.id if user else None,
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=total_cny,
        total_usd=total_usd,
        pricing_region=quote.region,
        currency=quote.currency.upper(),
        amount_minor=quote.amount_minor,
        price_snapshot={
            **quote.snapshot(),
            "items": validated_items,
            "coupon_used": coupon_used,
            "shop_totals": totals,
        },
        payment_method=req.payment_method or "pending",
        payment_ref=order_no,
        item_type="shop",
        recipient_name=recipient_name,
        recipient_phone=recipient_phone,
        shipping_address=shipping_address,
        notes=req.notes,
    )
    db.add(order)
    await db.flush()

    for item in validated_items:
        oi = OrderItem(
            order_id=order.id,
            product_id=None,
            product_name=item["product_name"],
            quantity=item["quantity"],
            unit_price_cny=item["unit_price_cny"],
            subtotal_cny=round(item["unit_price_cny"] * item["quantity"], 2),
            unit_price_usd=item["unit_price_usd"],
            subtotal_usd=round(item["unit_price_usd"] * item["quantity"], 2),
            currency=quote.currency.upper(),
            unit_amount_minor=int(round((item["unit_price_cny"] if region == "domestic" else item["unit_price_usd"]) * 100)),
            subtotal_amount_minor=int(round((item["unit_price_cny"] if region == "domestic" else item["unit_price_usd"]) * item["quantity"] * 100)),
        )
        db.add(oi)

    await db.commit()
    return {
        "order_id": str(order.id),
        "order_no": order_no,
        "status": "pending",
        "original_total": totals["subtotal_cny"] if region == "domestic" else totals["subtotal_usd"],
        "coupon_used": coupon_used,
        "shipping_fee": totals["shipping_cny"] if region == "domestic" else totals["shipping_usd"],
        "final_total": totals["amount"],
        "region": quote.region,
        "currency": quote.currency.upper(),
        "amount_minor": quote.amount_minor,
        "message": "订单已创建，请选择支付方式完成支付",
    }


@router.get("/tracking/{order_id}")
async def get_tracking(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """查询物流信息"""
    stmt = select(Order).where(
        Order.id == order_id,
        Order.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")

    tracking_info = {
        "order_no": order.order_no,
        "status": order.status.value if order.status else "pending",
        "tracking_number": order.tracking_number,
        "shipping_carrier": order.shipping_carrier,
        "shipped_at": order.shipped_at.isoformat() if order.shipped_at else None,
        "trajectory": [],
    }

    if order.tracking_number and order.shipping_carrier:
        try:
            kuaidi_key = settings.KUAI_DI100_API_KEY
            if not kuaidi_key:
                logger.warning("KUAI_DI100_API_KEY not configured — skipping tracking lookup")
                raise ValueError("KUAI_DI100_API_KEY not set")
            kuaidi_url = "https://api.kuaidi100.com/query"
            import httpx
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(kuaidi_url, params={
                    "com": order.shipping_carrier,
                    "nu": order.tracking_number,
                    "key": kuaidi_key,
                })
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "200":
                    tracking_info["trajectory"] = [
                        {
                            "time": item.get("ftime", ""),
                            "description": item.get("context", ""),
                        }
                        for item in data.get("data", [])
                    ]
        except Exception as e:
            logger.warning("Tracking lookup failed for order %s: %s", order.order_no, e)

    return tracking_info


@router.get("/shop-orders/{order_no}/payment-status")
async def get_shop_payment_status(
    order_no: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取商城订单支付状态（需要认证，只能查看自己的订单）"""
    result = await db.execute(
        select(Order).where(Order.order_no == order_no)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.user_id and str(order.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="无权查看此订单")

    return {
        "order_no": order.order_no,
        "status": order.status.value,
    }
