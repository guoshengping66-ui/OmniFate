"""
services/vision/face_v2t.py
Face image → structured physiognomy text (Vision-to-Text)

Pipeline:
  1. MediaPipe FaceMesh → 468 landmarks
  2. Geometric measurements (three-zone ratio, face shape, feature proportions)
  3. Landmark → physiognomy descriptor (classical Chinese terms)
  4. Assemble structured FaceFeatures object for Agent consumption
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
import numpy as np


@dataclass
class FaceV2TResult:
    three_zones_ratio: str   # 三庭比例
    face_shape: str          # 脸型
    forehead: str
    eyes: str
    nose: str
    mouth: str
    chin: str
    cheekbones: str
    ears: str
    zhun_tou: str            # 准头（兼容旧字段）
    shan_gen: str            # 山根
    di_ge: str               # 地阁
    e_tou: str               # 额头
    liang_quan: str          # 两颧
    yan_shen: str            # 眼神
    ren_zhong: str           # 人中
    eyebrows: str             # 眉毛
    summary: str
    raw_metrics: dict = field(default_factory=dict)
    quality_warning: str = ""

    def to_prompt_text(self) -> str:
        return (
            f"脸型: {self.face_shape}\n"
            f"三庭比例: {self.three_zones_ratio}\n"
            f"额头: {self.forehead}\n"
            f"眼型眼神: {self.eyes}\n"
            f"鼻型准头: {self.nose}\n"
            f"唇型人中: {self.mouth}\n"
            f"下巴地阁: {self.chin}\n"
            f"两颧: {self.cheekbones}\n"
            f"眉毛: {self.eyebrows}\n"
            f"耳朵: {self.ears}\n"
            f"综合: {self.summary}"
        )


class FaceV2T:
    """
    MediaPipe FaceLandmarker (Tasks API) → physiognomy structured text.
    Landmark indices based on MediaPipe 468-point canonical face model.
    """

    # Key landmark indices
    IDX = {
        "nose_tip":        4,
        "nose_bridge":     6,
        "left_nostril":    64,
        "right_nostril":   294,
        "chin":            152,
        "chin_left":       172,
        "chin_right":      397,
        "forehead_top":    10,
        "forehead_mid":    9,
        "left_cheek":      234,
        "right_cheek":     454,
        "left_eye_top":    159,
        "left_eye_bot":    145,
        "right_eye_top":   386,
        "right_eye_bot":   374,
        "left_eye_inner":  133,
        "left_eye_outer":  33,
        "right_eye_inner": 362,
        "right_eye_outer": 263,
        "philtrum_top":    164,
        "upper_lip":       13,
        "lower_lip":       14,
        "mouth_left":      61,
        "mouth_right":     291,
        "left_ear":        234,
        "right_ear":       454,
        "jaw_left":        172,
        "jaw_right":       397,
        # Eyebrow landmarks
        "left_brow_outer": 46,
        "left_brow_upper": 53,
        "left_brow_mid":   52,
        "left_brow_inner": 65,
        "left_brow_low_inner": 55,
        "left_brow_low_mid":   66,
        "right_brow_outer": 276,
        "right_brow_upper": 283,
        "right_brow_mid":   282,
        "right_brow_inner": 295,
        "right_brow_low_inner": 285,
        "right_brow_low_mid":   296,
        # Ear-adjacent landmarks (temple/jaw hinge area)
        "left_temple":  93,
        "right_temple": 323,
        "left_jaw_hinge":  152,
        "right_jaw_hinge": 377,
    }

    def __init__(self) -> None:
        self._face_landmarker = None
        self._model_path = None

    def _load(self) -> None:
        if self._face_landmarker is not None:
            return
        import os
        import mediapipe.tasks
        vision = mediapipe.tasks.vision

        # Find or download the model
        model_path = os.path.join(os.path.dirname(__file__), "..", "..", "face_landmarker.task")
        model_path = os.path.normpath(model_path)
        if not os.path.exists(model_path):
            model_path = os.path.join(os.getcwd(), "face_landmarker.task")
        if not os.path.exists(model_path):
            # Download from Google Storage
            import urllib.request
            url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
            urllib.request.urlretrieve(url, model_path)

        options = vision.FaceLandmarkerOptions(
            base_options=mediapipe.tasks.BaseOptions(model_asset_path=model_path),
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self._face_landmarker = vision.FaceLandmarker.create_from_options(options)

    # ── Public API ──────────────────────────────────────────────────────

    def analyze_bytes(self, image_bytes: bytes) -> Optional[FaceV2TResult]:
        try:
            import cv2
            arr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if img is None:
                return None
            return self._analyze(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), img.shape)
        except Exception as exc:
            import logging
            logging.getLogger(__name__).warning("face_v2t.analyze_bytes failed: %s", exc)
            return None

    def analyze_path(self, path: str) -> Optional[FaceV2TResult]:
        try:
            import cv2
            img = cv2.imread(path)
            if img is None:
                return None
            return self._analyze(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), img.shape)
        except Exception:
            return None

    # ── Core pipeline ────────────────────────────────────────────────────

    def _analyze(self, rgb: np.ndarray, shape: tuple) -> Optional[FaceV2TResult]:
        self._load()
        import mediapipe as mp
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = self._face_landmarker.detect(mp_image)
        if not result.face_landmarks:
            return None
        h, w = shape[:2]
        lm = result.face_landmarks[0]  # list of NormalizedLandmark

        def pt(idx: int) -> np.ndarray:
            p = lm[idx]
            return np.array([p.x * w, p.y * h])

        # ── Measurements ──────────────────────────────────────────────
        # Three-zone heights
        forehead_h = abs(pt(self.IDX["forehead_top"])[1] - pt(self.IDX["nose_bridge"])[1])
        nose_h     = abs(pt(self.IDX["nose_bridge"])[1]  - pt(self.IDX["upper_lip"])[1])
        chin_h     = abs(pt(self.IDX["upper_lip"])[1]    - pt(self.IDX["chin"])[1])
        total_h    = forehead_h + nose_h + chin_h + 1e-6

        f_ratio = forehead_h / total_h
        n_ratio = nose_h     / total_h
        c_ratio = chin_h     / total_h

        # Face width vs height → shape
        face_w = abs(pt(self.IDX["left_cheek"])[0] - pt(self.IDX["right_cheek"])[0])
        jaw_w  = abs(pt(self.IDX["jaw_left"])[0]   - pt(self.IDX["jaw_right"])[0])
        ratio_wh = face_w / (total_h + 1e-6)

        # Eye openness
        l_open = abs(pt(self.IDX["left_eye_top"])[1] - pt(self.IDX["left_eye_bot"])[1])
        r_open = abs(pt(self.IDX["right_eye_top"])[1] - pt(self.IDX["right_eye_bot"])[1])
        eye_open = (l_open + r_open) / 2

        # Eye width
        l_width = abs(pt(self.IDX["left_eye_outer"])[0] - pt(self.IDX["left_eye_inner"])[0])
        r_width = abs(pt(self.IDX["right_eye_outer"])[0] - pt(self.IDX["right_eye_inner"])[0])
        eye_width = (l_width + r_width) / 2
        eye_ratio = eye_open / (eye_width + 1e-6)

        # Nose width
        nose_w = abs(pt(self.IDX["left_nostril"])[0] - pt(self.IDX["right_nostril"])[0])
        nose_ratio = nose_w / (face_w + 1e-6)

        # Mouth width
        mouth_w = abs(pt(self.IDX["mouth_left"])[0] - pt(self.IDX["mouth_right"])[0])
        mouth_ratio = mouth_w / (face_w + 1e-6)

        # Philtrum length
        philtrum_len = abs(pt(self.IDX["philtrum_top"])[1] - pt(self.IDX["upper_lip"])[1])
        philtrum_ratio = philtrum_len / (nose_h + 1e-6)

        # Cheekbone prominence (z-depth approximation)
        cheek_z = (lm[self.IDX["left_cheek"]].z + lm[self.IDX["right_cheek"]].z) / 2

        # ── Eyebrow measurements ────────────────────────────────────
        # Left brow: inner(65), mid(52), outer(46)
        lb_in = pt(self.IDX["left_brow_inner"])
        lb_mid = pt(self.IDX["left_brow_mid"])
        lb_out = pt(self.IDX["left_brow_outer"])
        # Right brow: inner(295), mid(282), outer(276)
        rb_in = pt(self.IDX["right_brow_inner"])
        rb_mid = pt(self.IDX["right_brow_mid"])
        rb_out = pt(self.IDX["right_brow_outer"])

        # Inner brow distance (眉间距)
        brow_gap = abs(lb_in[0] - rb_in[0]) / w

        # Eyebrow slope (rising/dropping) — average of left and right
        def _brow_slope(inner, outer):
            return (outer[1] - inner[1]) / (outer[0] - inner[0] + 1e-6)
        l_slope = _brow_slope(lb_in, lb_out)
        r_slope = _brow_slope(rb_in, rb_out)
        avg_slope = (l_slope + r_slope) / 2

        # Eyebrow arch height — perpendicular distance from midpoint to chord
        def _arch_height(inner, mid, outer):
            chord_dx = outer[0] - inner[0]
            chord_dy = outer[1] - inner[1]
            chord_len = np.sqrt(chord_dx**2 + chord_dy**2) + 1e-6
            return abs(chord_dx * (inner[1] - mid[1]) - chord_dx * (inner[0] - mid[0])) / chord_len
        l_arch = _arch_height(lb_in, lb_mid, lb_out)
        r_arch = _arch_height(rb_in, rb_mid, rb_out)
        avg_arch = (l_arch + r_arch) / 2

        # ── Ear estimation (using temple/face width ratio) ──────────
        temple_w = abs(pt(self.IDX["left_temple"])[0] - pt(self.IDX["right_temple"])[0])
        ear_protrusion_ratio = temple_w / (face_w + 1e-6)

        # Quality warning
        quality_warning = ""
        if h < 200 or w < 200:
            quality_warning = "图像分辨率偏低，可能影响特征识别精度"
        elif abs(lm[self.IDX["nose_tip"]].z) > 0.04:
            quality_warning = "面部角度偏侧，建议使用正面照片以获得更准确的分析"

        # Raw metrics collection
        raw_metrics = {
            "face_width_height_ratio": round(ratio_wh, 4),
            "jaw_to_face_ratio": round(jaw_w / (face_w + 1e-6), 4),
            "eye_openness_ratio": round(eye_ratio, 4),
            "eye_width_ratio": round(eye_width / (w + 1e-6), 4),
            "nose_width_ratio": round(nose_ratio, 4),
            "mouth_width_ratio": round(mouth_ratio, 4),
            "philtrum_ratio": round(philtrum_ratio, 4),
            "cheek_z_depth": round(float(cheek_z), 4),
            "brow_slope": round(float(avg_slope), 4),
            "brow_arch": round(float(avg_arch), 4),
            "brow_gap_ratio": round(brow_gap, 4),
            "ear_protrusion_ratio": round(ear_protrusion_ratio, 4),
        }

        # ── Descriptors ───────────────────────────────────────────────
        face_shape   = self._describe_face_shape(ratio_wh, jaw_w, face_w)
        three_zones  = self._describe_three_zones(f_ratio, n_ratio, c_ratio)
        forehead_desc = self._describe_forehead(f_ratio, forehead_h / h)
        eyes_desc    = self._describe_eyes(eye_ratio, eye_width / w)
        nose_desc    = self._describe_nose(nose_ratio, lm[self.IDX["nose_bridge"]].z)
        mouth_desc   = self._describe_mouth(mouth_ratio, philtrum_ratio)
        chin_desc    = self._describe_chin(c_ratio, jaw_w / face_w)
        cheek_desc   = self._describe_cheekbones(cheek_z, face_w)
        brows_desc   = self._describe_eyebrows(avg_slope, avg_arch, brow_gap / h)
        ear_desc     = self._describe_ears(ear_protrusion_ratio)

        summary = self._generate_summary(f_ratio, n_ratio, c_ratio, eye_ratio, nose_ratio,
                                         avg_arch, cheek_z, ear_protrusion_ratio)

        return FaceV2TResult(
            three_zones_ratio=three_zones,
            face_shape=face_shape,
            forehead=forehead_desc,
            eyes=eyes_desc,
            nose=nose_desc,
            mouth=mouth_desc,
            chin=chin_desc,
            cheekbones=cheek_desc,
            ears=ear_desc,
            zhun_tou=nose_desc,
            shan_gen="山根" + ("高挺" if lm[self.IDX["nose_bridge"]].z < -0.04 else "适中"),
            di_ge=chin_desc,
            e_tou=forehead_desc,
            liang_quan=cheek_desc,
            yan_shen=eyes_desc,
            ren_zhong="人中" + ("深长" if philtrum_ratio > 0.4 else "适中" if philtrum_ratio > 0.25 else "偏短"),
            eyebrows=brows_desc,
            summary=summary,
            raw_metrics=raw_metrics,
            quality_warning=quality_warning,
        )

    # ── Descriptor methods ────────────────────────────────────────────

    @staticmethod
    def _describe_face_shape(wh: float, jaw_w: float, face_w: float) -> str:
        jaw_ratio = jaw_w / (face_w + 1e-6)
        if wh > 0.85:
            return "圆形脸（亲和力强，人缘佳，财帛宫丰厚）"
        if wh < 0.65:
            return "长形脸（思维深邃，自律性强，晚运较旺）"
        if jaw_ratio > 0.85:
            return "方形脸（意志力强，执行力佳，适合管理）"
        if jaw_ratio < 0.65:
            return "鹅蛋形脸（五官匀称，男女皆旺，贵气十足）"
        return "椭圆形脸（格局端正，运势平稳）"

    @staticmethod
    def _describe_three_zones(f: float, n: float, c: float) -> str:
        parts = [f"上停(额头){f:.0%}", f"中停(鼻梁){n:.0%}", f"下停(下巴){c:.0%}"]
        ratio_str = " : ".join(parts)
        if abs(f - n) < 0.05 and abs(n - c) < 0.05:
            balance = "三庭均等（命格平稳，早中晚年运势均衡）"
        elif f > n and f > c:
            balance = "上停偏长（早年运好，贵人助力强，智慧出众）"
        elif c > f and c > n:
            balance = "下停偏长（晚年福泽深，积累能力强）"
        elif n > f and n > c:
            balance = "中停偏长（中年运势最旺，事业财富巅峰在中年）"
        else:
            balance = "三庭略有起伏（不同人生阶段各有侧重）"
        return f"{ratio_str}，{balance}"

    @staticmethod
    def _describe_forehead(f_ratio: float, rel_h: float) -> str:
        if f_ratio > 0.38:
            return "额头宽广饱满，上停丰厚（早运佳，贵人缘极强，智慧超群，适合脑力工作）"
        if f_ratio > 0.30:
            return "额头适中端正（早年运势稳健，依靠自身努力取得成就）"
        return "额头偏窄（早年较辛苦，需自力更生，但意志坚韧）"

    @staticmethod
    def _describe_eyes(eye_ratio: float, width_ratio: float) -> str:
        if eye_ratio > 0.28:
            openness = "眼睛大而有神，眼神明亮（聪慧、行动力强，情感丰富）"
        elif eye_ratio > 0.18:
            openness = "眼睛适中沉稳，眼神温和（内敛有智慧，观察力极佳）"
        else:
            openness = "眼型细长深邃（心思缜密，洞察力强，宜防过度内耗）"
        if width_ratio > 0.12:
            return openness + "，眼距宽（心胸开阔，包容性强）"
        return openness

    @staticmethod
    def _describe_nose(nose_ratio: float, bridge_z: float) -> str:
        if nose_ratio > 0.32:
            width = "准头圆润丰厚（财库充盈，财运旺盛，有积累财富的能力）"
        elif nose_ratio > 0.22:
            width = "准头适中（财运平稳，理财能力尚可）"
        else:
            width = "准头偏尖（财帛易散，宜节流，建议补充土元素）"
        if bridge_z < -0.05:
            height = "，山根高挺（中年运势上升，思维清晰，贵气足）"
        elif bridge_z < 0:
            height = "，山根适中"
        else:
            height = "，山根偏低（中年易有波折，宜通过修炼提升气场）"
        return width + height

    @staticmethod
    def _describe_mouth(mouth_ratio: float, philtrum_ratio: float) -> str:
        if mouth_ratio > 0.42:
            m = "口型宽大（言语有力，社交能力强，适合公众表达）"
        elif mouth_ratio > 0.32:
            m = "口型适中（表达流畅，感情真诚）"
        else:
            m = "口型偏小（内敛含蓄，慎言守密，感情深藏）"
        if philtrum_ratio > 0.40:
            p = "，人中深长（生命力旺盛，子女缘深，晚年有依靠）"
        elif philtrum_ratio > 0.25:
            p = "，人中适中"
        else:
            p = "，人中偏短（需注意健康与子女缘）"
        return m + p

    @staticmethod
    def _describe_chin(c_ratio: float, jaw_ratio: float) -> str:
        if c_ratio > 0.34:
            base = "下停丰满（晚运极佳，福泽深厚，有后辈依靠）"
        elif c_ratio > 0.28:
            base = "下停适中（晚年安稳，积累有道）"
        else:
            base = "下停偏短（晚年需主动积蓄，防孤独之象）"
        if jaw_ratio > 0.88:
            return base + "，下颌方正（意志坚定，不服输）"
        if jaw_ratio < 0.70:
            return base + "，下颌偏尖（灵气十足，创意丰富）"
        return base

    @staticmethod
    def _describe_cheekbones(cheek_z: float, face_w: float) -> str:
        if cheek_z < -0.04:
            return "两颧高耸有势（权威感强，适合管理领导，掌控力出众）"
        if cheek_z < -0.01:
            return "两颧适中（社交运良好，能与各类人和谐共处）"
        return "两颧偏低平（宜以实力而非权势取胜，踏实稳重）"

    @staticmethod
    def _describe_eyebrows(avg_slope: float, avg_arch: float,
                           brow_gap_rel: float) -> str:
        """Classify eyebrows by slope (rising/flat/dropping) and arch (high/low)."""
        # Shape by slope
        if avg_slope < -0.08:
            shape = "剑眉上扬（魄力十足，行事果决，有领袖气质）"
        elif avg_slope > 0.08:
            shape = "八字眉下垂（性格温和，包容力强，但易优柔寡断）"
        elif avg_arch > 8.0:
            shape = "柳叶弯眉（聪慧灵秀，人缘好，情感细腻丰富）"
        else:
            shape = "一字平眉（正直稳重，原则性强，适合稳定性职业）"
        # Thickness via slope magnitude — shallow slope often correlates with thicker brows
        if abs(avg_slope) < 0.05 and avg_arch < 6.0:
            shape += "，眉形粗浓（精力充沛，意志坚定）"
        elif abs(avg_slope) > 0.15:
            shape += "，眉形细致（心思缜密，观察入微）"
        # Gap info
        if brow_gap_rel > 0.025:
            shape += "，眉间距宽（心胸开阔，不记仇）"
        elif brow_gap_rel > 0.015:
            shape += "，眉间距适中（性格平和中庸）"
        else:
            shape += "，眉间距窄（心思缜密，但易钻牛角尖）"
        return shape

    @staticmethod
    def _describe_ears(protrusion_ratio: float) -> str:
        """Estimate ear type from temple/face width ratio heuristic."""
        if protrusion_ratio > 0.92:
            # Wide temple span relative to face → possible protruding ears
            return (
                "耳廓较为外展（招风耳趋向，信息通达，聪慧敏锐，"
                "对外界变化感知力强）"
            )
        elif protrusion_ratio > 0.82:
            return (
                "耳廓贴脑适中（耳相端正，福泽内敛，"
                "主肾气充足，听力聪敏）"
            )
        else:
            return (
                "耳廓贴脑（贴脑耳趋向，孝顺稳重，"
                "早年多得家庭助力，性格内敛）"
            )

    @staticmethod
    def _generate_summary(f: float, n: float, c: float,
                           eye_r: float, nose_r: float,
                           brow_arch: float, cheek_z: float, ear_protrusion: float) -> str:
        score = 0.0
        # Original 5 indicators (1× each)
        if f > 0.32: score += 1.0
        if n > 0.30: score += 1.0
        if c > 0.28: score += 1.0
        if eye_r > 0.20: score += 1.0
        if nose_r > 0.24: score += 1.0
        # New: brow arch (1×)
        if brow_arch > 6.0: score += 1.0
        # New: cheekbone depth (1×)
        if cheek_z < -0.03: score += 1.0
        # New: ear protrusion (0.5×)
        if ear_protrusion > 0.85: score += 0.5

        max_score = 7.5
        pct = score / max_score

        if pct >= 0.85:
            return "面相格局上上，五官配合得天独厚，一生运势顺畅，贵气盈门，宜善加珍惜。"
        if pct >= 0.70:
            return "面相格局上等，五官协调有力，主一生运势通达，中晚年积累丰厚，贵气可期。"
        if pct >= 0.50:
            return "面相格局中等，五官强弱互现，需针对性强化薄弱宫位对应的五行能量，方能趋吉避凶。"
        if pct >= 0.35:
            return "面相格局中下，五官偏弱处较多，建议通过命理调整与开运物品补强先天不足，后天修为尤为关键。"
        return "面相格局偏弱，五官配合度不足，需全面调理，建议结合八字与五行综合分析，以定化解之策。"
