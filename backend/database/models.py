"""
PostgreSQL ORM Models via SQLAlchemy 2.x
Covers: users, readings (reports), products, orders
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger, Boolean, DateTime, Enum, Float, ForeignKey,
    Integer, JSON, String, Text, UniqueConstraint, func,
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
    verification_code: Mapped[Optional[str]] = mapped_column(String(10))
    verification_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    premium_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    subscription_tier: Mapped[Optional[str]] = mapped_column(String(30), default=None)  # "free"|"premium_monthly"|"premium_yearly"
    shop_coupon_balance: Mapped[float] = mapped_column(Float, default=0.0)
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

    __table_args__ = (UniqueConstraint("oauth_provider", "oauth_subject", name="uq_oauth"),)


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
    """一次完整的全维度命理分析报告"""
    __tablename__ = "readings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    birth_profile_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("birth_profiles.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[ReadingStatus] = mapped_column(Enum(ReadingStatus), default=ReadingStatus.pending)

    # Raw calculation data
    bazi_raw: Mapped[Optional[dict]] = mapped_column(JSON)
    astrology_raw: Mapped[Optional[dict]] = mapped_column(JSON)
    tarot_raw: Mapped[Optional[dict]] = mapped_column(JSON)
    face_analysis_text: Mapped[Optional[str]] = mapped_column(Text)

    # Agent outputs
    bazi_report: Mapped[Optional[str]] = mapped_column(Text)
    astrology_report: Mapped[Optional[str]] = mapped_column(Text)
    tarot_report: Mapped[Optional[str]] = mapped_column(Text)

    # MasterAgent synthesis
    master_summary: Mapped[Optional[str]] = mapped_column(Text)       # 免费摘要
    master_detail: Mapped[Optional[str]] = mapped_column(Text)        # 付费年度规划
    recommended_product_ids: Mapped[Optional[list]] = mapped_column(JSON)
    computed_tags: Mapped[Optional[list]] = mapped_column(JSON)

    is_detail_unlocked: Mapped[bool] = mapped_column(Boolean, default=False)
    payment_status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.unpaid)
    stripe_payment_intent: Mapped[Optional[str]] = mapped_column(String(200))
    error_message: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="readings")
    birth_profile: Mapped[Optional["BirthProfile"]] = relationship(back_populates="readings")
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="reading")


# ─── Product ─────────────────────────────────────────────────────────────────

class Product(Base):
    """改运商品/服务目录"""
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    short_pitch: Mapped[Optional[str]] = mapped_column(Text)

    category: Mapped[ProductCategory] = mapped_column(Enum(ProductCategory), nullable=False)
    price_cny: Mapped[float] = mapped_column(Float, nullable=False)
    price_usd: Mapped[Optional[float]] = mapped_column(Float)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    detail_images: Mapped[Optional[list]] = mapped_column(JSON)

    # 命理匹配标签
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
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    order_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.pending)

    total_cny: Mapped[float] = mapped_column(Float, nullable=False)
    total_usd: Mapped[Optional[float]] = mapped_column(Float)

    payment_method: Mapped[Optional[str]] = mapped_column(String(50))
    payment_ref: Mapped[Optional[str]] = mapped_column(String(200))

    recipient_name: Mapped[Optional[str]] = mapped_column(String(100))
    recipient_phone: Mapped[Optional[str]] = mapped_column(String(30))
    shipping_address: Mapped[Optional[dict]] = mapped_column(JSON)
    tracking_number: Mapped[Optional[str]] = mapped_column(String(100))
    shipping_carrier: Mapped[Optional[str]] = mapped_column(String(50))
    notes: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    shipped_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user: Mapped[Optional["User"]] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")


# ─── OrderItem ───────────────────────────────────────────────────────────────

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"), nullable=True
    )
    reading_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("readings.id", ondelete="SET NULL"), nullable=True
    )

    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price_cny: Mapped[float] = mapped_column(Float, nullable=False)
    subtotal_cny: Mapped[float] = mapped_column(Float, nullable=False)
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
    country: Mapped[str] = mapped_column(String(50), nullable=False, default="中国")
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
    status: Mapped[str] = mapped_column(String(20), default="confirmed")  # pending|confirmed|refunded
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


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
    """星际抽签记录"""
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
    shared: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
