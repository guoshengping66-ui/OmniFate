"""PayPal payment endpoints."""

import secrets
import base64
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, Order, OrderStatus, OrderItem
from auth.dependencies import require_user
from config import get_settings

from .constants import PRODUCT_PRICES
from .utils import validate_payment_region
from .subscriptions import activate_subscription
from .founder import activate_founder_seat_logic

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


class PayPalPay:
    """PayPal REST API 支付"""

    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.secret = settings.PAYPAL_SECRET
        self.mode = settings.PAYPAL_MODE
        self.return_url = settings.PAYPAL_RETURN_URL
        self.cancel_url = settings.PAYPAL_CANCEL_URL

        if self.mode == "sandbox":
            self.base_url = "https://api-m.sandbox.paypal.com"
        else:
            self.base_url = "https://api-m.paypal.com"

    async def _get_access_token(self) -> str:
        """获取 PayPal Access Token"""
        auth = base64.b64encode(f"{self.client_id}:{self.secret}".encode()).decode()
        import httpx
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{self.base_url}/v1/oauth2/token",
                headers={
                    "Authorization": f"Basic {auth}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={"grant_type": "client_credentials"},
            )
        result = response.json()
        token = result.get("access_token", "")
        if not token:
            logger.error(f"[PAYPAL] 获取 access_token 失败: status={response.status_code}, response={result}")
        return token

    async def create_order(self, order_no: str, amount_usd: float, description: str, custom_id: str = "") -> dict:
        """创建 PayPal 订单"""
        access_token = await self._get_access_token()

        purchase_unit = {
            "reference_id": order_no,
            "description": description,
            "amount": {
                "currency_code": "USD",
                "value": f"{amount_usd:.2f}",
            },
        }
        if custom_id:
            purchase_unit["custom_id"] = custom_id

        import httpx
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{self.base_url}/v2/checkout/orders",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "intent": "CAPTURE",
                    "purchase_units": [purchase_unit],
                    "application_context": {
                        "return_url": self.return_url,
                        "cancel_url": self.cancel_url,
                    },
                },
            )

        result = response.json()
        if "id" in result:
            approve_url = next(
                (link["href"] for link in result.get("links", []) if link["rel"] == "approve"),
                None,
            )
            return {
                "order_id": result["id"],
                "approve_url": approve_url,
                "order_no": order_no,
            }
        else:
            logger.error(f"[PAYPAL] Order failed: {result.get('message')}")
            raise HTTPException(status_code=400, detail="PayPal 下单失败，请稍后重试")


@router.post("/paypal/create")
async def create_paypal_order(
    request: Request,
    item_type: str = Query("unlock_report", description="商品类型"),
    reading_id: str = Query(None, description="报告 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """创建 PayPal 订单 — 金额由服务端决定，需要登录以传递用户 ID 给 webhook"""
    validate_payment_region(request, "paypal")
    if not settings.PAYPAL_ENABLED:
        raise HTTPException(status_code=400, detail="PayPal 未启用")

    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info or "usd" not in price_info:
        raise HTTPException(status_code=400, detail="无效的商品类型")
    amount_usd = price_info["usd"]
    amount_cny = price_info["cny"]

    subject_map = {
        "premium_monthly": "Destiny Mirror - AI Analysis Monthly Subscription",
        "premium_yearly": "Destiny Mirror - AI Analysis Yearly Subscription",
        "unlock_report": "Destiny Mirror - AI Analysis Report",
        "founder_lifetime": "Destiny Mirror - Founder Lifetime Membership",
    }
    paypal_description = subject_map.get(item_type, "Destiny Mirror - AI Analysis Service")

    order_no = f"PP{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"

    order = Order(
        user_id=current_user.id,
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount_cny,
        payment_method="paypal",
        payment_ref=order_no,
        item_type=item_type,
        notes=f"item_type:{item_type}|reading_id:{reading_id or ''}",
    )
    db.add(order)
    await db.commit()

    paypal = PayPalPay()
    result = await paypal.create_order(order_no, amount_usd, paypal_description, custom_id=current_user.id)

    return {
        "order_no": order_no,
        "paypal_order_id": result["order_id"],
        "approve_url": result["approve_url"],
        "total_amount": amount_usd,
        "currency": "USD",
        "message": "请在新窗口完成 PayPal 支付",
    }


@router.get("/paypal/checkout-url")
async def paypal_checkout_url(
    item_type: str = Query("unlock_report"),
    reading_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """Server-side PayPal checkout: create order and return approve URL."""
    if not settings.PAYPAL_ENABLED:
        raise HTTPException(status_code=400, detail="PayPal 未启用")

    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info or "usd" not in price_info:
        raise HTTPException(status_code=400, detail="无效的商品类型")
    amount_usd = price_info["usd"]
    amount_cny = price_info["cny"]

    subject_map = {
        "premium_monthly": "Destiny Mirror - AI Analysis Monthly Subscription",
        "premium_yearly": "Destiny Mirror - AI Analysis Yearly Subscription",
        "unlock_report": "Destiny Mirror - AI Analysis Report",
        "founder_lifetime": "Destiny Mirror - Founder Lifetime Membership",
    }
    paypal_description = subject_map.get(item_type, "Destiny Mirror - AI Analysis Service")

    order_no = f"PP{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"

    order = Order(
        user_id=current_user.id,
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount_cny,
        payment_method="paypal",
        payment_ref=order_no,
        item_type=item_type,
        notes=f"item_type:{item_type}|reading_id:{reading_id or ''}",
    )
    db.add(order)
    await db.commit()

    paypal = PayPalPay()
    base = settings.BASE_URL
    result = await paypal.create_order(order_no, amount_usd, paypal_description, custom_id=current_user.id)

    approve_url = result["approve_url"]
    separator = "&" if "?" in approve_url else "?"
    checkout_url = f"{approve_url}{separator}return={base}/api/proxy/api/payments/paypal/return/{order_no}&cancel={base}/api/proxy/api/payments/paypal/cancel/{order_no}"

    return {
        "checkout_url": checkout_url,
        "order_no": order_no,
        "total_amount": amount_usd,
    }


@router.get("/paypal/return/{order_no}")
async def paypal_return(
    order_no: str,
    token: str = Query(""),
    PayerID: str = Query(""),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """PayPal redirect callback after user approves payment."""
    if not token:
        return RedirectResponse(f"{settings.BASE_URL}/payment?error=no_token")

    paypal = PayPalPay()
    access_token = await paypal._get_access_token()

    import httpx
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            f"{paypal.base_url}/v2/checkout/orders/{token}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
        )
    result = response.json()

    if result.get("status") == "COMPLETED":
        order_result = await db.execute(
            select(Order).where(Order.order_no == order_no).with_for_update()
        )
        order = order_result.scalar_one_or_none()
        if order and order.user_id != current_user.id:
            logger.warning("[PAYPAL-RETURN] 用户 %s 尝试激活不属于自己的订单 %s", current_user.id, order_no)
            return RedirectResponse(f"{settings.BASE_URL}/payment?paypal=unauthorized")
        if order and order.status != OrderStatus.paid:
            order.status = OrderStatus.paid
            order.paid_at = datetime.now(timezone.utc)
            order.payment_ref = token

            if order.user_id:
                item_type = order.item_type or ""
                if not item_type and order.notes and "item_type:" in order.notes:
                    item_type = order.notes.split("item_type:")[1].split("|")[0]

                user_result = await db.execute(
                    select(User).where(User.id == order.user_id).with_for_update()
                )
                user = user_result.scalar_one_or_none()
                if user and item_type in ("premium_monthly", "premium_yearly"):
                    await activate_subscription(user, item_type, db)
                    logger.info(f"[PAYPAL-RETURN] 激活订阅: 用户 {user.id}, {item_type}")
                elif user and item_type == "founder_lifetime":
                    await activate_founder_seat_logic(user, order_no, db)
                    logger.info(f"[PAYPAL-RETURN] 激活创始席位: 用户 {user.id}")
                elif user and item_type == "onetime_unlock":
                    from .unlock import handle_onetime_unlock_activation
                    grant_info = await handle_onetime_unlock_activation(user, order, db)
                    if not grant_info.get("already_activated"):
                        logger.info(f"[PAYPAL-RETURN] 激活一次性解锁: 用户 {user.id}")

            await db.commit()

        return RedirectResponse(f"{settings.BASE_URL}/payment?paypal=success")
    else:
        logger.error(f"[PAYPAL-RETURN] 捕获失败: {order_no}, {result}")
        return RedirectResponse(f"{settings.BASE_URL}/payment?paypal=failed")


@router.post("/paypal/create-shop-order")
async def create_shop_paypal_order(
    order_no: str = Query(..., description="商城订单号"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    为商城订单创建 PayPal 支付订单。
    QRPaymentModal 在用户选择 PayPal 或信用卡时调用此接口，
    获取 PayPal order_id 供前端 SDK 预创建。
    """
    if not settings.PAYPAL_ENABLED:
        raise HTTPException(status_code=400, detail="PayPal 未启用")

    # 查找商城订单
    result = await db.execute(
        select(Order).where(Order.order_no == order_no).with_for_update()
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.user_id and str(order.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="无权操作此订单")
    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=400, detail=f"订单状态为 {order.status.value}，无法支付")

    # 计算美元金额
    total_cny = float(order.total_cny or 0)
    # 汇率: 1 USD ≈ 7.2 CNY
    CNY_TO_USD_RATE = 7.2
    amount_usd = round(total_cny / CNY_TO_USD_RATE, 2)
    if amount_usd < 0.01:
        raise HTTPException(status_code=400, detail="订单金额异常")

    # 获取商品描述
    item_stmt = select(OrderItem).where(OrderItem.order_id == order.id)
    item_result = await db.execute(item_stmt)
    items = item_result.scalars().all()
    items_desc = ", ".join(f"{i.product_name}×{i.quantity}" for i in items) if items else "Shop Order"
    paypal_description = f"Destiny Engine - {items_desc}"

    # 创建 PayPal 订单
    paypal = PayPalPay()
    try:
        pay_result = await paypal.create_order(
            order_no, amount_usd, paypal_description,
            custom_id=str(current_user.id),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[PAYPAL-SHOP] 创建 PayPal 订单失败: {e}")
        raise HTTPException(status_code=500, detail="PayPal 下单失败，请稍后重试")

    # 将 PayPal order_id 存入 payment_ref，供 capture 和 webhook 使用
    paypal_order_id = pay_result["order_id"]
    order.payment_ref = paypal_order_id
    order.total_usd = amount_usd
    order.notes = (order.notes or "") + f"\n[PAYPAL-SHOP] PayPal order created: {paypal_order_id}"
    await db.commit()

    return {
        "paypal_order_id": paypal_order_id,
        "order_no": order_no,
        "total_usd": amount_usd,
    }


@router.post("/paypal/capture")
async def capture_shop_paypal_order(
    paypal_order_id: str = Query(..., alias="paypal_order_id", description="PayPal order ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    捕获已批准的 PayPal 支付。
    QRPaymentModal 在用户完成 PayPal 支付后调用此接口，
    服务端向 PayPal 发起 capture 请求并更新订单状态。
    """
    if not settings.PAYPAL_ENABLED:
        raise HTTPException(status_code=400, detail="PayPal 未启用")

    paypal = PayPalPay()
    access_token = await paypal._get_access_token()

    import httpx
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            f"{paypal.base_url}/v2/checkout/orders/{paypal_order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
        )
    result = response.json()

    if result.get("status") != "COMPLETED":
        logger.error(f"[PAYPAL-CAPTURE] 捕获失败: {paypal_order_id}, status={result.get('status')}")
        detail = result.get("message") or result.get("name") or "PayPal capture failed"
        raise HTTPException(status_code=400, detail=detail)

    # 找到对应的商城订单 — 通过 payment_ref（存储了 PayPal order_id）
    order_result = await db.execute(
        select(Order).where(
            Order.payment_ref == paypal_order_id,
            Order.status == OrderStatus.pending,
        ).with_for_update()
    )
    order = order_result.scalar_one_or_none()

    if not order:
        # 回退：通过 order_no 查找（非 shop 订单可能用 order_no 作为 payment_ref）
        order_result2 = await db.execute(
            select(Order).where(
                Order.order_no == paypal_order_id,
                Order.status == OrderStatus.pending,
            ).with_for_update()
        )
        order = order_result2.scalar_one_or_none()

    if not order:
        # 可能是重复请求
        order_check = await db.execute(
            select(Order).where(Order.payment_ref == paypal_order_id)
        )
        existing = order_check.scalar_one_or_none()
        if existing and existing.status == OrderStatus.paid:
            return {"status": "already_captured", "order_no": existing.order_no}
        raise HTTPException(status_code=404, detail="未找到对应的待支付订单")

    # 验证用户身份
    if order.user_id and str(order.user_id) != str(current_user.id):
        logger.warning(f"[PAYPAL-CAPTURE] 用户 {current_user.id} 尝试捕获不属于自己的订单 {order.order_no}")
        raise HTTPException(status_code=403, detail="无权操作此订单")

    # 更新订单状态
    order.status = OrderStatus.paid
    order.paid_at = datetime.now(timezone.utc)
    order.notes = (order.notes or "") + f"\n[PAYPAL-CAPTURE] Captured {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"

    # 激活相关服务（订阅、创始席位等）
    item_type = order.item_type or ""
    if order.user_id:
        user_result = await db.execute(
            select(User).where(User.id == order.user_id).with_for_update()
        )
        user = user_result.scalar_one_or_none()
        if user and item_type in ("premium_monthly", "premium_yearly"):
            await activate_subscription(user, item_type, db)
            logger.info(f"[PAYPAL-CAPTURE] 激活订阅: 用户 {user.id}, {item_type}")
        elif user and item_type == "founder_lifetime":
            await activate_founder_seat_logic(user, order.order_no, db)
            logger.info(f"[PAYPAL-CAPTURE] 激活创始席位: 用户 {user.id}")

    await db.commit()
    return {"status": "captured", "order_no": order.order_no}


@router.get("/paypal/cancel/{order_no}")
async def paypal_cancel(order_no: str):
    """PayPal redirect when user cancels payment."""
    return RedirectResponse(f"{settings.BASE_URL}/payment?paypal=cancelled")
