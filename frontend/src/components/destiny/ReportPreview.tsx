"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

function CircularProgress({ value, max = 100, color, size = 80 }: { value: number; max?: number; color: string; size?: number }) {
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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  )
}

export default function ReportPreview() {
  const { t, locale } = useLanguage()
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
          <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-4 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("report.title")}
            </span>
          </h2>
          <p className="text-white/30 text-sm max-w-lg mx-auto">{t("report.desc")}</p>
        </div>

        {/* Report cards grid */}
        <div
          className="grid md:grid-cols-3 gap-5 transition-all duration-1000 delay-300"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(20px)" }}
        >
          {/* Card A: Wealth Potential */}
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
                {t("report.wealth")}
              </span>
            </div>
            <div className="flex items-center justify-center mb-4">
              <CircularProgress value={85} color="#C5A880" size={100} />
            </div>
            <div className="text-center">
              <div className="text-[#C5A880] text-xs tracking-wider">
                {locale === "zh" ? "财富潜力指数" : "Wealth Potential Index"}
              </div>
            </div>
          </div>

          {/* Card B: Personality Rank */}
          <div
            className="rounded-3xl p-6 transition-all duration-300 hover:border-[#C5A880]/25"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-[#C1121F]" />
              <span className="text-[10px] text-white/30 tracking-widest uppercase">
                {t("report.career")}
              </span>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div
                className="px-6 py-3 rounded-2xl text-2xl font-serif font-bold"
                style={{
                  background: "linear-gradient(135deg, rgba(193,18,31,0.15), rgba(193,18,31,0.05))",
                  border: "1px solid rgba(193,18,31,0.3)",
                  color: "#C1121F",
                }}
              >
                SS
              </div>
            </div>
            <div className="text-center">
              <div className="text-[#C1121F] text-xs tracking-wider">
                {locale === "zh" ? "人格等级" : "Personality Rank"}
              </div>
            </div>
          </div>

          {/* Card C: Life Vector Paths */}
          <div
            className="rounded-3xl p-6 transition-all duration-300 hover:border-[#C5A880]/25"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-[#2D6A4F]" />
              <span className="text-[10px] text-white/30 tracking-widest uppercase">
                {locale === "zh" ? "人生矢量路径" : "Life Vector Paths"}
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: locale === "zh" ? "创业" : "Founder", color: "#C5A880", active: true },
                { label: locale === "zh" ? "投资" : "Investor", color: "#2D6A4F", active: true },
                { label: locale === "zh" ? "创造" : "Creator", color: "#C1121F", active: false },
              ].map((path, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: path.active ? path.color : "rgba(255,255,255,0.1)" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: path.active ? path.color : "rgba(255,255,255,0.2)" }}
                  >
                    {path.label}
                  </span>
                  {i < 2 && (
                    <svg className="w-3 h-3 text-white/10 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
