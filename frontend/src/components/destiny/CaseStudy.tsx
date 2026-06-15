"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const CASES = [
  {
    role: "Founder",
    age: 29,
    metrics: [
      { label: "wealth", value: 91, color: "#C5A880" },
      { label: "execution", value: 87, color: "#2D6A4F" },
      { label: "creativity", value: 95, color: "#C1121F" },
    ],
  },
  {
    role: "Visionary",
    age: 34,
    metrics: [
      { label: "strategy", value: 94, color: "#2980B9" },
      { label: "risk", value: 89, color: "#C1121F" },
      { label: "intuition", value: 92, color: "#C5A880" },
    ],
  },
  {
    role: "Creator",
    age: 26,
    metrics: [
      { label: "creativity", value: 97, color: "#C1121F" },
      { label: "execution", value: 78, color: "#2D6A4F" },
      { label: "wealth", value: 83, color: "#C5A880" },
    ],
  },
]

export default function CaseStudy() {
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
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div
          className="text-center mb-16 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/50 text-xs tracking-[0.4em] uppercase font-medium">
            {t("reviews.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-4 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("reviews.title")}
            </span>
          </h2>
          <p className="text-white/30 text-sm max-w-lg mx-auto">{t("pricing.reviewDisclaimer")}</p>
        </div>

        {/* Case study cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {CASES.map((cs, i) => (
            <div
              key={i}
              className="rounded-3xl p-6 transition-all duration-700 hover:border-[#C5A880]/20"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(10px)",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: `${i * 0.15}s`,
              }}
            >
              {/* Profile header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${cs.metrics[0].color}20, ${cs.metrics[0].color}08)`,
                    border: `1px solid ${cs.metrics[0].color}30`,
                    color: cs.metrics[0].color,
                  }}
                >
                  {cs.role[0]}
                </div>
                <div>
                  <div className="text-white/70 text-sm font-medium">{cs.role}</div>
                  <div className="text-white/25 text-[10px]">Age {cs.age}</div>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                {cs.metrics.map((m, mi) => (
                  <div key={mi}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-white/30 tracking-wider uppercase">
                        {t(`report.${m.label}`)}
                      </span>
                      <span className="text-xs font-bold" style={{ color: m.color }}>
                        {m.value}
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 delay-500"
                        style={{
                          width: isVisible ? `${m.value}%` : "0%",
                          background: `linear-gradient(90deg, ${m.color}60, ${m.color})`,
                          transitionDelay: `${0.5 + mi * 0.2}s`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
