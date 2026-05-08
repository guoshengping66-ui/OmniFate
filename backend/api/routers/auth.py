"""
Auth endpoints: register (with email verification), login, forgot/reset password, account deletion.
"""
import hmac
from typing import Optional
import time
import secrets
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.database.models import User
from backend.auth.jwt import (
    create_access_token, create_refresh_token, verify_token,
    hash_password, verify_password,
)
from backend.auth.dependencies import get_current_user, require_user
from backend.config import get_settings

router = APIRouter()

# ── Rate limiting ──────────────────────────────────────────────────────────
_rate_store: dict[str, list[float]] = defaultdict(list)
_RATE_WINDOW = 60  # seconds
_RATE_MAX = 5      # max requests per window


def _get_client_ip(request: Request) -> str:
    """Get real client IP behind proxy (X-Forwarded-For)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(key: str, max_per_window: int = 5) -> bool:
    """Return True if request should be blocked."""
    now = time.time()
    window_start = now - _RATE_WINDOW
    _rate_store[key] = [t for t in _rate_store[key] if t > window_start]
    if len(_rate_store[key]) >= max_per_window:
        return True
    _rate_store[key].append(now)
    return False


def _generate_code() -> str:
    """Generate a 6-digit verification code."""
    return f"{secrets.randbelow(1000000):06d}"


def _timing_safe_compare(a: str, b: str) -> bool:
    """Timing-safe string comparison to prevent brute-force via response time."""
    return hmac.compare_digest(a.encode(), b.encode())


def _validate_password_strength(password: str) -> None:
    """Validate password meets minimum strength requirements."""
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="密码至少需要6个字符")
    if len(password) > 128:
        raise HTTPException(status_code=400, detail="密码不能超过128个字符")


# ── Schemas ────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    privacy_accepted: bool = False

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("密码至少需要6个字符")
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


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError("密码至少需要6个字符")
        return v


class DeleteAccountRequest(BaseModel):
    password: str


class OAuthRequest(BaseModel):
    id_token: str


def _user_dict(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "display_name": user.display_name,
        "is_premium": user.is_premium,
        "premium_expires_at": user.premium_expires_at.isoformat() if user.premium_expires_at else None,
        "shop_coupon_balance": user.shop_coupon_balance,
        "subscription_tier": user.subscription_tier,
        "free_event_quota": user.free_event_quota,
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
    await db.commit()

    # Send verification email
    from backend.utils.email import send_verification_email
    send_verification_email(req.email, code)

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

    code = _generate_code()
    user.verification_code = code
    user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    await db.commit()

    from backend.utils.email import send_verification_email
    send_verification_email(req.email, code)

    return {"message": "验证码已发送"}


# ── Verify Email ───────────────────────────────────────────────────────────

@router.post("/verify-email")
async def verify_email(req: VerifyCodeRequest, db: AsyncSession = Depends(get_db)):
    """Verify email with 6-digit code."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if user.is_verified:
        return {"message": "该邮箱已验证", "verified": True}

    if not user.verification_code or not _timing_safe_compare(user.verification_code, req.code):
        raise HTTPException(status_code=400, detail="验证码错误")

    if user.verification_expires_at and datetime.now(timezone.utc) > user.verification_expires_at:
        raise HTTPException(status_code=400, detail="验证码已过期，请重新发送")

    user.is_verified = True
    user.verification_code = None
    user.verification_expires_at = None
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

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")

    # Check email verification — block unverified users from logging in
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="请先验证邮箱后再登录，验证码已发送至您的邮箱")

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
async def refresh_token(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    user_id = verify_token(req.refresh_token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="无效的 refresh token")

    # Verify user still exists and is active
    if db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="用户不存在")

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

    code = _generate_code()
    user.verification_code = code
    user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    await db.commit()

    from backend.utils.email import send_password_reset_email
    send_password_reset_email(req.email, code)

    return {"message": "验证码已发送到您的邮箱"}


# ── Reset Password (with verification code) ────────────────────────────────

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password with verification code."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    _validate_password_strength(req.new_password)

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if not user.verification_code or not _timing_safe_compare(user.verification_code, req.code):
        raise HTTPException(status_code=400, detail="验证码错误")

    if user.verification_expires_at and datetime.now(timezone.utc) > user.verification_expires_at:
        raise HTTPException(status_code=400, detail="验证码已过期，请重新发送")

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


# ── OAuth: Google & Apple ──────────────────────────────────────────────────

async def _find_or_create_oauth_user(
    db: AsyncSession,
    provider: str,
    provider_subject: str,
    email: str,
    display_name: str | None = None,
    avatar_url: str | None = None,
) -> User:
    """Find existing OAuth user, link to email account, or create new user."""
    settings = get_settings()

    # 1. Check if OAuth user already exists
    stmt = select(User).where(
        User.oauth_provider == provider,
        User.oauth_subject == provider_subject,
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if user:
        return user

    # 2. Check if email already exists (link account)
    if email:
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if user:
            user.oauth_provider = provider
            user.oauth_subject = provider_subject
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
            if display_name and not user.display_name:
                user.display_name = display_name
            await db.commit()
            return user

    # 3. Create new user
    user = User(
        email=email or f"{provider}_{provider_subject}@oauth.placeholder",
        oauth_provider=provider,
        oauth_subject=provider_subject,
        display_name=display_name or (email.split("@")[0] if email else None),
        avatar_url=avatar_url,
        is_verified=True,  # OAuth users are pre-verified
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def _verify_google_token(id_token: str) -> dict:
    """Verify Google ID token and return payload."""
    import httpx

    settings = get_settings()
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Google 验证失败，请重试")

        data = resp.json()

    # Verify audience matches our client ID
    if settings.GOOGLE_CLIENT_ID and data.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Google token audience mismatch")

    # Check token hasn't expired
    import time
    if int(data.get("exp", 0)) < time.time():
        raise HTTPException(status_code=401, detail="Google token 已过期，请重试")

    return {
        "email": data.get("email", ""),
        "subject": data.get("sub", ""),
        "name": data.get("name"),
        "picture": data.get("picture"),
    }


async def _verify_apple_token(identity_token: str) -> dict:
    """Verify Apple identity token (JWT) and return payload."""
    import httpx
    from jose import jwt as jose_jwt

    settings = get_settings()

    # Fetch Apple's public keys
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get("https://appleid.apple.com/auth/keys")
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="无法连接 Apple 认证服务")
        apple_keys = resp.json().get("keys", [])

    # Try each key to decode the token
    last_error = None
    for key_data in apple_keys:
        try:
            from jose import jwk
            public_key = jwk.JWK(**key_data)
            payload = jose_jwt.decode(
                identity_token,
                public_key.export(),
                algorithms=["RS256"],
                audience=settings.APPLE_CLIENT_ID,
                options={"verify_exp": True},
            )
            return {
                "email": payload.get("email", ""),
                "subject": payload.get("sub", ""),
                "name": None,  # Apple only sends name on first auth
            }
        except Exception as e:
            last_error = e
            continue

    raise HTTPException(status_code=401, detail="Apple 验证失败，请重试")


@router.post("/oauth/google")
async def oauth_google(req: OAuthRequest, db: AsyncSession = Depends(get_db)):
    """Login/register with Google ID token."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用")

    try:
        profile = await _verify_google_token(req.id_token)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Google 验证失败，请重试")

    user = await _find_or_create_oauth_user(
        db,
        provider="google",
        provider_subject=profile["subject"],
        email=profile["email"],
        display_name=profile.get("name"),
        avatar_url=profile.get("picture"),
    )

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_dict(user),
    )


@router.post("/oauth/apple")
async def oauth_apple(req: OAuthRequest, db: AsyncSession = Depends(get_db)):
    """Login/register with Apple identity token."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用")

    try:
        profile = await _verify_apple_token(req.id_token)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Apple 验证失败，请重试")

    user = await _find_or_create_oauth_user(
        db,
        provider="apple",
        provider_subject=profile["subject"],
        email=profile["email"],
        display_name=profile.get("name"),
    )

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_dict(user),
    )
