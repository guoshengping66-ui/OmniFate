"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { useLanguage } from "@/contexts/LanguageContext"
import dynamic from "next/dynamic"

const HeroScene = dynamic(() => import("@/components/ui/HeroScene").then(m => m.HeroScene), { ssr: false })

export default function HeroSection() {
  const { t, localeHref } = useLanguage()

  return (
    <section className="relative flex items-center overflow-hidden pt-20 pb-12" style={{ minHeight: "82vh" }}>
      <HeroScene />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-gold/20 rounded-full px-4 py-1.5 text-gold text-xs mb-5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
              </span>
              {t("homepage.hero.badge")}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-[2rem] md:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] mb-5">
              <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                {t("homepage.hero.title1")}
              </span>
              <br />
              <span className="text-white">{t("homepage.hero.title2")}</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-base md:text-lg text-white/50 max-w-xl leading-relaxed mb-8">
              {t("homepage.hero.subtitle")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <MagneticButton>
                <Link
                  href={localeHref("/reading/new")}
                  className="btn-gold pulse-ring text-base inline-flex items-center gap-2 px-10 py-3.5 text-lg group"
                >
                  {t("homepage.hero.cta1")}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </MagneticButton>

              <MagneticButton>
                <Link
                  href={localeHref("/am16")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-all text-base backdrop-blur-sm"
                >
                  <Sparkles size={16} />
                  {t("homepage.hero.cta2")}
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-white/[0.06]">
              <p className="text-white/25 text-xs tracking-wide">{t("homepage.hero.trust")}</p>
              <span className="hidden sm:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-4 text-white/35 text-xs">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-gold/50" />
                  {t("homepage.hero.stat1")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-gold">★</span>
                  4.9
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  {t("homepage.hero.stat3")}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
