"use client"
import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

const SERVICES = [
  {
    key: "bazi",
    icon: "☯",
    color: "#C5A880",
    intent: "BAZI",
    descKey: "services.bazi.desc",
    tagKey: "services.bazi.tag",
  },
  {
    key: "astrology",
    icon: "✦",
    color: "#2980B9",
    intent: "ASTROLOGY",
    descKey: "services.astrology.desc",
    tagKey: "services.astrology.tag",
  },
  {
    key: "tarot",
    icon: "🃏",
    color: "#9B59B6",
    intent: "TAROT",
    descKey: "services.tarot.desc",
    tagKey: "services.tarot.tag",
  },
  {
    key: "faceHand",
    icon: "👁",
    color: "#2D6A4F",
    intent: "FACE_HAND",
    descKey: "services.faceHand.desc",
    tagKey: "services.faceHand.tag",
  },
]

export default function ServicesShowcase() {
  const { t, localeHref } = useLanguage()
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
      className="relative py-16 md:py-32 px-4"
    >
      {/* Subtle backdrop for readability */}
      <div className="absolute inset-0 bg-[#080808]/60 pointer-events-none" />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#C5A880]/[0.02] blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div
          className="text-center mb-12 md:mb-16 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/50 text-xs tracking-[0.4em] uppercase font-medium">
            {t("services.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-4 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("services.title")}
            </span>
          </h2>
          <p className="text-parchment-400 text-sm max-w-lg mx-auto">{t("services.desc")}</p>
        </div>

        {/* Service cards grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 transition-all duration-1000 delay-300"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(20px)" }}
        >
          {SERVICES.map((service, i) => (
            <Link
              key={service.key}
              href={localeHref(`/reading/new?intent=${service.intent}`)}
              className="group relative rounded-3xl p-6 transition-all duration-500"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: `${0.4 + i * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = service.color + "30"
                e.currentTarget.style.background = `linear-gradient(135deg, ${service.color}08, transparent)`
                e.currentTarget.style.boxShadow = `0 0 40px ${service.color}10`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                e.currentTarget.style.background = "rgba(255,255,255,0.02)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110"
                style={{
                  background: `${service.color}12`,
                  border: `1px solid ${service.color}25`,
                }}
              >
                <span className="text-2xl">{service.icon}</span>
              </div>

              {/* Title */}
              <h3 className="font-serif font-bold text-base mb-2" style={{ color: service.color }}>
                {t(`services.${service.key}.title`)}
              </h3>

              {/* Tag */}
              <span
                className="inline-block text-xs tracking-wider uppercase px-2 py-0.5 rounded-full mb-3"
                style={{
                  background: `${service.color}12`,
                  color: `${service.color}99`,
                  border: `1px solid ${service.color}20`,
                }}
              >
                {t(service.tagKey)}
              </span>

              {/* Description */}
              <p className="text-parchment-400 text-xs leading-relaxed">
                {t(service.descKey)}
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center gap-1 text-xs font-medium transition-all duration-300 group-hover:gap-2" style={{ color: `${service.color}80` }}>
                <span>{t("services.start")}</span>
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
