"use client"
import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

// ── Five real dimensions from 五维合参 (deterministic seeded values) ──
function seeded(n: number) { let s = n; return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 } }
const rnd1 = seeded(191), rnd2 = seeded(193)
const DIMENSIONS = [
  { key: "wealth",  color: "#C5A880", value: 75 + Math.floor(rnd1() * 20) },
  { key: "career",  color: "#C1121F", value: 70 + Math.floor(rnd1() * 20) },
  { key: "health",  color: "#2D6A4F", value: 78 + Math.floor(rnd1() * 18) },
  { key: "relationship", color: "#9B59B6", value: 68 + Math.floor(rnd1() * 22) },
  { key: "spiritual", color: "#5B9BD5", value: 72 + Math.floor(rnd1() * 20) },
]
const DEMO_TYPES = [
  { zh: "格物派逆天执行狂魔", en: "Analytical Pattern-Defying Executor" },
  { zh: "全栈型行为维工程师", en: "Full-Stack Behavioral Engineer" },
  { zh: "凌晨三点与天对线狂人", en: "3AM Destiny-Challenging Maverick" },
  { zh: "红尘蹦迪的优化队长", en: "Cosmic Optimization Captain" },
]
const DEMO_TYPE = DEMO_TYPES[Math.floor(rnd2() * DEMO_TYPES.length)]
const DEMO_SCORE = 72 + Math.floor(rnd2() * 24)

function CircularProgress({ value, max = 100, color, size = 72 }: { value: number; max?: number; color: string; size?: number }) {
  const [progress, setProgress] = useState(0)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value / max), 500)
    return () => clearTimeout(timer)
  }, [value, max])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  )
}

export default function ReportPreview() {
  const { t, locale, localeHref } = useLanguage()
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
      id="report-preview"
      role="region"
      aria-labelledby="report-preview-title"
      className="relative py-16 md:py-32 px-4"
    >
      {/* Subtle backdrop for readability */}
      <div className="absolute inset-0 bg-[#080808]/50 pointer-events-none" />

      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C5A880]/[0.02] blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Section header */}
        <div
          className="text-center mb-16 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/50 text-xs tracking-[0.4em] uppercase font-medium">
            {t("report.badge")}
          </span>
          <h2 id="report-preview-title" className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-4 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("report.title")}
            </span>
          </h2>
          <p className="text-white/30 text-sm max-w-lg mx-auto">{t("report.desc")}</p>
        </div>

        {/* Report cards — real 五维合参 content */}
        <div
          className="grid md:grid-cols-3 gap-5 transition-all duration-1000 delay-300"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(20px)" }}
        >
          {/* Card A: 五维数据雷达 — shows real dimension scores */}
          <div
            className="rounded-3xl p-6 transition-all duration-300 hover:border-[#C5A880]/25"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-[#C5A880]" />
              <span className="text-[10px] text-white/30 tracking-widest uppercase">
                {locale === "zh" ? "五维数据" : "Five Dimensions"}
              </span>
            </div>
            <div className="space-y-3">
              {DIMENSIONS.map((dim) => (
                <div key={dim.key} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: dim.color }} />
                  <span className="text-[11px] text-white/40 flex-1">
                    {t(`report.${dim.key}`)}
                  </span>
                  {/* Progress bar */}
                  <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-[2s] ease-out motion-reduce:transition-none"
                      style={{
                        width: isVisible ? `${dim.value}%` : "0%",
                        background: dim.color,
                        transitionDelay: "0.5s",
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: dim.color }}>
                    {dim.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card B: AM16 行为人格 — shows the unique 16-type system */}
          <div
            className="rounded-3xl p-6 transition-all duration-300 hover:border-[#C5A880]/25"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-[#C9A84C]" />
              <span className="text-[10px] text-white/30 tracking-widest uppercase">
                {locale === "zh" ? "行为人格" : "AM16 Type"}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-2">
              {/* Circular score */}
              <CircularProgress value={DEMO_SCORE} color="#C9A84C" size={90} />
              {/* AM16 type badge */}
              <div
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest"
                style={{
                  background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#C9A84C",
                }}
              >
                {locale === "zh" ? DEMO_TYPE.zh : DEMO_TYPE.en}
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="text-[#C9A84C]/60 text-[10px] tracking-wider">
                {locale === "zh" ? "AM16 行为分类系统" : "AM16 Behavioral Classification"}
              </div>
            </div>
          </div>

          {/* Card C: 合参维度 — shows multi-modal cross-validation */}
          <div
            className="rounded-3xl p-6 transition-all duration-300 hover:border-[#C5A880]/25"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-[#7B93C9]" />
              <span className="text-[10px] text-white/30 tracking-widest uppercase">
                {locale === "zh" ? "合参维度" : "Cross-Validation"}
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: locale === "zh" ? "四柱八字" : "Four Pillars", icon: "☯", color: "#C5A880", active: true },
                { label: locale === "zh" ? "面相分析" : "Face Reading", icon: "👁", color: "#2D6A4F", active: true },
                { label: locale === "zh" ? "手相分析" : "Palm Reading", icon: "✋", color: "#9B59B6", active: true },
                { label: locale === "zh" ? "流时复盘" : "Event Transit", icon: "⏱", color: "#5B9BD5", active: true },
                { label: locale === "zh" ? "五维合参" : "5D Synthesis", icon: "◆", color: "#C9A84C", active: true },
              ].map((dim, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm w-5 text-center">{dim.icon}</span>
                  <span
                    className="text-xs flex-1"
                    style={{ color: dim.active ? `${dim.color}cc` : "rgba(255,255,255,0.2)" }}
                  >
                    {dim.label}
                  </span>
                  {/* Checkmark */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke={dim.active ? dim.color : "rgba(255,255,255,0.1)"} strokeWidth="1.5" fill="none" opacity={dim.active ? 0.3 : 0.1} />
                    {dim.active && (
                      <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke={dim.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer note */}
        <div
          className="text-center mt-10 transition-all duration-1000 delay-700"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <p className="text-white/15 text-[10px] tracking-wider">
            {t("report.confidence")}
          </p>
        </div>

        {/* CTA — go to actual reading */}
        <div
          className="text-center mt-8 transition-all duration-1000 delay-500"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <Link
            href={localeHref("/reading/new")}
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-medium text-sm tracking-wider transition-all duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(197,168,128,0.1), rgba(197,168,128,0.03))",
              border: "1px solid rgba(197,168,128,0.2)",
              color: "#C5A880",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.18), rgba(197,168,128,0.06))"
              e.currentTarget.style.borderColor = "rgba(197,168,128,0.4)"
              e.currentTarget.style.boxShadow = "0 0 30px rgba(197,168,128,0.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.1), rgba(197,168,128,0.03))"
              e.currentTarget.style.borderColor = "rgba(197,168,128,0.2)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            {t("report.expand")}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
