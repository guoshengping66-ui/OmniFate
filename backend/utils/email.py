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


def send_fortune_email(to_email: str, fortune: dict, locale: str = "zh") -> bool:
    """Send weekly fortune email to user."""
    is_zh = locale == "zh"
    subject = "命盘智镜 - 本周运势" if is_zh else "Fate OS - Weekly Fortune"

    score = fortune.get("score", 5)
    theme = fortune.get("theme", "")
    lucky_color = fortune.get("lucky_color", "")
    lucky_number = fortune.get("lucky_number", "")
    lucky_direction = fortune.get("lucky_direction", "")
    tarot_card = fortune.get("tarot_card", "")
    tarot_desc = fortune.get("tarot_desc", "")
    ai_insight = fortune.get("ai_insight", "")
    daily_yi_ji = fortune.get("daily_yi_ji", [])

    day_labels_zh = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    day_labels_en = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    day_labels = day_labels_zh if is_zh else day_labels_en
    yi_label = "宜" if is_zh else "Do"
    ji_label = "忌" if is_zh else "Don't"

    score_color = "#4ade80" if score >= 8 else "#C9A84C" if score >= 6 else "#fb923c" if score >= 4 else "#f87171"

    # Build daily rows
    daily_rows = ""
    for i, d in enumerate(daily_yi_ji[:7]):
        label = day_labels[i] if i < len(day_labels) else f"Day {i+1}"
        daily_rows += f"""
        <td style="padding:8px;text-align:center;border:1px solid #eee;">
          <div style="font-size:12px;color:#888;">{label}</div>
          <div style="font-size:13px;color:#22c55e;margin-top:4px;">{yi_label} {d.get('yi','')}</div>
          <div style="font-size:13px;color:#ef4444;">{ji_label} {d.get('ji','')}</div>
        </td>"""

    if is_zh:
        html = f"""
        <div style="max-width:500px;margin:0 auto;font-family:'PingFang SC','Microsoft YaHei',Arial,sans-serif;color:#333;">
          <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
            <h2 style="color:#C9A84C;margin:0 0 8px;">✦ 本周运势</h2>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">{fortune.get('week_start','')} ~ {fortune.get('week_end','')}</p>
          </div>
          <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
            <!-- Score -->
            <div style="text-align:center;margin-bottom:20px;">
              <div style="display:inline-block;width:80px;height:80px;border-radius:50%;border:4px solid {score_color};line-height:72px;font-size:28px;font-weight:bold;color:{score_color};">{score}</div>
              <p style="margin:8px 0 0;font-size:15px;color:#C9A84C;font-weight:600;">{theme}</p>
            </div>
            <!-- Lucky items -->
            <table style="width:100%;font-size:13px;margin-bottom:16px;">
              <tr>
                <td style="padding:4px 0;color:#888;">幸运颜色</td>
                <td style="padding:4px 0;color:#22c55e;font-weight:500;">{lucky_color}</td>
                <td style="padding:4px 0;color:#888;">幸运数字</td>
                <td style="padding:4px 0;color:#C9A84C;font-weight:500;">{lucky_number}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#888;">吉方位</td>
                <td style="padding:4px 0;color:#3b82f6;font-weight:500;">{lucky_direction}</td>
                <td style="padding:4px 0;color:#888;">塔罗牌</td>
                <td style="padding:4px 0;color:#a855f7;font-weight:500;">{tarot_card}</td>
              </tr>
            </table>
            <!-- Tarot -->
            <div style="background:#f3e8ff;border:1px solid #e9d5ff;border-radius:8px;padding:12px;margin-bottom:16px;">
              <p style="font-size:13px;color:#7c3aed;margin:0;">{tarot_desc}</p>
            </div>
            <!-- Daily -->
            <p style="font-size:12px;color:#888;margin:0 0 8px;">每日宜忌</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
              <tr>{''.join(daily_rows[:4])}</tr>
              <tr>{''.join(daily_rows[4:])}</tr>
            </table>
            <!-- AI Insight -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;">
              <p style="font-size:13px;color:#166534;margin:0;">🤖 {ai_insight}</p>
            </div>
          </div>
          <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
            命盘智镜 · 全维度命理分析平台<br/>
            <a href="https://www.khanfate.com/privacy" style="color:#aaa;">隐私政策</a> ·
            <a href="https://www.khanfate.com/unsubscribe" style="color:#aaa;">取消订阅</a>
          </div>
        </div>
        """
    else:
        html = f"""
        <div style="max-width:500px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
          <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
            <h2 style="color:#C9A84C;margin:0 0 8px;">✦ Weekly Fortune</h2>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">{fortune.get('week_start','')} ~ {fortune.get('week_end','')}</p>
          </div>
          <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
            <div style="text-align:center;margin-bottom:20px;">
              <div style="display:inline-block;width:80px;height:80px;border-radius:50%;border:4px solid {score_color};line-height:72px;font-size:28px;font-weight:bold;color:{score_color};">{score}</div>
              <p style="margin:8px 0 0;font-size:15px;color:#C9A84C;font-weight:600;">{theme}</p>
            </div>
            <table style="width:100%;font-size:13px;margin-bottom:16px;">
              <tr>
                <td style="padding:4px 0;color:#888;">Lucky Color</td>
                <td style="padding:4px 0;color:#22c55e;font-weight:500;">{lucky_color}</td>
                <td style="padding:4px 0;color:#888;">Lucky Number</td>
                <td style="padding:4px 0;color:#C9A84C;font-weight:500;">{lucky_number}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#888;">Direction</td>
                <td style="padding:4px 0;color:#3b82f6;font-weight:500;">{lucky_direction}</td>
                <td style="padding:4px 0;color:#888;">Tarot</td>
                <td style="padding:4px 0;color:#a855f7;font-weight:500;">{tarot_card}</td>
              </tr>
            </table>
            <div style="background:#f3e8ff;border:1px solid #e9d5ff;border-radius:8px;padding:12px;margin-bottom:16px;">
              <p style="font-size:13px;color:#7c3aed;margin:0;">{tarot_desc}</p>
            </div>
            <p style="font-size:12px;color:#888;margin:0 0 8px;">Daily Do's & Don'ts</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
              <tr>{''.join(daily_rows[:4])}</tr>
              <tr>{''.join(daily_rows[4:])}</tr>
            </table>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;">
              <p style="font-size:13px;color:#166534;margin:0;">🤖 {ai_insight}</p>
            </div>
          </div>
          <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
            Fate OS · Full-Dimension Destiny Analysis<br/>
            <a href="https://www.khanfate.com/privacy" style="color:#aaa;">Privacy</a> ·
            <a href="https://www.khanfate.com/unsubscribe" style="color:#aaa;">Unsubscribe</a>
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
