"""
PostgreSQL ORM Models via SQLAlchemy 2.x
Covers: users, readings (reports), products, orders
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    BigInteger, Boolean, DateTime, Enum, Float, ForeignKey,
    Index, Integer, JSON, Numeric, String, Text, UniqueConstraint, func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# ─── Enums ───────────────────────────────────────────────────────────────────

class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class ReadingStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class PaymentStatus(str, enum.Enum):
    unpaid = "unpaid"
    paid = "paid"
    refunded = "refunded"
    failed = "failed"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    pending_refund = "pending_refund"
    refunded = "refunded"


class ProductCategory(str, enum.Enum):
    crystal = "crystal"
    jewelry = "jewelry"
    incense = "incense"
    talisman = "talisman"
    book = "book"
    service = "service"
    other = "other"


# ─── User ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255))
    display_name: Mapped[Optional[str]] = mapped_column(String(100))
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    phone: Mapped[Optional[str]] = mapped_column(String(30))
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_code: Mapped[Optional[str]] = mapped_column(String(64))  # SHA-256 hash
    verification_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    premium_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    subscription_tier: Mapped[Optional[str]] = mapped_column(String(30), default=None)  # "free"|"premium_monthly"|"premium_yearly"
    shop_coupon_balance: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    free_event_quota: Mapped[int] = mapped_column(Integer, default=0)
    free_event_quota_reset_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    oauth_provider: Mapped[Optional[str]] = mapped_column(String(50))
    oauth_subject: Mapped[Optional[str]] = mapped_column(String(255))

    # Stardust credits
    stardust_balance: Mapped[int] = mapped_column(Integer, default=0)
    stardust_lifetime_earned: Mapped[int] = mapped_column(Integer, default=0)

    # Founder membership
    is_founder: Mapped[bool] = mapped_column(Boolean, default=False)
    founder_seat_no: Mapped[Optional[int]] = mapped_column(Integer)
    founder_region: Mapped[Optional[str]] = mapped_column(String(10))  # "domestic"|"overseas"
    founder_activated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Referral
    referral_code: Mapped[Optional[str]] = mapped_column(String(8), unique=True, index=True)
    referred_by: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    # Brute-force protection — persisted to DB so lockout survives server restart
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    birth_profiles: Mapped[list["BirthProfile"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    readings: Mapped[list["Reading"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    orders: Mapped[list["Order"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    addresses: Mapped[list["UserAddress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("oauth_provider", "oauth_subject", name="uq_oauth"),
        UniqueConstraint("founder_region", "founder_seat_no", name="uq_founder_seat"),
    )


# ─── BirthProfile ────────────────────────────────────────────────────────────

class BirthProfile(Base):
    """用户出生信息档案（可保存多个：本人/家人/朋友）"""
    __tablename__ = "birth_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    nickname: Mapped[str] = mapped_column(String(80), default="本命")
    gender: Mapped[Gender] = mapped_column(Enum(Gender), nullable=False)

    birth_year: Mapped[int] = mapped_column(Integer, nullable=False)
    birth_month: Mapped[int] = mapped_column(Integer, nullable=False)
    birth_day: Mapped[int] = mapped_column(Integer, nullable=False)
    birth_hour: Mapped[int] = mapped_column(Integer, nullable=False)
    birth_minute: Mapped[int] = mapped_column(Integer, default=0)

    birth_city: Mapped[Optional[str]] = mapped_column(String(100))
    birth_country: Mapped[Optional[str]] = mapped_column(String(100))
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    timezone_offset: Mapped[Optional[float]] = mapped_column(Float)

    face_image_url: Mapped[Optional[str]] = mapped_column(String(500))
    face_features_json: Mapped[Optional[dict]] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="birth_profiles")
    readings: Mapped[list["Reading"]] = relationship(back_populates="birth_profile")


# ─── Reading ─────────────────────────────────────────────────────────────────

class Reading(Base):
    """一次完整的全维度个人分析报告"""
    __tablename__ = "readings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    birth_profile_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("birth_profiles.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[ReadingStatus] = mapped_column(Enum(ReadingStatus), default=ReadingStatus.pending, index=True)

    # Raw calculation data
    bazi_raw: Mapped[Optional[dict]] = mapped_column(JSON)
    astrology_raw: Mapped[Optional[dict]] = mapped_column(JSON)
    tarot_raw: Mapped[Optional[dict]] = mapped_column(JSON)
    face_analysis_text: Mapped[Optional[str]] = mapped_column(Text)
    # NOTE: face_analysis_text is the face reading report. The column is named
    # inconsistently with other *_report columns for historical reasons.
    # Use this property for consistent access:

    @property
    def face_report(self) -> Optional[str]:
        """Alias for face_analysis_text — consistent with other *_report columns."""
        return self.face_analysis_text

    @face_report.setter
    def face_report(self, value: Optional[str]) -> None:
        self.face_analysis_text = value

    # Agent outputs
    bazi_report: Mapped[Optional[str]] = mapped_column(Text)
    astrology_report: Mapped[Optional[str]] = mapped_column(Text)
    tarot_report: Mapped[Optional[str]] = mapped_column(Text)
    qimen_report: Mapped[Optional[str]] = mapped_column(Text)
    ziwei_report: Mapped[Optional[str]] = mapped_column(Text)
    palm_report: Mapped[Optional[str]] = mapped_column(Text)

    # Worker metadata (tags + errors) — persisted as JSON keyed by agent_id
    worker_tags: Mapped[Optional[dict]] = mapped_column(JSON)    # {"bazi": ["tag1","tag2"], "face": [...], ...}
    worker_errors: Mapped[Optional[dict]] = mapped_column(JSON)  # {"qimen": "timeout", "ziwei": "timeout", ...}

    # Partner analysis outputs (RELATIONSHIP intent)
    partner_face_report: Mapped[Optional[str]] = mapped_column(Text)
    partner_palm_report: Mapped[Optional[str]] = mapped_column(Text)

    # MasterAgent synthesis
    master_summary: Mapped[Optional[str]] = mapped_column(Text)       # 免费摘要
    master_detail: Mapped[Optional[str]] = mapped_column(Text)        # 付费年度规划
    recommended_product_ids: Mapped[Optional[list]] = mapped_column(JSON)
    computed_tags: Mapped[Optional[list]] = mapped_column(JSON)
    dimension_scores: Mapped[Optional[dict]] = mapped_column(JSON)

    # WARNING: Two similar column names — double-check which one you need!
    # is_detail_unlocked:   Full report unlock (100 Stardust) — unlocks master_detail + all worker reports
    # is_detailed_unlocked: Detailed reading unlock (30 Stardust) — unlocks master_detail text only
    is_detail_unlocked: Mapped[bool] = mapped_column(Boolean, default=False)
    is_detailed_unlocked: Mapped[bool] = mapped_column(Boolean, default=False)
    language: Mapped[Optional[str]] = mapped_column(String(5), default="zh")  # "zh" or "en"
    payment_status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.unpaid)
    stripe_payment_intent: Mapped[Optional[str]] = mapped_column(String(200))
    error_message: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="readings")
    birth_profile: Mapped[Optional["BirthProfile"]] = relationship(back_populates="readings")
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="reading")

    __table_args__ = (
        Index("ix_readings_user_created", "user_id", "created_at"),
    )


# ─── Product ─────────────────────────────────────────────────────────────────

class Product(Base):
    """推荐商品/服务目录"""
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    short_pitch: Mapped[Optional[str]] = mapped_column(Text)

    category: Mapped[ProductCategory] = mapped_column(Enum(ProductCategory), nullable=False)
    price_cny: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    price_usd: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    detail_images: Mapped[Optional[list]] = mapped_column(JSON)

    # 匹配标签
    wuxing_tags: Mapped[Optional[list]] = mapped_column(JSON)   # ["fire", "earth"]
    astro_tags: Mapped[Optional[list]] = mapped_column(JSON)    # ["saturn", "mercury"]
    keyword_tags: Mapped[Optional[list]] = mapped_column(JSON)  # ["缺火", "财库空亡"]

    sales_count: Mapped[int] = mapped_column(BigInteger, default=0)
    rating: Mapped[Optional[float]] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")


# ─── Order ───────────────────────────────────────────────────────────────────

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    order_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.pending, index=True)

    total_cny: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    total_usd: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))

    payment_method: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    payment_ref: Mapped[Optional[str]] = mapped_column(String(200), index=True)  # Indexed for webhook lookups
    item_type: Mapped[Optional[str]] = mapped_column(String(50), index=True)  # premium_monthly|premium_yearly|unlock_report|founder_lifetime|shop

    recipient_name: Mapped[Optional[str]] = mapped_column(String(100))
    recipient_phone: Mapped[Optional[str]] = mapped_column(String(30))
    shipping_address: Mapped[Optional[dict]] = mapped_column(JSON)
    tracking_number: Mapped[Optional[str]] = mapped_column(String(100))
    shipping_carrier: Mapped[Optional[str]] = mapped_column(String(50))
    notes: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    shipped_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Refund fields
    refund_reason: Mapped[Optional[str]] = mapped_column(Text)           # 用户退款原因
    refund_amount: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))  # 退款金额（支持部分退款）
    refund_note: Mapped[Optional[str]] = mapped_column(Text)             # 管理员备注
    refund_requested_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    refund_processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # CJ Dropshipping fields
    cj_order_number: Mapped[Optional[str]] = mapped_column(String(100))      # CJ 订单号
    cj_order_status: Mapped[Optional[str]] = mapped_column(String(50))       # CJ 订单状态
    cj_shipping_cost: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))  # CJ 运费
    cj_response: Mapped[Optional[dict]] = mapped_column(JSON)                # CJ 原始响应
    fulfilled_via: Mapped[Optional[str]] = mapped_column(String(20))         # "cj" / "manual"

    # QR payment email confirmation fields
    confirm_token: Mapped[Optional[str]] = mapped_column(String(64))         # 邮件确认 token
    confirm_expires: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))  # token 过期时间

    # Admin payment confirmation fields
    admin_confirm_token: Mapped[Optional[str]] = mapped_column(String(64))   # 管理员确认 token
    admin_confirm_expires: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))  # 管理员 token 过期时间

    user: Mapped[Optional["User"]] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_orders_user_created", "user_id", "created_at"),
    )


# ─── OrderItem ───────────────────────────────────────────────────────────────

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True
    )
    reading_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("readings.id", ondelete="SET NULL"), nullable=True, index=True
    )

    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price_cny: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal_cny: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    recommendation_reason: Mapped[Optional[str]] = mapped_column(Text)

    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped[Optional["Product"]] = relationship(back_populates="order_items")
    reading: Mapped[Optional["Reading"]] = relationship(back_populates="order_items")


# ─── EventLog ──────────────────────────────────────────────────────────────────

class EventLog(Base):
    """用户事件复盘记录"""
    __tablename__ = "event_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    event_description: Mapped[str] = mapped_column(Text, nullable=False)
    event_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    emotion_score: Mapped[Optional[int]] = mapped_column(Integer)  # 1-10

    # 事件时刻的流时计算数据
    transit_bazi: Mapped[Optional[dict]] = mapped_column(JSON)
    transit_astrology: Mapped[Optional[dict]] = mapped_column(JSON)

    # AI 分析结果
    causal_analysis: Mapped[Optional[str]] = mapped_column(Text)
    current_advice: Mapped[Optional[str]] = mapped_column(Text)
    future_prevention: Mapped[Optional[str]] = mapped_column(Text)
    remedy_keywords: Mapped[Optional[list]] = mapped_column(JSON)
    recommended_product_ids: Mapped[Optional[list]] = mapped_column(JSON)

    is_paid: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[Optional["User"]] = relationship()


# ─── UserFavorite ────────────────────────────────────────────────────────────

class UserFavorite(Base):
    """用户收藏的商品"""
    __tablename__ = "user_favorites"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[str] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_user_favorite_product"),)


# ─── UserAddress ─────────────────────────────────────────────────────────────

class UserAddress(Base):
    """用户收货地址"""
    __tablename__ = "user_addresses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    recipient_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    country: Mapped[str] = mapped_column(String(50), nullable=False, default="CN")
    province: Mapped[Optional[str]] = mapped_column(String(100))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    district: Mapped[Optional[str]] = mapped_column(String(100))
    address_line1: Mapped[str] = mapped_column(String(300), nullable=False)
    address_line2: Mapped[Optional[str]] = mapped_column(String(300))
    postal_code: Mapped[Optional[str]] = mapped_column(String(20))
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="addresses")


# ─── ProductReview ───────────────────────────────────────────────────────────

class ProductReview(Base):
    """商品评价"""
    __tablename__ = "product_reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    user_name: Mapped[str] = mapped_column(String(100), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tags: Mapped[Optional[list]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── CreditTransaction ────────────────────────────────────────────────────────

class CreditTransaction(Base):
    """星尘流水记录 — 支持预扣/确认/回滚原子操作"""
    __tablename__ = "credit_transactions"
    __table_args__ = (
        UniqueConstraint('reason', 'reference_id', name='uq_credit_reason_ref'),
        Index("ix_credit_user_reason", "user_id", "reason"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # 正=获得, 负=消耗
    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(50), nullable=False)
    # reason 枚举: report_unlock, event_retro, follow_up, energy_radar, divination,
    #              monthly_grant, register_bonus, referral, refund, founder_grant
    reference_id: Mapped[Optional[str]] = mapped_column(String(36))  # 关联 reading/event ID
    status: Mapped[str] = mapped_column(String(20), default="confirmed", index=True)  # pending|confirmed|refunded
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


# ─── FounderVote ──────────────────────────────────────────────────────────────

class FounderVote(Base):
    """创始席位产品路线图投票"""
    __tablename__ = "founder_votes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    feature_id: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("user_id", "feature_id", name="uq_founder_vote"),)


# ─── FounderFeedback ──────────────────────────────────────────────────────────

class FounderFeedback(Base):
    """创始席位用户反馈"""
    __tablename__ = "founder_feedback"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


# ─── ReferralReward ───────────────────────────────────────────────────────────

class ReferralReward(Base):
    """星盟邀请奖励记录"""
    __tablename__ = "referral_rewards"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    referrer_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    referred_user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reward_amount: Mapped[int] = mapped_column(Integer, default=20)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── DivinationRecord ─────────────────────────────────────────────────────────

class DivinationRecord(Base):
    """每日分析记录"""
    __tablename__ = "divination_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    fortune: Mapped[str] = mapped_column(String(20), nullable=False)  # 大吉|中吉|小吉|吉|末吉|凶|大凶
    wisdom_quote: Mapped[str] = mapped_column(Text, nullable=False)   # 王阳明心学金句
    theme: Mapped[Optional[str]] = mapped_column(String(50))         # 事业|感情|财运|健康
    is_free: Mapped[bool] = mapped_column(Boolean, default=True)
    stardust_cost: Mapped[int] = mapped_column(Integer, default=0)
    ai_insight: Mapped[Optional[str]] = mapped_column(Text)            # AI 深度解析（50字行动指引）
    shared: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


# ─── RedeemCode ──────────────────────────────────────────────────────────────

class RedeemCode(Base):
    """卡密/兑换码系统 — 用于国内用户购买星尘"""
    __tablename__ = "redeem_codes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    stardust_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(200))
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    used_by_user_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_by: Mapped[Optional[str]] = mapped_column(String(36))


# ─── CryptoOrder ─────────────────────────────────────────────────────────────

class CryptoOrder(Base):
    """USDT 链上充值记录 — 用于海外用户购买星尘"""
    __tablename__ = "crypto_orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tx_id: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount_usdt: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    network: Mapped[str] = mapped_column(String(20), nullable=False)  # "TRC20" | "ARBITRUM"
    stardust_granted: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending|success|failed
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── FortuneSubscription ────────────────────────────────────────────────────

class FortuneSubscription(Base):
    """用户每周分析订阅偏好"""
    __tablename__ = "fortune_subscriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, unique=True
    )
    frequency: Mapped[str] = mapped_column(String(10), default="weekly")  # "weekly" | "daily" | "off"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship()


# ─── WeeklyFortune ──────────────────────────────────────────────────────────

class WeeklyFortune(Base):
    """每周分析生成记录"""
    __tablename__ = "weekly_fortunes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    week_start: Mapped[str] = mapped_column(String(10), nullable=False)  # "2026-05-19"
    week_end: Mapped[str] = mapped_column(String(10), nullable=False)    # "2026-05-25"
    score: Mapped[int] = mapped_column(Integer, nullable=False)          # 1-10
    theme: Mapped[str] = mapped_column(String(200), nullable=False)
    lucky_color: Mapped[str] = mapped_column(String(50), nullable=False)
    lucky_number: Mapped[str] = mapped_column(String(20), nullable=False)
    lucky_direction: Mapped[str] = mapped_column(String(50), nullable=False)
    tarot_card: Mapped[str] = mapped_column(String(100), nullable=False)
    tarot_desc: Mapped[str] = mapped_column(String(500), nullable=False)
    ai_insight: Mapped[str] = mapped_column(Text, nullable=False)
    daily_yi_ji: Mapped[dict] = mapped_column(JSON, nullable=False)  # [{day, yi, ji}, ...]
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship()

    __table_args__ = (UniqueConstraint("user_id", "week_start", name="uq_user_week"),)


# ─── DailyFortune ─────────────────────────────────────────────────────────

class DailyFortune(Base):
    """每日分析生成记录"""
    __tablename__ = "daily_fortunes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    fortune_date: Mapped[str] = mapped_column(String(10), nullable=False)  # "2026-05-23"
    score: Mapped[int] = mapped_column(Integer, nullable=False)          # 1-10
    theme: Mapped[str] = mapped_column(String(200), nullable=False)
    lucky_color: Mapped[str] = mapped_column(String(50), nullable=False)
    lucky_number: Mapped[str] = mapped_column(String(20), nullable=False)
    lucky_direction: Mapped[str] = mapped_column(String(50), nullable=False)
    tarot_card: Mapped[str] = mapped_column(String(100), nullable=False)
    tarot_desc: Mapped[str] = mapped_column(String(500), nullable=False)
    ai_insight: Mapped[str] = mapped_column(Text, nullable=False)
    yi: Mapped[list] = mapped_column(JSON, nullable=False)               # ["出行", "签约", ...]
    ji: Mapped[list] = mapped_column(JSON, nullable=False)               # ["动土", "远行", ...]
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship()

    __table_args__ = (UniqueConstraint("user_id", "fortune_date", name="uq_user_day"),)


# ─── NewsletterSubscriber ────────────────────────────────────────────────

class NewsletterSubscriber(Base):
    """Newsletter 订阅者"""
    __tablename__ = "newsletter_subscribers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
