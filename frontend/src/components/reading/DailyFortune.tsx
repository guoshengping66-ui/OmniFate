"use client"
import { useState, useEffect } from "react"
import { Link } from "@/i18n/navigation"
import { Sparkles, TrendingUp, TrendingDown, Minus, Heart, Briefcase, Wallet, Activity, AlertTriangle, Palette, Hash, ArrowRight, User } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { api, getPersonalizedFortune } from "@/lib/api"

interface FortuneData {
  overall: number
  wealth: number
  career: number
  love: number
  health: number
  lucky_color_idx: number
  lucky_color_name?: string
  lucky_number: number
  advice_idx: number
  warning_idx: number
  personalized?: boolean
}

interface PersonalizedFortune {
  overall_score: number
  wealth_fortune: number
  career_fortune: number
  love_fortune: number
  health_fortune: number
  lucky_color: string
  lucky_number: number
  advice: string
  warning: string
  personalized?: boolean
}

// Client-side pseudo-random daily status (for non-logged-in users)
function generateFortune(): FortuneData {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const hash = (n: number) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 49297
    return x - Math.floor(x)
  }
  const score = (base: number, variance: number) =>
    Math.round(Math.max(1, Math.min(10, base + (hash(variance) - 0.5) * variance)))

  return {
    overall: score(6, 4),
    wealth: score(5, 5),
    career: score(6, 4),
    love: score(5, 5),
    health: score(6, 3),
    lucky_color_idx: Math.floor(hash(100) * 9),
    lucky_number: Math.floor(hash(200) * 9) + 1,
    advice_idx: Math.floor(hash(300) * 10),
    warning_idx: Math.floor(hash(400) * 10),
  }
}

const COLOR_KEYS = [
  "fortune.color.gold", "fortune.color.red", "fortune.color.blue",
  "fortune.color.green", "fortune.color.purple", "fortune.color.white",
  "fortune.color.black", "fortune.color.pink", "fortune.color.orange",
] as const

const COLOR_HEX = ["#C9A84C", "#E63946", "#2980B9", "#52B788", "#9B59B6", "#E8E8E8", "#333333", "#F472B6", "#F97316"]

// Backend personalized color mapping
const COLOR_NAME_HEX: Record<string, string> = {
  "金色": "#C9A84C", "红色": "#E63946", "蓝色": "#2980B9",
  "绿色": "#52B788", "翠绿": "#52B788", "青色": "#2ECC71",
  "紫色": "#9B59B6", "白色": "#E8E8E8", "黑色": "#333333",
  "粉色": "#F472B6", "橙色": "#F97316", "黄色": "#EAB308",
  "银色": "#94A3B8",
  // English names also map for fallback
  "Gold": "#C9A84C", "Red": "#E63946", "Blue": "#2980B9",
  "Green": "#52B788", "Emerald": "#52B788", "Cyan": "#2ECC71",
  "Purple": "#9B59B6", "White": "#E8E8E8", "Black": "#333333",
  "Pink": "#F472B6", "Orange": "#F97316", "Yellow": "#EAB308",
  "Silver": "#94A3B8",
}

// Translate Chinese color names to English
const COLOR_NAME_EN: Record<string, string> = {
  "金色": "Gold", "红色": "Red", "蓝色": "Blue", "绿色": "Green",
  "翠绿": "Emerald", "青色": "Cyan", "紫色": "Purple", "白色": "White",
  "黑色": "Black", "粉色": "Pink", "橙色": "Orange", "黄色": "Yellow", "银色": "Silver",
}

const ADVICE_KEYS = [
  "fortune.advice.1", "fortune.advice.2", "fortune.advice.3",
  "fortune.advice.4", "fortune.advice.5", "fortune.advice.6",
  "fortune.advice.7", "fortune.advice.8", "fortune.advice.9",
  "fortune.advice.10",
] as const

const WARNING_KEYS = [
  "fortune.warning.1", "fortune.warning.2", "fortune.warning.3",
  "fortune.warning.4", "fortune.warning.5", "fortune.warning.6",
  "fortune.warning.7", "fortune.warning.8", "fortune.warning.9",
  "fortune.warning.10",
] as const

// Localized advice/warning arrays for non-personalized mode
const ADVICE_LOCAL: Record<string, string[]> = {
  zh: [
    "今日适合制定长期规划，把灵感转化为行动步骤。",
    "主动社交能带来意外惊喜，不妨联系一位老朋友。",
    "学习新技能的好时机，专注力处于高峰期。",
    "整理财务状况，检查近期支出是否有优化空间。",
    "适度运动能显著提升今日效率和心情。",
    "创意工作者今日灵感旺盛，适合突破性创作。",
    "与家人共度时光能带来深层的情感满足。",
    "处理积压的邮件和消息，保持沟通畅通。",
    "尝试一种新的饮食或烹饪方式，给味蕾换个心情。",
    "适合安静独处，深度思考能带来重要洞见。",
  ],
  en: [
    "Good day for long-term planning — turn ideas into action steps.",
    "Proactive networking brings surprises — reach out to an old friend.",
    "Peak focus today — ideal for learning a new skill.",
    "Review your finances and look for optimization opportunities.",
    "Moderate exercise boosts productivity and mood significantly.",
    "Creatives have strong inspiration today — perfect for breakthrough work.",
    "Quality time with family brings deep emotional fulfillment.",
    "Clear your inbox and messages — keep communication flowing.",
    "Try a new recipe or cuisine to refresh your senses.",
    "Solitude suits you — deep thinking yields important insights.",
  ],
}

const WARNING_LOCAL: Record<string, string[]> = {
  zh: [
    "避免在情绪激动时做重要决定，给自己10分钟冷静期。",
    "交通出行注意安全，预留充足时间避免匆忙。",
    "不宜借贷或担保，今日财运需要保守策略。",
    "小心言辞，无心之语可能被误解，沟通前多想想。",
    "避免熬夜，今日身体需要充分休息来恢复精力。",
    "网络购物容易冲动消费，把商品加入购物车明天再决定。",
    "不宜签署重要合同，细节容易被忽略。",
    "远离是非之地，今日容易卷入不必要的纷争。",
    "饮食注意清淡，肠胃较为敏感。",
    "减少屏幕使用时间，让眼睛和大脑得到休息。",
  ],
  en: [
    "Avoid important decisions when emotional — give yourself 10 minutes to cool down.",
    "Travel safely — leave extra time to avoid rushing.",
    "Lending or guaranteeing loans is inadvisable today — be conservative.",
    "Watch your words — unintended remarks may be misunderstood.",
    "Avoid staying up late — your body needs proper rest today.",
    "Impulse buying risk is high — add to cart and decide tomorrow.",
    "Signing important contracts is not recommended — details may be overlooked.",
    "Stay away from drama — you may get pulled into unnecessary conflicts.",
    "Eat light — your digestion is sensitive today.",
    "Reduce screen time to give your eyes and brain a break.",
  ],
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-400"
  if (score >= 6) return "text-gold"
  if (score >= 4) return "text-orange-400"
  return "text-red-400"
}

function getScoreHex(score: number): string {
  if (score >= 8) return "#4ade80"
  if (score >= 6) return "#C9A84C"
  if (score >= 4) return "#fb923c"
  return "#f87171"
}

function getScoreLabelKey(score: number) {
  if (score >= 9) return "fortune.score.excellent"
  if (score >= 7) return "fortune.score.good"
  if (score >= 5) return "fortune.score.neutral"
  if (score >= 3) return "fortune.score.low"
  return "fortune.score.poor"
}

/* ─── Circular Gauge SVG ─── */
function GaugeRing({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 10) * circumference
  const color = getScoreHex(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 1.2s ease-out" }}
        />
        {/* Glow overlay */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          opacity={0.3}
          style={{ transition: "stroke-dasharray 1.2s ease-out", filter: "blur(8px)" }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold font-serif ${getScoreColor(score)}`}>{score}</span>
        <span className="text-white/30 text-xs mt-0.5">/10</span>
      </div>
    </div>
  )
}

/* ─── Dimension progress bar ─── */
function DimBar({
  icon, label, score, color, delay,
}: {
  icon: React.ReactNode; label: string; score: number; color: string; delay: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-20 md:w-24 flex-shrink-0">
        <span style={{ color }} className="opacity-70">{icon}</span>
        <span className="text-white/60 text-sm">{label}</span>
      </div>
      <div className="flex-1 h-3 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score * 10}%`,
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            transition: `width 1s ease-out ${delay}s`,
          }}
        />
      </div>
      <span className="text-white/40 text-xs w-8 text-right font-mono">{score}/10</span>
    </div>
  )
}

interface DailyFortuneProps {
  user?: {
    id?: string
    birth_profiles?: {
      birth_year: number
      birth_month: number
      birth_day: number
      birth_hour: number
    }[]
  } | null
}

export function DailyFortune({ user }: DailyFortuneProps) {
  const { locale, t } = useLanguage()
  const [fortune, setFortune] = useState<FortuneData | null>(null)
  const [personalizedText, setPersonalizedText] = useState<PersonalizedFortune | null>(null)

  useEffect(() => {
    // Try to get personalized fortune from backend
    const birthProfile = user?.birth_profiles?.[0]
    if (birthProfile) {
      getPersonalizedFortune(birthProfile, locale)
        .then(data => {
          if (data && data.personalized) {
            setPersonalizedText(data)
            setFortune({
              overall: data.overall_score,
              wealth: data.wealth_fortune,
              career: data.career_fortune,
              love: data.love_fortune,
              health: data.health_fortune,
              lucky_color_idx: 0,
              lucky_color_name: data.lucky_color,
              lucky_number: data.lucky_number,
              advice_idx: -1,
              warning_idx: -1,
              personalized: true,
            })
          } else {
            setFortune(generateFortune())
          }
        })
        .catch(() => setFortune(generateFortune()))
    } else {
      setFortune(generateFortune())
    }
  }, [user, locale])

  if (!fortune) return null

  const isZh = locale === "zh"
  const today = new Date()
  const weekdays = t("fortune.weekdays").split(",")
  const weekDay = weekdays[today.getDay()]
  const dateStr = isZh
    ? `${today.getMonth() + 1}月${today.getDate()}日 星期${weekDay}`
    : `${today.toLocaleString("en-US", { month: "short" })} ${today.getDate()}, ${weekDay}`

  const dims = [
    { icon: <Wallet size={14} />, key: "fortune.wealth" as const, score: fortune.wealth, color: "#C9A84C" },
    { icon: <Briefcase size={14} />, key: "fortune.career" as const, score: fortune.career, color: "#52B788" },
    { icon: <Heart size={14} />, key: "fortune.love" as const, score: fortune.love, color: "#E63946" },
    { icon: <Activity size={14} />, key: "fortune.health" as const, score: fortune.health, color: "#2980B9" },
  ]

  // Get lucky color display info
  let colorHex: string
  let colorName: string
  if (fortune.personalized && fortune.lucky_color_name) {
    colorHex = COLOR_NAME_HEX[fortune.lucky_color_name] || "#C9A84C"
    colorName = locale === "zh" ? fortune.lucky_color_name : (COLOR_NAME_EN[fortune.lucky_color_name] || fortune.lucky_color_name)
  } else {
    colorHex = COLOR_HEX[fortune.lucky_color_idx]
    colorName = t(COLOR_KEYS[fortune.lucky_color_idx])
  }

  // Get advice/warning text
  let adviceText: string
  let warningText: string
  if (fortune.personalized && personalizedText) {
    adviceText = personalizedText.advice
    warningText = personalizedText.warning
  } else {
    const advices = ADVICE_LOCAL[locale] || ADVICE_LOCAL.zh
    const warnings = WARNING_LOCAL[locale] || WARNING_LOCAL.zh
    adviceText = advices[fortune.advice_idx] || advices[0]
    warningText = warnings[fortune.warning_idx] || warnings[0]
  }

  return (
    <div className="card-glass-elevated overflow-hidden">
      {/* ─── Top Section: Gauge + Dimension Bars ─── */}
      <div className="p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Circular gauge */}
          <div className="flex flex-col items-center gap-4">
            <GaugeRing score={fortune.overall} />
            <div className="text-center">
              <span className={`text-sm font-bold ${getScoreColor(fortune.overall)}`}>
                {t("fortune.todayLevel")}: {t(getScoreLabelKey(fortune.overall))}
              </span>
              <p className="text-white/25 text-xs mt-1">{dateStr}</p>
              {fortune.personalized && (
                <p className="text-gold/50 text-[10px] mt-1 flex items-center justify-center gap-1">
                  <User size={10} />
                  {t("fortune.basedOnChart")}
                </p>
              )}
            </div>
          </div>

          {/* Right: Dimension bars */}
          <div className="space-y-4">
            <p className="text-white/40 text-xs tracking-wider uppercase mb-1">{t("fortune.overallScore")}</p>
            {dims.map((d, i) => (
              <DimBar
                key={d.key}
                icon={d.icon}
                label={t(d.key)}
                score={d.score}
                color={d.color}
                delay={0.2 + i * 0.1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Middle: Lucky Color + Lucky Number ─── */}
      <div className="px-6 pb-6 md:px-8 md:pb-6">
        <div className="grid grid-cols-2 gap-3">
          {/* Lucky Color */}
          <div className="bg-[#030918] rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Palette size={14} className="text-gold/60" />
              <span className="text-white/40 text-xs">{t("fortune.luckyColor")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-xl border border-white/[0.08] flex-shrink-0"
                style={{ background: colorHex }}
              />
              <span className="text-gold font-medium text-sm">
                {colorName}
              </span>
            </div>
          </div>

          {/* Lucky Number */}
          <div className="bg-[#030918] rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={14} className="text-gold/60" />
              <span className="text-white/40 text-xs">{t("fortune.luckyNumber")}</span>
            </div>
            <span className="text-gold font-serif font-bold text-2xl">{fortune.lucky_number}</span>
          </div>
        </div>
      </div>

      {/* ─── Advice + Warning ─── */}
      <div className="px-6 pb-6 md:px-8 md:pb-6 space-y-3">
        {/* Advice */}
        <div className="p-4 bg-gold/[0.04] rounded-xl border border-gold/10 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={14} className="text-gold" />
          </div>
          <div>
            <p className="text-gold/80 text-xs font-medium mb-0.5">{t("fortune.advice._label")}</p>
            <p className="text-white/50 text-sm leading-relaxed">{adviceText}</p>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 bg-red-500/[0.04] rounded-xl border border-red-400/10 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={14} className="text-red-400" />
          </div>
          <div>
            <p className="text-red-400/70 text-xs font-medium mb-0.5">{t("fortune.warning._label")}</p>
            <p className="text-white/50 text-sm leading-relaxed">{warningText}</p>
          </div>
        </div>
      </div>

      {/* ─── CTA ─── */}
      <div className="px-6 pb-6 md:px-8 md:pb-8">
        <Link
          href="/reading/new"
          className="btn-gold w-full flex items-center justify-center gap-2 text-sm py-3 group"
        >
          {t("fortune.startReading")}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
