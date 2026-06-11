"""
email.py — Email sending utility using SMTP.
Configure via .env file:
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
"""
import smtplib
import logging
import html as html_mod
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from email.header import Header
from config import get_settings

logger = logging.getLogger(__name__)

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
    html_content = f"""
    <div style="max-width:400px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#C9A84C;margin:0;">✦ 命盘智镜</h2>
      </div>
      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
        <p style="font-size:15px;">您好，</p>
        <p style="font-size:15px;">您的邮箱验证码为：</p>
        <div style="text-align:center;margin:20px 0;">
          <span style="font-size:32px;font-weight:bold;color:#2D1B4E;letter-spacing:8px;background:#fff;padding:12px 24px;border-radius:8px;border:2px dashed #C9A84C;">{html_mod.escape(str(code))}</span>
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

    return _send_email(to_email, subject, html_content)


def send_password_reset_email(to_email: str, code: str) -> bool:
    """Send a password reset verification code email."""
    config = _get_smtp_config()
    if not config["host"] or not config["user"]:
        print("[EMAIL] SMTP not configured, skipping email send")
        if settings.DEBUG:
            print(f"[EMAIL] Password reset code for {to_email}: {code}")
        return False

    subject = "命盘智镜 - 密码重置验证码"
    html_content = f"""
    <div style="max-width:400px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#C9A84C;margin:0;">✦ 命盘智镜</h2>
      </div>
      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
        <p style="font-size:15px;">您好，</p>
        <p style="font-size:15px;">您正在重置密码，验证码为：</p>
        <div style="text-align:center;margin:20px 0;">
          <span style="font-size:32px;font-weight:bold;color:#2D1B4E;letter-spacing:8px;background:#fff;padding:12px 24px;border-radius:8px;border:2px dashed #C9A84C;">{html_mod.escape(str(code))}</span>
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

    return _send_email(to_email, subject, html_content)


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
            server.starttls(required=True)

        server.login(config["user"], config["password"])
        server.sendmail(config["from_email"], [to_email], msg.as_string())
        server.quit()
        print(f"[EMAIL] Sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.warning(f"[EMAIL] Failed to send to {to_email}: {type(e).__name__}")
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
          <td style="padding:6px 8px;text-align:center;font-size:12px;color:#4ade80;">{yi_label} {html_mod.escape(str(d.get('yi','')))}</td>
          <td style="padding:6px 8px;text-align:center;font-size:12px;color:#f87171;">{ji_label} {html_mod.escape(str(d.get('ji','')))}</td>
        </tr>"""

    html_content = f"""
    <div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#C9A84C;margin:0 0 8px;">✦ {'本周运势' if is_zh else 'Weekly Fortune'}</h2>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">{html_mod.escape(str(fortune.get('week_start','')))} ~ {html_mod.escape(str(fortune.get('week_end','')))}</p>
      </div>
      <div style="background:#f9f9f9;padding:24px;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
          <div style="width:56px;height:56px;border-radius:50%;border:3px solid {score_color};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;color:{score_color};background:#fff;">{score}</div>
          <div>
            <p style="font-size:12px;color:#888;margin:0 0 2px;">{'综合评分' if is_zh else 'Overall Score'}</p>
            <p style="font-size:15px;color:#C9A84C;font-weight:600;margin:0;">{html_mod.escape(str(fortune.get('theme','')))}</p>
          </div>
        </div>
        <div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;">
          <p style="font-size:13px;color:#555;margin:0 0 8px;">✨ {'幸运要素' if is_zh else 'Lucky Items'}</p>
          <table style="width:100%;font-size:12px;"><tr>
            <td style="padding:4px;">🎨 {'幸运色' if is_zh else 'Color'}: <b style="color:#4ade80;">{html_mod.escape(str(fortune.get('lucky_color','')))}</b></td>
            <td style="padding:4px;">🔢 {'幸运数' if is_zh else 'Number'}: <b style="color:#C9A84C;">{html_mod.escape(str(fortune.get('lucky_number','')))}</b></td>
          </tr><tr>
            <td style="padding:4px;">🧭 {'幸运方位' if is_zh else 'Direction'}: <b style="color:#60a5fa;">{html_mod.escape(str(fortune.get('lucky_direction','')))}</b></td>
            <td style="padding:4px;">🃏 {html_mod.escape(str(fortune.get('tarot_card','')))}</td>
          </tr></table>
          <p style="font-size:12px;color:#666;margin:8px 0 0;font-style:italic;">{html_mod.escape(str(fortune.get('tarot_desc','')))}</p>
        </div>
        <div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;">
          <p style="font-size:13px;color:#555;margin:0 0 6px;">📅 {'每日宜忌' if is_zh else 'Daily Yi/Ji'}</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #eee;"><td style="padding:4px 8px;font-size:11px;color:#aaa;">{'日' if is_zh else 'Day'}</td><td style="padding:4px 8px;font-size:11px;color:#aaa;">{yi_label}</td><td style="padding:4px 8px;font-size:11px;color:#aaa;">{ji_label}</td></tr>
            {daily_rows}
          </table>
        </div>
        <div style="background:#f0f0ff;border-radius:8px;padding:14px;border:1px solid #e0e0ff;">
          <p style="font-size:12px;color:#666;margin:0;">🤖 {html_mod.escape(str(fortune.get('ai_insight','')))}</p>
        </div>
      </div>
      <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
        命盘智镜 · 全维度命理分析平台<br/>
        <a href="https://www.khanfate.com/settings" style="color:#aaa;">管理订阅</a> ·
        <a href="https://www.khanfate.com/privacy" style="color:#aaa;">隐私政策</a>
      </div>
    </div>
    """
    return _send_email(to_email, subject, html_content)


def send_analysis_complete_email(to_email: str, session_id: str, locale: str = "zh") -> bool:
    """Send notification when analysis is complete."""
    is_zh = locale == "zh"
    subject = "命盘智镜 - 你的命理分析已完成" if is_zh else "Destiny Mirror - Your Analysis is Ready"
    view_url = f"https://www.khanfate.com/{locale}/reading/{session_id}"

    if is_zh:
        html_content = f"""
        <div style="max-width:480px;margin:0 auto;font-family:'PingFang SC','Microsoft YaHei',Arial,sans-serif;color:#333;">
          <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
            <h2 style="color:#C9A84C;margin:0 0 8px;">✦ 命理分析已完成</h2>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">AI 全维度分析报告已就绪</p>
          </div>
          <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
            <p style="font-size:15px;margin:0 0 16px;">您好，</p>
            <p style="font-size:14px;color:#555;margin:0 0 20px;">你的全维度命理分析已完成！包含八字、星盘、塔罗、面相、手相五大维度的 AI 深度解析。</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="{html_mod.escape(str(view_url))}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#C9A84C,#b8943f);color:#1a0f2e;text-decoration:none;border-radius:24px;font-weight:bold;font-size:15px;">查看完整报告</a>
            </div>
            <p style="font-size:13px;color:#888;margin:0 0 8px;">报告包含：</p>
            <ul style="font-size:13px;color:#666;padding-left:20px;margin:0 0 16px;">
              <li>八字命盘解析</li>
              <li>西方星盘分析</li>
              <li>塔罗牌指引</li>
              <li>面相运势解读</li>
              <li>手相生命密码</li>
            </ul>
            <p style="font-size:12px;color:#aaa;margin:0;">使用 100 星尘即可解锁完整报告，包含年度规划和改运建议。</p>
          </div>
          <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
            命盘智镜 · 全维度命理分析平台<br/>
            <a href="https://www.khanfate.com/privacy" style="color:#aaa;">隐私政策</a> ·
            <a href="https://www.khanfate.com/unsubscribe" style="color:#aaa;">取消订阅</a>
          </div>
        </div>
        """
    else:
        html_content = f"""
        <div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
          <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
            <h2 style="color:#C9A84C;margin:0 0 8px;">✦ Analysis Complete</h2>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">Your AI destiny analysis report is ready</p>
          </div>
          <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
            <p style="font-size:15px;margin:0 0 16px;">Hello,</p>
            <p style="font-size:14px;color:#555;margin:0 0 20px;">Your full-dimension destiny analysis is complete! It includes AI-powered insights across Bazi, Western Astrology, Tarot, Face Reading, and Palmistry.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="{html_mod.escape(str(view_url))}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#C9A84C,#b8943f);color:#1a0f2e;text-decoration:none;border-radius:24px;font-weight:bold;font-size:15px;">View Full Report</a>
            </div>
            <p style="font-size:13px;color:#888;margin:0 0 8px;">Report includes:</p>
            <ul style="font-size:13px;color:#666;padding-left:20px;margin:0 0 16px;">
              <li>Bazi (Four Pillars) Analysis</li>
              <li>Western Astrology Chart</li>
              <li>Tarot Card Guidance</li>
              <li>Face Reading Insights</li>
              <li>Palmistry Life Code</li>
            </ul>
            <p style="font-size:12px;color:#aaa;margin:0;">Unlock the full report with 100 Stardust for annual planning and fortune guidance.</p>
          </div>
          <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
            Destiny Mirror · Multi-Dimension Destiny Analysis<br/>
            <a href="https://www.khanfate.com/privacy" style="color:#aaa;">Privacy</a> ·
            <a href="https://www.khanfate.com/unsubscribe" style="color:#aaa;">Unsubscribe</a>
          </div>
        </div>
        """

    return _send_email(to_email, subject, html_content)


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

    html_content = f"""
    <div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#1a2744,#0f1a2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#60a5fa;margin:0 0 8px;">✦ {'今日运势' if is_zh else 'Daily Fortune'}</h2>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">{html_mod.escape(str(fortune.get('date','')))}</p>
      </div>
      <div style="background:#f9f9f9;padding:24px;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
          <div style="width:56px;height:56px;border-radius:50%;border:3px solid {score_color};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;color:{score_color};background:#fff;">{score}</div>
          <div>
            <p style="font-size:12px;color:#888;margin:0 0 2px;">{'今日评分' if is_zh else "Today's Score"}</p>
            <p style="font-size:15px;color:#60a5fa;font-weight:600;margin:0;">{html_mod.escape(str(fortune.get('theme','')))}</p>
          </div>
        </div>
        <div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;">
          <p style="font-size:13px;color:#555;margin:0 0 8px;">✨ {'今日幸运' if is_zh else "Today's Lucky Items"}</p>
          <table style="width:100%;font-size:12px;"><tr>
            <td style="padding:4px;">🎨 {'颜色' if is_zh else 'Color'}: <b style="color:#4ade80;">{html_mod.escape(str(fortune.get('lucky_color','')))}</b></td>
            <td style="padding:4px;">🔢 {'数字' if is_zh else 'Number'}: <b style="color:#C9A84C;">{html_mod.escape(str(fortune.get('lucky_number','')))}</b></td>
          </tr><tr>
            <td style="padding:4px;">🧭 {'方位' if is_zh else 'Direction'}: <b style="color:#60a5fa;">{html_mod.escape(str(fortune.get('lucky_direction','')))}</b></td>
            <td style="padding:4px;">🃏 {html_mod.escape(str(fortune.get('tarot_card','')))}</td>
          </tr></table>
          <p style="font-size:12px;color:#666;margin:8px 0 0;font-style:italic;">{html_mod.escape(str(fortune.get('tarot_desc','')))}</p>
        </div>
        <div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;">
          <p style="font-size:13px;color:#555;margin:0 0 8px;">📋 {'今日宜忌' if is_zh else "Today's Do's and Don'ts"}</p>
          <div style="display:flex;gap:12px;">
            <div style="flex:1;background:#f0fdf4;border-radius:6px;padding:10px;text-align:center;">
              <p style="font-size:11px;color:#4ade80;font-weight:600;margin:0 0 4px;">{yi_label}</p>
              <p style="font-size:13px;color:#333;margin:0;">{html_mod.escape("、".join(str(x) for x in yi_items))}</p>
            </div>
            <div style="flex:1;background:#fef2f2;border-radius:6px;padding:10px;text-align:center;">
              <p style="font-size:11px;color:#f87171;font-weight:600;margin:0 0 4px;">{ji_label}</p>
              <p style="font-size:13px;color:#333;margin:0;">{html_mod.escape("、".join(str(x) for x in ji_items))}</p>
            </div>
          </div>
        </div>
        <div style="background:#f0f4ff;border-radius:8px;padding:14px;border:1px solid #e0e8ff;">
          <p style="font-size:12px;color:#666;margin:0;">🤖 {html_mod.escape(str(fortune.get('ai_insight','')))}</p>
        </div>
      </div>
      <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
        命盘智镜 · 全维度命理分析平台<br/>
        <a href="https://www.khanfate.com/settings" style="color:#aaa;">管理订阅</a> ·
        <a href="https://www.khanfate.com/privacy" style="color:#aaa;">隐私政策</a>
      </div>
    </div>
    """
    return _send_email(to_email, subject, html_content)


def send_payment_notification_email(
    order_no: str, amount_cny: float, item_type: str,
    user_email: str, confirm_token: str, reject_token: str,
) -> bool:
    """Send admin payment notification with one-click confirm/reject links."""
    config = _get_smtp_config()
    print(f"[EMAIL-DEBUG] SMTP host={config['host']}, user={config['user']}, admin_emails={settings.ADMIN_EMAILS}")
    if not config["host"] or not config["user"]:
        logger.warning("[EMAIL] SMTP not configured, skipping payment notification")
        return False

    admin_emails_str = settings.ADMIN_EMAILS
    if not admin_emails_str:
        logger.warning("[EMAIL] ADMIN_EMAILS not configured, skipping payment notification")
        return False

    admin_emails = [e.strip() for e in admin_emails_str.split(",") if e.strip()]
    if not admin_emails:
        return False

    base_url = "https://www.khanfate.com"
    confirm_url = f"{base_url}/api/personal-payments/admin/quick-confirm?token={confirm_token}"
    reject_url = f"{base_url}/api/personal-payments/admin/quick-reject?token={reject_token}"

    tier_labels = {
        "premium_monthly": "月度会员 ¥59",
        "premium_yearly": "年度会员 ¥365",
        "unlock_report": "报告解锁 ¥19.9",
        "onetime_unlock": "一次性解锁 ¥19.9",
        "founder_lifetime": "创始人席位 ¥1688",
    }
    tier_label = tier_labels.get(item_type, item_type)

    subject = f"💰 新付款通知 ¥{amount_cny} - {order_no}"
    html_content = f"""
    <div style="max-width:480px;margin:0 auto;font-family:'PingFang SC','Microsoft YaHei',Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#1a5c2e,#0d3d1a);padding:24px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#4ade80;margin:0 0 8px;">💰 新付款通知</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">请核实后确认收款</p>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;">
        <div style="background:white;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;font-size:13px;color:#666;">订单号</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:bold;color:#111;">{html_mod.escape(order_no)}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">商品</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:bold;color:#111;">{html_mod.escape(tier_label)}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">金额</p>
          <p style="margin:0 0 16px;font-size:24px;font-weight:bold;color:#16a34a;">¥{amount_cny}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">用户邮箱</p>
          <p style="margin:0;font-size:14px;color:#333;">{html_mod.escape(user_email)}</p>
        </div>
        <p style="font-size:13px;color:#666;margin:0 0 12px;text-align:center;">请打开手机收款通知核实金额，然后点击下方按钮：</p>
        <div style="text-align:center;margin:16px 0;">
          <a href="{confirm_url}" style="display:inline-block;padding:12px 32px;background:#16a34a;color:white;text-decoration:none;border-radius:24px;font-weight:bold;font-size:15px;margin-right:8px;">✅ 已收到 ¥{amount_cny}</a>
        </div>
        <div style="text-align:center;margin:8px 0;">
          <a href="{reject_url}" style="display:inline-block;padding:8px 24px;background:#dc2626;color:white;text-decoration:none;border-radius:20px;font-size:13px;">❌ 未收到</a>
        </div>
        <p style="font-size:11px;color:#aaa;margin:16px 0 0;text-align:center;">
          ¥50 以下订单 30 分钟未确认将自动激活<br/>
          ¥50 以上订单必须手动确认
        </p>
      </div>
      <div style="text-align:center;padding:12px;font-size:11px;color:#aaa;">
        命盘智镜 · 支付管理系统
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = Header(subject, "utf-8")
    msg["From"] = formataddr((config["from_name"], config["from_email"]))
    msg["To"] = ", ".join(admin_emails)
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        if config["port"] == 465:
            server = smtplib.SMTP_SSL(config["host"], config["port"], timeout=10)
        else:
            server = smtplib.SMTP(config["host"], config["port"], timeout=10)
            server.starttls(required=True)
        server.login(config["user"], config["password"])
        server.sendmail(config["from_email"], admin_emails, msg.as_string())
        server.quit()
        logger.info(f"[EMAIL] Payment notification sent for order {order_no}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL] Failed to send payment notification: {e}")
        return False


# ── QR 支付确认邮件 ─────────────────────────────────────────────────────────

def send_qr_confirm_email(to_email: str, order_no: str, amount_cny: float, token: str) -> bool:
    """Send QR payment confirmation email — user must click link to confirm payment."""
    config = _get_smtp_config()
    if not config["host"] or not config["user"]:
        print("[EMAIL] SMTP not configured, skipping QR confirm email")
        if settings.DEBUG:
            print(f"[EMAIL] QR confirm link for {to_email}: https://www.khanfate.com/api/payments/confirm-email?token={token}")
        return False

    confirm_url = f"https://www.khanfate.com/api/payments/confirm-email?token={token}"

    subject = f"确认付款 ¥{amount_cny} - 订单 {order_no}"
    html_content = f"""
    <div style="max-width:480px;margin:0 auto;font-family:'PingFang SC','Microsoft YaHei',Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#2D1B4E,#1a0f2e);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#C9A84C;margin:0 0 8px;">✦ 确认付款</h2>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">请确认您已完成支付</p>
      </div>
      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
        <p style="font-size:15px;margin:0 0 16px;">您好，</p>
        <p style="font-size:14px;color:#555;margin:0 0 20px;">您提交了一笔微信/支付宝付款，请确认您已扫码支付：</p>
        <div style="background:white;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;font-size:13px;color:#666;">订单号</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:bold;color:#111;">{html_mod.escape(order_no)}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">支付金额</p>
          <p style="margin:0;font-size:24px;font-weight:bold;color:#C9A84C;">¥{amount_cny}</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="{confirm_url}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#C9A84C,#b8943f);color:#1a0f2e;text-decoration:none;border-radius:24px;font-weight:bold;font-size:16px;">✅ 我已确认付款</a>
        </div>
        <p style="font-size:12px;color:#888;margin:0 0 8px;text-align:center;">点击上方按钮确认您已完成支付</p>
        <p style="font-size:12px;color:#f87171;margin:12px 0 0;text-align:center;">⚠️ 如果您尚未支付，请勿点击此按钮</p>
        <p style="font-size:11px;color:#aaa;margin:16px 0 0;text-align:center;">此确认链接 30 分钟内有效</p>
      </div>
      <div style="text-align:center;padding:15px;font-size:11px;color:#aaa;">
        命盘智镜 · 全维度命理分析平台<br/>
        <a href="https://www.khanfate.com/privacy" style="color:#aaa;">隐私政策</a> ·
        <a href="https://www.khanfate.com/terms" style="color:#aaa;">服务条款</a>
      </div>
    </div>
    """
    return _send_email(to_email, subject, html_content)


# ── 退款相关邮件通知 ──────────────────────────────────────────────────────────

def send_refund_request_notification(
    order_no: str, total_cny: float, user_email: str, reason: str,
) -> bool:
    """通知管理员：用户申请了退款"""
    config = _get_smtp_config()
    if not config["host"] or not config["user"]:
        return False

    admin_emails_str = settings.ADMIN_EMAILS
    if not admin_emails_str:
        logger.warning("[EMAIL] ADMIN_EMAILS not configured, skipping refund notification")
        return False

    admin_emails = [e.strip() for e in admin_emails_str.split(",") if e.strip()]
    if not admin_emails:
        return False

    subject = f"🔄 退款申请 ¥{total_cny} - {order_no}"
    html_content = f"""
    <div style="max-width:480px;margin:0 auto;font-family:'PingFang SC','Microsoft YaHei',Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#b45309,#78350f);padding:24px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#fbbf24;margin:0 0 8px;">🔄 退款申请</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">请尽快处理</p>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;">
        <div style="background:white;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;font-size:13px;color:#666;">订单号</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:bold;color:#111;">{html_mod.escape(order_no)}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">订单金额</p>
          <p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:#b45309;">¥{total_cny}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">用户邮箱</p>
          <p style="margin:0 0 16px;font-size:14px;color:#333;">{html_mod.escape(user_email)}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">退款原因</p>
          <p style="margin:0;font-size:14px;color:#333;background:#fff7ed;padding:8px;border-radius:6px;border:1px solid #fed7aa;">{html_mod.escape(reason)}</p>
        </div>
        <p style="font-size:13px;color:#666;margin:12px 0;text-align:center;">
          请登录管理后台审核退款申请
        </p>
        <div style="text-align:center;margin:16px 0;">
          <a href="https://www.khanfate.com/zh/admin/orders" style="display:inline-block;padding:12px 32px;background:#b45309;color:white;text-decoration:none;border-radius:24px;font-weight:bold;font-size:15px;">前往审核</a>
        </div>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = Header(subject, "utf-8")
    msg["From"] = formataddr((config["from_name"], config["from_email"]))
    msg["To"] = ", ".join(admin_emails)
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        if config["port"] == 465:
            server = smtplib.SMTP_SSL(config["host"], config["port"], timeout=10)
        else:
            server = smtplib.SMTP(config["host"], config["port"], timeout=10)
            server.starttls(required=True)
        server.login(config["user"], config["password"])
        server.sendmail(config["from_email"], admin_emails, msg.as_string())
        server.quit()
        logger.info(f"[EMAIL] Refund request notification sent for order {order_no}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL] Failed to send refund request notification: {e}")
        return False


def send_refund_approved_notification(
    to_email: str, order_no: str, refund_amount: float,
) -> bool:
    """通知用户：退款已批准"""
    subject = f"✅ 退款已批准 - {order_no}"
    html_content = f"""
    <div style="max-width:480px;margin:0 auto;font-family:'PingFang SC','Microsoft YaHei',Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#166534,#14532d);padding:24px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#4ade80;margin:0 0 8px;">✅ 退款已批准</h2>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;">
        <div style="background:white;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;font-size:13px;color:#666;">订单号</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:bold;color:#111;">{html_mod.escape(order_no)}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">退款金额</p>
          <p style="margin:0;font-size:24px;font-weight:bold;color:#16a34a;">¥{refund_amount}</p>
        </div>
        <p style="font-size:13px;color:#666;margin:0 0 12px;text-align:center;">
          退款将在 1-3 个工作日内原路退回您的付款账户。<br/>如有问题请联系 refund@khanfate.com
        </p>
      </div>
      <div style="text-align:center;padding:12px;font-size:11px;color:#aaa;">
        命盘智镜 · 全维度命理分析平台
      </div>
    </div>
    """
    return _send_email(to_email, subject, html_content)


def send_refund_rejected_notification(
    to_email: str, order_no: str, reject_reason: str,
) -> bool:
    """通知用户：退款申请被拒绝"""
    subject = f"❌ 退款申请未通过 - {order_no}"
    html_content = f"""
    <div style="max-width:480px;margin:0 auto;font-family:'PingFang SC','Microsoft YaHei',Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#991b1b,#7f1d1d);padding:24px;text-align:center;border-radius:12px 12px 0 0;">
        <h2 style="color:#fca5a5;margin:0 0 8px;">❌ 退款申请未通过</h2>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;">
        <div style="background:white;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;font-size:13px;color:#666;">订单号</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:bold;color:#111;">{html_mod.escape(order_no)}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">未通过原因</p>
          <p style="margin:0;font-size:14px;color:#333;background:#fef2f2;padding:8px;border-radius:6px;border:1px solid #fecaca;">{html_mod.escape(reject_reason)}</p>
        </div>
        <p style="font-size:13px;color:#666;margin:0 0 12px;text-align:center;">
          如需帮助请联系 refund@khanfate.com
        </p>
      </div>
      <div style="text-align:center;padding:12px;font-size:11px;color:#aaa;">
        命盘智镜 · 全维度命理分析平台
      </div>
    </div>
    """
    return _send_email(to_email, subject, html_content)
