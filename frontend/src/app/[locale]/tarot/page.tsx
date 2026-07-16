"use client"
export const dynamic = "force-dynamic"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useMemo } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { safeJsonLd } from "@/utils/safeJsonLd"

export default function TarotSEOPage() {
  const { t, localeHref, locale } = useLanguage()

  const faqItems = useMemo(() => [1,2,3,4].map(i => ({
    question: t("seo.tarot.faqQ" + i),
    answer: t("seo.tarot.faqA" + i),
  })), [t])

  const relatedServices = useMemo(() => [1,2,3,4].map(i => ({
    icon: ["⭐","📊","💕","☯️"][i - 1],
    title: t("seo.tarot.r" + i + "Title"),
    href: ["/astrology","/bazi","/astrology/zodiac-compatibility","/five-elements"][i - 1],
    desc: t("seo.tarot.r" + i + "Desc"),
  })), [t])

  const features = [
    { icon: "🃏", title: t("seo.tarot.f1Title"), desc: t("seo.tarot.f1Desc") },
    { icon: "🔮", title: t("seo.tarot.f2Title"), desc: t("seo.tarot.f2Desc") },
    { icon: "✨", title: t("seo.tarot.f3Title"), desc: t("seo.tarot.f3Desc") },
    { icon: "💫", title: t("seo.tarot.f4Title"), desc: t("seo.tarot.f4Desc") },
    { icon: "🎯", title: t("seo.tarot.f5Title"), desc: t("seo.tarot.f5Desc") },
    { icon: "🧘", title: t("seo.tarot.f6Title"), desc: t("seo.tarot.f6Desc") },
  ]

  const spreads = [
    { name: t("seo.tarot.sp1Name"), cards: 1, desc: t("seo.tarot.sp1Desc") },
    { name: t("seo.tarot.sp2Name"), cards: 3, desc: t("seo.tarot.sp2Desc") },
    { name: t("seo.tarot.sp3Name"), cards: 5, desc: t("seo.tarot.sp3Desc") },
    { name: t("seo.tarot.sp4Name"), cards: 10, desc: t("seo.tarot.sp4Desc") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.tarot.breadcrumb") }]} currentPath={`/${locale}/tarot`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.tarot.title"),
            "description": t("seo.tarot.desc"),
            "url": "https://www.khanfate.com/tarot",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.tarot.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">🃏</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.tarot.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.tarot.desc")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {features.map((f) => (
              <div key={f.title} className="card-glow p-5 hover:border-gold/30 transition-all duration-300">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-serif font-bold text-gold mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.tarot.spreadsTitle")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {spreads.map((s) => (
                <div key={s.name} className="flex items-center gap-4 p-4 bg-[#030918] rounded-xl border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold text-lg">
                    {s.cards}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{s.name}</h3>
                    <p className="text-white/40 text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.tarot.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.tarot.p1")}</p>
              <p>{t("seo.tarot.p2")}</p>
              <p>{t("seo.tarot.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <SEOFaq
          title={t("seo.tarot.faqTitle")}
          items={faqItems}
        />

        <RelatedServices
          heading={t("seo.tarot.relatedTitle")}
          services={relatedServices}
        />

        <ScrollReveal delay={0.4}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.tarot.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.tarot.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.tarot.ctaBtn")} <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
