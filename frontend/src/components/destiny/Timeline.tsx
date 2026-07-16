"use client"
import { useRef, useEffect, useState, useMemo } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const MILESTONE_KEYS = ["awakening", "eclipse", "zenith"] as const
const COLORS = ["#C5A880", "#C1121F", "#2D6A4F"]

export default function Timeline() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const milestones = useMemo(() =>
    MILESTONE_KEYS.map((key, i) => ({
      key,
      color: COLORS[i],
      data: t(`timeline.milestones.${key}`),
    })), [t])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowH = window.innerHeight
      const sectionH = sectionRef.current.offsetHeight
      const scrolled = windowH - rect.top
      const total = windowH + sectionH
      setScrollProgress(Math.max(0, Math.min(1, scrolled / total)))
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="timeline"
      className="relative py-24 md:py-40 px-4 overflow-hidden"
      style={{ background: "#080808" }}
    >
      {/* Top gradient transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-[#080808] via-[#080808] to-transparent" />
      </div>

      {/* Ambient glow — connects to Hero's FateOrb aesthetic */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[200px] opacity-[0.02]"
          style={{
            background: "radial-gradient(circle, #C5A880 0%, transparent 70%)",
            transform: `translate(-50%, ${scrollProgress * -50}px)`,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 md:mb-32">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05]  mb-6 transition-all duration-700"
            style={{ opacity: scrollProgress > 0.05 ? 1 : 0, transform: `translateY(${scrollProgress > 0.05 ? 0 : 20}px)` }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="text-[#C5A880]/70 text-xs tracking-[0.3em] uppercase font-medium">
              {t("timeline.badge")}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mt-4 mb-6 tracking-wide">
            <span
              className="bg-clip-text text-transparent transition-all duration-700"
              style={{
                backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)",
                opacity: scrollProgress > 0.08 ? 1 : 0,
                transform: `translateY(${scrollProgress > 0.08 ? 0 : 30}px)`,
              }}
            >
              {t("timeline.title")}
            </span>
          </h2>

          <p
            className="text-white/30 text-sm md:text-base max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-100"
            style={{ opacity: scrollProgress > 0.1 ? 1 : 0, transform: `translateY(${scrollProgress > 0.1 ? 0 : 20}px)` }}
          >
            {t("timeline.subtitle")}
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Vertical Progress Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px">
            {/* Animated progress */}
            <div
              className="w-full bg-gradient-to-b from-[#C5A880]/60 via-[#C5A880]/30 to-[#C5A880]/5 transition-all duration-150 ease-out"
              style={{ height: `${scrollProgress * 100}%` }}
            />
            {/* Static base line */}
            <div className="w-full h-full bg-[#C5A880]/5 absolute inset-0" />
          </div>

          {/* Milestones */}
          <div className="space-y-32 md:space-y-40">
            {milestones.map((ms, i) => {
              const milestoneProgress = Math.max(0, Math.min(1, (scrollProgress - (i * 0.2 + 0.15)) * 5))
              const isLeft = i % 2 === 0
              const data = ms.data as unknown as { year: string; title: string; desc: string; icon: string }

              return (
                <div
                  key={ms.key}
                  className={`relative flex items-center gap-8 md:gap-0 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Content Card */}
                  <div
                    className={`flex-1 md:w-1/2 ${isLeft ? "md:pr-20 md:text-right" : "md:pl-20 md:text-left"} pl-16 md:pl-0`}
                    style={{
                      opacity: milestoneProgress,
                      transform: `translateX(${(1 - milestoneProgress) * (isLeft ? -40 : 40)}px)`,
                      transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* Year badge */}
                    <div className={`inline-flex items-center gap-2 mb-4 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{
                          background: `${ms.color}15`,
                          border: `1px solid ${ms.color}30`,
                        }}
                      >
                        {data.icon}
                      </div>
                      <span
                        className="text-xs tracking-[0.3em] uppercase font-medium"
                        style={{ color: `${ms.color}80` }}
                      >
                        {data.year}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-2xl md:text-3xl font-serif font-bold mb-3"
                      style={{
                        color: ms.color,
                        textShadow: milestoneProgress > 0.5 ? `0 0 40px ${ms.color}20` : "none",
                      }}
                    >
                      {data.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/35 text-sm md:text-base leading-relaxed max-w-md">
                      {data.desc}
                    </p>

                    {/* Connecting line to center */}
                    <div
                      className={`hidden md:block absolute top-8 ${isLeft ? "right-0" : "left-0"} w-20 h-px`}
                      style={{
                        background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${ms.color}40, transparent)`,
                        opacity: milestoneProgress,
                      }}
                    />
                  </div>

                  {/* Center Node */}
                  <div
                    className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 transition-all duration-600"
                    style={{
                      opacity: milestoneProgress,
                      transform: `translate(-50%, 0) scale(${0.6 + milestoneProgress * 0.4})`,
                    }}
                  >
                    {/* Outer glow */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl transition-opacity duration-500"
                      style={{
                        background: ms.color,
                        opacity: milestoneProgress > 0.5 ? 0.15 : 0,
                      }}
                    />
                    {/* Node circle */}
                    <div
                      className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${ms.color}20, ${ms.color}08)`,
                        border: `2px solid ${ms.color}${milestoneProgress > 0.5 ? "60" : "30"}`,
                        boxShadow: milestoneProgress > 0.5 ? `0 0 30px ${ms.color}25` : "none",
                      }}
                    >
                      <span className="text-lg">{data.icon}</span>
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div
          className="mt-24 md:mt-32 text-center transition-all duration-700"
          style={{
            opacity: scrollProgress > 0.85 ? 1 : 0,
            transform: `translateY(${scrollProgress > 0.85 ? 0 : 30}px)`,
          }}
        >
          <a
            href="#reading"
            className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 rounded-2xl font-medium text-xs sm:text-sm tracking-widest uppercase transition-all duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(197,168,128,0.15) 0%, rgba(197,168,128,0.05) 100%)",
              border: "1px solid rgba(197,168,128,0.3)",
              backdropFilter: "blur(20px)",
              color: "#C5A880",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.25) 0%, rgba(197,168,128,0.1) 100%)"
              e.currentTarget.style.borderColor = "rgba(197,168,128,0.5)"
              e.currentTarget.style.boxShadow = "0 0 50px rgba(197,168,128,0.15)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.15) 0%, rgba(197,168,128,0.05) 100%)"
              e.currentTarget.style.borderColor = "rgba(197,168,128,0.3)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            {t("timeline.cta")}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="text-white/20 text-xs mt-4 tracking-wide">
            {t("timeline.ctaDesc")}
          </p>
        </div>
      </div>

      {/* Bottom gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-t from-[#080808] via-[#080808] to-transparent" />
      </div>
    </section>
  )
}
