"""
Payments package — modular payment endpoints.

This package re-exports a single `router` that combines all payment sub-routers.
Original monolithic payments.py has been split into:
- constants.py: Prices, stardust grants, config
- utils.py: Region detection, founder check
- subscriptions.py: Subscription activation logic
- founder.py: Founder seat endpoints
- stripe.py: Stripe payment endpoints
- unlock.py: Report unlock endpoints
- shop.py: Shop order endpoints
- admin.py: Admin payment endpoints
"""

from fastapi import APIRouter

from .unlock import router as unlock_router
from .shop import router as shop_router
from .stripe import router as stripe_router
from .founder import router as founder_router
from .admin import router as admin_router
from .pricing import router as pricing_router

router = APIRouter()

router.include_router(unlock_router)
router.include_router(shop_router)
router.include_router(stripe_router)
router.include_router(founder_router)
router.include_router(admin_router)
router.include_router(pricing_router)
