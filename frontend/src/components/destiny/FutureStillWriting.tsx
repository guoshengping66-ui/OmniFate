"use client"
import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

const GLYPHS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]

function FloatingGlyph({ glyph, delay, x, y }: { glyph: string; delay: number; x: number; y: number }) {
  return (
    <div
      className="absolute text-4xl sm:text-5xl md:text-6xl font-serif select-none pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        color: "rgba(197,168,128,0.03)",
        animation: `glyphFloat 8s ease-in-out infinite ${delay}s`,
      }}
    >
      {glyph}
    </div>
  )
}

export default function FutureStillWriting() {
  const { locale, localeHref } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-28 sm:py-40 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full bg-[#C5A880]/[0.02] blur-[200px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#A882FF]/[0.01] blur-[150px]" />
      </div>

      {/* Floating glyphs */}
      {GLYPHS.slice(0, 6).map((g, i) => (
        <FloatingGlyph
          key={g}
          glyph={g}
          delay={i * 1.2}
          x={10 + (i * 15)}
          y={15 + (i % 3) * 25}
        />
      ))}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div
          className="text-center transition-all duration-1200"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(50px)",
            transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Decorative zodiac ring */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {ZODIAC.slice(0, 5).map((z, i) => (
              <span
                key={i}
                className="text-lg sm:text-xl transition-all duration-700"
                style={{
                  color: `rgba(197,168,128,${0.15 + i * 0.05})`,
                  transitionDelay: `${0.3 + i * 0.1}s`,
                  opacity: isVisible ? 1 : 0,
                }}
              >
                {z}
              </span>
            ))}
          </div>

          {/* Main message */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-wide mb-8 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C5A880] via-[#E8D5B7] to-[#C5A880]">
              {locale === "zh" ? "你的未来" : "Your Future"}
            </span>
            <br />
            <span className="text-parchment-400 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.08em]">
              {locale === "zh" ? "仍在书写" : "Is Still Being Written"}
            </span>
          </h2>

          {/* Poetic description */}
          <p className="text-parchment-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-4">
            {locale === "zh"
              ? "命盘是起点，不是终点。AI 能推演趋势，但每一个选择都在重新定义你的航线。"
              : "Your chart is a starting point, not a destination. AI projects trends, but every choice redefines your route."}
          </p>
          <p className="text-[#C5A880]/30 text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-12">
            {locale === "zh"
              ? "命运的齿轮已经开始转动，而你是唯一的掌舵人。"
              : "The gears of destiny have begun to turn — and you are the sole helmsman."}
          </p>

          {/* CTA */}
          <Link
            href={localeHref("/reading/new")}
            className="group relative inline-flex items-center gap-3 px-10 sm:px-14 py-4 sm:py-5 rounded-2xl font-medium text-sm sm:text-base tracking-widest uppercase transition-all duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(197,168,128,0.08))",
              border: "1px solid rgba(212,175,55,0.35)",
              color: "#D4AF37",
              boxShadow: "0 0 40px rgba(212,175,55,0.12)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.28), rgba(197,168,128,0.12))"
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.55)"
              e.currentTarget.style.boxShadow = "0 0 60px rgba(212,175,55,0.2)"
              e.currentTarget.style.transform = "translateY(-3px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(197,168,128,0.08))"
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"
              e.currentTarget.style.boxShadow = "0 0 40px rgba(212,175,55,0.12)"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            {locale === "zh" ? "开始书写你的命运" : "Start Writing Your Destiny"}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          {/* Subtle note */}
          <p className="text-parchment-400 text-xs tracking-wider mt-8">
            {locale === "zh"
              ? "免费生成你的专属命盘 · 无需付费即可体验 AI 解读"
              : "Generate your chart for free · Experience AI insights without payment"}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes glyphFloat {
          0%, 100% { opacity: 0.03; transform: translateY(0) rotate(0deg); }
          50% { opacity: 0.06; transform: translateY(-15px) rotate(3deg); }
        }
      `}</style>
    </section>
  )
}
