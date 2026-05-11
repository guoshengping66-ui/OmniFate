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
        <Breadcrumbs items={[{ label: "常见问题" }]} />

        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle size={36} className="text-gold mx-auto mb-3" />
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">{t("faq.title")}</h1>
          <p className="text-white/50">如有其他疑问，欢迎联系我们</p>
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
            <h2 className="font-serif text-xl text-gold mb-3">还有疑问？</h2>
            <p className="text-white/40 text-sm mb-6">
              我们的团队随时为你解答关于命理分析、会员服务等方面的问题。
            </p>
            <Link
              href="/contact"
              className="btn-gold inline-flex items-center gap-2 px-8 py-3"
            >
              联系我们
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
