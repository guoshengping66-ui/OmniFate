"""Founder seat endpoints and activation logic."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user, require_user
from config import get_settings
from database.models import CreditTransaction, FounderFeedback, FounderVote, Order, OrderStatus, User
from database.session import get_db

from .constants import SUBSCRIPTION_GRANTS
from .utils import is_effective_founder

router = APIRouter()
settings = get_settings()

FOUNDER_TOTAL_DOMESTIC = 100
FOUNDER_TOTAL_OVERSEAS = 100


class FounderVoteRequest(BaseModel):
    feature_id: str = Field(..., min_length=1, max_length=100)


class FounderFeedbackRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


async def activate_founder_seat_logic(
    user: User,
    order_no: str,
    db: AsyncSession,
    region: str | None = None,
) -> dict:
    """Activate a founder seat in the paid order's region."""
    now = datetime.now(timezone.utc)
    grant_amount = SUBSCRIPTION_GRANTS["founder_lifetime"]
    seat_region = "domestic" if region == "domestic" else "overseas"

    for attempt in range(5):
        count_result = await db.execute(
            select(func.count()).select_from(User).where(
                User.is_founder == True,
                User.founder_region == seat_region,
                User.founder_seat_no.isnot(None),
                User.founder_activated_at.isnot(None),
            ).with_for_update()
        )
        sold_count = count_result.scalar() or 0
        limit = FOUNDER_TOTAL_DOMESTIC if seat_region == "domestic" else FOUNDER_TOTAL_OVERSEAS
        if sold_count >= limit:
            raise HTTPException(status_code=400, detail="Founder seats for this region are sold out")

        seat_no = sold_count + 1 if seat_region == "domestic" else FOUNDER_TOTAL_DOMESTIC + sold_count + 1
        user.is_founder = True
        user.founder_seat_no = seat_no
        user.founder_region = seat_region
        user.founder_activated_at = now
        user.subscription_tier = "founder_lifetime"
        user.is_premium = True
        user.premium_expires_at = None
        user.stardust_balance += grant_amount
        user.stardust_lifetime_earned += grant_amount

        db.add(CreditTransaction(
            user_id=user.id,
            amount=grant_amount,
            balance_after=user.stardust_balance,
            reason="founder_grant",
            reference_id=order_no,
            status="confirmed",
        ))

        try:
            await db.flush()
            return {"seat_no": seat_no, "region": seat_region, "grant_amount": grant_amount}
        except IntegrityError:
            await db.rollback()
            if attempt == 4:
                raise HTTPException(status_code=500, detail="Failed to assign founder seat after retries")
            re_fetch = await db.execute(select(User).where(User.id == user.id).with_for_update())
            user = re_fetch.scalar_one_or_none()
            if not user:
                raise HTTPException(status_code=500, detail="User not found after rollback")

    raise HTTPException(status_code=500, detail="Failed to assign founder seat")

@router.get("/founder/status")
async def get_founder_status(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    domestic_result = await db.execute(
        select(func.count()).select_from(User).where(
            User.is_founder == True,
            User.founder_region == "domestic",
            User.founder_seat_no.isnot(None),
            User.founder_activated_at.isnot(None),
        )
    )
    overseas_result = await db.execute(
        select(func.count()).select_from(User).where(
            User.is_founder == True,
            User.founder_region == "overseas",
            User.founder_seat_no.isnot(None),
            User.founder_activated_at.isnot(None),
        )
    )
    domestic_sold = domestic_result.scalar() or 0
    overseas_sold = overseas_result.scalar() or 0
    total_seats = FOUNDER_TOTAL_DOMESTIC + FOUNDER_TOTAL_OVERSEAS
    sold_seats = domestic_sold + overseas_sold
    return {
        "total_seats": total_seats,
        "sold_seats": sold_seats,
        "remaining_seats": total_seats - sold_seats,
        "domestic_total": FOUNDER_TOTAL_DOMESTIC,
        "domestic_sold": domestic_sold,
        "overseas_total": FOUNDER_TOTAL_OVERSEAS,
        "overseas_sold": overseas_sold,
        "is_founder": current_user.is_founder if current_user else False,
        "seat_no": current_user.founder_seat_no if current_user else None,
        "seat_region": current_user.founder_region if current_user else None,
    }


@router.get("/founder/seats")
async def list_founder_seats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User.founder_seat_no, User.founder_region, User.display_name, User.created_at)
        .where(
            User.is_founder == True,
            User.founder_seat_no.isnot(None),
            User.founder_activated_at.isnot(None),
        )
        .order_by(User.founder_seat_no)
    )
    return {
        "seats": [
            {
                "seat_no": row[0],
                "region": row[1],
                "name": row[2] or "Anonymous",
                "activated_at": row[3].isoformat() if row[3] else None,
            }
            for row in result.all()
        ]
    }


@router.post("/founder/activate")
async def activate_founder_seat(
    order_no: str = Query(..., description="paid order number"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if current_user.is_founder:
        raise HTTPException(status_code=400, detail="You already have a founder seat")

    order_region = current_user.pricing_region
    if not settings.DEBUG:
        order_result = await db.execute(
            select(Order).where(Order.order_no == order_no, Order.user_id == current_user.id)
        )
        order = order_result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.status != OrderStatus.paid:
            raise HTTPException(status_code=400, detail="Order is not paid")
        order_region = order.pricing_region

    result = await db.execute(select(User).where(User.id == current_user.id).with_for_update())
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    info = await activate_founder_seat_logic(user, order_no, db, region=order_region)
    await db.commit()
    return {
        "status": "activated",
        "seat_no": info["seat_no"],
        "region": info["region"],
        "stardust_granted": info["grant_amount"],
        "message": f"Founder seat #{info['seat_no']} activated",
    }


@router.post("/founder/vote")
async def vote_feature(
    req: FounderVoteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if not is_effective_founder(current_user):
        raise HTTPException(status_code=403, detail="Founder membership required")
    existing = await db.execute(select(FounderVote).where(
        FounderVote.user_id == current_user.id,
        FounderVote.feature_id == req.feature_id,
    ))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already voted")
    db.add(FounderVote(user_id=current_user.id, feature_id=req.feature_id))
    await db.commit()
    return {"status": "voted", "feature_id": req.feature_id}


@router.post("/founder/feedback")
async def submit_founder_feedback(
    req: FounderFeedbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if not is_effective_founder(current_user):
        raise HTTPException(status_code=403, detail="Founder membership required")
    db.add(FounderFeedback(user_id=current_user.id, content=req.content))
    await db.commit()
    return {"status": "submitted", "message": "Thank you for the feedback"}
