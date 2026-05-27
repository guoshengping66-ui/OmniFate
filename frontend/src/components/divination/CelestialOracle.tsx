"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Share2, RotateCcw, Zap, Gift, Hand } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"
import Link from "next/link"

interface DivinationResult {
  id: string
  fortune: string
  fortune_level: number     // 1-7 (大凶→大吉)
  wisdom_quote: string
  author: string
  theme: string
  ai_insight: string        // AI action guidance
  is_free: boolean
  stardust_cost: number
  balance_after: number
}

const FORTUNE_COLORS: Record<string, string> = {
  "大吉": "from-gold to-[#E8CB7A]",
  "中吉": "from-green-400 to-emerald-300",
  "小吉": "from-blue-400 to-cyan-300",
  "吉": "from-teal-400 to-cyan-400",
  "末吉": "from-yellow-500 to-amber-400",
  "凶": "from-orange-500 to-red-400",
  "大凶": "from-red-500 to-rose-400",
  "Great Blessing": "from-gold to-[#E8CB7A]",
  "Good Fortune": "from-green-400 to-emerald-300",
  "Mild Fortune": "from-blue-400 to-cyan-300",
  "Auspicious": "from-teal-400 to-cyan-400",
  "Moderate": "from-yellow-500 to-amber-400",
  "Inauspicious": "from-orange-500 to-red-400",
  "Great Misfortune": "from-red-500 to-rose-400",
}

const FORTUNE_EMOJI: Record<string, string> = {
  "大吉": "✨",
  "中吉": "🌟",
  "小吉": "⭐",
  "吉": "🌤",
  "末吉": "🌙",
  "凶": "🌑",
  "大凶": "⛈",
  "Great Blessing": "✨",
  "Good Fortune": "🌟",
  "Mild Fortune": "⭐",
  "Auspicious": "🌤",
  "Moderate": "🌙",
  "Inauspicious": "🌑",
  "Great Misfortune": "⛈",
}

// Theme energy totem
const THEME_TOTEM: Record<string, { icon: string; color: string; bg: string }> = {
  "事业": { icon: "⚔", color: "text-amber-400",  bg: "from-amber-500/10 to-orange-500/5" },
  "感情": { icon: "♥", color: "text-pink-400",   bg: "from-pink-500/10 to-rose-500/5" },
  "财运": { icon: "◎", color: "text-emerald-400", bg: "from-emerald-500/10 to-green-500/5" },
  "健康": { icon: "☯", color: "text-teal-400",    bg: "from-teal-500/10 to-cyan-500/5" },
  "学业": { icon: "☰", color: "text-blue-400",    bg: "from-blue-500/10 to-indigo-500/5" },
  "人际": { icon: "⬡", color: "text-violet-400",  bg: "from-violet-500/10 to-purple-500/5" },
  "出行": { icon: "✈", color: "text-sky-400",     bg: "from-sky-500/10 to-cyan-500/5" },
  "Career": { icon: "⚔", color: "text-amber-400",  bg: "from-amber-500/10 to-orange-500/5" },
  "Love": { icon: "♥", color: "text-pink-400",   bg: "from-pink-500/10 to-rose-500/5" },
  "Wealth": { icon: "◎", color: "text-emerald-400", bg: "from-emerald-500/10 to-green-500/5" },
  "Health": { icon: "☯", color: "text-teal-400",    bg: "from-teal-500/10 to-cyan-500/5" },
  "Studies": { icon: "☰", color: "text-blue-400",    bg: "from-blue-500/10 to-indigo-500/5" },
  "Social": { icon: "⬡", color: "text-violet-400",  bg: "from-violet-500/10 to-purple-500/5" },
  "Travel": { icon: "✈", color: "text-sky-400",     bg: "from-sky-500/10 to-cyan-500/5" },
}

// Fortune stars display
function FortuneStars({ level }: { level: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mt-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: i < level ? 1 : 0.15, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.08, type: "spring", damping: 12 }}
          className={`w-2 h-2 rounded-full ${
            i < level ? "bg-gold shadow-[0_0_6px_rgba(201,168,76,0.5)]" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  )
}

// Haptic feedback
function triggerHaptic(pattern: "light" | "medium" | "heavy" | "success" | "error") {
  if (typeof navigator === "undefined" || !navigator.vibrate) return
  const patterns: Record<string, number[]> = {
    light:   [10],
    medium:  [20, 30, 20],
    heavy:   [30, 50, 30, 50, 30],
    success: [10, 50, 10, 50, 30],
    error:   [50, 30, 50],
  }
  navigator.vibrate(patterns[pattern] || [10])
}

// Star axis rotation (7-theme star chart)
function StarAxis({ spinning, theme }: { spinning: boolean; theme?: string }) {
  const totem = theme ? THEME_TOTEM[theme] : null
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-48 h-48 border border-gold/15 rounded-full
        ${spinning ? "animate-[spin_2.5s_linear_infinite]" : ""}`}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * 360
          return (
            <div
              key={`o-${i}`}
              className="absolute w-1 h-1 rounded-full bg-gold/40"
              style={{
                left: "50%",
                top: "0%",
                transform: `rotate(${angle}deg) translateY(-2px)`,
                transformOrigin: "0 240px",
              }}
            />
          )
        })}
      </div>

      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-32 h-32 border border-gold/25 rounded-full
        ${spinning ? "animate-[spin_1.8s_linear_infinite_reverse]" : ""}`}
      />

      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-16 h-16 border border-gold/35 rounded-full
        ${spinning ? "animate-[spin_1.2s_linear_infinite]" : ""}`}
      >
        {totem && spinning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg ${totem.color} animate-pulse`}>{totem.icon}</span>
          </div>
        )}
      </div>

      {spinning && Object.entries(THEME_TOTEM).map(([name, info], i) => {
        const angle = (i / 7) * Math.PI * 2 - Math.PI / 2
        const r = 70 + (i % 2) * 18
        const isActive = name === theme
        return (
          <div
            key={name}
            className={`absolute w-2 h-2 rounded-full transition-all duration-500 ${
              isActive
                ? "bg-gold shadow-[0_0_10px_rgba(201,168,76,0.8)] scale-150"
                : "bg-white/30 scale-100"
            }`}
            style={{
              left: `calc(50% + ${Math.cos(angle) * r}px)`,
              top: `calc(50% + ${Math.sin(angle) * r}px)`,
              animation: `star-particle ${1 + (i % 3) * 0.3}s ease-in-out infinite ${i * 0.15}s`,
            }}
          />
        )
      })}
    </div>
  )
}

// Fortune badge with gold particles + mist
function FortuneBadge({ fortune, level }: { fortune: string; level: number }) {
  const isHighFortune = level >= 5
  return (
    <motion.div
      className="text-center mb-6 relative"
      initial={{ opacity: 0, scale: 0.5, rotateZ: -10 }}
      animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
      transition={{ type: "spring", damping: 12, stiffness: 150 }}
    >
      {isHighFortune && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold"
              initial={{ opacity: 0, y: 0, x: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [-20, -40 - Math.random() * 20],
                x: [(i - 4) * 8, (i - 4) * 12 + (Math.random() - 0.5) * 20],
              }}
              transition={{
                duration: 1.5,
                delay: 0.3 + i * 0.1,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              style={{ left: "50%", top: "50%" }}
            />
          ))}
        </div>
      )}

      {level <= 2 && (
        <div className="absolute -inset-4 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent rounded-full animate-pulse" />
        </div>
      )}

      <div className={`relative inline-flex items-center gap-2 px-6 py-3 rounded-full
                bg-gradient-to-r ${FORTUNE_COLORS[fortune] || "from-gold to-[#E8CB7A]"}
                text-ink font-bold text-2xl shadow-lg ${
                  isHighFortune ? "shadow-gold/30" : ""
                }`}>
        <span className="text-xl">{FORTUNE_EMOJI[fortune] || "✨"}</span>
        <span>{fortune}</span>
      </div>

      <FortuneStars level={level} />
    </motion.div>
  )
}

// ── localStorage cache helpers ──────────────────────────────────────────────
function _cacheKey(): string {
  const today = new Date().toISOString().slice(0, 10) // "2026-05-23"
  return `divination_result_${today}`
}

function loadCachedResult(): DivinationResult | null {
  try {
    const raw = localStorage.getItem(_cacheKey())
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveCachedResult(result: DivinationResult) {
  try { localStorage.setItem(_cacheKey(), JSON.stringify(result)) } catch {}
}

export function CelestialOracle() {
  const { user } = useAuth()
  const { t, locale } = useLanguage()
  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle")
  const [result, setResult] = useState<DivinationResult | null>(null)
  const [todayFree, setTodayFree] = useState(true)
  const [shareReward, setShareReward] = useState(0)
  const [checking, setChecking] = useState(true)  // 正在检查今日是否已抽过
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      setChecking(false)
      return
    }

    // 1) 优先从 localStorage 缓存加载，瞬间显示
    const cached = loadCachedResult()
    if (cached) {
      setResult(cached)
      setPhase("result")
      setTodayFree(false)
      setChecking(false)
      // 后台静默刷新，确保数据最新
      api.get("/api/divination/today-result", { params: { lang: locale } }).then(r => {
        if (r.data.has_drawn) {
          setResult(r.data)
          saveCachedResult(r.data)
        }
      }).catch(() => {})
      return
    }

    // 2) 无缓存，走 API 检查
    api.get("/api/divination/today-result", { params: { lang: locale } })
      .then(r => {
        if (r.data.has_drawn) {
          setResult(r.data)
          setPhase("result")
          setTodayFree(false)
          saveCachedResult(r.data)
        }
      })
      .catch(() => {
        api.get("/api/divination/today-status")
          .then(async r => {
            if (!r.data.is_free) {
              setTodayFree(false)
              const res = await api.post("/api/divination/draw", { use_free: false }, { params: { lang: locale } })
              setResult(res.data)
              setPhase("result")
              saveCachedResult(res.data)
            }
          })
          .catch(() => {})
      })
      .finally(() => setChecking(false))
  }, [user, locale])

  useEffect(() => {
    let lastShake = 0
    const threshold = 15

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity
      if (!acc) return
      const total = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0)
      if (total > threshold && Date.now() - lastShake > 2000) {
        lastShake = Date.now()
        triggerHaptic("heavy")
        handleDivine()
      }
    }

    if (typeof DeviceMotionEvent !== "undefined") {
      window.addEventListener("devicemotion", handleMotion)
      return () => window.removeEventListener("devicemotion", handleMotion)
    }
  }, [phase, todayFree])

  const handleDivine = useCallback(async () => {
    if (phase === "spinning") return
    if (!user) {
      toast.error(t("divination.loginFirst"))
      return
    }

    triggerHaptic("medium")
    setPhase("spinning")

    try {
      const res = await api.post("/api/divination/draw", {
        use_free: todayFree,
      }, { params: { lang: locale } })
      // API 返回即有结果，无需额外等待
      setResult(res.data)
      setPhase("result")
      setTodayFree(false)
      saveCachedResult(res.data)
      setShareReward(0)

      const level = res.data.fortune_level
      if (level >= 5) {
        triggerHaptic("success")
      } else if (level <= 2) {
        triggerHaptic("error")
      } else {
        triggerHaptic("light")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("divination.drawFailed"))
      setPhase("idle")
    }
  }, [phase, todayFree, user, t, locale])

  const handleShare = async () => {
    if (!result) return
    triggerHaptic("light")
    try {
      const res = await api.post("/api/divination/share", {
        divination_id: result.id,
      }, { params: { lang: locale } })
      const shareUrl = res.data.share_url
      const reward = res.data.share_reward || 0
      const todayCount = res.data.today_share_count || 0

      if (reward > 0) {
        setShareReward(reward)
        setResult(prev => prev ? { ...prev, balance_after: res.data.balance_after } : prev)
        toast.success(t("divination.shareSuccess").replace("{count}", String(reward)) + " ✨")
      } else if (todayCount >= 1) {
        toast(t("divination.shareLimitReached"), { icon: "ℹ️" })
      }

      if (navigator.share) {
        await navigator.share({ title: t("divination.shareTitle"), url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success(t("divination.linkCopied"))
      }
    } catch {
      toast.error(t("divination.shareFailed"))
    }
  }

  const handleReset = () => {
    triggerHaptic("light")
    setPhase("idle")
    setResult(null)
  }

  const themeTotem = result?.theme ? THEME_TOTEM[result.theme] : null

  return (
    <div className="card-glass p-8 relative overflow-hidden" ref={cardRef}>
      <StarAxis spinning={phase === "spinning"} theme={result?.theme} />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-3">
            <Sparkles size={24} className="text-gold" />
          </div>
          <h3 className="font-serif text-xl font-bold text-gold">{t("divination.title")}</h3>
          <p className="text-white/40 text-sm mt-1">
            {phase === "result" && !todayFree
              ? t("divination.todayAlreadyDrawn")
              : t("divination.todayFirstFree")
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Checking phase — 正在检查今日是否已抽过 */}
          {checking && (
            <motion.div
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
              <p className="text-white/30 text-xs mt-3">{t("divination.aligning")}</p>
            </motion.div>
          )}

          {/* Idle phase — 今日未抽过才显示 */}
          {!checking && phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <button
                onClick={handleDivine}
                className="relative group"
              >
                <div className="absolute -inset-2 rounded-full bg-gold/10 animate-pulse pointer-events-none" />
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gold/20 to-gold/5
                              border-2 border-gold/30 flex items-center justify-center
                              group-hover:border-gold/60 group-hover:shadow-[0_0_40px_rgba(201,168,76,0.3)]
                              transition-all duration-300 active:scale-95">
                  <div className="text-center">
                    <Sparkles size={28} className="text-gold mx-auto mb-1" />
                    <span className="text-gold text-xs font-medium">{t("divination.clickToDraw")}</span>
                  </div>
                </div>
              </button>
              <p className="text-white/30 text-xs mt-4">
                <Hand size={10} className="inline mr-1" />
                {t("divination.shakeHint")}
              </p>
            </motion.div>
          )}

          {/* Spinning phase */}
          {phase === "spinning" && (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-gold/40
                              animate-[spin_2s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-gold/30
                              animate-[spin_1.5s_linear_infinite_reverse]" />
                <div className="absolute inset-4 rounded-full border border-gold/20
                              animate-[spin_1s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={20} className="text-gold animate-pulse" />
                </div>
              </div>
              <p className="text-gold/60 text-sm mt-4 animate-pulse">
                {t("divination.aligning")}
              </p>
              {result?.theme && (
                <p className="text-white/20 text-xs mt-1">
                  {t("divination.sensingEnergy").replace("{theme}", result.theme)}
                </p>
              )}
            </motion.div>
          )}

          {/* Result phase */}
          {phase === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <FortuneBadge fortune={result.fortune} level={result.fortune_level} />

              {themeTotem && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-center mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full
                    bg-gradient-to-r ${themeTotem.bg} border border-white/10`}
                >
                  <span className={`text-lg ${themeTotem.color}`}>{themeTotem.icon}</span>
                  <span className="text-white/60 text-xs">{t("divination.todayPalace")}</span>
                  <span className={`text-xs font-medium ${themeTotem.color}`}>{result.theme}</span>
                </motion.div>
              )}

              {/* Wisdom quote */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 rounded-xl p-5 mb-4 border border-white/10"
              >
                <p className="text-white/80 text-sm leading-relaxed italic">
                  &ldquo;{(result as any).wisdom_quote || (result as any).wisdom_quote_en}&rdquo;
                </p>
                <p className="text-gold/60 text-xs mt-3 text-right">
                  —— {result.author}
                </p>
              </motion.div>

              {/* AI insight */}
              {result.ai_insight && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gold/5 rounded-xl p-4 mb-4 border border-gold/15"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-gold/60 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gold/50 text-[10px] uppercase tracking-wider mb-1.5">{t("divination.aiGuide")}</p>
                      <p className="text-white/70 text-xs leading-relaxed">{result.ai_insight}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Cost info */}
              {!result.is_free && (
                <div className="flex items-center justify-center gap-2 text-xs text-white/30 mb-3">
                  <Zap size={12} className="text-gold/50" />
                  <span>{t("divination.costInfo").replace("{cost}", String(result.stardust_cost)).replace("{balance}", String(result.balance_after))}</span>
                </div>
              )}

              {/* Share reward */}
              {shareReward > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center mb-3"
                >
                  <span className="text-gold text-xs">
                    <Gift size={12} className="inline mr-1" />
                    {t("divination.shareReward").replace("{count}", String(shareReward))}
                  </span>
                </motion.div>
              )}

              {/* Low balance guidance */}
              {result.balance_after < 5 && !result.is_free && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-gold/5 to-gold/10 border border-gold/20 rounded-xl p-4 mb-4"
                >
                  <p className="text-gold/80 text-xs font-medium mb-2">
                    {t("divination.limitReached")}
                  </p>
                  <p className="text-white/30 text-[11px] mb-3 leading-relaxed">
                    {t("divination.refillHint")}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href="/pricing"
                      className="flex-1 text-center py-2 rounded-lg bg-gold/15 border border-gold/25 text-gold text-xs
                               hover:bg-gold/25 transition-all"
                    >
                      {t("divination.rechargeStardust")}
                    </Link>
                    <Link
                      href="/referral"
                      className="flex-1 text-center py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs
                               hover:bg-white/10 hover:text-gold transition-all"
                    >
                      {t("divination.inviteFriends")}
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                           bg-white/5 border border-white/10 text-white/60 text-sm
                           hover:bg-white/10 hover:text-gold transition-all"
                >
                  <Share2 size={14} />
                  {t("divination.shareFortune")}
                </button>
                {todayFree ? (
                  <button
                    onClick={handleReset}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                             border border-gold/30 text-gold text-sm
                             hover:bg-gold/10 transition-all"
                  >
                    <RotateCcw size={14} />
                    {t("divination.drawAgain2")}
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                               border border-white/10 text-white/30 text-sm cursor-default">
                    <Sparkles size={14} />
                    {t("divination.comeBackTomorrow")}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
