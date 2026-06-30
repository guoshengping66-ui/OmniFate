"""Payment constants, prices, and configuration."""

from config import get_settings

settings = get_settings()

# ── Admin emails cache ──────────────────────────────────────────────────────
_admin_emails_cached = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]

# ── Business constants ──────────────────────────────────────────────────────
SHOP_COUPON_AMOUNT = 50  # 首次解锁报告赠送代金券
TRIAL_DAYS = 3
EVENT_RETRO_PRICE = 19.9

# ── Server-side price list (clients CANNOT override these) ───────────────────
# Prices in CNY for domestic Stripe Checkout, USD for overseas Stripe Checkout.
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

# ── Region-to-payment-method validation ──────────────────────────────────────
# Prevents cross-region price abuse while keeping Stripe as the only processor.
ALLOWED_METHODS = {
    "domestic": {"stripe"},
    "overseas": {"stripe"},
}
