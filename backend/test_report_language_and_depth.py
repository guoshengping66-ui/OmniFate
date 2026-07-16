import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))

from agents.workers import _build_worker_display_report, is_report_language_consistent


class ReportLanguageAndDepthTest(unittest.TestCase):
    def test_chinese_contract_rejects_an_english_sentence(self):
        self.assertFalse(is_report_language_consistent("这是中文结论。This is an English sentence.", "zh"))

    def test_english_contract_rejects_cjk_characters(self):
        self.assertFalse(is_report_language_consistent("This report still contains 中文内容.", "en"))

    def test_worker_display_report_preserves_every_detail_block(self):
        report = _build_worker_display_report({
            "summary": "核心结论",
            "dimensions": {
                "wealth": "完整财富分析",
                "career": {"score": 7.2, "label": "事业", "actionCommands": ["完成一个关键交付"]},
            },
            "key_findings": ["发现一"],
            "conflict_warnings": ["风险一"],
            "boost_elements": ["火"],
        })

        for expected in ("完整财富分析", "完成一个关键交付", "发现一", "风险一", "火"):
            self.assertIn(expected, report)

    def test_worker_display_report_uses_user_facing_semantic_sections(self):
        report = _build_worker_display_report({
            "summary": "你在复杂任务中更适合先拆解再推进。",
            "key_findings": ["关键线索：执行节奏会受截止日影响"],
            "dimensions": {
                "career": {
                    "finding": "任务越多越需要排序",
                    "action": "每天只保留一个关键交付",
                },
            },
        }, language="zh")

        for title in ("【核心结论】", "【分析依据】", "【可观察场景】", "【行动建议】", "【使用边界】"):
            self.assertIn(title, report)
        self.assertNotIn("actionCommands:", report)

    def test_worker_display_report_replaces_mixed_language_content_with_localized_repair(self):
        report = _build_worker_display_report({
            "summary": "Based on your chart, the current pattern needs a strategic retreat.",
            "key_findings": ["The Value Envoy points to conflict and hidden pressure."],
            "dimensions": {"career": {"finding": "Career needs an English explanation."}},
        }, language="zh")

        self.assertTrue(is_report_language_consistent(report, "zh"))
        self.assertNotIn("Based on your chart", report)
        self.assertIn("\u6838\u5fc3\u7ed3\u8bba", report)

    def test_fallback_display_report_does_not_cut_to_500_characters(self):
        raw = "完整分析。" * 260
        report = _build_worker_display_report({}, fallback_text=raw)
        self.assertEqual(report, raw)

    def test_face_and_palm_single_aspect_calls_use_the_dedicated_token_budget(self):
        source = Path(__file__).with_name("agents").joinpath("workers.py").read_text(encoding="utf-8")
        face_worker = source.split("async def run_face", 1)[1].split("async def run_palm", 1)[0]
        palm_worker = source.split("async def run_palm", 1)[1].split("async def run_partner_face", 1)[0]
        self.assertIn("max_tokens=_worker_output_token_limit(agent_id, state)", face_worker)
        self.assertIn("max_tokens=_worker_output_token_limit(agent_id, state)", palm_worker)

    def test_combined_qimen_ziwei_fallback_keeps_the_complete_raw_text(self):
        source = Path(__file__).with_name("agents").joinpath("workers.py").read_text(encoding="utf-8")
        combined = source.split("async def run_qimen_ziwei", 1)[1].split("async def run_face", 1)[0]
        self.assertNotIn("qimen_text[:500]", combined)
        self.assertNotIn("ziwei_text[:500]", combined)


if __name__ == "__main__":
    unittest.main()
