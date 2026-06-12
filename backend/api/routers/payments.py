"""api/routers/payments.py — 直接对接微信支付/支付宝/PayPal（不使用 Stripe）"""
import uuid
import random
import secrets
import hashlib
import hmac
import time
import json
import base64
import logging
import requests

logger = logging.getLogger(__name__)
from datetime import datetime, timedelta, timezone
from typing import Optional
import defusedxml.ElementTree as ET

from fastapi import APIRouter, Depends, HTTPException, Request, Query, Header
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import (
    Reading, User, Order, OrderItem, EventLog, UserAddress,
    FounderVote, FounderFeedback, CreditTransaction, PaymentStatus, OrderStatus,
)
from api.routers.products import _load_products
from auth.dependencies import get_current_user, require_user
from config import get_settings

router = APIRouter()
settings = get_settings()


# ── Region-to-payment-method validation ──────────────────────────────────────
# Prevents cross-region price abuse: domestic users can only use Alipay/WeChat,
# overseas users can only use PayPal. This is a defense-in-depth measure.
ALLOWED_METHODS = {
    "domestic": {"alipay", "wechat_pay"},
    "overseas": {"paypal"},
}


def get_client_region(request: Request) -> str:
    """
    Get user's region using server-side detection (defense-in-depth).
    Priority: CF-IPCountry header > Accept-Language > client cookie > default overseas.
    """
    import ipaddress

    # 1. Cloudflare's CF-IPCountry header (only trust when CF-Ray present = verified CF request)
    cf_ray = request.headers.get("cf-ray", "")
    cf_country = request.headers.get("cf-ipcountry", "").upper()
    if cf_country and cf_ray:
        # China mainland countries
        if cf_country in ("CN", "HK", "MO", "TW"):
            return "domestic"
        return "overseas"

    # 2. Accept-Language header heuristic
    accept_lang = request.headers.get("accept-language", "")
    if accept_lang.startswith("zh"):
        # Check if it's specifically zh-CN (mainland)
        if "zh-CN" in accept_lang or "zh_CN" in accept_lang:
            return "domestic"
        # Other zh variants (zh-TW, zh-HK) are still domestic for payment
        return "domestic"

    # 3. Client IP geolocation fallback (basic)
    client_ip = request.client.host if request.client else ""
    if client_ip:
        try:
            ip = ipaddress.ip_address(client_ip)
            # Private IPs are likely domestic
            if ip.is_private or ip.is_loopback:
                return "domestic"
        except ValueError:
            pass

    # 4. Fall back to cookie (least reliable, can be forged)
    region = request.cookies.get("region", "overseas")
    return region if region in ("domestic", "overseas") else "overseas"


def validate_payment_region(request: Request, payment_method: str):
    """Validate that the payment method matches the user's detected region.
    Raises HTTP 403 if cross-region payment is attempted.
    """
    region = get_client_region(request)
    allowed = ALLOWED_METHODS.get(region, set())
    if payment_method not in allowed:
        raise HTTPException(
            status_code=403,
            detail=f"Payment method '{payment_method}' is not available for your region ('{region}'). "
                   f"Available methods: {', '.join(allowed)}",
        )


_admin_emails_cached = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]


def _is_effective_founder(user) -> bool:
    """Check if user is effectively a founder (DB flag or admin auto-upgrade)."""
    return user.is_founder or user.email.lower() in _admin_emails_cached

SHOP_COUPON_AMOUNT = 50  # 首次解锁报告赠送代金券
TRIAL_DAYS = 3
EVENT_RETRO_PRICE = 19.9

# ── Server-side price list (clients CANNOT override these) ───────────────────
# Prices in CNY for Alipay/WeChat, USD for PayPal
PREMIUM_MONTHLY_CNY = 59.0
PREMIUM_YEARLY_CNY = 365.0
PREMIUM_MONTHLY_USD = 14.99
PREMIUM_YEARLY_USD = 99.00
UNLOCK_PRICE_CNY = 19.9
UNLOCK_PRICE_USD = 9.9
ONETIME_UNLOCK_CNY = 19.9
ONETIME_UNLOCK_USD = 9.9

# Price map for order validation
PRODUCT_PRICES = {
    "premium_monthly": {"cny": PREMIUM_MONTHLY_CNY, "usd": PREMIUM_MONTHLY_USD},
    "premium_yearly": {"cny": PREMIUM_YEARLY_CNY, "usd": PREMIUM_YEARLY_USD},
    "unlock_report": {"cny": UNLOCK_PRICE_CNY, "usd": UNLOCK_PRICE_USD},
    "founder_lifetime": {"cny": 1688, "usd": 499},
    "onetime_unlock": {"cny": ONETIME_UNLOCK_CNY, "usd": ONETIME_UNLOCK_USD},
}

# ── Stardust constants ──────────────────────────────────────────────────────
GRANT_ON_REPORT_UNLOCK = 50   # 解锁报告奖励星尘
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
        # Double-check seat uniqueness to prevent TOCTOU race
        existing = await db.execute(
            select(User).where(User.founder_region == "domestic", User.founder_seat_no == seat_no)
        )
        if existing.scalar_one_or_none():
            seat_no = domestic_count + 2  # Fallback to next seat
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
        existing = await db.execute(
            select(User).where(User.founder_region == "overseas", User.founder_seat_no == seat_no)
        )
        if existing.scalar_one_or_none():
            seat_no = FOUNDER_TOTAL_DOMESTIC + overseas_count + 2

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


async def _activate_onetime_unlock(user: User, reading_id: str, db: AsyncSession) -> dict:
    """
    激活一次性解锁 — 解锁指定报告 + 赠送 20 商城代金券 + 赠送 50 星尘（追问用）。
    每个账户限一次。回调场景幂等：已激活则返回空结果，不抛异常。
    """
    # 检查是否已使用过
    existing = await db.execute(
        select(Order).where(
            Order.user_id == user.id,
            Order.item_type == "onetime_unlock",
            Order.status == OrderStatus.paid,
        )
    )
    if existing.first():
        return {"coupon_granted": 0, "stardust_granted": 0, "reading_id": reading_id, "already_activated": True}

    coupon_amount = 20
    stardust_amount = 50

    # 赠送商城代金券
    user.shop_coupon_balance = (user.shop_coupon_balance or 0) + coupon_amount

    # 赠送星尘（可用于追问，每轮 10 星尘 = 5 次追问）
    user.stardust_balance += stardust_amount
    user.stardust_lifetime_earned += stardust_amount

    # 记录星尘流水
    tx = CreditTransaction(
        user_id=user.id,
        amount=stardust_amount,
        balance_after=user.stardust_balance,
        reason="onetime_unlock_grant",
        reference_id=reading_id,
        status="confirmed",
    )
    db.add(tx)

    return {
        "coupon_granted": coupon_amount,
        "stardust_granted": stardust_amount,
        "reading_id": reading_id,
    }


async def _handle_onetime_unlock_activation(user, order, db) -> dict:
    """
    一次性解锁统一激活入口 — 解锁报告 + 赠送代金券/星尘。
    供 WeChat/Alipay/PayPal/管理端等多处调用，消除重复代码。
    """
    notes = order.notes or ""
    reading_id = notes.split("reading_id:")[1].split("|")[0] if "reading_id:" in notes else ""
    if reading_id:
        reading_result = await db.execute(select(Reading).where(Reading.id == reading_id))
        reading = reading_result.scalar_one_or_none()
        if reading and not reading.is_detail_unlocked:
            reading.is_detail_unlocked = True
            reading.payment_status = PaymentStatus.paid
            reading.stripe_payment_intent = "paid_" + reading_id[:8]
    return await _activate_onetime_unlock(user, reading_id or order.order_no, db)

@router.get("/payment-methods")
async def get_payment_methods():
    """返回可用的支付方式列表 — 个人收款码不需要官方 API 开启"""
    methods = []

    # 支付宝：有个人收款码即可（不需要官方 ALIPAY_ENABLED）
    if settings.ALIPAY_PERSONAL_QR_URL or settings.ALIPAY_ENABLED:
        methods.append({
            "id": "alipay",
            "name": "支付宝",
            "name_en": "Alipay",
            "icon": "alipay",
            "category": "china",
            "enabled": True,
        })

    # 微信支付：有个人收款码即可（不需要官方 WECHAT_PAY_ENABLED）
    if settings.WECHAT_PERSONAL_QR_URL or settings.WECHAT_PAY_ENABLED:
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
        methods.append({
            "id": "credit_card",
            "name": "信用卡",
            "name_en": "Credit Card",
            "icon": "credit-card",
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
    # Input validation — prevent SSRF / parameter injection
    import re
    if not re.match(r'^[A-Za-z0-9_\-]+$', client_id):
        raise HTTPException(status_code=400, detail="Invalid client_id")
    if currency not in ("USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CNY", "HKD"):
        raise HTTPException(status_code=400, detail="Invalid currency")
    if intent not in ("capture", "authorize"):
        raise HTTPException(status_code=400, detail="Invalid intent")
    if components not in ("buttons",):
        raise HTTPException(status_code=400, detail="Invalid components")

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
            "spbill_create_ip": "127.0.0.1",  # TODO: Use actual client IP from request.headers.get("x-real-ip") or request.client.host
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
    # Region validation: WeChat is domestic-only
    validate_payment_region(request, "wechat_pay")
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

    # 查找订单并验证金额（行锁防止并发回调双重激活）
    order_result = await db.execute(select(Order).where(Order.order_no == order_no).with_for_update())
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
            # 使用 order.item_type 字段（向后兼容 notes 解析）
            item_type = order.item_type or ""
            if not item_type and order.notes and "item_type:" in order.notes:
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
            elif user and item_type == "onetime_unlock":
                grant_info = await _handle_onetime_unlock_activation(user, order, db)
                if not grant_info.get("already_activated"):
                    logger.info(f"[WECHAT-NOTIFY] 激活一次性解锁: 用户 {user.id}, 代金券 +{grant_info.get('coupon_granted', 0)}, 星尘 +{grant_info.get('stardust_granted', 0)}")

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
    request: Request,
    item_type: str = Query("unlock_report", description="商品类型"),
    reading_id: str = Query(None, description="报告 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """创建支付宝订单 — 金额由服务端决定"""
    # Region validation: Alipay is domestic-only
    validate_payment_region(request, "alipay")
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
        "onetime_unlock": "AlphaMirror AI算力单次服务",
    }
    alipay_subject = subject_map.get(item_type, "AlphaMirror AI算力服务")

    order_no = f"ALI{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"

    order = Order(
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount,
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

    # 查找订单并验证金额（行锁防止并发回调双重激活）
    order_result = await db.execute(select(Order).where(Order.order_no == order_no).with_for_update())
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
            # 使用 order.item_type 字段（向后兼容 notes 解析）
            item_type = order.item_type or ""
            if not item_type and order.notes and "item_type:" in order.notes:
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
            elif user and item_type == "onetime_unlock":
                grant_info = await _handle_onetime_unlock_activation(user, order, db)
                if not grant_info.get("already_activated"):
                    logger.info(f"[ALIPAY-NOTIFY] 激活一次性解锁: 用户 {user.id}")

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
        result = response.json()
        token = result.get("access_token", "")
        if not token:
            logger.error(f"[PAYPAL] 获取 access_token 失败: status={response.status_code}, response={result}")
        return token

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
    # Region validation: PayPal is overseas-only
    validate_payment_region(request, "paypal")
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


@router.post("/paypal/create-shop-order")
async def create_shop_paypal_order(
    request: Request,
    order_no: str = Query(..., description="商城订单号"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """为已有商城订单创建 PayPal 支付 — 海外用户使用"""
    validate_payment_region(request, "paypal")
    if not settings.PAYPAL_ENABLED:
        raise HTTPException(status_code=400, detail="PayPal 未启用")

    # 查找并验证订单 (eagerly load items to avoid MissingGreenlet in async)
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(
            Order.order_no == order_no,
            Order.user_id == current_user.id,
            Order.status == OrderStatus.pending,
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在或已处理")

    # Products have independent price_usd — look up from products.json instead of CNY→USD conversion
    all_products = _load_products("zh")
    product_map = {p["id"]: p for p in all_products}
    amount_usd = 0.0
    for oi in (order.items or []):
        prod = product_map.get(oi.product_name, {})
        if not prod:
            for p in all_products:
                if p.get("name") == oi.product_name:
                    prod = p
                    break
        price_usd = prod.get("price_usd", 0)
        amount_usd += price_usd * oi.quantity
    amount_usd = round(amount_usd, 2)
    if amount_usd < 0.01:
        raise HTTPException(status_code=400, detail="订单金额异常")

    paypal = PayPalPay()
    result = await paypal.create_order(
        order_no, amount_usd, "AlphaMirror AI Shop Order", custom_id=current_user.id
    )

    # 更新订单支付方式
    order.payment_method = "paypal"
    await db.commit()

    return {
        "order_no": order_no,
        "paypal_order_id": result["order_id"],
        "approve_url": result["approve_url"],
        "total_amount": amount_usd,
        "currency": "USD",
    }


@router.get("/paypal/checkout-url")
async def paypal_checkout_url(
    item_type: str = Query("unlock_report"),
    reading_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """Server-side PayPal checkout: create order and return approve URL.

    Used for mainland China where the PayPal JS SDK cannot reach paypal.com.
    The user is redirected to PayPal's hosted checkout page.
    """
    if not settings.PAYPAL_ENABLED:
        raise HTTPException(status_code=400, detail="PayPal 未启用")

    price_info = PRODUCT_PRICES.get(item_type)
    if not price_info or "usd" not in price_info:
        raise HTTPException(status_code=400, detail="无效的商品类型")
    amount_usd = price_info["usd"]
    amount_cny = price_info["cny"]

    subject_map = {
        "premium_monthly": "AlphaMirror AI Computing Monthly",
        "premium_yearly": "AlphaMirror AI Computing Yearly",
        "unlock_report": "AlphaMirror AI Computing Service",
        "founder_lifetime": "AlphaMirror AI Computing Lifetime",
    }
    paypal_description = subject_map.get(item_type, "AlphaMirror AI Computing Service")

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
    # Override return/cancel URLs to include order_no for callback identification
    base = "https://khanfate.com"
    result = await paypal.create_order(order_no, amount_usd, paypal_description, custom_id=current_user.id)

    # Build URLs with order_no embedded
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
    """PayPal redirect callback after user approves payment.

    Captures the order and activates the subscription/unlock.
    Redirects user to a success page.
    """
    from fastapi.responses import RedirectResponse

    if not token:
        return RedirectResponse("https://khanfate.com/payment?error=no_token")

    paypal = PayPalPay()
    access_token = paypal._get_access_token()

    # Capture the order
    response = requests.post(
        f"{paypal.base_url}/v2/checkout/orders/{token}/capture",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        timeout=10,
    )
    result = response.json()

    if result.get("status") == "COMPLETED":
        # Activate subscription/unlock
        order_result = await db.execute(
            select(Order).where(Order.order_no == order_no).with_for_update()
        )
        order = order_result.scalar_one_or_none()
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
                    await _activate_subscription(user, item_type, db)
                    logger.info(f"[PAYPAL-RETURN] 激活订阅: 用户 {user.id}, {item_type}")
                elif user and item_type == "founder_lifetime":
                    await _activate_founder_seat(user, order_no, db)
                    logger.info(f"[PAYPAL-RETURN] 激活创始席位: 用户 {user.id}")
                elif user and item_type == "onetime_unlock":
                    grant_info = await _handle_onetime_unlock_activation(user, order, db)
                    if not grant_info.get("already_activated"):
                        logger.info(f"[PAYPAL-RETURN] 激活一次性解锁: 用户 {user.id}")

            await db.commit()

        return RedirectResponse("https://khanfate.com/payment?paypal=success")
    else:
        logger.error(f"[PAYPAL-RETURN] 捕获失败: {order_no}, {result}")
        return RedirectResponse("https://khanfate.com/payment?paypal=failed")


@router.get("/paypal/cancel/{order_no}")
async def paypal_cancel(order_no: str):
    """PayPal redirect when user cancels payment."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse("https://khanfate.com/payment?paypal=cancelled")


@router.post("/paypal/capture")
async def capture_paypal_order(
    paypal_order_id: str = Query(..., description="PayPal 订单 ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """捕获 PayPal 支付（用户支付完成后调用）— 需要登录"""
    paypal = PayPalPay()
    access_token = paypal._get_access_token()
    logger.info(f"[PAYPAL-CAPTURE] order_id={paypal_order_id}, has_token={bool(access_token)}, base_url={paypal.base_url}, user={current_user.id}")

    response = requests.post(
        f"{paypal.base_url}/v2/checkout/orders/{paypal_order_id}/capture",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        timeout=10,
    )

    result = response.json()
    logger.info(f"[PAYPAL-CAPTURE] order_id={paypal_order_id}, status={response.status_code}, result={result}")
    if result.get("status") == "COMPLETED":
        purchase_units = result.get("purchase_units", [])
        order_no = purchase_units[0].get("reference_id", "") if purchase_units else ""
        if order_no:
            order_result = await db.execute(
                select(Order).where(Order.order_no == order_no).with_for_update()
            )
            order = order_result.scalar_one_or_none()
            if order:
                # Extract captured amount from payments.captures (correct PayPal v2 path)
                captured_amount = 0.0
                if purchase_units:
                    captures = purchase_units[0].get("payments", {}).get("captures", [])
                    if captures:
                        captured_amount = float(captures[0].get("amount", {}).get("value", 0))
                    else:
                        # Fallback: some responses put amount directly on purchase_unit
                        captured_amount = float(purchase_units[0].get("amount", {}).get("value", 0))
                # Amount validation — shop orders use product's independent price_usd, others use PRODUCT_PRICES
                is_shop_order = (order.item_type == "shop")
                if is_shop_order:
                    # Products have independent price_usd — calculate expected from order items
                    all_products = _load_products("zh")
                    product_map = {p["id"]: p for p in all_products}
                    expected_usd = 0.0
                    for oi in (order.items or []):
                        prod = product_map.get(oi.product_name, {})
                        # Try matching by product_name first, then by product_id
                        if not prod:
                            for p in all_products:
                                if p.get("name") == oi.product_name:
                                    prod = p
                                    break
                        price_usd = prod.get("price_usd", 0)
                        expected_usd += price_usd * oi.quantity
                    # Apply coupon proportionally in USD
                    if order.total_cny and expected_usd > 0:
                        coupon_ratio = 1 - (float(order.total_cny) / (sum(
                            product_map.get(oi.product_name, {}).get("price_cny", 0) * oi.quantity
                            for oi in (order.items or [])
                        ) or 1))
                        expected_usd = round(expected_usd * (1 - coupon_ratio), 2)
                    logger.info(f"[PAYPAL-CAPTURE] 商城订单金额验证: captured={captured_amount}, expected_usd={expected_usd}, order.total_cny={order.total_cny}")
                    # Allow 5% tolerance for rounding differences between independent CNY/USD pricing
                    if expected_usd > 0 and abs(captured_amount - expected_usd) / expected_usd > 0.05:
                        detail_msg = f"支付金额不匹配: 实际${captured_amount}, 预期${expected_usd}"
                        logger.error(f"[PAYPAL-CAPTURE] {detail_msg}")
                        raise HTTPException(status_code=400, detail=detail_msg)
                else:
                    expected_usd = None
                    matched_item_type = None
                    order_total_cny = float(order.total_cny)
                    for _item_type, prices in PRODUCT_PRICES.items():
                        if "usd" in prices and "cny" in prices:
                            if abs(prices["cny"] - order_total_cny) < 0.01:
                                expected_usd = prices["usd"]
                                matched_item_type = _item_type
                                break
                    logger.info(f"[PAYPAL-CAPTURE] 金额验证: captured={captured_amount}, expected_usd={expected_usd}, matched_item={matched_item_type}, order.total_cny={order_total_cny}, order.order_no={order_no}")
                    if expected_usd is not None and abs(captured_amount - expected_usd) > 0.01:
                        detail_msg = f"支付金额不匹配: 实际${captured_amount}, 预期${expected_usd} ({matched_item_type})"
                        logger.error(f"[PAYPAL-CAPTURE] {detail_msg}")
                        raise HTTPException(status_code=400, detail=detail_msg)
                    if expected_usd is None:
                        logger.warning(f"[PAYPAL-CAPTURE] 未找到匹配的价格配置, order.total_cny={order.total_cny}")

                # 如果订单尚未被 webhook 标记为 paid，激活对应权益
                already_paid = order.status == OrderStatus.paid
                order.status = OrderStatus.paid
                order.paid_at = datetime.now(timezone.utc)

                if not already_paid and order.user_id:
                    # 使用 order.item_type 字段（向后兼容 notes 解析）
                    item_type = order.item_type or ""
                    if not item_type and order.notes and "item_type:" in order.notes:
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
                    elif user and item_type == "onetime_unlock":
                        grant_info = await _handle_onetime_unlock_activation(user, order, db)
                        if not grant_info.get("already_activated"):
                            logger.info(f"[PAYPAL-CAPTURE] 激活一次性解锁: 用户 {user.id}")

                await db.commit()

        return {"status": "completed", "message": "支付成功"}
    else:
        error_msg = result.get("message", "未知错误")
        logger.error(f"[PAYPAL-CAPTURE] 捕获失败: order_id={paypal_order_id}, status={result.get('status')}, error={error_msg}, full={result}")
        logger.error(f"[PAYPAL] Capture failed: {error_msg}")
        raise HTTPException(status_code=400, detail="PayPal 支付捕获失败，请稍后重试")


# ─── Report Unlock ───────────────────────────────────────────────────────────

@router.post("/unlock/{reading_id}")
async def unlock_report(
    reading_id: str,
    source: str = Query("payment", description="payment 或 stardust"),
    tier: str = Query("full", description="detailed(精读/30星尘) 或 full(全维/100星尘)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    解锁报告 — 支持两档解锁：
    - tier=detailed (精读): 30 星尘，解锁 master_detail（深度分析文本）
    - tier=full (全维): 100 星尘，解锁 master_detail + 所有工人报告
    source=payment: 验证已支付订单。
    source=stardust: 原子操作——检查余额→扣减星尘→解锁报告。
    """
    logger.info(f"[UNLOCK] reading_id={reading_id}, source={source}, tier={tier}, user={current_user.id}")
    # 1. 查找报告
    reading_result = await db.execute(select(Reading).where(Reading.id == reading_id))
    reading = reading_result.scalar_one_or_none()
    if not reading:
        raise HTTPException(status_code=404, detail="报告不存在")

    # 1.5 验证报告归属（只能解锁自己的报告）
    if reading.user_id and str(reading.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="无权操作此报告")

    # 2. 检查是否已解锁（目标档位或更高）
    if tier == "detailed" and getattr(reading, "is_detailed_unlocked", False):
        return {
            "unlocked": True,
            "tier": "detailed",
            "reading_id": reading_id,
            "message": "精读已解锁，无需重复支付",
        }
    if tier == "full" and reading.is_detail_unlocked:
        return {
            "unlocked": True,
            "tier": "full",
            "reading_id": reading_id,
            "message": "全维已解锁，无需重复支付",
        }
    # 升级场景：精读→全维，只需要补差价
    if tier == "full" and getattr(reading, "is_detailed_unlocked", False):
        tier = "upgrade"  # 标记为升级，只扣 70 星尘

    # 3. 星尘解锁 — 原子操作
    if source == "stardust":
        # 根据 tier 确定扣费
        TIER_COSTS = {
            "detailed": 30,   # 精读
            "full": 100,      # 全维
            "upgrade": 70,    # 精读→全维 补差价
        }
        if tier not in TIER_COSTS:
            raise HTTPException(status_code=400, detail=f"无效的解锁档位: {tier}")
        stardust_cost = TIER_COSTS[tier]

        # 幂等检查：是否已有此报告的同档位星尘扣减记录
        reason_key = "report_detailed" if tier == "detailed" else "report_unlock"
        existing_tx = await db.execute(
            select(CreditTransaction).where(
                CreditTransaction.user_id == current_user.id,
                CreditTransaction.reference_id == reading_id,
                CreditTransaction.reason == reason_key,
            )
        )
        existing_tx = existing_tx.scalar_one_or_none()

        if existing_tx:
            # 已有扣减记录 → 直接解锁（幂等）
            if tier == "detailed":
                reading.is_detailed_unlocked = True
            else:
                reading.is_detail_unlocked = True
            await db.commit()
            return {
                "unlocked": True,
                "tier": tier if tier != "upgrade" else "full",
                "reading_id": reading_id,
                "stardust_deducted": 0,
            }

        # 新扣减
        user_result = await db.execute(
            select(User).where(User.id == current_user.id).with_for_update()
        )
        user = user_result.scalar_one()
        logger.info(f"[UNLOCK] stardust check: balance={user.stardust_balance}, cost={stardust_cost}, tier={tier}")
        if user.stardust_balance < stardust_cost:
            raise HTTPException(
                status_code=402,
                detail=f"星尘不足：需要 {stardust_cost}，当前 {user.stardust_balance}",
            )
        user.stardust_balance -= stardust_cost
        # 记录扣减流水
        tx = CreditTransaction(
            user_id=user.id,
            amount=-stardust_cost,
            balance_after=user.stardust_balance,
            reason=reason_key,
            reference_id=reading_id,
            status="confirmed",
        )
        db.add(tx)

        # 解锁报告
        if tier == "detailed":
            reading.is_detailed_unlocked = True
            await db.commit()
            return {
                "unlocked": True,
                "tier": "detailed",
                "reading_id": reading_id,
                "stardust_deducted": stardust_cost,
                "balance_after": user.stardust_balance,
            }
        else:
            # full 或 upgrade → 调用 _unlock_reading 设置 is_detail_unlocked
            await db.flush()
            unlock_result = await _unlock_reading(reading_id, db, skip_stardust_grant=True)
            return {**unlock_result, "tier": "full", "stardust_deducted": stardust_cost, "balance_after": user.stardust_balance}

    # 4. 支付宝/微信/PayPal 解锁 — 验证已支付订单
    paid_order = await db.execute(
        select(Order).where(
            Order.notes.contains(f"reading_id:{reading_id}"),
            Order.status == OrderStatus.paid,
            Order.user_id == current_user.id,
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
    current_user: User = Depends(require_user),
):
    """支付事件复盘：订阅用户免费额度 → 星尘(30) → ¥19.9/次"""
    event_result = await db.execute(select(EventLog).where(EventLog.id == req.event_id))
    event = event_result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="事件不存在")

    # Verify event belongs to current user
    if hasattr(event, "user_id") and event.user_id and event.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作此事件")

    if getattr(event, "is_paid", False):
        return {"paid": True, "event_id": req.event_id, "charge": 0, "message": "已支付"}

    charge = 0.0
    used_free = False
    stardust_deducted = 0

    # Refetch user within this session
    result = await db.execute(select(User).where(User.id == current_user.id).with_for_update())
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
    # Products are stored in JSON, not in database — load from JSON file
    all_products = _load_products("zh")
    product_map = {p["id"]: p for p in all_products}

    server_total = 0.0
    validated_items = []
    for item in req.items:
        if item.product_id:
            prod = product_map.get(item.product_id)
            if not prod:
                raise HTTPException(status_code=400, detail=f"商品不存在: {item.product_id}")
            # Use server-side price, ignore client price
            server_price = prod["price_cny"]
            server_total += server_price * item.quantity
            validated_items.append({
                "product_id": item.product_id,
                "product_name": prod["name"],
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
        balance = float(user.shop_coupon_balance or 0)
        if balance <= 0:
            raise HTTPException(status_code=400, detail="没有可用的代金券余额")
        coupon_used = float(min(balance, final_total))
        user.shop_coupon_balance = float(balance) - coupon_used
        final_total = round(final_total - coupon_used, 2)

    order_no = f"ORD{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"

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
        item_type="shop",
        recipient_name=recipient_name,
        recipient_phone=recipient_phone,
        shipping_address=shipping_address,
        notes=req.notes,
    )
    db.add(order)
    await db.flush()

    for item in validated_items:
        # product_id FK points to products table which is empty (products live in JSON).
        # Store None to avoid foreign key constraint violation; product_name has the info.
        oi = OrderItem(
            order_id=order.id,
            product_id=None,
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
    current_user: User = Depends(require_user),
):
    """查询物流信息 — 需要登录，只能查看自己的订单"""

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

    price_label = f"¥{int(PREMIUM_YEARLY_CNY)}/年" if tier == "premium_yearly" else f"¥{int(PREMIUM_MONTHLY_CNY)}/月"

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


class FounderFeedbackRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


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

    order_no = f"FO{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{secrets.randbelow(90000) + 10000}"

    order = Order(
        user_id=current_user.id,
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount,
        payment_method=f"founder_{method}",
        payment_ref=order_no,
        item_type="founder_lifetime",
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
        if order.total_cny < 1688:
            raise HTTPException(status_code=400, detail="订单金额不足，创始席位需支付 ¥1688")

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
    if not _is_effective_founder(current_user):
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


@router.post("/founder/feedback")
async def submit_founder_feedback(
    req: FounderFeedbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """创始席位用户反馈"""
    if not _is_effective_founder(current_user):
        raise HTTPException(status_code=403, detail="仅创始会员可提交反馈")

    if not req.content or not req.content.strip():
        raise HTTPException(status_code=400, detail="反馈内容不能为空")

    # Rate limit: max 5 feedback per hour
    recent = await db.execute(
        select(func.count()).select_from(FounderFeedback).where(
            FounderFeedback.user_id == current_user.id,
            FounderFeedback.created_at > datetime.now(timezone.utc) - timedelta(hours=1),
        )
    )
    if (recent.scalar() or 0) >= 5:
        raise HTTPException(status_code=429, detail="反馈过于频繁，请稍后再试")

    feedback = FounderFeedback(
        user_id=current_user.id,
        content=req.content.strip()[:2000],
    )
    db.add(feedback)
    await db.commit()


# ─── Admin: Dashboard Stats ──────────────────────────────────────────────────

@router.get("/admin/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """管理员仪表盘统计 — 用户数、订单数、收入等"""
    _require_admin_auth(authorization, x_admin_key)

    from sqlalchemy import func as sqlfunc

    # Total users
    total_users = (await db.execute(select(sqlfunc.count(User.id)))).scalar() or 0

    # Paid users (is_premium or is_founder)
    paid_users = (await db.execute(
        select(sqlfunc.count(User.id)).where(User.is_premium == True)
    )).scalar() or 0
    founder_users = (await db.execute(
        select(sqlfunc.count(User.id)).where(User.is_founder == True)
    )).scalar() or 0

    # Total readings
    total_readings = (await db.execute(select(sqlfunc.count(Reading.id)))).scalar() or 0

    # Orders
    total_orders = (await db.execute(
        select(sqlfunc.count(Order.id)).where(Order.item_type == "shop")
    )).scalar() or 0

    # Revenue
    revenue_result = await db.execute(
        select(sqlfunc.sum(Order.total_cny)).where(
            Order.status == OrderStatus.paid,
            Order.item_type == "shop",
        )
    )
    total_revenue = float(revenue_result.scalar() or 0)

    # Recent users (last 20)
    recent_users_result = await db.execute(
        select(User).order_by(User.created_at.desc()).limit(20)
    )
    recent_users = [
        {"email": u.email, "nickname": u.display_name, "created_at": u.created_at.isoformat() if u.created_at else None}
        for u in recent_users_result.scalars().all()
    ]

    # Recent orders (last 10)
    recent_orders_result = await db.execute(
        select(Order).where(Order.item_type == "shop").order_by(Order.created_at.desc()).limit(10)
    )
    recent_orders = [
        {
            "id": o.id, "order_no": o.order_no, "total_cny": float(o.total_cny) if o.total_cny else 0,
            "status": o.status.value if o.status else "pending",
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in recent_orders_result.scalars().all()
    ]

    return {
        "totalUsers": total_users,
        "totalReadings": total_readings,
        "totalOrders": total_orders,
        "paidUsers": paid_users,
        "founderUsers": founder_users,
        "totalRevenue": total_revenue,
        "recentUsers": recent_users,
        "recentOrders": recent_orders,
    }


# ─── Admin: Shop Order Management ────────────────────────────────────────────

class AdminOrderStatusUpdate(BaseModel):
    status: str  # paid, shipped, delivered, cancelled
    tracking_number: Optional[str] = None


def _require_admin_auth(
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """验证管理员权限 — 支持 CRON_SECRET (Bearer) 或 x-admin-key"""
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")
    # Try Bearer token first
    if authorization:
        token = authorization.replace("Bearer ", "")
        if hmac.compare_digest(token, settings.CRON_SECRET):
            return
    # Try x-admin-key header (frontend admin panel)
    if x_admin_key and hmac.compare_digest(x_admin_key, settings.CRON_SECRET):
        return
    raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("/admin/shop-orders")
async def list_shop_orders(
    status: Optional[str] = Query(None, description="按状态筛选"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """管理员查看所有商城订单"""
    _require_admin_auth(authorization, x_admin_key)

    from sqlalchemy.orm import joinedload

    query = (
        select(Order)
        .where(Order.item_type == "shop")
        .options(joinedload(Order.items), joinedload(Order.user))
    )
    if status:
        query = query.where(Order.status == status)
    query = query.order_by(Order.created_at.desc())

    # Count total
    count_result = await db.execute(
        select(func.count()).select_from(
            select(Order.id).where(Order.item_type == "shop").subquery()
        )
    )
    total = count_result.scalar() or 0

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.unique().scalars().all()

    order_list = []
    for order in orders:
        user_info = None
        if order.user:
            user_info = {"id": order.user.id, "nickname": order.user.display_name, "email": order.user.email}

        order_list.append({
            "order_no": order.order_no,
            "status": order.status.value if order.status else "pending",
            "total_cny": float(order.total_cny) if order.total_cny else 0,
            "payment_method": order.payment_method,
            "recipient_name": order.recipient_name,
            "recipient_phone": order.recipient_phone,
            "shipping_address": order.shipping_address,
            "tracking_number": order.tracking_number,
            "notes": order.notes,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "paid_at": order.paid_at.isoformat() if order.paid_at else None,
            "refund_reason": order.refund_reason,
            "refund_amount": float(order.refund_amount) if order.refund_amount else None,
            "refund_note": order.refund_note,
            "refund_requested_at": order.refund_requested_at.isoformat() if order.refund_requested_at else None,
            "refund_processed_at": order.refund_processed_at.isoformat() if order.refund_processed_at else None,
            "cj_order_number": order.cj_order_number,
            "cj_order_status": order.cj_order_status,
            "cj_shipping_cost": float(order.cj_shipping_cost) if order.cj_shipping_cost else None,
            "fulfilled_via": order.fulfilled_via,
            "user": user_info,
            "items": [
                {
                    "product_name": item.product_name,
                    "quantity": item.quantity,
                    "unit_price_cny": float(item.unit_price_cny) if item.unit_price_cny else 0,
                    "subtotal_cny": float(item.subtotal_cny) if item.subtotal_cny else 0,
                }
                for item in order.items
            ],
        })

    return {
        "orders": order_list,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/admin/shop-orders/{order_no}")
async def get_shop_order_detail(
    order_no: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """管理员查看订单详情"""
    _require_admin_auth(authorization, x_admin_key)

    from sqlalchemy.orm import joinedload

    result = await db.execute(
        select(Order)
        .where(Order.order_no == order_no, Order.item_type == "shop")
        .options(joinedload(Order.items), joinedload(Order.user))
    )
    order = result.unique().scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")

    user_info = None
    if order.user:
        user_info = {"id": order.user.id, "nickname": order.user.display_name, "email": order.user.email}

    return {
        "order_no": order.order_no,
        "status": order.status.value if order.status else "pending",
        "total_cny": float(order.total_cny) if order.total_cny else 0,
        "payment_method": order.payment_method,
        "recipient_name": order.recipient_name,
        "recipient_phone": order.recipient_phone,
        "shipping_address": order.shipping_address,
        "tracking_number": order.tracking_number,
        "notes": order.notes,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        "refund_reason": order.refund_reason,
        "refund_amount": float(order.refund_amount) if order.refund_amount else None,
        "refund_note": order.refund_note,
        "refund_requested_at": order.refund_requested_at.isoformat() if order.refund_requested_at else None,
        "refund_processed_at": order.refund_processed_at.isoformat() if order.refund_processed_at else None,
        "cj_order_number": order.cj_order_number,
        "cj_order_status": order.cj_order_status,
        "cj_shipping_cost": float(order.cj_shipping_cost) if order.cj_shipping_cost else None,
        "fulfilled_via": order.fulfilled_via,
        "user": user_info,
        "items": [
            {
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price_cny": float(item.unit_price_cny) if item.unit_price_cny else 0,
                "subtotal_cny": float(item.subtotal_cny) if item.subtotal_cny else 0,
            }
            for item in order.items
        ],
    }


@router.put("/admin/shop-orders/{order_no}/status")
async def update_shop_order_status(
    order_no: str,
    payload: AdminOrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """管理员更新商城订单状态"""
    _require_admin_auth(authorization, x_admin_key)

    valid_statuses = {"pending", "processing", "paid", "shipped", "delivered", "cancelled"}
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"无效状态，可选: {', '.join(valid_statuses)}")

    # State machine: define legal transitions
    LEGAL_TRANSITIONS = {
        "pending": {"processing", "paid", "cancelled"},
        "processing": {"paid", "cancelled"},
        "paid": {"shipped", "cancelled"},
        "shipped": {"delivered"},
        "delivered": set(),
        "cancelled": set(),
    }

    result = await db.execute(
        select(Order).where(Order.order_no == order_no, Order.item_type == "shop")
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")

    old_status = order.status.value if order.status else "pending"

    # Validate state transition
    allowed = LEGAL_TRANSITIONS.get(old_status, set())
    if payload.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"不允许从 {old_status} 转换到 {payload.status}，允许: {', '.join(allowed) or '无'}"
        )

    order.status = OrderStatus(payload.status)
    if payload.tracking_number is not None:
        order.tracking_number = payload.tracking_number
    if payload.status == "paid" and not order.paid_at:
        order.paid_at = datetime.now(timezone.utc)

    # Audit log
    logger.info(f"[ADMIN] Order {order_no} status: {old_status} → {payload.status}")

    await db.commit()

    return {
        "success": True,
        "order_no": order.order_no,
        "status": order.status.value,
        "tracking_number": order.tracking_number,
    }


# ── 退款审批端点 ─────────────────────────────────────────────────────────────

class ApproveRefundRequest(BaseModel):
    refund_amount: Optional[float] = None  # None = 全额退款
    refund_note: Optional[str] = None


class RejectRefundRequest(BaseModel):
    reason: str  # 拒绝原因（必填）


@router.post("/admin/shop-orders/{order_no}/approve-refund")
async def approve_refund(
    order_no: str,
    req: ApproveRefundRequest,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """管理员批准退款"""
    _require_admin_auth(authorization, x_admin_key)

    result = await db.execute(
        select(Order).where(Order.order_no == order_no, Order.item_type == "shop")
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status != OrderStatus.pending_refund:
        raise HTTPException(status_code=400, detail="该订单不在退款审核状态")

    # 退款金额：默认全额
    refund_amount = req.refund_amount if req.refund_amount is not None else float(order.total_cny)
    if refund_amount <= 0 or refund_amount > float(order.total_cny):
        raise HTTPException(status_code=400, detail=f"退款金额必须在 0.01-{float(order.total_cny)} 之间")

    order.status = OrderStatus.refunded
    order.refund_amount = refund_amount
    order.refund_note = req.refund_note
    order.refund_processed_at = datetime.now(timezone.utc)

    logger.info(f"[ADMIN] Order {order_no} refund APPROVED: ¥{refund_amount}")

    await db.commit()

    # 邮件通知用户
    if order.user_id:
        try:
            user_result = await db.execute(select(User).where(User.id == order.user_id))
            user = user_result.scalar_one_or_none()
            if user and user.email:
                import asyncio
                from utils.email import send_refund_approved_notification
                await asyncio.to_thread(
                    send_refund_approved_notification,
                    to_email=user.email,
                    order_no=order.order_no,
                    refund_amount=refund_amount,
                )
        except Exception as e:
            logger.warning(f"[REFUND] Failed to notify user of approval: {e}")

    return {
        "success": True,
        "order_no": order.order_no,
        "status": "refunded",
        "refund_amount": refund_amount,
    }


@router.post("/admin/shop-orders/{order_no}/reject-refund")
async def reject_refund(
    order_no: str,
    req: RejectRefundRequest,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """管理员拒绝退款"""
    _require_admin_auth(authorization, x_admin_key)

    if not req.reason or not req.reason.strip():
        raise HTTPException(status_code=400, detail="请填写拒绝原因")

    result = await db.execute(
        select(Order).where(Order.order_no == order_no, Order.item_type == "shop")
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status != OrderStatus.pending_refund:
        raise HTTPException(status_code=400, detail="该订单不在退款审核状态")

    # 恢复原状态：如果之前有 paid_at，恢复为 paid；否则恢复为 pending
    order.status = OrderStatus.paid if order.paid_at else OrderStatus.pending
    reject_note = f"[退款拒绝] {req.reason.strip()}"
    order.notes = f"{order.notes}\n{reject_note}".strip() if order.notes else reject_note
    # 清除退款相关字段
    order.refund_reason = None
    order.refund_requested_at = None

    logger.info(f"[ADMIN] Order {order_no} refund REJECTED: {req.reason.strip()}")

    await db.commit()

    # 邮件通知用户
    if order.user_id:
        try:
            user_result = await db.execute(select(User).where(User.id == order.user_id))
            user = user_result.scalar_one_or_none()
            if user and user.email:
                import asyncio
                from utils.email import send_refund_rejected_notification
                await asyncio.to_thread(
                    send_refund_rejected_notification,
                    to_email=user.email,
                    order_no=order.order_no,
                    reject_reason=req.reason.strip(),
                )
        except Exception as e:
            logger.warning(f"[REFUND] Failed to notify user of rejection: {e}")

    return {
        "success": True,
        "order_no": order.order_no,
        "status": order.status.value,
    }


# ── Shop Order QR Payment (personal collection codes) ──────────────────────

@router.post("/shop-orders/{order_no}/confirm-qr-payment")
async def confirm_shop_qr_payment(
    order_no: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    用户通过微信/支付宝个人收款码付款后，点击"我已付款"。
    生成 admin_confirm_token 并发送确认邮件给管理员，管理员核实收款后点击确认链接。
    """
    import secrets as _secrets
    from utils.email import send_admin_payment_confirm_email

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

    # Generate admin confirmation token (valid for 24 hours)
    admin_token = _secrets.token_urlsafe(32)
    order.admin_confirm_token = admin_token
    order.admin_confirm_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    order.notes = (order.notes or "") + f"\n[QR] 用户点击确认付款，等待管理员确认 {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"
    await db.commit()

    # Send confirmation email to admin
    admin_emails_str = settings.ADMIN_EMAILS
    logger.info(f"[QR-ADMIN] Order {order_no}: admin_confirm_token generated, ADMIN_EMAILS={'configured' if admin_emails_str else 'NOT configured'}")
    logger.info(f"[QR-ADMIN] Confirm URL: https://api.khanfate.com/api/payments/admin-confirm-email?token={admin_token}")
    logger.info(f"[QR-ADMIN] Reject URL: https://api.khanfate.com/api/payments/admin-reject-email?token={admin_token}")
    if admin_emails_str:
        import asyncio
        from utils.email import send_admin_payment_confirm_email as _send_admin
        admin_emails = [e.strip() for e in admin_emails_str.split(",") if e.strip()]
        amount = float(order.total_cny or 0)
        user_email = current_user.email or ""
        # Collect items description
        item_stmt = select(OrderItem).where(OrderItem.order_id == order.id)
        item_result = await db.execute(item_stmt)
        items = item_result.scalars().all()
        items_desc = ", ".join(f"{i.product_name}×{i.quantity}" for i in items) if items else ""
        payment_display = order.payment_method or "微信/支付宝"

        for admin_email in admin_emails:
            try:
                result = await asyncio.to_thread(
                    _send_admin,
                    admin_email, order_no, amount, admin_token,
                    user_email=user_email, payment_method=payment_display,
                    items_desc=items_desc,
                )
                logger.info(f"[QR-ADMIN] Email sent to {admin_email}: {result}")
            except Exception as e:
                logger.warning(f"[EMAIL] Failed to send admin confirm email to {admin_email}: {e}")
    else:
        logger.warning(f"[QR-ADMIN] ADMIN_EMAILS not configured! Cannot send email. Admin confirm URL: https://api.khanfate.com/api/payments/admin-confirm-email?token={admin_token}")

    return {
        "success": True,
        "order_no": order.order_no,
        "status": "pending_admin_confirm",
        "message": "付款确认已提交，管理员将在核实收款后确认订单",
    }


@router.get("/confirm-email")
async def confirm_email_payment(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    用户点击邮件中的确认链接，验证 token 后将订单标记为已付款。
    无需登录 — token 本身包含授权。
    保留用于兼容旧流程。
    """
    from fastapi.responses import RedirectResponse

    result = await db.execute(
        select(Order).where(Order.confirm_token == token).with_for_update()
    )
    order = result.scalar_one_or_none()
    if not order:
        return RedirectResponse(
            url="https://www.khanfate.com/zh/checkout?error=invalid_token",
            status_code=302,
        )

    if order.confirm_expires and order.confirm_expires < datetime.now(timezone.utc):
        return RedirectResponse(
            url="https://www.khanfate.com/zh/checkout?error=token_expired",
            status_code=302,
        )

    if order.status != OrderStatus.pending:
        return RedirectResponse(
            url=f"https://www.khanfate.com/zh/account/orders/{order.order_no}",
            status_code=302,
        )

    order.status = OrderStatus.paid
    order.paid_at = datetime.now(timezone.utc)
    order.confirm_token = None
    order.notes = (order.notes or "") + f"\n[QR-EMAIL] 邮件确认付款 {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"
    await db.commit()

    return RedirectResponse(
        url=f"https://www.khanfate.com/zh/account/orders/{order.order_no}?payment=confirmed",
        status_code=302,
    )


@router.get("/admin-confirm-email")
async def admin_confirm_email_payment(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    管理员点击邮件中的确认链接，验证 admin_confirm_token 后将订单标记为已付款。
    无需登录 — admin token 本身包含授权。
    """
    from fastapi.responses import RedirectResponse

    result = await db.execute(
        select(Order).where(Order.admin_confirm_token == token).with_for_update()
    )
    order = result.scalar_one_or_none()
    if not order:
        return RedirectResponse(
            url="https://www.khanfate.com/zh/admin/orders?error=invalid_token",
            status_code=302,
        )

    if order.admin_confirm_expires and order.admin_confirm_expires < datetime.now(timezone.utc):
        return RedirectResponse(
            url="https://www.khanfate.com/zh/admin/orders?error=token_expired",
            status_code=302,
        )

    if order.status != OrderStatus.pending:
        return RedirectResponse(
            url=f"https://www.khanfate.com/zh/admin/orders",
            status_code=302,
        )

    # Mark as paid
    order.status = OrderStatus.paid
    order.paid_at = datetime.now(timezone.utc)
    order.admin_confirm_token = None
    order.notes = (order.notes or "") + f"\n[QR-ADMIN] 管理员确认收款 {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"
    await db.commit()

    # Notify user that payment is confirmed
    try:
        import asyncio
        from utils.email import send_refund_approved_notification
        user_stmt = select(User).where(User.id == order.user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one_or_none()
        if user and user.email:
            # Reuse a simple notification — just inform user their order is confirmed
            from utils.email import _send_email
            await asyncio.to_thread(
                _send_email, user.email,
                f"订单 {order.order_no} 已确认付款",
                f"<div style='font-family:sans-serif;padding:20px;'><h2>✅ 付款已确认</h2><p>您的订单 <strong>{order.order_no}</strong>（¥{float(order.total_cny or 0)}）已确认收款，订单正在处理中。</p></div>",
            )
    except Exception as e:
        logger.warning(f"[EMAIL] Failed to notify user of payment confirmation: {e}")

    return RedirectResponse(
        url=f"https://www.khanfate.com/zh/admin/orders?confirmed={order.order_no}",
        status_code=302,
    )


@router.get("/admin-reject-email")
async def admin_reject_email_payment(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    管理员点击邮件中的拒绝链接，通知用户付款未被确认。
    """
    from fastapi.responses import RedirectResponse

    result = await db.execute(
        select(Order).where(Order.admin_confirm_token == token)
    )
    order = result.scalar_one_or_none()
    if not order:
        return RedirectResponse(
            url="https://www.khanfate.com/zh/admin/orders?error=invalid_token",
            status_code=302,
        )

    # Check token expiry
    if order.admin_confirm_expires and order.admin_confirm_expires < datetime.now(timezone.utc):
        return RedirectResponse(
            url="https://www.khanfate.com/zh/admin/orders?error=token_expired",
            status_code=302,
        )

    # Invalidate token and mark as cancelled
    order.admin_confirm_token = None
    order.status = OrderStatus.cancelled
    order.notes = (order.notes or "") + f"\n[QR-ADMIN-REJECT] 管理员拒绝确认 {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"
    await db.commit()

    # Notify user
    try:
        import asyncio
        from utils.email import send_admin_payment_reject_email
        user_stmt = select(User).where(User.id == order.user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one_or_none()
        if user and user.email:
            await asyncio.to_thread(
                send_admin_payment_reject_email,
                user.email, order.order_no, float(order.total_cny or 0),
            )
    except Exception as e:
        logger.warning(f"[EMAIL] Failed to notify user of payment rejection: {e}")

    return RedirectResponse(
        url=f"https://www.khanfate.com/zh/admin/orders?rejected={order.order_no}",
        status_code=302,
    )


@router.get("/shop-orders/{order_no}/payment-status")
async def get_shop_payment_status(
    order_no: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """查询商城订单支付状态 — 前端轮询用"""
    result = await db.execute(
        select(Order).where(
            Order.order_no == order_no,
            Order.user_id == current_user.id,
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")

    return {
        "order_no": order.order_no,
        "status": order.status.value,
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
    }


# ══════════════════════════════════════════════════════════════════════════════
#  CJ Dropshipping Integration
# ══════════════════════════════════════════════════════════════════════════════

class FulfillCJRequest(BaseModel):
    shipping_method: str = "CJPacket Ordinary"


@router.post("/admin/shop-orders/{order_no}/fulfill-cj")
async def fulfill_via_cj(
    order_no: str,
    req: FulfillCJRequest,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """Push a paid order to CJ Dropshipping for fulfillment."""
    _require_admin_auth(authorization, x_admin_key)

    from services.cj_dropshipping import create_order as cj_create, is_enabled
    if not is_enabled():
        raise HTTPException(status_code=400, detail="CJ API 未启用")

    # Query order
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_no == order_no)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status != OrderStatus.paid:
        raise HTTPException(status_code=400, detail=f"订单状态 {order.status.value} 不可推送（需为 paid）")

    # Load products to get CJ variant IDs
    all_products = _load_products()
    products_by_id = {p["id"]: p for p in all_products}

    # Build CJ order products
    cj_products = []
    for item in order.items:
        product_data = products_by_id.get(item.product_id) or {}
        cj_vid = product_data.get("cj_variant_id", "")
        if not cj_vid:
            raise HTTPException(
                status_code=400,
                detail=f"商品 {item.product_name} 未配置 CJ variant ID，请先在 products.json 中设置 cj_variant_id",
            )
        cj_products.append({"vid": cj_vid, "quantity": item.quantity})

    # Build shipping address
    addr = order.shipping_address or {}
    addr_str = addr.get("address_line1", "")
    if addr.get("address_line2"):
        addr_str += f" {addr['address_line2']}"

    # Country code mapping
    country_map = {"中国": "CN", "美国": "US", "英国": "GB", "加拿大": "CA", "澳大利亚": "AU", "日本": "JP"}
    country = country_map.get(addr.get("country", ""), addr.get("country", "CN")[:2].upper())

    cj_order_data = {
        "orderNumber": order.order_no,
        "logisticName": req.shipping_method,
        "shippingCountryCode": country,
        "shippingCountry": addr.get("country", ""),
        "shippingProvince": addr.get("province", ""),
        "shippingCity": addr.get("city", ""),
        "shippingAddress": addr_str,
        "shippingZip": addr.get("postal_code", ""),
        "shippingPhone": order.recipient_phone or "",
        "shippingCustomerName": order.recipient_name or "",
        "email": "",
        "payType": 3,               # 3 = create order only (no CJ payment page)
        "platform": "api",
        "fromCountryCode": "CN",
        "products": cj_products,
    }

    try:
        resp = await cj_create(cj_order_data)
    except Exception as e:
        logger.error(f"[CJ] Fulfill order {order_no} failed: {e}")
        raise HTTPException(status_code=502, detail=f"CJ 推送失败: {str(e)}")

    # Update order with CJ info
    cj_data = resp.get("data", {})
    order.cj_order_number = cj_data.get("orderId") or cj_data.get("orderNumber")
    order.cj_order_status = cj_data.get("orderStatus", "")
    order.cj_shipping_cost = float(cj_data.get("postageAmount") or 0)
    order.cj_response = cj_data
    order.fulfilled_via = "cj"
    order.notes = (order.notes or "") + f"\n[CJ] 已推送: {order.cj_order_number}"
    await db.commit()

    return {
        "success": True,
        "cj_order_number": order.cj_order_number,
        "cj_status": order.cj_order_status,
        "product_amount": cj_data.get("productAmount"),
        "postage_amount": cj_data.get("postageAmount"),
        "actual_payment": cj_data.get("actualPayment"),
    }


@router.post("/admin/shop-orders/{order_no}/sync-cj-tracking")
async def sync_cj_tracking(
    order_no: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """Sync tracking info from CJ for a pushed order."""
    _require_admin_auth(authorization, x_admin_key)

    from services.cj_dropshipping import get_tracking, list_orders as cj_list_orders, is_enabled
    if not is_enabled():
        raise HTTPException(status_code=400, detail="CJ API 未启用")

    result = await db.execute(
        select(Order).where(Order.order_no == order_no)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if not order.cj_order_number:
        raise HTTPException(status_code=400, detail="该订单未推送到 CJ")

    try:
        # Get order status from CJ order list
        status_resp = await cj_list_orders(order_ids=[order.cj_order_number])
        order_list = status_resp.get("data", {}).get("list", [])

        # Update CJ order status
        if order_list:
            cj_order = order_list[0]
            cj_status = cj_order.get("orderStatus", "")
            order.cj_order_status = cj_status

            # Update tracking from order info
            track_number = cj_order.get("trackNumber")
            if track_number and not order.tracking_number:
                order.tracking_number = track_number
                order.shipping_carrier = cj_order.get("logisticName", "CJ Logistics")
                order.shipped_at = datetime.now(timezone.utc)

            # Map CJ status to our status
            status_map = {
                "CREATED": None, "IN_CART": None, "UNPAID": None,
                "UNSHIPPED": None,
                "SHIPPED": OrderStatus.shipped,
                "DELIVERED": OrderStatus.delivered,
                "CANCELLED": OrderStatus.cancelled,
            }
            new_status = status_map.get(cj_status)
            if new_status and order.status != new_status:
                order.status = new_status
                if new_status == OrderStatus.shipped and not order.shipped_at:
                    order.shipped_at = datetime.now(timezone.utc)

        # Get detailed tracking if we have a tracking number
        trajectory = []
        if order.tracking_number:
            try:
                tracking_resp = await get_tracking([order.tracking_number])
                tracking_list = tracking_resp.get("data", [])
                if tracking_list:
                    track_info = tracking_list[0]
                    trajectory = track_info.get("trajectory", [])
                    # Update carrier info from tracking
                    if track_info.get("logisticName") and not order.shipping_carrier:
                        order.shipping_carrier = track_info["logisticName"]
            except Exception as te:
                logger.warning(f"[CJ] Tracking detail fetch failed: {te}")

        await db.commit()

        return {
            "success": True,
            "tracking_number": order.tracking_number,
            "shipping_carrier": order.shipping_carrier,
            "cj_order_status": order.cj_order_status,
            "our_status": order.status.value,
            "trajectory": trajectory,
        }
    except Exception as e:
        logger.error(f"[CJ] Sync tracking for {order_no} failed: {e}")
        raise HTTPException(status_code=502, detail=f"CJ 物流同步失败: {str(e)}")


@router.get("/admin/cj/search-product")
async def cj_search_product(
    q: str = Query(..., description="Search keyword"),
    page: int = Query(1, ge=1),
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """Search CJ product catalog."""
    _require_admin_auth(authorization, x_admin_key)

    from services.cj_dropshipping import search_product, is_enabled
    if not is_enabled():
        raise HTTPException(status_code=400, detail="CJ API 未启用")

    try:
        resp = await search_product(q, page_num=page)
        return resp.get("data", resp)
    except Exception as e:
        logger.error(f"[CJ] Product search failed: {e}")
        raise HTTPException(status_code=502, detail=f"CJ 搜索失败: {str(e)}")


# ── CJ Webhook ──────────────────────────────────────────────────────────────

@router.post("/webhooks/cj")
async def cj_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Receive CJ Dropshipping webhook notifications.
    Configure in CJ Dashboard → Settings → API Settings → Webhook URL:
    https://yourdomain.com/api/webhooks/cj
    """
    body = await request.json()
    logger.info(f"[CJ Webhook] Received: {json.dumps(body, ensure_ascii=False)[:500]}")

    # Verify webhook signature if secret is configured
    if settings.CJ_WEBHOOK_SECRET:
        signature = request.headers.get("X-CJ-Signature", "")
        import hashlib
        expected = hashlib.sha256(
            (json.dumps(body, separators=(",", ":")) + settings.CJ_WEBHOOK_SECRET).encode()
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            logger.warning("[CJ Webhook] Invalid signature")
            raise HTTPException(status_code=403, detail="Invalid signature")

    # Extract order info
    cj_order_number = body.get("orderId") or body.get("orderNumber") or body.get("cjOrderNumber")
    tracking_number = body.get("trackingNumber") or body.get("trackingNumber1")
    cj_status = body.get("status") or body.get("orderStatus", "")

    if not cj_order_number:
        logger.warning("[CJ Webhook] No order number in payload")
        return {"success": True}

    # Find matching order
    result = await db.execute(
        select(Order).where(Order.cj_order_number == cj_order_number)
    )
    order = result.scalar_one_or_none()
    if not order:
        logger.warning(f"[CJ Webhook] No matching order for CJ order {cj_order_number}")
        return {"success": True}  # Return 200 to prevent retries

    # Idempotent: skip if already in target state
    if cj_status.lower() in ("shipped", "in transit") and order.status == OrderStatus.shipped:
        return {"success": True}
    if cj_status.lower() == "delivered" and order.status == OrderStatus.delivered:
        return {"success": True}

    # Update order
    order.cj_order_status = cj_status
    if tracking_number:
        order.tracking_number = tracking_number
        order.shipping_carrier = body.get("shippingMethod", body.get("carrierName", "CJ Logistics"))

    # Status mapping
    if cj_status.lower() in ("shipped", "in transit"):
        order.status = OrderStatus.shipped
        if not order.shipped_at:
            order.shipped_at = datetime.now(timezone.utc)
    elif cj_status.lower() == "delivered":
        order.status = OrderStatus.delivered

    await db.commit()
    logger.info(f"[CJ Webhook] Order {order.order_no} updated: status={order.status.value}, tracking={tracking_number}")

    # Notify user asynchronously
    try:
        if order.user and order.user.email:
            from utils.email import _send_email
            import asyncio

            status_text = {"shipped": "已发货", "in transit": "运输中", "delivered": "已签收"}.get(cj_status.lower(), cj_status)
            subject = f"订单 {order.order_no} {status_text}"
            body_html = f"""
            <p>您的订单 <b>{order.order_no}</b> 状态更新：</p>
            <p>状态：<b>{status_text}</b></p>
            {f'<p>物流单号：{tracking_number}</p>' if tracking_number else ''}
            <p>物流公司：{order.shipping_carrier or 'CJ Logistics'}</p>
            """
            await asyncio.to_thread(_send_email, order.user.email, subject, body_html)
    except Exception as e:
        logger.warning(f"[CJ Webhook] Failed to notify user: {e}")

    return {"success": True}
