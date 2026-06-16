"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const CAPABILITIES = [
  {
    key: "am16",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    color: "#C5A880",
  },
  {
    key: "fiveDim",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
    color: "#5B9BD5",
  },
  {
    key: "multiModal",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "#7B93C9",
  },
  {
    key: "speed",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    color: "#2D6A4F",
  },
  {
    key: "eventReview",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "#C9A84C",
  },
]

export default function UniqueCapabilities() {
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
      id="capabilities"
      role="region"
      aria-labelledby="capabilities-title"
      className="relative py-16 md:py-28 px-4"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#C5A880]/[0.02] blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div
          className="text-center mb-12 md:mb-16 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/40 text-[10px] tracking-[0.5em] uppercase font-medium">
            {locale === "zh" ? "核心能力" : "CAPABILITIES"}
          </span>
          <h2 id="capabilities-title" className="text-2xl md:text-4xl font-serif font-bold mt-3 mb-3 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("capabilities.title")}
            </span>
          </h2>
          <p className="text-white/25 text-xs md:text-sm max-w-lg mx-auto">
            {t("capabilities.desc")}
          </p>
        </div>

        {/* Capabilities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {CAPABILITIES.map((cap, i) => (
            <div
              key={cap.key}
              className="group rounded-3xl p-5 md:p-6 transition-all duration-500"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: `${0.15 + i * 0.08}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = cap.color + "30"
                e.currentTarget.style.background = `linear-gradient(135deg, ${cap.color}08, transparent)`
                e.currentTarget.style.boxShadow = `0 0 40px ${cap.color}08`
                e.currentTarget.style.transform = "translateY(-4px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                e.currentTarget.style.background = "rgba(255,255,255,0.02)"
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              {/* Icon with glow */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${cap.color}15, ${cap.color}08)`,
                  border: `1px solid ${cap.color}25`,
                  boxShadow: `0 0 20px ${cap.color}06`,
                }}
              >
                <div style={{ color: cap.color }}>{cap.icon}</div>
              </div>

              {/* Title */}
              <h3
                className="font-serif font-bold text-sm md:text-base mb-2 tracking-wide transition-colors duration-300"
                style={{ color: `${cap.color}cc` }}
              >
                {t(`capabilities.${cap.key}Title`)}
              </h3>

              {/* Description */}
              <p className="text-white/25 text-[11px] md:text-xs leading-relaxed">
                {t(`capabilities.${cap.key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
