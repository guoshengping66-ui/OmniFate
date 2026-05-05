"""POST /register  POST /login  GET /me  POST /refresh  POST /forgot-password  POST /reset-password"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
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


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None


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


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str | None
    is_premium: bool
    premium_expires_at: str | None
    shop_coupon_balance: float
    subscription_tier: str | None


@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="该邮箱已注册")

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        display_name=req.display_name or req.email.split("@")[0],
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user={
            "id": str(user.id),
            "email": user.email,
            "display_name": user.display_name,
            "is_premium": user.is_premium,
            "premium_expires_at": user.premium_expires_at.isoformat() if user.premium_expires_at else None,
            "shop_coupon_balance": user.shop_coupon_balance,
            "subscription_tier": user.subscription_tier,
            "free_event_quota": user.free_event_quota,
        },
    )


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return AuthResponse(
        access_token=access,
        refresh_token=refresh,
        user={
            "id": str(user.id),
            "email": user.email,
            "display_name": user.display_name,
            "is_premium": user.is_premium,
            "premium_expires_at": user.premium_expires_at.isoformat() if user.premium_expires_at else None,
            "shop_coupon_balance": user.shop_coupon_balance,
            "subscription_tier": user.subscription_tier,
            "free_event_quota": user.free_event_quota,
        },
    )


@router.get("/me")
async def get_me(user: User = Depends(require_user)):
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


@router.post("/refresh")
async def refresh_token(req: RefreshRequest):
    user_id = verify_token(req.refresh_token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="无效的 refresh token")
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


# ─── Password Reset ───────────────────────────────────────────────────────

# In-memory store for reset tokens (Mock mode — no real email sending)
_reset_tokens: dict[str, dict] = {}


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """发送密码重置邮件（Mock模式下生成token并返回）"""
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if not user:
        return {"message": "如果该邮箱已注册，重置链接已发送", "dev_token": None}

    # Generate reset token (valid for 30 minutes)
    from datetime import datetime, timedelta, timezone
    import secrets
    token = secrets.token_urlsafe(32)
    _reset_tokens[token] = {
        "user_id": str(user.id),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=30),
    }

    # In production, send email here. For dev, return the token.
    settings = get_settings()
    dev_token = token if settings.DEBUG else None

    return {"message": "如果该邮箱已注册，重置链接已发送", "dev_token": dev_token}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """用重置 token 设置新密码"""
    from datetime import datetime, timezone

    token_data = _reset_tokens.get(req.token)
    if not token_data:
        raise HTTPException(status_code=400, detail="无效或已过期的重置链接")

    if datetime.now(timezone.utc) > token_data["expires_at"]:
        del _reset_tokens[req.token]
        raise HTTPException(status_code=400, detail="重置链接已过期，请重新申请")

    user_id = token_data["user_id"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    user.hashed_password = hash_password(req.new_password)
    await db.commit()

    # Invalidate the token
    del _reset_tokens[req.token]

    return {"message": "密码重置成功，请用新密码登录"}
