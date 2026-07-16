import inspect
import unittest
from unittest.mock import patch

from agents import workers
from config import get_settings


class ReportModelRoutingTests(unittest.TestCase):
    def test_report_llm_uses_the_deepseek_configuration(self):
        settings = get_settings()
        workers._llm_cache.clear()
        with patch("langchain_openai.ChatOpenAI") as client:
            workers._llm(temperature=0.2, max_tokens=512)

        kwargs = client.call_args.kwargs
        self.assertEqual(kwargs["model"], settings.OPENAI_MODEL)
        self.assertEqual(kwargs["base_url"], settings.OPENAI_BASE_URL)

    def test_qimen_ziwei_log_never_labels_a_report_call_as_the_followup_model(self):
        source = inspect.getsource(workers.run_qimen_ziwei)
        self.assertNotIn("model=%s, timeout=180s\", settings.FREE_MODEL", source)
        self.assertIn("model=%s, timeout=180s\", settings.OPENAI_MODEL", source)


if __name__ == "__main__":
    unittest.main()
