"use client"

import Link from "next/link"
import { ArrowRight, Users } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AM16Showcase() {
  const { t, locale, localeHref } = useLanguage()

  const EXAMPLE_TYPES = [
    { code: "DXIE", emoji: "🔥", titleKey: "am16.DXIE.title", level: locale === "zh" ? "天选" : "Chosen" },
    { code: "DSIE", emoji: "⚡", titleKey: "am16.DSIE.title", level: locale === "zh" ? "天选" : "Chosen" },
    { code: "DXIP", emoji: "⚔️", titleKey: "am16.DXIP.title", level: locale === "zh" ? "逆命" : "Rebel" },
    { code: "FSGE", emoji: "🤖", titleKey: "am16.FSGE.title", level: locale === "zh" ? "观命" : "Seer" },
  ]

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 text-gold text-xs mb-4">
              <Users size={12} />
              {t("homepage.am16Showcase.badge")}
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-3">
              {t("homepage.am16Showcase.title")}
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              {t("homepage.am16Showcase.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {EXAMPLE_TYPES.map((type, i) => (
            <ScrollReveal key={type.code} delay={i * 0.08} direction="up">
              <div className="card-glass p-5 text-center group hover:border-gold/20 transition-all duration-300">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{type.emoji}</div>
                <div className="text-gold font-bold text-xl mb-1 font-serif">{type.code}</div>
                <div className="text-white/60 text-xs mb-2 line-clamp-2">{t(type.titleKey)}</div>
                <div className="inline-flex items-center gap-1 bg-gold/10 rounded-full px-2 py-0.5">
                  <span className="text-gold text-[10px]">{type.level}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center">
            <MagneticButton>
              <Link
                href={localeHref("/am16")}
                className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 text-base group"
              >
                {t("homepage.am16Showcase.cta")}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
            <p className="text-white/30 text-xs mt-4">{t("homepage.am16Showcase.stats")}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
