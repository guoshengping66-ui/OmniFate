"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useLanguage } from "@/contexts/LanguageContext"
import type { ZodiacSign } from "@/data/programmatic/zodiac/signs"
import { ZodiacSigns } from "@/data/programmatic/zodiac/signs"
import { safeJsonLd } from "@/utils/safeJsonLd"

interface ZodiacPageTemplateProps {
  data: ZodiacSign
  locale: string
}

export function ZodiacPageTemplate({ data, locale }: ZodiacPageTemplateProps) {
  const { t, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const content = {
    title: isZh ? data.name_zh : data.name_en,
    personality: isZh ? data.personality_overview_zh : data.personality_overview_en,
    love: isZh ? data.love_traits_zh : data.love_traits_en,
    career: isZh ? data.career_traits_zh : data.career_traits_en,
    health: isZh ? data.health_traits_zh : data.health_traits_en,
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  const relatedServices = data.related_signs.map(sign => {
    const signData = ZodiacSigns.find(s => s.id === sign)
    return {
      icon: signData?.symbol || "⭐",
      title: isZh ? signData?.name_zh || sign : signData?.name_en || sign,
      href: localeHref(`/zodiac/${sign}`),
      desc: isZh ? "查看星座详情" : "View sign details",
    }
  })

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: t("nav.astrology") || "Astrology", href: localeHref("/astrology") },
            { label: t("nav.zodiac") || "Zodiac", href: localeHref("/zodiac") },
          ]}
          currentPath={`/${locale}/zodiac/${data.id}`}
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": content.title,
            "description": content.personality,
            "author": { "@type": "Organization", "name": "Inner Atlas AI" },
            "publisher": { "@type": "Organization", "name": "Inner Atlas AI", "logo": { "@type": "ImageObject", "url": "/logo.png" } },
            "about": { "@type": "Thing", "name": data.name_en, "description": isZh ? `Symbol: ${data.symbol}, Element: ${data.element}` : `Symbol: ${data.symbol}, Element: ${data.element}` },
            "alternateName": isZh ? data.name_en : data.name_zh,
            "url": `https://www.khanfate.com/${locale}/zodiac/${data.id}`,
          })}}
        />

        {/* Hero Section */}
        <ScrollReveal>
          <div className="text-center mb-10 sm:mb-16">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">{data.symbol}</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-3 sm:mb-4 break-words">
              {content.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/40 mb-3 sm:mb-4">
              <span>{isZh ? "元素" : "Element"}: {data.element}</span>
              <span className="hidden sm:inline">•</span>
              <span>{isZh ? "日期" : "Dates"}: {data.date_range}</span>
              <span className="hidden sm:inline">•</span>
              <span>{isZh ? "守护星" : "Ruling Planet"}: {data.ruling_planet}</span>
            </div>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {content.personality}
            </p>
          </div>
        </ScrollReveal>

        {/* Content Sections */}
        <ScrollReveal delay={0.1}>
          <div className="card-glass p-5 sm:p-8 md:p-10 mb-6 sm:mb-8">
            <h2 className="font-serif text-xl sm:text-2xl text-gold mb-4 sm:mb-6">
              {isZh ? "💕 爱情特质" : "💕 Love Traits"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed break-words">{content.love}</p>
            <div className="mt-4">
              <Link
                href={localeHref(`/zodiac/${data.id}/love`)}
                className="text-gold/60 text-xs hover:text-gold transition-colors"
              >
                {isZh ? "查看详细爱情分析 →" : "View detailed love analysis →"}
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass p-5 sm:p-8 md:p-10 mb-6 sm:mb-8">
            <h2 className="font-serif text-xl sm:text-2xl text-gold mb-4 sm:mb-6">
              {isZh ? "💼 事业特质" : "💼 Career Traits"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed break-words">{content.career}</p>
            <div className="mt-4">
              <Link
                href={localeHref(`/zodiac/${data.id}/career`)}
                className="text-gold/60 text-xs hover:text-gold transition-colors"
              >
                {isZh ? "查看详细事业分析 →" : "View detailed career analysis →"}
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-5 sm:p-8 md:p-10 mb-6 sm:mb-8">
            <h2 className="font-serif text-xl sm:text-2xl text-gold mb-4 sm:mb-6">
              {isZh ? "🏥 健康指南" : "🏥 Health Guide"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed break-words">{content.health}</p>
          </div>
        </ScrollReveal>

        {/* Compatibility Links */}
        <ScrollReveal delay={0.25}>
          <div className="card-glass p-5 sm:p-8 md:p-10 mb-6 sm:mb-8">
            <h2 className="font-serif text-xl sm:text-2xl text-gold mb-4 sm:mb-6">
              {isZh ? "💕 配对分析" : "💕 Compatibility"}
            </h2>
            <p className="text-white/40 text-xs sm:text-sm mb-3 sm:mb-4 break-words">
              {isZh
                ? `探索${content.title}与其他星座的配对分析`
                : `Explore ${content.title} compatibility with other signs`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {data.related_signs.map(sign => {
                const signData = ZodiacSigns.find(s => s.id === sign)
                return (
                  <Link
                    key={sign}
                    href={localeHref(`/zodiac/${data.id}/compatibility/${sign}`)}
                    className="card-glow p-2.5 sm:p-3 text-center hover:border-gold/30 transition-all group"
                  >
                    <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{signData?.symbol}</div>
                    <div className="text-[10px] sm:text-xs text-white/60 group-hover:text-gold transition-colors">
                      {isZh ? signData?.name_zh : signData?.name_en}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* FAQ Section */}
        <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />

        {/* Related Signs */}
        <RelatedServices
          heading={isZh ? "相关星座" : "Related Signs"}
          services={relatedServices}
        />

        {/* CTA */}
        <ScrollReveal delay={0.3}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden mt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">🔮</div>
              <h2 className="font-serif text-2xl text-gold mb-4">
                {isZh ? `了解你的完整${content.title}档案` : `Discover Your Full ${content.title} Profile`}
              </h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {isZh
                  ? "获取 AI 生成的详细占星分析，包含你的出生星盘解读"
                  : "Get an AI-generated detailed astrology reading with your birth chart interpretation"}
              </p>
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
