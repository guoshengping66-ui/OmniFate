"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const ENGINES = [
  { key: "bazi", icon: "☯", accent: "#2D6A4F", glyph: "木", tag: "eastern" },
  { key: "astrology", icon: "✦", accent: "#C1121F", glyph: "火", tag: "western" },
  { key: "tarot", icon: "🃏", accent: "#C5A880", glyph: "土", tag: "symbolic" },
  { key: "face", icon: "👁", accent: "#E8D5B7", glyph: "金", tag: "pattern" },
  { key: "palm", icon: "🤚", accent: "#2980B9", glyph: "水", tag: "biometric" },
]

export default function DestinyEngines() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

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
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div
          className="text-center mb-16 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/50 text-xs tracking-[0.4em] uppercase font-medium">
            {t("curated.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-4 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("curated.title")}
            </span>
          </h2>
          <p className="text-white/30 text-sm max-w-lg mx-auto">{t("curated.desc")}</p>
        </div>

        {/* Engine modules - floating grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {ENGINES.map((engine, i) => (
            <div
              key={engine.key}
              className="transition-all duration-700"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? `translateY(0) scale(1)`
                  : `translateY(40px) scale(0.95)`,
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              <div
                className="relative h-full rounded-3xl p-6 text-center cursor-pointer transition-all duration-500 group overflow-hidden"
                style={{
                  background: hovered === i
                    ? `linear-gradient(135deg, ${engine.accent}18, ${engine.accent}08)`
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${hovered === i ? engine.accent + "35" : "rgba(255,255,255,0.06)"}`,
                  backdropFilter: "blur(10px)",
                  transform: hovered === i ? "translateY(-4px)" : "translateY(0)",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Geometric light rays on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, ${engine.accent}10, transparent 70%)`,
                  }}
                />

                {/* Glyph watermark */}
                <div
                  className="absolute top-3 right-3 text-3xl font-serif opacity-[0.04] select-none group-hover:opacity-[0.1] transition-opacity duration-500"
                  style={{ color: engine.accent }}
                >
                  {engine.glyph}
                </div>

                {/* Tag */}
                <div className="text-[9px] font-medium text-white/20 tracking-[0.2em] uppercase mb-4">
                  {t(`agent.${engine.key}.tag`)}
                </div>

                {/* Icon */}
                <div className="text-4xl mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  {engine.icon}
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-sm mb-2" style={{ color: engine.accent }}>
                  {t(`agent.${engine.key}._label`)}
                </h3>

                {/* Description */}
                <p className="text-white/25 text-[11px] leading-relaxed">
                  {t(`agent.${engine.key}.desc`)}
                </p>

                {/* Bottom accent */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                  style={{ background: `linear-gradient(90deg, transparent, ${engine.accent}30, transparent)` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
