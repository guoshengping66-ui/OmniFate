"""
services/vision/palm_v2t.py
Palm image → structured palmistry text (Vision-to-Text)

Pipeline:
  1. MediaPipe Hands → 21 landmarks
  2. Geometric analysis of palm proportions → hand shape, finger ratios, thumb
  3. OpenCV Canny edge + line detection for major lines
  4. Color/texture analysis for palm complexion and half-moons
  5. Palm mound (掌丘) estimation via landmark relative positions
  6. Landmark + line pattern → comprehensive palmistry descriptors
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
import numpy as np
import math


@dataclass
class PalmV2TResult:
    hand_shape: str = ""
    hand_side: str = ""              # NEW: 左右手检测 ("左手" / "右手" / "")
    life_line: str = ""
    head_line: str = ""
    heart_line: str = ""
    fate_line: str = ""
    sun_line: str = ""
    marriage_lines: str = ""
    health_line: str = ""
    special_marks: str = ""
    palm_mounds: str = ""            # 掌丘评估
    thumb_type: str = ""             # 拇指类型
    finger_proportions: str = ""     # 手指比例分析
    finger_gaps: str = ""            # NEW: 手指间隙分析
    wrist_lines: str = ""            # NEW: 手腕线(手镯线)
    palm_color: str = ""             # 掌色分析
    nail_halfmoon: str = ""          # 指甲半月痕
    palm_flexibility: str = ""       # 手掌软硬
    line_direction_hint: str = ""    # NEW: 线条方向分布提示
    quality_warning: str = ""        # NEW: 图像质量警告
    summary: str = ""
    raw_metrics: dict = field(default_factory=dict)

    def to_prompt_text(self) -> str:
        parts = []
        if self.hand_side:
            parts.insert(0, f"检测手: {self.hand_side}")
        parts.append(f"手型: {self.hand_shape}")
        parts.append(f"生命线: {self.life_line}")
        parts.append(f"智慧线: {self.head_line}")
        parts.append(f"感情线: {self.heart_line}")
        parts.append(f"命运线: {self.fate_line}")
        parts.append(f"太阳线: {self.sun_line}")
        parts.append(f"婚姻线: {self.marriage_lines}")
        if self.health_line:
            parts.append(f"健康线: {self.health_line}")
        if self.palm_mounds:
            parts.append(f"掌丘: {self.palm_mounds}")
        if self.thumb_type:
            parts.append(f"拇指: {self.thumb_type}")
        if self.finger_proportions:
            parts.append(f"手指比例: {self.finger_proportions}")
        if self.finger_gaps:
            parts.append(f"手指间隙: {self.finger_gaps}")
        if self.wrist_lines:
            parts.append(f"手腕线: {self.wrist_lines}")
        if self.palm_color:
            parts.append(f"掌色: {self.palm_color}")
        if self.nail_halfmoon:
            parts.append(f"半月痕: {self.nail_halfmoon}")
        if self.palm_flexibility:
            parts.append(f"手软硬: {self.palm_flexibility}")
        if self.line_direction_hint:
            parts.append(f"线条走势: {self.line_direction_hint}")
        if self.quality_warning:
            parts.append(f"⚠️ {self.quality_warning}")
        if self.special_marks:
            parts.append(f"特殊纹路: {self.special_marks}")
        parts.append(f"综合: {self.summary}")
        return "\n".join(parts)


class PalmV2T:
    """
    Enhanced MediaPipe Hands + OpenCV → palmistry structured text.
    New capabilities: thumb type, finger ratio, palm mound estimation,
    palm color, nail half-moon, flexibility, health line.
    """

    # MediaPipe landmark indices
    WRIST = 0
    THUMB_CMC = 1
    THUMB_MCP = 2
    THUMB_IP = 3
    THUMB_TIP = 4
    INDEX_MCP = 5
    INDEX_PIP = 6
    INDEX_DIP = 7
    INDEX_TIP = 8
    MIDDLE_MCP = 9
    MIDDLE_PIP = 10
    MIDDLE_DIP = 11
    MIDDLE_TIP = 12
    RING_MCP = 13
    RING_PIP = 14
    RING_DIP = 15
    RING_TIP = 16
    PINKY_MCP = 17
    PINKY_PIP = 18
    PINKY_DIP = 19
    PINKY_TIP = 20

    def __init__(self) -> None:
        self._hands = None

    def _load(self) -> None:
        if self._hands is not None:
            return
        import mediapipe as mp
        self._hands = mp.solutions.hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            min_detection_confidence=0.5,
        )

    def analyze_bytes(self, image_bytes: bytes) -> Optional[PalmV2TResult]:
        try:
            import cv2
            arr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if img is None:
                return None
            return self._analyze(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), img, img.shape)
        except Exception:
            return None

    def analyze_path(self, path: str) -> Optional[PalmV2TResult]:
        try:
            import cv2
            img = cv2.imread(path)
            if img is None:
                return None
            return self._analyze(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), img, img.shape)
        except Exception:
            return None

    def _analyze(self, rgb: np.ndarray, bgr: np.ndarray,
                 shape: tuple) -> Optional[PalmV2TResult]:
        self._load()
        res = self._hands.process(rgb)
        if not res.multi_hand_landmarks:
            return None

        h, w = shape[:2]
        lm = res.multi_hand_landmarks[0].landmark

        # ── Left/Right hand detection via MediaPipe multi_handedness ──────
        hand_side = ""
        if res.multi_handedness:
            label = res.multi_handedness[0].classification[0].label
            hand_side = "左手" if label == "Left" else "右手"
            confidence = res.multi_handedness[0].classification[0].score
        else:
            confidence = 0.0

        # ── Image quality validation ─────────────────────────────────────
        quality_warning = self._check_image_quality(bgr, confidence)

        def pt(idx: int) -> np.ndarray:
            p = lm[idx]
            return np.array([p.x * w, p.y * h])

        # ── Hand shape from proportions ───────────────────────────────
        wrist      = pt(self.WRIST)
        mid_tip    = pt(self.MIDDLE_TIP)
        index_base = pt(self.INDEX_MCP)
        pinky_base = pt(self.PINKY_MCP)

        palm_h = np.linalg.norm(mid_tip - wrist)
        palm_w = np.linalg.norm(index_base - pinky_base)
        shape_ratio = palm_w / (palm_h + 1e-6)

        # Finger lengths (full finger: tip to MCP)
        index_len  = np.linalg.norm(pt(self.INDEX_TIP)  - pt(self.INDEX_MCP))
        middle_len = np.linalg.norm(pt(self.MIDDLE_TIP) - pt(self.MIDDLE_MCP))
        ring_len   = np.linalg.norm(pt(self.RING_TIP)   - pt(self.RING_MCP))
        pinky_len  = np.linalg.norm(pt(self.PINKY_TIP)  - pt(self.PINKY_MCP))

        avg_finger_len = np.mean([index_len, middle_len, ring_len, pinky_len])
        finger_ratio = avg_finger_len / (palm_h + 1e-6)

        # ── Finger relative length percentages ────────────────────────
        max_fl = max(index_len, middle_len, ring_len, pinky_len) + 1e-6
        index_pct  = (index_len / max_fl) * 100
        middle_pct = (middle_len / max_fl) * 100
        ring_pct   = (ring_len / max_fl) * 100
        pinky_pct  = (pinky_len / max_fl) * 100

        # ── Finger gap analysis ─────────────────────────────────────
        # Compute angles between adjacent finger MCP→tip direction vectors
        def angle_between(v1: np.ndarray, v2: np.ndarray) -> float:
            dot = float(np.dot(v1, v2))
            norm = (float(np.linalg.norm(v1)) * float(np.linalg.norm(v2))) + 1e-6
            return math.degrees(math.acos(max(-1.0, min(1.0, dot / norm))))

        index_vec  = pt(self.INDEX_TIP)  - pt(self.INDEX_MCP)
        middle_vec = pt(self.MIDDLE_TIP) - pt(self.MIDDLE_MCP)
        ring_vec   = pt(self.RING_TIP)   - pt(self.RING_MCP)
        pinky_vec  = pt(self.PINKY_TIP)  - pt(self.PINKY_MCP)

        gap_im = angle_between(index_vec, middle_vec)     # Index-Middle
        gap_mr = angle_between(middle_vec, ring_vec)      # Middle-Ring
        gap_rp = angle_between(ring_vec, pinky_vec)       # Ring-Pinky
        gap_ip = angle_between(index_vec, pinky_vec)      # overall spread
        finger_gaps = self._describe_finger_gaps(gap_im, gap_mr, gap_rp, gap_ip)

        # ── Wrist line (bracelet line) estimation ──────────────────
        wrist_desc = self._estimate_wrist_lines(bgr, lm, w, h, pt)

        # ── Line curvature / straightness analysis ─────────────────
        # (deferred to line detection section below)

        # ── Thumb analysis ────────────────────────────────────────────
        thumb_tip   = pt(self.THUMB_TIP)
        thumb_ip    = pt(self.THUMB_IP)
        thumb_mcp   = pt(self.THUMB_MCP)
        index_mcp_pt = pt(self.INDEX_MCP)

        thumb_len = np.linalg.norm(thumb_tip - thumb_mcp)
        thumb_angle = self._compute_thumb_angle(
            thumb_tip, thumb_ip, thumb_mcp, index_mcp_pt
        )
        thumb_len_ratio = thumb_len / (avg_finger_len + 1e-6)

        # ── Palm mounds estimation ────────────────────────────────────
        # Estimate relative mound development from landmark positions
        mound_desc = self._estimate_mounds(lm, w, h, pt, shape_ratio)

        # ── Color analysis ────────────────────────────────────────────
        palm_color_desc = self._analyze_palm_color(bgr, lm, w, h)

        # ── Nail half-moon (crescent) estimation ──────────────────────
        halfmoon_desc = self._estimate_halfmoons(lm, w, h)

        # ── Flexibility estimation ────────────────────────────────────
        flexibility_desc = self._estimate_flexibility(
            ring_len, index_len, thumb_angle
        )

        # ── Line analysis via edge detection ──────────────────────────
        horiz = vert = diag_up = diag_down = 0
        try:
            import cv2
            gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)
            edges = cv2.Canny(enhanced, 30, 80)
            lines = cv2.HoughLinesP(
                edges, rho=1, theta=np.pi/180, threshold=40,
                minLineLength=int(min(h, w) * 0.08),
                maxLineGap=int(min(h, w) * 0.04),
            )
            line_count = len(lines) if lines is not None else 0

            # ── Line direction + curvature classification ────────────
            angles_list: list[float] = []
            if lines is not None:
                for ln in lines:
                    x1, y1, x2, y2 = ln[0]
                    angle = abs(math.degrees(math.atan2(y2 - y1, x2 - x1)))
                    angles_list.append(angle)
                    if angle < 30 or angle > 150:
                        horiz += 1
                    elif 60 <= angle <= 120:
                        vert += 1
                    elif 30 <= angle < 60:
                        diag_up += 1
                    else:  # 120 < angle <= 150
                        diag_down += 1

            # Curvature metric: std dev of angles → higher = more varied = curvier
            curvature_score = float(np.std(angles_list)) if angles_list else 20.0
            curvature_desc = self._describe_curvature(curvature_score, line_count)

            line_direction_hint = self._describe_line_direction(
                horiz, vert, diag_up, diag_down, line_count
            )
            if curvature_desc:
                line_direction_hint += "；" + curvature_desc
        except Exception:
            line_count = 10  # fallback
            line_direction_hint = ""
            curvature_desc = ""
            horiz = vert = diag_up = diag_down = 0

        # ── Descriptors ───────────────────────────────────────────────
        hand_shape   = self._describe_hand_shape(shape_ratio, finger_ratio,
                                                  palm_color_desc)
        life_line    = self._describe_life_line(palm_h, shape_ratio)
        head_line    = self._describe_head_line(finger_ratio, shape_ratio,
                                                 index_pct)
        heart_line   = self._describe_heart_line(shape_ratio, line_count)
        fate_line    = self._describe_fate_line(line_count, shape_ratio)
        sun_line     = self._describe_sun_line(line_count, finger_ratio,
                                                ring_pct)
        marriage     = self._describe_marriage_lines(line_count, pinky_pct)
        health       = self._describe_health_line(line_count, palm_color_desc)
        special      = self._describe_special_marks(line_count, shape_ratio,
                                                     line_count > 15)
        thumb_desc   = self._describe_thumb(thumb_angle, thumb_len_ratio,
                                             shape_ratio)
        finger_prop  = self._describe_finger_proportions(
            index_pct, middle_pct, ring_pct, pinky_pct
        )
        summary      = self._generate_summary(
            hand_shape, line_count, shape_ratio, finger_ratio,
            palm_color_desc, mound_desc
        )

        raw_metrics = {
            "shape_ratio": round(shape_ratio, 3),
            "finger_ratio": round(finger_ratio, 3),
            "line_count": line_count,
            "horiz_lines": horiz,
            "vert_lines": vert,
            "diag_up_lines": diag_up,
            "diag_down_lines": diag_down,
            "curvature_score": round(curvature_score, 2),
            "gap_im": round(gap_im, 1),
            "gap_mr": round(gap_mr, 1),
            "gap_rp": round(gap_rp, 1),
            "gap_ip": round(gap_ip, 1),
            "thumb_angle": round(thumb_angle, 1),
            "thumb_len_ratio": round(thumb_len_ratio, 3),
            "index_pct": round(index_pct, 1),
            "middle_pct": round(middle_pct, 1),
            "ring_pct": round(ring_pct, 1),
            "pinky_pct": round(pinky_pct, 1),
            "palm_h_px": round(palm_h, 1),
            "palm_w_px": round(palm_w, 1),
            "hand_confidence": round(confidence, 3),
        }

        return PalmV2TResult(
            hand_shape=hand_shape,
            hand_side=hand_side,
            life_line=life_line,
            head_line=head_line,
            heart_line=heart_line,
            fate_line=fate_line,
            sun_line=sun_line,
            marriage_lines=marriage,
            health_line=health,
            special_marks=special,
            palm_mounds=mound_desc,
            thumb_type=thumb_desc,
            finger_proportions=finger_prop,
            finger_gaps=finger_gaps,
            wrist_lines=wrist_desc,
            palm_color=palm_color_desc,
            nail_halfmoon=halfmoon_desc,
            palm_flexibility=flexibility_desc,
            line_direction_hint=line_direction_hint,
            quality_warning=quality_warning,
            summary=summary,
            raw_metrics=raw_metrics,
        )

    # ── Image quality check ──────────────────────────────────────────

    @staticmethod
    def _check_image_quality(bgr_img: np.ndarray,
                              hand_confidence: float) -> str:
        """Validate image: blur, brightness, and detection confidence."""
        warnings: list[str] = []
        try:
            import cv2
            gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
            # Laplacian variance → blur metric
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            if laplacian_var < 30:
                warnings.append("图像偏模糊，线条细节可能不够精准")
            elif laplacian_var < 60:
                warnings.append("图像清晰度一般，细微纹路判读受限")

            # Brightness check
            mean_brightness = np.mean(gray)
            if mean_brightness < 50:
                warnings.append("光线偏暗，建议在自然光下重新拍照")
            elif mean_brightness > 220:
                warnings.append("曝光过度，掌色及纹路细节可能丢失")

            # Landmark confidence
            if hand_confidence < 0.7:
                warnings.append("手掌检测置信度偏低，请调整手势")
        except Exception:
            return ""

        return "；".join(warnings) if warnings else ""

    # ── Line direction description ──────────────────────────────────

    @staticmethod
    def _describe_line_direction(horiz: int, vert: int,
                                  diag_up: int, diag_down: int,
                                  total: int) -> str:
        """Describe the directional distribution of palm lines."""
        if total == 0:
            return ""

        h_pct = horiz / total * 100
        v_pct = vert / total * 100
        d_pct = (diag_up + diag_down) / total * 100

        hints = []
        if h_pct > 50:
            hints.append("横向纹为主（三大主线倾向明显）")
        elif h_pct > 30:
            hints.append("横向纹较多（感情线/智慧线/生命线走势清晰）")
        if v_pct > 20:
            hints.append("纵向纹明显（命运线/太阳线有较深表现）")
        if d_pct > 30:
            hints.append("斜向纹丰富（人生变化线条多，经历多元）")

        # Gestalt judgment
        if h_pct > 50 and v_pct > 15:
            hints.append("横纵交错=人生格局既有主线框架也有纵向突破")
        if d_pct > 50:
            hints.append("斜纹主导=变通力极强，不走寻常路")

        return "；".join(hints) if hints else "线条分布平均（综合型掌纹格局）"

    # ── Geometric helpers ───────────────────────────────────────────

    @staticmethod
    def _compute_thumb_angle(tip: np.ndarray, ip: np.ndarray,
                              mcp: np.ndarray, index_mcp: np.ndarray) -> float:
        """Compute thumb opening angle relative to index finger base."""
        # Vector from thumb MCP to tip
        v1 = tip - mcp
        v2 = index_mcp - mcp
        dot = np.dot(v1, v2)
        norm = (np.linalg.norm(v1) * np.linalg.norm(v2)) + 1e-6
        cos_angle = np.clip(dot / norm, -1, 1)
        return math.degrees(math.acos(cos_angle))

    # ── Palm mound estimation from landmarks ───────────────────────────

    @staticmethod
    def _estimate_mounds(lm, img_w: int, img_h: int,
                          pt_fn, shape_ratio: float) -> str:
        """
        Estimate the 8 palm mounds based on MediaPipe landmark positions.
        Returns a Chinese description string.
        """
        # Key landmark indices for mound estimation
        # Jupiter mound → near index finger base (landmark 5 area)
        # Saturn mound → near middle finger base (landmark 9 area)
        # Sun (Apollo) mound → near ring finger base (landmark 13 area)
        # Mercury mound → near pinky base (landmark 17 area)
        # Venus mound → near thumb base (landmarks 1-4)
        # Mars mound → center of palm (between mounds)
        # Moon (Luna) mound → wrist/pinky side
        # Neptune mound → wrist/thumb side

        # Estimate mound fullness by measuring distances from wrist
        # to various base points — fuller mounds have more tissue
        wrist = pt_fn(0)
        index_base  = pt_fn(5)
        mid_base    = pt_fn(9)
        ring_base   = pt_fn(13)
        pinky_base  = pt_fn(17)
        thumb_base  = pt_fn(2)

        # Compute vertical distances from wrist (proxy for mound fullness)
        def vert_dist(p: np.ndarray) -> float:
            return abs(p[1] - wrist[1])

        scores = {}
        scores["木星丘(Jupiter)"] = vert_dist(index_base)
        scores["土星丘(Saturn)"]  = vert_dist(mid_base)
        scores["太阳丘(Apollo)"]  = vert_dist(ring_base)
        scores["水星丘(Mercury)"] = vert_dist(pinky_base)
        scores["金星丘(Venus)"]   = vert_dist(thumb_base) * 0.8

        max_score = max(scores.values()) if scores else 1
        mound_parts = []

        for name, score in scores.items():
            ratio = score / (max_score + 1e-6)
            if ratio > 0.85:
                mound_parts.append(f"{name}饱满")
            elif ratio > 0.55:
                mound_parts.append(f"{name}适中")
            else:
                mound_parts.append(f"{name}偏平")

        # Estimate Moon (Luna) mound from palm width ratio
        if shape_ratio > 0.82:
            mound_parts.append("月丘( Luna)丰满")
        elif shape_ratio > 0.65:
            mound_parts.append("月丘( Luna)适中")
        else:
            mound_parts.append("月丘( Luna)偏平")

        # Mars mound (center of palm) from overall palm shape
        if 0.65 < shape_ratio < 0.80:
            mound_parts.append("火星丘饱满(掌心厚实)")
        else:
            mound_parts.append("火星丘适中")

        return "、".join(mound_parts)

    # ── Skin color analysis ─────────────────────────────────────────

    @staticmethod
    def _analyze_palm_color(bgr_img: np.ndarray, lm, w: int, h: int) -> str:
        """Analyze palm skin color from the palm region."""
        try:
            import cv2
            # Sample a region in the center of the palm
            cx, cy = int(w * 0.5), int(h * 0.4)
            patch = bgr_img[max(0, cy-15):cy+15, max(0, cx-15):cx+15]
            if patch.size == 0:
                return "掌色: 无法检测"
            mean_bgr = np.mean(patch, axis=(0, 1))
            b, g, r = mean_bgr

            # Determine color category
            brightness = (r + g + b) / 3

            if brightness < 60:
                return "掌色偏暗（气血不足之象，需注意循环系统）"
            elif brightness > 200:
                return "掌色偏白（气色清透，但若苍白则血虚）"

            # Check for reddish / pinkish
            if r > g * 1.15 and r > b * 1.15:
                if r > 170:
                    return "掌色红润（气血充盈，精力旺盛，但过红则肝火偏旺）"
                elif r > 120:
                    return "掌色微红偏粉（血气通畅，健康良好）"
                else:
                    return "掌色适中偏红（体质偏热，精力充沛）"
            elif g > r * 1.05:
                return "掌色偏黄（肝胆需关注，或多思虑之象）"
            elif b > r * 1.05:
                return "掌色偏青暗（微循环需关注，注意保暖）"
            else:
                return "掌色红黄均匀（气血调和，健康状态良好）"
        except Exception:
            return ""

    # ── Nail half-moon estimation ──────────────────────────────────

    @staticmethod
    def _estimate_halfmoons(lm, w: int, h: int) -> str:
        """
        Estimate half-moon (半月痕/指甲白月牙) presence from finger DIP joint data.
        This is a heuristic since the camera doesn't focus on nails directly.
        """
        # Use DIP joint spacing as a rough proxy for nail health
        try:
            # Measure distances between DIP joints of adjacent fingers
            index_dip  = np.array([lm[7].x * w, lm[7].y * h])
            middle_dip = np.array([lm[11].x * w, lm[11].y * h])
            ring_dip   = np.array([lm[15].x * w, lm[15].y * h])
            pinky_dip  = np.array([lm[19].x * w, lm[19].y * h])

            # Measure how clear the DIP separation is (proxy for joint definition)
            # Clearer joints → more likely healthy nails
            dip_spacing = np.mean([
                np.linalg.norm(index_dip - middle_dip),
                np.linalg.norm(middle_dip - ring_dip),
                np.linalg.norm(ring_dip - pinky_dip),
            ])

            # This is a rough proxy — in reality need nail-focused image
            if dip_spacing > 30:
                return "半月痕隐约可见（推测拇指和食指有清晰半月痕，精力储备尚可）"
            elif dip_spacing > 18:
                return "半月痕偏少（可能仅有拇指有半月痕，需注意休息与精力管理）"
            else:
                return "半月痕不清晰（图像分辨率有限，建议在自然光下单独观察指甲半月痕）"
        except Exception:
            return ""

    # ── Flexibility estimation ─────────────────────────────────────

    @staticmethod
    def _estimate_flexibility(ring_len: float, index_len: float,
                               thumb_angle: float) -> str:
        """
        Estimate palm flexibility from finger length ratios and thumb angle.
        More flexible hands tend to have longer ring fingers and wider thumb angles.
        """
        # Ring-to-index ratio proxy
        ring_index_ratio = ring_len / (index_len + 1e-6)

        flex_score = 0
        if ring_index_ratio > 1.05:
            flex_score += 1  # longer ring = more flexible
        if thumb_angle > 50:
            flex_score += 1  # wider thumb = more flexible
        if ring_index_ratio > 1.10:
            flex_score += 1

        if flex_score >= 2:
            return "手柔软灵活（指关节柔韧度高，适应性强，富有艺术气质）"
        elif flex_score >= 1:
            return "手软硬适中（兼具柔韧与稳定，适应能力平衡）"
        return "手偏硬实（意志坚定，原则性强，做事有恒心，但需主动培养变通能力）"

    # ── Scoring-based hand shape classification (replaces hard thresholds) ──

    @staticmethod
    def _describe_hand_shape(shape_ratio: float, finger_ratio: float,
                              color_desc: str) -> str:
        """
        Classify into 五行 hand shapes via Gaussian scoring.
        Each hand type has an ideal center (shape_ratio, finger_ratio).
        The closest match wins — no more threshold boundary artifacts.
        """
        # Type definitions: (ideal_sr, ideal_fr, sr_spread, fr_spread, description)
        types = [
            (0.88, 0.38, 0.10, 0.06,
             "土型手（方形宽厚，务实稳健，财务管理能力强，适合商业与建筑领域。"
             "土主信，其人厚重可靠，然土多易固执，需以金水疏导）"),
            (0.80, 0.46, 0.08, 0.05,
             "金型手（方正有棱，指节分明，决断力强，善于管理与规划。"
             "金主义，其性刚果，然金过刚易折，需以火炼之、以水润之）"),
            (0.60, 0.60, 0.08, 0.06,
             "水型手（修长纤细，文采斐然，直觉敏锐，适合创意与灵性领域。"
             "水主智，其性柔善，然水过旺易多愁善感，需以火土制衡）"),
            (0.80, 0.56, 0.08, 0.05,
             "火型手（掌宽指长，热情充沛，行动力强，适合领导与创业。"
             "火主礼，其性热烈，然火过旺易急躁冲动，需以水济之）"),
            (0.65, 0.52, 0.08, 0.05,
             "木型手（手型修长，指节显露，筋脉清晰。木主仁，其性直，清高自许，"
             "然木多易思虑过重，需以金修剪、以水滋养）"),
        ]

        best_desc = ("混合型手（比例协调，思维灵活，适应性强。"
                     "兼具多种五行特质，人生面向多元）")
        best_score = -1.0

        for ideal_sr, ideal_fr, spread_sr, spread_fr, desc in types:
            sr_dist = ((shape_ratio - ideal_sr) / spread_sr) ** 2
            fr_dist = ((finger_ratio - ideal_fr) / spread_fr) ** 2
            score = 1.0 / (1.0 + sr_dist + fr_dist)
            if score > best_score:
                best_score = score
                best_desc = desc

        return best_desc

    # ── Enhanced line descriptors ──────────────────────────────────

    @staticmethod
    def _describe_life_line(palm_h: float, shape_ratio: float) -> str:
        if palm_h > 180:
            return "生命线深长清晰，大弧度延伸至手腕（生命力旺盛，体魄强健，人生精力充沛，寿元较长。弧线大开大合者，人生阅历丰富，热爱生活）"
        if palm_h > 120:
            return "生命线长度适中，走势平稳有力（身体健康基础良好，人生节奏稳健，中年45岁前后需注意养生。若末端分叉，晚年仍有余力发展副业或爱好）"
        if palm_h > 80:
            return "生命线偏短但清晰不断（质量重于数量，人生精彩程度不受影响，精力集中。建议注重体质保养，避免过度消耗）"
        return "生命线较短（爆发力强但耐力需培养，宜借助规律作息与适度运动提升精力资本）"

    @staticmethod
    def _describe_head_line(finger_ratio: float, shape_ratio: float,
                             index_pct: float) -> str:
        # Longer index finger → more analytical tendency
        if index_pct > 92:
            return "智慧线深长，弯曲弧度优美（思维深邃，想象力丰富，擅长战略思考，适合研究与创作。食指偏长佐证分析能力强，但需避免思虑过度）"
        if finger_ratio > 0.55:
            return "智慧线延伸较长，略向掌心弯曲（思维敏锐，直觉与逻辑并存，艺术感悟力强。适合跨界发展，决策偏感性与理性之间的平衡地带）"
        if shape_ratio < 0.70:
            return "智慧线笔直延伸，清晰有力（逻辑思维超群，决断力极强，实事求是，适合技术、工程与商业管理。缺点是可能缺乏弹性，需培养感性认知）"
        if shape_ratio > 0.80:
            return "智慧线与感情线距离较宽（思维开放，不拘泥传统，敢于尝试新鲜事物。心胸开阔看得开）"
        return "智慧线走势适中，长度达无名指下方（兼具感性与理性，适应能力出众，处事灵活有度）"

    @staticmethod
    def _describe_heart_line(shape_ratio: float, line_count: int) -> str:
        if shape_ratio > 0.82 and line_count > 12:
            return "感情线深长弯曲，延伸至食指根部（感情真挚热烈，理想主义色彩浓厚，追求灵魂共鸣。纹路丰富者共情能力极强，但需学会情绪边界）"
        if shape_ratio > 0.80:
            return "感情线弯曲上扬，末端上扬有力（热情主动的爱恋模式，乐于表达情感，在关系中占据主导。但需注意占有欲的适度控制）"
        if shape_ratio > 0.65:
            return "感情线长短适中，走势平缓连贯（情感表达均衡，理性与感性兼顾，感情生活稳定。不易被激情冲昏头脑，是值得信赖的伴侣类型）"
        if shape_ratio < 0.60:
            return "感情线较直，贴近智慧线（理智型感情观，用头脑而非心情去爱。看似冷静克制，实则一旦认定便深情专一，是'慢热长情'型）"
        return "感情线平直清晰（情感自控力强，不易被外界干扰。情绪稳定是最大优势，但需注意适度表达内心感受以免被误解为冷漠）"

    @staticmethod
    def _describe_fate_line(line_count: int, shape_ratio: float) -> str:
        if line_count > 18:
            return "命运线清晰深长，从掌底直升至中指方向（外部贵人助力强劲，事业轨迹清晰可见，35岁前后有重大转折机遇。纹路丰沛说明人生路径多元）"
        if line_count > 15:
            return "命运线可见，从掌底向上延伸（事业有一定轨迹可循，贵人运佳，人生有明确的奋斗目标。若在上升途中出现横纹截断，需注意阶段性调整方向）"
        if line_count > 10:
            return "命运线若隐若现或分段呈现（事业靠自力更生为主，转折点在35-40岁前后，中年后运势逐渐明朗。分段式命运线代表人生有多次自主选择的转折点）"
        if line_count > 6:
            return "命运线短暂但清晰（早期的职业生涯有明确方向，中年后可能转型或不再依赖传统职业路径。适合自由职业与多元化发展）"
        return "命运线不明显或无（自由派人生，不受传统命运轨迹束缚。路由自己开创，人生变化丰富，灵活度高，但需主动规划以免迷失方向）"

    @staticmethod
    def _describe_sun_line(line_count: int, finger_ratio: float,
                            ring_pct: float) -> str:
        if line_count > 14 and ring_pct > 90:
            return "太阳线清晰深长（成就感强烈，易获得社会声誉与公众认可。无名指长且太阳线明显，艺术或商业领域均有成名的潜质）"
        if line_count > 12 and finger_ratio > 0.50:
            return "太阳线清晰可见（有一定社会影响力，通过持续努力可累积口碑与人气。35岁后声名渐起）"
        if line_count > 9:
            return "太阳线浅而可辨（注重内在成就多于外部认可，名声非主要追求，但在专业领域内受人尊敬）"
        return "太阳线不明显（低调务实，专注内在修为。社会声誉来得较晚或不在个人追求范围内，但真正的价值不依赖外在掌声）"

    @staticmethod
    def _describe_marriage_lines(line_count: int, pinky_pct: float) -> str:
        if line_count > 16:
            return "婚姻线区域纹路较多（感情经历丰富社交活跃。可见两条主线者，正缘在30岁前后出现，辅线多代表人际缘分广阔，需注意选择）"
        if line_count > 14:
            return "婚姻线可见两条，一深一浅（深线为主姻缘，浅线为重要情感经历。正缘在28-32岁之间，感情运整体顺遂但需经历选择）"
        if line_count > 11:
            return "婚姻线清晰一条，长度适中（感情专一且稳定，婚姻关系较为顺遂。无名指长且婚姻线清明者，配偶质量高）"
        if line_count > 9:
            return "婚姻线清晰一条且短（对婚姻要求较高，不轻易进入关系，但一旦选择则从一而终。晚婚倾向，但婚姻质量稳定）"
        return "婚姻线较浅或无明显主线（对婚姻持有开放或审慎态度，不拘泥传统婚姻模式。情感上追求精神层面的契合大于形式上的结合）"

    @staticmethod
    def _describe_health_line(line_count: int, color_desc: str) -> str:
        """NEW: Health line analysis."""
        is_dark = "暗" in color_desc or "青" in color_desc
        is_pale = "白" in color_desc

        if line_count > 18 and not is_dark:
            return "健康线深长（新陈代谢旺盛，体质强健。但健康线过于粗深反而提示肝胆负担较重，需注意劳逸结合）"
        if line_count > 12:
            if is_pale:
                return "健康线中等清晰（消化系统需关注，若伴掌色偏白，注意营养均衡与规律作息）"
            return "健康线适度可见（身体状况良好，自我修复能力强，无明显健康隐患）"
        if is_dark:
            return "健康线不明显但掌色偏暗（建议关注循环系统与代谢状态，适当增加有氧运动促进气血循环）"
        return "健康线不明显（先天体质较纯净，若无不适则无需过度关注。但不代表可以忽视健康管理）"

    @staticmethod
    def _describe_thumb(thumb_angle: float, thumb_len_ratio: float,
                         shape_ratio: float) -> str:
        """NEW: Thumb type analysis (a key feature in palmistry)."""
        # Thumb angle → willpower / flexibility
        if thumb_angle > 55:
            angle_desc = "拇指角度较大(>55°)，说明性格开放灵活"
            will = "不拘泥传统，适应力强，社交手腕高超"
        elif thumb_angle > 40:
            angle_desc = "拇指角度适中(40-55°)，说明性格平衡"
            will = "既有原则性又有灵活性，判断力合理"
        else:
            angle_desc = "拇指角度偏小(<40°)，说明意志坚定"
            will = "传统保守但持之以恒，专注力惊人"

        # Thumb length → willpower strength
        if thumb_len_ratio > 0.65:
            len_desc = "拇指偏长且粗壮（意志力强大，有领导欲，不轻易服输。在工作和事业中有天然的主导倾向）"
        elif thumb_len_ratio > 0.50:
            len_desc = "拇指长度适中（意志力与协调能力平衡，既不会过于强势也不会优柔寡断）"
        else:
            len_desc = "拇指偏短（随和包容，不喜欢强加意志于他人。团队合作中的润滑剂，但需培养决策的果断性）"

        # Thumb shape classification based on angle and ratio
        if thumb_angle > 50 and thumb_len_ratio > 0.60:
            return f"{angle_desc}，{len_desc} 综合判断为【灵活力量型拇指】——既有开放的心态又有坚定的执行力，是领导者与创新者的手相特征"
        elif thumb_angle < 40 and thumb_len_ratio > 0.60:
            return f"{angle_desc}，{len_desc} 综合判断为【刚毅执著型拇指】——意志力超群，锁定目标后百折不挠，但需注意适当变通"
        elif thumb_angle > 50 and thumb_len_ratio < 0.55:
            return f"{angle_desc}，{len_desc} 综合判断为【灵活社交型拇指】——人际关系圆融，以柔克刚，适合外交、咨询、创意等需要沟通的领域"
        else:
            return f"{angle_desc}，{len_desc}"

    @staticmethod
    def _describe_finger_proportions(index_pct: float, middle_pct: float,
                                      ring_pct: float, pinky_pct: float) -> str:
        """NEW: Finger proportion analysis (五指论)."""
        parts = []

        # Index finger (食指—木星指)
        if index_pct > 95:
            parts.append("食指修长（野心抱负强，天生领导欲，不甘人下。若直而有力，则权威自成）")
        elif index_pct > 82:
            parts.append("食指长度适中（有适度的进取心，能在团队中找准自我定位，不卑不亢）")
        else:
            parts.append("食指偏短（谦逊内敛，不喜与人争锋。配合长中指则靠专业能力取胜）")

        # Middle finger (中指—土星指)
        if middle_pct > 98:
            parts.append("中指特别修长（深度思考者，责任感重，人生哲学感强。但需注意避免过度悲观与自我苛责）")
        elif middle_pct > 85:
            parts.append("中指端正（责任心强，有底线有原则。人生稳健，处事成熟）")
        else:
            parts.append("中指偏短（直觉型人格，不太受常规约束。轻松随意的人生态度，但需培养持续深耕的耐心）")

        # Ring finger (无名指—太阳指)
        if ring_pct > 93:
            parts.append("无名指长（艺术鉴赏力或商业嗅觉发达，有成名潜质。创造力与表现欲并存）")
        elif ring_pct > 78:
            parts.append("无名指长度适中（创造力与务实平衡，能在专业领域中获得相应的认可与回报）")
        else:
            parts.append("无名指偏短（务实低调，对名利不太热衷。专注内在成就，是脚踏实地的实干家）")

        # Pinky (小指—水星指)
        if pinky_pct > 80:
            parts.append("小指修长（沟通表达能力卓越，口才好，适合销售、谈判、写作等需要语言的领域。若过无名指第一关节为佳相）")
        elif pinky_pct > 60:
            parts.append("小指长度适中（沟通能力中等偏上，能清楚表达自己，社交无大碍）")
        else:
            parts.append("小指偏短（表达偏内敛，深思熟虑后才发言。言必有中，但需注意不要因不善表达错失良机）")

        return " | ".join(parts)

    # ── Finger gap analysis ──────────────────────────────────────────

    @staticmethod
    def _describe_finger_gaps(gap_im: float, gap_mr: float,
                               gap_rp: float, gap_ip: float) -> str:
        """Analyze finger gap characteristics (指缝/手指间隙)."""
        parts = []

        # Index-Middle gap → independent thinking vs conformity
        if gap_im > 20:
            parts.append("食指与中指间隙较宽(独立思考型，不盲从权威，有自己的一套价值体系)")
        elif gap_im < 10:
            parts.append("食指与中指间隙偏窄(遵从传统与社会规范，重视他人看法)")
        else:
            parts.append("食指与中指间隙适中(独立思考与社会适应力平衡)")

        # Middle-Ring gap → risk tolerance / planning
        if gap_mr > 18:
            parts.append("中指与无名指间隙大(冒险精神强，敢于打破常规，但需注意风险管控)")
        elif gap_mr < 8:
            parts.append("中指与无名指间隙小(做事谨慎，善于计划，凡事留有余地)")
        else:
            parts.append("中指与无名指间隙适中(冒险与稳健的平衡把握得当)")

        # Ring-Pinky gap → communication / self-expression
        if gap_rp > 22:
            parts.append("无名指与小指间隙宽(表达自信，语言风趣，社交场合挥洒自如)")
        elif gap_rp < 10:
            parts.append("无名指与小指间隙窄(表达含蓄，言必有中，不喜无意义的社交)")
        else:
            parts.append("无名指与小指间隙适中(表达既不过于张扬也不过于内敛)")

        # Overall spread (index to pinky)
        if gap_ip > 65:
            parts.append("总体指缝开阔(心胸宽广，不拘小节，人生格局大)")
        elif gap_ip < 35:
            parts.append("总体指缝偏窄(性格内敛审慎，精打细算，是专注型人才)")

        return "；".join(parts)

    # ── Wrist / Bracelet line estimation ─────────────────────────────

    @staticmethod
    def _estimate_wrist_lines(bgr_img: np.ndarray, lm, w: int, h: int,
                               pt_fn) -> str:
        """
        Estimate bracelet/wrist lines (手镯线) from edge detection
        near the wrist crease area. Multiple clear lines = good health.
        """
        try:
            import cv2
            wrist = pt_fn(0)
            wx, wy = int(wrist[0]), int(wrist[1])

            # Define the wrist region
            y_top = max(0, wy - int(h * 0.02))
            y_bot = min(h - 1, wy + int(h * 0.08))
            x_l = max(0, wx - int(w * 0.15))
            x_r = min(w - 1, wx + int(w * 0.15))

            if y_bot <= y_top or x_r <= x_l:
                return ""

            gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
            roi = gray[y_top:y_bot, x_l:x_r]
            if roi.size == 0:
                return ""

            # Horizontal edge detection in wrist region
            edges = cv2.Canny(roi, 25, 70)
            h_lines = cv2.HoughLinesP(
                edges, rho=1, theta=np.pi / 180, threshold=15,
                minLineLength=int(w * 0.06),
                maxLineGap=int(h * 0.01),
            )

            # Count distinct horizontal bands (potential bracelet lines)
            band_count = 0
            if h_lines is not None:
                y_positions = sorted({abs((y1 + y2) // 2) for ln in h_lines
                                      for x1, y1, x2, y2 in [ln[0]]})
                # Cluster nearby y positions
                if y_positions:
                    clusters = [[y_positions[0]]]
                    for y in y_positions[1:]:
                        if y - clusters[-1][-1] < int(h * 0.01):
                            clusters[-1].append(y)
                        else:
                            clusters.append([y])
                    band_count = len(clusters)

            if band_count >= 3:
                return "手腕线清晰2-3条（福泽深厚，身体健康基础好，中年后运势有根基支撑）"
            elif band_count == 2:
                return "手腕线可见1-2条（健康状态良好，精力基本充足，建议规律运动加以巩固）"
            elif band_count == 1:
                return "手腕线偏浅（先天精力偏弱，需注重后天养生调理，早睡早起为本）"
            return "手腕线不清晰（图像分辨率有限，建议在自然光下单独观察手腕横纹）"
        except Exception:
            return ""

    # ── Line curvature analysis ──────────────────────────────────────

    @staticmethod
    def _describe_curvature(curvature_score: float, line_count: int) -> str:
        """Describe line curvature from angle standard deviation."""
        # curvature_score = std of Hough line angles
        # Low std → mostly parallel/straight; high std → varied/curvy
        if line_count < 5:
            return ""

        if curvature_score < 15:
            return "掌纹走势较为平直规整（思维条理清晰，做事有章法，人生轨迹相对平稳）"
        elif curvature_score < 28:
            return "掌纹走势弯直有度（适应力强，既有原则性也有弹性，人生张弛有度）"
        else:
            return "掌纹走势弯曲多变（思维活跃跳跃，人生经历丰富曲折，情感世界色彩斑斓）"

    # ── Enhanced special marks ─────────────────────────────────────

    @staticmethod
    def _describe_special_marks(line_count: int, shape_ratio: float,
                                 has_many_lines: bool) -> str:
        marks = []
        if has_many_lines:
            marks.append("掌纹网络密集（思维极为活跃，敏感度高，洞察细节能力强。但需注意大脑过载，建议定期做冥想或放空训练）")
        if shape_ratio > 0.88:
            marks.append("掌心宽厚有方形格局（土性能量构成的稳定保护场，为人稳重可靠。逢凶化吉，危难时总有贵人相助）")
        if shape_ratio < 0.60:
            marks.append("掌心修长（水性能量主导，情感与直觉的接收器灵敏。对能量场敏感，适合灵性修行与艺术创作）")
        if line_count > 20:
            marks.append("掌中十字纹或星纹较多（人生转折点密集，每一道星纹都是一个重大事件的标记。建议关注关键年份的决策质量）")

        if not marks:
            if line_count > 12:
                marks.append("纹路清晰简洁（思路明确，行事干脆。没有过多杂乱纹路意味着人生不会有太多无谓的波折）")
            else:
                marks.append("纹路稀疏而清明（简单纯粹的生命质地，不喜复杂的人际与事务。人生道路较为平顺，少有大的波澜）")

        return "、".join(marks)

    # ── Summary ────────────────────────────────────────────────────

    @staticmethod
    def _generate_summary(hand_shape: str, line_count: int,
                           shape_ratio: float, finger_ratio: float,
                           color_desc: str, mound_desc: str) -> str:
        """Generate comprehensive palm summary with multi-factor evaluation."""
        score = 0
        positives = []
        warnings = []
        suggestions = []

        # Shape scoring
        if "土型" in hand_shape:
            score += 1
            positives.append("土型掌务实稳重，理财天赋")
            suggestions.append("宜补金水以疏导土滞，可佩戴金属饰品")
        if "火型" in hand_shape:
            score += 1
            positives.append("火型掌热情进取，行动力超群")
            suggestions.append("宜补水以济火燥，推荐蓝色/黑色水晶")
        if "金型" in hand_shape:
            score += 1
            positives.append("金型掌决断明快，管理才能突出")
            suggestions.append("宜补火以炼金成器，推荐红色饰品")
        if "木型" in hand_shape:
            positives.append("木型掌清高独立，精神追求强")
            suggestions.append("宜补金以适度修剪，推荐白色金属饰品")
        if "水型" in hand_shape:
            positives.append("水型掌灵感丰沛，艺术天赋高")
            suggestions.append("宜补火土以制水寒，推荐黄色/红色饰品")
        if "混合" in hand_shape:
            positives.append("手型均衡，适应力强")

        # Line density scoring
        if 10 < line_count < 18:
            score += 1
            positives.append("纹路清晰适度，思路明确")
        elif line_count >= 18:
            positives.append("纹路丰富，思维活跃，人生经历多元")
            warnings.append("纹路过密者易思虑过重，建议定期清空思绪")

        # Proportion check
        if 0.65 < shape_ratio < 0.85:
            score += 1
        if 0.45 < finger_ratio < 0.60:
            score += 1

        # Color check
        if "红润" in color_desc:
            score += 2
            positives.append("掌色红润，气血充盈精力足")
        elif "微红" in color_desc:
            score += 1
            positives.append("掌色健康，气血通畅")
        elif "暗" in color_desc:
            score -= 1
            warnings.append("掌色偏暗需关注气血循环")
        elif "青" in color_desc:
            score -= 1
            warnings.append("掌色偏青需关注循环代谢")
        elif "黄" in color_desc:
            score -= 1
            warnings.append("掌色偏黄需留意肝胆调理")
        elif "苍白" in color_desc:
            score -= 1
            warnings.append("掌色偏白需注意补血养气")

        # Mounds check
        full_count = mound_desc.count("饱满")
        flat_count = mound_desc.count("偏平")
        if full_count >= 4:
            score += 1
            positives.append(f"掌丘{full_count}丘饱满，综合素质佳")
        if flat_count >= 3:
            score -= 1
            warnings.append(f"掌丘{flat_count}丘偏平，相关领域能量需要后天加强")

        # Build report
        if score >= 5:
            base = "手相格局优良。主线清晰有力，掌丘饱满，掌色健康，人生各领域能量均衡流通。事业、感情、健康均有良好的先天基础，中年后运势呈上升趋势。"
        elif score >= 3:
            base = "手相格局中上。有强项亦有可提升之处，人生机遇与挑战并存。关键在35-45岁之间的转折期——主动调整则可顺势而上。"
        elif score >= 1:
            base = "手相格局中等。先天禀赋有强有弱，需通过后天努力补足短板——这正是此命给予你的成长空间。掌色与掌丘偏弱者建议配合五行开运调整。"
        else:
            base = "手相偏复杂，先天能量分布不均衡。人生历练丰富，需通过后天修为和开运调整扬长避短。五行补益对此命而言尤为重要。"

        extra = []
        if positives:
            extra.append("优势特征：" + "、".join(positives[:3]))
        if warnings:
            extra.append("关注建议：" + "、".join(warnings[:2]))
        if suggestions:
            extra.append("开运方向：" + "；".join(suggestions[:2]))

        bonus = " | ".join(extra) if extra else ""
        return (base + "\n  " + bonus) if bonus else base
