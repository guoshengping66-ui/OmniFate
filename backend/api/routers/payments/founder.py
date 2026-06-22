"""Founder seat endpoints and logic."""

import secrets
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from database.session import get_db
from database.models import (
    User, Order, FounderVote, FounderFeedback, OrderStatus,
)
from auth.dependencies import get_current_user, require_user
from config import get_settings

from .constants import PRODUCT_PRICES, SUBSCRIPTION_GRANTS
from .utils import is_effective_founder

router = APIRouter()
settings = get_settings()

# Founder seat limits
FOUNDER_TOTAL_DOMESTIC = 100
FOUNDER_TOTAL_OVERSEAS = 100


class FounderVoteRequest(BaseModel):
    feature_id: str = Field(..., min_length=1, max_length=100)


class FounderFeedbackRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


async def activate_founder_seat_logic(user: User, order_no: str, db: AsyncSession) -> dict:
    """
    激活创始席位 — 由 QR 支付确认和正式支付回调调用。
    Uses retry loop with IntegrityError handling to prevent seat number collisions.
    """
    now = datetime.now(timezone.utc)
    grant_amount = SUBSCRIPTION_GRANTS["founder_lifetime"]

    MAX_RETRIES = 5
    for attempt in range(MAX_RETRIES):
        # Count REAL founder seats — must have seat_no AND activated_at
        domestic_count_result = await db.execute(
            select(func.count()).select_from(User).where(
                User.is_founder == True,
                User.founder_region == "domestic",
                User.founder_seat_no.isnot(None),
                User.founder_activated_at.isnot(None),
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
                    User.founder_seat_no.isnot(None),
                    User.founder_activated_at.isnot(None),
                ).with_for_update()
            )
            overseas_count = overseas_count_result.scalar() or 0
            if overseas_count >= FOUNDER_TOTAL_OVERSEAS:
                raise HTTPException(status_code=400, detail="创始席位已售罄")
            region = "overseas"
            seat_no = FOUNDER_TOTAL_DOMESTIC + overseas_count + 1

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

        try:
            await db.flush()
            return {
                "seat_no": seat_no,
                "region": region,
                "grant_amount": grant_amount,
            }
        except IntegrityError:
            await db.rollback()
            if attempt < MAX_RETRIES - 1:
                continue
            raise HTTPException(status_code=500, detail="Failed to assign founder seat after retries")


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

    result = await db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    info = await activate_founder_seat_logic(user, order_no or "mock", db)
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
    if not is_effective_founder(current_user):
        raise HTTPException(status_code=403, detail="仅创始会员可投票")

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
    if not is_effective_founder(current_user):
        raise HTTPException(status_code=403, detail="仅创始会员可提交反馈")

    feedback = FounderFeedback(
        user_id=current_user.id,
        content=req.content,
    )
    db.add(feedback)
    await db.commit()

    return {"status": "submitted", "message": "感谢您的反馈！"}
