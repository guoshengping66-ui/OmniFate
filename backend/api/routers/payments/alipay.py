"""Alipay payment endpoints."""

import secrets
import base64
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, Order, OrderStatus
from auth.dependencies import require_user
from config import get_settings

from services.pricing import get_price_quote, lock_user_region, resolve_pricing_region, validate_payment_method
from services.payment_events import mark_payment_event_processed, record_payment_event
from .subscriptions import activate_subscription
from .founder import activate_founder_seat_logic

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


class AlipayPay:
    """支付宝电脑网站支付"""

    def __init__(self):
        self.app_id = settings.ALIPAY_APP_ID
        self.private_key = settings.ALIPAY_PRIVATE_KEY
        self.alipay_public_key = settings.ALIPAY_PUBLIC_KEY
        self.notify_url = settings.ALIPAY_NOTIFY_URL
        self.return_url = settings.ALIPAY_RETURN_URL
        self.gateway_url = "https://openapi.alipay.com/gateway.do"

    def _sign(self, params: dict) -> str:
        """RSA2 签名"""
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding

        sorted_params = sorted(params.items())
        sign_content = "&".join([f"{k}={v}" for k, v in sorted_params if v])

        private_key = serialization.load_pem_private_key(
            self.private_key.encode(),
            password=None,
        )

        signature = private_key.sign(
            sign_content.encode(),
            padding.PKCS1v15(),
            hashes.SHA256(),
        )
        return base64.b64encode(signature).decode()

    async def create_order(self, order_no: str, amount_cny: float, subject: str) -> dict:
        """创建支付宝订单，返回支付页面 URL"""
        params = {
            "app_id": self.app_id,
            "method": "alipay.trade.page.pay",
            "charset": "utf-8",
            "sign_type": "RSA2",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "version": "1.0",
            "notify_url": self.notify_url,
            "return_url": self.return_url,
            "biz_content": json.dumps({
                "out_trade_no": order_no,
                "total_amount": f"{amount_cny:.2f}",
                "subject": subject,
                "product_code": "FAST_INSTANT_TRADE_PAY",
            }),
        }

        params["sign"] = self._sign(params)

        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        pay_url = f"{self.gateway_url}?{query_string}"

        return {
            "pay_url": pay_url,
            "order_no": order_no,
            "total_amount": amount_cny,
        }


def _verify_alipay_signature(data: dict) -> bool:
    """验证支付宝回调 RSA2 签名"""
    try:
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding

        sign = data.pop("sign", "")
        if not sign or not settings.ALIPAY_PUBLIC_KEY:
            return False

        sorted_params = sorted(data.items())
        sign_content = "&".join([f"{k}={v}" for k, v in sorted_params if v and k != "sign"])

        public_key = serialization.load_pem_public_key(
            settings.ALIPAY_PUBLIC_KEY.encode(),
        )

        signature = base64.b64decode(sign)
        public_key.verify(
            signature,
            sign_content.encode(),
            padding.PKCS1v15(),
            hashes.SHA256(),
        )
        return True
    except Exception:
        return False


@router.post("/alipay/create")
async def create_alipay_order(
    request: Request,
    item_type: str = Query("unlock_report", description="商品类型"),
    reading_id: str = Query(None, description="报告 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """创建支付宝订单 — 金额由服务端决定"""
    if not settings.ALIPAY_ENABLED:
        raise HTTPException(status_code=400, detail="Alipay is not enabled")

    region = resolve_pricing_region(request, current_user)
    validate_payment_method(region, "alipay")
    quote = get_price_quote(item_type, region)
    amount = quote.cny_amount
    lock_user_region(current_user, region)
    if current_user.pricing_region == region and not current_user.pricing_region_locked_at:
        current_user.pricing_region_locked_at = datetime.now(timezone.utc)

    subject_map = {
        "premium_monthly": "AlphaMirror AI算力月度套餐",
        "premium_yearly": "AlphaMirror AI算力年度套餐",
        "unlock_report": "AlphaMirror AI算力服务",
        "founder_lifetime": "AlphaMirror AI算力终身套餐",
        "onetime_unlock": "AlphaMirror AI算力单次服务",
    }
    alipay_subject = subject_map.get(item_type, "AlphaMirror AI算力服务")

    order_no = f"ALI{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"

    order = Order(
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=quote.cny_amount,
        total_usd=quote.usd_amount,
        pricing_region=quote.region,
        currency=quote.currency.upper(),
        amount_minor=quote.amount_minor,
        price_snapshot=quote.snapshot(),
        payment_method="alipay",
        payment_ref=order_no,
        user_id=current_user.id,
        item_type=item_type,
        notes=f"item_type:{item_type}|reading_id:{reading_id or ''}",
    )
    db.add(order)
    await db.commit()

    alipay = AlipayPay()
    result = await alipay.create_order(order_no, amount, alipay_subject)

    return {
        "order_no": order_no,
        "pay_url": result["pay_url"],
        "total_amount": amount,
        "message": "请在新窗口完成支付宝支付",
    }


@router.post("/alipay/notify")
async def alipay_notify(request: Request, db: AsyncSession = Depends(get_db)):
    """支付宝回调通知 — 必须验证 RSA2 签名"""
    form = await request.form()
    data = dict(form)

    if not _verify_alipay_signature(data):
        return "fail"

    if data.get("trade_status") not in ("TRADE_SUCCESS", "TRADE_FINISHED"):
        return "fail"

    order_no = data.get("out_trade_no", "")
    event_id = data.get("trade_no") or order_no
    payment_event, is_new = await record_payment_event(
        db,
        provider="alipay",
        event_id=event_id,
        event_type=data.get("trade_status"),
        order_no=order_no,
        payload=data,
    )
    if not is_new:
        await db.commit()
        return "success"

    order_result = await db.execute(select(Order).where(Order.order_no == order_no).with_for_update())
    order = order_result.scalar_one_or_none()
    if not order:
        logger.critical("Order not found for notification! out_trade_no=%s", order_no)
        mark_payment_event_processed(payment_event, "order_not_found")
        await db.commit()
        return "success"
    if order:
        if order.status == OrderStatus.paid:
            mark_payment_event_processed(payment_event, "already_paid")
            await db.commit()
            return "success"
        paid_amount = float(data.get("total_amount", 0))
        if abs(paid_amount - order.total_cny) > 0.01:
            return "fail"
        order.status = OrderStatus.paid
        order.paid_at = datetime.now(timezone.utc)

        if order.user_id:
            item_type = order.item_type or ""
            if not item_type and order.notes and "item_type:" in order.notes:
                item_type = order.notes.split("item_type:")[1].split("|")[0]

            user_result = await db.execute(
                select(User).where(User.id == order.user_id).with_for_update()
            )
            user = user_result.scalar_one_or_none()
            if user and item_type in ("premium_monthly", "premium_yearly"):
                grant_info = await activate_subscription(user, item_type, db)
                logger.info(f"[ALIPAY-NOTIFY] 激活订阅: 用户 {user.id}, {item_type}, 星尘 +{grant_info.get('grant_amount', 0)}")
            elif user and item_type == "founder_lifetime":
                grant_info = await activate_founder_seat_logic(user, order_no, db)
                logger.info(f"[ALIPAY-NOTIFY] 激活创始席位: 用户 {user.id}, 席位 #{grant_info.get('seat_no')}")
            elif user and item_type == "onetime_unlock":
                from .unlock import handle_onetime_unlock_activation
                grant_info = await handle_onetime_unlock_activation(user, order, db)
                if not grant_info.get("already_activated"):
                    logger.info(f"[ALIPAY-NOTIFY] 激活一次性解锁: 用户 {user.id}")

    mark_payment_event_processed(payment_event)
    await db.commit()
    return "success"
