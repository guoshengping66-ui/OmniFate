"use client"
import { useState, useEffect } from "react"
import { Sparkles, X, ChevronRight, Check, Calendar, Clock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
  subscribeFortune,
  getFortuneSubscription,
  getWeeklyFortune,
  getFortuneDaily,
  type WeeklyFortuneResponse,
  type FortuneDailyResponse,
} from "@/lib/api"

// ── Locale-aware data ────────────────────────────────────────────────────
const DAY_LABELS = { zh: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"], en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }

// ── Main Component ──────────────────────────────────────────────────────
export function FloatingFortuneSubscribe() {
  const [open, setOpen] = useState(false)
  const [freq, setFreq] = useState<string>("weekly")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fortune, setFortune] = useState<WeeklyFortuneResponse | null>(null)
  const [dailyFortune, setDailyFortune] = useState<FortuneDailyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { t, locale, localeHref } = useLanguage()
  const router = useRouter()

  const isZH = locale === "zh"
  const dayLabels = isZH ? DAY_LABELS.zh : DAY_LABELS.en
  const currentScore = freq === "daily" ? (dailyFortune?.score ?? 6) : (fortune?.score ?? 6)
  const scoreColor = currentScore >= 8 ? "#4ade80" : currentScore >= 6 ? "#C9A84C" : currentScore >= 4 ? "#fb923c" : "#f87171"
  const yiLabel = isZH ? "宜" : "Do"
  const jiLabel = isZH ? "忌" : "Don't"

  // Load subscription status and daily profile on mount; re-fetch when locale changes
  useEffect(() => {
    if (!open) return
    loadData()
  }, [open, locale])

  async function loadData() {
    setLoading(true)
    try {
      if (user) {
        const sub = await getFortuneSubscription()
        setFreq(sub.frequency)
        setIsSubscribed(sub.is_active && sub.frequency !== "off")
      }
      // Load both weekly and daily profile so preview switches instantly on frequency change
      const [w, d] = await Promise.all([
        getWeeklyFortune(locale).catch(() => null),
        getFortuneDaily(locale).catch(() => null),
      ])
      setFortune(w)
      setDailyFortune(d)
    } catch (err) {
      console.error("Failed to load profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error(t("auth.loginRequired"))
      return
    }
    setSaving(true)
    try {
      await subscribeFortune(freq)
      setIsSubscribed(freq !== "off")
      toast.success(freq === "off" ? t("fortuneSub.unsubscribed") : t("fortuneSub.success"))
    } catch (err) {
      toast.error(t("account.profileSaveFail"))
    } finally {
      setSaving(false)
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

            {/* Profile Preview */}
            {!loading && (fortune || dailyFortune) && freq !== "off" && (
              <>
                <div className="bg-white/[0.03] rounded-2xl p-5 space-y-4 border border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    {freq === "daily" ? <Calendar size={12} className="text-gold/50" /> : <Clock size={12} className="text-gold/50" />}
                    <p className="text-white/30 text-[10px] uppercase tracking-wider">
                      {freq === "daily" ? t("fortuneSub.dailyPreview") : t("fortuneSub.weeklyPreview")}
                    </p>
                  </div>

                  {/* Score + Theme */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke={scoreColor} strokeWidth="4"
                          strokeLinecap="round" strokeDasharray={`${(currentScore / 10) * 163.36} 163.36`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold font-serif" style={{ color: scoreColor }}>{freq === "daily" ? dailyFortune?.score : fortune?.score}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/50 text-[10px] mb-0.5">{t("fortuneSub.overallScore")}</p>
                      <p className="text-gold text-sm font-medium">{freq === "daily" ? dailyFortune?.theme : fortune?.theme}</p>
                    </div>
                  </div>

                  {/* Lucky items */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.luckyColor")}:</span>
                      <span className="text-green-400/80 font-medium">{freq === "daily" ? dailyFortune?.lucky_color : fortune?.lucky_color}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.luckyNumber")}:</span>
                      <span className="text-gold font-medium">{freq === "daily" ? dailyFortune?.lucky_number : fortune?.lucky_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.luckyDirection")}:</span>
                      <span className="text-blue-400/80 font-medium">{freq === "daily" ? dailyFortune?.lucky_direction : fortune?.lucky_direction}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.tarotCard")}:</span>
                      <span className="text-purple-400/80 font-medium">{freq === "daily" ? dailyFortune?.tarot_card : fortune?.tarot_card}</span>
                    </div>
                  </div>

                  {/* Tarot description */}
                  <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3">
                    <p className="text-purple-300/70 text-xs leading-relaxed">{freq === "daily" ? dailyFortune?.tarot_desc : fortune?.tarot_desc}</p>
                  </div>

                  {/* Daily Yi Ji - weekly shows 3-day preview, daily shows today's yi/ji */}
                  <div>
                    <p className="text-white/30 text-[10px] mb-2">{t("fortuneSub.dailyYiJi")}</p>
                    {freq === "daily" && dailyFortune ? (
                      <div className="flex gap-3">
                        <div className="flex-1 bg-green-500/5 border border-green-500/15 rounded-lg p-2 text-center">
                          <p className="text-green-400/70 text-[10px] mb-1">{yiLabel}</p>
                          <p className="text-white/60 text-xs">{dailyFortune.yi.join("、")}</p>
                        </div>
                        <div className="flex-1 bg-red-500/5 border border-red-500/15 rounded-lg p-2 text-center">
                          <p className="text-red-400/50 text-[10px] mb-1">{jiLabel}</p>
                          <p className="text-white/60 text-xs">{dailyFortune.ji.join("、")}</p>
                        </div>
                      </div>
                    ) : fortune?.daily_yi_ji ? (
                      <div className="grid grid-cols-3 gap-2">
                        {fortune.daily_yi_ji.slice(0, 3).map((d, i) => (
                          <div key={i} className="bg-white/[0.03] rounded-lg p-2 text-center">
                            <p className="text-white/40 text-[10px] mb-1">{dayLabels[i]}</p>
                            <p className="text-green-400/70 text-[10px]">{yiLabel} {d.yi}</p>
                            <p className="text-red-400/50 text-[10px]">{jiLabel} {d.ji}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* AI Insight */}
                <div className="card-glass p-4 flex items-start gap-3">
                  <span className="text-base flex-shrink-0">🤖</span>
                  <p className="text-white/40 text-xs leading-relaxed">{freq === "daily" ? dailyFortune?.ai_insight : fortune?.ai_insight}</p>
                </div>
              </>
            )}

            {/* No data state - show generic profile or prompt to set birth info */}
            {!loading && !fortune && !dailyFortune && (
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
                    disabled={saving}
                    className={`flex-1 py-2.5 text-sm flex items-center justify-center gap-2 rounded-xl transition-all ${
                      isSubscribed && freq !== "off"
                        ? "bg-green-500/10 text-green-400 border border-green-500/30"
                        : "btn-gold"
                    }`}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isSubscribed && freq !== "off" ? (
                      <><Check size={14} /> {t("fortuneSub.subscribed")} </>
                    ) : (
                      <>{t("fortuneSub.subscribe")} <ChevronRight size={14} /></>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/50 text-sm hover:text-white/70 transition-colors"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : t("fortuneSub.unsubscribe")}
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
