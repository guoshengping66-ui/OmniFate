"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
function safeJsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}
import { useLanguage } from "@/contexts/LanguageContext"
import type { BaziTenGod } from "@/data/programmatic/bazi/tenGods"
import { BaziTenGods } from "@/data/programmatic/bazi/tenGods"

interface BaziTenGodTemplateProps {
  data: BaziTenGod
  locale: string
}

export function BaziTenGodTemplate({ data, locale }: BaziTenGodTemplateProps) {
  const { t, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const content = {
    title: isZh ? data.name_zh : data.name_en,
    overview: isZh ? data.overview_zh : data.overview_en,
    personality: isZh ? data.personality_zh : data.personality_en,
    strengths: isZh ? data.strengths_zh : data.strengths_en,
    weaknesses: isZh ? data.weaknesses_zh : data.weaknesses_en,
    career: isZh ? data.career_zh : data.career_en,
    relationships: isZh ? data.relationships_zh : data.relationships_en,
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: t("nav.bazi") || "Bazi", href: localeHref("/bazi") },
          ]}
          currentPath={`/${locale}/bazi/ten-gods/${data.id}`}
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
            "url": `https://www.khanfate.com/${locale}/bazi/ten-gods/${data.id}`,
          })}}
        />

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

        <ScrollReveal delay={0.1}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "🧬 性格特征" : "🧬 Personality"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.personality}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "✨ 优势" : "✨ Strengths"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.strengths}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "⚠️ 劣势" : "⚠️ Weaknesses"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.weaknesses}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💼 事业运势" : "💼 Career"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.career}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💕 感情运势" : "💕 Relationships"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.relationships}</p>
          </div>
        </ScrollReveal>

        <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "探索其他十神" : "Explore Other Ten Gods"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.related_gods.map(god => {
                const relatedGod = BaziTenGods.find(g => g.id === god)
                return (
                  <Link
                    key={god}
                    href={localeHref(`/bazi/ten-gods/${god}`)}
                    className="card-glow p-3 text-center hover:border-gold/30 transition-all group"
                  >
                    <div className="text-2xl mb-1">{relatedGod?.emoji}</div>
                    <div className="text-xs text-white/60 group-hover:text-gold transition-colors">
                      {isZh ? relatedGod?.name_zh : relatedGod?.name_en}
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
