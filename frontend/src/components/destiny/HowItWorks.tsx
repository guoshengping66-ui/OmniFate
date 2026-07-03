"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const STEPS = [
  {
    key: "input",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "#C5A880",
  },
  {
    key: "analyze",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    color: "#7B93C9",
  },
  {
    key: "discover",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "#C9A84C",
  },
]

export default function HowItWorks() {
  const { t, locale } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.2 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={containerRef}
      id="services"
      className="relative py-16 md:py-24 px-4"
    >
      {/* Connecting line glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full bg-[#C5A880]/[0.015] blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        {/* Section header */}
        <div
          className="text-center mb-12 md:mb-16 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/40 text-xs tracking-[0.5em] uppercase font-medium">
            {locale === "zh" ? "流程" : "PROCESS"}
          </span>
          <h2 className="text-2xl md:text-4xl font-serif font-bold mt-3 mb-3 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("howItWorks.title")}
            </span>
          </h2>
          <p className="text-parchment-400 text-xs md:text-sm max-w-md mx-auto">
            {t("howItWorks.desc")}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Connection lines (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px">
            <div
              className="w-full h-full transition-all duration-1500 delay-500"
              style={{
                background: "linear-gradient(90deg, rgba(197,168,128,0.2), rgba(123,147,201,0.2), rgba(201,168,76,0.2))",
                opacity: isVisible ? 1 : 0,
                transformOrigin: "left",
                transform: isVisible ? "scaleX(1)" : "scaleX(0)",
              }}
            />
          </div>

          {STEPS.map((step, i) => (
            <div
              key={step.key}
              className="relative text-center transition-all duration-700"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: `${0.3 + i * 0.2}s`,
              }}
            >
              {/* Step number + icon */}
              <div className="relative inline-flex items-center justify-center mb-5">
                {/* Glow ring */}
                <div
                  className="absolute w-20 h-20 rounded-full transition-opacity duration-1000"
                  style={{
                    background: `radial-gradient(circle, ${step.color}12, transparent)`,
                    opacity: isVisible ? 1 : 0,
                    transitionDelay: `${0.5 + i * 0.2}s`,
                  }}
                />
                <div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}10, ${step.color}05)`,
                    border: `1px solid ${step.color}25`,
                    boxShadow: isVisible ? `0 0 30px ${step.color}08` : "none",
                    transitionDelay: `${0.4 + i * 0.2}s`,
                  }}
                >
                  <div style={{ color: step.color }}>{step.icon}</div>
                </div>
                {/* Step number */}
                <span
                  className="absolute -top-1 -right-1 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: `${step.color}15`,
                    color: step.color,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  {i + 1}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif font-bold text-sm md:text-base mb-2 tracking-wide" style={{ color: `${step.color}cc` }}>
                {t(`howItWorks.${step.key}Title`)}
              </h3>

              {/* Description */}
              <p className="text-parchment-400 text-xs leading-relaxed max-w-[240px] mx-auto">
                {t(`howItWorks.${step.key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
