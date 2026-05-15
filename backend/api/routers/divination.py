"""星际抽签系统 API"""
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


def _weighted_fortune() -> dict:
    """根据权重随机抽取签文"""
    weights = [f["weight"] for f in FORTUNES]
    return random.choices(FORTUNES, weights=weights, k=1)[0]


def _random_wisdom() -> dict:
    """随机抽取一条心学金句"""
    return random.choice(WISDOM_QUOTES)


def _random_theme() -> str:
    return random.choice(THEMES)


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
    if record.user_id:
        user_result = await db.execute(select(User).where(User.id == record.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            user_name = user.display_name or user.email.split("@")[0]
            seat_no = user.founder_seat_no
            referral_code = user.referral_code

    fortune_data = next((f for f in FORTUNES if f["fortune"] == record.fortune), FORTUNES[3])

    return {
        "id": record.id,
        "fortune": record.fortune,
        "fortune_level": fortune_data["level"],
        "wisdom_quote": record.wisdom_quote,
        "author": "王阳明",
        "theme": record.theme,
        "user_name": user_name,
        "seat_no": seat_no,
        "referral_code": referral_code,
    }


@router.get("/today-status")
async def today_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """查询今日是否还有免费抽签"""
    today = date.today()
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
    """抽签"""
    today = date.today()

    # 检查今日是否已免费抽过
    count_result = await db.execute(
        select(func.count(DivinationRecord.id)).where(
            DivinationRecord.user_id == current_user.id,
            func.date(DivinationRecord.created_at) == today,
        )
    )
    today_count = count_result.scalar() or 0
    is_free = today_count == 0
    stardust_cost = 0

    # 非免费则扣星尘
    if not is_free:
        stardust_cost = 1
        user_result = await db.execute(
            select(User).where(User.id == current_user.id).with_for_update()
        )
        user = user_result.scalar_one()

        if user.stardust_balance < stardust_cost:
            raise HTTPException(
                status_code=402,
                detail="星尘不足，无法继续抽签"
            )

        user.stardust_balance -= stardust_cost

        tx = CreditTransaction(
            user_id=user.id,
            amount=-stardust_cost,
            balance_after=user.stardust_balance,
            reason="divination",
            status="confirmed",
        )
        db.add(tx)

    # 抽签
    fortune_data = _weighted_fortune()
    wisdom_data = _random_wisdom()
    theme = _random_theme()

    session_id = str(uuid.uuid4())[:8]

    record = DivinationRecord(
        user_id=current_user.id,
        session_id=session_id,
        fortune=fortune_data["fortune"],
        wisdom_quote=wisdom_data["quote"],
        theme=theme,
        is_free=is_free,
        stardust_cost=stardust_cost,
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
        "is_free": is_free,
        "stardust_cost": stardust_cost,
        "balance_after": current_user.stardust_balance if is_free else current_user.stardust_balance,
    }


@router.post("/share")
async def share(
    req: ShareRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """生成分享链接"""
    result = await db.execute(
        select(DivinationRecord).where(
            DivinationRecord.id == req.divination_id,
            DivinationRecord.user_id == current_user.id,
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="签文不存在")

    record.shared = True
    await db.commit()

    # 生成分享 URL（前端可基于此生成图片卡片）
    share_url = f"https://khanfate.com/divination/share/{record.id}"

    return {"share_url": share_url}
