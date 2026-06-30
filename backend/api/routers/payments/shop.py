"""Shop order endpoints."""

import secrets
import logging
from datetime import datetime, timedelta, timezone
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
from services.pricing import lock_user_region, quote_custom_amount, resolve_pricing_region, validate_payment_method

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

    server_total = 0.0
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
            active_price = server_price_cny if region == "domestic" else server_price_usd
            server_total += active_price * item.quantity
            validated_items.append({
                "product_id": item.product_id,
                "product_name": prod["name"],
                "quantity": item.quantity,
                "unit_price_cny": server_price_cny,
                "unit_price_usd": server_price_usd,
            })
        else:
            raise HTTPException(status_code=400, detail=f"商品不存在: {item.product_id or item.product_name}，请通过正确渠道购买")

    final_total = round(server_total, 2)
    coupon_used = 0.0

    if req.use_coupon and user:
        if region != "domestic":
            raise HTTPException(status_code=400, detail="Coupons are only available for domestic CNY orders")
        balance = float(user.shop_coupon_balance or 0)
        if balance <= 0:
            raise HTTPException(status_code=400, detail="没有可用的代金券余额")
        coupon_used = float(min(balance, final_total))
        # NOTE: coupon deduction is in the same transaction as order creation.
        # If commit fails, both roll back. If server crashes after commit,
        # the order exists and coupon is correctly deducted.
        user.shop_coupon_balance = float(balance) - coupon_used
        final_total = round(final_total - coupon_used, 2)

    order_no = f"ORD{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"
    total_cny = final_total if region == "domestic" else round(sum(i["unit_price_cny"] * i["quantity"] for i in validated_items), 2)
    total_usd = final_total if region == "overseas" else round(sum(i["unit_price_usd"] * i["quantity"] for i in validated_items), 2)
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
        "original_total": server_total,
        "coupon_used": coupon_used,
        "final_total": final_total,
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


@router.post("/shop-orders/{order_no}/confirm-qr-payment")
async def confirm_shop_qr_payment(
    order_no: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """用户通过个人收款码付款后，点击「我已付款」"""
    result = await db.execute(
        select(Order).where(
            Order.order_no == order_no,
            Order.user_id == current_user.id,
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=400, detail=f"订单状态为 {order.status.value}，无法确认付款")

    # Rate limit: reuse existing token if still valid (prevent email spam)
    now = datetime.now(timezone.utc)
    if order.admin_confirm_token and order.admin_confirm_expires and order.admin_confirm_expires > now:
        admin_token = order.admin_confirm_token
        logger.info(f"[QR-ADMIN] Order {order_no}: reusing existing token (expires {order.admin_confirm_expires})")
    else:
        admin_token = secrets.token_urlsafe(32)
        order.admin_confirm_token = admin_token
        order.admin_confirm_expires = now + timedelta(hours=24)
    order.notes = (order.notes or "") + f"\n[QR] 用户点击确认付款，等待管理员确认 {now.strftime('%Y-%m-%d %H:%M')}"
    await db.commit()

    admin_emails_str = settings.ADMIN_EMAILS
    logger.info(f"[QR-ADMIN] Order {order_no}: admin_confirm_token generated")
    logger.info(f"[QR-ADMIN] Confirm URL: {settings.BASE_URL}/api/payments/admin-confirm-email?token={admin_token}")
    logger.info(f"[QR-ADMIN] Reject URL: {settings.BASE_URL}/api/payments/admin-reject-email?token={admin_token}")

    if admin_emails_str:
        import asyncio
        from utils.email import send_admin_payment_confirm_email
        admin_emails = [e.strip() for e in admin_emails_str.split(",") if e.strip()]
        amount = float(order.total_cny or 0)
        user_email = current_user.email or ""
        item_stmt = select(OrderItem).where(OrderItem.order_id == order.id)
        item_result = await db.execute(item_stmt)
        items = item_result.scalars().all()
        items_desc = ", ".join(f"{i.product_name}×{i.quantity}" for i in items) if items else ""
        payment_display = order.payment_method or "微信/支付宝"

        for admin_email in admin_emails:
            try:
                result = await asyncio.to_thread(
                    send_admin_payment_confirm_email,
                    admin_email, order_no, amount, admin_token,
                    user_email=user_email, payment_method=payment_display,
                    items_desc=items_desc,
                )
                logger.info(f"[QR-ADMIN] Email sent to {admin_email}: {result}")
            except Exception as e:
                logger.warning(f"[EMAIL] Failed to send admin confirm email to {admin_email}: {e}")
    else:
        logger.warning(f"[QR-ADMIN] ADMIN_EMAILS not configured!")

    return {
        "success": True,
        "order_no": order.order_no,
        "status": "pending_admin_confirm",
        "message": "付款确认已提交，管理员将在核实收款后确认订单",
    }


@router.get("/confirm-email")
async def confirm_email_payment(
    request: Request,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """用户点击邮件中的确认链接，验证 token 后将订单标记为已付款"""
    from fastapi import Request
    from fastapi.responses import RedirectResponse
    from services.rate_limiter import check_rate_limit

    client_ip = request.client.host if request.client else "unknown"
    if await check_rate_limit(f"confirm-email:{client_ip}", limit=5, window=60):
        raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")

    result = await db.execute(
        select(Order).where(Order.confirm_token == token).with_for_update()
    )
    order = result.scalar_one_or_none()
    if not order:
        return RedirectResponse(
            url=f"{settings.BASE_URL}/zh/checkout?error=invalid_token",
            status_code=302,
        )

    if order.confirm_expires and order.confirm_expires < datetime.now(timezone.utc):
        return RedirectResponse(
            url=f"{settings.BASE_URL}/zh/checkout?error=token_expired",
            status_code=302,
        )

    if order.status != OrderStatus.pending:
        return RedirectResponse(
            url=f"{settings.BASE_URL}/zh/account/orders/{order.order_no}",
            status_code=302,
        )

    order.status = OrderStatus.paid
    order.paid_at = datetime.now(timezone.utc)
    order.confirm_token = None
    order.notes = (order.notes or "") + f"\n[QR-EMAIL] 邮件确认付款 {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"
    await db.commit()

    try:
        from api.routers.personal_payments import _activate_order
        await _activate_order(db, order)
    except Exception as e:
        logger.warning(f"[QR-EMAIL] Failed to activate order {order.order_no}: {e}")

    return RedirectResponse(
        url=f"{settings.BASE_URL}/zh/account/orders/{order.order_no}?payment=confirmed",
        status_code=302,
    )
