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
from database.models import User, Order, OrderStatus
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


@router.get("/paypal/cancel/{order_no}")
async def paypal_cancel(order_no: str):
    """PayPal redirect when user cancels payment."""
    return RedirectResponse(f"{settings.BASE_URL}/payment?paypal=cancelled")
