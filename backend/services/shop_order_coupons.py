"""Coupon reservation helpers for shop orders."""

from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from typing import Any


def restore_coupon_for_cancelled_order(order: Any, user: Any) -> Decimal:
    """Return a reserved shop coupon once after an order is safely cancelled."""
    snapshot = getattr(order, "price_snapshot", None)
    if not isinstance(snapshot, dict) or snapshot.get("coupon_restored"):
        return Decimal("0")

    coupon_used = Decimal(str(snapshot.get("coupon_used") or 0)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    if coupon_used <= 0:
        return Decimal("0")

    balance = Decimal(str(getattr(user, "shop_coupon_balance", 0) or 0))
    user.shop_coupon_balance = balance + coupon_used
    order.price_snapshot = {**snapshot, "coupon_restored": True}
    return coupon_used
