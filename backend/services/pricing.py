"""Server-side pricing and region policy.

The frontend may display a region preference, but payable region and amounts are
always resolved here. Amounts are stored in minor units for payment providers.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

from fastapi import HTTPException, Request


Region = str  # "domestic" | "overseas"


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
    stripe_price_id: str | None = None
    label: str = ""

    def snapshot(self) -> dict[str, Any]:
        return asdict(self)


_CATALOG: dict[str, dict[str, dict[str, Any]]] = {
    "premium_monthly": {
        "domestic": {"currency": "cny", "amount": 59.0, "mode": "subscription", "interval": "month", "label": "Fate OS Monthly"},
        "overseas": {"currency": "usd", "amount": 14.99, "mode": "subscription", "interval": "month", "label": "Fate OS Monthly"},
    },
    "premium_yearly": {
        "domestic": {"currency": "cny", "amount": 365.0, "mode": "subscription", "interval": "year", "label": "Fate OS Yearly"},
        "overseas": {"currency": "usd", "amount": 99.0, "mode": "subscription", "interval": "year", "label": "Fate OS Yearly"},
    },
    "unlock_report": {
        "domestic": {"currency": "cny", "amount": 19.9, "label": "Profile Mirror Report Unlock"},
        "overseas": {"currency": "usd", "amount": 9.9, "label": "Profile Mirror Report Unlock"},
    },
    "onetime_unlock": {
        "domestic": {"currency": "cny", "amount": 19.9, "label": "Profile Mirror One-time Unlock"},
        "overseas": {"currency": "usd", "amount": 9.9, "label": "Profile Mirror One-time Unlock"},
    },
    "founder_lifetime": {
        "domestic": {"currency": "cny", "amount": 1688.0, "label": "Profile Mirror Founder Lifetime Membership"},
        "overseas": {"currency": "usd", "amount": 499.0, "label": "Profile Mirror Founder Lifetime Membership"},
    },
}

ALLOWED_PAYMENT_METHODS: dict[Region, set[str]] = {
    "domestic": {"stripe", "alipay", "wechat", "wechat_pay", "personal"},
    "overseas": {"stripe", "paypal"},
}


def _minor_units(amount: float | Decimal) -> int:
    value = Decimal(str(amount)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return int((value * 100).to_integral_value(rounding=ROUND_HALF_UP))


def _country_to_region(country: str) -> Region:
    return "domestic" if country.upper() == "CN" else "overseas"


def resolve_pricing_region(request: Request | None = None, user: Any | None = None) -> Region:
    """Resolve the payable region. User lock beats request hints."""
    locked = getattr(user, "pricing_region", None)
    if locked in ("domestic", "overseas"):
        return locked

    if request is not None:
        country = (
            request.headers.get("cf-ipcountry")
            or request.headers.get("x-vercel-ip-country")
            or request.headers.get("x-country-code")
            or ""
        )
        if country:
            return _country_to_region(country)

        # Local/dev fallback: honor cookie only outside real edge geo headers.
        cookie_region = request.cookies.get("region", "")
        if cookie_region in ("domestic", "overseas"):
            return cookie_region

    return "overseas"


def lock_user_region(user: Any, region: Region) -> None:
    if getattr(user, "pricing_region", None) not in ("domestic", "overseas"):
        user.pricing_region = region


def get_price_quote(sku: str, region: Region) -> PriceQuote:
    region = "domestic" if region == "domestic" else "overseas"
    sku_prices = _CATALOG.get(sku)
    if not sku_prices:
        raise HTTPException(status_code=400, detail="Invalid item type")
    data = sku_prices[region]
    amount = float(data["amount"])
    cny_amount = amount if data["currency"] == "cny" else float(sku_prices["domestic"]["amount"])
    usd_amount = amount if data["currency"] == "usd" else float(sku_prices["overseas"]["amount"])
    return PriceQuote(
        sku=sku,
        region=region,
        currency=data["currency"],
        amount_minor=_minor_units(amount),
        amount=amount,
        cny_amount=cny_amount,
        usd_amount=usd_amount,
        mode=data.get("mode", "payment"),
        interval=data.get("interval"),
        stripe_price_id=data.get("stripe_price_id"),
        label=data.get("label", sku),
    )


def quote_custom_amount(*, sku: str, region: Region, amount_cny: float, amount_usd: float, label: str) -> PriceQuote:
    region = "domestic" if region == "domestic" else "overseas"
    amount = float(amount_cny if region == "domestic" else amount_usd)
    currency = "cny" if region == "domestic" else "usd"
    return PriceQuote(
        sku=sku,
        region=region,
        currency=currency,
        amount_minor=_minor_units(amount),
        amount=amount,
        cny_amount=float(amount_cny),
        usd_amount=float(amount_usd),
        label=label,
    )


def validate_payment_method(region: Region, method: str) -> None:
    if method not in ALLOWED_PAYMENT_METHODS.get(region, set()):
        raise HTTPException(status_code=403, detail="Payment method not available for your region")


def public_catalog(region: Region) -> dict[str, Any]:
    region = "domestic" if region == "domestic" else "overseas"
    return {
        "region": region,
        "currency": "CNY" if region == "domestic" else "USD",
        "symbol": "¥" if region == "domestic" else "$",
        "items": {sku: get_price_quote(sku, region).snapshot() for sku in _CATALOG},
    }
