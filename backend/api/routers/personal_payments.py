"""
api/routers/personal_payments.py
个人收款码支付接口 - 安全支付实现
"""
from __future__ import annotations
import uuid
import time
import hashlib
import hmac
import secrets
import logging
import html as html_mod
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Header
from api.routers.payments.utils import get_client_region
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from database.session import get_db
from database.models import Order, OrderStatus, Reading, PaymentStatus, User
from auth.dependencies import get_current_user, require_user
from config import get_settings

# Import activation functions from payments router
from api.routers.payments.subscriptions import activate_subscription as _activate_subscription
from api.routers.payments.founder import activate_founder_seat_logic as _activate_founder_seat
from api.routers.payments.unlock import handle_onetime_unlock_activation as _handle_onetime_unlock_activation
from api.routers.payments.constants import PRODUCT_PRICES

router = APIRouter()
settings = get_settings()

# ─── 配置 ──────────────────────────────────────────────────────────────────────
ORDER_EXPIRE_MINUTES = 30  # 订单30分钟过期
MAX_RETRY_COUNT = 3        # 最大重试次数


class QRPayload(BaseModel):
    """支付请求"""
    amount: float              # 金额（元）
    currency: str = "CNY"      # 货币
    description: str = ""      # 商品描述
    reading_id: str = ""       # 报告ID
    user_id: str = ""          # 用户ID（可选）
    notify_url: str = ""       # 回调地址（可选）


class PaymentVerify(BaseModel):
    """支付验证请求"""
    order_no: str
    screenshot_url: str = ""   # 截图URL（可选）
    remark: str = ""           # 备注（可选）


# ─── 安全工具 ──────────────────────────────────────────────────────────────────

def _generate_order_no(prefix: str = "P") -> str:
    """生成唯一订单号"""
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    random_part = uuid.uuid4().hex[:8].upper()
    return f"{prefix}{timestamp}{random_part}"


def _generate_payment_token(order_no: str) -> str:
    """Generate a payment verification token using cryptographically secure random."""
    return secrets.token_hex(8)


# ─── 数据库操作 ─────────────────────────────────────────────────────────────────

async def _create_order(
    db: AsyncSession,
    amount: float,
    payment_method: str,
    description: str,
    reading_id: str = "",
    user_id: str = "",
    item_type: str = "",
) -> Order:
    """创建订单"""
    order_no = _generate_order_no(prefix="QR" if payment_method == "alipay" else "QW")

    order = Order(
        order_no=order_no,
        status=OrderStatus.pending,
        total_cny=amount,
        payment_method=payment_method,
        payment_ref=order_no,
        user_id=user_id if user_id else None,
        item_type=item_type,
        notes=f"reading_id:{reading_id}|{description}",
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


async def _get_pending_order(db: AsyncSession, order_no: str) -> Optional[Order]:
    """获取待支付订单"""
    result = await db.execute(
        select(Order).where(
            Order.order_no == order_no,
            Order.status == OrderStatus.pending,
        )
    )
    return result.scalar_one_or_none()




# ─── API 接口 ──────────────────────────────────────────────────────────────────

@router.post("/create")
async def create_payment_order(
    request: Request,
    payload: QRPayload,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    创建收款码支付订单

    返回支付宝/微信收款码URL，供前端展示
    """
    # 0. Region validation: QR code payments are domestic-only
    # Use server-side detection (CF-IPCountry / Accept-Language / IP) instead of trusting client cookie
    region = get_client_region(request)
    if region != "domestic":
        raise HTTPException(
            status_code=403,
            detail="QR code payments are only available for domestic users. Please use PayPal.",
        )
    # 1. 验证金额 — 必须匹配已知产品价格
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="金额必须大于0")
    valid_amounts = {
        "report_unlock": PRODUCT_PRICES.get("report_unlock", {}).get("cny", 10),
        "premium_monthly": PRODUCT_PRICES.get("premium_monthly", {}).get("cny", 59),
        "premium_yearly": PRODUCT_PRICES.get("premium_yearly", {}).get("cny", 365),
        "onetime_unlock": PRODUCT_PRICES.get("onetime_unlock", {}).get("cny", 19.9),
    }
    # Only accept amounts that match known product prices
    matched_type = None
    for ptype, price in valid_amounts.items():
        if abs(payload.amount - price) < 0.01:
            matched_type = ptype
            break
    if matched_type is None:
        raise HTTPException(status_code=400, detail="金额不匹配任何已知产品价格")

    # 2. 验证支付方式
    method = payload.currency.upper()
    if method not in ("CNY", "CNY_ALIPAY", "CNY_WECHAT", "USD_PAYPAL"):
        raise HTTPException(status_code=400, detail="不支持的支付方式")

    # 3. 创建订单 — user_id 必须来自认证用户，不可由客户端指定
    if not current_user:
        raise HTTPException(status_code=401, detail="请先登录后再创建订单")
    payment_method = "alipay" if "ALIPAY" in method else ("wechat" if "WECHAT" in method else "paypal")
    order = await _create_order(
        db=db,
        amount=payload.amount,
        payment_method=payment_method,
        description=payload.description or "AlphaMirror AI算力服务",
        reading_id=payload.reading_id,
        user_id=current_user.id,
        item_type=matched_type or "",
    )

    # 4. 返回支付信息
    return {
        "success": True,
        "order_no": order.order_no,
        "amount": payload.amount,
        "currency": "CNY" if payment_method != "paypal" else "USD",
        "payment_method": payment_method,
        "qr_code_url": f"/api/personal-payments/qr/{payment_method}",
        "payment_token": _generate_payment_token(order.order_no),
        "instructions": _get_payment_instructions(payment_method),
    }


@router.get("/qr/{method}")
async def get_qr_code(method: str):
    """
    获取收款码图片URL

    返回对应的收款码图片
    """
    if method == "alipay":
        qr_url = settings.ALIPAY_PERSONAL_QR_URL
        name = "支付宝"
    elif method == "wechat":
        qr_url = settings.WECHAT_PERSONAL_QR_URL
        name = "微信"
    elif method == "paypal":
        qr_url = settings.PAYPAL_PERSONAL_QR_URL
        name = "PayPal"
    else:
        raise HTTPException(status_code=400, detail="不支持的支付方式")

    if not qr_url:
        raise HTTPException(status_code=400, detail=f"{name}收款码未配置，请在环境变量中设置")

    return {
        "method": method,
        "name": name,
        "qr_url": qr_url,
    }


def _generate_admin_token(order_no: str, action: str) -> str:
    """生成管理员确认/拒绝的 HMAC token（标准用法：key=secret, msg=payload）"""
    secret = settings.SECRET_KEY
    expiry = int(time.time()) + 1800  # 30 分钟有效期
    payload_str = f"{order_no}:{action}:{expiry}"
    sig = hmac.new(secret.encode(), payload_str.encode(), digestmod=hashlib.sha256).hexdigest()[:32]
    return f"{expiry}:{sig}"


def _verify_admin_token(order_no: str, action: str, token: str) -> bool:
    """验证管理员 token 是否有效（标准 HMAC：key=secret, msg=payload）"""
    try:
        parts = token.split(":")
        if len(parts) != 2:
            return False
        expiry, sig = int(parts[0]), parts[1]
        if time.time() > expiry:
            return False
        secret = settings.SECRET_KEY
        payload_str = f"{order_no}:{action}:{expiry}"
        expected = hmac.new(secret.encode(), payload_str.encode(), digestmod=hashlib.sha256).hexdigest()[:32]
        return hmac.compare_digest(sig, expected)
    except Exception:
        return False


async def _activate_order(db: AsyncSession, order) -> None:
    """激活订单（解锁报告 + 激活订阅）"""
    # Idempotency: skip if already activated
    if order.status == OrderStatus.paid:
        return
    order.status = OrderStatus.paid
    order.paid_at = datetime.now(timezone.utc)

    # 解锁报告
    try:
        notes = order.notes or ""
        if "reading_id:" in notes:
            reading_id = notes.split("reading_id:")[1].split("|")[0]
            # Validate reading_id format (UUID-like, max 50 chars)
            if reading_id and len(reading_id) <= 50:
                reading_result = await db.execute(select(Reading).where(Reading.id == reading_id))
                reading = reading_result.scalar_one_or_none()
                if reading:
                    reading.is_detail_unlocked = True
                    reading.payment_status = PaymentStatus.paid
                    # Invalidate reading cache so next GET re-fetches with worker reports
                    from api.routers.readings import _invalidate_reading_cache
                    _invalidate_reading_cache(reading_id)
                    if reading.user_id:
                        user_result = await db.execute(
                            select(User).where(User.id == reading.user_id).with_for_update()
                        )
                        user = user_result.scalar_one_or_none()
                        if user:
                            if (user.shop_coupon_balance or 0) == 0:
                                user.shop_coupon_balance = 50
                            from api.routers.payments.constants import GRANT_ON_REPORT_UNLOCK
                            user.stardust_balance += GRANT_ON_REPORT_UNLOCK
                            user.stardust_lifetime_earned += GRANT_ON_REPORT_UNLOCK
    except Exception as e:
        logger.error("Activate FAILED for order: %s", e)
        raise

    # 激活订阅
    if order.item_type != "shop":
        try:
            description = order.notes or ""
            activated_tier = None
            if "premium_yearly" in description and abs(order.total_cny - 365.0) < 0.01:
                activated_tier = "premium_yearly"
            elif "premium_monthly" in description and abs(order.total_cny - 59.0) < 0.01:
                activated_tier = "premium_monthly"
            elif "founder_lifetime" in description and abs(order.total_cny - 1688.0) < 0.01:
                activated_tier = "founder_lifetime"
            elif "onetime_unlock" in description and abs(order.total_cny - 19.9) < 0.01:
                activated_tier = "onetime_unlock"

            if activated_tier and order.user_id:
                user_result = await db.execute(
                    select(User).where(User.id == order.user_id).with_for_update()
                )
                sub_user = user_result.scalar_one_or_none()
                if sub_user:
                    if activated_tier == "founder_lifetime" and not sub_user.is_founder:
                        await _activate_founder_seat(sub_user, order.order_no, db)
                    elif activated_tier in ("premium_monthly", "premium_yearly"):
                        await _activate_subscription(sub_user, activated_tier, db)
                    elif activated_tier == "onetime_unlock":
                        await _handle_onetime_unlock_activation(sub_user, order, db)
        except Exception as e:
            logger.error("Activate FAILED for order: %s", e)
            raise


@router.post("/verify")
async def verify_payment(
    payload: PaymentVerify,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    验证支付 — 用户付款后点击「我已付款」。
    发送邮件通知管理员确认，¥50 以下 30 分钟自动激活。
    """
    from utils.email import send_payment_notification_email

    # 1. 获取订单
    order = await _get_pending_order(db, payload.order_no)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在或已处理")

    # 2. 验证订单归属
    if order.user_id and str(order.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="无权操作此订单")

    # 3. 验证金额合理
    if order.total_cny <= 0 or order.total_cny > 50000:
        raise HTTPException(status_code=400, detail="订单金额异常")

    # 4. 标记为已验证（等待确认）
    order.status = OrderStatus.processing
    order.payment_ref = f"{order.order_no}_submitted"
    await db.commit()

    # 5. 生成确认/拒绝 token
    confirm_token = f"{order.order_no}:{_generate_admin_token(order.order_no, 'confirm')}"
    reject_token = f"{order.order_no}:{_generate_admin_token(order.order_no, 'reject')}"

    # 6. 发送邮件通知管理员
    notes = order.notes or ""
    item_type = order.item_type or ""
    if not item_type and "item_type:" in notes:
        item_type = notes.split("item_type:")[1].split("|")[0]

    user_email = current_user.email or ""
    try:
        result = send_payment_notification_email(
            order_no=order.order_no,
            amount_cny=order.total_cny,
            item_type=item_type,
            user_email=user_email,
            confirm_token=confirm_token,
            reject_token=reject_token,
        )
        if result:
            logger.info(f"[PAYMENT] Email notification sent for order {order.order_no}")
        else:
            logger.warning(f"[PAYMENT] Email notification returned False for order {order.order_no}")
    except Exception as e:
        logger.error(f"[PAYMENT] Failed to send email for order {order.order_no}: {e}")

    return {
        "success": True,
        "order_no": order.order_no,
        "status": "processing",
        "message": "支付已提交，等待管理员确认",
    }


class AdminActionRequest(BaseModel):
    """管理员确认/拒绝操作的请求体"""
    token: str  # 格式: order_no:admin_token


def _auto_submit_form(target_url: str, token: str, title: str, button_text: str, color: str) -> "HTMLResponse":
    """Render an auto-submitting HTML form for email click-to-action links.
    This prevents CSRF by ensuring the action goes through a POST request,
    while keeping clickable links in emails."""
    from fastapi.responses import HTMLResponse
    escaped_url = html_mod.escape(target_url)
    escaped_token = html_mod.escape(token)
    return HTMLResponse(f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>{title}</title></head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;background:#f5f5f5;">
  <form id="actionForm" method="POST" action="{escaped_url}">
    <input type="hidden" name="token" value="{escaped_token}" />
    <div style="text-align:center;background:white;padding:40px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h2>{title}</h2>
      <p style="color:#666;">正在处理中...</p>
      <button type="submit" style="padding:12px 32px;background:{color};color:white;border:none;border-radius:24px;font-size:15px;font-weight:bold;cursor:pointer;">{button_text}</button>
    </div>
  </form>
  <script>document.getElementById('actionForm').submit();</script>
</body></html>""", headers={
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
    })


@router.get("/admin/quick-confirm")
async def quick_confirm_form(
    token: str = Query(...),
):
    """渲染确认收款的自动提交表单（GET → POST 安全转换）"""
    target = f"{settings.FRONTEND_URL.rstrip('/')}/api/personal-payments/admin/quick-confirm"
    return _auto_submit_form(target, token, "确认收款", "✅ 确认", "#16a34a")


@router.post("/admin/quick-confirm")
async def quick_confirm_payment(
    req: AdminActionRequest,
    db: AsyncSession = Depends(get_db),
):
    """管理员一键确认收款 — 无需登录，通过 token 验证（POST 方法防止日志/历史泄露）"""
    from fastapi.responses import HTMLResponse

    try:
        order_no, admin_token = req.token.split(":", 1)
    except ValueError:
        return HTMLResponse("<html><body><h2>❌ 无效链接</h2></body></html>", status_code=400)

    if not _verify_admin_token(order_no, "confirm", admin_token):
        return HTMLResponse("<html><body><h2>❌ 链接已过期或无效</h2></body></html>", status_code=400)

    # 查找 processing 状态的订单
    result = await db.execute(
        select(Order).where(Order.order_no == order_no, Order.status == OrderStatus.processing)
    )
    order = result.scalar_one_or_none()
    if not order:
        return HTMLResponse("<html><body><h2>⚠️ 订单不存在或已处理</h2></body></html>")

    # 激活订单（审计：记录通过 POST 请求访问）
    existing_notes = order.notes or ""
    order.notes = f"{existing_notes}|accessed_via:POST|accessed_at:{datetime.now(timezone.utc).isoformat()}"
    await _activate_order(db, order)
    await db.commit()
    logger.warning("quick_confirm_payment accessed via POST for order %s", order_no)

    return HTMLResponse(f"""
    <html><body style="text-align:center;padding:50px;font-family:sans-serif;">
      <h2>✅ 已确认收款 ¥{order.total_cny}</h2>
      <p>订单 {order_no} 已激活</p>
    </body></html>
    """, headers={
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
    })


@router.get("/admin/quick-reject")
async def quick_reject_form(
    token: str = Query(...),
):
    """渲染拒绝收款的自动提交表单（GET → POST 安全转换）"""
    target = f"{settings.FRONTEND_URL.rstrip('/')}/api/personal-payments/admin/quick-reject"
    return _auto_submit_form(target, token, "拒绝收款", "❌ 确认拒绝", "#dc2626")


@router.post("/admin/quick-reject")
async def quick_reject_payment(
    req: AdminActionRequest,
    db: AsyncSession = Depends(get_db),
):
    """管理员一键拒绝 — 无需登录，通过 token 验证（POST 方法防止日志/历史泄露）"""
    from fastapi.responses import HTMLResponse

    try:
        order_no, admin_token = req.token.split(":", 1)
    except ValueError:
        return HTMLResponse("<html><body><h2>❌ 无效链接</h2></body></html>", status_code=400)

    if not _verify_admin_token(order_no, "reject", admin_token):
        return HTMLResponse("<html><body><h2>❌ 链接已过期或无效</h2></body></html>", status_code=400)

    result = await db.execute(
        select(Order).where(Order.order_no == order_no, Order.status == OrderStatus.processing)
    )
    order = result.scalar_one_or_none()
    if not order:
        return HTMLResponse("<html><body><h2>⚠️ 订单不存在或已处理</h2></body></html>")

    order.status = OrderStatus.cancelled
    # 审计：记录通过 POST 请求访问
    existing_notes = order.notes or ""
    order.notes = f"{existing_notes}|accessed_via:POST|accessed_at:{datetime.now(timezone.utc).isoformat()}"
    await db.commit()
    logger.warning("quick_reject_payment accessed via POST for order %s", order_no)

    return HTMLResponse(f"""
    <html><body style="text-align:center;padding:50px;font-family:sans-serif;">
      <h2>❌ 已拒绝 ¥{order.total_cny}</h2>
      <p>订单 {order_no} 已取消</p>
    </body></html>
    """, headers={
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
    })


@router.post("/admin/auto-confirm-expired")
async def auto_confirm_expired_orders(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    自动确认超时订单 — ¥50 以下超过 30 分钟的 processing 订单自动激活。
    通过 CRON_SECRET 鉴权。
    """
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.removeprefix("Bearer ").strip()
    if not hmac.compare_digest(token, settings.CRON_SECRET):
        raise HTTPException(status_code=403, detail="Invalid token")

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=30)
    result = await db.execute(
        select(Order).where(
            Order.status == OrderStatus.processing,
            Order.created_at < cutoff,
            Order.total_cny <= 50.0,
        )
    )
    orders = result.scalars().all()

    activated_count = 0
    for order in orders:
        try:
            await _activate_order(db, order)
            activated_count += 1
        except Exception:
            pass

    await db.commit()
    return {"activated": activated_count}


@router.post("/confirm")
async def confirm_payment(
    order_no: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    用户确认已付款 — 仅标记为 processing，等待管理员核实后激活。
    不再直接激活订阅/解锁报告。
    """
    # 1. 获取订单 — 必须是 pending 状态
    order = await _get_pending_order(db, order_no)
    if not order:
        # 如果已经是 processing，说明已提交过
        result = await db.execute(
            select(Order).where(
                Order.order_no == order_no,
                Order.status == OrderStatus.processing,
            )
        )
        order = result.scalar_one_or_none()
        if order:
            if order.user_id and str(order.user_id) != str(current_user.id):
                raise HTTPException(status_code=403, detail="Not your order")
            return {
                "success": True,
                "order_no": order.order_no,
                "status": "processing",
                "message": "已提交，等待管理员确认",
            }
        raise HTTPException(status_code=404, detail="订单不存在或已过期")

    # 1b. Ownership check
    if order.user_id and str(order.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your order")

    # 2. 验证订单金额合理性
    if order.total_cny <= 0 or order.total_cny > 50000:
        raise HTTPException(status_code=400, detail="订单金额异常")

    # 3. 标记为 processing（等待管理员确认）
    order.status = OrderStatus.processing
    order.payment_ref = f"{order.order_no}_submitted"
    await db.commit()

    return {
        "success": True,
        "order_no": order.order_no,
        "status": "processing",
        "message": "已提交，等待管理员确认收款后激活",
    }


@router.post("/admin/confirm")
async def admin_confirm_payment(
    order_no: str = Query(...),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    管理员确认收款 — 需要 CRON_SECRET 鉴权。
    确认后激活订阅/解锁报告。
    """
    # 1. 鉴权
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.removeprefix("Bearer ").strip()
    if not hmac.compare_digest(token, settings.CRON_SECRET):
        raise HTTPException(status_code=403, detail="Invalid token")

    # 2. 获取订单 — 必须是 processing 状态（用户已确认付款）
    result = await db.execute(
        select(Order).where(
            Order.order_no == order_no,
            Order.status == OrderStatus.processing,
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在或尚未提交确认")

    # 3. 验证订单金额合理性
    if order.total_cny <= 0 or order.total_cny > 50000:
        raise HTTPException(status_code=400, detail="订单金额异常")

    # 4. 激活订单（复用 _activate_order，不再重复激活逻辑）
    await _activate_order(db, order)
    await db.commit()

    return {
        "success": True,
        "order_no": order.order_no,
        "status": "paid",
        "message": "管理员已确认收款，订阅/报告已激活",
    }


@router.get("/status/{order_no}")
async def check_order_status(
    order_no: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    查询订单状态

    前端轮询此接口检查支付状态 — 需要登录，只能查看自己的订单
    """
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
        "amount": order.total_cny,
        "payment_method": order.payment_method,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
    }


# ─── 辅助函数 ──────────────────────────────────────────────────────────────────

def _get_payment_instructions(method: str) -> dict:
    """获取支付说明"""
    if method == "alipay":
        return {
            "title": "支付宝支付",
            "steps": [
                "打开支付宝APP",
                "点击扫一扫",
                "扫描上方二维码",
                "确认金额并支付",
                "支付完成后点击下方按钮"
            ],
            "note": "请确保转账金额与订单一致"
        }
    elif method == "wechat":
        return {
            "title": "微信支付",
            "steps": [
                "打开微信APP",
                "点击扫一扫",
                "扫描上方二维码",
                "确认金额并支付",
                "支付完成后点击下方按钮"
            ],
            "note": "请在备注中填写订单号"
        }
    else:
        return {
            "title": "PayPal支付",
            "steps": [
                "点击下方按钮跳转PayPal",
                "登录PayPal账户",
                "确认金额并支付",
                "支付完成后返回"
            ],
            "note": "国际支付可能需要验证"
        }


# ─── Admin 管理接口 ───────────────────────────────────────────────────────────

class AdminUpgradeRequest(BaseModel):
    """管理端：升级用户会员"""
    email: str
    tier: str = "founder_lifetime"  # founder_lifetime | premium_yearly | premium_monthly


@router.post("/admin/upgrade")
async def admin_upgrade_user(
    req: AdminUpgradeRequest,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    管理接口：手动升级用户会员（CRON_SECRET 鉴权）
    """
    # 鉴权
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET not configured")
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.removeprefix("Bearer ").strip()
    if not hmac.compare_digest(token, settings.CRON_SECRET):
        raise HTTPException(status_code=403, detail="Invalid token")

    # 查找用户
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    # 升级
    order_no = f"ADMIN-{uuid.uuid4().hex[:8].upper()}"

    if req.tier == "founder_lifetime" and not user.is_founder:
        await _activate_founder_seat(user, order_no, db)
    elif req.tier in ("premium_monthly", "premium_yearly"):
        await _activate_subscription(user, req.tier, db)
    else:
        raise HTTPException(status_code=400, detail=f"不支持的 tier: {req.tier}")

    await db.commit()

    return {
        "success": True,
        "email": user.email,
        "tier": req.tier,
        "is_premium": user.is_premium,
        "is_founder": user.is_founder,
        "stardust_balance": user.stardust_balance,
    }
