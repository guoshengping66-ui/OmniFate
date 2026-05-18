"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Sparkles, Zap, Gift, Crown, Share2 } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

interface DivinationData {
  id: string
  fortune: string
  fortune_level: number
  wisdom_quote: string
  author: string
  theme: string
  ai_insight: string
  user_name: string
  seat_no: number | null
  is_founder: boolean
  referral_code: string | null
  created_at: string | null
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
  "大吉": "✨", "中吉": "🌟", "小吉": "⭐",
  "吉": "🌤", "末吉": "🌙", "凶": "🌑", "大凶": "⛈",
}

// Phase 2: 主题动态星图背景色
const THEME_BG: Record<string, string> = {
  "事业": "from-amber-900/20 via-[#0d0b08] to-[#1a1510]",
  "感情": "from-pink-900/20 via-[#0d0b08] to-[#1a1510]",
  "财运": "from-emerald-900/20 via-[#0d0b08] to-[#1a1510]",
  "健康": "from-teal-900/20 via-[#0d0b08] to-[#1a1510]",
  "学业": "from-blue-900/20 via-[#0d0b08] to-[#1a1510]",
  "人际": "from-violet-900/20 via-[#0d0b08] to-[#1a1510]",
  "出行": "from-sky-900/20 via-[#0d0b08] to-[#1a1510]",
}

const THEME_TOTEM: Record<string, string> = {
  "事业": "⚔", "感情": "♥", "财运": "◎",
  "健康": "☯", "学业": "☰", "人际": "⬡", "出行": "✈",
}

export default function DivinationSharePage() {
  const params = useParams()
  const id = params.id as string
  const { t } = useLanguage()
  const [data, setData] = useState<DivinationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get(`/api/divination/share/${id}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleCopyLink = async () => {
    try {
      const url = window.location.href
      if (data?.referral_code) {
        await navigator.clipboard.writeText(`${url}?ref=${data.referral_code}`)
      } else {
        await navigator.clipboard.writeText(url)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <p className="text-white/40">{t("divination.share.notFound")}</p>
      </div>
    )
  }

  const bgTheme = THEME_BG[data.theme] || "from-[#1a1510] via-[#0d0b08] to-[#1a1510]"
  const totemIcon = THEME_TOTEM[data.theme] || "✧"
  const isHighFortune = data.fortune_level >= 5

  // Format date
  const dateStr = data.created_at
    ? new Date(data.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric" })
    : ""

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4 py-12">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Phase 2: 主题动态星图背景 */}
          <div className={`absolute inset-0 bg-gradient-to-b ${bgTheme}`} />

          {/* 顶部金线 */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

          {/* Phase 2: 金粒子浮动效果（大吉/中吉） */}
          {isHighFortune && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-0.5 rounded-full bg-gold/60"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animation: `star-particle ${2 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative p-8 text-center">
            {/* Phase 2: 身份锚点（创始人专属） */}
            {data.is_founder && data.seat_no && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                              bg-gold/10 border border-gold/25">
                  <Crown size={12} className="text-gold" />
                  <span className="text-gold text-[11px] font-medium tracking-wide">
                    {t("divination.share.founderSeat").replace("{seatNo}", String(data.seat_no))}
                  </span>
                </div>
              </motion.div>
            )}

            {/* App branding */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles size={16} className="text-gold" />
              <span className="font-serif text-gold text-sm">{t("divination.share.appName")}</span>
            </div>

            {/* Phase 2: 主题图腾 + 日期 */}
            {data.theme && (
              <div className="flex items-center justify-center gap-2 mb-4 text-white/30 text-xs">
                <span className="text-base">{totemIcon}</span>
                <span>{data.theme}</span>
                {dateStr && (
                  <>
                    <span className="text-gold/20">·</span>
                    <span>{dateStr}</span>
                  </>
                )}
              </div>
            )}

            {/* Fortune badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="mb-6"
            >
              <div className={`inline-flex items-center gap-2 px-8 py-4 rounded-full
                            bg-gradient-to-r ${FORTUNE_COLORS[data.fortune] || "from-gold to-[#E8CB7A]"}
                            text-ink font-bold text-3xl ${isHighFortune ? "shadow-lg shadow-gold/20" : ""}`}>
                <span>{FORTUNE_EMOJI[data.fortune] || "✨"}</span>
                <span>{data.fortune}</span>
              </div>
              {/* 运势星级 */}
              <div className="flex items-center justify-center gap-1 mt-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i < data.fortune_level ? "bg-gold" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <Sparkles size={12} className="text-gold/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>

            {/* Wisdom quote */}
            <div className="mb-5">
              <p className="text-white/70 text-sm leading-relaxed italic">
                "{data.wisdom_quote}"
              </p>
              <p className="text-gold/50 text-xs mt-3">—— {data.author}</p>
            </div>

            {/* Phase 2: AI 深度解析 */}
            {data.ai_insight && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gold/5 rounded-xl p-4 mb-5 border border-gold/15 text-left"
              >
                <p className="text-gold/50 text-[10px] uppercase tracking-wider mb-1.5">{t("divination.share.aiAction")}</p>
                <p className="text-white/60 text-xs leading-relaxed">{data.ai_insight}</p>
              </motion.div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <Zap size={12} className="text-gold/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>

            {/* User info / Founder badge */}
            <div className="mb-5">
              {data.seat_no && !data.is_founder && (
                <div className="inline-flex items-center gap-1.5 text-gold/60 text-xs mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  {t("divination.share.seatLabel").replace("{seatNo}", String(data.seat_no))}
                </div>
              )}
              {data.user_name && (
                <p className="text-white/30 text-xs">{t("divination.share.userReading").replace("{name}", data.user_name)}</p>
              )}
            </div>

            {/* Phase 2: 裂变引导 — 分享即赠星尘 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-gold/5 to-gold/10 rounded-xl p-4 border border-gold/20 mb-4"
            >
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Gift size={14} className="text-gold" />
                <p className="text-gold text-xs font-medium">{t("divination.share.shareForStardust")}</p>
              </div>
              <p className="text-white/40 text-[11px] mb-3">
                {t("divination.share.inviteDesc")}
              </p>

              {data.referral_code && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white/30 text-[10px] mb-1.5">{t("divination.share.myReferralCode")}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-gold text-lg tracking-widest">{data.referral_code}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Phase 2: 分享按钮（含邀请链接） */}
            <button
              onClick={handleCopyLink}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                       bg-gold/15 border border-gold/30 text-gold text-sm font-medium
                       hover:bg-gold/25 transition-all active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <span className="text-green-400">✓</span>
                  {t("divination.share.copiedWithCode")}
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  {t("divination.share.copyShareLink")}
                </>
              )}
            </button>

            {/* CTA */}
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full
                       bg-white/5 border border-white/10 text-white/40 text-sm
                       hover:bg-white/10 hover:text-gold transition-all"
            >
              <Sparkles size={14} />
              {t("divination.share.exploreMyChart")}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
