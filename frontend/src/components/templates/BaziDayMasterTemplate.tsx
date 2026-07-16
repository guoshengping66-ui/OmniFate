"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { useLanguage } from "@/contexts/LanguageContext"
import type { BaziDayMaster } from "@/data/programmatic/bazi/dayMasters"
import { BaziDayMasters } from "@/data/programmatic/bazi/dayMasters"
import { safeJsonLd } from "@/utils/safeJsonLd"

interface BaziDayMasterTemplateProps {
  data: BaziDayMaster
  locale: string
}

export function BaziDayMasterTemplate({ data, locale }: BaziDayMasterTemplateProps) {
  const { t, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const content = {
    title: isZh ? data.name_zh : data.name_en,
    personality: isZh ? data.personality_zh : data.personality_en,
    strengths: isZh ? data.strengths_zh : data.strengths_en,
    weaknesses: isZh ? data.weaknesses_zh : data.weaknesses_en,
    career: isZh ? data.career_zh : data.career_en,
    relationships: isZh ? data.relationships_zh : data.relationships_en,
    health: isZh ? data.health_zh : data.health_en,
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  const elementLabels: Record<string, { zh: string; en: string }> = {
    wood: { zh: "木", en: "Wood" },
    fire: { zh: "火", en: "Fire" },
    earth: { zh: "土", en: "Earth" },
    metal: { zh: "金", en: "Metal" },
    water: { zh: "水", en: "Water" },
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto" aria-label={`${isZh ? "五行" : "Five elements"}: ${Object.values(elementLabels).map(label => isZh ? label.zh : label.en).join(", ")}`}>
        <Breadcrumbs
          items={[
            { label: t("nav.bazi") || "Bazi", href: localeHref("/bazi") },
          ]}
          currentPath={`/${locale}/bazi/day-master/${data.id}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": content.title,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "author": { "@type": "Organization", "name": "Destiny Engine" },
            "publisher": { "@type": "Organization", "name": "Destiny Engine", "url": "https://www.khanfate.com" },
            "url": `https://www.khanfate.com/${locale}/bazi/day-master/${data.id}`,
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-6xl mb-4">{data.emoji}</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {content.title}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {content.personality}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "✨ 优势" : "✨ Strengths"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.strengths}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "⚠️ 劣势" : "⚠️ Weaknesses"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.weaknesses}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💼 事业运势" : "💼 Career"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.career}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💕 感情运势" : "💕 Relationships"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.relationships}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "🏥 健康运势" : "🏥 Health"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.health}</p>
          </div>
        </ScrollReveal>

        <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "探索其他日主" : "Explore Other Day Masters"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.related_masters.map(master => {
                const relatedMaster = BaziDayMasters.find(m => m.id === master)
                return (
                  <Link
                    key={master}
                    href={localeHref(`/bazi/day-master/${master}`)}
                    className="card-glow p-3 text-center hover:border-gold/30 transition-all group"
                  >
                    <div className="text-2xl mb-1">{relatedMaster?.emoji}</div>
                    <div className="text-xs text-white/60 group-hover:text-gold transition-colors">
                      {isZh ? relatedMaster?.name_zh : relatedMaster?.name_en}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.45}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden mt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">🔮</div>
              <h2 className="font-serif text-2xl text-gold mb-4">
                {isZh ? "获取你的完整八字分析" : "Get Your Complete Bazi Reading"}
              </h2>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {isZh ? "开始分析" : "Start Reading"} 🔮
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
