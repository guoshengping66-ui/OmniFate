"use client"
import React, { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Share2, Copy, Check, ShieldCheck, Fingerprint, RotateCcw, QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import toast from "react-hot-toast"
import { useLanguage } from "@/contexts/LanguageContext"

interface EnergyIDCardProps {
  sessionId: string
  userId?: string | null
  dimensionScores?: Record<string, number>
  generatedAt?: string
}

// ── Archetype System ────────────────────────────────────────────────────────

interface Archetype {
  code: string
  labelKey: string
  tierKey: string
  color: string
  glow: string
}

const ARCHETYPES: Record<string, Archetype> = {
  wealth:     { code: "VORTEX",   labelKey: "energyId.archetype.wealth",     tierKey: "energyId.tier.wealth",     color: "#C9A84C", glow: "rgba(201,168,76,0.4)" },
  career:     { code: "APEX",     labelKey: "energyId.archetype.career",     tierKey: "energyId.tier.career",     color: "#3B82F6", glow: "rgba(59,130,246,0.4)" },
  relationship:{ code: "ECHO",    labelKey: "energyId.archetype.relationship",tierKey: "energyId.tier.relationship",color: "#EC4899", glow: "rgba(236,72,153,0.4)" },
  health:     { code: "NEXUS",    labelKey: "energyId.archetype.health",     tierKey: "energyId.tier.health",     color: "#10B981", glow: "rgba(16,185,129,0.4)" },
  mindfulness:  { code: "AETHER",   labelKey: "energyId.archetype.mindfulness",  tierKey: "energyId.tier.mindfulness",  color: "#A855F7", glow: "rgba(168,85,247,0.4)" },
}

function getArchetype(scores: Record<string, number>): Archetype {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topDim = sorted[0]?.[0] ?? "mindfulness"
  return ARCHETYPES[topDim] ?? ARCHETYPES.mindfulness
}

function getEnergyDensity(scores: Record<string, number>): string {
  const vals = Object.values(scores)
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  return avg.toFixed(1)
}

function getTier(scores: Record<string, number>): string {
  const vals = Object.values(scores)
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  if (avg >= 8.5) return "S+"
  if (avg >= 7.5) return "S"
  if (avg >= 6.5) return "A"
  if (avg >= 5.5) return "B"
  return "C"
}

function generateSignature(scores: Record<string, number>): string {
  const arch = getArchetype(scores)
  const density = getEnergyDensity(scores)
  const tier = getTier(scores)
  return `${arch.code}-${density} | ${tier}-CLASS`
}

// ── Prophecy Lines ──────────────────────────────────────────────────────────

const PROPHECIES_ZH = [
  "数据洞察：你的财富之路在于稳健积累，切忌急功近利。",
  "行为指引：真正的力量藏在你的耐心之中，等待是最大的智慧。",
  "分析回响：当你放下执念，意想不到的机遇将会出现。",
  "模式暗示：今年是你蜕变的关键之年，勇敢迈出那一步。",
  "数据共鸣：水生木，你的创造力将在秋天达到巅峰。",
  "星盘启示：一次偶然的相遇将改变你的人生轨迹。",
  "分析昭示：坚守本心，贵人自会在最需要时出现。",
  "星盘高照：事业宫大旺，把握住每一次展示自己的机会。",
]

const PROPHECIES_EN = [
  "Data insight: Your path to wealth lies in disciplined patience.",
  "Behavioral pattern: True power hides in your patience — waiting is the greatest wisdom.",
  "Analysis echo: Release your grip, and unexpected doors will open.",
  "Pattern hint: This is your year of metamorphosis — take the leap.",
  "Five Elements resonate: Water feeds Wood — your creativity peaks in autumn.",
  "Stellar Profile foretells: A chance encounter will reshape your life's trajectory.",
  "Analysis declares: Stay true — your support will appear when needed most.",
  "Stellar Profile shines: Career status is blazing — seize every moment.",
]

function getProphecy(sessionId: string, locale: string): string {
  const pool = locale === "zh" ? PROPHECIES_ZH : PROPHECIES_EN
  let hash = 0
  for (let i = 0; i < sessionId.length; i++) {
    hash = ((hash << 5) - hash + sessionId.charCodeAt(i)) | 0
  }
  return pool[Math.abs(hash) % pool.length]
}

// ── QR Code ─────────────────────────────────────────────────────────────────

// ── Animated Radar ──────────────────────────────────────────────────────────

function AnimatedRadar({ scores, animate, accentColor }: { scores: Record<string, number>; animate: boolean; accentColor: string }) {
  const dims = Object.keys(scores)
  const n = dims.length

  const finalPoints = useMemo(() =>
    dims.map((_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2
      const r = 30 * ((scores[dims[i]] ?? 5) / 10)
      return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) }
    }), [scores, n, dims])

  const gridPoints = [0.2, 0.4, 0.6, 0.8, 1].map(scale =>
    dims.map((_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2
      const r = 30 * scale
      return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`
    }).join(" "))

  const toStr = (pts: { x: number; y: number }[]) => pts.map(p => `${p.x},${p.y}`).join(" ")
  const center = dims.map(() => ({ x: 50, y: 50 }))

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Glow behind radar */}
      <circle cx="50" cy="50" r="35" fill="url(#radarGlow)" />
      {/* Grid */}
      {gridPoints.map((pts, si) => (
        <polygon key={si} points={pts} fill="none" stroke={accentColor} strokeOpacity={0.08 + 0.04 * si} strokeWidth={0.3} />
      ))}
      {/* Animated polygon */}
      <motion.polygon
        initial={{ points: toStr(center) }}
        animate={animate ? { points: toStr(finalPoints) } : { points: toStr(center) }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        fill={`${accentColor}18`}
        stroke={accentColor}
        strokeWidth={1.2}
        strokeOpacity={0.7}
        filter="url(#glow)"
      />
      {/* Breathing pulse */}
      {animate && (
        <motion.polygon
          points={toStr(finalPoints)}
          fill={`${accentColor}08`}
          stroke={accentColor}
          strokeWidth={0.5}
          strokeOpacity={0.3}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{ transformOrigin: "50% 50%" }}
        />
      )}
      {/* Vertex dots */}
      {animate && finalPoints.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r={1.8} fill={accentColor}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.8 + i * 0.12 }}
        />
      ))}
    </svg>
  )
}

// ── Particle Ring ───────────────────────────────────────────────────────────

function ParticleRing({ color }: { color: string }) {
  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i, rx: 46 + Math.random() * 12, ry: 52 + Math.random() * 12,
      size: 1.5 + Math.random() * 2, opacity: 0.2 + Math.random() * 0.35,
      duration: 9 + Math.random() * 6, delay: Math.random() * -8,
    })), [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full" style={{
          width: p.size, height: p.size, left: "50%", top: "50%",
          marginLeft: -p.size / 2, marginTop: -p.size / 2,
          background: `radial-gradient(circle, ${color}, ${color}66)`,
          boxShadow: `0 0 ${p.size * 3}px ${color}66`,
          "--rx": `${p.rx}%`, "--ry": `${p.ry}%`, "--op": p.opacity,
          animation: `particle-orbit ${p.duration}s linear ${p.delay}s infinite`,
        } as React.CSSProperties} />
      ))}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

const EnergyIDCardInner = ({ sessionId, dimensionScores, generatedAt, ..._rest }: EnergyIDCardProps) => {
  const { t, locale } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [shimmerActive, setShimmerActive] = useState(false)

  const scores = dimensionScores || { wealth: 5, career: 5, relationship: 5, health: 5, mindfulness: 5 }
  const archetype = getArchetype(scores)
  const signature = generateSignature(scores)
  const prophecy = getProphecy(sessionId, locale)
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/reading/${sessionId}` : ""

  useEffect(() => { const t = setTimeout(() => setVisible(true), 400); return () => clearTimeout(t) }, [])
  useEffect(() => {
    const iv = setInterval(() => { setShimmerActive(true); setTimeout(() => setShimmerActive(false), 1500) }, 4000)
    return () => clearInterval(iv)
  }, [])

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(signature); setCopied(true); toast.success(t("reading.idCopied")); setTimeout(() => setCopied(false), 2000) }
    catch { toast.error(t("reading.copyFailed")) }
  }

  const handleShare = async () => {
    const text = `🔮 ${t("energyId.shareText")}\n\n✨ ${signature}\n⚡ ${t("energyId.certLabel")}\n\n${shareUrl}`
    if (navigator.share) { try { await navigator.share({ title: t("energyId.shareTitle"), text }) } catch {} }
    else { await navigator.clipboard.writeText(text); toast.success(t("energyId.copied")) }
  }

  const formatDate = (iso?: string) => {
    const d = iso ? new Date(iso) : new Date()
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
  }

  const DIM_LABELS: Record<string, string> = { wealth: "💰", career: "💼", relationship: "💕", health: "🏥", mindfulness: "🧘" }
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="my-10"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-5">
        <Fingerprint size={16} className="text-gold/60" />
        <span className="text-gold/60 text-xs tracking-[0.15em] uppercase font-medium">{t("energyId.label")}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
      </div>

      {/* Card wrapper with perspective */}
      <div className="relative w-full max-w-md mx-auto" style={{ perspective: 1200 }}>
        <ParticleRing color={archetype.color} />

        {/* Flip container */}
        <div className={`card-flip-inner ${flipped ? "flipped" : ""}`} style={{ cursor: "pointer" }}>

          {/* ══════ FRONT ══════ */}
          <div className="card-flip-front relative rounded-2xl overflow-hidden">
            {/* Holographic border */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none z-10" style={{
              padding: "1.5px",
              background: `conic-gradient(from var(--angle,0deg), ${archetype.color}88, #A855F766, #3B82F666, #10B98866, ${archetype.color}88)`,
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude", WebkitMaskComposite: "xor",
              animation: "glow-rotate 6s linear infinite",
            }} />

            <div className="relative overflow-hidden rounded-2xl" style={{
              background: "linear-gradient(145deg, #0d0820 0%, #110a24 30%, #0f0820 60%, #0a0618 100%)",
              backdropFilter: "blur(20px)",
            }}>
              {/* Ambient glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[100px] opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${archetype.glow}, transparent)` }} />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-[80px] opacity-15 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${archetype.color}33, transparent)` }} />

              {/* Holographic sheen */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
                style={{
                  background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 48%, transparent 52%, transparent 70%)",
                  backgroundSize: "200% 100%", animation: "holographic-sheen 5s ease-in-out infinite",
                }} />

              <div className="relative p-6">
                {/* ── Header: Archetype ── */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <motion.p
                      className="text-[10px] tracking-[0.2em] uppercase mb-1"
                      style={{ color: `${archetype.color}99` }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={visible ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      {t("energyId.coreArchetype")}
                    </motion.p>
                    <motion.h3
                      className="text-xl font-bold tracking-[0.08em] uppercase"
                      style={{
                        color: archetype.color,
                        textShadow: `0 0 20px ${archetype.glow}, 0 0 40px ${archetype.glow}`,
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={visible ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {t(archetype.labelKey)}
                    </motion.h3>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleShare() }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 transition-all text-[10px]">
                    <Share2 size={10} /> {t("energyId.shareBtn")}
                  </button>
                </div>

                {/* ── Radar ── */}
                <div className="flex justify-center mb-5">
                  <div className="w-40 h-40">
                    <AnimatedRadar scores={scores} animate={visible} accentColor={archetype.color} />
                  </div>
                </div>

                {/* ── Digital Signature ── */}
                <div className="text-center mb-5">
                  <p className="text-white/20 text-[8px] tracking-[0.25em] uppercase mb-2">{t("energyId.digitalSig")}</p>
                  <p className="shimmer-id-text font-mono text-lg font-bold tracking-[0.12em]"
                    style={{
                      backgroundImage: shimmerActive
                        ? `linear-gradient(90deg, ${archetype.color} 0%, #F0D68A 25%, #fff 50%, #F0D68A 75%, ${archetype.color} 100%)`
                        : `linear-gradient(135deg, ${archetype.color}CC, ${archetype.color}, ${archetype.color}CC)`,
                      backgroundSize: shimmerActive ? "200% 100%" : "100% 100%",
                      animation: shimmerActive ? "shimmer-text 1.5s ease-in-out" : "none",
                      textShadow: `0 0 30px ${archetype.glow}`,
                    }}>
                    {signature}
                  </p>
                </div>

                {/* ── Metrics ── */}
                <div className="flex flex-wrap justify-center gap-2 mb-5">
                  {Object.entries(scores).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all"
                      style={{
                        borderColor: `${archetype.color}22`,
                        background: `linear-gradient(135deg, ${archetype.color}08, ${archetype.color}04)`,
                        boxShadow: `0 0 8px ${archetype.color}10`,
                      }}>
                      <span className="text-xs">{DIM_LABELS[key]}</span>
                      <span className="text-[10px] font-mono font-bold" style={{ color: archetype.color }}>
                        {val.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── Prophecy ── */}
                <motion.div
                  className="text-center mb-4 px-2"
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : {}}
                  transition={{ delay: 1.2, duration: 1 }}
                >
                  <p className="text-white/30 text-[11px] leading-relaxed italic">
                    &ldquo;{prophecy}&rdquo;
                  </p>
                </motion.div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${archetype.color}20` }}>
                      <span className="text-[8px] font-bold" style={{ color: archetype.color }}>{locale === "zh" ? "命" : "✦"}</span>
                    </div>
                    <span className="text-white/20 text-[9px] tracking-wider">PROFILE MIRROR</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/15 text-[9px]">{formatDate(generatedAt)}</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={10} style={{ color: archetype.color }} className="opacity-50" />
                      <span className="text-white/25 text-[9px]">{t("energyId.certLabel")}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleCopy() }}
                      className="flex items-center gap-1 text-white/30 hover:text-gold transition-colors">
                      {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                      <span className="text-[9px]">{copied ? t("reading.copied") : t("reading.copyId")}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setFlipped(true) }}
                      className="flex items-center gap-1 text-white/30 hover:text-gold transition-colors" title={t("energyId.scanHint")}>
                      <QrCode size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════ BACK (QR) ══════ */}
          <div className="card-flip-back absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 rounded-2xl pointer-events-none z-10" style={{
              padding: "1.5px",
              background: `conic-gradient(from var(--angle,0deg), ${archetype.color}88, #A855F766, #3B82F666, #10B98866, ${archetype.color}88)`,
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude", WebkitMaskComposite: "xor",
              animation: "glow-rotate 6s linear infinite",
            }} />
            <div className="relative rounded-2xl overflow-hidden h-full" style={{
              background: "linear-gradient(145deg, #0d0820, #110a24, #0a0618)",
            }}>
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${archetype.glow}, transparent)` }} />

              <div className="relative p-6 flex flex-col items-center justify-center h-full min-h-[340px]">
                <p className="text-white/20 text-[9px] tracking-[0.2em] uppercase mb-4">{t("energyId.scanHint")}</p>
                <div className="bg-white rounded-xl p-3 mb-4" style={{ boxShadow: `0 0 30px ${archetype.glow}` }}>
                  <QRCodeSVG value={shareUrl || signature} size={130} bgColor="white" fgColor="#1a1030" level="M" />
                </div>
                <p className="font-mono text-xs tracking-wider mb-5" style={{ color: `${archetype.color}AA` }}>{signature}</p>
                <div className="flex gap-3">
                  <button onClick={(e) => { e.stopPropagation(); setFlipped(false) }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-gold hover:border-gold/30 transition-all text-xs">
                    <RotateCcw size={12} /> {t("energyId.flipBack")}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleShare() }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs transition-all"
                    style={{ background: `${archetype.color}15`, borderColor: `${archetype.color}40`, color: archetype.color }}>
                    <Share2 size={12} /> {t("energyId.shareBtn")}
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

export const EnergyIDCard = React.memo(EnergyIDCardInner)
