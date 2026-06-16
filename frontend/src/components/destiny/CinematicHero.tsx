"use client"
import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useLanguage } from "@/contexts/LanguageContext"

const FateOrb = dynamic(() => import("./FateOrb"), { ssr: false })

export default function CinematicHero() {
  const { t, locale, localeHref } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const descLines = t("hero.desc").split("\n")

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const scrollY = window.scrollY
      const opacity = 1 - Math.min(scrollY / 600, 1)
      const translateY = scrollY * 0.3
      sectionRef.current.style.opacity = String(opacity)
      sectionRef.current.style.transform = `translateY(${translateY}px)`
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden"
    >
      {/* Radial glow - center */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[#C5A880]/[0.025] blur-[200px]" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-500/[0.01] blur-[180px]" />
      </div>

      {/* Split layout: text left, orb right on desktop; stacked on mobile */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-12">

          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left lg:max-w-xl">
            {/* Badge — unique platform positioning */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05] backdrop-blur-sm mb-6 lg:mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
              <span className="text-[#C5A880]/70 text-xs tracking-[0.3em] uppercase font-medium">
                {t("hero.badge")}
              </span>
            </div>

            {/* Title — 三行式: 品牌定位 + 产品名 + 系统名 */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold tracking-[0.06em] uppercase mb-6 leading-[1.05]">
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #C5A880 0%, #E8D5B7 40%, #C5A880 80%)",
                }}
              >
                {t("hero.title1")}
              </span>
              <span className="block text-white/80 text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-3 lg:mt-4 tracking-[0.12em] font-light">
                {t("hero.title2")}
              </span>
            </h1>

            {/* Subtitle — AI+行为分析 unique positioning */}
            <p className="text-white/35 text-sm md:text-base max-w-lg mx-auto lg:mx-0 mb-8 lg:mb-10 leading-relaxed tracking-wide">
              {descLines[0]}
              {descLines.length > 1 && (
                <>
                  <br />
                  <span className="text-[#C5A880]/50">{descLines[1]}</span>
                </>
              )}
            </p>

            {/* CTA Buttons — two clear actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
              <a
                href={localeHref("/reading/new")}
                className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-medium text-xs sm:text-sm tracking-widest uppercase transition-all duration-500"
                style={{
                  background: "linear-gradient(135deg, #D4AF37 0%, #C5A880 100%)",
                  border: "none",
                  color: "#050816",
                  boxShadow: "0 0 30px rgba(212,175,55,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 50px rgba(212,175,55,0.5)"
                  e.currentTarget.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(212,175,55,0.3)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                {locale === "zh" ? "开始推命" : "Start Reading"}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>

              <a
                href={localeHref("/readings")}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-xs sm:text-sm tracking-wider transition-all duration-500"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(212,175,55,0.5)",
                  color: "#D4AF37",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(212,175,55,0.1)"
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.8)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"
                }}
              >
                {locale === "zh" ? "查看案例" : "View Examples"}
              </a>
            </div>

            {/* Trust indicators — essential for high-skepticism industry */}
            <div className="flex items-center gap-3 sm:gap-4 mt-8 lg:mt-10 lg:justify-start justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[#C5A880] text-xs font-medium">128,000+</span>
                <span className="text-white/30 text-[10px]">{locale === "zh" ? "已生成档案" : "Generated"}</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[#D4AF37] text-xs">★</span>
                <span className="text-[#C5A880] text-xs font-medium">4.9</span>
                <span className="text-white/30 text-[10px]">{locale === "zh" ? "用户评分" : "Rating"}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[#C5A880] text-xs font-medium">5</span>
                <span className="text-white/30 text-[10px]">{locale === "zh" ? "大系统交叉验证" : "Systems"}</span>
              </div>
            </div>
          </div>

          {/* Right: 3D Fate Orb — the AI engine visual */}
          <div className="flex-1 flex items-center justify-center w-full lg:w-auto h-[300px] sm:h-[400px] lg:h-[500px] relative">
            {/* Orb glow backdrop */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] rounded-full bg-[#C5A880]/[0.03] blur-[100px]" />
            </div>
            <FateOrb />

            {/* Result preview card — bottom right */}
            <div className="absolute bottom-4 right-0 sm:right-4 lg:right-0 w-[220px] sm:w-[260px] p-4 rounded-2xl bg-[#0A1235]/80 border border-[#C5A880]/10 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#C5A880]/20 flex items-center justify-center">
                  <span className="text-[#C5A880] text-xs">✦</span>
                </div>
                <span className="text-[#C5A880]/70 text-[10px] tracking-wider uppercase">
                  {locale === "zh" ? "命运档案预览" : "Destiny Preview"}
                </span>
              </div>

              {/* Progress bars */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/50 text-[10px]">{locale === "zh" ? "财富潜力" : "Wealth"}</span>
                    <span className="text-[#C5A880] text-[10px] font-medium">82%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#C5A880] to-[#D4AF37] rounded-full" style={{ width: "82%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/50 text-[10px]">{locale === "zh" ? "事业天赋" : "Career"}</span>
                    <span className="text-[#C5A880] text-[10px] font-medium">91%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#C5A880] to-[#D4AF37] rounded-full" style={{ width: "91%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/50 text-[10px]">{locale === "zh" ? "感情模式" : "Love"}</span>
                    <span className="text-[#C5A880] text-[10px] font-medium">73%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#C5A880] to-[#D4AF37] rounded-full" style={{ width: "73%" }} />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5">
                <span className="text-white/20 text-[9px]">
                  {locale === "zh" ? "生成你的专属档案 →" : "Generate your profile →"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[#C5A880]/40 text-[10px] tracking-[0.2em]">
          {locale === "zh" ? "↓ 探索你的命运档案" : "↓ Explore Your Destiny"}
        </span>
        <div className="w-5 h-8 rounded-full border border-[#C5A880]/20 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-[#C5A880]/40 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
