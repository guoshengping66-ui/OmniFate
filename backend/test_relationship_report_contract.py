import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))

from agents.prompts import master_subtask_core_prompt, master_subtask_synastry_prompt


class RelationshipReportContractTest(unittest.TestCase):
    def test_relationship_prompts_keep_only_the_selected_scenario(self):
        prompt = master_subtask_core_prompt(
            worker_summaries={},
            user_question="",
            intent="RELATIONSHIP",
            partner_data={"relationship_type": "colleague", "partner_name": "Alex"},
            language="en",
            is_premium=True,
        )

        self.assertIn("Role split, decisions, interest boundaries", prompt)
        self.assertNotIn("Romantic: relationship foundation", prompt)
        self.assertNotIn("Friendship: depth", prompt)

    def test_relationship_free_contract_has_four_short_sections(self):
        prompt = master_subtask_core_prompt(
            worker_summaries={},
            user_question="",
            intent="RELATIONSHIP",
            partner_data={"relationship_type": "friend", "partner_name": "Lin"},
            language="en",
            is_premium=False,
        )

        for heading in ("Overall snapshot", "Natural strength", "Watch for", "Next seven days"):
            self.assertIn(heading, prompt)
        self.assertNotIn("Total length: 1000-2000 words", prompt)

    def test_synastry_paid_contract_has_structure_evidence_scene_and_30_day_plan(self):
        prompt = master_subtask_synastry_prompt([], {}, {}, "family", "Lin", "en")

        for heading in (
            "Relationship structure",
            "Evidence behind the pattern",
            "Family focus",
            "30-day action plan",
        ):
            self.assertIn(heading, prompt)


if __name__ == "__main__":
    unittest.main()
