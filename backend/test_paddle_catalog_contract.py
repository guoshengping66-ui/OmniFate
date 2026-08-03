"""Contract tests for the Paddle digital-only billing catalogue."""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))

from services.pricing import get_price_quote


class PaddleCatalogContractTest(unittest.TestCase):
    def test_china_credit_pack_uses_cny(self):
        quote = get_price_quote("credits_small", "cn")

        self.assertEqual(quote.region, "cn")
        self.assertEqual(quote.currency, "CNY")
        self.assertEqual(quote.mode, "payment")

    def test_international_credit_pack_uses_usd(self):
        quote = get_price_quote("credits_small", "international")

        self.assertEqual(quote.region, "international")
        self.assertEqual(quote.currency, "USD")
        self.assertEqual(quote.mode, "payment")

    def test_wechat_is_never_available_for_memberships(self):
        from services.pricing import allowed_checkout_methods

        self.assertNotIn(
            "wechat_pay",
            allowed_checkout_methods("cn", "membership_monthly", alipay_enabled=True),
        )

    def test_wechat_is_available_only_for_china_one_time_items(self):
        from services.pricing import allowed_checkout_methods

        self.assertIn(
            "wechat_pay",
            allowed_checkout_methods("cn", "credits_small", alipay_enabled=True),
        )
        self.assertNotIn(
            "wechat_pay",
            allowed_checkout_methods("international", "credits_small", alipay_enabled=True),
        )


if __name__ == "__main__":
    unittest.main()
