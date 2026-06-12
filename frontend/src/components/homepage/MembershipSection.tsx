"use client"

import Link from "next/link"
import { Check, Crown, ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { useLanguage } from "@/contexts/LanguageContext"

const BENEFITS = [
  { key: "daily" },
  { key: "advice" },
  { key: "support" },
  { key: "events" },
]

export default function MembershipSection() {
  const { t, localeHref } = useLanguage()

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 text-gold text-xs mb-4">
              <Crown size={12} />
              {t("homepage.membership.badge")}
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              {t("homepage.membership.title")}
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              {t("homepage.membership.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass-elevated p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-gold/5 blur-[80px] pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-3xl mb-4">🔮</div>
                <h3 className="font-serif font-bold text-xl text-gold mb-4">
                  {t("homepage.membership.featureTitle")}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  {t("homepage.membership.featureDesc")}
                </p>

                <div className="space-y-3">
                  {BENEFITS.map((benefit, i) => (
                    <div key={benefit.key} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center">
                        <Check size={10} className="text-gold" />
                      </div>
                      <span className="text-white/70 text-sm">
                        {t(`homepage.membership.benefits.${benefit.key}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center items-center">
                <MagneticButton>
                  <Link
                    href={localeHref("/pricing")}
                    className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-3 text-base group"
                  >
                    {t("homepage.membership.cta")}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
