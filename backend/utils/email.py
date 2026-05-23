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
        运营者：命盘智镜运营团队 | 如非本人操作请忽略此邮件<br/>
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
        运营者：命盘智镜运营团队 | 如非本人操作请立即联系客服<br/>
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


def send_fortune_email(to_email: str, fortune: dict, locale: str = "zh") -> bool:
    """Send a weekly fortune email with rich HTML template."""
    is_zh = locale == "zh"
    subject = "命盘智镜 - 本周运势" if is_zh else "Destiny Mirror - Weekly Fortune"
    score = fortune.get("score", 6)
    score_color = "#4ade80" if score >= 8 else "#C9A84C" if score >= 6 else "#fb923c" if score >= 4 else "#f87171"
    yi_label = "宜" if is_zh else "Do"
    ji_label = "忌" if is_zh else "Don't"

    daily_rows = ""
    day_names = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] if is_zh else ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for i, d in enumerate(fortune.get("daily_yi_ji", [])[:7]):
        daily_rows += f"""
        <tr>
          <td style="padding:6px 8px;text-align:center;font-size:12px;color:#888;">{day_names[i]}</td>
          <td style="padding:6px 8px;text-align:center;font-size:12px;color:#4ade80;">{yi_label} {d.get('yi','')}</td>
          <td style="padding:6px 8px;text-align:center;font-size:12px;color:#f87171;">{ji_label} {d.get('ji','')}</td>
        </tr>"""

    html = f"""
    <div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#C9A84C;margin:0 0 8px;">✦ {'本周运势' if is_zh else 'Weekly Fortune'}</h2>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">{fortune.get('week_start','')} ~ {fortune.get('week_end','')}</p>
      </div>
      <div style="background:#f9f9f9;padding:24px;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
          <div style="width:56px;height:56px;border-radius:50%;border:3px solid {score_color};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;color:{score_color};background:#fff;">{score}</div>
          <div>
            <p style="font-size:12px;color:#888;margin:0 0 2px;">{'综合评分' if is_zh else 'Overall Score'}</p>
            <p style="font-size:15px;color:#C9A84C;font-weight:600;margin:0;">{fortune.get('theme','')}</p>
          </div>
        </div>
        <div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;">
          <p style="font-size:13px;color:#555;margin:0 0 8px;">✨ {'幸运要素' if is_zh else 'Lucky Items'}</p>
          <table style="width:100%;font-size:12px;"><tr>
            <td style="padding:4px;">🎨 {'幸运色' if is_zh else 'Color'}: <b style="color:#4ade80;">{fortune.get('lucky_color','')}</b></td>
            <td style="padding:4px;">🔢 {'幸运数' if is_zh else 'Number'}: <b style="color:#C9A84C;">{fortune.get('lucky_number','')}</b></td>
          </tr><tr>
            <td style="padding:4px;">🧭 {'幸运方位' if is_zh else 'Direction'}: <b style="color:#60a5fa;">{fortune.get('lucky_direction','')}</b></td>
            <td style="padding:4px;">🃏 {fortune.get('tarot_card','')}</td>
          </tr></table>
          <p style="font-size:12px;color:#666;margin:8px 0 0;font-style:italic;">{fortune.get('tarot_desc','')}</p>
        </div>
        <div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;">
          <p style="font-size:13px;color:#555;margin:0 0 6px;">📅 {'每日宜忌' if is_zh else 'Daily Yi/Ji'}</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #eee;"><td style="padding:4px 8px;font-size:11px;color:#aaa;">{'日' if is_zh else 'Day'}</td><td style="padding:4px 8px;font-size:11px;color:#aaa;">{yi_label}</td><td style="padding:4px 8px;font-size:11px;color:#aaa;">{ji_label}</td></tr>
            {daily_rows}
          </table>
        </div>
        <div style="background:#f0f0ff;border-radius:8px;padding:14px;border:1px solid #e0e0ff;">
          <p style="font-size:12px;color:#666;margin:0;">🤖 {fortune.get('ai_insight','')}</p>
        </div>
      </div>
      <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
        命盘智镜 · 全维度命理分析平台<br/>
        <a href="https://www.khanfate.com/settings" style="color:#aaa;">管理订阅</a> ·
        <a href="https://www.khanfate.com/privacy" style="color:#aaa;">隐私政策</a>
      </div>
    </div>
    """
    return _send_email(to_email, subject, html)


def send_daily_fortune_email(to_email: str, fortune: dict, locale: str = "zh") -> bool:
    """Send a daily fortune email with rich HTML template."""
    is_zh = locale == "zh"
    subject = "命盘智镜 - 今日运势" if is_zh else "Destiny Mirror - Daily Fortune"
    score = fortune.get("score", 6)
    score_color = "#4ade80" if score >= 8 else "#C9A84C" if score >= 6 else "#fb923c" if score >= 4 else "#f87171"
    yi_label = "宜" if is_zh else "Do"
    ji_label = "忌" if is_zh else "Don't"

    yi_items = fortune.get("yi", [])
    ji_items = fortune.get("ji", [])

    html = f"""
    <div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#1a2744,#0f1a2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#60a5fa;margin:0 0 8px;">✦ {'今日运势' if is_zh else 'Daily Fortune'}</h2>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">{fortune.get('date','')}</p>
      </div>
      <div style="background:#f9f9f9;padding:24px;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
          <div style="width:56px;height:56px;border-radius:50%;border:3px solid {score_color};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;color:{score_color};background:#fff;">{score}</div>
          <div>
            <p style="font-size:12px;color:#888;margin:0 0 2px;">{'今日评分' if is_zh else "Today's Score"}</p>
            <p style="font-size:15px;color:#60a5fa;font-weight:600;margin:0;">{fortune.get('theme','')}</p>
          </div>
        </div>
        <div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;">
          <p style="font-size:13px;color:#555;margin:0 0 8px;">✨ {'今日幸运' if is_zh else "Today's Lucky Items"}</p>
          <table style="width:100%;font-size:12px;"><tr>
            <td style="padding:4px;">🎨 {'颜色' if is_zh else 'Color'}: <b style="color:#4ade80;">{fortune.get('lucky_color','')}</b></td>
            <td style="padding:4px;">🔢 {'数字' if is_zh else 'Number'}: <b style="color:#C9A84C;">{fortune.get('lucky_number','')}</b></td>
          </tr><tr>
            <td style="padding:4px;">🧭 {'方位' if is_zh else 'Direction'}: <b style="color:#60a5fa;">{fortune.get('lucky_direction','')}</b></td>
            <td style="padding:4px;">🃏 {fortune.get('tarot_card','')}</td>
          </tr></table>
          <p style="font-size:12px;color:#666;margin:8px 0 0;font-style:italic;">{fortune.get('tarot_desc','')}</p>
        </div>
        <div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;">
          <p style="font-size:13px;color:#555;margin:0 0 8px;">📋 {'今日宜忌' if is_zh else "Today's Do's and Don'ts"}</p>
          <div style="display:flex;gap:12px;">
            <div style="flex:1;background:#f0fdf4;border-radius:6px;padding:10px;text-align:center;">
              <p style="font-size:11px;color:#4ade80;font-weight:600;margin:0 0 4px;">{yi_label}</p>
              <p style="font-size:13px;color:#333;margin:0;">{"、".join(yi_items)}</p>
            </div>
            <div style="flex:1;background:#fef2f2;border-radius:6px;padding:10px;text-align:center;">
              <p style="font-size:11px;color:#f87171;font-weight:600;margin:0 0 4px;">{ji_label}</p>
              <p style="font-size:13px;color:#333;margin:0;">{"、".join(ji_items)}</p>
            </div>
          </div>
        </div>
        <div style="background:#f0f4ff;border-radius:8px;padding:14px;border:1px solid #e0e8ff;">
          <p style="font-size:12px;color:#666;margin:0;">🤖 {fortune.get('ai_insight','')}</p>
        </div>
      </div>
      <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
        命盘智镜 · 全维度命理分析平台<br/>
        <a href="https://www.khanfate.com/settings" style="color:#aaa;">管理订阅</a> ·
        <a href="https://www.khanfate.com/privacy" style="color:#aaa;">隐私政策</a>
      </div>
    </div>
    """
    return _send_email(to_email, subject, html)
