"""Server-owned digital billing catalogue and region policy."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

from fastapi import HTTPException, Request

from config import get_settings


Region = str  # "cn" | "international"


@dataclass(frozen=True)
class PriceQuote:
    sku: str
    region: Region
    currency: str
    amount_minor: int
    amount: float
    cny_amount: float
    usd_amount: float
    mode: str = "payment"
    interval: str | None = None
    paddle_price_id: str | None = None
    credits: int = 0
    label: str = ""

    def snapshot(self) -> dict[str, Any]:
        return asdict(self)


_CATALOG: dict[str, dict[Region, dict[str, Any]]] = {
    "membership_monthly": {
        "cn": {"currency": "CNY", "amount": 59.0, "mode": "subscription", "interval": "month", "label": "KhanFate Monthly Membership"},
        "international": {"currency": "USD", "amount": 14.99, "mode": "subscription", "interval": "month", "label": "KhanFate Monthly Membership"},
    },
    "membership_yearly": {
        "cn": {"currency": "CNY", "amount": 365.0, "mode": "subscription", "interval": "year", "label": "KhanFate Yearly Membership"},
        "international": {"currency": "USD", "amount": 99.0, "mode": "subscription", "interval": "year", "label": "KhanFate Yearly Membership"},
    },
    "reflection_report": {
        "cn": {"currency": "CNY", "amount": 19.9, "label": "KhanFate Personal Reflection Report"},
        "international": {"currency": "USD", "amount": 9.9, "label": "KhanFate Personal Reflection Report"},
    },
    "credits_small": {
        "cn": {"currency": "CNY", "amount": 19.9, "credits": 100, "label": "KhanFate Credits — Small"},
        "international": {"currency": "USD", "amount": 2.99, "credits": 100, "label": "KhanFate Credits — Small"},
    },
    "credits_medium": {
        "cn": {"currency": "CNY", "amount": 49.9, "credits": 300, "label": "KhanFate Credits — Medium"},
        "international": {"currency": "USD", "amount": 6.99, "credits": 300, "label": "KhanFate Credits — Medium"},
    },
    "credits_large": {
        "cn": {"currency": "CNY", "amount": 99.9, "credits": 700, "label": "KhanFate Credits — Large"},
        "international": {"currency": "USD", "amount": 13.99, "credits": 700, "label": "KhanFate Credits — Large"},
    },
}

_PADDLE_PRICE_SETTINGS = {
    "membership_monthly": "PADDLE_PRICE_MEMBERSHIP_MONTHLY",
    "membership_yearly": "PADDLE_PRICE_MEMBERSHIP_YEARLY",
    "reflection_report": "PADDLE_PRICE_REFLECTION_REPORT",
    "credits_small": "PADDLE_PRICE_CREDITS_SMALL",
    "credits_medium": "PADDLE_PRICE_CREDITS_MEDIUM",
    "credits_large": "PADDLE_PRICE_CREDITS_LARGE",
}


def _minor_units(amount: float | Decimal) -> int:
    value = Decimal(str(amount)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return int((value * 100).to_integral_value(rounding=ROUND_HALF_UP))


def resolve_pricing_region(request: Request | None = None, user: Any | None = None) -> Region:
    """Use only a persisted billing country; never read a client-selected region."""
    country = str(getattr(user, "billing_country", "") or "").upper()
    return "cn" if country == "CN" else "international"


def lock_user_region(user: Any, region: Region) -> None:
    user.pricing_region = region


def get_price_quote(sku: str, region: Region) -> PriceQuote:
    if region not in {"cn", "international"}:
        raise HTTPException(status_code=400, detail="Invalid billing region")
    sku_prices = _CATALOG.get(sku)
    if not sku_prices:
        raise HTTPException(status_code=400, detail="Invalid item type")
    data = sku_prices[region]
    return PriceQuote(
        sku=sku,
        region=region,
        currency=data["currency"],
        amount_minor=_minor_units(data["amount"]),
        amount=float(data["amount"]),
        cny_amount=float(sku_prices["cn"]["amount"]),
        usd_amount=float(sku_prices["international"]["amount"]),
        mode=data.get("mode", "payment"),
        interval=data.get("interval"),
        paddle_price_id=getattr(get_settings(), _PADDLE_PRICE_SETTINGS[sku]),
        credits=int(data.get("credits", 0)),
        label=data["label"],
    )


def allowed_checkout_methods(region: Region, sku: str, *, alipay_enabled: bool) -> set[str]:
    """Describe eligibility; Paddle Checkout makes the final presentation."""
    quote = get_price_quote(sku, region)
    methods = {"card", "paypal"}
    if region == "cn":
        if alipay_enabled:
            methods.add("alipay")
        if quote.mode == "payment":
            methods.add("wechat_pay")
    return methods


def public_catalog(region: Region) -> dict[str, Any]:
    if region not in {"cn", "international"}:
        region = "international"
    return {
        "region": region,
        "currency": "CNY" if region == "cn" else "USD",
        "symbol": "¥" if region == "cn" else "$",
        "items": {sku: get_price_quote(sku, region).snapshot() for sku in _CATALOG},
    }
