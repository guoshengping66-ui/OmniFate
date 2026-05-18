"use client"
import { useState, useEffect } from "react"
import { Wallet, Briefcase, Heart, Activity, Palette, Hash, AlertTriangle, TrendingUp } from "lucide-react"
import { getDailyFortune, listMyReadings, type DailyFortuneResponse } from "@/lib/api"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

// ── Fallback data for non-logged-in users ─────────────────────────
function generateFallbackFortune(): DailyFortuneResponse {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const hash = (n: number) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 49297
    return x - Math.floor(x)
  }
  const score = (base: number, v: number) =>
    Math.round(Math.max(1, Math.min(10, base + (hash(v) - 0.5) * v)))

  const colors = ["金色", "红色", "蓝色", "绿色", "紫色", "白色", "粉色", "橙色"]
  return {
    date: today.toISOString().slice(0, 10),
    greeting: "今日运势概览",
    overall_score: score(6, 4),
    wealth_fortune: score(5, 5),
    career_fortune: score(6, 4),
    love_fortune: score(5, 5),
    health_fortune: score(6, 3),
    lucky_color: colors[Math.floor(hash(100) * colors.length)],
    lucky_number: Math.floor(hash(200) * 9) + 1,
    advice: "今日适合制定规划，把灵感转化为行动。",
    warning: "避免在情绪激动时做重要决定。",
  }
}

interface AlmanacData {
  lunar_date: string
  bazi_day_pillar: string
  yi: { label: string; value: string }[]
  ji: { label: string; value: string }[]
}

function generateFallbackAlmanac(): AlmanacData {
  const now = new Date()
  const day = now.getDate()
  const month = now.getMonth() + 1
  // Simplified lunar date approximation
  const lunarMonths = ["正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","冬月","腊月"]
  const lunarDay = day > 15 ? day - 15 : day
  const dayNames = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
    "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
    "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"]
  const ganZhi = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉"]
  const gZ = ganZhi[now.getDay() % ganZhi.length]

  return {
    lunar_date: `${lunarMonths[(month - 1) % 12]}${dayNames[Math.min(lunarDay - 1, 29)]}`,
    bazi_day_pillar: gZ,
    yi: [
      { label: "出行", value: "利远行" },
      { label: "祈福", value: "诚心则灵" },
      { label: "安床", value: "安稳" },
    ],
    ji: [
      { label: "动土", value: "不利" },
      { label: "开仓", value: "耗损" },
      { label: "破土", value: "忌" },
    ],
  }
}

// ── Constants ──────────────────────────────────────────────────

const WUXING_EMOJI: Record<string, string> = {
  "木": "🌿", "火": "🔥", "土": "⛰️", "金": "🪙", "水": "💧",
}

const SHICHEN_LABELS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

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

// ── Main Component ───────────────────────────────────────────────

export function DailyDashboard() {
  const { user } = useAuth()
  const { locale, t } = useLanguage()
  const [fortune, setFortune] = useState<DailyFortuneResponse | null>(null)
  const [almanac, setAlmanac] = useState<AlmanacData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // Personal fortune
        let f: DailyFortuneResponse
        if (user) {
          try {
            f = await getDailyFortune()
          } catch (err) {
            console.warn("[DailyDashboard] Fortune API failed, using fallback:", err)
            f = generateFallbackFortune()
          }
        } else {
          f = generateFallbackFortune()
        }
        setFortune(f)

        // Public almanac — try API, fallback to generated
        if (user) {
          try {
            const readings = await listMyReadings()
            if (readings && readings.length > 0) {
              const res = await api.get("/api/readings/daily-almanac", {
                params: { session_id: readings[0].session_id },
                timeout: 15_000,
              })
              if (res?.data) {
                const raw = res.data
                setAlmanac({
                  lunar_date: raw.lunar_date || generateFallbackAlmanac().lunar_date,
                  bazi_day_pillar: raw.bazi_day_pillar || generateFallbackAlmanac().bazi_day_pillar,
                  yi: (raw.yi || []).slice(0, 3).map((i: any) => ({
                    label: typeof i === "string" ? i : (i.label || i.name || String(i)),
                    value: typeof i === "string" ? "" : (i.value || i.desc || ""),
                  })),
                  ji: (raw.ji || []).slice(0, 3).map((i: any) => ({
                    label: typeof i === "string" ? i : (i.label || i.name || String(i)),
                    value: typeof i === "string" ? "" : (i.value || i.desc || ""),
                  })),
                })
                return // success, skip fallback
              }
            }
          } catch (err) {
            console.warn("[DailyDashboard] Almanac API failed, using fallback:", err)
          }
        }
        setAlmanac(generateFallbackAlmanac())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading || !fortune || !almanac) {
    return (
      <div className="card-glass p-8 text-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  const colorHex: Record<string, string> = {
    "金色": "#C9A84C", "红色": "#E63946", "蓝色": "#2980B9", "绿色": "#52B788",
    "紫色": "#9B59B6", "白色": "#E8E8E8", "粉色": "#F472B6", "橙色": "#F97316",
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: 个人运势 (2 cols) ───────────────────── */}
        <div className="lg:col-span-2 card-glass p-6 space-y-6">
          {/* Gauge ring */}
          <div className="flex items-center gap-8">
            <GaugeRing score={fortune.overall_score} />
            <div className="flex-1 space-y-2.5">
              <DimBar icon={<Wallet size={14} />} label={t("report.wealth")} score={fortune.wealth_fortune} color="#C9A84C" />
              <DimBar icon={<Briefcase size={14} />} label={t("report.career")} score={fortune.career_fortune} color="#2D6A4F" />
              <DimBar icon={<Heart size={14} />} label={t("report.relationship")} score={fortune.love_fortune} color="#C1121F" />
              <DimBar icon={<Activity size={14} />} label={t("report.health")} score={fortune.health_fortune} color="#2980B9" />
            </div>
          </div>

          {/* Lucky items + advice */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Palette size={14} className="text-white/40" />
                <span className="text-white/40">{t("dash.fortune.luckyColor")}</span>
                <span className="text-white/70 font-medium" style={{ color: colorHex[fortune.lucky_color] || "#C9A84C" }}>
                  {fortune.lucky_color}
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

          {/* ── 今日时辰能量 ───────────────────────────── */}
          {fortune.hourly_energy && fortune.hourly_energy.length > 0 && (
            <div className="pt-3 border-t border-white/[0.06]">
              <p className="text-white/40 text-xs mb-3">今日时辰能量</p>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {fortune.hourly_energy.slice(0, 12).map((h, i) => {
                  const barColor = h.score >= 8 ? "#4ade80" : h.score >= 6 ? "#C9A84C" : h.score >= 4 ? "#fb923c" : "#f87171"
                  return (
                    <div key={i} className="text-center">
                      <div className="text-[10px] text-white/30 mb-1">{h.hour?.replace("时", "") || SHICHEN_LABELS[i]}</div>
                      <div className="h-10 rounded-md bg-white/[0.04] relative overflow-hidden">
                        <div
                          className="absolute bottom-0 w-full rounded-md transition-all duration-700"
                          style={{
                            height: `${h.score * 10}%`,
                            background: `linear-gradient(to top, ${barColor}44, ${barColor})`,
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-white/40 mt-1 font-mono">{h.score}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── 今日五行 ───────────────────────────────── */}
          {fortune.wuxing_today?.element && (
            <div className="flex items-center gap-4 pt-3 border-t border-white/[0.06]">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl flex-shrink-0">
                {fortune.wuxing_today.emoji || WUXING_EMOJI[fortune.wuxing_today.element] || "✨"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-sm">
                  今日五行 · <span className="text-gold font-medium">{fortune.wuxing_today.element}</span>
                </p>
                <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{fortune.wuxing_today.interaction}</p>
              </div>
            </div>
          )}

          {/* ── 今日总结 ───────────────────────────────── */}
          {fortune.daily_summary && (
            <div className="pt-3 border-t border-white/[0.06]">
              <p className="text-white/50 text-sm leading-relaxed">
                <span className="text-gold/60 mr-1">💡</span>
                {fortune.daily_summary}
              </p>
            </div>
          )}
        </div>

        {/* ── Right: 红尘黄历 (1 col) ──────────────────── */}
        <div className="card-glass p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📅</span>
            <h3 className="font-serif text-gold font-medium">{t("dash.fortune.almanacTitle")}</h3>
          </div>

          <div className="space-y-1.5">
            <p className="text-white/60 text-sm">{almanac.lunar_date}</p>
            <p className="text-white/40 text-xs">{t("dash.fortune.dayPillar")}: {almanac.bazi_day_pillar}</p>
          </div>

          {/* 宜 */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
            <p className="text-green-400 text-xs font-medium mb-2">✅ {t("dash.fortune.yi")}</p>
            <div className="flex flex-wrap gap-1.5">
              {almanac.yi.map((item, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400/80">
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* 忌 */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
            <p className="text-red-400 text-xs font-medium mb-2">❌ {t("dash.fortune.ji")}</p>
            <div className="flex flex-wrap gap-1.5">
              {almanac.ji.map((item, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400/80">
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI 融合批语 ─────────────────────────────────── */}
      <div className="card-glass p-5 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">🤖</span>
        <p className="text-white/50 text-sm leading-relaxed">
          {locale === "zh"
            ? `大盘今日${almanac.ji.length > 0 ? "虽忌" + almanac.ji[0].label : "运势平稳"}，但你的${fortune.career_fortune >= 7 ? "事业运逆势高达 " + fortune.career_fortune + "/10，事上磨练" : "整体运势" + fortune.overall_score + "/10，宜稳中求进"}。${fortune.advice}`
            : `The day's almanac${almanac.ji.length > 0 ? " warns against " + almanac.ji[0].label : " is neutral"}, but your personal fortune scores ${fortune.overall_score}/10. ${fortune.advice}`
          }
        </p>
      </div>
    </div>
  )
}
