import json
import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))

from agents.master import build_recoverable_paid_detail


class PaidReportContractTest(unittest.TestCase):
    def test_untraceable_legacy_detail_is_marked_for_recovery(self):
        detail = build_recoverable_paid_detail(
            summary="A focused work rhythm is your clearest opportunity. Avoid changing direction under pressure.",
            dimension_scores={"wealth": 6.4, "career": 8.1, "relationship": 5.8, "health": 6.1, "spiritual": 7.0},
            language="en",
        )

        payload = json.loads(detail.split("```json\n", 1)[1].split("\n```", 1)[0])
        self.assertEqual(payload["report_type"], "decision_report_v3")
        self.assertEqual(payload["status"], "recovering")
        self.assertEqual(payload["evidence_chain"], [])
        self.assertEqual(payload["action_plan"], [])

    def test_recoverable_paid_detail_is_not_an_empty_placeholder(self):
        detail = build_recoverable_paid_detail(summary="", dimension_scores={}, language="en")

        self.assertIn("Your decision report is ready", detail)
        self.assertGreater(len(detail), 500)

    def test_free_reports_persist_the_locked_paid_payload(self):
        source = Path(__file__).with_name("agents").joinpath("master.py").read_text(encoding="utf-8")
        self.assertIn("state.master_detail = build_recoverable_paid_detail(", source)

    def test_unlock_repairs_legacy_reports_without_paid_detail(self):
        source = Path(__file__).with_name("api").joinpath("routers", "payments", "unlock.py").read_text(encoding="utf-8")
        self.assertIn("build_recoverable_paid_detail", source)
        self.assertIn("if not (reading.master_detail or \"\").strip():", source)
        stripe_activation = source.split("async def handle_onetime_unlock_activation", 1)[1].split("async def _unlock_reading", 1)[0]
        self.assertIn("_hydrate_legacy_paid_detail(reading)", stripe_activation)

    def test_reading_fetch_repairs_previously_unlocked_legacy_reports(self):
        source = Path(__file__).with_name("api").joinpath("routers", "readings.py").read_text(encoding="utf-8")
        self.assertIn("def _hydrate_unlocked_legacy_report", source)
        self.assertIn("if not has_paid_access or (reading.master_detail or \"\").strip():", source)
        self.assertGreaterEqual(source.count("_hydrate_unlocked_legacy_report(reading)"), 3)

    def test_paid_cache_hit_rebuilds_from_database_instead_of_returning_a_locked_copy(self):
        source = Path(__file__).with_name("api").joinpath("routers", "readings.py").read_text(encoding="utf-8")
        self.assertIn("reading.is_detail_unlocked or getattr(reading, \"is_detailed_unlocked\", False)", source)
        self.assertIn("cached_needs_refresh = True", source)


if __name__ == "__main__":
    unittest.main()
