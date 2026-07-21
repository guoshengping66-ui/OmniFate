import os
import sys
import unittest
from types import SimpleNamespace

sys.path.insert(0, os.path.dirname(__file__))

from agents.master import _build_decision_report_payload, build_recoverable_paid_detail
import json


class DecisionReportV3ContractTest(unittest.TestCase):
    def test_payload_uses_v3_and_binds_actions_to_evidence(self):
        state = SimpleNamespace(
            language="zh",
            user_question="接下来七天怎样推进事业？",
            dimension_scores={"wealth": 6.0, "career": 7.5, "relationship": 6.4, "health": 5.8, "spiritual": 6.8},
        )
        payload = _build_decision_report_payload(
            "【核心结论】先完成一个关键交付。\n【需要留意】截止日前不要回避沟通。",
            "事业：拆分关键交付节点。\n健康：固定睡眠时间。",
            "【未来七天】周三前完成一次十五分钟对齐。",
            state,
            {"evidence_chains": "【八字】任务叠加时容易延后沟通。\n【星盘】明确截止日前的沟通可减少误会。"},
        )

        self.assertEqual(payload["report_type"], "decision_report_v3")
        self.assertEqual(payload["status"], "ready")
        self.assertTrue(payload["next_action"].startswith("周三前"))
        self.assertTrue(all(item["evidence_refs"] for item in payload["action_plan"]))
        self.assertTrue(all(item["done_when"] and item["review_at"] for item in payload["action_plan"]))

    def test_payload_with_no_evidence_is_recovering_not_a_generic_report(self):
        state = SimpleNamespace(language="zh", user_question="", dimension_scores={})
        payload = _build_decision_report_payload("", "", "", state, {})

        self.assertEqual(payload["report_type"], "decision_report_v3")
        self.assertEqual(payload["status"], "recovering")
        self.assertEqual(payload["evidence_chain"], [])
        self.assertEqual(payload["action_plan"], [])

    def test_payload_with_evidence_but_no_conclusion_or_action_is_recovering(self):
        state = SimpleNamespace(language="en", user_question="What should I prioritize?", dimension_scores={})
        payload = _build_decision_report_payload(
            "",
            "Career: A clear owner will reduce delivery drift.",
            "",
            state,
            {"evidence_chains": "[BaZi] Competing commitments increase delivery drift."},
            require_generated_content=True,
        )

        self.assertEqual(payload["status"], "recovering")
        self.assertEqual(payload["action_plan"], [])

    def test_payload_does_not_reuse_the_conclusion_or_repeat_one_action(self):
        state = SimpleNamespace(
            language="en",
            user_question="What should I prioritize?",
            dimension_scores={"wealth": 6.0, "career": 7.5, "relationship": 6.4, "health": 5.8, "spiritual": 6.8},
        )
        payload = _build_decision_report_payload(
            "Finish the launch brief before adding another commitment. Confirm the decision owner before Friday. Keep the workload visible to the team.",
            "Career: A clear owner will reduce delivery drift.",
            "This week: schedule a 15-minute owner check-in.",
            state,
            {"evidence_chains": "[BaZi] Competing commitments increase delivery drift.\n[Astrology] Clear ownership reduces decision delays."},
        )

        self.assertNotEqual(payload["core_conclusion"], payload["key_opportunity"])
        self.assertEqual(len(payload["action_plan"]), 1)
        self.assertEqual(payload["timeline"], [])

    def test_dimension_without_its_own_source_is_not_scored_as_personalized(self):
        state = SimpleNamespace(
            language="en",
            user_question="What should I prioritize?",
            dimension_scores={"wealth": 6.0, "career": 7.5, "relationship": 6.4, "health": 5.8, "spiritual": 6.8},
        )
        payload = _build_decision_report_payload(
            "Finish the launch brief. Confirm an owner. Keep the workload visible.",
            "Career: A clear owner will reduce delivery drift.",
            "This week: schedule a 15-minute owner check-in.",
            state,
            {"evidence_chains": "[BaZi] Competing commitments increase delivery drift.\n[Astrology] Clear ownership reduces decision delays."},
        )

        dimensions = {item["key"]: item for item in payload["five_dimensions"]}
        self.assertEqual(dimensions["career"]["score"], 7.5)
        self.assertIsNone(dimensions["wealth"]["score"])
        self.assertEqual(dimensions["wealth"]["finding"], "")

    def test_ready_dimensions_include_the_evidence_used_by_their_finding(self):
        state = SimpleNamespace(
            language="en",
            user_question="What should I prioritize?",
            dimension_scores={"wealth": 6.0, "career": 7.5, "relationship": 6.4, "health": 5.8, "spiritual": 6.8},
        )
        payload = _build_decision_report_payload(
            "Finish the launch brief. Confirm an owner.",
            "Career: A clear owner will reduce delivery drift.",
            "This week: schedule a 15-minute owner check-in.",
            state,
            {"evidence_chains": "[BaZi] Competing commitments increase delivery drift.\n[Astrology] Clear ownership reduces decision delays."},
        )

        career = next(item for item in payload["five_dimensions"] if item["key"] == "career")
        self.assertEqual(career["evidence_refs"], ["BaZi", "Astrology"])
        wealth = next(item for item in payload["five_dimensions"] if item["key"] == "wealth")
        self.assertEqual(wealth["evidence_refs"], [])

    def test_legacy_recovery_uses_persisted_worker_reports_as_real_evidence(self):
        detail = build_recoverable_paid_detail(
            "【核心结论】先完成一个关键交付。\n【未来七天】周三前完成一次对齐。",
            {"career": 7.5, "health": 5.8},
            "zh",
            expert_reports={
                "bazi": "任务叠加时更容易推迟沟通。",
                "astrology": "明确截止日前的沟通可减少误会。",
            },
        )
        payload = json.loads(detail.split("```json\n", 1)[1].split("\n```", 1)[0])

        self.assertEqual(payload["status"], "ready")
        self.assertEqual(payload["evidence_chain"][0]["sources"], ["八字"])
        self.assertTrue(payload["action_plan"][0]["evidence_refs"])


if __name__ == "__main__":
    unittest.main()
