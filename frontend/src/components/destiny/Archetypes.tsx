"use client"
import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const ARCHETYPES = [
  { key: "bazi", icon: "☯", accent: "#2D6A4F", glyph: "甲" },
  { key: "astrology", icon: "✦", accent: "#C1121F", glyph: "子" },
  { key: "tarot", icon: "🃏", accent: "#C5A880", glyph: "乾" },
  { key: "face", icon: "👁", accent: "#E8D5B7", glyph: "离" },
  { key: "palm", icon: "🤚", accent: "#2980B9", glyph: "坤" },
]

export default function Archetypes() {
  const { t } = useLanguage()
  const [active, setActive] = useState(0)
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
      id="archetypes"
      ref={containerRef}
      className="relative min-h-screen flex items-center py-32 px-4"
      style={{ background: "#080808" }}
    >
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A880]/10 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div
          className="text-center mb-16 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/50 text-xs tracking-[0.4em] uppercase font-medium">
            {t("agents.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-4 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("agents.title")}
            </span>
          </h2>
          <p className="text-white/30 text-sm max-w-lg mx-auto">{t("agents.desc")}</p>
        </div>

        {/* Archetype cards - horizontal scroll */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4">
            {ARCHETYPES.map((arch, i) => (
              <div
                key={arch.key}
                className="flex-shrink-0 snap-center"
                style={{
                  width: "min(280px, 80vw)",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(40px)",
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
                }}
              >
                <div
                  className="relative h-full rounded-3xl p-6 cursor-pointer transition-all duration-500 group"
                  style={{
                    background: active === i
                      ? `linear-gradient(135deg, ${arch.accent}15, ${arch.accent}08)`
                      : "rgba(255,255,255,0.02)",
                    border: `1px solid ${active === i ? arch.accent + "40" : "rgba(255,255,255,0.06)"}`,
                    backdropFilter: "blur(10px)",
                  }}
                  onClick={() => setActive(i)}
                  onMouseEnter={(e) => {
                    if (active !== i) {
                      e.currentTarget.style.borderColor = arch.accent + "25"
                      e.currentTarget.style.background = `linear-gradient(135deg, ${arch.accent}08, transparent)`
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (active !== i) {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)"
                    }
                  }}
                >
                  {/* Glyph watermark */}
                  <div
                    className="absolute top-4 right-4 text-6xl font-serif opacity-[0.04] select-none transition-opacity duration-500 group-hover:opacity-[0.08]"
                    style={{ color: arch.accent }}
                  >
                    {arch.glyph}
                  </div>

                  {/* Status dot */}
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: arch.accent,
                        boxShadow: active === i ? `0 0 12px ${arch.accent}60` : "none",
                      }}
                    />
                    <span className="text-[10px] font-medium text-white/25 tracking-widest uppercase">
                      {t(`agent.${arch.key}.tag`)}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="text-4xl mb-4 transition-transform duration-500 group-hover:scale-110">
                    {arch.icon}
                  </div>

                  {/* Title */}
                  <h3 className="font-serif font-bold text-lg mb-2" style={{ color: arch.accent }}>
                    {t(`agent.${arch.key}._label`)}
                  </h3>

                  {/* Description */}
                  <p className="text-white/30 text-xs leading-relaxed mb-3">
                    {t(`agent.${arch.key}.desc`)}
                  </p>

                  {/* Detail */}
                  <p className="text-white/15 text-[11px] leading-relaxed">
                    {t(`agent.${arch.key}.detail`)}
                  </p>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-px transition-all duration-500"
                    style={{
                      background: active === i
                        ? `linear-gradient(90deg, transparent, ${arch.accent}40, transparent)`
                        : "transparent",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
