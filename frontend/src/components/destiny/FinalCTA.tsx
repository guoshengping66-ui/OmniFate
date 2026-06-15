"use client"
import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function FinalCTA() {
  const { t, locale, localeHref } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [agreed, setAgreed] = useState(false)

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
      className="relative min-h-screen flex items-center justify-center py-32 px-4"
      style={{ background: "#080808" }}
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
        <p className="text-white/30 text-sm max-w-md mx-auto mb-10 leading-relaxed">
          {t("cta.desc")}
        </p>

        {/* CTA Button */}
        <Link
          href={localeHref("/reading/new")}
          className="group relative inline-flex items-center gap-3 px-12 py-4 rounded-2xl font-medium text-sm tracking-widest uppercase transition-all duration-500 mb-6"
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

        {/* Disclaimer checkbox */}
        <div className="max-w-md mx-auto mt-8">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div
                className="w-4 h-4 rounded transition-all duration-200 flex items-center justify-center"
                style={{
                  background: agreed ? "rgba(197,168,128,0.2)" : "transparent",
                  border: `1px solid ${agreed ? "rgba(197,168,128,0.5)" : "rgba(255,255,255,0.15)"}`,
                }}
              >
                {agreed && (
                  <svg className="w-2.5 h-2.5 text-[#C5A880]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-[10px] text-white/20 leading-relaxed text-left">
              {locale === "zh"
                ? "我理解我的命盘蓝图是深度个性化的玄学激活服务。一旦大师 consecrates 我的个人矩阵，不支持退款。"
                : "I understand that my Destiny Blueprint is a deeply personalized custom metaphysical activation. Once the Master consecrates my personal matrix, no refunds can be processed."}
            </span>
          </label>
        </div>

        {/* Note */}
        <p className="text-white/15 text-[11px] mt-6">{t("cta.note")}</p>
      </div>
    </section>
  )
}
