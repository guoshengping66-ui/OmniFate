"use client"
import { HelpCircle } from "lucide-react"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import Link from "next/link"

export default function FAQPage() {
  const { t } = useLanguage()

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs items={[{ label: t("faq.breadcrumb") }]} />

        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle size={36} className="text-gold mx-auto mb-3" />
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">{t("faq.title")}</h1>
          <p className="text-white/50">{t("faq.contactDesc")}</p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-16">
          {faqs.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <AccordionItem question={item.q} answer={item.a} defaultOpen={i === 0} />
            </ScrollReveal>
          ))}
        </div>

        {/* Contact CTA */}
        <ScrollReveal>
          <div className="card-glass p-8 text-center">
            <h2 className="font-serif text-xl text-gold mb-3">{t("faq.moreQuestions")}</h2>
            <p className="text-white/40 text-sm mb-6">
              {t("faq.contactTeamDesc")}
            </p>
            <Link
              href="/contact"
              className="btn-gold inline-flex items-center gap-2 px-8 py-3"
            >
              {t("faq.contactUs")}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
