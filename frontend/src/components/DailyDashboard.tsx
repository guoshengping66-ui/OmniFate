"use client"
import { useState, useEffect } from "react"
import { Wallet, Briefcase, Heart, Activity, Palette, Hash, AlertTriangle, TrendingUp } from "lucide-react"
import { getDailyFortune, getPersonalizedFortune, listMyReadings, getPersonalizedDailyAlmanac, type DailyFortuneResponse } from "@/lib/api"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useUserStore } from "@/stores/useUserStore"
import { translateYiJi, translateGanZhi, cleanLunarDate } from "@/lib/translations"
import { getCached, setCached } from "@/lib/dailyCache"

// ── Fallback data for non-logged-in users ─────────────────────────
function generateFallbackFortune(t: (k: string) => string): DailyFortuneResponse {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const hash = (n: number) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 49297
    return x - Math.floor(x)
  }
  const score = (base: number, v: number) =>
    Math.round(Math.max(1, Math.min(10, base + (hash(v) - 0.5) * v)))

  const colors = t("dash.fallback.colors").split(",")
  return {
    date: today.toISOString().slice(0, 10),
    greeting: t("dash.fallback.greeting"),
    overall_score: score(6, 4),
    wealth_fortune: score(5, 5),
    career_fortune: score(6, 4),
    love_fortune: score(5, 5),
    health_fortune: score(6, 3),
    lucky_color: colors[Math.floor(hash(100) * colors.length)],
    lucky_number: Math.floor(hash(200) * 9) + 1,
    advice: t("dash.fallback.advice"),
    warning: t("dash.fallback.warning"),
  }
}

interface AlmanacData {
  lunar_date: string
  bazi_day_pillar: string
  yi: { label: string; value: string }[]
  ji: { label: string; value: string }[]
}

function generateFallbackAlmanac(t: (k: string) => string): AlmanacData {
  const now = new Date()
  const day = now.getDate()
  const month = now.getMonth() + 1
  const lunarMonths = t("dash.fallback.lunarMonths").split(",")
  const lunarDay = day > 15 ? day - 15 : day
  const dayNames = t("dash.fallback.dayNames").split(",")
  const ganZhi = t("dash.fallback.ganZhi").split(",")
  const gZ = ganZhi[now.getDay() % ganZhi.length]

  return {
    lunar_date: `${lunarMonths[(month - 1) % 12]}${dayNames[Math.min(lunarDay - 1, 29)]}`,
    bazi_day_pillar: gZ,
    yi: [
      { label: t("dash.fallback.yi.travel"), value: t("dash.fallback.yi.travelDesc") },
      { label: t("dash.fallback.yi.pray"), value: t("dash.fallback.yi.prayDesc") },
      { label: t("dash.fallback.yi.bed"), value: t("dash.fallback.yi.bedDesc") },
    ],
    ji: [
      { label: t("dash.fallback.ji.dig"), value: t("dash.fallback.ji.digDesc") },
      { label: t("dash.fallback.ji.warehouse"), value: t("dash.fallback.ji.warehouseDesc") },
      { label: t("dash.fallback.ji.bury"), value: t("dash.fallback.ji.buryDesc") },
    ],
  }
}

// ── Translation maps for API Chinese data ────────────────────────
const COLOR_NAME_EN: Record<string, string> = {
  "金色": "Gold", "红色": "Red", "蓝色": "Blue", "绿色": "Green",
  "紫色": "Purple", "白色": "White", "粉色": "Pink", "橙色": "Orange",
  "翠绿": "Emerald", "青色": "Cyan", "黑色": "Black", "黄色": "Yellow", "银色": "Silver",
}

// ── Sub-components ───────────────────────────────────────────────

function GaugeRing({ score, size = 140 }: { score: number; size?: number }) {
  const { t } = useLanguage()
  const radius = (size - 14) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 10) * circumference
  const color = score >= 8 ? "#4ade80" : score >= 6 ? "#C9A84C" : score >= 4 ? "#fb923c" : "#f87171"
  const label = score >= 9 ? t("dash.fortune.great") : score >= 7 ? t("dash.fortune.good") : score >= 5 ? t("dash.fortune.fair") : score >= 3 ? t("dash.fortune.low") : t("dash.fortune.poor")

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 1.2s ease-out" }} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${progress} ${circumference}`}
          opacity={0.3} style={{ filter: "blur(6px)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-serif" style={{ color }}>{score}</span>
        <span className="text-white/30 text-[10px] mt-0.5">{label}</span>
      </div>
    </div>
  )
}

function DimBar({ icon, label, score, color }: { icon: React.ReactNode; label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-16 flex-shrink-0">
        <span style={{ color }} className="opacity-70">{icon}</span>
        <span className="text-white/60 text-xs">{label}</span>
      </div>
      <div className="flex-1 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{
          width: `${score * 10}%`,
          background: `linear-gradient(90deg, ${color}66, ${color})`,
          transition: "width 1s ease-out",
        }} />
      </div>
      <span className="text-white/40 text-[11px] w-7 text-right font-mono">{score}</span>
    </div>
  )
}

// ── Skeleton loader for almanac ──────────────────────────────────
function AlmanacSkeleton() {
  return (
    <div className="card-glass p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded bg-white/10" />
        <div className="h-4 w-24 rounded bg-white/10" />
      </div>
      <div className="space-y-1.5">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="h-3 w-20 rounded bg-white/10" />
      </div>
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
        <div className="h-3 w-8 rounded bg-green-500/10 mb-2" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map(i => <div key={i} className="h-5 w-16 rounded-full bg-green-500/10" />)}
        </div>
      </div>
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
        <div className="h-3 w-8 rounded bg-red-500/10 mb-2" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map(i => <div key={i} className="h-5 w-16 rounded-full bg-red-500/10" />)}
        </div>
      </div>
    </div>
  )
}

// ── Fortune Section (shown immediately) ──────────────────────────
function FortuneSection({ fortune, locale, t }: {
  fortune: DailyFortuneResponse; locale: string; t: (k: string) => string
}) {
  const colorHex: Record<string, string> = {
    "金色": "#C9A84C", "红色": "#E63946", "蓝色": "#2980B9", "绿色": "#52B788",
    "紫色": "#9B59B6", "白色": "#E8E8E8", "粉色": "#F472B6", "橙色": "#F97316",
    "Gold": "#C9A84C", "Red": "#E63946", "Blue": "#2980B9", "Green": "#52B788",
    "Purple": "#9B59B6", "White": "#E8E8E8", "Pink": "#F472B6", "Orange": "#F97316",
  }
  const translateColor = (color: string) => locale === "zh" ? color : (COLOR_NAME_EN[color] || color)

  return (
    <div className="lg:col-span-2 card-glass p-6 space-y-6">
      <div className="flex items-center gap-8">
        <GaugeRing score={fortune.overall_score} />
        <div className="flex-1 space-y-2.5">
          <DimBar icon={<Wallet size={14} />} label={t("report.wealth")} score={fortune.wealth_fortune} color="#C9A84C" />
          <DimBar icon={<Briefcase size={14} />} label={t("report.career")} score={fortune.career_fortune} color="#2D6A4F" />
          <DimBar icon={<Heart size={14} />} label={t("report.relationship")} score={fortune.love_fortune} color="#C1121F" />
          <DimBar icon={<Activity size={14} />} label={t("report.health")} score={fortune.health_fortune} color="#2980B9" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Palette size={14} className="text-white/40" />
            <span className="text-white/40">{t("dash.fortune.luckyColor")}</span>
            <span className="text-white/70 font-medium" style={{ color: colorHex[fortune.lucky_color] || "#C9A84C" }}>
              {translateColor(fortune.lucky_color)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash size={14} className="text-white/40" />
            <span className="text-white/40">{t("dash.fortune.luckyNumber")}</span>
            <span className="text-white/70 font-medium">{fortune.lucky_number}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <TrendingUp size={14} className="text-green-400/60 mt-0.5 flex-shrink-0" />
            <span className="text-white/50 leading-relaxed">{fortune.advice}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle size={14} className="text-amber-400/60 mt-0.5 flex-shrink-0" />
            <span className="text-white/50 leading-relaxed">{fortune.warning}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Almanac Section (lazy-loaded) ────────────────────────────────
function AlmanacSection({ almanac, locale, t }: {
  almanac: AlmanacData; locale: string; t: (k: string) => string
}) {
  const translateYiJiLocal = (label: string) => locale === "zh" ? label : translateYiJi(label)

  return (
    <div className="card-glass p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">📅</span>
        <h3 className="font-serif text-gold font-medium">{t("dash.fortune.almanacTitle")}</h3>
      </div>

      <div className="space-y-1.5">
        <p className="text-white/60 text-sm">{cleanLunarDate(almanac.lunar_date, locale === "zh")}</p>
        <p className="text-white/40 text-xs">{t("dash.fortune.dayPillar")}: {locale === "zh" ? almanac.bazi_day_pillar : translateGanZhi(almanac.bazi_day_pillar)}</p>
      </div>

      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
        <p className="text-green-400 text-xs font-medium mb-2">✅ {t("dash.fortune.yi")}</p>
        <div className="flex flex-wrap gap-1.5">
          {almanac.yi.map((item, i) => (
            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400/80">
              {translateYiJiLocal(item.label)}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
        <p className="text-red-400 text-xs font-medium mb-2">❌ {t("dash.fortune.ji")}</p>
        <div className="flex flex-wrap gap-1.5">
          {almanac.ji.map((item, i) => (
            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400/80">
              {translateYiJiLocal(item.label)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────

export function DailyDashboard() {
  const { user } = useAuth()
  const { locale, t } = useLanguage()
  const { userProfile } = useUserStore()
  const [fortune, setFortune] = useState<DailyFortuneResponse | null>(() => getCached<DailyFortuneResponse>("fortune_" + locale))
  const [almanac, setAlmanac] = useState<AlmanacData | null>(() => getCached<AlmanacData>("almanac_" + locale))
  const [fortuneLoading, setFortuneLoading] = useState(!fortune)
  const [almanacLoading, setAlmanacLoading] = useState(!almanac)

  // ── Load fortune (fast, parallel) ──────────────────────────────
  useEffect(() => {
    // Stagger to avoid 429 burst with other homepage components
    let cancelled = false
    const timer = setTimeout(async () => {
    const loadFortune = async () => {
      try {
        let f: DailyFortuneResponse
        if (user) {
          try {
            // Use personalized fortune when user has birth data
            if (userProfile && userProfile.birth_year) {
              const pf = await getPersonalizedFortune({
                birth_year: userProfile.birth_year,
                birth_month: userProfile.birth_month,
                birth_day: userProfile.birth_day,
                birth_hour: userProfile.birth_hour,
              }, locale)
              f = pf || await getDailyFortune(locale)
            } else {
              f = await getDailyFortune(locale)
            }
          } catch { f = generateFallbackFortune(t) }
        } else {
          f = generateFallbackFortune(t)
        }
        setCached("fortune_" + locale, f)
        if (!cancelled) setFortune(f)
      } finally {
        if (!cancelled) setFortuneLoading(false)
      }
    }
    loadFortune()
    }, 150) // 150ms stagger
    return () => { cancelled = true; clearTimeout(timer) }
  }, [user, locale, userProfile])

  // ── Load almanac (parallel, lazy — skeleton shown while loading) ──
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
    const loadAlmanac = async () => {
      if (!user) {
        setAlmanac(generateFallbackAlmanac(t))
        setAlmanacLoading(false)
        return
      }
      // Helper to parse almanac API response
      const parseAlmanac = (raw: any): AlmanacData => ({
        lunar_date: raw.lunar_date || generateFallbackAlmanac(t).lunar_date,
        bazi_day_pillar: raw.bazi_day_pillar || generateFallbackAlmanac(t).bazi_day_pillar,
        yi: (raw.yi || []).slice(0, 3).map((i: any) => typeof i === "string" ? { label: i, value: "" } : { label: i.label || i.name || "", value: i.value || i.desc || "" }),
        ji: (raw.ji || []).slice(0, 3).map((i: any) => typeof i === "string" ? { label: i, value: "" } : { label: i.label || i.name || "", value: i.value || i.desc || "" }),
      })
      try {
        // Rate limit cooldown: skip API calls if recently got 429
        const lastFail = getCached<number>("almanac_rate_limit")
        if (lastFail && Date.now() - lastFail < 60_000) {
          const fallback = generateFallbackAlmanac(t)
          setCached("almanac_" + locale, fallback)
          setAlmanac(fallback)
          setAlmanacLoading(false)
          return
        }
        // Use cached readings list to avoid repeated API calls
        let readings = getCached<any[]>("readings_list")
        if (!readings) {
          readings = await listMyReadings()
          if (readings && readings.length > 0) {
            setCached("readings_list", readings)
          }
        }
        if (readings && readings.length > 0) {
          const res = await api.get("/api/readings/daily-almanac", {
            params: { session_id: readings[0].session_id, lang: locale, fast: true },
            timeout: 15_000,
          })
          if (res?.data) {
            const data = parseAlmanac(res.data)
            setCached("almanac_" + locale, data)
            setAlmanac(data)
            setAlmanacLoading(false)
            return
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 429) {
          setCached("almanac_rate_limit", Date.now())
        }
      }
      // Fallback: try personalized endpoint (if user has birth profile)
      try {
        if (userProfile && userProfile.birth_year) {
          const data = await getPersonalizedDailyAlmanac({
            birth_year: userProfile.birth_year,
            birth_month: userProfile.birth_month,
            birth_day: userProfile.birth_day,
            birth_hour: userProfile.birth_hour,
            birth_minute: userProfile.birth_minute,
            gender: userProfile.gender,
            birth_city: userProfile.birth_city,
            latitude: userProfile.latitude ?? undefined,
            longitude: userProfile.longitude ?? undefined,
          }, locale, true)
          const parsed = parseAlmanac(data)
          setCached("almanac_" + locale, parsed)
          setAlmanac(parsed)
          setAlmanacLoading(false)
          return
        }
      } catch (err: any) {
        if (err?.response?.status === 429) {
          setCached("almanac_rate_limit", Date.now())
        }
      }
      const fallback = generateFallbackAlmanac(t)
      setCached("almanac_" + locale, fallback)
      if (!cancelled) {
        setAlmanac(fallback)
        setAlmanacLoading(false)
      }
    }
    loadAlmanac()
    }, 400) // 400ms stagger — after fortune loads
    return () => { cancelled = true; clearTimeout(timer) }
  }, [user, locale, userProfile])

  // ── Loading state: only block if BOTH are missing ──────────────
  if (fortuneLoading && !fortune) {
    return (
      <div className="card-glass p-8 text-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!fortune) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Fortune (always shown immediately) ──── */}
        <FortuneSection fortune={fortune} locale={locale} t={t} />

        {/* ── Right: Almanac (skeleton while loading, then data) ── */}
        {almanacLoading && !almanac ? (
          <AlmanacSkeleton />
        ) : almanac ? (
          <AlmanacSection almanac={almanac} locale={locale} t={t} />
        ) : null}
      </div>

      {/* ── AI Fusion comment (only when both loaded) ─────── */}
      {fortune && almanac && (
        <div className="card-glass p-5 flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🤖</span>
          <p className="text-white/50 text-sm leading-relaxed">
            {locale === "zh"
              ? `大盘今日${almanac.ji.length > 0 ? "虽忌" + almanac.ji[0].label : "运势平稳"}，但你的${fortune.career_fortune >= 7 ? "事业运逆势高达 " + fortune.career_fortune + "/10，事上磨练" : "整体运势" + fortune.overall_score + "/10，宜稳中求进"}。${fortune.advice}`
              : `The day's almanac${almanac.ji.length > 0 ? " warns against " + translateYiJi(almanac.ji[0].label) : " is neutral"}, but your personal fortune scores ${fortune.overall_score}/10. ${fortune.advice}`
            }
          </p>
        </div>
      )}
    </div>
  )
}
