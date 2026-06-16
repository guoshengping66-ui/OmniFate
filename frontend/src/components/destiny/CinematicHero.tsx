"use client"
import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useLanguage } from "@/contexts/LanguageContext"

const FateOrb = dynamic(() => import("./FateOrb"), { ssr: false })

export default function CinematicHero() {
  const { t, locale, localeHref } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)

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
              {t("hero.desc").split("\n")[0]}
              <br />
              <span className="text-[#C5A880]/50">{t("hero.desc").split("\n")[1]}</span>
            </p>

            {/* CTA Buttons — two clear actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
              <a
                href={localeHref("/reading/new")}
                className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-medium text-xs sm:text-sm tracking-widest uppercase transition-all duration-500"
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
                {t("hero.cta1")}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>

              <a
                href="#capabilities"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-xs sm:text-sm tracking-wider transition-all duration-500 text-white/30 hover:text-white/60"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
                {locale === "zh" ? "探索能力" : "Explore"}
              </a>
            </div>

            {/* Stats bar — subtle social proof */}
            <div className="flex items-center gap-4 sm:gap-6 mt-10 lg:mt-14 lg:justify-start justify-center text-white/15 text-[10px] sm:text-xs tracking-widest">
              <span>{t("hero.stat1")}</span>
              <span className="w-px h-3 bg-white/10" />
              <span>4.9 ★</span>
              <span className="w-px h-3 bg-white/10" />
              <span>{t("hero.stat3")}</span>
            </div>
          </div>

          {/* Right: 3D Fate Orb — the AI engine visual */}
          <div className="flex-1 flex items-center justify-center w-full lg:w-auto h-[300px] sm:h-[400px] lg:h-[500px] relative">
            {/* Orb glow backdrop */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] rounded-full bg-[#C5A880]/[0.03] blur-[100px]" />
            </div>
            <FateOrb />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-white/15 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-[#C5A880]/30 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
