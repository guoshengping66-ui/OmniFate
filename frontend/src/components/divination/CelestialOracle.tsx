"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Share2, RotateCcw, Zap } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"

interface DivinationResult {
  id: string
  fortune: string
  fortune_level: number     // 1-7 (大凶→大吉)
  wisdom_quote: string
  author: string
  theme: string
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
}

const FORTUNE_EMOJI: Record<string, string> = {
  "大吉": "✨",
  "中吉": "🌟",
  "小吉": "⭐",
  "吉": "🌤",
  "末吉": "🌙",
  "凶": "🌑",
  "大凶": "⛈",
}

// 星象排列视觉效果
function StarField({ spinning }: { spinning: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 中心星轴 */}
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-48 h-48 border border-gold/20 rounded-full
        ${spinning ? "animate-[spin_2s_linear_infinite]" : ""}`}
      />
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-32 h-32 border border-gold/30 rounded-full
        ${spinning ? "animate-[spin_1.5s_linear_infinite_reverse]" : ""}`}
      />
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-16 h-16 border border-gold/40 rounded-full
        ${spinning ? "animate-[spin_1s_linear_infinite]" : ""}`}
      />

      {/* 星点 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360
        const rad = (angle * Math.PI) / 180
        const r = 80 + (i % 3) * 20
        return (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gold rounded-full"
            style={{
              left: `calc(50% + ${Math.cos(rad) * r}px)`,
              top: `calc(50% + ${Math.sin(rad) * r}px)`,
              opacity: spinning ? 0.8 : 0.3,
              animation: spinning ? `star-particle ${1 + (i % 3) * 0.3}s ease-in-out infinite ${i * 0.1}s` : "none",
            }}
          />
        )
      })}
    </div>
  )
}

export function CelestialOracle() {
  const { user } = useAuth()
  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle")
  const [result, setResult] = useState<DivinationResult | null>(null)
  const [todayFree, setTodayFree] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)

  // Check if today's free divination is used
  useEffect(() => {
    if (!user) return
    api.get("/api/divination/today-status")
      .then(r => setTodayFree(r.data.is_free))
      .catch(() => {})
  }, [user])

  // Device shake detection
  useEffect(() => {
    let lastShake = 0
    const threshold = 15

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity
      if (!acc) return
      const total = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0)
      if (total > threshold && Date.now() - lastShake > 2000) {
        lastShake = Date.now()
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
      toast.error("请先登录后再抽签")
      return
    }

    setPhase("spinning")

    try {
      const res = await api.post("/api/divination/draw", {
        use_free: todayFree,
      })
      // Simulate spinning delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      setResult(res.data)
      setPhase("result")
      setTodayFree(false)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "抽签失败")
      setPhase("idle")
    }
  }, [phase, todayFree, user])

  const handleShare = async () => {
    if (!result) return
    try {
      const res = await api.post("/api/divination/share", {
        divination_id: result.id,
      })
      const shareUrl = res.data.share_url
      if (navigator.share) {
        await navigator.share({ title: "星际抽签", url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("分享链接已复制")
      }
    } catch {
      toast.error("分享失败")
    }
  }

  const handleReset = () => {
    setPhase("idle")
    setResult(null)
  }

  return (
    <div className="card-glass p-8 relative overflow-hidden" ref={cardRef}>
      <StarField spinning={phase === "spinning"} />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-3">
            <Sparkles size={24} className="text-gold" />
          </div>
          <h3 className="font-serif text-xl font-bold text-gold">星际抽签</h3>
          <p className="text-white/40 text-sm mt-1">
            {todayFree ? "今日首次免费" : "消耗 1 颗星尘"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Idle phase */}
          {phase === "idle" && (
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
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gold/20 to-gold/5
                              border-2 border-gold/30 flex items-center justify-center
                              group-hover:border-gold/60 group-hover:shadow-[0_0_40px_rgba(201,168,76,0.3)]
                              transition-all duration-300 active:scale-95">
                  <div className="text-center">
                    <Sparkles size={28} className="text-gold mx-auto mb-1" />
                    <span className="text-gold text-xs font-medium">点击摇签</span>
                  </div>
                </div>
              </button>
              <p className="text-white/30 text-xs mt-4">
                手机摇一摇或点击上方开始抽签
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
              <div className="w-24 h-24 mx-auto rounded-full border-2 border-gold/40
                            flex items-center justify-center animate-[spin_1s_linear_infinite]">
                <div className="w-16 h-16 rounded-full border border-gold/30
                              flex items-center justify-center animate-[spin_1.5s_linear_infinite_reverse]">
                  <Sparkles size={20} className="text-gold animate-pulse" />
                </div>
              </div>
              <p className="text-gold/60 text-sm mt-4 animate-pulse">
                星体排列中...
              </p>
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
              {/* Fortune badge */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full
                              bg-gradient-to-r ${FORTUNE_COLORS[result.fortune] || "from-gold to-[#E8CB7A]"}
                              text-ink font-bold text-2xl`}>
                  <span>{FORTUNE_EMOJI[result.fortune] || "✨"}</span>
                  <span>{result.fortune}</span>
                </div>
              </div>

              {/* Wisdom quote */}
              <div className="bg-white/5 rounded-xl p-5 mb-6 border border-white/10">
                <p className="text-white/80 text-sm leading-relaxed italic">
                  "{result.wisdom_quote}"
                </p>
                <p className="text-gold/60 text-xs mt-3 text-right">
                  —— {result.author}
                </p>
              </div>

              {/* Theme */}
              {result.theme && (
                <div className="text-center mb-4">
                  <span className="text-white/30 text-xs">今日主题：</span>
                  <span className="text-gold text-xs font-medium ml-1">{result.theme}</span>
                </div>
              )}

              {/* Cost info */}
              {!result.is_free && (
                <div className="flex items-center justify-center gap-2 text-xs text-white/30 mb-4">
                  <Zap size={12} className="text-gold/50" />
                  <span>消耗 {result.stardust_cost} 星尘 · 余额 {result.balance_after}</span>
                </div>
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
                  分享签文
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                           border border-gold/30 text-gold text-sm
                           hover:bg-gold/10 transition-all"
                >
                  <RotateCcw size={14} />
                  再来一签
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
