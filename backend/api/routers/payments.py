"""api/routers/payments.py — 直接对接微信支付/支付宝/PayPal（不使用 Stripe）"""
import uuid
import random
import hashlib
import time
import json
import base64
import logging
import requests

logger = logging.getLogger(__name__)
from datetime import datetime, timedelta, timezone
from typing import Optional
from xml.etree import ElementTree as ET

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import (
    Reading, User, Order, OrderItem, EventLog, Product, UserAddress,
    FounderVote, CreditTransaction, PaymentStatus, OrderStatus,
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
PREMIUM_MONTHLY_CNY = 59.0
PREMIUM_YEARLY_CNY = 365.0
PREMIUM_MONTHLY_USD = 14.99
PREMIUM_YEARLY_USD = 99.00
UNLOCK_PRICE_CNY = 88.0
UNLOCK_PRICE_USD = 24.99

# Price map for order validation
PRODUCT_PRICES = {
    "premium_monthly": {"cny": PREMIUM_MONTHLY_CNY, "usd": PREMIUM_MONTHLY_USD},
    "premium_yearly": {"cny": PREMIUM_YEARLY_CNY, "usd": PREMIUM_YEARLY_USD},
    "unlock_report": {"cny": UNLOCK_PRICE_CNY, "usd": UNLOCK_PRICE_USD},
    "founder_lifetime": {"cny": 1288, "usd": 399},
}

# ── Stardust constants ──────────────────────────────────────────────────────
GRANT_ON_REPORT_UNLOCK = 100   # 解锁报告奖励星尘
GRANT_ON_REGISTER = 100         # 注册奖励星尘（足够解锁一次完整分析）
SUBSCRIPTION_GRANTS = {
    "premium_monthly": 100,
    "premium_yearly": 150,
    "founder_lifetime": 500,
}


# ─── Payment Methods ──────────────────────────────────────────────────────────


async def _activate_subscription(user: User, tier: str, db: AsyncSession) -> dict:
    """
    激活订阅会员 — 单一事实来源（Single Source of Truth）。
    由 QR 支付确认、正式支付回调、mock 订阅 共同调用。
    """
    if tier not in ("premium_monthly", "premium_yearly"):
        return {}

    now = datetime.now(timezone.utc)
    grant_amount = SUBSCRIPTION_GRANTS.get(tier, 0)

    if tier == "premium_yearly":
        expires = now + timedelta(days=365)
        free_events = 5
    else:
        expires = now + timedelta(days=30)
        free_events = 2

    user.is_premium = True
    user.subscription_tier = tier
    user.premium_expires_at = expires
    user.free_event_quota = free_events
    user.free_event_quota_reset_at = now + timedelta(days=30)

    # 注入首月星尘
    user.stardust_balance += grant_amount
    user.stardust_lifetime_earned += grant_amount

    tx = CreditTransaction(
        user_id=user.id,
        amount=grant_amount,
        balance_after=user.stardust_balance,
        reason="subscription_grant",
        reference_id=None,
        status="confirmed",
    )
    db.add(tx)

    return {
        "grant_amount": grant_amount,
        "expires": expires.isoformat(),
        "free_events": free_events,
    }


async def _activate_founder_seat(user: User, order_no: str, db: AsyncSession) -> dict:
    """
    激活创始席位 — 由 QR 支付确认和正式支付回调调用。
    """
    now = datetime.now(timezone.utc)

    # Count current founders to determine next seat number (with lock to prevent race condition)
    domestic_count_result = await db.execute(
        select(func.count()).select_from(User).where(
            User.is_founder == True,
            User.founder_region == "domestic",
        ).with_for_update()
    )
    domestic_count = domestic_count_result.scalar() or 0

    if domestic_count < FOUNDER_TOTAL_DOMESTIC:
        region = "domestic"
        seat_no = domestic_count + 1
    else:
        overseas_count_result = await db.execute(
            select(func.count()).select_from(User).where(
                User.is_founder == True,
                User.founder_region == "overseas",
            ).with_for_update()
        )
        overseas_count = overseas_count_result.scalar() or 0
        if overseas_count >= FOUNDER_TOTAL_OVERSEAS:
            raise HTTPException(status_code=400, detail="创始席位已售罄")
        region = "overseas"
        seat_no = FOUNDER_TOTAL_DOMESTIC + overseas_count + 1

    grant_amount = SUBSCRIPTION_GRANTS["founder_lifetime"]

    user.is_founder = True
    user.founder_seat_no = seat_no
    user.founder_region = region
    user.founder_activated_at = now
    user.subscription_tier = "founder_lifetime"
    user.is_premium = True
    user.premium_expires_at = None  # Lifetime
    user.stardust_balance += grant_amount
    user.stardust_lifetime_earned += grant_amount

    tx = CreditTransaction(
        user_id=user.id,
        amount=grant_amount,
        balance_after=user.stardust_balance,
        reason="founder_grant",
        reference_id=order_no,
        status="confirmed",
    )
    db.add(tx)

    return {
        "seat_no": seat_no,
        "region": region,
        "grant_amount": grant_amount,
    }

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


@router.get("/paypal/config")
async def paypal_config():
    """Return PayPal client ID and mode for frontend SDK initialization."""
    if not settings.PAYPAL_ENABLED or not settings.PAYPAL_CLIENT_ID:
        raise HTTPException(status_code=404, detail="PayPal not configured")
    return {
        "client_id": settings.PAYPAL_CLIENT_ID,
        "mode": settings.PAYPAL_MODE,  # "sandbox" or "live"
    }


# ── PayPal SDK proxy (for mainland China where paypal.com is blocked) ─────
_sdk_cache: dict = {"content": None, "ts": 0.0}


@router.get("/paypal/sdk")
async def paypal_sdk_proxy(
    request: Request,
    client_id: str = Query(""),
    currency: str = Query("USD"),
    intent: str = Query("capture"),
    components: str = Query("buttons"),
):
    """Proxy PayPal JS SDK to bypass GFW blocking paypal.com.

    The server can reach paypal.com; browsers in mainland China cannot.
    This endpoint fetches the SDK once and caches it for 1 hour.
    """
    now = time.time()
    # Re-fetch if cache is empty or older than 1 hour
    if not _sdk_cache["content"] or (now - _sdk_cache["ts"]) > 3600:
        sdk_url = f"https://www.paypal.com/sdk/js?client-id={client_id}&currency={currency}&intent={intent}&components={components}"
        logger.info(f"[PayPal SDK Proxy] Fetching {sdk_url}")
        try:
            resp = requests.get(sdk_url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Failed to fetch PayPal SDK: {resp.status_code}")
            _sdk_cache["content"] = resp.content
            _sdk_cache["ts"] = now
            logger.info(f"[PayPal SDK Proxy] Cached SDK ({len(resp.content)} bytes)")
        except requests.RequestException as e:
            raise HTTPException(status_code=502, detail=f"Failed to fetch PayPal SDK: {e}")

    from fastapi.responses import Response
    return Response(
        content=_sdk_cache["content"],
        media_type="application/javascript",
        headers={"Cache-Control": "public, max-age=3600"},
    )


# ─── Shared helpers ──────────────────────────────────────────────────────────

async def _unlock_reading(reading_id: str, db: AsyncSession, skip_stardust_grant: bool = False) -> dict:
    """Shared unlock logic: mark reading paid, issue coupon, activate trial.
    skip_stardust_grant: 当用户已通过星尘扣费解锁时，跳过解锁奖励（避免抵消扣费）。
    """
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
    stardust_granted = 0

    if reading.user_id:
        user_result = await db.execute(
            select(User).where(User.id == reading.user_id).with_for_update()
        )
        user = user_result.scalar_one_or_none()
        if user:
            if (user.shop_coupon_balance or 0) == 0:
                user.shop_coupon_balance = SHOP_COUPON_AMOUNT
                coupon_issued = SHOP_COUPON_AMOUNT
            if not user.is_premium:
                user.is_premium = True
                user.subscription_tier = "trial"
                user.premium_expires_at = datetime.now(timezone.utc) + timedelta(days=TRIAL_DAYS)
                user.free_event_quota = 2
                user.free_event_quota_reset_at = datetime.now(timezone.utc) + timedelta(days=TRIAL_DAYS)
                trial_activated = True
            # 解锁报告奖励星尘（星尘解锁时跳过，避免抵消扣费）
            if not skip_stardust_grant:
                user.stardust_balance += GRANT_ON_REPORT_UNLOCK
                user.stardust_lifetime_earned += GRANT_ON_REPORT_UNLOCK
                stardust_granted = GRANT_ON_REPORT_UNLOCK
                tx = CreditTransaction(
                    user_id=user.id,
                    amount=GRANT_ON_REPORT_UNLOCK,
                    balance_after=user.stardust_balance,
                    reason="report_unlock_grant",
                    reference_id=reading_id,
                    status="confirmed",
                )
                db.add(tx)

    await db.commit()
    return {
        "unlocked": True,
        "reading_id": reading_id,
        "message": "报告已解锁",
        "shop_coupon_issued": coupon_issued,
        "trial_activated": trial_activated,
        "stardust_granted": stardust_granted,
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
    reading_id: str = Query(None, description="报告 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """创建微信支付订单 — 金额由服务端决定，客户端不可篡改"""
    if not settings.WECHAT_PAY_ENABLED:
        raise HTTPException(status_code=400, detail="微信支付未启用")

    # Server-side price lookup — NEVER trust client input
    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info or "cny" not in price_info:
        raise HTTPException(status_code=400, detail="无效的商品类型")
    amount = price_info["cny"]

    # 合规化包装: 面向微信支付风控的商品描述（与命理世界观隔离）
    subject_map = {
        "premium_monthly": "AlphaMirror AI算力月度套餐",
        "premium_yearly": "AlphaMirror AI算力年度套餐",
        "unlock_report": "AlphaMirror AI算力服务",
        "founder_lifetime": "AlphaMirror AI算力终身套餐",
    }
    wechat_subject = subject_map.get(item_type, "AlphaMirror AI算力服务")

    order_no = f"WX{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

    order = Order(
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount,
        payment_method="wechat_pay",
        payment_ref=order_no,
        user_id=current_user.id,
        notes=f"item_type:{item_type}|reading_id:{reading_id or ''}",
    )
    db.add(order)
    await db.commit()

    wechat = WeChatPay()
    result = await wechat.create_order(order_no, amount, wechat_subject)

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

    # 验证签名 (timing-safe comparison to prevent timing attacks)
    wechat = WeChatPay()
    sign = data.pop("sign", "")
    expected_sign = wechat._generate_sign(data)
    import hmac
    if not hmac.compare_digest(expected_sign.encode(), sign.encode()):
        return "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>"

    # 解锁报告
    order_no = data.get("out_trade_no", "")

    # 查找订单并验证金额
    order_result = await db.execute(select(Order).where(Order.order_no == order_no))
    order = order_result.scalar_one_or_none()
    if order:
        # 幂等保护：如果订单已支付，直接返回成功（避免重复激活）
        if order.status == OrderStatus.paid:
            return "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>"
        # Verify paid amount matches expected amount
        paid_fee = int(data.get("total_fee", 0))
        expected_fee = int(order.total_cny * 100)
        if paid_fee != expected_fee:
            return "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[金额不匹配]]></return_msg></xml>"
        order.status = OrderStatus.paid
        order.paid_at = datetime.now(timezone.utc)

        if order.user_id:
            # 从 notes 中解析 item_type 并激活
            item_type = ""
            if order.notes and "item_type:" in order.notes:
                item_type = order.notes.split("item_type:")[1].split("|")[0]

            user_result = await db.execute(
                select(User).where(User.id == order.user_id).with_for_update()
            )
            user = user_result.scalar_one_or_none()
            if user and item_type in ("premium_monthly", "premium_yearly"):
                grant_info = await _activate_subscription(user, item_type, db)
                logger.info(f"[WECHAT-NOTIFY] 激活订阅: 用户 {user.id}, {item_type}, 星尘 +{grant_info.get('grant_amount', 0)}")
            elif user and item_type == "founder_lifetime":
                grant_info = await _activate_founder_seat(user, order_no, db)
                logger.info(f"[WECHAT-NOTIFY] 激活创始席位: 用户 {user.id}, 席位 #{grant_info.get('seat_no')}")

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
    reading_id: str = Query(None, description="报告 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """创建支付宝订单 — 金额由服务端决定"""
    if not settings.ALIPAY_ENABLED:
        raise HTTPException(status_code=400, detail="支付宝未启用")

    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info or "cny" not in price_info:
        raise HTTPException(status_code=400, detail="无效的商品类型")
    amount = price_info["cny"]

    # 合规化包装: 面向支付宝风控的商品名称（与命理世界观隔离）
    subject_map = {
        "premium_monthly": "AlphaMirror AI算力月度套餐",
        "premium_yearly": "AlphaMirror AI算力年度套餐",
        "unlock_report": "AlphaMirror AI算力服务",
        "founder_lifetime": "AlphaMirror AI算力终身套餐",
    }
    alipay_subject = subject_map.get(item_type, "AlphaMirror AI算力服务")

    order_no = f"ALI{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

    order = Order(
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount,
        payment_method="alipay",
        payment_ref=order_no,
        user_id=current_user.id,
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


def _verify_alipay_signature(data: dict) -> bool:
    """验证支付宝回调 RSA2 签名"""
    try:
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding

        sign = data.pop("sign", "")
        if not sign or not settings.ALIPAY_PUBLIC_KEY:
            return False

        # 构造待验签字符串（按 key 排序）
        sorted_params = sorted(data.items())
        sign_content = "&".join([f"{k}={v}" for k, v in sorted_params if v and k != "sign"])

        # 加载支付宝公钥
        public_key = serialization.load_pem_public_key(
            settings.ALIPAY_PUBLIC_KEY.encode(),
        )

        # 验证签名
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


@router.post("/alipay/notify")
async def alipay_notify(request: Request, db: AsyncSession = Depends(get_db)):
    """支付宝回调通知 — 必须验证 RSA2 签名"""
    form = await request.form()
    data = dict(form)

    # 1. 验证 RSA2 签名（防伪造回调）
    if not _verify_alipay_signature(data):
        return "fail"

    if data.get("trade_status") not in ("TRADE_SUCCESS", "TRADE_FINISHED"):
        return "fail"

    order_no = data.get("out_trade_no", "")

    # 查找订单并验证金额
    order_result = await db.execute(select(Order).where(Order.order_no == order_no))
    order = order_result.scalar_one_or_none()
    if order:
        # 幂等保护：如果订单已支付，直接返回成功（避免重复激活）
        if order.status == OrderStatus.paid:
            return "success"
        # Verify paid amount matches expected amount
        paid_amount = float(data.get("total_amount", 0))
        if abs(paid_amount - order.total_cny) > 0.01:
            return "fail"
        order.status = OrderStatus.paid
        order.paid_at = datetime.now(timezone.utc)

        if order.user_id:
            # 从 notes 中解析 item_type 并激活
            item_type = ""
            if order.notes and "item_type:" in order.notes:
                item_type = order.notes.split("item_type:")[1].split("|")[0]

            user_result = await db.execute(
                select(User).where(User.id == order.user_id).with_for_update()
            )
            user = user_result.scalar_one_or_none()
            if user and item_type in ("premium_monthly", "premium_yearly"):
                grant_info = await _activate_subscription(user, item_type, db)
                logger.info(f"[ALIPAY-NOTIFY] 激活订阅: 用户 {user.id}, {item_type}, 星尘 +{grant_info.get('grant_amount', 0)}")
            elif user and item_type == "founder_lifetime":
                grant_info = await _activate_founder_seat(user, order_no, db)
                logger.info(f"[ALIPAY-NOTIFY] 激活创始席位: 用户 {user.id}, 席位 #{grant_info.get('seat_no')}")

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

    async def create_order(self, order_no: str, amount_usd: float, description: str, custom_id: str = "") -> dict:
        """创建 PayPal 订单"""
        access_token = self._get_access_token()

        purchase_unit = {
            "reference_id": order_no,
            "description": description,
            "amount": {
                "currency_code": "USD",
                "value": f"{amount_usd:.2f}",
            },
        }
        # 传递 custom_id（用户 ID）供 webhook 回调识别用户
        if custom_id:
            purchase_unit["custom_id"] = custom_id

        response = requests.post(
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
    reading_id: str = Query(None, description="报告 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """创建 PayPal 订单 — 金额由服务端决定，需要登录以传递用户 ID 给 webhook"""
    if not settings.PAYPAL_ENABLED:
        raise HTTPException(status_code=400, detail="PayPal 未启用")

    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info or "usd" not in price_info:
        raise HTTPException(status_code=400, detail="无效的商品类型")
    amount_usd = price_info["usd"]
    amount_cny = price_info["cny"]

    # 合规化包装: 面向 PayPal 风控的商品描述（与命理世界观隔离）
    subject_map = {
        "premium_monthly": "AlphaMirror AI Computing Monthly",
        "premium_yearly": "AlphaMirror AI Computing Yearly",
        "unlock_report": "AlphaMirror AI Computing Service",
        "founder_lifetime": "AlphaMirror AI Computing Lifetime",
    }
    paypal_description = subject_map.get(item_type, "AlphaMirror AI Computing Service")

    order_no = f"PP{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

    order = Order(
        user_id=current_user.id,
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount_cny,
        payment_method="paypal",
        payment_ref=order_no,
        notes=f"item_type:{item_type}|reading_id:{reading_id or ''}",
    )
    db.add(order)
    await db.commit()

    paypal = PayPalPay()
    # 传递 user.id 作为 custom_id，供 webhook 回调识别用户并自动激活
    result = await paypal.create_order(order_no, amount_usd, paypal_description, custom_id=current_user.id)

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
            order_result = await db.execute(
                select(Order).where(Order.order_no == order_no).with_for_update()
            )
            order = order_result.scalar_one_or_none()
            if order:
                # Verify captured amount matches expected — use server-side USD price lookup
                captured_amount = float(result.get("purchase_units", [{}])[0].get("amount", {}).get("value", 0))
                # Find matching USD price from PRODUCT_PRICES by total_cny
                expected_usd = None
                for _item_type, prices in PRODUCT_PRICES.items():
                    if "usd" in prices and "cny" in prices:
                        if abs(prices["cny"] - order.total_cny) < 0.01:
                            expected_usd = prices["usd"]
                            break
                if expected_usd and abs(captured_amount - expected_usd) > 0.01:
                    raise HTTPException(status_code=400, detail="支付金额不匹配")

                # 如果订单尚未被 webhook 标记为 paid，激活对应权益
                already_paid = order.status == OrderStatus.paid
                order.status = OrderStatus.paid
                order.paid_at = datetime.now(timezone.utc)

                if not already_paid and order.user_id:
                    # 从 notes 中解析 item_type 并激活
                    item_type = ""
                    if order.notes and "item_type:" in order.notes:
                        item_type = order.notes.split("item_type:")[1].split("|")[0]

                    user_result = await db.execute(
                        select(User).where(User.id == order.user_id).with_for_update()
                    )
                    user = user_result.scalar_one_or_none()
                    if user and item_type in ("premium_monthly", "premium_yearly"):
                        grant_info = await _activate_subscription(user, item_type, db)
                        logger.info(f"[PAYPAL-CAPTURE] 激活订阅: 用户 {user.id}, {item_type}, 星尘 +{grant_info.get('grant_amount', 0)}")
                    elif user and item_type == "founder_lifetime":
                        grant_info = await _activate_founder_seat(user, order_no, db)
                        logger.info(f"[PAYPAL-CAPTURE] 激活创始席位: 用户 {user.id}, 席位 #{grant_info.get('seat_no')}")

                await db.commit()

        return {"status": "completed", "message": "支付成功"}
    else:
        raise HTTPException(status_code=400, detail="PayPal 捕获失败")


# ─── Report Unlock ───────────────────────────────────────────────────────────

@router.post("/unlock/{reading_id}")
async def unlock_report(
    reading_id: str,
    source: str = Query("payment", description="payment 或 stardust"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    解锁报告。
    source=payment: 验证已支付订单（支付宝/微信/PayPal）。
    source=stardust: 原子操作——检查余额→扣减星尘→解锁报告。
    """
    print(f"[UNLOCK] reading_id={reading_id}, source={source}, user={current_user.id}", flush=True)
    # 1. 查找报告
    reading_result = await db.execute(select(Reading).where(Reading.id == reading_id))
    reading = reading_result.scalar_one_or_none()
    if not reading:
        raise HTTPException(status_code=404, detail="报告不存在")

    # 1.5 验证报告归属（只能解锁自己的报告）
    if reading.user_id and str(reading.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="无权操作此报告")

    # 2. 检查是否已解锁
    if reading.is_detail_unlocked:
        return {
            "unlocked": True,
            "reading_id": reading_id,
            "message": "报告已解锁，无需重复支付",
            "shop_coupon_issued": 0,
            "trial_activated": False,
        }

    # 3. 星尘解锁 — 原子操作（扣星尘 + 解锁报告）
    if source == "stardust":
        STARDUST_COST_UNLOCK = 100

        # 幂等检查：是否已有此报告的星尘扣减记录（防止重试违反唯一约束）
        existing_tx = await db.execute(
            select(CreditTransaction).where(
                CreditTransaction.user_id == current_user.id,
                CreditTransaction.reference_id == reading_id,
                CreditTransaction.reason == "report_unlock",
            )
        )
        existing_tx = existing_tx.scalar_one_or_none()

        if existing_tx:
            # 已有扣减记录 → 直接解锁（幂等）
            unlock_result = await _unlock_reading(reading_id, db)
            return {**unlock_result, "stardust_deducted": 0}

        # 新扣减
        user_result = await db.execute(
            select(User).where(User.id == current_user.id).with_for_update()
        )
        user = user_result.scalar_one()
        print(f"[UNLOCK] stardust check: balance={user.stardust_balance}, cost={STARDUST_COST_UNLOCK}, source={source}")
        if user.stardust_balance < STARDUST_COST_UNLOCK:
            raise HTTPException(
                status_code=402,
                detail=f"星尘不足：需要 {STARDUST_COST_UNLOCK}，当前 {user.stardust_balance}",
            )
        user.stardust_balance -= STARDUST_COST_UNLOCK
        # 记录扣减流水
        tx = CreditTransaction(
            user_id=user.id,
            amount=-STARDUST_COST_UNLOCK,
            balance_after=user.stardust_balance,
            reason="report_unlock",
            reference_id=reading_id,
            status="confirmed",
        )
        db.add(tx)
        # 解锁报告（跳过星尘奖励，因为用户已通过星尘支付）
        await db.flush()
        unlock_result = await _unlock_reading(reading_id, db, skip_stardust_grant=True)
        return {**unlock_result, "stardust_deducted": STARDUST_COST_UNLOCK}

    # 4. 支付宝/微信/PayPal 解锁 — 验证已支付订单
    paid_order = await db.execute(
        select(Order).where(
            Order.notes.contains(f"reading_id:{reading_id}"),
            Order.status == OrderStatus.paid,
        )
    )
    paid_order = paid_order.scalar_one_or_none()
    if not paid_order:
        raise HTTPException(
            status_code=402,
            detail="请先完成支付再解锁报告",
        )
    return await _unlock_reading(reading_id, db)


# ─── Event Retrospection Payment ─────────────────────────────────────────────

class PayEventRequest(BaseModel):
    event_id: str
    use_free_quota: bool = True
    source: str = "payment"  # "payment" | "stardust"


@router.post("/pay-event")
async def pay_event(
    req: PayEventRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """支付事件复盘：订阅用户免费额度 → 星尘(30) → ¥19.9/次"""
    event_result = await db.execute(select(EventLog).where(EventLog.id == req.event_id))
    event = event_result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="事件不存在")

    if getattr(event, "is_paid", False):
        return {"paid": True, "event_id": req.event_id, "charge": 0, "message": "已支付"}

    charge = 0.0
    used_free = False
    stardust_deducted = 0
    user = None

    # Refetch user within this session if logged in
    if current_user:
        result = await db.execute(select(User).where(User.id == current_user.id))
        user = result.scalar_one_or_none()

    if user:
        now = datetime.now(timezone.utc)
        if user.free_event_quota_reset_at and now > user.free_event_quota_reset_at:
            user.free_event_quota = 2 if user.subscription_tier != "premium_yearly" else 5
            user.free_event_quota_reset_at = now + timedelta(days=30)

        if req.use_free_quota and (user.free_event_quota or 0) > 0:
            user.free_event_quota -= 1
            used_free = True
        elif req.source == "stardust":
            # 星尘支付 — 悲观锁扣费
            STARDUST_COST_EVENT = 30
            from database.models import CreditTransaction as CT
            lock_result = await db.execute(
                select(User).where(User.id == current_user.id).with_for_update()
            )
            locked_user = lock_result.scalar_one()
            if locked_user.stardust_balance < STARDUST_COST_EVENT:
                raise HTTPException(
                    status_code=402,
                    detail=f"星尘不足: 需要 {STARDUST_COST_EVENT}，当前 {locked_user.stardust_balance}",
                )
            locked_user.stardust_balance -= STARDUST_COST_EVENT
            tx = CT(
                user_id=locked_user.id,
                amount=-STARDUST_COST_EVENT,
                balance_after=locked_user.stardust_balance,
                reason="event_retro",
                reference_id=req.event_id,
                status="confirmed",
            )
            db.add(tx)
            stardust_deducted = STARDUST_COST_EVENT
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
        "stardust_deducted": stardust_deducted,
        "message": "使用免费额度" if used_free else ("星尘支付成功" if stardust_deducted else f"已支付 ¥{charge}"),
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
    address_id: Optional[str] = None
    payment_method: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    shipping_address: Optional[dict] = None
    notes: Optional[str] = None


@router.post("/create-order")
async def create_order(
    req: CreateOrderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """创建订单，支持代金券抵扣 — 服务端验证价格"""
    # Refetch user within this session if logged in (with lock to prevent coupon race condition)
    user = None
    if current_user:
        result = await db.execute(
            select(User).where(User.id == current_user.id).with_for_update()
        )
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
            # Non-catalog items rejected — subscriptions use /personal-payments, not shop
            raise HTTPException(status_code=400, detail=f"商品不存在: {item.product_id or item.product_name}，请通过正确渠道购买")

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

    order_no = f"ORD{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

    # Resolve address info
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
        total_cny=final_total,
        payment_method=req.payment_method or "pending",
        payment_ref=order_no,
        recipient_name=recipient_name,
        recipient_phone=recipient_phone,
        shipping_address=shipping_address,
        notes=req.notes,
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


# ─── Tracking ──────────────────────────────────────────────────────────────

@router.get("/tracking/{order_id}")
async def get_tracking(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """查询物流信息"""

    stmt = select(Order).where(Order.id == order_id)
    if current_user:
        stmt = stmt.where(Order.user_id == current_user.id)
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

    # Try Kuaidi100 API if tracking info exists
    if order.tracking_number and order.shipping_carrier:
        try:
            kuaidi_url = "https://api.kuaidi100.com/query"
            resp = requests.get(kuaidi_url, params={
                "com": order.shipping_carrier,
                "nu": order.tracking_number,
                "key": "",  # 需要配置快递100 API key
            }, timeout=5)
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
        except Exception:
            pass  # 降级：不展示物流轨迹

    return tracking_info


# ─── Subscription ────────────────────────────────────────────────────────────

@router.post("/subscribe")
async def subscribe_tier(
    tier: str = Query("premium_monthly", pattern="^(premium_monthly|premium_yearly)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """订阅会员（仅开发环境）— 正式支付请使用 /personal-payments/create"""
    # 生产环境禁止直接订阅（必须通过支付流程）
    if not settings.DEBUG:
        raise HTTPException(
            status_code=403,
            detail="请通过正规支付流程订阅",
        )
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用")

    # Refetch user within THIS session to avoid detached-instance issues
    result = await db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    grant_info = await _activate_subscription(user, tier, db)
    await db.commit()
    await db.refresh(user)

    price_label = "¥298/年" if tier == "premium_yearly" else "¥49/月"

    return {
        "subscription_id": f"sub_{uuid.uuid4().hex[:8]}",
        "tier": tier,
        "status": "active",
        "current_period_end": grant_info["expires"],
        "stardust_granted": grant_info["grant_amount"],
        "message": f"订阅成功: {price_label}",
        "user": {
            "is_premium": user.is_premium,
            "subscription_tier": user.subscription_tier,
            "premium_expires_at": user.premium_expires_at.isoformat() if user.premium_expires_at else None,
            "free_event_quota": user.free_event_quota,
            "shop_coupon_balance": user.shop_coupon_balance,
            "stardust_balance": user.stardust_balance,
        },
    }


@router.post("/cancel-subscription")
async def mock_cancel_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """取消订阅 — 当前周期结束后生效，立即停止自动续费"""
    # Refetch user within THIS session to avoid detached-instance issues
    result = await db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if not user.is_premium or user.subscription_tier in ("trial", "founder_lifetime", "cancelled"):
        raise HTTPException(status_code=400, detail="当前没有可取消的有效订阅")

    expires_at = user.premium_expires_at
    # Clear auto-renewal flag (set subscription to non-renewing)
    # The user keeps access until expires_at, then reverts to free
    user.subscription_tier = "cancelled" if user.subscription_tier != "founder_lifetime" else user.subscription_tier
    # Note: We do NOT immediately revoke access — user keeps premium until expires_at

    await db.commit()
    await db.refresh(user)

    return {
        "status": "cancelled",
        "premium_expires_at": expires_at.isoformat() if expires_at else None,
        "message": "订阅已取消，当前付费周期结束后将恢复免费",
    }


# ─── Founder Seats ──────────────────────────────────────────────────────────

FOUNDER_TOTAL_DOMESTIC = 100
FOUNDER_TOTAL_OVERSEAS = 100


class FounderVoteRequest(BaseModel):
    feature_id: str


@router.post("/founder/purchase")
async def create_founder_purchase(
    method: str = Query("personal", description="支付方式: personal|alipay|wechat"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """创建创始席位购买订单 — 支付后调用 /founder/activate 激活"""
    if current_user.is_founder:
        raise HTTPException(status_code=400, detail="您已拥有创始席位")

    price_info = PRODUCT_PRICES["founder_lifetime"]
    amount = price_info["cny"]

    order_no = f"FO{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

    order = Order(
        user_id=current_user.id,
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount,
        payment_method=f"founder_{method}",
        payment_ref=order_no,
        notes=f"item_type:founder_lifetime|reading_id:",
    )
    db.add(order)
    await db.commit()

    return {
        "order_no": order_no,
        "amount": amount,
        "currency": "CNY",
        "message": "创始席位购买订单已创建",
    }


@router.get("/founder/status")
async def get_founder_status(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """获取创始席位状态 — 公开接口，登录用户额外返回个人席位信息"""

    # Count real founder seats — must have seat_no AND activated_at
    # This excludes test/fake founder status that was set without going through activate
    domestic_result = await db.execute(
        select(func.count()).select_from(User).where(
            User.is_founder == True,
            User.founder_region == "domestic",
            User.founder_seat_no.isnot(None),
            User.founder_activated_at.isnot(None),
        )
    )
    domestic_sold = domestic_result.scalar() or 0

    overseas_result = await db.execute(
        select(func.count()).select_from(User).where(
            User.is_founder == True,
            User.founder_region == "overseas",
            User.founder_seat_no.isnot(None),
            User.founder_activated_at.isnot(None),
        )
    )
    overseas_sold = overseas_result.scalar() or 0

    total_seats = FOUNDER_TOTAL_DOMESTIC + FOUNDER_TOTAL_OVERSEAS
    sold_seats = domestic_sold + overseas_sold
    remaining_seats = total_seats - sold_seats

    return {
        "total_seats": total_seats,
        "sold_seats": sold_seats,
        "remaining_seats": remaining_seats,
        "domestic_total": FOUNDER_TOTAL_DOMESTIC,
        "domestic_sold": domestic_sold,
        "overseas_total": FOUNDER_TOTAL_OVERSEAS,
        "overseas_sold": overseas_sold,
        "is_founder": current_user.is_founder if current_user else False,
        "seat_no": current_user.founder_seat_no if current_user else None,
        "seat_region": current_user.founder_region if current_user else None,
    }


@router.get("/founder/seats")
async def list_founder_seats(
    db: AsyncSession = Depends(get_db),
):
    """获取所有已占用的创始席位编号（用于展示席位墙）"""
    result = await db.execute(
        select(User.founder_seat_no, User.founder_region, User.display_name, User.created_at)
        .where(
            User.is_founder == True,
            User.founder_seat_no.isnot(None),
            User.founder_activated_at.isnot(None),
        )
        .order_by(User.founder_seat_no)
    )
    seats = []
    for row in result.all():
        seats.append({
            "seat_no": row[0],
            "region": row[1],
            "name": row[2] or "匿名",
            "activated_at": row[3].isoformat() if row[3] else None,
        })
    return {"seats": seats}


@router.post("/founder/activate")
async def activate_founder_seat(
    order_no: str = Query(..., description="已支付的订单号"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    激活创始席位 — 必须提供已支付的订单号。
    生产环境不再允许无订单激活。
    """
    if current_user.is_founder:
        raise HTTPException(status_code=400, detail="您已拥有创始席位")

    # 必须提供 order_no（生产环境）
    if not settings.DEBUG:
        order_result = await db.execute(
            select(Order).where(
                Order.order_no == order_no,
                Order.user_id == current_user.id,
            )
        )
        order = order_result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="订单不存在")
        if order.status != OrderStatus.paid:
            raise HTTPException(status_code=400, detail="订单尚未支付")
        if order.total_cny < 1288:
            raise HTTPException(status_code=400, detail="订单金额不足，创始席位需支付 ¥1288")

    # Refetch user with lock
    result = await db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    info = await _activate_founder_seat(user, order_no or "mock", db)
    await db.commit()

    return {
        "status": "activated",
        "seat_no": info["seat_no"],
        "region": info["region"],
        "stardust_granted": info["grant_amount"],
        "message": f"恭喜！您已锁定创始席位 #{info['seat_no']}",
    }


@router.post("/founder/vote")
async def vote_feature(
    req: FounderVoteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """创始席位产品路线图投票"""
    if not current_user.is_founder:
        raise HTTPException(status_code=403, detail="仅创始会员可投票")

    # Check if already voted
    existing = await db.execute(
        select(FounderVote).where(
            FounderVote.user_id == current_user.id,
            FounderVote.feature_id == req.feature_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="您已为该功能投过票")

    vote = FounderVote(
        user_id=current_user.id,
        feature_id=req.feature_id,
    )
    db.add(vote)
    await db.commit()

    return {"status": "voted", "feature_id": req.feature_id}
