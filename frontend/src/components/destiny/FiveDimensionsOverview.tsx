"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const DIMS = [
  { key: "wealth", icon: "💰", color: "#C5A880", score: 82, descKey: "fiveDim.wealthDesc" },
  { key: "relationship", icon: "💕", color: "#C1121F", score: 75, descKey: "fiveDim.relationshipDesc" },
  { key: "career", icon: "💼", color: "#2D6A4F", score: 88, descKey: "fiveDim.careerDesc" },
  { key: "health", icon: "🏥", color: "#2980B9", score: 70, descKey: "fiveDim.healthDesc" },
  { key: "spiritual", icon: "✨", color: "#9B59B6", score: 79, descKey: "fiveDim.spiritualDesc" },
]

/* ── SVG Pentagon Radar Chart ─────────────────────────────────────── */
function PentagonRadar({ size = 260 }: { size?: number }) {
  const [animate, setAnimate] = useState(false)
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.34
  const labelRadius = size * 0.46
  const levels = 5

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 300)
    return () => clearTimeout(timer)
  }, [])

  function vertex(i: number, r: number) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  function pentagon(r: number) {
    return Array.from({ length: 5 }, (_, i) => {
      const v = vertex(i, r)
      return `${v.x},${v.y}`
    }).join(" ")
  }

  const values = DIMS.map(d => d.score / 100)
  const dataPoints = Array.from({ length: 5 }, (_, i) => {
    const v = vertex(i, radius * values[i])
    return `${v.x},${v.y}`
  }).join(" ")

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid pentagons */}
      {Array.from({ length: levels }, (_, li) => {
        const r = (radius * (li + 1)) / levels
        return (
          <polygon key={li} points={pentagon(r)} fill="none" stroke="#C5A880"
            strokeOpacity={0.04 + 0.04 * li} strokeWidth={0.5} />
        )
      })}
      {/* Spokes */}
      {Array.from({ length: 5 }, (_, i) => {
        const v = vertex(i, radius)
        return (
          <line key={i} x1={cx} y1={cy} x2={v.x} y2={v.y}
            stroke="#C5A880" strokeOpacity={0.1} strokeWidth={0.5} />
        )
      })}
      {/* Data area */}
      <polygon points={dataPoints} fill="rgba(197,168,128,0.12)" stroke="#C5A880"
        strokeWidth={1.5} strokeOpacity={0.6}
        style={{
          transition: "all 1s ease-out",
          transformOrigin: `${cx}px ${cy}px`,
          transform: animate ? "scale(1)" : "scale(0)",
          opacity: animate ? 1 : 0,
        }} />
      {/* Data points */}
      {Array.from({ length: 5 }, (_, i) => {
        const v = vertex(i, radius * values[i])
        return (
          <circle key={i} cx={v.x} cy={v.y} r={3} fill={DIMS[i].color}
            style={{ transition: "all 1s ease-out 0.2s", opacity: animate ? 1 : 0 }} />
        )
      })}
      {/* Labels */}
      {Array.from({ length: 5 }, (_, i) => {
        const v = vertex(i, labelRadius)
        return (
          <g key={i}>
            <text x={v.x} y={v.y - 8} textAnchor="middle" fill="white" fillOpacity={0.5}
              fontSize={10} fontFamily="sans-serif">
              {DIMS[i].icon}
            </text>
            <text x={v.x} y={v.y + 8} textAnchor="middle" fill={DIMS[i].color}
              fontSize={11} fontWeight="bold" fontFamily="sans-serif"
              style={{ transition: "all 1s ease-out 0.3s", opacity: animate ? 1 : 0 }}>
              {DIMS[i].score}
            </text>
          </g>
        )
      })}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={2} fill="#C5A880" fillOpacity={0.3} />
    </svg>
  )
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function FiveDimensionsOverview() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative py-32 px-4"
      style={{ background: "#080808" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#C5A880]/[0.02] blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div
          className="text-center mb-16 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/50 text-xs tracking-[0.4em] uppercase font-medium">
            {t("fiveDim.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-4 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("fiveDim.title")}
            </span>
          </h2>
          <p className="text-white/30 text-sm max-w-lg mx-auto">{t("fiveDim.desc")}</p>
          <p className="text-white/20 text-[11px] mt-2 italic">* Demo data — your actual scores will appear after analysis</p>
        </div>

        {/* Content: Radar + Dimension Cards */}
        <div
          className="grid md:grid-cols-2 gap-12 items-center transition-all duration-1000 delay-300"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(20px)" }}
        >
          {/* Left: Radar chart */}
          <div className="flex justify-center">
            <div
              className="rounded-3xl p-6"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(10px)",
              }}
            >
              <PentagonRadar size={280} />
            </div>
          </div>

          {/* Right: Dimension cards */}
          <div className="space-y-3">
            {DIMS.map((dim, i) => (
              <div
                key={dim.key}
                className="group relative rounded-2xl p-4 transition-all duration-500 cursor-default"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateX(0)" : "translateX(30px)",
                  transitionDelay: `${0.4 + i * 0.1}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = dim.color + "30"
                  e.currentTarget.style.background = `linear-gradient(135deg, ${dim.color}08, transparent)`
                  e.currentTarget.style.boxShadow = `0 0 30px ${dim.color}10`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full transition-all duration-500"
                  style={{ background: `${dim.color}60` }}
                />

                <div className="flex items-start gap-4 pl-3">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110"
                    style={{
                      background: `${dim.color}12`,
                      border: `1px solid ${dim.color}25`,
                    }}
                  >
                    <span className="text-lg">{dim.icon}</span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-serif font-bold text-sm" style={{ color: dim.color }}>
                        {t(`report.${dim.key}`)}
                      </h3>
                      <span className="text-xs font-mono font-bold" style={{ color: dim.color }}>
                        {dim.score}/100
                      </span>
                    </div>
                    <p className="text-white/30 text-[11px] leading-relaxed">
                      {t(dim.descKey)}
                    </p>
                    {/* Score bar */}
                    <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 delay-500"
                        style={{
                          width: isVisible ? `${dim.score}%` : "0%",
                          background: `linear-gradient(90deg, ${dim.color}44, ${dim.color})`,
                          transitionDelay: `${0.6 + i * 0.15}s`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
