"""Admin payment endpoints."""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import Reading, User, Order, OrderStatus
from utils.cron_auth import require_admin

logger = logging.getLogger(__name__)
router = APIRouter()


class AdminOrderStatusUpdate(BaseModel):
    status: str
    tracking_number: Optional[str] = None


class ApproveRefundRequest(BaseModel):
    refund_amount: Optional[float] = None
    refund_note: Optional[str] = None


class RejectRefundRequest(BaseModel):
    reason: str


@router.get("/admin/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    _auth: str = Depends(require_admin),
):
    """管理员仪表盘统计"""
    # Optimized: single query for all user/order stats
    stats_result = await db.execute(
        select(
            func.count(User.id).label("total_users"),
            func.count().filter(User.is_premium == True).label("paid_users"),
            func.count().filter(User.is_founder == True).label("founder_users"),
        )
    )
    user_stats = stats_result.one()
    total_users = user_stats.total_users or 0
    paid_users = user_stats.paid_users or 0
    founder_users = user_stats.founder_users or 0

    total_readings = (await db.execute(select(func.count(Reading.id)))).scalar() or 0

    # Single query for order stats
    order_stats_result = await db.execute(
        select(
            func.count(Order.id).filter(Order.item_type == "shop").label("total_orders"),
            func.coalesce(func.sum(Order.total_cny).filter(
                Order.status == OrderStatus.paid, Order.item_type == "shop"
            ), 0).label("total_revenue"),
        )
    )
    order_stats = order_stats_result.one()
    total_orders = order_stats.total_orders or 0
    total_revenue = float(order_stats.total_revenue or 0)

    recent_users_result = await db.execute(
        select(User).order_by(User.created_at.desc()).limit(20)
    )
    recent_users = [
        {"email": u.email, "nickname": u.display_name, "created_at": u.created_at.isoformat() if u.created_at else None}
        for u in recent_users_result.scalars().all()
    ]

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


@router.get("/admin/shop-orders")
async def list_shop_orders(
    status: Optional[str] = Query(None, description="按状态筛选"),
    item_type: Optional[str] = Query(None, description="按类型筛选"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _auth: str = Depends(require_admin),
):
    """管理员查看所有订单"""
    base_filter = [Order.item_type != None] if not item_type else [Order.item_type == item_type]

    query = (
        select(Order)
        .where(*base_filter)
        .options(joinedload(Order.items), joinedload(Order.user))
    )
    if status:
        query = query.where(Order.status == status)
    query = query.order_by(Order.created_at.desc())

    count_result = await db.execute(
        select(func.count()).select_from(
            select(Order.id).where(*base_filter).subquery()
        )
    )
    total = count_result.scalar() or 0

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
            "item_type": order.item_type,
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
    _auth: str = Depends(require_admin),
):
    """管理员查看订单详情"""
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
    _auth: str = Depends(require_admin),
):
    """管理员更新商城订单状态"""
    valid_statuses = {"pending", "processing", "paid", "shipped", "delivered", "cancelled"}
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"无效状态，可选: {', '.join(valid_statuses)}")

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

    logger.info(f"[ADMIN] Order {order_no} status: {old_status} → {payload.status}")

    await db.commit()

    return {
        "success": True,
        "order_no": order.order_no,
        "status": order.status.value,
        "tracking_number": order.tracking_number,
    }


@router.post("/admin/shop-orders/{order_no}/approve-refund")
async def approve_refund(
    order_no: str,
    req: ApproveRefundRequest,
    db: AsyncSession = Depends(get_db),
    _auth: str = Depends(require_admin),
):
    """管理员批准退款"""
    result = await db.execute(
        select(Order).where(Order.order_no == order_no, Order.item_type == "shop")
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status != OrderStatus.pending_refund:
        raise HTTPException(status_code=400, detail="该订单不在退款审核状态")

    refund_amount = req.refund_amount if req.refund_amount is not None else float(order.total_cny)
    if refund_amount <= 0 or refund_amount > float(order.total_cny):
        raise HTTPException(status_code=400, detail=f"退款金额必须在 0.01-{float(order.total_cny)} 之间")

    order.status = OrderStatus.refunded
    order.refund_amount = refund_amount
    order.refund_note = req.refund_note
    order.refund_processed_at = datetime.now(timezone.utc)

    logger.info(f"[ADMIN] Order {order_no} refund APPROVED: ¥{refund_amount}")

    await db.commit()

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
    _auth: str = Depends(require_admin),
):
    """管理员拒绝退款"""
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

    order.status = OrderStatus.paid if order.paid_at else OrderStatus.pending
    reject_note = f"[退款拒绝] {req.reason.strip()}"
    order.notes = f"{order.notes}\n{reject_note}".strip() if order.notes else reject_note
    order.refund_reason = None
    order.refund_requested_at = None

    logger.info(f"[ADMIN] Order {order_no} refund REJECTED: {req.reason.strip()}")

    await db.commit()

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
        "status": order.status.value if order.status else "pending",
    }
