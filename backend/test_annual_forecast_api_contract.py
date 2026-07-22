import json
import os
import sys
import unittest
from types import SimpleNamespace

sys.path.insert(0, os.path.dirname(__file__))

from api.routers.readings import _apply_content_lock, _extract_validated_annual_forecast
from test_decision_report_v3 import _valid_annual_forecast


def _report_detail(forecast):
    return "```json\n" + json.dumps({
        "report_type": "decision_report_v3",
        "status": "ready",
        "annual_forecast": forecast,
    }) + "\n```\n"


def _response(detail, forecast):
    return SimpleNamespace(
        master_detail=detail,
        annual_forecast=forecast,
        is_detail_unlocked=True,
        is_detailed_unlocked=True,
        report_version="decision_report_v3",
        report_recovery_status="ready",
    )


class AnnualForecastApiContractTest(unittest.TestCase):
    def test_api_extracts_only_valid_snapshot_and_respects_entitlements(self):
        forecast = _valid_annual_forecast()
        detail = _report_detail(forecast)

        self.assertEqual(_extract_validated_annual_forecast(detail), forecast)
        self.assertEqual(_extract_validated_annual_forecast(_report_detail({})), {})

        anonymous = _apply_content_lock(
            _response(detail, _extract_validated_annual_forecast(detail)),
            current_user=None,
            reading=SimpleNamespace(user_id=None),
        )
        self.assertEqual(anonymous.annual_forecast, {})

        free = _apply_content_lock(
            _response(detail, _extract_validated_annual_forecast(detail)),
            current_user=None,
        )
        self.assertEqual(free.annual_forecast, {})

        user = SimpleNamespace(id="user", is_premium=False, premium_expires_at=None)
        detailed = _apply_content_lock(
            _response(detail, _extract_validated_annual_forecast(detail)),
            current_user=user,
            reading=SimpleNamespace(user_id="user", is_detail_unlocked=False, is_detailed_unlocked=True),
        )
        self.assertEqual(detailed.annual_forecast, forecast)

        full = _apply_content_lock(
            _response(detail, _extract_validated_annual_forecast(detail)),
            current_user=user,
            reading=SimpleNamespace(user_id="user", is_detail_unlocked=True, is_detailed_unlocked=False),
        )
        self.assertEqual(full.annual_forecast, forecast)


if __name__ == "__main__":
    unittest.main()
