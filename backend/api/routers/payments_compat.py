"""
api/routers/payments.py — Compatibility shim.

The monolithic payments.py has been refactored into a package at payments/.
This file re-exports the router for backward compatibility.
"""

from payments import router

# Re-export all public names for backward compatibility
from payments.utils import get_client_region, validate_payment_region, is_effective_founder
from payments.constants import (
    PRODUCT_PRICES, SUBSCRIPTION_GRANTS, GRANT_ON_REPORT_UNLOCK,
    SHOP_COUPON_AMOUNT, TRIAL_DAYS, EVENT_RETRO_PRICE,
)
from payments.subscriptions import activate_subscription
from payments.founder import activate_founder_seat_logic, FOUNDER_TOTAL_DOMESTIC, FOUNDER_TOTAL_OVERSEAS
from payments.unlock import activate_onetime_unlock, handle_onetime_unlock_activation, _unlock_reading
