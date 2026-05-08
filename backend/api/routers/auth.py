"""
Auth endpoints: register (with email verification), login, forgot/reset password.
"""
from typing import Optional
import time
import secrets
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from database.models import User
from auth.jwt import (
    create_access_token, create_refresh_token, verify_token,
    hash_password, verify_password,
)
from auth.dependencies import get_current_user, require_user
from config import get_settings

router = APIRouter()

# ── Rate limiting ──────────────────────────────────────────────────────────
_rate_store: dict[str, list[float]] = defaultdict(list)
_RATE_WINDOW = 60  # seconds
_RATE_MAX = 5      # max requests per window


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


# ── Schemas ────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    privacy_accepted: bool = False


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

    # Rate limit
    client_ip = request.client.host if request.client else "unknown"
    if _check_rate_limit(f"register:{client_ip}") or _check_rate_limit(f"register:{req.email}"):
        raise HTTPException(status_code=429, detail="注册请求过于频繁，请稍后再试")

    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="该邮箱已注册")

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

    client_ip = request.client.host if request.client else "unknown"
    if _check_rate_limit(f"code:{client_ip}") or _check_rate_limit(f"code:{req.email}"):
        raise HTTPException(status_code=429, detail="验证码发送过于频繁，请稍后再试")

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if user.is_verified:
        return {"message": "该邮箱已验证"}

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

    if not user.verification_code or user.verification_code != req.code:
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

    client_ip = request.client.host if request.client else "unknown"
    if _check_rate_limit(f"login:{client_ip}") or _check_rate_limit(f"login:{req.email}"):
        raise HTTPException(status_code=429, detail="登录尝试过多，请稍后再试")

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")

    # Warn if not verified (but still allow login)
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
async def refresh_token(req: RefreshRequest):
    user_id = verify_token(req.refresh_token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="无效的 refresh token")
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


# ── Forgot Password (send verification code) ───────────────────────────────

@router.post("/forgot-password")
async def forgot_password(req: SendCodeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Send password reset verification code."""
    if db is None:
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")

    client_ip = request.client.host if request.client else "unknown"
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

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if not user.verification_code or user.verification_code != req.code:
        raise HTTPException(status_code=400, detail="验证码错误")

    if user.verification_expires_at and datetime.now(timezone.utc) > user.verification_expires_at:
        raise HTTPException(status_code=400, detail="验证码已过期，请重新发送")

    user.hashed_password = hash_password(req.new_password)
    user.verification_code = None
    user.verification_expires_at = None
    await db.commit()

    return {"message": "密码重置成功，请用新密码登录"}
