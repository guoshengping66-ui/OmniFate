"""
api/routers/personal_payments.py
个人收款码支付接口 - 安全支付实现
"""
from __future__ import annotations
import uuid
import time
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from database.session import get_db
from database.models import Order, OrderStatus, Reading, PaymentStatus, User
from auth.dependencies import get_current_user, require_user
from config import get_settings

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
    """生成支付验证token"""
    secret = settings.SECRET_KEY[:16]
    return hashlib.sha256(f"{secret}:{order_no}:{time.time()}".encode()).hexdigest()[:16]


# ─── 数据库操作 ─────────────────────────────────────────────────────────────────

async def _create_order(
    db: AsyncSession,
    amount: float,
    payment_method: str,
    description: str,
    reading_id: str = "",
    user_id: str = "",
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
    payload: QRPayload,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    创建收款码支付订单

    返回支付宝/微信收款码URL，供前端展示
    """
    # 1. 验证金额
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="金额必须大于0")
    if payload.amount > 50000:
        raise HTTPException(status_code=400, detail="单笔金额不能超过5万元")

    # 2. 验证支付方式
    method = payload.currency.upper()
    if method not in ("CNY", "CNY_ALIPAY", "CNY_WECHAT", "USD_PAYPAL"):
        raise HTTPException(status_code=400, detail="不支持的支付方式")

    # 3. 创建订单
    payment_method = "alipay" if "ALIPAY" in method else ("wechat" if "WECHAT" in method else "paypal")
    order = await _create_order(
        db=db,
        amount=payload.amount,
        payment_method=payment_method,
        description=payload.description or "命盘智镜 - AI分析服务",
        reading_id=payload.reading_id,
        user_id=current_user.id if current_user else payload.user_id,
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


@router.post("/verify")
async def verify_payment(
    payload: PaymentVerify,
    db: AsyncSession = Depends(get_db),
):
    """
    验证支付（手动确认）

    用户付款后提交订单号进行确认
    """
    # 1. 获取订单
    order = await _get_pending_order(db, payload.order_no)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在或已处理")

    # 2. 标记为已验证（等待人工/系统确认）
    order.status = OrderStatus.processing
    order.payment_ref = f"{order.order_no}_verified"
    await db.commit()

    return {
        "success": True,
        "order_no": order.order_no,
        "status": "processing",
        "message": "支付已提交，等待确认",
    }


@router.post("/confirm")
async def confirm_payment(
    order_no: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    确认支付完成（需登录）

    确认收款后解锁内容
    """
    # 1. 获取订单
    order = await _get_pending_order(db, order_no)
    if not order:
        # 尝试获取处理中的订单
        result = await db.execute(
            select(Order).where(
                Order.order_no == order_no,
                Order.status == OrderStatus.processing,
            )
        )
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="订单不存在")

    # 2. 更新订单状态
    order.status = OrderStatus.paid
    order.paid_at = datetime.now(timezone.utc)

    # 3. 解锁报告（如果有）
    try:
        # 从notes字段提取reading_id
        notes = order.notes or ""
        if "reading_id:" in notes:
            reading_id = notes.split("reading_id:")[1].split("|")[0]
            if reading_id:
                reading_result = await db.execute(select(Reading).where(Reading.id == reading_id))
                reading = reading_result.scalar_one_or_none()
                if reading:
                    reading.is_detail_unlocked = True
                    reading.payment_status = PaymentStatus.paid
                    # 发放优惠券
                    if reading.user_id:
                        user_result = await db.execute(select(User).where(User.id == reading.user_id))
                        user = user_result.scalar_one_or_none()
                        if user and (user.shop_coupon_balance or 0) == 0:
                            user.shop_coupon_balance = 60
    except Exception:
        pass  # 单个解锁失败不影响整体

    await db.commit()

    return {
        "success": True,
        "order_no": order.order_no,
        "status": "paid",
        "message": "支付已确认",
    }


@router.get("/status/{order_no}")
async def check_order_status(
    order_no: str,
    db: AsyncSession = Depends(get_db),
):
    """
    查询订单状态

    前端轮询此接口检查支付状态
    """
    result = await db.execute(
        select(Order).where(Order.order_no == order_no)
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
