"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { useLanguage } from "@/contexts/LanguageContext"

export default function FAQAndCTA() {
  const { t, localeHref } = useLanguage()

  return (
    <>
      {/* ══════════ FAQ ══════════ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                {t("homepage.faq.title")}
              </h2>
              <p className="text-white/40 text-sm">{t("homepage.faq.subtitle")}</p>
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <AccordionItem question={t(`faq.q${n}`)} answer={t(`faq.a${n}`)} defaultOpen={i === 0} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <ScrollReveal>
        <section className="py-24 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="card-glass-elevated p-10 md:p-14 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
              <div className="relative">
                <div className="text-4xl mb-5 animate-float">🔮</div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                  {t("homepage.finalCta.title")}
                </h2>
                <p className="text-white/45 mb-8 max-w-md mx-auto text-sm">
                  {t("homepage.finalCta.desc")}
                </p>
                <MagneticButton>
                  <Link
                    href={localeHref("/reading/new")}
                    className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4 group"
                  >
                    {t("homepage.finalCta.button")}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
                <p className="text-white/20 text-[11px] mt-4">{t("homepage.finalCta.note")}</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  )
}
