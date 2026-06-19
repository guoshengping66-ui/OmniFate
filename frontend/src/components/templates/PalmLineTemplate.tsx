"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { safeJsonLd } from "@/utils/safeJsonLd"
import { useLanguage } from "@/contexts/LanguageContext"
import type { PalmLine } from "@/data/programmatic/palm/lines"
import { PalmLines } from "@/data/programmatic/palm/lines"

interface PalmLineTemplateProps {
  data: PalmLine
  locale: string
}

export function PalmLineTemplate({ data, locale }: PalmLineTemplateProps) {
  const { t, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const content = {
    title: isZh ? data.name_zh : data.name_en,
    overview: isZh ? data.overview_zh : data.overview_en,
    location: isZh ? data.location_zh : data.location_en,
    interpretations: {
      long: isZh ? data.interpretations.long_zh : data.interpretations.long_en,
      short: isZh ? data.interpretations.short_zh : data.interpretations.short_en,
      curved: isZh ? data.interpretations.curved_zh : data.interpretations.curved_en,
      straight: isZh ? data.interpretations.straight_zh : data.interpretations.straight_en,
      forked: isZh ? data.interpretations.forked_zh : data.interpretations.forked_en,
      chained: isZh ? data.interpretations.chained_zh : data.interpretations.chained_en,
    },
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: t("nav.divination") || "Divination", href: localeHref("/palm-reading") },
          ]}
          currentPath={`/${locale}/palm-reading/lines/${data.id}`}
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": content.title,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "author": { "@type": "Organization", "name": "Destiny Engine" },
            "publisher": { "@type": "Organization", "name": "Destiny Engine", "url": "https://www.khanfate.com" },
            "url": `https://www.khanfate.com/${locale}/palm-reading/lines/${data.id}`,
          })}}
        />

        {/* Hero Section */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-6xl mb-4">{data.emoji}</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {content.title}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {content.overview}
            </p>
          </div>
        </ScrollReveal>

        {/* Location */}
        <ScrollReveal delay={0.1}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "📍 位置" : "📍 Location"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.location}</p>
          </div>
        </ScrollReveal>

        {/* Interpretations */}
        {Object.entries(content.interpretations).map(([key, value], index) => (
          <ScrollReveal key={key} delay={0.15 + index * 0.05}>
            <div className="card-glass p-8 md:p-10 mb-8">
              <h2 className="font-serif text-2xl text-gold mb-6 capitalize">
                {isZh ? {
                  long: "长线解读",
                  short: "短线解读",
                  curved: "弯曲解读",
                  straight: "直线解读",
                  forked: "分叉解读",
                  chained: "锁链状解读"
                }[key] : `${key} Line Interpretation`}
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">{value}</p>
            </div>
          </ScrollReveal>
        ))}

        {/* FAQ Section */}
        <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />

        {/* Related Lines */}
        <ScrollReveal delay={0.5}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "探索其他掌纹" : "Explore Other Palm Lines"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.related_lines.map(line => {
                const relatedLine = PalmLines.find(l => l.id === line)
                return (
                  <Link
                    key={line}
                    href={localeHref(`/palm-reading/lines/${line}`)}
                    className="card-glow p-3 text-center hover:border-gold/30 transition-all group"
                  >
                    <div className="text-2xl mb-1">{relatedLine?.emoji}</div>
                    <div className="text-xs text-white/60 group-hover:text-gold transition-colors">
                      {isZh ? relatedLine?.name_zh : relatedLine?.name_en}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.55}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden mt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">🖐️</div>
              <h2 className="font-serif text-2xl text-gold mb-4">
                {isZh ? "获取你的完整手相分析" : "Get Your Complete Palm Reading"}
              </h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {isZh
                  ? "获取 AI 生成的详细手相分析，解读你掌纹中的命运密码"
                  : "Get an AI-generated detailed palm reading to decode the destiny in your palm lines"}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {isZh ? "开始分析" : "Start Reading"} 🖐️
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
