"""
Auth endpoints: register (with email verification), login, forgot/reset password, account deletion.
"""
import hmac
import re
from typing import Optional
import time
import secrets
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from database.models import User, CreditTransaction
from auth.jwt import (
    create_access_token, create_refresh_token, verify_token,
    hash_password, verify_password,
)
from auth.dependencies import get_current_user, require_user

router = APIRouter()

# ── Registration bonus ────────────────────────────────────────────────────
REGISTER_BONUS_STARDUST = 50  # 注册验证通过奖励星尘

# ── Rate limiting ──────────────────────────────────────────────────────────
_rate_store: dict[str, list[float]] = defaultdict(list)
_RATE_WINDOW = 60  # seconds
_RATE_MAX = 20     # max requests per window (allows multi-step flows + testing)


def _get_client_ip(request: Request) -> str:
    """Get real client IP behind proxy (X-Forwarded-For)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(key: str, max_per_window: int = 0) -> bool:
    """Return True if request should be blocked. Uses _RATE_MAX if max_per_window not specified."""
    if max_per_window <= 0:
        max_per_window = _RATE_MAX
    now = time.time()
    window_start = now - _RATE_WINDOW
    _rate_store[key] = [t for t in _rate_store[key] if t > window_start]
    if len(_rate_store[key]) >= max_per_window:
        return True
    _rate_store[key].append(now)
    return False


# ── Account lockout ────────────────────────────────────────────────────────
# Tracks failed login attempts per email. After MAX_FAILED attempts,
# account is locked for LOCKOUT_DURATION seconds.
_lockout_store: dict[str, dict] = {}  # email -> {"count": int, "locked_until": float}
FAILED_LOGIN_MAX = 5          # max failed attempts before lockout
LOCKOUT_DURATION = 900        # 15 minutes lockout


def _check_lockout(email: str) -> None:
    """Raise 429 if account is locked due to too many failed attempts."""
    info = _lockout_store.get(email)
    if not info:
        return
    now = time.time()
    if info.get("locked_until") and now < info["locked_until"]:
        remaining = int(info["locked_until"] - now)
        raise HTTPException(
            status_code=429,
            detail=f"登录尝试次数过多，请 {remaining} 秒后再试",
        )
    # Lockout expired, reset
    if info.get("locked_until") and now >= info["locked_until"]:
        _lockout_store.pop(email, None)


def _record_failed_login(email: str) -> None:
    """Record a failed login attempt. Lock account if threshold exceeded."""
    now = time.time()
    if email not in _lockout_store:
        _lockout_store[email] = {"count": 0, "locked_until": None}
    info = _lockout_store[email]
    info["count"] += 1
    if info["count"] >= FAILED_LOGIN_MAX:
        info["locked_until"] = now + LOCKOUT_DURATION
        info["count"] = 0


def _clear_failed_login(email: str) -> None:
    """Clear failed login tracking on successful login."""
    _lockout_store.pop(email, None)


def _generate_code() -> str:
    """Generate a 6-digit verification code."""
    return f"{secrets.randbelow(1000000):06d}"


def _timing_safe_compare(a: str, b: str) -> bool:
    """Timing-safe string comparison to prevent brute-force via response time."""
    return hmac.compare_digest(a.encode(), b.encode())


def _ensure_aware(dt: Optional[datetime]) -> Optional[datetime]:
    """Ensure datetime is timezone-aware (UTC). SQLite returns naive datetimes."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


# ── Password strength validation ───────────────────────────────────────────

def _validate_password_strength(password: str) -> None:
    """Validate password meets minimum security requirements."""
    errors = []
    if len(password) < 8:
        errors.append("至少 8 个字符")
    if len(password) > 128:
        errors.append("不能超过 128 个字符")
    if not re.search(r"[a-z]", password):
        errors.append("至少包含一个小写字母")
    if not re.search(r"[A-Z]", password):
        errors.append("至少包含一个大写字母")
    if not re.search(r"[0-9]", password):
        errors.append("至少包含一个数字")
    if errors:
        raise HTTPException(
            status_code=400,
            detail="密码强度不足：" + "、".join(errors),
        )


# ── Schemas ────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    privacy_accepted: bool = False
    referral_code: Optional[str] = None

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        _validate_password_strength(v)
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshRequest(BaseModel):
    refresh_token: str


class SendCodeRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

    @field_validator("code")
    @classmethod
    def check_code(cls, v: str) -> str:
        if not re.fullmatch(r"\d{6}", v):
            raise ValueError("验证码必须为 6 位数字")
        return v


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

    @field_validator("code")
    @classmethod
    def check_code(cls, v: str) -> str:
        if not re.fullmatch(r"\d{6}", v):
            raise ValueError("验证码必须为 6 位数字")
        return v

    @field_validator("new_password")
    @classmethod
    def check_new_password(cls, v: str) -> str:
        _validate_password_strength(v)
        return v


class DeleteAccountRequest(BaseModel):
    password: str

def _user_dict(user: User) -> dict:
    # ── Admin 自动升级：匹配 ADMIN_EMAILS 的用户自动获得创始会员权限 ──
    from config import get_settings
    _settings = get_settings()
    admin_emails = [e.strip().lower() for e in _settings.ADMIN_EMAILS.split(",") if e.strip()]
    is_admin = user.email.lower() in admin_emails

    return {
        "id": str(user.id),
        "email": user.email,
        "display_name": user.display_name,
        "is_verified": user.is_verified,
        "is_premium": True if is_admin else user.is_premium,
        "premium_expires_at": None if is_admin else (user.premium_expires_at.isoformat() if user.premium_expires_at else None),
        "shop_coupon_balance": user.shop_coupon_balance,
        "subscription_tier": "founder_lifetime" if is_admin else user.subscription_tier,
        "free_event_quota": 999 if is_admin else user.free_event_quota,
        # Stardust
        "stardust_balance": user.stardust_balance,
        "stardust_lifetime_earned": user.stardust_lifetime_earned,
        # Founder
        "is_founder": True if is_admin else user.is_founder,
        "founder_seat_no": 0 if is_admin and not user.founder_seat_no else user.founder_seat_no,
        "founder_region": "domestic" if is_admin and not user.founder_region else user.founder_region,
        # Referral
        "referral_code": user.referral_code,
    }


# ── Register ───────────────────────────────────────────────────────────────

@router.post("/register")
async def register(req: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Register new user and send verification code."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")
    if not req.privacy_accepted:
        raise HTTPException(status_code=400, detail="请先阅读并同意隐私政策和服务条款")

    # Rate limit (use real IP behind proxy)
    client_ip = _get_client_ip(request)
    if _check_rate_limit(f"register:{client_ip}") or _check_rate_limit(f"register:{req.email}"):
        raise HTTPException(status_code=429, detail="注册请求过于频繁，请稍后再试")

    # Password strength check
    _validate_password_strength(req.password)

    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        # Generic message to prevent email enumeration
        return {"message": "如果该邮箱未注册，验证码已发送", "email": req.email}

    # Create user (unverified)
    code = _generate_code()
    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        display_name=req.display_name or req.email.split("@")[0],
        is_verified=False,
        verification_code=code,
        verification_expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
    )
    db.add(user)
    await db.flush()  # Get user.id before applying referral

    # ── Apply referral code if provided ──
    referred_by_user = None
    if req.referral_code:
        ref_result = await db.execute(
            select(User).where(User.referral_code == req.referral_code.upper())
        )
        referred_by_user = ref_result.scalar_one_or_none()
        if referred_by_user and referred_by_user.id != user.id:
            user.referred_by = referred_by_user.id

    await db.commit()

    # ── Grant referral rewards (after commit so user.id is stable) ──
    if referred_by_user and user.referred_by:
        try:
            from database.models import ReferralReward
            REFERRAL_REWARD = 20

            # Reward the new user
            user.stardust_balance += REFERRAL_REWARD
            user.stardust_lifetime_earned += REFERRAL_REWARD
            tx_new = CreditTransaction(
                user_id=user.id,
                amount=REFERRAL_REWARD,
                balance_after=user.stardust_balance,
                reason="referral",
                reference_id=str(referred_by_user.id),
                status="confirmed",
            )
            db.add(tx_new)

            # Reward the referrer
            ref_result2 = await db.execute(
                select(User).where(User.id == referred_by_user.id).with_for_update()
            )
            referrer = ref_result2.scalar_one_or_none()
            if referrer:
                referrer.stardust_balance += REFERRAL_REWARD
                referrer.stardust_lifetime_earned += REFERRAL_REWARD
                tx_ref = CreditTransaction(
                    user_id=referrer.id,
                    amount=REFERRAL_REWARD,
                    balance_after=referrer.stardust_balance,
                    reason="referral",
                    reference_id=str(user.id),
                    status="confirmed",
                )
                db.add(tx_ref)

                # Record referral reward
                reward = ReferralReward(
                    referrer_id=referrer.id,
                    referred_user_id=user.id,
                    reward_amount=REFERRAL_REWARD,
                )
                db.add(reward)

            await db.commit()
        except Exception:
            pass  # Referral reward failure doesn't block registration

    # Send verification email
    from utils.email import send_verification_email
    email_sent = send_verification_email(req.email, code)

    from config import get_settings as _gs
    _s = _gs()

    # Email failed to send: in DEBUG return code for testing, in production reject
    if not email_sent:
        if _s.DEBUG:
            # Dev convenience: return code in response for testing
            print(f"[AUTH] Email send failed, returning verification code in response for dev testing")
            return {
                "message": "注册成功，请查收邮箱验证码完成验证",
                "email": req.email,
                "_dev_code": code,  # DEBUG only — never expose in production
            }
        # Production: email service unavailable, reject registration
        # Clean up the unverified user we just created (re-attach after commit)
        user = await db.merge(user)
        await db.delete(user)
        await db.commit()
        raise HTTPException(
            status_code=503,
            detail="邮件服务暂不可用，请稍后再试",
        )

    return {"message": "注册成功，请查收邮箱验证码完成验证", "email": req.email}


# ── Send / Resend Verification Code ────────────────────────────────────────

@router.post("/send-code")
async def send_code(req: SendCodeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Send or resend verification code for registration."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    client_ip = _get_client_ip(request)
    if _check_rate_limit(f"code:{client_ip}") or _check_rate_limit(f"code:{req.email}"):
        raise HTTPException(status_code=429, detail="验证码发送过于频繁，请稍后再试")

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if not user or user.is_verified:
        return {"message": "如果该邮箱需要验证，验证码已发送"}

    from utils.email import send_verification_email
    code = _generate_code()

    # Try sending email first before storing code in DB
    email_sent = send_verification_email(req.email, code)

    if not email_sent:
        from config import get_settings as _gs3
        _s3 = _gs3()
        # Always store code in DB so verify-email can check it
        user.verification_code = code
        user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.commit()
        if _s3.DEBUG:
            print(f"[AUTH] Email send failed, verification code for {req.email}: {code}")
        # Email failed — return success to prevent email enumeration
        return {"message": "验证码已发送"}

    # Email sent (or SMTP configured) — now store code in DB
    user.verification_code = code
    user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    await db.commit()

    return {"message": "验证码已发送"}


# ── Verify Email ───────────────────────────────────────────────────────────

@router.post("/verify-email")
async def verify_email(req: VerifyCodeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Verify email with 6-digit code."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    # Rate limit verification attempts (stricter: 3 per minute per email/IP)
    client_ip = _get_client_ip(request)
    if _check_rate_limit(f"verify:{client_ip}", max_per_window=3) or _check_rate_limit(f"verify:{req.email}", max_per_window=3):
        raise HTTPException(status_code=429, detail="验证尝试过于频繁，请稍后再试")

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if user.is_verified:
        return {"message": "该邮箱已验证", "verified": True}

    # Check expiration first (before code comparison)
    if user.verification_expires_at and datetime.now(timezone.utc) > _ensure_aware(user.verification_expires_at):
        raise HTTPException(status_code=400, detail="验证码已过期，请重新发送")

    if not user.verification_code or not _timing_safe_compare(user.verification_code, req.code):
        raise HTTPException(status_code=400, detail="验证码错误")

    user.is_verified = True
    user.verification_code = None
    user.verification_expires_at = None

    # 注册验证通过奖励星尘
    user.stardust_balance += REGISTER_BONUS_STARDUST
    user.stardust_lifetime_earned += REGISTER_BONUS_STARDUST
    tx = CreditTransaction(
        user_id=user.id,
        amount=REGISTER_BONUS_STARDUST,
        balance_after=user.stardust_balance,
        reason="register_bonus",
        reference_id=None,
        status="confirmed",
    )
    db.add(tx)

    await db.commit()

    # Return tokens so user can log in immediately
    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_dict(user),
    )


# ── Login ──────────────────────────────────────────────────────────────────

@router.post("/login")
async def login(req: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    client_ip = _get_client_ip(request)
    if _check_rate_limit(f"login:{client_ip}") or _check_rate_limit(f"login:{req.email}"):
        raise HTTPException(status_code=429, detail="登录尝试过多，请稍后再试")

    # Check account lockout
    _check_lockout(req.email)

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password:
        _record_failed_login(req.email)
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    if not verify_password(req.password, user.hashed_password):
        _record_failed_login(req.email)
        raise HTTPException(status_code=401, detail="邮箱或密码错误")

    # Check email verification — block unverified users from logging in
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="请先验证邮箱后再登录，验证码已发送至您的邮箱")

    # Login successful — clear failed attempts
    _clear_failed_login(req.email)

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    resp = AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_dict(user),
    )
    return resp


# ── Get Me ─────────────────────────────────────────────────────────────────

@router.get("/me")
async def get_me(user: User = Depends(require_user)):
    return _user_dict(user)


# ── Refresh Token ──────────────────────────────────────────────────────────

@router.post("/refresh")
async def refresh_token(req: RefreshRequest, request: Request, db: AsyncSession = Depends(get_db)):
    user_id = verify_token(req.refresh_token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="无效的 refresh token")

    # Rate limit refresh attempts
    client_ip = _get_client_ip(request)
    if _check_rate_limit(f"refresh:{client_ip}", max_per_window=10):
        raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")

    # Verify user still exists and is active
    if db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="用户不存在")
        # Block unverified users from refreshing tokens
        if not user.is_verified:
            raise HTTPException(status_code=403, detail="请先验证邮箱后再使用")

    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


# ── Forgot Password (send verification code) ───────────────────────────────

@router.post("/forgot-password")
async def forgot_password(req: SendCodeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Send password reset verification code."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    client_ip = _get_client_ip(request)
    if _check_rate_limit(f"reset:{client_ip}") or _check_rate_limit(f"reset:{req.email}"):
        raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if not user:
        return {"message": "如果该邮箱已注册，验证码已发送"}

    from utils.email import send_password_reset_email
    code = _generate_code()

    # Try sending email first before storing code in DB
    email_sent = send_password_reset_email(req.email, code)

    if not email_sent:
        from config import get_settings as _gs2
        _s2 = _gs2()
        # Always store code in DB so reset-password can verify it
        user.verification_code = code
        user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.commit()
        if _s2.DEBUG:
            print(f"[AUTH] Email send failed, reset code for {req.email}: {code}")
            return {"message": "验证码已发送到您的邮箱", "_dev_code": code}
        raise HTTPException(status_code=503, detail="邮件服务暂不可用，请稍后再试")

    # Email sent (or SMTP configured) — now store code in DB
    user.verification_code = code
    user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    await db.commit()

    return {"message": "验证码已发送到您的邮箱"}


# ── Reset Password (with verification code) ────────────────────────────────

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Reset password with verification code."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    # Rate limit reset attempts
    client_ip = _get_client_ip(request)
    if _check_rate_limit(f"reset-verify:{client_ip}", max_per_window=3) or _check_rate_limit(f"reset-verify:{req.email}", max_per_window=3):
        raise HTTPException(status_code=429, detail="重置尝试过于频繁，请稍后再试")

    _validate_password_strength(req.new_password)

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    # Check expiration first (before code comparison)
    if user.verification_expires_at and datetime.now(timezone.utc) > _ensure_aware(user.verification_expires_at):
        raise HTTPException(status_code=400, detail="验证码已过期，请重新发送")

    if not user.verification_code or not _timing_safe_compare(user.verification_code, req.code):
        raise HTTPException(status_code=400, detail="验证码错误")

    user.hashed_password = hash_password(req.new_password)
    user.verification_code = None
    user.verification_expires_at = None
    await db.commit()

    return {"message": "密码重置成功，请用新密码登录"}


# ── Delete Account (GDPR compliance) ──────────────────────────────────────

@router.delete("/delete-account")
async def delete_account(
    req: DeleteAccountRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """Delete user account and all associated data (GDPR Right to Erasure)."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    # Verify password before deletion
    if not current_user.hashed_password or not verify_password(req.password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="密码错误，无法删除账户")

    # Delete user — cascade will remove all associated data
    # (readings, orders, birth_profiles, event_logs, favorites, reviews)
    await db.delete(current_user)
    await db.commit()

    return {"message": "账户及所有数据已删除"}
