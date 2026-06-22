"""WeChat payment endpoints."""

import uuid
import hashlib
import secrets
import hmac
import logging
from datetime import datetime, timezone

import defusedxml.ElementTree as ET
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy import select
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


class WeChatPay:
    """微信支付 Native 扫码支付"""

    def __init__(self):
        self.appid = settings.WECHAT_APPID
        self.mch_id = settings.WECHAT_MCH_ID
        self.api_key = settings.WECHAT_API_KEY
        self.notify_url = settings.WECHAT_NOTIFY_URL
        self.unified_url = "https://api.mch.weixin.qq.com/pay/unifiedorder"

    def _generate_nonce(self) -> str:
        return uuid.uuid4().hex

    def _generate_sign(self, data: dict) -> str:
        """生成签名"""
        sorted_data = sorted(data.items(), key=lambda x: x[0])
        string_a = "&".join([f"{k}={v}" for k, v in sorted_data if v])
        string_sign_temp = f"{string_a}&key={self.api_key}"
        return hashlib.md5(string_sign_temp.encode("utf-8")).hexdigest().upper()

    def _dict_to_xml(self, data: dict) -> str:
        xml_parts = ["<xml>"]
        for k, v in data.items():
            xml_parts.append(f"<{k}><![CDATA[{v}]]></{k}>")
        xml_parts.append("</xml>")
        return "".join(xml_parts)

    def _parse_xml(self, xml_str: str) -> dict:
        root = ET.fromstring(xml_str)
        return {child.tag: child.text for child in root}

    async def create_order(self, order_no: str, amount_cny: float, description: str, client_ip: str = "127.0.0.1") -> dict:
        """创建微信支付订单，返回二维码 URL"""
        amount_fen = int(amount_cny * 100)  # 转为分

        data = {
            "appid": self.appid,
            "mch_id": self.mch_id,
            "nonce_str": self._generate_nonce(),
            "body": description,
            "out_trade_no": order_no,
            "total_fee": str(amount_fen),
            "spbill_create_ip": client_ip,
            "notify_url": self.notify_url,
            "trade_type": "NATIVE",
        }
        data["sign"] = self._generate_sign(data)

        xml_data = self._dict_to_xml(data)
        import httpx
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(self.unified_url, content=xml_data.encode("utf-8"))
        result = self._parse_xml(response.text)

        if result.get("return_code") == "SUCCESS" and result.get("result_code") == "SUCCESS":
            return {
                "code_url": result.get("code_url", ""),
                "order_no": order_no,
                "total_fee": amount_fen,
            }
        else:
            logger.error(f"[WECHAT] Order failed: {result.get('err_code_des')}")
            raise HTTPException(status_code=400, detail="微信支付下单失败，请稍后重试")


@router.post("/wechat/create")
async def create_wechat_order(
    request: Request,
    item_type: str = Query("unlock_report", description="商品类型"),
    reading_id: str = Query(None, description="报告 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """创建微信支付订单 — 金额由服务端决定，客户端不可篡改"""
    validate_payment_region(request, "wechat_pay")
    if not settings.WECHAT_PAY_ENABLED:
        raise HTTPException(status_code=400, detail="微信支付未启用")

    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info or "cny" not in price_info:
        raise HTTPException(status_code=400, detail="无效的商品类型")
    amount = price_info["cny"]

    subject_map = {
        "premium_monthly": "AlphaMirror AI算力月度套餐",
        "premium_yearly": "AlphaMirror AI算力年度套餐",
        "unlock_report": "AlphaMirror AI算力服务",
        "founder_lifetime": "AlphaMirror AI算力终身套餐",
        "onetime_unlock": "AlphaMirror AI算力单次服务",
    }
    wechat_subject = subject_map.get(item_type, "AlphaMirror AI算力服务")

    order_no = f"WX{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"

    order = Order(
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount,
        payment_method="wechat_pay",
        payment_ref=order_no,
        user_id=current_user.id,
        item_type=item_type,
        notes=f"item_type:{item_type}|reading_id:{reading_id or ''}",
    )
    db.add(order)
    await db.commit()

    wechat = WeChatPay()
    client_ip = "127.0.0.1"
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        client_ip = real_ip.split(",")[0].strip()
    elif request.client:
        client_ip = request.client.host
    result = await wechat.create_order(order_no, amount, wechat_subject, client_ip=client_ip)

    return {
        "order_no": order_no,
        "code_url": result["code_url"],
        "total_fee": amount,
        "message": "请使用微信扫码支付",
    }


@router.post("/wechat/notify")
async def wechat_notify(request: Request, db: AsyncSession = Depends(get_db)):
    """微信支付回调通知"""
    body = await request.body()
    root = ET.fromstring(body)
    data = {child.tag: child.text for child in root}

    if data.get("return_code") != "SUCCESS":
        return "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[FAIL]]></return_msg></xml>"

    wechat = WeChatPay()
    sign = data.pop("sign", "")
    expected_sign = wechat._generate_sign(data)
    if not hmac.compare_digest(expected_sign.encode(), sign.encode()):
        return "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>"

    order_no = data.get("out_trade_no", "")

    order_result = await db.execute(select(Order).where(Order.order_no == order_no).with_for_update())
    order = order_result.scalar_one_or_none()
    if not order:
        logger.critical("Order not found for notification! out_trade_no=%s", order_no)
        return "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>"
    if order:
        if order.status == OrderStatus.paid:
            return "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>"
        paid_fee = int(data.get("total_fee", 0))
        expected_fee = int(order.total_cny * 100)
        if paid_fee != expected_fee:
            return "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[金额不匹配]]></return_msg></xml>"
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
                logger.info(f"[WECHAT-NOTIFY] 激活订阅: 用户 {user.id}, {item_type}, 星尘 +{grant_info.get('grant_amount', 0)}")
            elif user and item_type == "founder_lifetime":
                grant_info = await activate_founder_seat_logic(user, order_no, db)
                logger.info(f"[WECHAT-NOTIFY] 激活创始席位: 用户 {user.id}, 席位 #{grant_info.get('seat_no')}")
            elif user and item_type == "onetime_unlock":
                from .unlock import handle_onetime_unlock_activation
                grant_info = await handle_onetime_unlock_activation(user, order, db)
                if not grant_info.get("already_activated"):
                    logger.info(f"[WECHAT-NOTIFY] 激活一次性解锁: 用户 {user.id}, 代金券 +{grant_info.get('coupon_granted', 0)}, 星尘 +{grant_info.get('stardust_granted', 0)}")

    await db.commit()
    return "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>"
