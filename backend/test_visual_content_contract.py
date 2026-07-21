import unittest
from services.vision.face_v2t import FaceV2TResult
from services.vision.palm_v2t import PalmV2TResult


class VisualContentContractTest(unittest.TestCase):
    def test_face_prompt_is_measurement_only(self):
        result = FaceV2TResult(*(["x"] * 18), raw_metrics={"symmetry": 0.9})
        prompt = result.to_prompt_text()
        self.assertIn("measurements", prompt)
        self.assertNotIn("寿", prompt)

    def test_palm_prompt_is_measurement_only(self):
        prompt = PalmV2TResult(raw_metrics={"hand_confidence": 0.9}).to_prompt_text()
        self.assertIn("measurements", prompt)
        self.assertNotIn("婚", prompt)


if __name__ == "__main__":
    unittest.main()
