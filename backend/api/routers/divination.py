"""星际抽签系统 API — Phase 2: 动态感应种子 + AI 深度解析"""
import hashlib
import random
import uuid
from datetime import datetime, timezone, date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
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

# ── 英文翻译 ──────────────────────────────────────────────────────────────

FORTUNE_EN = {
    "大吉": "Great Blessing",
    "中吉": "Good Fortune",
    "小吉": "Mild Fortune",
    "吉": "Auspicious",
    "末吉": "Moderate",
    "凶": "Inauspicious",
    "大凶": "Great Misfortune",
}

THEME_EN = {
    "事业": "Career",
    "感情": "Love",
    "财运": "Wealth",
    "健康": "Health",
    "学业": "Studies",
    "人际": "Social",
    "出行": "Travel",
}

# 王阳明心学金句库
WISDOM_QUOTES = [
    {"quote": "你未看此花时，此花与汝心同归于寂；你来看此花时，则此花颜色一时明白起来。", "author": "王阳明",
     "quote_en": "Before you looked at this flower, it and your mind were both in silence. When you came to see it, the flower's color became vivid all at once.", "author_en": "Wang Yangming"},
    {"quote": "此心光明，亦复何言。", "author": "王阳明",
     "quote_en": "This heart is luminous — what more is there to say?", "author_en": "Wang Yangming"},
    {"quote": "知而不行，只是未知。", "author": "王阳明",
     "quote_en": "To know but not act is simply not to know.", "author_en": "Wang Yangming"},
    {"quote": "破山中贼易，破心中贼难。", "author": "王阳明",
     "quote_en": "It is easy to defeat the thieves in the mountains, but hard to conquer the thieves in one's heart.", "author_en": "Wang Yangming"},
    {"quote": "立志用功，如种树然。方其根芽，犹未有干；及其有干，尚未有枝；枝而后叶，叶而后花、实。", "author": "王阳明",
     "quote_en": "Setting your will and working hard is like planting a tree. When the roots first sprout, there is no trunk yet; when the trunk appears, there are no branches yet; branches come before leaves, and leaves before flowers and fruit.", "author_en": "Wang Yangming"},
    {"quote": "人须在事上磨，方能立得住；方能静亦定、动亦定。", "author": "王阳明",
     "quote_en": "One must be tempered by real affairs to stand firm — to be steady both in stillness and in action.", "author_en": "Wang Yangming"},
    {"quote": "无善无恶心之体，有善有恶意之动，知善知恶是良知，为善去恶是格物。", "author": "王阳明",
     "quote_en": "The substance of the mind is beyond good and evil; good and evil arise from the movement of intention; knowing good from evil is innate moral knowing; doing good and removing evil is the investigation of things.", "author_en": "Wang Yangming"},
    {"quote": "持志如心痛，一心在痛上，岂有工夫说闲话、管闲事？", "author": "王阳明",
     "quote_en": "Hold fast to your aspiration as if your heart aches — with your whole mind on the ache, how could you have time for idle talk or meddling?", "author_en": "Wang Yangming"},
    {"quote": "人人自有定盘针，万化根源总在心。却笑从前颠倒见，枝枝叶叶外头寻。", "author": "王阳明",
     "quote_en": "Everyone has their own compass within; the root of all transformation lies in the heart. Laugh at how you once sought it outside among branches and leaves.", "author_en": "Wang Yangming"},
    {"quote": "个个人心有仲尼，自将闻见苦遮迷。而今指与真头面，只是良知更莫疑。", "author": "王阳明",
     "quote_en": "In every person's heart dwells a sage like Confucius, yet sensory knowledge obscures it. Now pointing to your true face — it is nothing but innate moral knowing, beyond all doubt.", "author_en": "Wang Yangming"},
    {"quote": "君子之学，非有同志之友日相规切，则亦易以悠悠度日，而不见其过。", "author": "王阳明",
     "quote_en": "In the gentleman's learning, without friends of shared purpose to admonish and refine each day, it is easy to drift through life without seeing one's own faults.", "author_en": "Wang Yangming"},
    {"quote": "不可以一时之得意，而自夸其能；亦不可以一时之失意，而自坠其志。", "author": "王阳明",
     "quote_en": "Do not boast of your ability in a moment of success, nor abandon your aspirations in a moment of failure.", "author_en": "Wang Yangming"},
    {"quote": "人人自有定盘针，万化根源总在心。", "author": "王阳明",
     "quote_en": "Everyone has their own inner compass; the root of all change lies within the heart.", "author_en": "Wang Yangming"},
    {"quote": "此心不动，随机而动。", "author": "王阳明",
     "quote_en": "This mind does not move — yet it moves in response to circumstances.", "author_en": "Wang Yangming"},
    {"quote": "致良知是学问大头脑，是圣人教人第一义。", "author": "王阳明",
     "quote_en": "Extending innate moral knowing is the essence of learning and the foremost principle taught by the sages.", "author_en": "Wang Yangming"},
    {"quote": "夫学，天下之公学也，非朱子可得而私也，非孔子可得而私也。", "author": "王阳明",
     "quote_en": "Learning belongs to all under heaven — it cannot be claimed as private property by Zhu Xi, nor by Confucius.", "author_en": "Wang Yangming"},
    {"quote": "不贵于无过，而贵于能改过。", "author": "王阳明",
     "quote_en": "What matters is not being without fault, but being able to correct one's faults.", "author_en": "Wang Yangming"},
    {"quote": "谦虚其心，宏大其量。", "author": "王阳明",
     "quote_en": "Keep the mind humble and the heart generous.", "author_en": "Wang Yangming"},
    {"quote": "千圣皆过影，良知乃吾师。", "author": "王阳明",
     "quote_en": "A thousand sages are but passing shadows; innate moral knowing alone is my teacher.", "author_en": "Wang Yangming"},
    {"quote": "人生大病，只是一傲字。", "author": "王阳明",
     "quote_en": "The greatest ailment of life is nothing but the word 'pride'.", "author_en": "Wang Yangming"},
    {"quote": "种树者必培其根，种德者必养其心。", "author": "王阳明",
     "quote_en": "One who plants a tree must nourish its roots; one who cultivates virtue must nurture the heart.", "author_en": "Wang Yangming"},
    {"quote": "为学须有本原，须从本原上用力。", "author": "王阳明",
     "quote_en": "Learning must have a foundation, and effort must be applied at the root.", "author_en": "Wang Yangming"},
    {"quote": "圣人之道，吾性自足，向之求理于事物者误也。", "author": "王阳明",
     "quote_en": "The way of the sage is already complete in our nature — to seek principle in external things was the mistake.", "author_en": "Wang Yangming"},
    {"quote": "心即理也。天下又有心外之事，心外之理乎？", "author": "王阳明",
     "quote_en": "The mind is principle itself. Can there be affairs or principles beyond the mind?", "author_en": "Wang Yangming"},
    {"quote": "你的心，决定你的世界。", "author": "王阳明",
     "quote_en": "Your heart determines your world.", "author_en": "Wang Yangming"},
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

# ── English AI Insights ──────────────────────────────────────────────────

AI_INSIGHTS_EN = {
    # ── Career ──────────────────────────────────────
    (7, "Career"): "Stellar alignment opens wide — your benefactor is to the east. Take the initiative today, present your proposal. Leadership is waiting for a bold voice.",
    (6, "Career"): "Jupiter enters your house — teamwork energy is abundant. Break core tasks into three steps; complete the first before noon and the rest will flow naturally.",
    (5, "Career"): "Undercurrents run strong but the direction is clear. Focus on the most urgent task, block out distractions, and deliver a draft before 3 PM.",
    (4, "Career"): "A steady progress day, perfect for reviewing this week's milestones. List three things you've accomplished — the accumulation is richer than you think.",
    (3, "Career"): "Resistance comes from miscommunication. Say important things in person — text is easily misread. Schedule a brief sync meeting this afternoon.",
    (2, "Career"): "Not the day for confrontation. Step back, reorganize your thoughts, archive unfinished documents, and build energy for the next window.",
    (1, "Career"): "Pausing is strategy. Turn off notifications, spend two hours in deep reflection on the direction you truly want. Answers emerge in silence.",
    # ── Love ──────────────────────────────────────
    (7, "Love"): "Romance is blossoming — a small gesture from the other person signals interest. Respond proactively; today's sincere conversation will become a turning point.",
    (6, "Love"): "Emotional warmth is rising. Prepare a small token — it needn't be expensive. A handwritten line holds more power than gold.",
    (5, "Love"): "Listen rather than speak today. Give someone twenty uninterrupted minutes, and you'll discover tenderness that was overlooked.",
    (4, "Love"): "Simplicity is real strength. Do an ordinary thing together — a walk, cooking a meal — rapport grows in quiet moments.",
    (3, "Love"): "Emotions fluctuate today. Avoid making judgments on impulse. Take three deep breaths before replying, and your words will be twice as gentle.",
    (2, "Love"): "Today's keyword is 'space.' Spend two hours apart before meeting again — distance will help clarify your true feelings.",
    (1, "Love"): "The heart needs self-repair. Write down three things you're grateful for about the other person; once resentment dissolves, love will flow again.",
    # ── Wealth ──────────────────────────────────────
    (7, "Wealth"): "Windfall star enters your destiny — chance of unexpected gain is high. Watch for collaboration invitations; a project discussed over coffee may exceed expectations.",
    (6, "Wealth"): "Steady income energy — ideal for handling bills and budgets. Check for a forgotten subscription; the compound savings each month is remarkable.",
    (5, "Wealth"): "Spending desire rises but judgment holds. Put items in your cart and wait 24 hours — 80% of impulses fade naturally.",
    (4, "Wealth"): "Break-even day. Open your expense tracker, analyze this month's spending structure, and find that 'invisible leak.'",
    (3, "Wealth"): "Avoid large expenditures. Cut the budget by 20% and replan — you'll find core needs are already met.",
    (2, "Wealth"): "Money energy hits a low. Today, only make 'necessary' purchases and resist every 'limited-time offer' temptation.",
    (1, "Wealth"): "Protecting what you have is earning. Turn off all spending alerts — today's restraint lays the foundation for future abundance.",
    # ── Health ──────────────────────────────────────
    (7, "Health"): "Peak physical condition — perfect for trying a new sport. Your body craves release; run five kilometers outdoors and let endorphins surprise you.",
    (6, "Health"): "Good bodily state — focus on sleep quality. Be in bed by 10 PM, screens off before sleep, and tomorrow's energy will double.",
    (5, "Health"): "Shoulders and neck are sending signals. Move for five minutes every 50 minutes of work; warm water refreshes better than coffee.",
    (4, "Health"): "Balance day. Eat three meals on time, keep protein above 1.2g per kilogram of body weight — your body will thank you.",
    (3, "Health"): "Immunity fluctuation period. Supplement vitamin C and prioritize充足 sleep — the lowest-cost recovery plan.",
    (2, "Health"): "Your body demands rest. Postpone high-intensity schedules, soak feet in hot water for 15 minutes, and reboot circulation.",
    (1, "Health"): "Today calls for fasting recovery. Keep meals light, let the digestive system rest for a day — tomorrow you'll feel much lighter.",
    # ── Studies ──────────────────────────────────────
    (7, "Studies"): "Comprehension peaks — tackle the hardest chapter. Three hours of deep reading today will become the intellectual foundation for the next three months.",
    (6, "Studies"): "Memory is at its height. Use the Feynman technique — explain today's concept to someone; what you can explain clearly is what you truly understand.",
    (5, "Studies"): "Focus needs ritual. Tidy your desk, pour a glass of water, start a timer — a 25-minute Pomodoro is just right.",
    (4, "Studies"): "Review rather than learn new material. Flip through last week's notes, mark 'mastered' and 'blurry areas' in different colors for precise gap-filling.",
    (3, "Studies"): "A knowledge bottleneck appears. Don't grind — switch methods: video, podcast, or ask a classmate. A different path reaches the same goal.",
    (2, "Studies"): "Efficiency dip day. Lower targets to 60% of normal — completion is enough. Allow yourself one day out of peak form.",
    (1, "Studies"): "Today is not for learning new things. Close the books, go for a walk — inspiration sometimes arrives when you relax.",
    # ── Social ──────────────────────────────────────
    (7, "Social"): "Social energy overflows. Reach out to a friend you haven't contacted in a while — that message will brighten both your days.",
    (6, "Social"): "A window for relationship repair. A sincere 'thank you for last time' warms more than any gift.",
    (5, "Social"): "Ideal for deep socializing. Meet a trusted friend for coffee, share recent confusions — the wisdom of 1+1 far exceeds 2.",
    (4, "Social"): "Stable relationship period. Share valuable information in your social circle — quiet contributions are remembered.",
    (3, "Social"): "Misunderstandings arise easily. Use voice instead of text for important conversations — tone eliminates 80% of ambiguity.",
    (2, "Social"): "Social energy dips. Today is for solitary recharging — no need to force socialization. True friends won't leave because you take a day off.",
    (1, "Social"): "Conflict prevention day. If someone makes you uncomfortable, silently count to ten before responding — your approach will be entirely different.",
    # ── Travel ──────────────────────────────────────
    (7, "Travel"): "Excellent travel fortune — smooth journey ahead. Carry a small red item as both ornament and talisman; little joys along the way will follow one after another.",
    (6, "Travel"): "Smooth travel, but don't forget to check your power bank and documents. Arrive fifteen minutes early — the sense of ease will help you notice beauty you'd otherwise miss.",
    (5, "Travel"): "Suited for short trips. Bring headphones and a thin book — every stop along the way is a great time to read.",
    (4, "Travel"): "An unremarkable travel day. Plan your route before departure — the blue line on your map is your most faithful companion.",
    (3, "Travel"): "Minor delays possible. Build in a 20-minute buffer, bring snacks — even waiting can be pleasant.",
    (2, "Travel"): "Avoid long-distance travel unless necessary. If you must go out, choose public transit over driving for higher safety.",
    (1, "Travel"): "Today favors stillness over movement. Postpone travel plans by one day — staying in familiar surroundings may bring unexpected surprises.",
}

# ── Translation helper ──────────────────────────────────────────────────

def _translate_fortune(fortune_zh: str, lang: str) -> str:
    if lang == "en":
        return FORTUNE_EN.get(fortune_zh, fortune_zh)
    return fortune_zh

def _translate_theme(theme_zh: str, lang: str) -> str:
    if lang == "en":
        return THEME_EN.get(theme_zh, theme_zh)
    return theme_zh

def _translate_wisdom(quote_data: dict, lang: str) -> dict:
    if lang == "en":
        return {
            "quote": quote_data.get("quote_en", quote_data["quote"]),
            "author": quote_data.get("author_en", quote_data["author"]),
        }
    return {"quote": quote_data["quote"], "author": quote_data["author"]}

def _translate_insight(fortune_level: int, theme_zh: str, lang: str) -> str:
    if lang == "en":
        theme_en = THEME_EN.get(theme_zh, theme_zh)
        return AI_INSIGHTS_EN.get((fortune_level, theme_en), AI_INSIGHTS_EN.get((4, theme_en), "Stay centered and follow your inner moral compass today."))
    return AI_INSIGHTS.get((fortune_level, theme_zh), AI_INSIGHTS.get((4, theme_zh), "静心感受今日能量，跟随内心的良知指引行动。"))


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
    lang: str = Query("zh"),
    db: AsyncSession = Depends(get_db),
):
    """获取分享签文数据（公开接口）"""
    result = await db.execute(
        select(DivinationRecord).where(DivinationRecord.id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="签文不存在")

    # 获取用户信息 (only public fields — no PII like seat_no or referral_code)
    user_name = None
    is_founder = False
    if record.user_id:
        user_result = await db.execute(select(User).where(User.id == record.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            user_name = user.display_name or user.email.split("@")[0]
            is_founder = user.is_founder

    fortune_data = next((f for f in FORTUNES if f["fortune"] == record.fortune), FORTUNES[3])

    return {
        "id": record.id,
        "fortune": _translate_fortune(record.fortune, lang),
        "fortune_level": fortune_data["level"],
        "wisdom_quote": record.wisdom_quote if lang == "zh" else None,
        "wisdom_quote_en": record.wisdom_quote,
        "author": "Wang Yangming" if lang == "en" else "王阳明",
        "theme": _translate_theme(record.theme, lang),
        "ai_insight": _translate_insight(fortune_data["level"], record.theme, lang),
        "user_name": user_name,
        "is_founder": is_founder,
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


@router.get("/today-result")
async def today_result(
    lang: str = Query("zh"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """获取今日已有抽签结果（已抽过直接返回，未抽过返回空）"""
    today = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(DivinationRecord).where(
            DivinationRecord.user_id == current_user.id,
            func.date(DivinationRecord.created_at) == today,
        ).order_by(DivinationRecord.created_at.desc())
    )
    record = result.scalars().first()
    if not record:
        return {"has_drawn": False}

    fortune_level = FORTUNE_LEVEL.get(record.fortune, 4)

    return {
        "has_drawn": True,
        "id": record.id,
        "fortune": _translate_fortune(record.fortune, lang),
        "fortune_level": fortune_level,
        "wisdom_quote": record.wisdom_quote if lang == "zh" else None,
        "wisdom_quote_en": record.wisdom_quote,
        "author": "Wang Yangming" if lang == "en" else "王阳明",
        "theme": _translate_theme(record.theme, lang),
        "ai_insight": _translate_insight(fortune_level, record.theme, lang),
        "is_free": True,
        "stardust_cost": 0,
        "balance_after": current_user.stardust_balance,
        "shared": record.shared,
    }


@router.post("/draw")
async def draw(
    req: DrawRequest,
    lang: str = Query("zh"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    抽签（Phase 2: 动态感应种子 + AI 深度解析）
    同一用户同一天的结果由 user_id + date 哈希确定，
    不同用户看到不同的"星象感应"。

    首次抽签免费，额外抽签消耗 1 星尘（会员/创始会员免费）。
    """
    today = datetime.now(timezone.utc).date()
    STARDUST_COST_DIVINATION = 1

    # ── 检查今日是否已抽过 ────────────────────────────────────────────────
    existing_result = await db.execute(
        select(DivinationRecord).where(
            DivinationRecord.user_id == current_user.id,
            func.date(DivinationRecord.created_at) == today,
        ).order_by(DivinationRecord.created_at.desc())
    )
    existing = existing_result.scalars().first()

    if existing:
        if req.use_free:
            # 今日已抽过 → 直接返回已有结果，不扣星尘
            fortune_level = FORTUNE_LEVEL.get(existing.fortune, 4)
            return {
                "id": existing.id,
                "fortune": _translate_fortune(existing.fortune, lang),
                "fortune_level": fortune_level,
                "wisdom_quote": existing.wisdom_quote if lang == "zh" else None,
                "wisdom_quote_en": existing.wisdom_quote,
                "author": "Wang Yangming" if lang == "en" else "王阳明",
                "theme": _translate_theme(existing.theme, lang),
                "ai_insight": _translate_insight(fortune_level, existing.theme, lang),
                "is_free": True,
                "stardust_cost": 0,
                "balance_after": current_user.stardust_balance,
            }

        # ── 额外抽签 → 扣费 1 星尘 ──────────────────────────────────────
        # 会员/创始会员免费
        if current_user.is_founder or current_user.is_premium:
            actual_cost = 0
        else:
            actual_cost = STARDUST_COST_DIVINATION

        new_balance = current_user.stardust_balance
        if actual_cost > 0:
            user_result = await db.execute(
                select(User).where(User.id == current_user.id).with_for_update()
            )
            user = user_result.scalar_one()
            if user.stardust_balance < actual_cost:
                raise HTTPException(
                    status_code=402,
                    detail=f"星尘不足: 需要 {actual_cost}，当前 {user.stardust_balance}",
                )
            user.stardust_balance -= actual_cost
            tx = CreditTransaction(
                user_id=user.id,
                amount=-actual_cost,
                balance_after=user.stardust_balance,
                reason="divination",
                reference_id=None,
                status="confirmed",
            )
            db.add(tx)
            new_balance = user.stardust_balance

        # 用今日抽签次数作为额外种子变量，产生不同结果
        today_count_result = await db.execute(
            select(func.count(DivinationRecord.id)).where(
                DivinationRecord.user_id == current_user.id,
                func.date(DivinationRecord.created_at) == today,
            )
        )
        today_count = today_count_result.scalar() or 0

        seed = _dynamic_seed(str(current_user.id), today)
        # 将今日抽签次数混入种子，使每次结果不同
        extra_seed = hashlib.sha256(f"{seed}_{today_count}".encode()).hexdigest()
        fortune_data = _seeded_fortune(extra_seed)
        wisdom_data = _seeded_wisdom(extra_seed)
        theme = _seeded_theme(extra_seed)
        ai_insight = _generate_ai_insight(fortune_data["level"], theme, extra_seed)

        session_id = str(uuid.uuid4())[:8]
        record = DivinationRecord(
            user_id=current_user.id,
            session_id=session_id,
            fortune=fortune_data["fortune"],
            wisdom_quote=wisdom_data["quote"],
            theme=theme,
            ai_insight=ai_insight,
            is_free=False,
            stardust_cost=actual_cost,
        )
        db.add(record)
        await db.commit()

        return {
            "id": record.id,
            "fortune": _translate_fortune(fortune_data["fortune"], lang),
            "fortune_level": fortune_data["level"],
            "wisdom_quote": wisdom_data["quote"] if lang == "zh" else None,
            "wisdom_quote_en": wisdom_data["quote"],
            "author": wisdom_data.get("author_en", wisdom_data["author"]) if lang == "en" else wisdom_data["author"],
            "theme": _translate_theme(theme, lang),
            "ai_insight": _translate_insight(fortune_data["level"], theme, lang),
            "is_free": False,
            "stardust_cost": actual_cost,
            "balance_after": new_balance,
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
        "fortune": _translate_fortune(fortune_data["fortune"], lang),
        "fortune_level": fortune_data["level"],
        "wisdom_quote": wisdom_data["quote"] if lang == "zh" else None,
        "wisdom_quote_en": wisdom_data["quote"],
        "author": wisdom_data.get("author_en", wisdom_data["author"]) if lang == "en" else wisdom_data["author"],
        "theme": _translate_theme(theme, lang),
        "ai_insight": _translate_insight(fortune_data["level"], theme, lang),
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

    # ── 1. 先锁用户行，再统计今日已分享次数，确保 check+grant 原子 ──
    user_result = await db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    )
    user = user_result.scalar_one()

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
        # 在限额内，奖励 5 颗星尘（行级锁已在上面获取，防并发）
        share_reward = 5
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
