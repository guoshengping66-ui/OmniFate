import os
import sys
import unittest
from datetime import date

sys.path.insert(0, os.path.dirname(__file__))

from calculators.ziwei_calculator import (
    DIZHI_ORDER,
    ZiweiAnnualMonthlyTransit,
    calculate_annual_monthly_transit,
)


class ZiweiAnnualMonthlyTransitTest(unittest.TestCase):
    def setUp(self):
        self.natal = {
            "ming_gong_dizhi": "寅",
            "main_star_positions": {
                "天同": "命宫",
                "廉贞": "财帛",
                "紫微": "官禄",
            },
        }

    def test_fixed_august_case_maps_annual_transformations_and_palaces(self):
        transit = calculate_annual_monthly_transit(self.natal, date(2026, 8, 1))

        self.assertEqual(transit.year_ganzhi, "丙午")
        self.assertEqual(transit.month_ganzhi, "乙未")
        self.assertEqual(transit.annual_ming_gong, "午")
        self.assertEqual(transit.monthly_ming_gong, "亥")
        self.assertEqual(
            transit.annual_transformations,
            {"化禄": "天同", "化权": "天机", "化科": "文昌", "化忌": "廉贞"},
        )
        self.assertEqual(
            transit.transformation_palaces,
            {"天同": "命宫", "廉贞": "财帛"},
        )

    def test_target_month_changes_solar_term_branch_and_monthly_ming_gong(self):
        august = calculate_annual_monthly_transit(self.natal, date(2026, 8, 1))
        september = calculate_annual_monthly_transit(self.natal, date(2026, 9, 1))

        self.assertEqual(august.month_ganzhi, "\u4e59\u672a")
        self.assertEqual(august.monthly_ming_gong, "\u4ea5")
        self.assertEqual(september.month_ganzhi, "\u4e19\u7533")
        self.assertEqual(september.monthly_ming_gong, "\u5b50")

    def test_dizhi_palace_mapping_wraps_with_modulo_twelve(self):
        natal = {
            "ming_gong_dizhi": DIZHI_ORDER[-1],
            "main_star_positions": {"\u5929\u540c": "\u547d\u5bab"},
        }

        transit = calculate_annual_monthly_transit(natal, date(2026, 8, 1))

        self.assertEqual(transit.annual_ming_gong, "\u5df3")
        self.assertEqual(transit.monthly_ming_gong, "\u620c")

    def test_transit_mappings_are_runtime_immutable(self):
        transit = calculate_annual_monthly_transit(self.natal, date(2026, 8, 1))

        self.assertIsInstance(transit, ZiweiAnnualMonthlyTransit)
        with self.assertRaises(TypeError):
            transit.annual_transformations["\u5316\u7984"] = "\u5929\u673a"
        with self.assertRaises(TypeError):
            transit.transformation_palaces["\u5929\u540c"] = "\u7236\u6bcd"

    def test_cross_year_date_changes_year_stem_and_transformations(self):
        current = calculate_annual_monthly_transit(self.natal, date(2026, 8, 1))
        next_year = calculate_annual_monthly_transit(self.natal, date(2027, 8, 1))

        self.assertNotEqual(current.year_ganzhi[0], next_year.year_ganzhi[0])
        self.assertNotEqual(current.annual_transformations, next_year.annual_transformations)

    def test_missing_natal_fields_return_none(self):
        self.assertIsNone(calculate_annual_monthly_transit({}, date(2026, 8, 1)))
        self.assertIsNone(
            calculate_annual_monthly_transit(
                {"ming_gong_dizhi": "寅", "main_star_positions": {}},
                date(2026, 8, 1),
            )
        )
        self.assertIsNone(
            calculate_annual_monthly_transit(
                {"ming_gong_dizhi": "invalid", "main_star_positions": {"天同": "命宫"}},
                date(2026, 8, 1),
            )
        )


if __name__ == "__main__":
    unittest.main()
