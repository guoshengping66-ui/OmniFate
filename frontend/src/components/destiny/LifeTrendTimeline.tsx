"use client"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const BLOCKS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]

const timelineData = [
  {
    id: 1,
    year: 2025,
    labelZh: "潜龙蓄势",
    labelEn: "Dormant Dragon",
    type: "wealth",
    x: 8,
    y: 55,
    stars: 5,
    growth: 4,
    suggestionsZh: ["积累资源", "学习新技能", "建立人脉"],
    suggestionsEn: ["Build resources", "Learn new skills", "Network"],
    energy: { career: "▁▂▃▄▅▄▃▂▁", wealth: "▁▂▅▇█▇▅▃▂", relationship: "▃▄▅▆▅▄▃▂▁", growth: "▂▃▄▅▇▆▄▃▂" },
  },
  {
    id: 2,
    year: 2027,
    labelZh: "事业上升",
    labelEn: "Career Rise",
    type: "career",
    x: 25,
    y: 25,
    stars: 5,
    growth: 5,
    suggestionsZh: ["创业", "转型", "大胆决策"],
    suggestionsEn: ["Startup", "Transform", "Bold decisions"],
    energy: { career: "▃▅▇█▇▆▅▄▃", wealth: "▂▃▅▆▅▃▂▁▂", relationship: "▄▅▆▇▆▅▄▃▂", growth: "▃▅▇█▇▆▅▄▃" },
  },
  {
    id: 3,
    year: 2029,
    labelZh: "财富窗口",
    labelEn: "Wealth Window",
    type: "wealth",
    x: 42,
    y: 15,
    stars: 4,
    growth: 4,
    suggestionsZh: ["投资理财", "资产配置", "把握时机"],
    suggestionsEn: ["Invest", "Asset allocation", "Seize timing"],
    energy: { career: "▅▆▇▆▅▄▃▂▁", wealth: "▄▅▇█▇▆▅▃▂", relationship: "▃▄▅▆▅▄▃▂▁", growth: "▅▆▇▆▅▄▃▂▁" },
  },
  {
    id: 4,
    year: 2031,
    labelZh: "关系成长",
    labelEn: "Relationship Growth",
    type: "relationship",
    x: 58,
    y: 40,
    stars: 4,
    growth: 3,
    suggestionsZh: ["深化感情", "家庭建设", "人际和谐"],
    suggestionsEn: ["Deepen bonds", "Build family", "Harmony"],
    energy: { career: "▄▅▆▅▄▃▂▁▂", wealth: "▃▄▅▆▅▄▃▂▁", relationship: "▅▇█▇▆▅▄▃▂", growth: "▂▃▄▅▆▅▄▃▂" },
  },
  {
    id: 5,
    year: 2033,
    labelZh: "人生转折",
    labelEn: "Life Turning Point",
    type: "career",
    x: 75,
    y: 65,
    stars: 5,
    growth: 5,
    suggestionsZh: ["重大转型", "重新定位", "蜕变升华"],
    suggestionsEn: ["Major shift", "Redefine", "Transform"],
    energy: { career: "▂▃▅▇█▇▆▅▃", wealth: "▁▂▃▅▇▆▅▃▂", relationship: "▃▅▆▇▆▅▄▃▂", growth: "▃▅▇█▇▆▅▄▃" },
  },
  {
    id: 6,
    year: 2035,
    labelZh: "厚积薄发",
    labelEn: "Harvest Season",
    type: "wealth",
    x: 92,
    y: 30,
    stars: 5,
    growth: 5,
    suggestionsZh: ["收获成果", "传承分享", "享受人生"],
    suggestionsEn: ["Harvest results", "Share wisdom", "Enjoy life"],
    energy: { career: "▅▇▆▅▄▃▂▁▂", wealth: "▃▅▇█▇▆▅▃▂", relationship: "▅▆▇▆▅▄▃▂▁", growth: "▅▇█▇▆▅▄▃▂" },
  },
]

const typeColors: Record<string, { bg: string; border: string; glow: string }> = {
  wealth: {
    bg: "rgba(212,175,55,0.15)",
    border: "rgba(212,175,55,0.4)",
    glow: "rgba(212,175,55,0.6)",
  },
  career: {
    bg: "rgba(168,130,255,0.15)",
    border: "rgba(168,130,255,0.4)",
    glow: "rgba(168,130,255,0.6)",
  },
  relationship: {
    bg: "rgba(236,120,160,0.15)",
    border: "rgba(236,120,160,0.4)",
    glow: "rgba(236,120,160,0.6)",
  },
}

function WavePath() {
  const points = timelineData.map((d) => ({ x: d.x, y: d.y }))
  const pathParts: string[] = [`M ${points[0].x} ${points[0].y}`]
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = prev.x + (curr.x - prev.x) * 0.5
    const cpy1 = prev.y
    const cpx2 = prev.x + (curr.x - prev.x) * 0.5
    const cpy2 = curr.y
    pathParts.push(`C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`)
  }
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ filter: "blur(0.5px)" }}
    >
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(197,168,128,0.1)" />
          <stop offset="50%" stopColor="rgba(197,168,128,0.3)" />
          <stop offset="100%" stopColor="rgba(197,168,128,0.1)" />
        </linearGradient>
      </defs>
      <path
        d={pathParts.join(" ")}
        fill="none"
        stroke="url(#waveGrad)"
        strokeWidth="0.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

const ENERGY_LABELS: Record<string, { zh: string; en: string; color: string }> = {
  career: { zh: "事业", en: "Career", color: "#A882FF" },
  wealth: { zh: "财富", en: "Wealth", color: "#D4AF37" },
  relationship: { zh: "关系", en: "Relation", color: "#EC78A0" },
  growth: { zh: "成长", en: "Growth", color: "#C5A880" },
}

function EnergyBars({ energy, locale }: { energy: Record<string, string>; locale: string }) {
  return (
    <div className="flex flex-col gap-1 mt-8 mb-2">
      {(["career", "wealth", "relationship", "growth"] as const).map((key) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-[9px] w-7 text-right shrink-0" style={{ color: ENERGY_LABELS[key].color, opacity: 0.6 }}>
            {locale === "zh" ? ENERGY_LABELS[key].zh : ENERGY_LABELS[key].en}
          </span>
          <span className="font-mono text-[11px] tracking-wider" style={{ color: ENERGY_LABELS[key].color, opacity: 0.7 }}>
            {energy[key]}
          </span>
        </div>
      ))}
    </div>
  )
}

function StarNode() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      {/* Star */}
      <span className="text-xl text-[#D4AF37] relative z-10" style={{ textShadow: "0 0 12px rgba(212,175,55,0.8)" }}>
        ✦
      </span>
    </div>
  )
}

function ExpandCard({ node, locale }: { node: typeof timelineData[0]; locale: string }) {
  const color = typeColors[node.type]
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-[260px] sm:w-[280px] p-5 rounded-2xl z-30"
      style={{
        background: "rgba(5,8,22,0.85)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${color.border}`,
        boxShadow: `0 0 30px ${color.glow}30, 0 20px 40px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: color.bg, border: `1px solid ${color.border}` }}
        >
          <span className="text-[#D4AF37] text-sm">✦</span>
        </div>
        <div>
          <div className="text-[#C5A880] font-serif font-bold text-sm">
            {locale === "zh" ? node.labelZh : node.labelEn}
          </div>
          <div className="text-white/30 text-[10px]">{node.year}</div>
        </div>
      </div>

      {/* Ratings */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-white/40 text-[10px] mb-1">
            {locale === "zh" ? "机会指数" : "Opportunity"}
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-[10px] ${i < node.stars ? "text-[#D4AF37]" : "text-white/10"}`}>★</span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-white/40 text-[10px] mb-1">
            {locale === "zh" ? "成长指数" : "Growth"}
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-[10px] ${i < node.growth ? "text-[#C5A880]" : "text-white/10"}`}>★</span>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-1.5 mb-3">
        <div className="text-white/30 text-[10px] uppercase tracking-wider">
          {locale === "zh" ? "适合" : "Suggested"}
        </div>
        {(locale === "zh" ? node.suggestionsZh : node.suggestionsEn).map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-white/50 text-xs">
            <span className="w-1 h-1 rounded-full" style={{ background: color.border }} />
            {s}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="pt-2 border-t border-white/5">
        <span className="text-[#C5A880]/60 text-[10px]">
          {locale === "zh" ? "AI趋势洞察 →" : "AI Trend Insight →"}
        </span>
      </div>
    </div>
  )
}

export default function LifeTrendTimeline() {
  const { locale } = useLanguage()
  const [activeId, setActiveId] = useState<number | null>(null)

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden" aria-label={`Life timeline with ${BLOCKS.length} phases`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — max-width 700px, left-aligned */}
        <div className="max-w-[700px] mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="text-[#C5A880]/70 text-xs tracking-[0.3em] uppercase">
              {locale === "zh" ? "人生趋势图谱" : "Life Trend Map"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-wide mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C5A880] via-[#E8D5B7] to-[#C5A880]">
              {locale === "zh" ? "人生趋势图谱" : "Life Trend Map"}
            </span>
          </h2>

          <p className="text-white/30 text-sm sm:text-base leading-relaxed">
            {locale === "zh"
              ? "AI 结合五大分析体系，推演不同人生阶段的能量变化趋势"
              : "AI combines five analysis systems to project energy shifts across life stages"}
          </p>
          <p className="text-[#C5A880]/40 text-xs mt-2">
            {locale === "zh"
              ? "探索未来的重要成长节点"
              : "Explore key growth nodes in your future"}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px]">
          {/* Wave path */}
          <WavePath />

          {/* Nodes */}
          {timelineData.map((node) => {
            const isActive = activeId === node.id
            return (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Expanded card */}
                {isActive && (
                  <ExpandCard node={node} locale={locale} />
                )}

                {/* Node button */}
                <button
                  onClick={() => setActiveId(isActive ? null : node.id)}
                  className="relative focus:outline-none group"
                  aria-label={locale === "zh" ? node.labelZh : node.labelEn}
                >
                  <StarNode />
                  {/* Label below node */}
                  <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                    <div className="text-[#C5A880] text-[10px] sm:text-xs font-medium">
                      {locale === "zh" ? node.labelZh : node.labelEn}
                    </div>
                    <div className="text-white/25 text-[9px]">{node.year}</div>
                    {/* Energy bars below label */}
                    <EnergyBars energy={node.energy} locale={locale} />
                  </div>
                </button>
              </div>
            )
          })}

          {/* Year markers at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
            <span className="text-white/15 text-xs">2025</span>
            <span className="text-white/15 text-xs">2035</span>
          </div>
        </div>

        {/* Layer 4: AI Analysis Tags */}
        <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <span className="text-white/25 text-xs mr-1">
            {locale === "zh" ? "AI 综合推演：" : "AI Analysis:"}
          </span>
          {[
            { zh: "八字周期", en: "Bazi Cycle" },
            { zh: "星盘推运", en: "Transit" },
            { zh: "行为模式", en: "Behavior" },
            { zh: "人格特征", en: "Persona" },
            { zh: "生活节奏", en: "Lifestyle" },
          ].map((tag) => (
            <div
              key={tag.zh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#030918] border border-white/[0.06]"
            >
              <span className="text-emerald-400 text-[10px]">✓</span>
              <span className="text-white/40 text-[11px]">
                {locale === "zh" ? tag.zh : tag.en}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
