"use client"
import { useState, useEffect } from "react"
import { Sparkles, X, ChevronRight, Check } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
  subscribeFortune,
  getFortuneSubscription,
  getWeeklyFortune,
  type WeeklyFortuneResponse,
} from "@/lib/api"

// ── Locale-aware data ────────────────────────────────────────────────────
const DAY_LABELS = { zh: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"], en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }

// ── Main Component ──────────────────────────────────────────────────────
export function FloatingFortuneSubscribe() {
  const [open, setOpen] = useState(false)
  const [freq, setFreq] = useState<string>("weekly")
  const [saved, setSaved] = useState(false)
  const [fortune, setFortune] = useState<WeeklyFortuneResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { t, locale, localeHref } = useLanguage()
  const router = useRouter()

  const isZH = locale === "zh"
  const dayLabels = isZH ? DAY_LABELS.zh : DAY_LABELS.en
  const scoreColor = (fortune?.score ?? 6) >= 8 ? "#4ade80" : (fortune?.score ?? 6) >= 6 ? "#C9A84C" : (fortune?.score ?? 6) >= 4 ? "#fb923c" : "#f87171"
  const yiLabel = isZH ? "宜" : "Do"
  const jiLabel = isZH ? "忌" : "Don't"

  // Load subscription status and fortune on mount
  useEffect(() => {
    if (!open) return
    loadData()
  }, [open])

  async function loadData() {
    setLoading(true)
    try {
      if (user) {
        const sub = await getFortuneSubscription()
        setFreq(sub.frequency)
      }
      const f = await getWeeklyFortune(locale)
      setFortune(f)
    } catch (err) {
      console.error("Failed to load fortune:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error(t("auth.loginRequired"))
      return
    }
    try {
      await subscribeFortune(freq)
      setSaved(true)
      toast.success(t("fortuneSub.success"))
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      toast.error(t("account.profileSaveFail"))
    }
  }

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────── */}
      <div
        className="fixed bottom-6 right-6 z-40 hidden sm:block"
        style={{
          animation: "fortuneBtnIn 0.5s ease-out 2s both",
        }}
      >
        <button
          onClick={() => setOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full
                     bg-gradient-to-r from-gold/20 to-gold/5
                     border border-gold/25 hover:border-gold/50
                     hover:shadow-[0_0_24px_rgba(201,168,76,0.25)]
                     transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-full bg-gold/10 animate-[pulse_3s_ease-in-out_infinite] pointer-events-none" />
          <div className="relative flex items-center gap-2">
            <Sparkles size={14} className="text-gold group-hover:animate-spin" />
            <span className="text-gold text-xs font-medium">{t("fortuneSub.label")}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 text-[10px] font-bold">
              {t("fortuneSub.badge")}
            </span>
          </div>
        </button>
      </div>

      {/* ── Modal ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          style={{
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="card-glass w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-6 space-y-5"
            style={{
              animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-gold" />
                <h3 className="font-serif text-lg text-gold font-bold">{t("fortuneSub.title")}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">{t("fortuneSub.desc")}</p>

            {/* Frequency Selector */}
            <div className="space-y-2">
              <p className="text-white/50 text-xs font-medium">{t("fortuneSub.frequency")}</p>
              <div className="flex gap-2">
                {([
                  { key: "weekly", label: t("fortuneSub.freqWeekly") },
                  { key: "daily", label: t("fortuneSub.freqDaily") },
                  { key: "off", label: t("fortuneSub.freqOff") },
                ]).map(o => (
                  <button
                    key={o.key}
                    onClick={() => setFreq(o.key)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      freq === o.key
                        ? o.key === "off"
                          ? "bg-white/5 text-white/40 border border-white/10"
                          : "bg-gold/10 text-gold border border-gold/30"
                        : "bg-white/[0.03] text-white/30 border border-white/[0.06] hover:text-white/50"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            )}

            {/* Fortune Preview */}
            {!loading && fortune && freq !== "off" && (
              <>
                <div className="bg-white/[0.03] rounded-2xl p-5 space-y-4 border border-white/[0.06]">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider">{t("fortuneSub.previewHint")}</p>

                  {/* Score + Theme */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke={scoreColor} strokeWidth="4"
                          strokeLinecap="round" strokeDasharray={`${(fortune.score / 10) * 163.36} 163.36`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold font-serif" style={{ color: scoreColor }}>{fortune.score}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/50 text-[10px] mb-0.5">{t("fortuneSub.overallScore")}</p>
                      <p className="text-gold text-sm font-medium">{fortune.theme}</p>
                    </div>
                  </div>

                  {/* Lucky items */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.luckyColor")}:</span>
                      <span className="text-green-400/80 font-medium">{fortune.lucky_color}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.luckyNumber")}:</span>
                      <span className="text-gold font-medium">{fortune.lucky_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.luckyDirection")}:</span>
                      <span className="text-blue-400/80 font-medium">{fortune.lucky_direction}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.tarotCard")}:</span>
                      <span className="text-purple-400/80 font-medium">{fortune.tarot_card}</span>
                    </div>
                  </div>

                  {/* Tarot description */}
                  <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3">
                    <p className="text-purple-300/70 text-xs leading-relaxed">{fortune.tarot_desc}</p>
                  </div>

                  {/* Daily Yi Ji preview (first 3 days) */}
                  <div>
                    <p className="text-white/30 text-[10px] mb-2">{t("fortuneSub.dailyYiJi")}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {fortune.daily_yi_ji.slice(0, 3).map((d, i) => (
                        <div key={i} className="bg-white/[0.03] rounded-lg p-2 text-center">
                          <p className="text-white/40 text-[10px] mb-1">{dayLabels[i]}</p>
                          <p className="text-green-400/70 text-[10px]">{yiLabel} {d.yi}</p>
                          <p className="text-red-400/50 text-[10px]">{jiLabel} {d.ji}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Insight */}
                <div className="card-glass p-4 flex items-start gap-3">
                  <span className="text-base flex-shrink-0">🤖</span>
                  <p className="text-white/40 text-xs leading-relaxed">{fortune.ai_insight}</p>
                </div>
              </>
            )}

            {/* No data state - show generic fortune or prompt to set birth info */}
            {!loading && !fortune && (
              <div className="text-center py-6">
                <p className="text-white/30 text-sm mb-3">
                  {user ? t("fortuneSub.generating") : t("fortuneSub.loginRequired")}
                </p>
                {!user && (
                  <button
                    onClick={() => { setOpen(false); router.push(localeHref("/login")) }}
                    className="btn-gold px-6 py-2 text-sm"
                  >
                    {t("nav.login")}
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              {user ? (
                freq !== "off" ? (
                  <button
                    onClick={handleSave}
                    className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    {saved ? <><Check size={14} /> {t("fortuneSub.subscribed")} </> : <>{t("fortuneSub.subscribe")} <ChevronRight size={14} /></>}
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/50 text-sm hover:text-white/70 transition-colors"
                  >
                    {saved ? t("fortuneSub.subscribed") : t("fortuneSub.unsubscribe")}
                  </button>
                )
              ) : (
                <button
                  onClick={() => { setOpen(false); router.push(localeHref("/login")) }}
                  className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {t("nav.login")} <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  )
}
