"use client"

import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Fingerprint, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface EnergyIDCardProps {
  sessionId: string
  userId?: string | null
  dimensionScores?: Record<string, number>
  generatedAt?: string
}

const DIMENSIONS = [
  { key: "wealth", zh: "财富", en: "Wealth", icon: "◇", color: "#C9A84C" },
  { key: "career", zh: "事业", en: "Career", icon: "△", color: "#60A5FA" },
  { key: "relationship", zh: "关系", en: "Relationship", icon: "○", color: "#F472B6" },
  { key: "health", zh: "健康", en: "Health", icon: "□", color: "#34D399" },
  { key: "spiritual", zh: "心智", en: "Mindset", icon: "✦", color: "#C084FC" },
] as const

function scoreFor(scores: Record<string, number>, key: string) {
  const source = key === "spiritual" ? scores.spiritual ?? scores.mindfulness : scores[key]
  return Math.max(0, Math.min(10, Number(source ?? 5)))
}

function FiveDimensionRadar({ scores, active }: { scores: Record<string, number>; active: boolean }) {
  const points = useMemo(() => DIMENSIONS.map((dimension, index) => {
    const angle = (Math.PI * 2 * index) / DIMENSIONS.length - Math.PI / 2
    const radius = 30 * (scoreFor(scores, dimension.key) / 10)
    return `${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`
  }).join(" "), [scores])
  const grid = [0.25, 0.5, 0.75, 1].map(scale => DIMENSIONS.map((_, index) => {
    const angle = (Math.PI * 2 * index) / DIMENSIONS.length - Math.PI / 2
    const radius = 30 * scale
    return `${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`
  }).join(" "))

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-label="Five-dimension radar chart">
      <defs>
        <radialGradient id="fiveDimensionGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="36" fill="url(#fiveDimensionGlow)" />
      {grid.map((polygon, index) => <polygon key={index} points={polygon} fill="none" stroke="#C9A84C" strokeOpacity={0.1 + index * 0.04} strokeWidth="0.35" />)}
      {DIMENSIONS.map((_, index) => {
        const angle = (Math.PI * 2 * index) / DIMENSIONS.length - Math.PI / 2
        return <line key={index} x1="50" y1="50" x2={50 + 30 * Math.cos(angle)} y2={50 + 30 * Math.sin(angle)} stroke="#C9A84C" strokeOpacity="0.12" strokeWidth="0.35" />
      })}
      <motion.polygon
        initial={{ points: "50,50 50,50 50,50 50,50 50,50", opacity: 0 }}
        animate={{ points, opacity: active ? 1 : 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        fill="rgba(201,168,76,0.18)"
        stroke="#E8D28A"
        strokeWidth="1.15"
      />
      {DIMENSIONS.map((dimension, index) => {
        const angle = (Math.PI * 2 * index) / DIMENSIONS.length - Math.PI / 2
        const radius = 30 * (scoreFor(scores, dimension.key) / 10)
        return <motion.circle key={dimension.key} initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.45 + index * 0.08 }} cx={50 + radius * Math.cos(angle)} cy={50 + radius * Math.sin(angle)} r="1.75" fill={dimension.color} />
      })}
    </svg>
  )
}

const EnergyIDCardInner = ({ dimensionScores }: EnergyIDCardProps) => {
  const { locale } = useLanguage()
  const [visible, setVisible] = useState(false)
  const scores = dimensionScores || {}
  const isEn = locale === "en"
  const dimensions = DIMENSIONS.map(dimension => ({ ...dimension, score: scoreFor(scores, dimension.key) }))
  const strongest = [...dimensions].sort((a, b) => b.score - a.score)[0]
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0]

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 180)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <section className="five-dimension-energy-card relative overflow-hidden rounded-3xl border border-gold/20 bg-[#080b14] p-5 md:p-7 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(201,168,76,0.17),transparent_30%),radial-gradient(circle_at_84%_76%,rgba(96,165,250,0.12),transparent_35%)]" />
      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-gold/70">
              <Fingerprint size={13} />
              {isEn ? "Five-Dimension Energy Map" : "五维能量画像"}
            </div>
            <h3 className="font-serif text-xl font-bold text-white/90">{isEn ? "Your current balance" : "你的当前能量平衡"}</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/42">{isEn ? "A visual snapshot from this report's actual scores." : "基于本次报告真实分数生成，不使用演示数据。"}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-gold/[0.07] px-3 py-2 text-right">
            <p className="text-[10px] text-gold/60">{isEn ? "Primary strength" : "主要优势"}</p>
            <p className="mt-0.5 text-sm font-semibold text-gold">{isEn ? strongest.en : strongest.zh}</p>
          </div>
        </div>

        <div className="grid items-center gap-6 md:grid-cols-[0.85fr_1.15fr]">
          <div className="mx-auto h-52 w-52 rounded-3xl border border-white/[0.07] bg-black/15 p-4">
            <FiveDimensionRadar scores={scores} active={visible} />
          </div>
          <div className="space-y-3">
            {dimensions.map((dimension, index) => (
              <motion.div key={dimension.key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 12 }} transition={{ delay: 0.16 + index * 0.08 }} className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs text-white/70"><span style={{ color: dimension.color }}>{dimension.icon}</span>{isEn ? dimension.en : dimension.zh}</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: dimension.color }}>{dimension.score.toFixed(1)} / 10</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><motion.div initial={{ width: 0 }} animate={{ width: visible ? `${dimension.score * 10}%` : 0 }} transition={{ duration: 0.75, delay: 0.25 + index * 0.08 }} className="h-full rounded-full" style={{ backgroundColor: dimension.color }} /></div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-xs text-white/42">
          <ShieldCheck size={14} className="text-gold/65" />
          {isEn ? `Focus first on stabilizing ${weakest.en}; the full report explains why and how.` : `优先稳住「${weakest.zh}」，完整报告会解释原因与具体做法。`}
        </div>
      </div>
    </section>
  )
}

export const EnergyIDCard = React.memo(EnergyIDCardInner)
