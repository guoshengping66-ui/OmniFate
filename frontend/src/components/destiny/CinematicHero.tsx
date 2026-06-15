"use client"
import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useLanguage } from "@/contexts/LanguageContext"

const FateOrb = dynamic(() => import("./FateOrb"), { ssr: false })

export default function CinematicHero() {
  const { t, localeHref } = useLanguage()
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#080808" }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0">
        <div className="stars-container absolute inset-0" />
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              background: `rgba(197, 168, 128, ${Math.random() * 0.4 + 0.1})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#C5A880]/[0.03] blur-[150px]" />
      </div>

      {/* 3D Fate Orb */}
      <div className="absolute inset-0 z-0">
        <FateOrb />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05] backdrop-blur-sm mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
          <span className="text-[#C5A880]/70 text-xs tracking-[0.3em] uppercase font-medium">
            {t("hero.badge")}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-[0.08em] uppercase mb-6 leading-[1.1]">
          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #C5A880 0%, #E8D5B7 40%, #C5A880 80%)",
            }}
          >
            {t("hero.title1")}
          </span>
          <span className="block text-white/90 text-3xl md:text-4xl lg:text-5xl mt-4 tracking-[0.15em] font-light">
            {t("hero.title2")}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/40 text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed tracking-wide">
          {t("hero.desc").split("\n")[0]}
          <br />
          <span className="text-[#C5A880]/60">{t("hero.desc").split("\n")[1]}</span>
        </p>

        {/* CTA Button - Vision Pro glassmorphism style */}
        <a
          href="#archetypes"
          className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-medium text-sm tracking-widest uppercase transition-all duration-500"
          style={{
            background: "linear-gradient(135deg, rgba(197,168,128,0.12) 0%, rgba(197,168,128,0.04) 100%)",
            border: "1px solid rgba(197,168,128,0.2)",
            backdropFilter: "blur(20px)",
            color: "#C5A880",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.2) 0%, rgba(197,168,128,0.08) 100%)"
            e.currentTarget.style.borderColor = "rgba(197,168,128,0.4)"
            e.currentTarget.style.boxShadow = "0 0 40px rgba(197,168,128,0.15)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.12) 0%, rgba(197,168,128,0.04) 100%)"
            e.currentTarget.style.borderColor = "rgba(197,168,128,0.2)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          {t("hero.cta1")}
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-6 mt-12 text-white/20 text-xs tracking-widest">
          <span>{t("hero.stat1")}</span>
          <span className="w-px h-3 bg-white/10" />
          <span>4.9 ★</span>
          <span className="w-px h-3 bg-white/10" />
          <span>{t("hero.stat3")}</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-5 h-8 rounded-full border border-white/15 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-[#C5A880]/40 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
