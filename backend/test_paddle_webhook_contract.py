import hashlib
import hmac
import unittest
from pathlib import Path

from services.paddle import verify_webhook_signature


class PaddleWebhookContractTests(unittest.TestCase):
    def test_paddle_webhook_is_exempt_from_browser_csrf_protection(self):
        main_source = Path(__file__).parent.joinpath("main.py").read_text(encoding="utf-8")

        self.assertIn('"/api/payments/webhooks/paddle"', main_source)

    def test_accepts_valid_paddle_hmac_signature(self):
        secret = "webhook-secret"
        payload = b'{"event_id":"evt_123"}'
        timestamp = "1700000000"
        digest = hmac.new(secret.encode(), timestamp.encode() + b":" + payload, hashlib.sha256).hexdigest()

        self.assertTrue(verify_webhook_signature(payload, f"ts={timestamp};h1={digest}", secret, now=1700000010))

    def test_rejects_tampered_or_expired_webhook(self):
        payload = b'{"event_id":"evt_123"}'

        self.assertFalse(verify_webhook_signature(payload, "ts=1700000000;h1=bad", "webhook-secret", now=1700000010))
        self.assertFalse(verify_webhook_signature(payload, "ts=1700000000;h1=bad", "webhook-secret", now=1700001000))


if __name__ == "__main__":
    unittest.main()
