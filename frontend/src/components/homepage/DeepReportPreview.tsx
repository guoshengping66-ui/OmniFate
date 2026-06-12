"use client"

import Link from "next/link"
import { Lock, ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { useLanguage } from "@/contexts/LanguageContext"

const LOCKED_MODULES = [
  { key: "shadow", emoji: "👤" },
  { key: "wealth", emoji: "💰" },
  { key: "romance", emoji: "💕" },
  { key: "mentor", emoji: "🤝" },
  { key: "annual", emoji: "📅" },
  { key: "roadmap", emoji: "🗺️" },
]

export default function DeepReportPreview() {
  const { t, localeHref } = useLanguage()

  return (
    <section className="py-24 px-4 bg-white/[0.015]">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              {t("homepage.deepReport.title")}
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              {t("homepage.deepReport.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass-elevated p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gold/5 blur-[80px] pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {LOCKED_MODULES.map((module, i) => (
                <div key={module.key} className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-4">
                  <span className="text-2xl">{module.emoji}</span>
                  <div className="flex-1">
                    <div className="text-white/70 text-sm font-medium">
                      {t(`homepage.deepReport.locked.${module.key}`)}
                    </div>
                  </div>
                  <Lock size={14} className="text-gold/50" />
                </div>
              ))}
            </div>

            <div className="text-center pt-6 border-t border-white/[0.06]">
              <MagneticButton>
                <Link
                  href={localeHref("/pricing")}
                  className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 text-base group"
                >
                  {t("homepage.deepReport.unlockCTA")}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </MagneticButton>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
