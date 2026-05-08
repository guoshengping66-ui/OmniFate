"""api/routers/payments.py — 直接对接微信支付/支付宝/PayPal（不使用 Stripe）"""
import uuid
import random
import hashlib
import time
import json
import base64
import requests
from datetime import datetime, timedelta
from typing import Optional
from xml.etree import ElementTree as ET

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import (
    Reading, User, Order, OrderItem, EventLog, Product,
    PaymentStatus, OrderStatus,
)
from auth.dependencies import get_current_user, require_user
from config import get_settings

router = APIRouter()
settings = get_settings()

SHOP_COUPON_AMOUNT = 60
TRIAL_DAYS = 3
EVENT_RETRO_PRICE = 19.9

# ── Server-side price list (clients CANNOT override these) ───────────────────
# Prices in CNY for Alipay/WeChat, USD for PayPal
PREMIUM_MONTHLY_CNY = 49.0
PREMIUM_YEARLY_CNY = 298.0
PREMIUM_MONTHLY_USD = 6.99
PREMIUM_YEARLY_USD = 39.99
UNLOCK_PRICE_CNY = 69.0

# Price map for order validation
PRODUCT_PRICES = {
    "premium_monthly": {"cny": PREMIUM_MONTHLY_CNY, "usd": PREMIUM_MONTHLY_USD},
    "premium_yearly": {"cny": PREMIUM_YEARLY_CNY, "usd": PREMIUM_YEARLY_USD},
    "unlock_report": {"cny": UNLOCK_PRICE_CNY},
}


# ─── Payment Methods ──────────────────────────────────────────────────────────

@router.get("/payment-methods")
async def get_payment_methods():
    """返回可用的支付方式列表"""
    methods = []

    if settings.ALIPAY_ENABLED:
        methods.append({
            "id": "alipay",
            "name": "支付宝",
            "name_en": "Alipay",
            "icon": "alipay",
            "category": "china",
            "enabled": True,
        })

    if settings.WECHAT_PAY_ENABLED:
        methods.append({
            "id": "wechat_pay",
            "name": "微信支付",
            "name_en": "WeChat Pay",
            "icon": "wechat",
            "category": "china",
            "enabled": True,
        })

    if settings.PAYPAL_ENABLED:
        methods.append({
            "id": "paypal",
            "name": "PayPal",
            "name_en": "PayPal",
            "icon": "paypal",
            "category": "global",
            "enabled": True,
        })

    return {"methods": methods, "count": len(methods)}


# ─── Shared helpers ──────────────────────────────────────────────────────────

async def _unlock_reading(reading_id: str, db: AsyncSession) -> dict:
    """Shared unlock logic: mark reading paid, issue coupon, activate trial."""
    reading_result = await db.execute(select(Reading).where(Reading.id == reading_id))
    reading = reading_result.scalar_one_or_none()
    if not reading:
        raise HTTPException(status_code=404, detail="报告不存在")
    if reading.is_detail_unlocked:
        return {
            "unlocked": True,
            "reading_id": reading_id,
            "message": "报告已解锁，无需重复支付",
            "shop_coupon_issued": 0,
            "trial_activated": False,
        }

    reading.is_detail_unlocked = True
    reading.payment_status = PaymentStatus.paid
    reading.stripe_payment_intent = "paid_" + reading_id[:8]

    coupon_issued = 0
    trial_activated = False

    if reading.user_id:
        user_result = await db.execute(select(User).where(User.id == reading.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            if (user.shop_coupon_balance or 0) == 0:
                user.shop_coupon_balance = SHOP_COUPON_AMOUNT
                coupon_issued = SHOP_COUPON_AMOUNT
            if not user.is_premium:
                user.is_premium = True
                user.subscription_tier = "trial"
                user.premium_expires_at = datetime.utcnow() + timedelta(days=TRIAL_DAYS)
                user.free_event_quota = 2
                user.free_event_quota_reset_at = datetime.utcnow() + timedelta(days=TRIAL_DAYS)
                trial_activated = True

    await db.commit()
    return {
        "unlocked": True,
        "reading_id": reading_id,
        "message": "报告已解锁",
        "shop_coupon_issued": coupon_issued,
        "trial_activated": trial_activated,
    }


# ─── 微信支付 ────────────────────────────────────────────────────────────────

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

    async def create_order(self, order_no: str, amount_cny: float, description: str) -> dict:
        """创建微信支付订单，返回二维码 URL"""
        amount_fen = int(amount_cny * 100)  # 转为分

        data = {
            "appid": self.appid,
            "mch_id": self.mch_id,
            "nonce_str": self._generate_nonce(),
            "body": description,
            "out_trade_no": order_no,
            "total_fee": str(amount_fen),
            "spbill_create_ip": "127.0.0.1",
            "notify_url": self.notify_url,
            "trade_type": "NATIVE",
        }
        data["sign"] = self._generate_sign(data)

        xml_data = self._dict_to_xml(data)
        response = requests.post(self.unified_url, data=xml_data.encode("utf-8"), timeout=10)
        result = self._parse_xml(response.text)

        if result.get("return_code") == "SUCCESS" and result.get("result_code") == "SUCCESS":
            return {
                "code_url": result.get("code_url", ""),
                "order_no": order_no,
                "total_fee": amount_fen,
            }
        else:
            raise HTTPException(status_code=400, detail=f"微信支付下单失败: {result.get('err_code_des', '未知错误')}")


@router.post("/wechat/create")
async def create_wechat_order(
    item_type: str = Query("unlock_report", description="商品类型"),
    description: str = Query("命盘智镜", description="商品描述"),
    reading_id: str = Query(None, description="报告 ID"),
    db: AsyncSession = Depends(get_db),
):
    """创建微信支付订单 — 金额由服务端决定，客户端不可篡改"""
    if not settings.WECHAT_PAY_ENABLED:
        raise HTTPException(status_code=400, detail="微信支付未启用")

    # Server-side price lookup — NEVER trust client input
    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info or "cny" not in price_info:
        raise HTTPException(status_code=400, detail="无效的商品类型")
    amount = price_info["cny"]

    order_no = f"WX{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

    order = Order(
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount,
        payment_method="wechat_pay",
        payment_ref=order_no,
    )
    db.add(order)
    await db.commit()

    wechat = WeChatPay()
    result = await wechat.create_order(order_no, amount, description)

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

    # 验证签名
    wechat = WeChatPay()
    sign = data.pop("sign", "")
    if wechat._generate_sign(data) != sign:
        return "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>"

    # 解锁报告
    order_no = data.get("out_trade_no", "")

    # 查找订单并验证金额
    order_result = await db.execute(select(Order).where(Order.order_no == order_no))
    order = order_result.scalar_one_or_none()
    if order:
        # Verify paid amount matches expected amount
        paid_fee = int(data.get("total_fee", 0))
        expected_fee = int(order.total_cny * 100)
        if paid_fee != expected_fee:
            return "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[金额不匹配]]></return_msg></xml>"
        order.status = OrderStatus.paid
        order.paid_at = datetime.utcnow()

    await db.commit()
    return "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>"


# ─── 支付宝 ────────────────────────────────────────────────────────────────

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

        # 构造待签名字符串
        sorted_params = sorted(params.items())
        sign_content = "&".join([f"{k}={v}" for k, v in sorted_params if v])

        # 加载私钥
        private_key = serialization.load_pem_private_key(
            self.private_key.encode(),
            password=None,
        )

        # 签名
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

        # 签名
        params["sign"] = self._sign(params)

        # 构造支付 URL
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        pay_url = f"{self.gateway_url}?{query_string}"

        return {
            "pay_url": pay_url,
            "order_no": order_no,
            "total_amount": amount_cny,
        }


@router.post("/alipay/create")
async def create_alipay_order(
    item_type: str = Query("unlock_report", description="商品类型"),
    subject: str = Query("命盘智镜", description="商品名称"),
    reading_id: str = Query(None, description="报告 ID"),
    db: AsyncSession = Depends(get_db),
):
    """创建支付宝订单 — 金额由服务端决定"""
    if not settings.ALIPAY_ENABLED:
        raise HTTPException(status_code=400, detail="支付宝未启用")

    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info or "cny" not in price_info:
        raise HTTPException(status_code=400, detail="无效的商品类型")
    amount = price_info["cny"]

    order_no = f"ALI{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

    order = Order(
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount,
        payment_method="alipay",
        payment_ref=order_no,
    )
    db.add(order)
    await db.commit()

    alipay = AlipayPay()
    result = await alipay.create_order(order_no, amount, subject)

    return {
        "order_no": order_no,
        "pay_url": result["pay_url"],
        "total_amount": amount,
        "message": "请在新窗口完成支付宝支付",
    }


@router.post("/alipay/notify")
async def alipay_notify(request: Request, db: AsyncSession = Depends(get_db)):
    """支付宝回调通知"""
    form = await request.form()
    data = dict(form)

    if data.get("trade_status") not in ("TRADE_SUCCESS", "TRADE_FINISHED"):
        return "fail"

    order_no = data.get("out_trade_no", "")

    # 查找订单并验证金额
    order_result = await db.execute(select(Order).where(Order.order_no == order_no))
    order = order_result.scalar_one_or_none()
    if order:
        # Verify paid amount matches expected amount
        paid_amount = float(data.get("total_amount", 0))
        if abs(paid_amount - order.total_cny) > 0.01:
            return "fail"
        order.status = OrderStatus.paid
        order.paid_at = datetime.utcnow()

    await db.commit()
    return "success"


# ─── PayPal ────────────────────────────────────────────────────────────────

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

    def _get_access_token(self) -> str:
        """获取 PayPal Access Token"""
        auth = base64.b64encode(f"{self.client_id}:{self.secret}".encode()).decode()
        response = requests.post(
            f"{self.base_url}/v1/oauth2/token",
            headers={
                "Authorization": f"Basic {auth}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={"grant_type": "client_credentials"},
            timeout=10,
        )
        return response.json().get("access_token", "")

    async def create_order(self, order_no: str, amount_usd: float, description: str) -> dict:
        """创建 PayPal 订单"""
        access_token = self._get_access_token()

        response = requests.post(
            f"{self.base_url}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={
                "intent": "CAPTURE",
                "purchase_units": [{
                    "reference_id": order_no,
                    "description": description,
                    "amount": {
                        "currency_code": "USD",
                        "value": f"{amount_usd:.2f}",
                    },
                }],
                "application_context": {
                    "return_url": self.return_url,
                    "cancel_url": self.cancel_url,
                },
            },
            timeout=10,
        )

        result = response.json()
        if "id" in result:
            # 获取支付链接
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
            raise HTTPException(status_code=400, detail=f"PayPal 下单失败: {result.get('message', '未知错误')}")


@router.post("/paypal/create")
async def create_paypal_order(
    item_type: str = Query("unlock_report", description="商品类型"),
    description: str = Query("Destiny Mirror", description="商品描述"),
    reading_id: str = Query(None, description="报告 ID"),
    db: AsyncSession = Depends(get_db),
):
    """创建 PayPal 订单 — 金额由服务端决定"""
    if not settings.PAYPAL_ENABLED:
        raise HTTPException(status_code=400, detail="PayPal 未启用")

    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info or "usd" not in price_info:
        raise HTTPException(status_code=400, detail="无效的商品类型")
    amount_usd = price_info["usd"]
    amount_cny = price_info["cny"]

    order_no = f"PP{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

    order = Order(
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount_cny,
        payment_method="paypal",
        payment_ref=order_no,
    )
    db.add(order)
    await db.commit()

    paypal = PayPalPay()
    result = await paypal.create_order(order_no, amount_usd, description)

    return {
        "order_no": order_no,
        "paypal_order_id": result["order_id"],
        "approve_url": result["approve_url"],
        "total_amount": amount_usd,
        "currency": "USD",
        "message": "请在新窗口完成 PayPal 支付",
    }


@router.post("/paypal/capture")
async def capture_paypal_order(
    paypal_order_id: str = Query(..., description="PayPal 订单 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """捕获 PayPal 支付（用户支付完成后调用）— 需要登录"""
    paypal = PayPalPay()
    access_token = paypal._get_access_token()

    response = requests.post(
        f"{paypal.base_url}/v2/checkout/orders/{paypal_order_id}/capture",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        timeout=10,
    )

    result = response.json()
    if result.get("status") == "COMPLETED":
        order_no = result.get("purchase_units", [{}])[0].get("reference_id", "")
        if order_no:
            order_result = await db.execute(select(Order).where(Order.order_no == order_no))
            order = order_result.scalar_one_or_none()
            if order:
                # Verify captured amount matches expected
                captured_amount = float(result.get("purchase_units", [{}])[0].get("amount", {}).get("value", 0))
                if abs(captured_amount * 7.2 - order.total_cny) > 1.0:
                    raise HTTPException(status_code=400, detail="支付金额不匹配")
                order.status = OrderStatus.paid
                order.paid_at = datetime.utcnow()
                await db.commit()

        return {"status": "completed", "message": "支付成功"}
    else:
        raise HTTPException(status_code=400, detail="PayPal 捕获失败")


# ─── Report Unlock ───────────────────────────────────────────────────────────

@router.post("/unlock/{reading_id}")
async def mock_unlock(
    reading_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """Mock 支付解锁报告（开发环境）— 需要登录"""
    return await _unlock_reading(reading_id, db)


# ─── Event Retrospection Payment ─────────────────────────────────────────────

class PayEventRequest(BaseModel):
    event_id: str
    use_free_quota: bool = True


@router.post("/pay-event")
async def pay_event(
    req: PayEventRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """支付事件复盘：订阅用户免费额度 → 超量 ¥19.9/次"""
    event_result = await db.execute(select(EventLog).where(EventLog.id == req.event_id))
    event = event_result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="事件不存在")

    if getattr(event, "is_paid", False):
        return {"paid": True, "event_id": req.event_id, "charge": 0, "message": "已支付"}

    charge = 0.0
    used_free = False
    user = None

    # Refetch user within this session if logged in
    if current_user:
        result = await db.execute(select(User).where(User.id == current_user.id))
        user = result.scalar_one_or_none()

    if user:
        now = datetime.utcnow()
        if user.free_event_quota_reset_at and now > user.free_event_quota_reset_at:
            user.free_event_quota = 2 if user.subscription_tier != "premium_yearly" else 5
            user.free_event_quota_reset_at = now + timedelta(days=30)

        if req.use_free_quota and (user.free_event_quota or 0) > 0:
            user.free_event_quota -= 1
            used_free = True
        else:
            charge = EVENT_RETRO_PRICE
    else:
        charge = EVENT_RETRO_PRICE

    setattr(event, "is_paid", True)
    await db.commit()
    return {
        "paid": True,
        "event_id": req.event_id,
        "charge": charge,
        "used_free_quota": used_free,
        "remaining_free_quota": user.free_event_quota if user else 0,
        "message": "使用免费额度" if used_free else f"已支付 ¥{charge}",
    }


# ─── Order with Coupon ───────────────────────────────────────────────────────

class OrderItemIn(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price_cny: float


class CreateOrderRequest(BaseModel):
    items: list[OrderItemIn]
    total_cny: float
    use_coupon: bool = False


@router.post("/create-order")
async def create_order(
    req: CreateOrderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """创建订单，支持代金券抵扣 — 服务端验证价格"""
    # Refetch user within this session if logged in
    user = None
    if current_user:
        result = await db.execute(select(User).where(User.id == current_user.id))
        user = result.scalar_one_or_none()

    # Validate prices against product catalog (NEVER trust client prices)
    server_total = 0.0
    validated_items = []
    for item in req.items:
        if item.product_id:
            prod_result = await db.execute(select(Product).where(Product.id == item.product_id))
            prod = prod_result.scalar_one_or_none()
            if not prod:
                raise HTTPException(status_code=400, detail=f"商品不存在: {item.product_id}")
            # Use server-side price, ignore client price
            server_price = prod.price_cny
            server_total += server_price * item.quantity
            validated_items.append({
                "product_id": item.product_id,
                "product_name": prod.name,
                "quantity": item.quantity,
                "unit_price_cny": server_price,
            })
        else:
            # Non-catalog items (e.g., subscriptions) — use client price but cap at reasonable limit
            if item.unit_price_cny > 9999 or item.unit_price_cny < 0:
                raise HTTPException(status_code=400, detail="无效的价格")
            server_total += item.unit_price_cny * item.quantity
            validated_items.append({
                "product_id": None,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price_cny": item.unit_price_cny,
            })

    # Use server-calculated total, not client total
    final_total = round(server_total, 2)
    coupon_used = 0.0

    if req.use_coupon and user:
        balance = user.shop_coupon_balance or 0
        if balance <= 0:
            raise HTTPException(status_code=400, detail="没有可用的代金券余额")
        coupon_used = min(balance, final_total)
        user.shop_coupon_balance = balance - coupon_used
        final_total = round(final_total - coupon_used, 2)

    order_no = f"ORD{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

    order = Order(
        user_id=user.id if user else None,
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=final_total,
        payment_method="pending",
        payment_ref=order_no,
    )
    db.add(order)
    await db.flush()

    for item in validated_items:
        pid = item["product_id"]
        oi = OrderItem(
            order_id=order.id,
            product_id=pid,
            product_name=item["product_name"],
            quantity=item["quantity"],
            unit_price_cny=item["unit_price_cny"],
            subtotal_cny=round(item["unit_price_cny"] * item["quantity"], 2),
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
        "message": "订单已创建，请选择支付方式完成支付",
    }


# ─── Subscription ────────────────────────────────────────────────────────────

@router.post("/subscribe")
async def mock_subscribe(
    tier: str = Query("premium_monthly", pattern="^(premium_monthly|premium_yearly)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """订阅会员（Mock 模式）— 支付宝/微信正式支付请使用 /alipay/create 或 /wechat/create"""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用")

    # Refetch user within THIS session to avoid detached-instance issues
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    now = datetime.utcnow()

    if tier == "premium_yearly":
        expires = now + timedelta(days=365)
        free_events = 5
        price_label = "¥298/年"
    else:
        expires = now + timedelta(days=30)
        free_events = 2
        price_label = "¥49/月"

    user.is_premium = True
    user.subscription_tier = tier
    user.premium_expires_at = expires
    user.free_event_quota = free_events
    user.free_event_quota_reset_at = now + timedelta(days=30)

    await db.commit()
    await db.refresh(user)

    return {
        "subscription_id": f"sub_{uuid.uuid4().hex[:8]}",
        "tier": tier,
        "status": "active",
        "current_period_end": expires.isoformat(),
        "message": f"订阅成功: {price_label}",
        "user": {
            "is_premium": user.is_premium,
            "subscription_tier": user.subscription_tier,
            "premium_expires_at": user.premium_expires_at.isoformat() if user.premium_expires_at else None,
            "free_event_quota": user.free_event_quota,
            "shop_coupon_balance": user.shop_coupon_balance,
        },
    }


@router.post("/cancel-subscription")
async def mock_cancel_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """取消订阅"""
    return {
        "status": "cancelled",
        "premium_expires_at": current_user.premium_expires_at.isoformat() if current_user.premium_expires_at else None,
        "message": "订阅已取消，当前周期结束后恢复免费",
    }
