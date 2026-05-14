"""
agents/state.py — SystemState shared across the 1+5 pipeline
"""
from __future__ import annotations
import uuid
from typing import Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class BirthInfo(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int = 0
    city: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gender: Literal["male", "female", "other"] = "female"


class FaceFeatures(BaseModel):
    """Structured face features after V2T conversion"""
    three_zones_ratio: str = ""    # 三庭比例 forehead:nose:chin
    face_shape: str = ""           # 脸型 oval/round/square/heart/long
    forehead: str = ""
    eyes: str = ""
    nose: str = ""
    mouth: str = ""
    chin: str = ""
    cheekbones: str = ""
    ears: str = ""
    zhun_tou: str = ""
    shan_gen: str = ""
    di_ge: str = ""
    e_tou: str = ""
    liang_quan: str = ""
    yan_shen: str = ""
    eyebrows: str = ""
    ren_zhong: str = ""
    summary: str = ""
    raw_metrics: dict = Field(default_factory=dict)
    raw_text: str = ""

    def to_prompt_text(self) -> str:
        parts = []
        if self.three_zones_ratio:
            parts.append(f"三庭比例: {self.three_zones_ratio}")
        if self.face_shape:
            parts.append(f"脸型: {self.face_shape}")
        for label, val in [
            ("额头", self.forehead or self.e_tou),
            ("眼型眼神", self.eyes or self.yan_shen),
            ("鼻型准头", self.nose or self.zhun_tou),
            ("唇型", self.mouth),
            ("地阁下巴", self.chin or self.di_ge),
            ("两颧", self.cheekbones or self.liang_quan),
            ("耳朵", self.ears),
            ("人中", self.ren_zhong),
        ]:
            if val:
                parts.append(f"{label}: {val}")
        if self.eyebrows:
            parts.append(f"眉毛: {self.eyebrows}")
        if self.summary:
            parts.append(f"综合: {self.summary}")
        return "\n".join(parts) if parts else self.raw_text


class PalmFeatures(BaseModel):
    """Structured palm features after V2T conversion — enhanced with more dimensions"""
    hand_shape: str = ""
    hand_side: str = ""              # 左右手: "左手" / "右手" / ""
    life_line: str = ""
    head_line: str = ""
    heart_line: str = ""
    fate_line: str = ""
    sun_line: str = ""
    mercury_line: str = ""
    marriage_lines: str = ""
    health_line: str = ""            # 健康线
    special_marks: str = ""
    palm_mounds: str = ""            # 掌丘评估
    thumb_type: str = ""             # 拇指类型
    finger_proportions: str = ""     # 手指比例
    finger_gaps: str = ""            # NEW: 手指间隙
    wrist_lines: str = ""            # NEW: 手腕线(手镯线)
    palm_color: str = ""             # 掌色
    nail_halfmoon: str = ""          # 半月痕
    palm_flexibility: str = ""       # 手软硬
    raw_metrics: dict = Field(default_factory=dict)  # NEW: 原始指标数据
    raw_text: str = ""

    def to_prompt_text(self) -> str:
        parts = []
        for label, val in [
            ("检测手", self.hand_side),
            ("手型", self.hand_shape),
            ("生命线", self.life_line),
            ("智慧线", self.head_line),
            ("感情线", self.heart_line),
            ("命运线", self.fate_line),
            ("太阳线", self.sun_line),
            ("水星线", self.mercury_line),
            ("婚姻线", self.marriage_lines),
            ("健康线", self.health_line),
            ("手指间隙", self.finger_gaps),
            ("手腕线", self.wrist_lines),
            ("特殊纹路", self.special_marks),
            ("掌丘", self.palm_mounds),
            ("拇指", self.thumb_type),
            ("手指比例", self.finger_proportions),
            ("掌色", self.palm_color),
            ("半月痕", self.nail_halfmoon),
            ("手软硬", self.palm_flexibility),
        ]:
            if val:
                parts.append(f"{label}: {val}")
        return "\n".join(parts) if parts else self.raw_text


class WorkerOutput(BaseModel):
    agent_id: str
    report: str = ""
    weakness_tags: list[str] = Field(default_factory=list)
    strength_tags: list[str] = Field(default_factory=list)
    boost_elements: list[str] = Field(default_factory=list)
    conflict_warnings: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    error: Optional[str] = None
    duration_ms: Optional[float] = None
    streamed: bool = False  # SSE streaming flag — set True after pushed to client

    def model_post_init(self, __context) -> None:
        if self.weakness_tags and not self.tags:
            self.tags = self.weakness_tags
        elif self.tags and not self.weakness_tags:
            self.weakness_tags = self.tags


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    agent_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ConflictRecord(BaseModel):
    """Cross-domain contradiction detected during synthesis"""
    domain_a: str
    domain_b: str
    description: str
    severity: Literal["low", "medium", "high"] = "medium"


class SystemState(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    birth_info: Optional[BirthInfo] = None
    face_features: Optional[FaceFeatures] = None
    palm_features: Optional[PalmFeatures] = None
    user_question: str = "请给我一份全维度命理分析报告"
    is_premium: bool = False

    bazi_raw: dict = Field(default_factory=dict)
    astrology_raw: dict = Field(default_factory=dict)
    tarot_raw: dict = Field(default_factory=dict)
    qimen_raw: dict = Field(default_factory=dict)
    ziwei_raw: dict = Field(default_factory=dict)

    astrology_output: WorkerOutput = Field(
        default_factory=lambda: WorkerOutput(agent_id="astrology"))
    tarot_output: WorkerOutput = Field(
        default_factory=lambda: WorkerOutput(agent_id="tarot"))
    bazi_output: WorkerOutput = Field(
        default_factory=lambda: WorkerOutput(agent_id="bazi"))
    qimen_output: WorkerOutput = Field(
        default_factory=lambda: WorkerOutput(agent_id="qimen"))
    ziwei_output: WorkerOutput = Field(
        default_factory=lambda: WorkerOutput(agent_id="ziwei"))
    face_output: WorkerOutput = Field(
        default_factory=lambda: WorkerOutput(agent_id="face"))
    palm_output: WorkerOutput = Field(
        default_factory=lambda: WorkerOutput(agent_id="palm"))

    conflicts: list[ConflictRecord] = Field(default_factory=list)
    master_summary: str = ""
    master_detail: str = ""
    recommended_product_ids: list[str] = Field(default_factory=list)
    recommended_products: list[dict] = Field(default_factory=list)
    computed_tags: list[str] = Field(default_factory=list)
    all_strength_tags: list[str] = Field(default_factory=list)
    core_warnings: list[str] = Field(default_factory=list)
    dimension_scores: dict[str, float] = Field(default_factory=lambda: {
        "wealth": 5.0, "relationship": 5.0,
        "career": 5.0, "health": 5.0, "spiritual": 5.0,
    })
    harmonization_plan: str = ""

    # Master sub-task results (for parallel synthesis)
    master_subtask_core: str = ""       # Sub-task A: 核心综合
    master_subtask_dimensions: str = ""  # Sub-task B: 五维诊断
    master_subtask_actions: str = ""     # Sub-task C: 行动建议

    chat_history: list[ChatMessage] = Field(default_factory=list)
    current_route: Optional[str] = None
    loop_count: int = 0

    # Progress tracking for SSE streaming
    progress_pct: int = 0              # 0-100
    progress_message: str = ""         # Human-readable current phase
    agent_status: dict[str, str] = Field(default_factory=dict)  # agent_id -> "pending"|"running"|"done"|"error"|"skipped"

    errors: list[str] = Field(default_factory=list)
    phase: Literal["init", "parallel", "master", "chat", "done"] = "init"

    class Config:
        arbitrary_types_allowed = True
