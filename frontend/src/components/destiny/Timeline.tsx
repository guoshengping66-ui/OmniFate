"use client"
import { useRef, useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const MILESTONES = [
  { year: "2026", title: "The Awakening", desc: "opportunity", color: "#C5A880", icon: "☀" },
  { year: "2028", title: "The Eclipse", desc: "transformation", color: "#C1121F", icon: "◐" },
  { year: "2031", title: "The Zenith", desc: "breakthrough", color: "#2D6A4F", icon: "✦" },
]

export default function Timeline() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowH = window.innerHeight
      const sectionH = sectionRef.current.offsetHeight
      const scrolled = windowH - rect.top
      const total = windowH + sectionH
      setProgress(Math.max(0, Math.min(1, scrolled / total)))
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-4"
      style={{ background: "#080808" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="text-[#C5A880]/50 text-xs tracking-[0.4em] uppercase font-medium">
            {t("fortune.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("home.dailyTitle")}
            </span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px">
            <div
              className="w-full bg-gradient-to-b from-[#C5A880]/50 via-[#C5A880]/20 to-transparent transition-all duration-300"
              style={{ height: `${progress * 100}%` }}
            />
            <div className="w-full h-full bg-[#C5A880]/5" />
          </div>

          {/* Milestones */}
          <div className="space-y-24">
            {MILESTONES.map((ms, i) => {
              const milestoneProgress = Math.max(0, Math.min(1, (progress - i * 0.25) * 4))
              const isLeft = i % 2 === 0

              return (
                <div
                  key={ms.year}
                  className={`relative flex items-center gap-8 md:gap-0 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 md:w-1/2 ${isLeft ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"} pl-16 md:pl-0`}
                    style={{
                      opacity: milestoneProgress,
                      transform: `translateX(${(1 - milestoneProgress) * (isLeft ? -30 : 30)}px)`,
                      transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <div className="text-xs text-[#C5A880]/40 tracking-[0.3em] uppercase mb-2">
                      {ms.year}
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold mb-2" style={{ color: ms.color }}>
                      {ms.title}
                    </h3>
                    <p className="text-white/30 text-sm">
                      {t(`fortune.${ms.desc}`)}
                    </p>
                  </div>

                  {/* Center dot */}
                  <div
                    className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10 transition-all duration-500"
                    style={{
                      transform: `translate(-50%, 0) scale(${milestoneProgress > 0.5 ? 1 : 0.6})`,
                      opacity: milestoneProgress,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: `${ms.color}20`,
                        border: `1px solid ${ms.color}40`,
                        boxShadow: milestoneProgress > 0.5 ? `0 0 20px ${ms.color}30` : "none",
                      }}
                    >
                      <span className="text-sm">{ms.icon}</span>
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
