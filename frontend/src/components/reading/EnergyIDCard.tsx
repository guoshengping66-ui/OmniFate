"use client"
import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { Share2, Copy, Check, ShieldCheck, Fingerprint } from "lucide-react"
import toast from "react-hot-toast"
import { useLanguage } from "@/contexts/LanguageContext"

interface EnergyIDCardProps {
  sessionId: string
  userId?: string | null
  dimensionScores?: Record<string, number>
  generatedAt?: string
}

const DIM_LABELS: Record<string, string> = {
  wealth: "财富", career: "事业", relationship: "感情",
  health: "健康", spiritual: "精神",
}

const DIM_EMOJI: Record<string, string> = {
  wealth: "💰", career: "💼", relationship: "💕", health: "🏥", spiritual: "🧘",
}

const DIM_I18N: Record<string, string> = {
  wealth: "reading.dim.wealth", career: "reading.dim.career",
  relationship: "reading.dim.relationship", health: "reading.dim.health",
  spiritual: "reading.dim.spiritual",
}

function generateCardId(sessionId: string, userId?: string | null): string {
  // Use userId when available (consistent across all user's reports),
  // fall back to sessionId hash for anonymous users
  const source = userId || sessionId
  let hash = 0
  for (let i = 0; i < source.length; i++) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0
  }
  const abs = Math.abs(hash)
  const part1 = String(abs % 10000).padStart(4, "0")
  const part2 = String((abs * 7) % 10000).padStart(4, "0")
  return `DM-2026-${part1}-${part2}`
}

export function EnergyIDCard({ sessionId, userId, dimensionScores, generatedAt }: EnergyIDCardProps) {
  const { t } = useLanguage()
  const cardId = generateCardId(sessionId, userId)
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  // 3D tilt effect
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(y, [0, 1], [6, -6]), { stiffness: 200, damping: 30 })
  const rotateY = useSpring(useTransform(x, [0, 1], [-6, 6]), { stiffness: 200, damping: 30 })

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600)
    return () => clearTimeout(t)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width)
    y.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0.5)
    y.set(0.5)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardId)
      setCopied(true)
      toast.success("编号已复制")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("复制失败")
    }
  }

  const handleShare = async () => {
    const text = `🔮 ${t("energyId.shareText")}\n\n✨ ${cardId}\n⚡ AI Certified\n\n→`
    if (navigator.share) {
      try {
        await navigator.share({ title: t("energyId.shareTitle"), text })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      toast.success(t("energyId.copied"))
    }
  }

  // Generate min pentagon path
  const radarPoints = dimensionScores
    ? Object.values(dimensionScores).map((v, i) => {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
        const r = 32 * (v / 10)
        return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`
      }).join(" ")
    : ""

  const gridPoints = [0.2, 0.4, 0.6, 0.8, 1].map((scale) =>
    [0, 1, 2, 3, 4].map(i => {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
      const r = 32 * scale
      return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`
    }).join(" ")
  )

  const formatDate = (iso?: string) => {
    if (!iso) {
      const d = new Date()
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
    }
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="my-8"
    >
      {/* Label */}
      <div className="flex items-center gap-2 mb-4">
        <Fingerprint size={16} className="text-gold/60" />
        <span className="text-gold/60 text-xs tracking-[0.15em] uppercase font-medium">{t("energyId.label")}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
      </div>

      {/* Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 800,
        }}
        className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden cursor-default"
      >
        {/* Holographic border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            padding: "1.5px",
            background: "conic-gradient(from var(--angle,0deg), rgba(201,168,76,0.5), rgba(168,85,247,0.4), rgba(59,130,246,0.4), rgba(16,185,129,0.3), rgba(201,168,76,0.5))",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            animation: "glow-rotate 6s linear infinite",
          }}
        />

        {/* Card content */}
        <div className="relative overflow-hidden" style={{
          background: "linear-gradient(135deg, #1a1030 0%, #0f0a1e 40%, #1a1030 70%, #12091f 100%)",
        }}>
          {/* Animated holographic sheen */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              background: "linear-gradient(105deg, transparent 30%, rgba(201,168,76,0.6) 45%, rgba(168,85,247,0.4) 50%, rgba(59,130,246,0.3) 55%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "holographic-sheen 5s ease-in-out infinite",
            }}
          />

          {/* Ambient glow spots */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.4), transparent)" }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[60px] opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4), transparent)" }} />

          <div className="relative p-6">
            {/* Top row: logo + share */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <span className="text-gold text-xs font-serif font-bold">命</span>
                </div>
                <div>
                  <p className="text-gold text-xs font-semibold tracking-wide">{t("energyId.brand")}</p>
                  <p className="text-white/20 text-[9px]">DESTINY MIRROR</p>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 transition-all text-[10px]"
              >
                <Share2 size={10} />
                {t("energyId.shareBtn")}
              </button>
            </div>

            {/* Main content: radar + info */}
            <div className="flex items-center gap-5 mb-5">
              {/* Mini radar */}
              <div className="w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {gridPoints.map((pts, si) => (
                    <polygon
                      key={si}
                      points={pts}
                      fill="none"
                      stroke="#C9A84C"
                      strokeOpacity={0.05 + 0.04 * si}
                      strokeWidth={0.3}
                    />
                  ))}
                  {radarPoints && (
                    <polygon
                      points={radarPoints}
                      fill="rgba(201,168,76,0.1)"
                      stroke="#C9A84C"
                      strokeWidth={1}
                      strokeOpacity={0.6}
                    />
                  )}
                  {/* Dim labels */}
                  {dimensionScores && Object.keys(DIM_LABELS).map((key, i) => {
                    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
                    const r = 42
                    return (
                      <text
                        key={key}
                        x={50 + r * Math.cos(a)}
                        y={50 + r * Math.sin(a)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fillOpacity="0.25"
                        fontSize="5"
                      >
                        {DIM_EMOJI[key]}
                      </text>
                    )
                  })}
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white/25 text-[9px] tracking-widest mb-1">ENERGY DIGITAL ID</p>
                <p className="text-white font-serif font-bold text-lg tracking-wider mb-2"
                  style={{
                    background: "linear-gradient(135deg, #E8CB7A, #C9A84C, #F0D68A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {cardId}
                </p>

                {/* Score pills */}
                {dimensionScores && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(dimensionScores).map(([key, val]) => (
                      <span
                        key={key}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40"
                      >
                        {t(DIM_I18N[key] || `reading.dim.${key}`)} {val.toFixed(1)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-green-400/50" />
                <span className="text-white/25 text-[9px]">{t("energyId.certLabel")}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/15 text-[9px]">{formatDate(generatedAt)}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-white/30 hover:text-gold transition-colors"
                >
                  {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                  <span className="text-[9px]">{copied ? "已复制" : "复制编号"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
