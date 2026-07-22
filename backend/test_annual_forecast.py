import os
import sys
import unittest
from datetime import date, datetime, timezone
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(__file__))

from calculators.bazi_calculator import BaziCalculator
from calculators.ziwei_calculator import calculate_annual_monthly_transit
from services.annual_forecast import build_annual_forecast, validate_annual_forecast


class AnnualForecastTest(unittest.TestCase):
    def setUp(self):
        self.as_of = date(2026, 7, 22)
        self.bazi = {
            "day_master_element": "木",
            "yong_shen": "火",
            "xi_shen": "木",
            "ji_shen": "金",
            "chou_shen": "水",
        }
        self.ziwei = {
            "ming_gong_dizhi": "子",
            "twelve_palaces": {
                "子": "命宫", "亥": "兄弟", "戌": "夫妻", "酉": "子女",
                "申": "财帛", "未": "疾厄", "午": "迁移", "巳": "交友",
                "辰": "官禄", "卯": "田宅", "寅": "福德", "丑": "父母",
            },
            "main_star_positions": {
                "天同": "命宫", "廉贞": "财帛", "紫微": "官禄", "武曲": "财帛",
            },
        }
        self.astrology = {
            "planets": {
                "Sun": {"longitude": 110.0},
                "Jupiter": {"longitude": 20.0},
                "Saturn": {"longitude": 200.0},
            }
        }

    @staticmethod
    def varied_transits(target_date, natal_planets):
        aspect_by_month = {
            1: "opposition", 2: "trine", 3: "square", 4: "sextile",
            5: "conjunction", 6: "square", 7: "trine", 8: "opposition",
            9: "sextile", 10: "square", 11: "trine", 12: "conjunction",
        }
        return {
            "transit_planets": {
                "Jupiter": {"longitude": 120.0, "retrograde": target_date.month in {3, 9}},
                "Saturn": {"longitude": 210.0, "retrograde": target_date.month in {6, 12}},
            },
            "transit_natal_aspects": [{
                "transit_planet": "Jupiter",
                "natal_planet": "Sun",
                "aspect": aspect_by_month[target_date.month],
                "orb": 1.0,
            }],
        }

    def build(self, as_of=None):
        return build_annual_forecast(
            self.bazi,
            self.ziwei,
            self.astrology,
            as_of or self.as_of,
            self.varied_transits,
        )

    def test_builds_twelve_months_from_next_complete_calendar_month(self):
        first = self.build()
        second = self.build()

        self.assertEqual(first, second)
        self.assertEqual(first["range_start"], "2026-08")
        self.assertEqual(first["months"][0]["month"], "2026-08")
        self.assertEqual(first["months"][-1]["month"], "2027-07")
        self.assertEqual(len(first["months"]), 12)
        self.assertTrue(validate_annual_forecast(first))

    def test_bazi_evidence_uses_calculated_solar_term_month_pillar(self):
        forecast = self.build()
        expected = BaziCalculator.calculate_transit_pillars(2026, 8, 1)["month_pillar"]
        bazi_evidence = [
            signal for signal in forecast["months"][0]["evidence"]
            if signal["system"] == "bazi"
        ]

        self.assertTrue(bazi_evidence)
        self.assertTrue(any(expected["ganzhi"] in signal["summary"] for signal in bazi_evidence))
        self.assertTrue(any(expected["tiangan_wuxing"] in signal["summary"] for signal in bazi_evidence))
        self.assertTrue(any(expected["dizhi_wuxing"] in signal["summary"] for signal in bazi_evidence))

    def test_ziwei_signals_come_from_annual_monthly_transit(self):
        with patch(
            "services.annual_forecast.calculate_annual_monthly_transit",
            wraps=calculate_annual_monthly_transit,
        ) as lookup:
            forecast = self.build()

        self.assertEqual(lookup.call_count, 12)
        first_transit = calculate_annual_monthly_transit(self.ziwei, date(2026, 8, 1))
        ziwei_evidence = [
            signal for signal in forecast["months"][0]["evidence"]
            if signal["system"] == "ziwei"
        ]
        self.assertTrue(ziwei_evidence)
        self.assertTrue(any(first_transit.month_ganzhi in signal["summary"] for signal in ziwei_evidence))
        self.assertTrue(any(first_transit.monthly_ming_gong in signal["summary"] for signal in ziwei_evidence))
        self.assertTrue(any("化" in signal["summary"] for signal in ziwei_evidence))

    def test_astrology_signals_use_only_returned_transit_facts(self):
        calls = []

        def lookup(target_date, natal_planets):
            calls.append((target_date, natal_planets))
            return self.varied_transits(target_date, natal_planets)

        forecast = build_annual_forecast(self.bazi, self.ziwei, self.astrology, self.as_of, lookup)
        astrology_evidence = [
            signal for signal in forecast["months"][0]["evidence"]
            if signal["system"] == "astrology"
        ]

        self.assertEqual(calls[0][0], datetime(2026, 8, 1, tzinfo=timezone.utc))
        self.assertIs(calls[0][1], self.astrology["planets"])
        self.assertTrue(any("Jupiter" in signal["summary"] for signal in astrology_evidence))
        self.assertTrue(any("Sun" in signal["summary"] for signal in astrology_evidence))
        self.assertTrue(any("1.00" in signal["summary"] for signal in astrology_evidence))

    def test_empty_sources_return_none(self):
        self.assertIsNone(build_annual_forecast({}, {}, {}, self.as_of, self.varied_transits))

    def test_flat_months_without_three_non_adjacent_explainable_nodes_return_none(self):
        def flat_transits(target_date, natal_planets):
            return {
                "transit_planets": {"Jupiter": {"longitude": 120.0, "retrograde": False}},
                "transit_natal_aspects": [{
                    "transit_planet": "Jupiter",
                    "natal_planet": "Sun",
                    "aspect": "trine",
                    "orb": 1.0,
                }],
            }

        self.assertIsNone(build_annual_forecast({}, {}, self.astrology, self.as_of, flat_transits))

    def test_cross_year_range_starts_with_january_after_december(self):
        forecast = self.build(date(2026, 12, 31))

        self.assertEqual(forecast["range_start"], "2027-01")
        self.assertEqual(forecast["months"][-1]["month"], "2027-12")
        self.assertTrue(validate_annual_forecast(forecast))

    def test_validation_rejects_evidence_less_node(self):
        forecast = self.build()
        forecast["key_nodes"][0]["evidence"] = []

        self.assertFalse(validate_annual_forecast(forecast))


if __name__ == "__main__":
    unittest.main()
