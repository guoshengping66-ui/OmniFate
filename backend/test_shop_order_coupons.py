"""Contract tests for coupon recovery on cancelled shop orders."""

import os
import sys
import unittest
from decimal import Decimal
from types import SimpleNamespace

sys.path.insert(0, os.path.dirname(__file__))

from services.shop_order_coupons import restore_coupon_for_cancelled_order


class ShopOrderCouponTest(unittest.TestCase):
    def test_restores_reserved_coupon_once_and_records_the_recovery(self):
        user = SimpleNamespace(shop_coupon_balance=Decimal("5.00"))
        order = SimpleNamespace(price_snapshot={"coupon_used": 12.5})

        restored = restore_coupon_for_cancelled_order(order, user)

        self.assertEqual(restored, Decimal("12.50"))
        self.assertEqual(user.shop_coupon_balance, Decimal("17.50"))
        self.assertTrue(order.price_snapshot["coupon_restored"])
        self.assertEqual(restore_coupon_for_cancelled_order(order, user), Decimal("0"))
        self.assertEqual(user.shop_coupon_balance, Decimal("17.50"))

    def test_ignores_orders_without_a_coupon_reservation(self):
        user = SimpleNamespace(shop_coupon_balance=Decimal("5.00"))
        order = SimpleNamespace(price_snapshot={"items": []})

        self.assertEqual(restore_coupon_for_cancelled_order(order, user), Decimal("0"))
        self.assertEqual(user.shop_coupon_balance, Decimal("5.00"))
