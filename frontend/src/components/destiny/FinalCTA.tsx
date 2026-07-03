"use client"
import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function FinalCTA() {
  const { t, localeHref } = useLanguage()
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
      className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center py-16 md:py-32 px-4"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C5A880]/[0.03] blur-[150px]" />
      </div>

      <div
        className="max-w-2xl mx-auto text-center relative transition-all duration-1000"
        style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(40px)" }}
      >
        {/* Decorative glyphs */}
        <div className="absolute -top-20 -left-10 text-6xl font-serif text-[#C5A880]/[0.03] select-none">甲</div>
        <div className="absolute -bottom-20 -right-10 text-6xl font-serif text-[#C5A880]/[0.03] select-none">坤</div>

        {/* Icon */}
        <div className="mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(197,168,128,0.12), rgba(197,168,128,0.04))",
              border: "1px solid rgba(197,168,128,0.2)",
            }}
          >
            <span className="text-2xl">✦</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 tracking-wide">
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
            {t("cta.title")}
          </span>
        </h2>

        {/* Description */}
        <p className="text-parchment-400 text-sm max-w-md mx-auto mb-10 leading-relaxed">
          {t("cta.desc")}
        </p>

        {/* CTA Button */}
        <Link
          href={localeHref("/reading/new")}
          className="group relative inline-flex items-center gap-3 px-8 sm:px-12 py-3 sm:py-4 rounded-2xl font-medium text-xs sm:text-sm tracking-widest uppercase transition-all duration-500 mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(197,168,128,0.15), rgba(197,168,128,0.06))",
            border: "1px solid rgba(197,168,128,0.3)",
            backdropFilter: "blur(20px)",
            color: "#C5A880",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.25), rgba(197,168,128,0.1))"
            e.currentTarget.style.borderColor = "rgba(197,168,128,0.5)"
            e.currentTarget.style.boxShadow = "0 0 50px rgba(197,168,128,0.15)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.15), rgba(197,168,128,0.06))"
            e.currentTarget.style.borderColor = "rgba(197,168,128,0.3)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          {t("cta.button")}
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Disclaimer — clean i18n text */}
        <p className="max-w-md mx-auto mt-8 text-parchment-400 text-xs leading-relaxed">
          {t("cta.disclaimer")}
        </p>

        {/* Note */}
        <p className="text-parchment-400 text-xs mt-6">{t("cta.note")}</p>
      </div>
    </section>
  )
}
