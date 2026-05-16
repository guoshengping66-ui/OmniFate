"""
email.py — Email sending utility using SMTP.
Configure via .env file:
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from email.header import Header
from config import get_settings

settings = get_settings()


def _get_smtp_config() -> dict:
    """Get SMTP config from pydantic settings (reads .env file)."""
    return {
        "host": settings.SMTP_HOST,
        "port": settings.SMTP_PORT,
        "user": settings.SMTP_USER,
        "password": settings.SMTP_PASS,
        "from_email": settings.SMTP_FROM,
        "from_name": settings.SMTP_FROM_NAME,
    }


def is_smtp_configured() -> bool:
    """Check if SMTP is properly configured with host and user."""
    config = _get_smtp_config()
    return bool(config["host"] and config["user"])


def send_verification_email(to_email: str, code: str) -> bool:
    """Send a 6-digit verification code email. Returns True if sent successfully."""
    config = _get_smtp_config()
    if not config["host"] or not config["user"]:
        print("[EMAIL] SMTP not configured, skipping email send")
        # Only log code in debug mode, never in production
        if settings.DEBUG:
            print(f"[EMAIL] Verification code for {to_email}: {code}")
        return False

    subject = "命盘智镜 - 邮箱验证码"
    html = f"""
    <div style="max-width:400px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#C9A84C;margin:0;">✦ 命盘智镜</h2>
      </div>
      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
        <p style="font-size:15px;">您好，</p>
        <p style="font-size:15px;">您的邮箱验证码为：</p>
        <div style="text-align:center;margin:20px 0;">
          <span style="font-size:32px;font-weight:bold;color:#2D1B4E;letter-spacing:8px;background:#fff;padding:12px 24px;border-radius:8px;border:2px dashed #C9A84C;">{code}</span>
        </div>
        <p style="font-size:13px;color:#888;">验证码 15 分钟内有效，请勿泄露给他人。</p>
        <p style="font-size:13px;color:#888;">如果这不是您的操作，请忽略此邮件。</p>
      </div>
      <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
        命盘智镜 · 全维度命理分析平台<br/>
        运营者：[公司名称] | 如非本人操作请忽略此邮件<br/>
        <a href="https://www.khanfate.com/privacy" style="color:#aaa;">隐私政策</a> ·
        <a href="https://www.khanfate.com/terms" style="color:#aaa;">服务条款</a>
      </div>
    </div>
    """

    return _send_email(to_email, subject, html)


def send_password_reset_email(to_email: str, code: str) -> bool:
    """Send a password reset verification code email."""
    config = _get_smtp_config()
    if not config["host"] or not config["user"]:
        print("[EMAIL] SMTP not configured, skipping email send")
        if settings.DEBUG:
            print(f"[EMAIL] Password reset code for {to_email}: {code}")
        return False

    subject = "命盘智镜 - 密码重置验证码"
    html = f"""
    <div style="max-width:400px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#C9A84C;margin:0;">✦ 命盘智镜</h2>
      </div>
      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
        <p style="font-size:15px;">您好，</p>
        <p style="font-size:15px;">您正在重置密码，验证码为：</p>
        <div style="text-align:center;margin:20px 0;">
          <span style="font-size:32px;font-weight:bold;color:#2D1B4E;letter-spacing:8px;background:#fff;padding:12px 24px;border-radius:8px;border:2px dashed #C9A84C;">{code}</span>
        </div>
        <p style="font-size:13px;color:#888;">验证码 15 分钟内有效，请勿泄露给他人。</p>
        <p style="font-size:13px;color:#888;">如果这不是您的操作，请立即修改密码并联系客服。</p>
      </div>
      <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
        命盘智镜 · 全维度命理分析平台<br/>
        运营者：[公司名称] | 如非本人操作请立即联系客服<br/>
        <a href="https://www.khanfate.com/privacy" style="color:#aaa;">隐私政策</a> ·
        <a href="https://www.khanfate.com/terms" style="color:#aaa;">服务条款</a>
      </div>
    </div>
    """

    return _send_email(to_email, subject, html)


def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an HTML email via SMTP."""
    config = _get_smtp_config()
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = Header(subject, "utf-8").encode()
        msg["From"] = formataddr((str(Header(config['from_name'], 'utf-8')), config['from_email']))
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        if config["port"] == 465:
            server = smtplib.SMTP_SSL(config["host"], config["port"], timeout=10)
        else:
            server = smtplib.SMTP(config["host"], config["port"], timeout=10)
            server.starttls()

        server.login(config["user"], config["password"])
        server.sendmail(config["from_email"], [to_email], msg.as_string())
        server.quit()
        print(f"[EMAIL] Sent to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to_email}: {e}")
        return False
