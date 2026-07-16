"use client"
export const dynamic = "force-dynamic"
import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
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
  "Excellent Rating": "from-gold to-[#E8CB7A]",
  "Good Rating": "from-green-400 to-emerald-300",
  "Mild Rating": "from-blue-400 to-cyan-300",
  "Auspicious": "from-teal-400 to-cyan-400",
  "Moderate": "from-yellow-500 to-amber-400",
  "Inauspicious": "from-orange-500 to-red-400",
  "Great Unfavorable": "from-red-500 to-rose-400",
}

const FORTUNE_EMOJI: Record<string, string> = {
  "大吉": "✨", "中吉": "🌟", "小吉": "⭐",
  "吉": "🌤", "末吉": "🌙", "凶": "🌑", "大凶": "⛈",
  "Excellent Rating": "✨", "Good Rating": "🌟", "Mild Rating": "⭐",
  "Auspicious": "🌤", "Moderate": "🌙", "Inauspicious": "🌑", "Great Unfavorable": "⛈",
}

const THEME_BG: Record<string, string> = {
  "事业": "from-amber-900/20 via-[#0d0b08] to-[#1a1510]",
  "感情": "from-pink-900/20 via-[#0d0b08] to-[#1a1510]",
  "财运": "from-emerald-900/20 via-[#0d0b08] to-[#1a1510]",
  "健康": "from-teal-900/20 via-[#0d0b08] to-[#1a1510]",
  "学业": "from-blue-900/20 via-[#0d0b08] to-[#1a1510]",
  "人际": "from-violet-900/20 via-[#0d0b08] to-[#1a1510]",
  "出行": "from-sky-900/20 via-[#0d0b08] to-[#1a1510]",
  "Career": "from-amber-900/20 via-[#0d0b08] to-[#1a1510]",
  "Love": "from-pink-900/20 via-[#0d0b08] to-[#1a1510]",
  "Wealth": "from-emerald-900/20 via-[#0d0b08] to-[#1a1510]",
  "Health": "from-teal-900/20 via-[#0d0b08] to-[#1a1510]",
  "Studies": "from-blue-900/20 via-[#0d0b08] to-[#1a1510]",
  "Social": "from-violet-900/20 via-[#0d0b08] to-[#1a1510]",
  "Travel": "from-sky-900/20 via-[#0d0b08] to-[#1a1510]",
}

const THEME_TOTEM: Record<string, string> = {
  "事业": "⚔", "感情": "♥", "财运": "◎",
  "健康": "☯", "学业": "☰", "人际": "⬡", "出行": "✈",
  "Career": "⚔", "Love": "♥", "Wealth": "◎",
  "Health": "☯", "Studies": "☰", "Social": "⬡", "Travel": "✈",
}

export default function DivinationSharePage() {
  const params = useParams()
  const id = params.id as string
  const { t, locale } = useLanguage()
  const [data, setData] = useState<DivinationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Deterministic particle positions (seeded PRNG, no hydrate mismatch)
  const particles = useMemo(() => {
    let sd = 271; const r = () => { sd = (sd * 16807 + 0) % 2147483647; return (sd - 1) / 2147483646 }
    return Array.from({ length: 12 }, () => ({
      left: 10 + r() * 80, top: 10 + r() * 80,
      dur: 2 + r() * 2, delay: r() * 2,
    }))
  }, [])

  useEffect(() => {
    api.get(`/api/divination/share/${id}`, { params: { lang: locale } })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, locale])

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
  const isHighRating = data.fortune_level >= 5

  const dateStr = data.created_at
    ? new Date(data.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric" })
    : ""

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="relative rounded-2xl overflow-hidden anim-slide-up">
          <div className={`absolute inset-0 bg-gradient-to-b ${bgTheme}`} />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

          {isHighRating && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map((p, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-0.5 rounded-full bg-gold/60"
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    animation: `star-particle ${p.dur}s ease-in-out infinite ${p.delay}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative p-8 text-center">
            {data.is_founder && data.seat_no && (
              <div className="mb-6 anim-slide-up anim-delay-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                              bg-gold/10 border border-gold/25">
                  <Crown size={12} className="text-gold" />
                  <span className="text-gold text-[11px] font-medium tracking-wide">
                    {t("divination.share.founderSeat").replace("{seatNo}", String(data.seat_no))}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles size={16} className="text-gold" />
              <span className="font-serif text-gold text-sm">{t("divination.share.appName")}</span>
            </div>

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

            <div className="mb-6 anim-slide-up anim-delay-2" style={{ animation: "slideUp 0.5s cubic-bezier(0.32, 0.72, 0, 1) 0.2s forwards", opacity: 0 }}>
              <div className={`inline-flex items-center gap-2 px-8 py-4 rounded-full
                            bg-gradient-to-r ${FORTUNE_COLORS[data.fortune] || "from-gold to-[#E8CB7A]"}
                            text-ink font-bold text-3xl ${isHighRating ? "shadow-lg shadow-gold/20" : ""}`}>
                <span>{FORTUNE_EMOJI[data.fortune] || "✨"}</span>
                <span>{data.fortune}</span>
              </div>
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
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <Sparkles size={12} className="text-gold/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>

            <div className="mb-5">
              <p className="text-white/70 text-sm leading-relaxed italic">
                &ldquo;{(data as typeof data & { wisdom_quote?: string; wisdom_quote_en?: string }).wisdom_quote || (data as typeof data & { wisdom_quote?: string; wisdom_quote_en?: string }).wisdom_quote_en}&rdquo;
              </p>
              <p className="text-gold/50 text-xs mt-3">—— {data.author}</p>
            </div>

            {data.ai_insight && (
              <div className="bg-gold/5 rounded-xl p-4 mb-5 border border-gold/15 text-left anim-fade-in" style={{ animationDelay: "0.5s" }}>
                <p className="text-gold/50 text-[10px] uppercase tracking-wider mb-1.5">{t("divination.share.aiAction")}</p>
                <p className="text-white/60 text-xs leading-relaxed">{data.ai_insight}</p>
              </div>
            )}

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <Zap size={12} className="text-gold/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>

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

            <div className="bg-gradient-to-r from-gold/5 to-gold/10 rounded-xl p-4 border border-gold/20 mb-4 anim-slide-up" style={{ animationDelay: "0.7s" }}>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Gift size={14} className="text-gold" />
                <p className="text-gold text-xs font-medium">{t("divination.share.shareForStardust")}</p>
              </div>
              <p className="text-white/40 text-[11px] mb-3">{t("divination.share.inviteDesc")}</p>

              {data.referral_code && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white/30 text-[10px] mb-1.5">{t("divination.share.myReferralCode")}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-gold text-lg tracking-widest">{data.referral_code}</span>
                  </div>
                </div>
              )}
            </div>

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
        </div>
      </div>
    </div>
  )
}
