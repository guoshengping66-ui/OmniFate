import json
import os
import sys
import unittest
from types import SimpleNamespace

sys.path.insert(0, os.path.dirname(__file__))

from agents.master import (
    _build_decision_report_payload,
    _build_evidence_bound_sections,
    _extract_traceable_evidence,
    build_free_report_snapshot,
    build_generated_quick_insights,
    build_recoverable_paid_detail,
)
from agents.workers import is_report_language_consistent


def make_state():
    return SimpleNamespace(
        language="zh",
        dimension_scores={
            "wealth": 6.2,
            "career": 7.1,
            "relationship": 5.8,
            "health": 6.6,
            "spiritual": 6.4,
        },
    )


class ReportContentContractTest(unittest.TestCase):
    def test_evidence_bound_sections_keep_the_original_signal_and_do_not_create_a_risk_without_one(self):
        sections = _build_evidence_bound_sections(
            [{"claim": "\u622a\u6b62\u65e5\u524d\u5bb9\u6613\u56de\u907f\u6c9f\u901a", "sources": ["\u661f\u76d8"]}],
            ["\u5468\u4e09\u524d\u7ea6\u4e00\u6b21\u5bf9\u9f50\u4f1a\u8bae"],
            "zh",
        )
        self.assertIn("\u622a\u6b62\u65e5", sections["scenarios"][0])
        self.assertEqual(sections["actions"][0]["evidence_refs"], ["\u661f\u76d8"])
        self.assertEqual(sections["actions"][0]["done_when"], "\u5b8c\u6210\u5e76\u8bb0\u5f55\u5bf9\u9f50\u7ed3\u8bba")
        self.assertEqual(len(sections["avoid_items"]), 1)

        no_risk = _build_evidence_bound_sections(
            [{"claim": "\u53ef\u4ee5\u7a33\u5b9a\u63a8\u8fdb\u5173\u952e\u4ea4\u4ed8", "sources": ["\u516b\u5b57"]}],
            ["\u4eca\u5929\u5b8c\u6210\u4ea4\u4ed8\u6e05\u5355"],
            "zh",
        )
        self.assertEqual(no_risk["avoid_items"], [])
    def test_evidence_parser_accepts_the_chinese_source_brackets_emitted_by_reports(self):
        evidence = _extract_traceable_evidence(
            "\u3010\u516b\u5b57\u3011\u5f53\u4efb\u52a1\u53e0\u52a0\u65f6\uff0c\u4f60\u66f4\u5bb9\u6613\u628a\u6c9f\u901a\u5f80\u540e\u63a8\u3002\n"
            "\u3010\u661f\u76d8\u3011\u622a\u6b62\u65e5\u524d\u8be6\u7ec6\u89e3\u91ca\u53ef\u4ee5\u51cf\u5c11\u8bef\u4f1a\u3002",
            "zh",
        )
        self.assertEqual([item["sources"][0] for item in evidence], ["\u516b\u5b57", "\u661f\u76d8"])
        self.assertTrue(all(item["claim"] for item in evidence))

    def test_quick_insights_are_generated_from_dimension_scores_not_summary_slices(self):
        lines = build_generated_quick_insights(
            {
                "wealth": 5.6,
                "career": 8.1,
                "relationship": 6.3,
                "health": 6.9,
                "spiritual": 6.1,
            },
            "zh",
        )

        self.assertEqual(len(lines), 3)
        self.assertTrue(all(is_report_language_consistent(line, "zh") for line in lines))
        self.assertTrue(any("\u4e8b\u4e1a" in line for line in lines))
        self.assertTrue(any("\u8d22\u5bcc" in line for line in lines))
        self.assertTrue(all("Core Personality Blueprint" not in line for line in lines))

    def test_paid_payload_drops_placeholder_evidence_and_heading_values(self):
        payload = _build_decision_report_payload(
            "\u3010A \u00b7 Core Personality Blueprint\u3011\n\u3010\u6838\u5fc3\u7ed3\u8bba\u3011\u4f60\u66f4\u9002\u5408\u5148\u5b8c\u6210\u4e00\u9879\u5173\u952e\u4ea4\u4ed8\u3002",
            "\u8d22\u5bcc\uff1a\u5148\u6574\u7406\u5f53\u6708\u73b0\u91d1\u6d41\u3002\n\u4e8b\u4e1a\uff1a\u805a\u7126\u4e00\u9879\u5173\u952e\u4ea4\u4ed8\u3002",
            "\u672c\u5468\uff1a\u5468\u4e09\u524d\u5b8c\u6210\u4ea4\u4ed8\u6e05\u5355\u3002",
            make_state(),
            {"evidence_chains": "Synthesis note\nNeeds verification"},
        )

        rendered = json.dumps(payload, ensure_ascii=False)
        for forbidden in (
            "Key Opportunity", "What to Watch", "Next Best Action", "Evidence Chain",
            "Synthesis note", "Needs verification", "Core Personality Blueprint",
        ):
            self.assertNotIn(forbidden, rendered)

    def test_paid_payload_exposes_a_clear_question_to_action_narrative(self):
        state = make_state()
        state.user_question = "\u6211\u5e94\u8be5\u5982\u4f55\u5b89\u6392\u63a5\u4e0b\u6765\u4e09\u4e2a\u6708\u7684\u4e8b\u4e1a\u91cd\u70b9\uff1f"
        payload = _build_decision_report_payload(
            "\u628a\u91cd\u70b9\u653e\u5728\u4e00\u9879\u53ef\u89c1\u4ea4\u4ed8\u4e0a\uff0c\u4e0d\u8981\u540c\u65f6\u63a8\u8fdb\u592a\u591a\u4e8b\u60c5\u3002",
            "\u4e8b\u4e1a\uff1a\u5f53\u4efb\u52a1\u53d8\u591a\u65f6\uff0c\u5148\u62c6\u5206\u4ea4\u4ed8\u8282\u70b9\u4f1a\u66f4\u7a33\u5b9a\u3002",
            "\u672c\u5468\uff1a\u5217\u51fa\u4e00\u9879\u4e03\u5929\u5185\u80fd\u5b8c\u6210\u7684\u5173\u952e\u4ea4\u4ed8\u3002",
            state,
            {"evidence_chains": "\u3010\u4e8b\u4e1a\u3011\u4efb\u52a1\u53d8\u591a\u65f6\u5148\u62c6\u5206\u4ea4\u4ed8\u8282\u70b9\u3002"},
        )

        self.assertEqual(payload["focus_question"], state.user_question)
        self.assertIn("\u4ea4\u4ed8", payload["core_conclusion"])
        self.assertIn("\u4e8b\u4e1a", payload["observable_scenarios"][0])
        self.assertIn("\u4e03\u5929", payload["next_action"])
        self.assertTrue(payload["follow_up_prompt"])

    def test_free_snapshot_extracts_distinct_personalized_sections(self):
        snapshot = build_free_report_snapshot(
            "【核心结论】你在压力下会先独自消化。\n"
            "【优势】你能长期推进复杂任务。\n"
            "【需要留意】临近截止日容易回避沟通。\n"
            "【未来七天】周三前完成一次15分钟对齐。",
            "zh",
        )

        self.assertEqual(snapshot["headline"], "你在压力下会先独自消化。")
        self.assertIn("复杂任务", snapshot["strength"])
        self.assertIn("回避沟通", snapshot["watch_for"])
        self.assertIn("周三前", snapshot["seven_day_action"])

    def test_paid_payload_uses_dimension_and_action_sources_without_repeating_core(self):
        payload = _build_decision_report_payload(
            "核心结论：先稳定沟通节奏。",
            "财富：现金流复盘。\n"
            "事业：完成关键交付。\n"
            "关系：每周一次对齐。\n"
            "健康：固定睡眠。\n"
            "精神：减少信息噪音。",
            "今天：列出优先级。\n"
            "本周：安排一次复盘。\n"
            "本月：完成一个交付。",
            make_state(),
            {"evidence_chains": "[Bazi] 节奏偏紧\n[Astrology] 沟通压力"},
        )

        self.assertIn("现金流复盘", payload["five_dimensions"][0]["finding"])
        self.assertIn("完成关键交付", payload["five_dimensions"][1]["finding"])
        self.assertNotEqual(
            payload["five_dimensions"][0]["finding"],
            payload["executive_summary"]["opportunity"],
        )
        self.assertEqual(payload["evidence_chain"][0]["sources"], ["Bazi"])

    def test_untraceable_legacy_paid_report_is_not_presented_as_a_complete_decision(self):
        detail = build_recoverable_paid_detail(
            "[Core conclusion] Protect the communication rhythm before adding more work.\n"
            "[Wealth] Review recurring spending before making a purchase.\n"
            "[Action items] Schedule one 15-minute alignment conversation before Wednesday.",
            make_state().dimension_scores,
            "en",
        )
        payload = json.loads(detail.split("```json\n", 1)[1].split("\n```", 1)[0])

        self.assertEqual(payload["status"], "recovering")
        self.assertEqual(payload["action_plan"], [])


if __name__ == "__main__":
    unittest.main()
