"""
Contact form endpoint — sends user messages to support email.
"""
import time
from collections import defaultdict

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr

from utils.email import _send_email
from config import get_settings

router = APIRouter()
settings = get_settings()

# ── Rate limiting ──────────────────────────────────────────────────────────
_rate_store: dict[str, list[float]] = defaultdict(list)
_RATE_WINDOW = 3600  # 1 hour
_RATE_MAX = 5        # max 5 submissions per hour per IP


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str = ""
    message: str


@router.post("")
async def submit_contact(req: ContactRequest, request: Request):
    """Send contact form message to support email."""
    # Rate limit
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start = now - _RATE_WINDOW
    _rate_store[client_ip] = [t for t in _rate_store[client_ip] if t > window_start]
    if len(_rate_store[client_ip]) >= _RATE_MAX:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=429,
            content={"detail": "提交过于频繁，请稍后再试"},
        )
    _rate_store[client_ip].append(now)

    # Build email
    subject_map = {
        "general": "一般咨询",
        "technical": "技术支持",
        "billing": "账单问题",
        "feedback": "用户反馈",
        "other": "其他",
    }
    subject_label = subject_map.get(req.subject, req.subject or "未分类")

    html = f"""
    <div style="max-width:500px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:20px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#C9A84C;margin:0;">✦ 命盘智镜 — 用户留言</h2>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;">
        <p><strong>主题：</strong>{subject_label}</p>
        <p><strong>姓名：</strong>{req.name}</p>
        <p><strong>邮箱：</strong><a href="mailto:{req.email}">{req.email}</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
        <p style="white-space:pre-wrap;line-height:1.6;">{req.message}</p>
      </div>
      <div style="text-align:center;padding:12px;font-size:11px;color:#aaa;">
        此邮件由命盘智镜联系表单自动发送
      </div>
    </div>
    """

    to_email = settings.SMTP_FROM or "support@khanfate.com"
    ok = _send_email(to_email, f"[命盘智镜] 联系表单 - {subject_label} - {req.name}", html)

    if not ok:
        # Still return success to user — don't expose email failures
        print(f"[CONTACT] Email send failed, message from {req.email}: {req.message[:100]}")

    return {"success": True, "message": "留言已发送，我们会尽快回复您"}
