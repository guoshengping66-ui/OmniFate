"use client"
import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion"
import { Share2, Copy, Check, ShieldCheck, Fingerprint, RotateCcw, QrCode } from "lucide-react"
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

// ── QR Code Generator (lightweight, no deps) ────────────────────────────────

function generateQRMatrix(text: string, size: number = 25): boolean[][] {
  // Simple QR-like pattern generator for visual purposes
  // Real QR encoding would need a library; this creates a deterministic pattern
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isOuter = x === 0 || x === 6 || y === 0 || y === 6
        const isInner = x >= 2 && x <= 4 && y >= 2 && y <= 4
        if (isOuter || isInner) {
          matrix[startY + y][startX + x] = true
        }
      }
    }
  }

  drawFinder(0, 0)
  drawFinder(size - 7, 0)
  drawFinder(0, size - 7)

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }

  // Data area - hash-based deterministic pattern
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x]) continue
      if (x < 9 && y < 9) continue
      if (x >= size - 8 && y < 9) continue
      if (x < 9 && y >= size - 8) continue
      hash = ((hash << 5) - hash + (y * size + x)) | 0
      matrix[y][x] = (hash >>> 0) % 3 === 0
    }
  }

  return matrix
}

function QRCodeSVG({ text, size = 120 }: { text: string; size?: number }) {
  const matrix = useMemo(() => generateQRMatrix(text), [text])
  const cellSize = size / matrix.length

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <rect width={size} height={size} fill="white" rx="4" />
      {matrix.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#1a1030"
              rx={0.5}
            />
          ) : null
        )
      )}
    </svg>
  )
}

// ── Particle Ring ───────────────────────────────────────────────────────────

function ParticleRing() {
  const particles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      rx: 45 + Math.random() * 15, // % from center
      ry: 50 + Math.random() * 15,
      size: 2 + Math.random() * 2.5,
      opacity: 0.2 + Math.random() * 0.4,
      duration: 8 + Math.random() * 7,
      delay: Math.random() * -10,
    })),
    []
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: "50%",
            top: "50%",
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            background: `radial-gradient(circle, rgba(201,168,76,0.9), rgba(201,168,76,0.3))`,
            boxShadow: `0 0 ${p.size * 2}px rgba(201,168,76,0.4)`,
            "--rx": `${p.rx}%`,
            "--ry": `${p.ry}%`,
            "--op": p.opacity,
            animation: `particle-orbit ${p.duration}s linear ${p.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// ── Animated Radar ──────────────────────────────────────────────────────────

function AnimatedRadar({ scores, animate }: { scores: Record<string, number>; animate: boolean }) {
  const dims = Object.keys(scores)
  const n = dims.length

  const finalPoints = useMemo(() =>
    dims.map((_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2
      const r = 32 * ((scores[dims[i]] ?? 5) / 10)
      return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) }
    }),
    [scores, n, dims]
  )

  const gridPoints = [0.2, 0.4, 0.6, 0.8, 1].map((scale) =>
    dims.map((_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2
      const r = 32 * scale
      return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`
    }).join(" ")
  )

  const toStr = (pts: { x: number; y: number }[]) =>
    pts.map(p => `${p.x},${p.y}`).join(" ")

  const centerPoints = dims.map(() => ({ x: 50, y: 50 }))

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Grid */}
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
      {/* Animated data polygon */}
      <motion.polygon
        initial={{ points: toStr(centerPoints) }}
        animate={animate ? { points: toStr(finalPoints) } : { points: toStr(centerPoints) }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        fill="rgba(201,168,76,0.12)"
        stroke="#C9A84C"
        strokeWidth={1}
        strokeOpacity={0.6}
      />
      {/* Vertex dots */}
      {animate && finalPoints.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={1.5}
          fill="#C9A84C"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
        />
      ))}
      {/* Dim emoji labels */}
      {dims.map((key, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2
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
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export function EnergyIDCard({ sessionId, userId, dimensionScores, generatedAt }: EnergyIDCardProps) {
  const { t, locale } = useLanguage()
  const cardId = generateCardId(sessionId, userId)
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/reading/${sessionId}`
    : ""
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [shimmerActive, setShimmerActive] = useState(false)

  // 3D tilt effect
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(y, [0, 1], [6, -6]), { stiffness: 200, damping: 30 })
  const rotateY = useSpring(useTransform(x, [0, 1], [-6, 6]), { stiffness: 200, damping: 30 })

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600)
    return () => clearTimeout(t)
  }, [])

  // Shimmer cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerActive(true)
      setTimeout(() => setShimmerActive(false), 1500)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (flipped) return
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
      toast.success(t("reading.idCopied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("reading.copyFailed"))
    }
  }

  const handleShare = async () => {
    const text = `🔮 ${t("energyId.shareText")}\n\n✨ ${cardId}\n⚡ AI Certified\n\n${shareUrl}`
    if (navigator.share) {
      try {
        await navigator.share({ title: t("energyId.shareTitle"), text })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      toast.success(t("energyId.copied"))
    }
  }

  const formatDate = (iso?: string) => {
    const d = iso ? new Date(iso) : new Date()
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
  }

  const cardBackground = "linear-gradient(135deg, #1a1030 0%, #0f0a1e 40%, #1a1030 70%, #12091f 100%)"

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

      {/* Card with perspective */}
      <div
        className="relative w-full max-w-md mx-auto"
        style={{ perspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Particle ring */}
        <ParticleRing />

        {/* Flip container */}
        <div className={`card-flip-inner ${flipped ? "flipped" : ""}`} style={{ cursor: "pointer" }}>
          {/* ══════ FRONT ══════ */}
          <div className="card-flip-front relative rounded-2xl overflow-hidden">
            {/* Holographic border */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none z-10"
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
            <motion.div
              style={{
                rotateX: flipped ? 0 : rotateX,
                rotateY: flipped ? 0 : rotateY,
                transformPerspective: 800,
                background: cardBackground,
              }}
              className="relative overflow-hidden rounded-2xl"
            >
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare() }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 transition-all text-[10px]"
                    >
                      <Share2 size={10} />
                      {t("energyId.shareBtn")}
                    </button>
                  </div>
                </div>

                {/* Main content: radar + info */}
                <div className="flex items-center gap-5 mb-5">
                  {/* Animated radar */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <AnimatedRadar scores={dimensionScores || {}} animate={visible} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/25 text-[9px] tracking-widest mb-1">ENERGY DIGITAL ID</p>
                    {/* Shimmer ID text */}
                    <p
                      className="shimmer-id-text text-lg font-serif font-bold tracking-wider mb-2"
                      style={{
                        backgroundImage: shimmerActive
                          ? "linear-gradient(90deg, #C9A84C 0%, #F0D68A 25%, #fff 50%, #F0D68A 75%, #C9A84C 100%)"
                          : "linear-gradient(135deg, #E8CB7A, #C9A84C, #F0D68A)",
                        backgroundSize: shimmerActive ? "200% 100%" : "100% 100%",
                        animation: shimmerActive ? "shimmer-text 1.5s ease-in-out" : "none",
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
                      onClick={(e) => { e.stopPropagation(); handleCopy() }}
                      className="flex items-center gap-1 text-white/30 hover:text-gold transition-colors"
                    >
                      {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                      <span className="text-[9px]">{copied ? t("reading.copied") : t("reading.copyId")}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFlipped(true) }}
                      className="flex items-center gap-1 text-white/30 hover:text-gold transition-colors"
                      title={t("energyId.scanHint")}
                    >
                      <QrCode size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ══════ BACK (QR Code) ══════ */}
          <div className="card-flip-back absolute inset-0 rounded-2xl overflow-hidden">
            {/* Holographic border */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none z-10"
              style={{
                padding: "1.5px",
                background: "conic-gradient(from var(--angle,0deg), rgba(201,168,76,0.5), rgba(168,85,247,0.4), rgba(59,130,246,0.4), rgba(16,185,129,0.3), rgba(201,168,76,0.5))",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                animation: "glow-rotate 6s linear infinite",
              }}
            />

            <div className="relative rounded-2xl overflow-hidden h-full" style={{ background: cardBackground }}>
              {/* Ambient glow */}
              <div className="absolute top-0 left-0 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4), transparent)" }} />
              <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-15 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(201,168,76,0.4), transparent)" }} />

              <div className="relative p-6 flex flex-col items-center justify-center h-full min-h-[320px]">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
                    <span className="text-gold text-xs font-serif font-bold">命</span>
                  </div>
                  <div>
                    <p className="text-gold text-xs font-semibold tracking-wide">{t("energyId.brand")}</p>
                    <p className="text-white/20 text-[9px]">DESTINY MIRROR</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white rounded-xl p-3 mb-4 shadow-[0_0_30px_rgba(201,168,76,0.15)]">
                  <QRCodeSVG text={shareUrl || cardId} size={140} />
                </div>

                {/* Info */}
                <p className="text-white/40 text-xs mb-1">{t("energyId.scanHint")}</p>
                <p className="text-gold/60 text-[10px] font-mono tracking-wider mb-4">{cardId}</p>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setFlipped(false) }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-gold hover:border-gold/30 transition-all text-xs"
                  >
                    <RotateCcw size={12} />
                    {t("energyId.flipBack")}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare() }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-all text-xs"
                  >
                    <Share2 size={12} />
                    {t("energyId.shareBtn")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
