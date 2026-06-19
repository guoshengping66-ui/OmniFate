"""
Contact form & newsletter endpoints — sends user messages to support email.
"""
import html
import logging
import time
from collections import defaultdict

logger = logging.getLogger(__name__)

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr

from utils.email import _send_email
from config import get_settings

router = APIRouter()
settings = get_settings()

# ── Rate limiting (separate buckets for contact vs newsletter) ─────────────
_rate_store_contact: dict[str, list[float]] = defaultdict(list)
_rate_store_newsletter: dict[str, list[float]] = defaultdict(list)
_RATE_WINDOW = 3600  # 1 hour
_RATE_MAX = 5        # max 5 submissions per hour per IP
_RATE_EVICT_MAX = 10000  # max tracked IPs before forced eviction


def _check_and_add_rate(store: dict[str, list[float]], client_ip: str) -> bool:
    """Check rate limit and add timestamp. Returns True if exceeded."""
    now = time.time()
    # Evict if store is too large
    if len(store) > _RATE_EVICT_MAX:
        stale = [k for k, v in store.items() if not v or v[-1] <= now - _RATE_WINDOW]
        for k in stale:
            del store[k]
    store[client_ip] = [t for t in store[client_ip] if t > now - _RATE_WINDOW]
    if len(store[client_ip]) >= _RATE_MAX:
        return True
    store[client_ip].append(now)
    return False

# ── Newsletter subscribers (in-memory, replace with DB in production) ──────
_newsletter_subscribers: set[str] = set()


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str = ""
    message: str


class NewsletterRequest(BaseModel):
    email: EmailStr


@router.post("")
async def submit_contact(req: ContactRequest, request: Request):
    """Send contact form message to support email."""
    # Rate limit (contact-specific bucket)
    client_ip = request.client.host if request.client else "unknown"
    if _check_and_add_rate(_rate_store_contact, client_ip):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=429,
            content={"detail": "提交过于频繁，请稍后再试"},
        )

    # Build email
    subject_map = {
        "general": "一般咨询",
        "technical": "技术支持",
        "billing": "账单问题",
        "feedback": "用户反馈",
        "other": "其他",
    }
    subject_label = subject_map.get(req.subject, req.subject or "未分类")

    # HTML-escape all user input to prevent email XSS
    safe_name = html.escape(req.name)
    safe_email = html.escape(req.email)
    safe_message = html.escape(req.message)

    email_html = f"""
    <div style="max-width:500px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:20px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#C9A84C;margin:0;">✦ Profile Mirror — 用户留言</h2>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;">
        <p><strong>主题：</strong>{subject_label}</p>
        <p><strong>姓名：</strong>{safe_name}</p>
        <p><strong>邮箱：</strong><a href="mailto:{safe_email}">{safe_email}</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
        <p style="white-space:pre-wrap;line-height:1.6;">{safe_message}</p>
      </div>
      <div style="text-align:center;padding:12px;font-size:11px;color:#aaa;">
        此邮件由Profile Mirror联系表单自动发送
      </div>
    </div>
    """

    to_email = settings.SMTP_FROM or "guoshengping66@gmail.com"
    # Sanitize name to prevent email header injection
    safe_name = req.name.replace('\r', '').replace('\n', '').strip()[:50]
    ok = _send_email(to_email, f"[Profile Mirror] 联系表单 - {subject_label} - {safe_name}", email_html)

    if not ok:
        # Still return success to user — don't expose email failures
        logger.warning("Contact email send failed, message from %s: %s", req.email, req.message[:100])

    return {"success": True, "message": "留言已发送，我们会尽快回复您"}


@router.post("/newsletter")
async def subscribe_newsletter(req: NewsletterRequest, request: Request):
    """Subscribe to weekly fortune newsletter."""
    # Rate limit (newsletter-specific bucket)
    client_ip = request.client.host if request.client else "unknown"
    if _check_and_add_rate(_rate_store_newsletter, client_ip):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=429,
            content={"detail": "提交过于频繁，请稍后再试"},
        )

    email = req.email.lower().strip()

    # Check if already subscribed
    if email in _newsletter_subscribers:
        return {"success": True, "message": "您已订阅成功", "already_subscribed": True}

    # Add to subscribers
    _newsletter_subscribers.add(email)
    logger.info("Newsletter new subscriber: %s (total: %d)", email, len(_newsletter_subscribers))

    # Send notification to admin
    email_html = f"""
    <div style="max-width:400px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:20px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#C9A84C;margin:0;">✦ Profile Mirror — 新订阅</h2>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;">
        <p>新用户订阅了每周运势推送：</p>
        <p><strong>邮箱：</strong><a href="mailto:{email}">{email}</a></p>
        <p><strong>订阅时间：</strong>{time.strftime('%Y-%m-%d %H:%M:%S')}</p>
      </div>
    </div>
    """

    to_email = settings.SMTP_FROM or "guoshengping66@gmail.com"
    _send_email(to_email, f"[Profile Mirror] 新订阅 - {email}", email_html)

    return {"success": True, "message": "订阅成功，每周将收到五行运势推送"}
