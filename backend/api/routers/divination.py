"""星际抽签系统 API — Phase 2: 动态感应种子 + AI 深度解析"""
import hashlib
import random
import uuid
from datetime import datetime, timezone, date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, DivinationRecord, CreditTransaction
from auth.dependencies import get_current_user, require_user

router = APIRouter()

# ── 签文数据库 ──────────────────────────────────────────────────────────────

FORTUNES = [
    {"fortune": "大吉", "level": 7, "weight": 5},
    {"fortune": "中吉", "level": 6, "weight": 15},
    {"fortune": "小吉", "level": 5, "weight": 25},
    {"fortune": "吉",   "level": 4, "weight": 25},
    {"fortune": "末吉", "level": 3, "weight": 15},
    {"fortune": "凶",   "level": 2, "weight": 10},
    {"fortune": "大凶", "level": 1, "weight": 5},
]

FORTUNE_LEVEL = {f["fortune"]: f["level"] for f in FORTUNES}

THEMES = ["事业", "感情", "财运", "健康", "学业", "人际", "出行"]

# 王阳明心学金句库
WISDOM_QUOTES = [
    {"quote": "你未看此花时，此花与汝心同归于寂；你来看此花时，则此花颜色一时明白起来。", "author": "王阳明"},
    {"quote": "此心光明，亦复何言。", "author": "王阳明"},
    {"quote": "知而不行，只是未知。", "author": "王阳明"},
    {"quote": "破山中贼易，破心中贼难。", "author": "王阳明"},
    {"quote": "立志用功，如种树然。方其根芽，犹未有干；及其有干，尚未有枝；枝而后叶，叶而后花、实。", "author": "王阳明"},
    {"quote": "人须在事上磨，方能立得住；方能静亦定、动亦定。", "author": "王阳明"},
    {"quote": "无善无恶心之体，有善有恶意之动，知善知恶是良知，为善去恶是格物。", "author": "王阳明"},
    {"quote": "持志如心痛，一心在痛上，岂有工夫说闲话、管闲事？", "author": "王阳明"},
    {"quote": "人人自有定盘针，万化根源总在心。却笑从前颠倒见，枝枝叶叶外头寻。", "author": "王阳明"},
    {"quote": "个个人心有仲尼，自将闻见苦遮迷。而今指与真头面，只是良知更莫疑。", "author": "王阳明"},
    {"quote": "君子之学，非有同志之友日相规切，则亦易以悠悠度日，而不见其过。", "author": "王阳明"},
    {"quote": "不可以一时之得意，而自夸其能；亦不可以一时之失意，而自坠其志。", "author": "王阳明"},
    {"quote": "人人自有定盘针，万化根源总在心。", "author": "王阳明"},
    {"quote": "此心不动，随机而动。", "author": "王阳明"},
    {"quote": "致良知是学问大头脑，是圣人教人第一义。", "author": "王阳明"},
    {"quote": "夫学，天下之公学也，非朱子可得而私也，非孔子可得而私也。", "author": "王阳明"},
    {"quote": "不贵于无过，而贵于能改过。", "author": "王阳明"},
    {"quote": "谦虚其心，宏大其量。", "author": "王阳明"},
    {"quote": "千圣皆过影，良知乃吾师。", "author": "王阳明"},
    {"quote": "人生大病，只是一傲字。", "author": "王阳明"},
    {"quote": "种树者必培其根，种德者必养其心。", "author": "王阳明"},
    {"quote": "为学须有本原，须从本原上用力。", "author": "王阳明"},
    {"quote": "圣人之道，吾性自足，向之求理于事物者误也。", "author": "王阳明"},
    {"quote": "心即理也。天下又有心外之事，心外之理乎？", "author": "王阳明"},
    {"quote": "你的心，决定你的世界。", "author": "王阳明"},
]

# ── AI 深度解析层：运势×主题 行动指引 ──────────────────────────────────────
# 按 (fortune_level, theme) 组合生成 ~50 字行动指引

AI_INSIGHTS = {
    # ── 事业 ──────────────────────────────────────
    (7, "事业"): "星轨大开，贵人方位在正东。今日适合主动出击，提出你的方案，上位者正在等待一个有魄力的声音。",
    (6, "事业"): "木星入宫，团队协作能量充沛。将核心任务拆解为三步，第一步在午前完成，后续自然水到渠成。",
    (5, "事业"): "暗流涌动但方向清晰。专注手头最紧迫的一件事，屏蔽干扰信息，下午三点前交出初稿即为上策。",
    (4, "事业"): "平稳推进日，适合复盘本周进度。列出三件已完成的事，你会发现积累远比想象中丰厚。",
    (3, "事业"): "阻力来自沟通错位。重要的事当面说，文字容易误读。下午安排一次简短的同步会议。",
    (2, "事业"): "今日不宜硬碰硬。退一步整理思路，把未完成的文件归档，为下一个窗口期蓄力。",
    (1, "事业"): "暂停即是战略。关掉通知，用两小时深度思考你真正想要的方向，答案会在安静中浮现。",
    # ── 感情 ──────────────────────────────────────
    (7, "感情"): "桃花正盛，对方的某个小举动正在释放信号。主动回应，今日的真诚对话会成为关系的转折点。",
    (6, "感情"): "情感温度上升期。准备一份小心意——不需要贵重，手写一句话的力量胜过千金。",
    (5, "感情"): "适合倾听而非表达。给对方一个不被打断的二十分钟，你会发现关系中被忽略的温柔。",
    (4, "感情"): "平淡是真实的力量。一起做一件日常小事，散步或做饭，默契在无声中生长。",
    (3, "感情"): "情绪波动期，避免在冲动时做判断。深呼吸三次后再回复消息，措辞会温和一半。",
    (2, "感情"): "今日关键词是「空间」。各自独处两小时再见面，距离会帮你理清真实感受。",
    (1, "感情"): "内心需要自我修复。写下三件感恩对方的事，怨气消散后，爱会重新流动。",
    # ── 财运 ──────────────────────────────────────
    (7, "财运"): "偏财星入命，意外之财的概率极高。留意身边的合作邀请，一杯咖啡聊出的项目可能价值超乎想象。",
    (6, "财运"): "正财稳固，适合处理账单和预算。检查一笔被忽略的订阅费，每月节省的复利效应惊人。",
    (5, "财运"): "消费欲上升但判断力在线。想买的东西先放入购物车等待 24 小时，80% 的冲动会自然消退。",
    (4, "财运"): "收支平衡日。打开记账 App 分析本月支出结构，找出那个「看不见的漏洞」。",
    (3, "财运"): "不宜大额支出。将预算缩减 20% 重新规划，你会发现核心需求其实已被满足。",
    (2, "财运"): "金钱能量低谷。今日只做「必须」的消费，拒绝一切「限时优惠」的诱惑。",
    (1, "财运"): "守住即是赚到。关闭所有消费提醒，今日的克制是为未来的丰盛奠基。",
    # ── 健康 ──────────────────────────────────────
    (7, "健康"): "体能巅峰期，适合挑战一项新运动。身体在呼唤释放，去户外跑五公里，内啡肽会给你惊喜。",
    (6, "健康"): "身体状态良好，重点在睡眠质量。今晚十点前上床，睡前不看屏幕，明早的精力会翻倍。",
    (5, "健康"): "肩膀和颈椎在发出信号。每工作 50 分钟起身活动 5 分钟，一杯温水比咖啡更提神。",
    (4, "健康"): "均衡日。三餐按时吃，蛋白质摄入不低于体重公斤数乘以 1.2 克，身体会感谢你。",
    (3, "健康"): "免疫力波动期。补充维生素 C 和充足睡眠是最低成本的修复方案。",
    (2, "健康"): "身体在要求休息。推迟高强度日程，用热水泡脚 15 分钟，让血液循环重新启动。",
    (1, "健康"): "今日身体需要断食修复。清淡饮食为主，让消化系统休息一天，明天会轻盈许多。",
    # ── 学业 ──────────────────────────────────────
    (7, "学业"): "理解力巅峰，攻克最难的那章。今天花三小时深读的内容，会成为未来三个月的思维地基。",
    (6, "学业"): "记忆力处于高位。用费曼技巧把今天学的概念讲给一个人听，讲清楚的部分才是真懂了。",
    (5, "学业"): "专注力需要仪式感。整理书桌、倒一杯水、打开计时器——25 分钟的番茄钟刚刚好。",
    (4, "学业"): "适合复习而非新学。翻阅上周笔记，用不同颜色标记「已掌握」和「模糊区」，精准补缺。",
    (3, "学业"): "知识卡点出现。不要死磕，换一种学习方式——视频、播客、或向同学请教，换条路到达终点。",
    (2, "学业"): "效率低谷日。降低目标到平时的 60%，完成就好。允许自己有一天不在最佳状态。",
    (1, "学业"): "今天不是学新东西的日子。合上书本，出门走走，灵感有时在放松中降临。",
    # ── 人际 ──────────────────────────────────────
    (7, "人际"): "社交能量爆棚。主动联络一位久未联系的朋友，这条消息会点亮两个人的一天。",
    (6, "人际"): "人际关系修复窗口。一句真诚的「上次的事谢谢你」，比任何礼物都更有温度。",
    (5, "人际"): "适合深度社交。约一个信任的人喝杯咖啡，分享最近的困惑，1+1 的智慧远大于 2。",
    (4, "人际"): "关系稳定期。在社交群中分享一条有价值的信息，默默的贡献会被记住。",
    (3, "人际"): "容易产生误解的日子。重要对话用语音而非文字，语气能消除 80% 的歧义。",
    (2, "人际"): "人际能量低迷。今天适合独处充电，不必强迫自己社交。真正的朋友不会因为你休息一天而离开。",
    (1, "人际"): "人际冲突预防日。如果有人让你不舒服，先在心里默数十个数，回应方式会完全不同。",
    # ── 出行 ──────────────────────────────────────
    (7, "出行"): "出行大吉，一路顺风。随身带一件红色小物，既是装饰也是护身，旅途中的小确幸会接踵而至。",
    (6, "出行"): "出行顺利，但别忘检查充电宝和证件。提前十五分钟到达，从容感会让你发现旅途中被忽略的美好。",
    (5, "出行"): "适合短途出行。带上耳机和一本薄书，旅途的每一站都是阅读的好时光。",
    (4, "出行"): "中规中矩的出行日。查好路线再出发，导航的蓝色路线是最忠实的旅伴。",
    (3, "出行"): "交通可能有小延误。预留 20 分钟的缓冲时间，带点零食，等待的时间也可以很惬意。",
    (2, "出行"): "非必要不长途出行。如果必须出门，选择公共交通而非自驾，安全系数更高。",
    (1, "出行"): "今日宜静不宜动。把出行计划推迟一天，今天待在熟悉的地方反而会收获意外惊喜。",
}


# ── 动态种子算法 ──────────────────────────────────────────────────────────────

def _dynamic_seed(user_id: str, draw_date: date) -> int:
    """
    根据 user_id + 日期生成确定性种子。
    同一用户同一天每次抽签结果相同（"感应"到的今日能量），不同用户各不相同。
    """
    raw = f"{user_id}:{draw_date.isoformat()}"
    digest = hashlib.sha256(raw.encode()).hexdigest()[:16]
    return int(digest, 16)


def _seeded_fortune(seed: int) -> dict:
    """基于种子的加权随机抽取签文（同一种子 → 同一结果）"""
    rng = random.Random(seed)
    weights = [f["weight"] for f in FORTUNES]
    return rng.choices(FORTUNES, weights=weights, k=1)[0]


def _seeded_wisdom(seed: int) -> dict:
    """基于种子抽取心学金句"""
    rng = random.Random(seed + 1)
    return rng.choice(WISDOM_QUOTES)


def _seeded_theme(seed: int) -> str:
    """基于种子抽取今日主题"""
    rng = random.Random(seed + 2)
    return rng.choice(THEMES)


def _generate_ai_insight(fortune_level: int, theme: str, seed: int) -> str:
    """从 AI_INSIGHTS 库中获取对应运势×主题的行动指引"""
    key = (fortune_level, theme)
    if key in AI_INSIGHTS:
        return AI_INSIGHTS[key]
    # fallback: 使用 level 4（吉）的通用指引
    fallback_keys = [(4, t) for t in THEMES]
    rng = random.Random(seed + 3)
    fb = rng.choice(fallback_keys)
    return AI_INSIGHTS.get(fb, "静心感受今日能量，跟随内心的良知指引行动。")


class DrawRequest(BaseModel):
    use_free: bool = True


class ShareRequest(BaseModel):
    divination_id: str


@router.get("/share/{record_id}")
async def get_share(
    record_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取分享签文数据（公开接口）"""
    result = await db.execute(
        select(DivinationRecord).where(DivinationRecord.id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="签文不存在")

    # 获取用户信息
    user_name = None
    seat_no = None
    referral_code = None
    is_founder = False
    if record.user_id:
        user_result = await db.execute(select(User).where(User.id == record.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            user_name = user.display_name or user.email.split("@")[0]
            seat_no = user.founder_seat_no
            referral_code = user.referral_code
            is_founder = user.is_founder

    fortune_data = next((f for f in FORTUNES if f["fortune"] == record.fortune), FORTUNES[3])

    return {
        "id": record.id,
        "fortune": record.fortune,
        "fortune_level": fortune_data["level"],
        "wisdom_quote": record.wisdom_quote,
        "author": "王阳明",
        "theme": record.theme,
        "ai_insight": record.ai_insight,
        "user_name": user_name,
        "seat_no": seat_no,
        "is_founder": is_founder,
        "referral_code": referral_code,
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }


@router.get("/today-status")
async def today_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """查询今日是否还有免费抽签"""
    today = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(func.count(DivinationRecord.id)).where(
            DivinationRecord.user_id == current_user.id,
            func.date(DivinationRecord.created_at) == today,
        )
    )
    count = result.scalar() or 0
    return {"is_free": count == 0, "today_count": count}


@router.post("/draw")
async def draw(
    req: DrawRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    抽签（Phase 2: 动态感应种子 + AI 深度解析）
    同一用户同一天的结果由 user_id + date 哈希确定，
    不同用户看到不同的"星象感应"。

    已登录用户今日已抽过 → 直接返回今日结果，不再扣星尘。
    """
    today = datetime.now(timezone.utc).date()

    # ── 检查今日是否已抽过 ────────────────────────────────────────────────
    existing_result = await db.execute(
        select(DivinationRecord).where(
            DivinationRecord.user_id == current_user.id,
            func.date(DivinationRecord.created_at) == today,
        ).order_by(DivinationRecord.created_at.desc())
    )
    existing = existing_result.scalars().first()

    if existing:
        # 今日已抽过 → 直接返回，不扣星尘
        return {
            "id": existing.id,
            "fortune": existing.fortune,
            "fortune_level": FORTUNE_LEVEL.get(existing.fortune, 4),
            "wisdom_quote": existing.wisdom_quote,
            "author": "王阳明",
            "theme": existing.theme,
            "ai_insight": existing.ai_insight,
            "is_free": True,
            "stardust_cost": 0,
            "balance_after": current_user.stardust_balance,
        }

    # ── 今日首次抽签（免费） ──────────────────────────────────────────────
    seed = _dynamic_seed(str(current_user.id), today)
    fortune_data = _seeded_fortune(seed)
    wisdom_data = _seeded_wisdom(seed)
    theme = _seeded_theme(seed)
    ai_insight = _generate_ai_insight(fortune_data["level"], theme, seed)

    session_id = str(uuid.uuid4())[:8]

    record = DivinationRecord(
        user_id=current_user.id,
        session_id=session_id,
        fortune=fortune_data["fortune"],
        wisdom_quote=wisdom_data["quote"],
        theme=theme,
        ai_insight=ai_insight,
        is_free=True,
        stardust_cost=0,
    )
    db.add(record)
    await db.commit()

    return {
        "id": record.id,
        "fortune": fortune_data["fortune"],
        "fortune_level": fortune_data["level"],
        "wisdom_quote": wisdom_data["quote"],
        "author": wisdom_data["author"],
        "theme": theme,
        "ai_insight": ai_insight,
        "is_free": True,
        "stardust_cost": 0,
        "balance_after": current_user.stardust_balance,
    }


@router.post("/share")
async def share(
    req: ShareRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """生成分享链接（Phase 2: 分享即赠星尘）

    规则：每天分享 1 次获得 5 颗星尘奖励。
    分享链接始终生成，但星尘奖励受每日次数限制。
    """
    result = await db.execute(
        select(DivinationRecord).where(
            DivinationRecord.id == req.divination_id,
            DivinationRecord.user_id == current_user.id,
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="签文不存在")

    # ── 1. 先统计今日已分享次数（不含本次），再决定是否奖励 ──
    today = datetime.now(timezone.utc).date()
    share_count_result = await db.execute(
        select(func.count(DivinationRecord.id)).where(
            DivinationRecord.user_id == current_user.id,
            DivinationRecord.shared == True,
            func.date(DivinationRecord.created_at) == today,
        )
    )
    already_shared_today = share_count_result.scalar() or 0

    share_reward = 0
    if already_shared_today < 1:
        # 在限额内，奖励 5 颗星尘（行级锁防并发）
        share_reward = 5
        user_result = await db.execute(
            select(User).where(User.id == current_user.id).with_for_update()
        )
        user = user_result.scalar_one()
        user.stardust_balance += share_reward
        user.stardust_lifetime_earned += share_reward

        tx = CreditTransaction(
            user_id=user.id,
            amount=share_reward,
            balance_after=user.stardust_balance,
            reason="divination_share",
            reference_id=record.id,
            status="confirmed",
        )
        db.add(tx)

    # ── 2. 标记为已分享（无论是否获得奖励，链接都可以生成） ──
    record.shared = True
    await db.commit()

    share_url = f"https://khanfate.com/divination/share/{record.id}"

    # 重新读取用户余额以返回准确值
    refreshed = await db.execute(select(User).where(User.id == current_user.id))
    final_user = refreshed.scalar_one()

    return {
        "share_url": share_url,
        "share_reward": share_reward,
        "balance_after": final_user.stardust_balance,
        "today_share_count": already_shared_today + 1,
    }
