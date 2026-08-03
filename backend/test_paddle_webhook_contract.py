import hashlib
import hmac
import unittest

from services.paddle import verify_webhook_signature


class PaddleWebhookContractTests(unittest.TestCase):
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
