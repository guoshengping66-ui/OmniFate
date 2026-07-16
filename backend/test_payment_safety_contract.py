"""Offline contract tests for the Stripe payment boundary.

These tests never contact Stripe and cannot create a payment or an order.
"""

import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))

from services.pricing import get_price_quote, public_catalog


class PaymentSafetyContractTest(unittest.TestCase):
    def test_public_catalog_matches_payable_server_quotes(self):
        catalog = public_catalog("overseas")

        self.assertEqual(catalog["region"], "overseas")
        self.assertEqual(catalog["currency"], "USD")
        for sku in ("premium_monthly", "premium_yearly", "unlock_report", "onetime_unlock", "founder_lifetime"):
            quote = get_price_quote(sku, "overseas")
            public_quote = catalog["items"][sku]
            self.assertEqual(public_quote["amount_minor"], quote.amount_minor)
            self.assertEqual(public_quote["currency"], quote.currency)
            self.assertEqual(public_quote["amount"], quote.amount)

    def test_checkout_has_a_configuration_gate_before_the_network_call(self):
        source = self._stripe_source()
        gate = source.index("if not settings.STRIPE_ENABLED or not settings.STRIPE_SECRET_KEY:")
        network_call = source.index('await client.post(\n            "https://api.stripe.com/v1/checkout/sessions"')
        self.assertLess(gate, network_call)
        self.assertIn('raise HTTPException(status_code=400, detail="Stripe is not configured")', source)

    def test_checkout_uses_an_order_specific_idempotency_key(self):
        source = self._stripe_source()
        self.assertIn('"Idempotency-Key": f"checkout-{order_no}"', source)
        self.assertIn('"metadata[amount_minor]": metadata["amount_minor"]', source)
        self.assertIn('data["payment_intent_data[metadata][order_no]"] = metadata["order_no"]', source)

    def test_checkout_session_expires_with_the_pending_order_window(self):
        source = self._stripe_source()
        self.assertIn('"expires_at": str(int(time.time()) + 30 * 60)', source)

    def test_shop_checkout_preserves_the_original_price_snapshot(self):
        source = self._stripe_source()
        self.assertIn('"checkout_quote": quote.snapshot(),', source)

    @staticmethod
    def _stripe_source() -> str:
        return Path(__file__).parent.joinpath("api", "routers", "payments", "stripe.py").read_text(encoding="utf-8")


if __name__ == "__main__":
    unittest.main()
