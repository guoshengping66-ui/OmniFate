import unittest

from agents.state import FaceFeatures, PalmFeatures


class VisualFeatureContractTest(unittest.TestCase):
    def test_face_quality_warning_reaches_worker_prompt(self):
        prompt = FaceFeatures(
            face_shape="oval",
            quality_warning="Use a front-facing image for reliable feature extraction.",
        ).to_prompt_text()
        self.assertIn("Image quality note", prompt)
        self.assertIn("front-facing", prompt)

    def test_palm_quality_warning_reaches_worker_prompt(self):
        prompt = PalmFeatures(
            hand_shape="square",
            quality_warning="Palm lines are blurred; do not make line-specific claims.",
        ).to_prompt_text()
        self.assertIn("Image quality note", prompt)
        self.assertIn("do not make line-specific claims", prompt)


if __name__ == "__main__":
    unittest.main()
