"""Offline contract tests for the Paddle payment boundary."""

import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))

from services.pricing import get_price_quote, public_catalog


class PaymentSafetyContractTest(unittest.TestCase):
    def test_public_catalog_matches_payable_server_quotes(self):
        catalog = public_catalog("international")

        self.assertEqual(catalog["region"], "international")
        self.assertEqual(catalog["currency"], "USD")
        for sku in (
            "membership_monthly",
            "membership_yearly",
            "reflection_report",
            "credits_small",
            "credits_medium",
            "credits_large",
        ):
            quote = get_price_quote(sku, "international")
            public_quote = catalog["items"][sku]
            self.assertEqual(public_quote["amount_minor"], quote.amount_minor)
            self.assertEqual(public_quote["currency"], quote.currency)
            self.assertEqual(public_quote["amount"], quote.amount)

    def test_checkout_has_a_configuration_gate_before_the_paddle_request(self):
        source = self._paddle_source()
        gate = source.index("if not settings.PADDLE_ENABLED or not settings.PADDLE_API_KEY:")
        network_call = source.index('await client.post(f"{settings.PADDLE_API_BASE_URL.rstrip(\'/\')}/transactions"')
        self.assertLess(gate, network_call)
        self.assertIn('raise HTTPException(status_code=503, detail="Paddle checkout is not configured")', source)

    def test_only_the_paddle_router_is_registered(self):
        source = Path(__file__).parent.joinpath("api", "routers", "payments", "__init__.py").read_text(encoding="utf-8")
        self.assertIn("from .paddle import router as paddle_router", source)
        self.assertIn("router.include_router(paddle_router)", source)
        self.assertNotIn("stripe_router", source)

    @staticmethod
    def _paddle_source() -> str:
        return Path(__file__).parent.joinpath("api", "routers", "payments", "paddle.py").read_text(encoding="utf-8")


if __name__ == "__main__":
    unittest.main()
