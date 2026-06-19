"""
Auth endpoints: register (with email verification), login, forgot/reset password, account deletion.
"""
import hmac
import ipaddress
import logging
import re

logger = logging.getLogger(__name__)
from typing import Optional
import time
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from database.models import User, CreditTransaction
from auth.jwt import (
    create_access_token, create_refresh_token, verify_token,
    hash_password, verify_password, blacklist_token, ALGORITHM,
)
from auth.dependencies import get_current_user, require_user, ACCESS_TOKEN_COOKIE
from config import get_settings

router = APIRouter()
settings = get_settings()

# ── Admin email cache (parsed once at module load, avoids re-splitting on every request) ──
_ADMIN_EMAILS: frozenset[str] = frozenset(
    e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()
)

# ── Rate limiting (Redis-backed with in-memory fallback) ─────────────────────
from services.rate_limiter import check_rate_limit as _redis_check_rate_limit


def _set_auth_cookies(response: JSONResponse, access_token: str, refresh_token: str) -> None:
    """Set httpOnly access_token and refresh_token cookies on the response."""
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=30 * 24 * 3600,  # 30 days
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        path="/",
    )


def _clear_auth_cookies(response: JSONResponse) -> None:
    """Clear auth cookies on logout."""
    response.delete_cookie(ACCESS_TOKEN_COOKIE, path="/")
    response.delete_cookie("refresh_token", path="/")

# ── Registration bonus ────────────────────────────────────────────────────
REGISTER_BONUS_STARDUST = 150  # 注册验证通过奖励星尘（足够解锁精读+多次追问）

# ── Cookie settings ──────────────────────────────────────────────────────────
_COOKIE_SECURE = not settings.DEBUG  # HTTPS in production
# SameSite=Lax: cookies sent on same-origin requests but NOT on cross-site POST/PUT/DELETE.
# Since frontend uses Next.js proxy (/api/proxy) in production, all requests are same-origin.
_COOKIE_SAMESITE = "lax"  # CSRF protection: blocks cross-site state-changing requests


# ── Rate limiting wrapper (Redis-backed with in-memory fallback) ─────────────
_RATE_WINDOW = 60  # seconds


async def _check_rate_limit(key: str, max_per_window: int = 20) -> bool:
    """Check rate limit using Redis (or in-memory fallback). Returns True if blocked."""
    return await _redis_check_rate_limit(key, max_per_window, _RATE_WINDOW)


def _get_client_ip(request: Request) -> str:
    """Get client IP — only trust X-Real-IP from the local reverse proxy."""
    client_host = request.client.host if request.client else "unknown"
    # Only trust X-Real-IP if the connection comes from the local reverse proxy
    if client_host in ("127.0.0.1", "::1", "localhost"):
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            try:
                ipaddress.ip_address(real_ip.split(",")[0].strip())
                return real_ip.split(",")[0].strip()
            except ValueError:
                pass
    return client_host


# ── Account lockout ────────────────────────────────────────────────────────
# Tracks failed login attempts per email. After MAX_FAILED attempts,
# account is locked for LOCKOUT_DURATION seconds.
# Uses Redis when available, otherwise in-memory fallback.
FAILED_LOGIN_MAX = 5          # max failed attempts before lockout
LOCKOUT_DURATION = 900        # 15 minutes lockout
_LOCKOUT_MEMORY_MAX = 1000    # cap in-memory store to prevent unbounded growth
_lockout_memory_store: dict[str, dict] = {}  # in-memory fallback


def _evict_lockout_store() -> None:
    """Evict expired entries and cap total size to prevent memory exhaustion."""
    now = time.time()
    # Remove expired entries
    expired = [k for k, v in _lockout_memory_store.items()
               if v.get("locked_until") and now >= v["locked_until"]]
    for k in expired:
        del _lockout_memory_store[k]
    # Cap total entries — drop oldest by locked_until timestamp
    if len(_lockout_memory_store) > _LOCKOUT_MEMORY_MAX:
        sorted_keys = sorted(_lockout_memory_store, key=lambda k: _lockout_memory_store[k].get("locked_until", 0))
        for k in sorted_keys[:len(_lockout_memory_store) - _LOCKOUT_MEMORY_MAX]:
            del _lockout_memory_store[k]


async def _check_lockout(email: str) -> None:
    """Raise 429 if account is locked due to too many failed attempts."""
    from services.redis_client import _get_redis
    r = await _get_redis()

    if r:
        # Redis-backed lockout
        locked_until = await r.get(f"lockout:{email}")
        if locked_until:
            remaining = int(float(locked_until) - time.time())
            if remaining > 0:
                raise HTTPException(
                    status_code=429,
                    detail=f"登录尝试次数过多，请 {remaining} 秒后再试",
                )
            else:
                await r.delete(f"lockout:{email}", f"lockout_count:{email}")
    else:
        # In-memory fallback
        info = _lockout_memory_store.get(email)
        if info:
            now = time.time()
            if info.get("locked_until") and now < info["locked_until"]:
                remaining = int(info["locked_until"] - now)
                raise HTTPException(
                    status_code=429,
                    detail=f"登录尝试次数过多，请 {remaining} 秒后再试",
                )
            if info.get("locked_until") and now >= info["locked_until"]:
                _lockout_memory_store.pop(email, None)


async def _record_failed_login(email: str) -> None:
    """Record a failed login attempt. Lock account if threshold exceeded."""
    from services.redis_client import _get_redis
    r = await _get_redis()

    if r:
        # Redis-backed
        count_key = f"lockout_count:{email}"
        count = await r.incr(count_key)
        await r.expire(count_key, LOCKOUT_DURATION)
        if count >= FAILED_LOGIN_MAX:
            import time as _time
            await r.setex(f"lockout:{email}", LOCKOUT_DURATION, str(_time.time() + LOCKOUT_DURATION))
            await r.delete(count_key)
    else:
        # In-memory fallback
        _evict_lockout_store()  # periodic cleanup to prevent unbounded growth
        now = time.time()
        if email not in _lockout_memory_store:
            _lockout_memory_store[email] = {"count": 0, "locked_until": None}
        info = _lockout_memory_store[email]
        info["count"] += 1
        if info["count"] >= FAILED_LOGIN_MAX:
            info["locked_until"] = now + LOCKOUT_DURATION
            info["count"] = 0


async def _clear_failed_login(email: str) -> None:
    """Clear failed login tracking on successful login."""
    from services.redis_client import _get_redis
    r = await _get_redis()

    if r:
        await r.delete(f"lockout:{email}", f"lockout_count:{email}")
    else:
        _lockout_memory_store.pop(email, None)


def _generate_code() -> str:
    """Generate a 6-digit verification code."""
    return f"{secrets.randbelow(1000000):06d}"


def _hash_code(code: str) -> str:
    """Hash a verification code for secure storage."""
    import hashlib
    return hashlib.sha256(code.encode()).hexdigest()


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

class BirthDataSchema(BaseModel):
    """出生信息（注册时可选填写，自动保存为 BirthProfile）"""
    nickname: str = "本命"
    gender: str = "female"
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: int
    birth_minute: int = 0
    birth_city: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    privacy_accepted: bool = False
    birth_data: Optional[BirthDataSchema] = None

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
    refresh_token: str = ""


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
    is_admin = user.email.lower() in _ADMIN_EMAILS

    return {
        "id": str(user.id),
        "email": user.email,
        "display_name": user.display_name,
        "is_verified": user.is_verified,
        "is_premium": True if is_admin else user.is_premium,
        "premium_expires_at": None if is_admin else (user.premium_expires_at.isoformat() if user.premium_expires_at else None),
        "shop_coupon_balance": float(user.shop_coupon_balance) if user.shop_coupon_balance else 0,
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
    if await _check_rate_limit(f"register:{client_ip}") or await _check_rate_limit(f"register:{req.email}"):
        raise HTTPException(status_code=429, detail="注册请求过于频繁，请稍后再试")

    # Password strength check
    _validate_password_strength(req.password)

    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail="该邮箱已注册，请直接登录或使用忘记密码",
        )

    # Create user (unverified)
    code = _generate_code()
    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        display_name=req.display_name or req.email.split("@")[0],
        is_verified=False,
        verification_code=_hash_code(code),  # Store hash, not plaintext
        verification_expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
    )
    db.add(user)
    await db.flush()  # get user.id before creating birth profile

    # Auto-create BirthProfile if birth data provided
    if req.birth_data:
        from database.models import BirthProfile, Gender
        bd = req.birth_data
        gender_val = bd.gender if bd.gender in ("male", "female", "other") else "other"
        bp = BirthProfile(
            user_id=user.id,
            nickname=bd.nickname or "本命",
            gender=Gender(gender_val),
            birth_year=bd.birth_year,
            birth_month=bd.birth_month,
            birth_day=bd.birth_day,
            birth_hour=bd.birth_hour,
            birth_minute=bd.birth_minute,
            birth_city=bd.birth_city or "",
            latitude=bd.latitude,
            longitude=bd.longitude,
        )
        db.add(bp)

    try:
        await db.commit()
    except Exception as e:
        # Handle race condition: two concurrent registrations with same email
        if "UNIQUE" in str(e) or "unique" in str(e).lower():
            await db.rollback()
            raise HTTPException(
                status_code=409,
                detail="该邮箱已注册，请直接登录或使用忘记密码",
            )
        raise

    # Send verification email
    from utils.email import send_verification_email
    email_sent = send_verification_email(req.email, code)

    from config import get_settings as _gs
    _s = _gs()

    # Email failed to send: in DEBUG log code for testing, in production reject
    if not email_sent:
        if _s.DEBUG:
            # Dev convenience: log code instead of exposing in response
            logger.debug("Registration verification code for %s: %s", req.email, code)
            return {
                "message": "注册成功，请查收邮箱验证码完成验证",
                "email": req.email,
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

    resp = {"message": "注册成功，请查收邮箱验证码完成验证", "email": req.email}
    if _s.DEBUG:
        logger.debug("Registration verification code for %s: %s", req.email, code)
    return resp


# ── Send / Resend Verification Code ────────────────────────────────────────

@router.post("/send-code")
async def send_code(req: SendCodeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Send or resend verification code for registration."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    client_ip = _get_client_ip(request)
    if await _check_rate_limit(f"code:{client_ip}") or await _check_rate_limit(f"code:{req.email}"):
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
        user.verification_code = _hash_code(code)  # Store hash, not plaintext
        user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.commit()
        if _s3.DEBUG:
            logger.debug("Send-code verification code for %s: %s", req.email, code)
        # Email failed — return success to prevent email enumeration
        return {"message": "验证码已发送"}

    # Email sent (or SMTP configured) — now store code in DB
    user.verification_code = _hash_code(code)  # Store hash, not plaintext
    user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    await db.commit()

    return {"message": "验证码已发送"}


# ── Verify Email ───────────────────────────────────────────────────────────

@router.post("/verify-email")
async def verify_email(req: VerifyCodeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Verify email with 6-digit code."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    # Rate limit verification attempts (stricter: 10 per minute per email/IP)
    client_ip = _get_client_ip(request)
    if await _check_rate_limit(f"verify:{client_ip}", max_per_window=10) or await _check_rate_limit(f"verify:{req.email}", max_per_window=10):
        raise HTTPException(status_code=429, detail="验证尝试过于频繁，请稍后再试")

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if user.is_verified:
        # User already verified — return tokens so they can log in
        access = create_access_token(str(user.id))
        refresh = create_refresh_token(str(user.id))
        resp = JSONResponse(content=AuthResponse(
            access_token=access,
            refresh_token=refresh,
            user=_user_dict(user),
        ).model_dump())
        _set_auth_cookies(resp, access, refresh)
        return resp

    # Check expiration first (before code comparison)
    if user.verification_expires_at and datetime.now(timezone.utc) > _ensure_aware(user.verification_expires_at):
        raise HTTPException(status_code=400, detail="验证码已过期，请重新发送")

    # Compare hash of provided code with stored hash
    if not user.verification_code or not _timing_safe_compare(user.verification_code, _hash_code(req.code)):
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
    resp = JSONResponse(content=AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_dict(user),
    ).model_dump())
    _set_auth_cookies(resp, access, refresh)
    return resp


# ── Login ──────────────────────────────────────────────────────────────────

@router.post("/login")
async def login(req: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    client_ip = _get_client_ip(request)
    if await _check_rate_limit(f"login:{client_ip}") or await _check_rate_limit(f"login:{req.email}"):
        raise HTTPException(status_code=429, detail="登录尝试过多，请稍后再试")

    # Check account lockout
    await _check_lockout(req.email)

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password:
        # Run bcrypt even for non-existent users to equalize timing
        if not user:
            verify_password(req.password, "$2b$12$LJ3m4ys3Lk0TSwMCPNEPluIMSGVN2m9lCcK7k9OJB9wGt4uVxMzHu")
        await _record_failed_login(req.email)
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    if not verify_password(req.password, user.hashed_password):
        await _record_failed_login(req.email)
        raise HTTPException(status_code=401, detail="邮箱或密码错误")

    # Check email verification — block unverified users from logging in
    if not user.is_verified:
        # Actually send a verification email so the user can verify and log in
        from utils.email import send_verification_email
        code = _generate_code()
        user.verification_code = _hash_code(code)  # Store hash, not plaintext
        user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.commit()
        send_verification_email(req.email, code)
        raise HTTPException(status_code=403, detail="请先验证邮箱后再登录，验证码已发送至您的邮箱")

    # Login successful — clear failed attempts
    await _clear_failed_login(req.email)

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    resp = JSONResponse(content=AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_dict(user),
    ).model_dump())
    _set_auth_cookies(resp, access, refresh)
    return resp


# ── Get Me ─────────────────────────────────────────────────────────────────

@router.get("/me")
async def get_me(user: User = Depends(require_user)):
    return _user_dict(user)


# ── Logout ─────────────────────────────────────────────────────────────────

@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(require_user),
    authorization: Optional[str] = Header(None),
):
    """Logout — blacklist both access and refresh tokens, then clear cookies."""
    # Blacklist the access token (from Authorization header)
    if authorization:
        access_tok = authorization.replace("Bearer ", "").strip()
        if access_tok:
            try:
                payload = jwt.decode(access_tok, settings.JWT_SECRET_KEY,
                                    algorithms=[ALGORITHM], options={"verify_exp": False})
                if payload.get("jti"):
                    await blacklist_token(payload["jti"])
            except Exception:
                pass

    # Blacklist the refresh token (from cookie or header)
    token = request.cookies.get("refresh_token")
    if not token and authorization:
        token = authorization.replace("Bearer ", "").strip()
        # Only use as refresh token if it's actually a refresh token
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY,
                                algorithms=[ALGORITHM], options={"verify_exp": False})
            if payload.get("type") != "refresh":
                token = None
        except Exception:
            token = None

    if token:
        try:
            from jose import jwt as _jwt
            payload = _jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
            if payload.get("type") == "refresh":
                jti = payload.get("jti")
                if jti:
                    await blacklist_token(jti)
        except Exception:
            pass  # Token invalid/expired — proceed with logout anyway

    resp = JSONResponse(content={"message": "已登出"})
    _clear_auth_cookies(resp)
    return resp


# ── Refresh Token ──────────────────────────────────────────────────────────

@router.post("/refresh")
async def refresh_token(req: RefreshRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # Try cookie first, then request body
    refresh_tok = req.refresh_token or request.cookies.get("refresh_token", "")
    if not refresh_tok:
        raise HTTPException(status_code=401, detail="无效的 refresh token")

    # Rate limit FIRST (before expensive token verification)
    client_ip = _get_client_ip(request)
    if await _check_rate_limit(f"refresh:{client_ip}", max_per_window=10):
        raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")

    # Decode old token to get its jti BEFORE verifying (for blacklisting)
    old_jti = None
    try:
        from jose import jwt as _jwt
        old_payload = _jwt.decode(refresh_tok, settings.JWT_SECRET_KEY,
                                  algorithms=[ALGORITHM], options={"verify_exp": False})
        old_jti = old_payload.get("jti")
    except Exception:
        pass

    user_id = await verify_token(refresh_tok)
    if user_id is None:
        raise HTTPException(status_code=401, detail="无效的 refresh token")

    # Verify user still exists and is active
    if db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="用户不存在")
        # Block unverified users from refreshing tokens
        if not user.is_verified:
            raise HTTPException(status_code=403, detail="请先验证邮箱后再使用")

    # Blacklist old refresh token FIRST to prevent concurrent reuse
    if old_jti:
        await blacklist_token(old_jti)

    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)

    resp = JSONResponse(content={"access_token": access, "refresh_token": refresh, "token_type": "bearer"})
    _set_auth_cookies(resp, access, refresh)
    return resp


# ── Forgot Password (send verification code) ───────────────────────────────

@router.post("/forgot-password")
async def forgot_password(req: SendCodeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Send password reset verification code."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    client_ip = _get_client_ip(request)
    if await _check_rate_limit(f"reset:{client_ip}") or await _check_rate_limit(f"reset:{req.email}"):
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
        user.verification_code = _hash_code(code)  # Store hash, not plaintext
        user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.commit()
        if _s2.DEBUG:
            logger.debug("Password reset code for %s: %s", req.email, code)
        # Return success to prevent email enumeration (even when SMTP is down)
        return {"message": "验证码已发送到您的邮箱"}

    # Email sent (or SMTP configured) — now store code in DB
    user.verification_code = _hash_code(code)  # Store hash, not plaintext
    user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    await db.commit()

    from config import get_settings as _gs4
    _s4 = _gs4()
    resp = {"message": "验证码已发送到您的邮箱"}
    if _s4.DEBUG:
        logger.debug("Forgot-password code for %s: %s", req.email, code)
    return resp


# ── Reset Password (with verification code) ────────────────────────────────

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Reset password with verification code."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    # Rate limit reset attempts
    client_ip = _get_client_ip(request)
    if await _check_rate_limit(f"reset-verify:{client_ip}", max_per_window=3) or await _check_rate_limit(f"reset-verify:{req.email}", max_per_window=3):
        raise HTTPException(status_code=429, detail="重置尝试过于频繁，请稍后再试")

    _validate_password_strength(req.new_password)

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        # Don't leak user existence — use same error as wrong code
        raise HTTPException(status_code=400, detail="验证码错误")

    # Check expiration first (before code comparison)
    if user.verification_expires_at and datetime.now(timezone.utc) > _ensure_aware(user.verification_expires_at):
        raise HTTPException(status_code=400, detail="验证码已过期，请重新发送")

    # Compare hash of provided code with stored hash
    if not user.verification_code or not _timing_safe_compare(user.verification_code, _hash_code(req.code)):
        raise HTTPException(status_code=400, detail="验证码错误")

    user.hashed_password = hash_password(req.new_password)
    user.verification_code = None
    user.verification_expires_at = None
    await db.commit()

    # Invalidate all existing tokens for this user to prevent stolen token reuse
    try:
        from auth.jwt import blacklist_all_user_tokens
        await blacklist_all_user_tokens(str(user.id))
    except Exception:
        pass  # Best-effort: password is changed even if token blacklisting fails

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


# ── Google OAuth Login ──────────────────────────────────────────────────

class GoogleLoginRequest(BaseModel):
    credential: str  # Google ID token from frontend


# ── Google OAuth public key cache ─────────────────────────────────────────
_google_keys_cache: dict = {"keys": None, "expires_at": 0}
_GOOGLE_KEYS_CACHE_TTL = 86400  # 24 hours


async def _get_google_keys() -> dict:
    """Fetch Google's public keys with caching."""
    import time as _time
    now = _time.time()

    # Return cached keys if still valid
    if _google_keys_cache["keys"] and now < _google_keys_cache["expires_at"]:
        return _google_keys_cache["keys"]

    # Fetch fresh keys (async — avoid blocking the event loop)
    import httpx as _httpx
    google_keys_url = "https://www.googleapis.com/oauth2/v3/certs"
    async with _httpx.AsyncClient(timeout=10) as _client:
        keys_resp = await _client.get(google_keys_url)
        keys_resp.raise_for_status()
        google_keys = keys_resp.json()

    # Cache the keys
    _google_keys_cache["keys"] = google_keys
    _google_keys_cache["expires_at"] = now + _GOOGLE_KEYS_CACHE_TTL

    return google_keys


@router.post("/google")
async def google_login(req: GoogleLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """
    Login/register with Google OAuth.
    Frontend uses Google Identity Services to get an ID token,
    then sends it here for verification and account creation/login.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    client_ip = _get_client_ip(request)
    if await _check_rate_limit(f"google:{client_ip}", max_per_window=10):
        raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")

    # Verify Google ID token
    try:
        # Get Google's public keys (cached)
        google_keys = await _get_google_keys()

        # Decode the JWT header to get the key ID
        from jose import jwt as _jwt
        import base64 as _b64

        # Split the token
        parts = req.credential.split(".")
        if len(parts) != 3:
            raise HTTPException(status_code=400, detail="Invalid Google token")

        # Decode header to get kid
        header_data = _b64.urlsafe_b64decode(parts[0] + "==")
        header = __import__("json").loads(header_data)
        kid = header.get("kid")

        # Find the matching public key
        public_key = None
        for key in google_keys.get("keys", []):
            if key.get("kid") == kid:
                public_key = key
                break

        if not public_key:
            raise HTTPException(status_code=400, detail="Invalid Google token key")

        # Verify and decode the token
        from jose import jwk
        from jose.utils import long_to_bytes
        import cryptography.hazmat.primitives.asymmetric.rsa as rsa

        # Use python-jose to verify with the JWK
        payload = _jwt.decode(
            req.credential,
            public_key,
            algorithms=["RS256"],
            audience=settings.GOOGLE_CLIENT_ID,
        )

        google_email = payload.get("email")
        google_name = payload.get("name", "")
        google_picture = payload.get("picture", "")
        google_sub = payload.get("sub")  # Google user ID

        if not google_email:
            raise HTTPException(status_code=400, detail="Google token missing email")

    except HTTPException:
        raise
    except Exception as e:
        logger.warning("Google token verification failed: %s", e)
        raise HTTPException(status_code=400, detail="Google 登录验证失败")

    # Find or create user
    result = await db.execute(
        select(User).where(
            (User.email == google_email) |
            ((User.oauth_provider == "google") & (User.oauth_subject == google_sub))
        )
    )
    user = result.scalar_one_or_none()

    is_new_user = False
    if not user:
        # Create new user
        is_new_user = True
        user = User(
            email=google_email,
            display_name=google_name,
            avatar_url=google_picture,
            oauth_provider="google",
            oauth_subject=google_sub,
            is_verified=True,  # Google email is already verified
            stardust_balance=REGISTER_BONUS_STARDUST,
            stardust_lifetime_earned=REGISTER_BONUS_STARDUST,
        )
        db.add(user)
        await db.flush()  # Get the user ID

        # Grant registration bonus
        tx = CreditTransaction(
            user_id=user.id,
            amount=REGISTER_BONUS_STARDUST,
            balance_after=REGISTER_BONUS_STARDUST,
            reason="register_bonus",
            reference_id=None,
            status="confirmed",
        )
        db.add(tx)
        await db.commit()
        logger.info("Created new Google user: %s", google_email)
    else:
        # Update existing user's Google info if needed
        if not user.oauth_provider:
            user.oauth_provider = "google"
            user.oauth_subject = google_sub
        if google_picture and not user.avatar_url:
            user.avatar_url = google_picture
        if google_name and not user.display_name:
            user.display_name = google_name
        await db.commit()

    # Generate tokens
    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))

    resp = JSONResponse(content=AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_dict(user),
    ).model_dump())
    _set_auth_cookies(resp, access, refresh)
    return resp
