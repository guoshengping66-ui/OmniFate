"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { useLanguage } from "@/contexts/LanguageContext"
import type { FaceFeature } from "@/data/programmatic/face/features"
import { FaceFeatures } from "@/data/programmatic/face/features"
import { safeJsonLd } from "@/utils/safeJsonLd"

interface FaceFeatureTemplateProps {
  data: FaceFeature
  locale: string
}

export function FaceFeatureTemplate({ data, locale }: FaceFeatureTemplateProps) {
  const { t, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const content = {
    title: isZh ? data.name_zh : data.name_en,
    overview: isZh ? data.overview_zh : data.overview_en,
    location: isZh ? data.location_zh : data.location_en,
    interpretations: {
      large: isZh ? data.interpretations.large_zh : data.interpretations.large_en,
      small: isZh ? data.interpretations.small_zh : data.interpretations.small_en,
      wide_set: isZh ? data.interpretations.wide_set_zh : data.interpretations.wide_set_en,
      close_set: isZh ? data.interpretations.close_set_zh : data.interpretations.close_set_en,
      upturned: isZh ? data.interpretations.upturned_zh : data.interpretations.upturned_en,
      downturned: isZh ? data.interpretations.downturned_zh : data.interpretations.downturned_en,
    },
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  const interpretationLabels: Record<string, { zh: string; en: string }> = {
    large: { zh: "大", en: "Large" },
    small: { zh: "小", en: "Small" },
    wide_set: { zh: "宽间距", en: "Wide-set" },
    close_set: { zh: "窄间距", en: "Close-set" },
    upturned: { zh: "上扬", en: "Upturned" },
    downturned: { zh: "下垂", en: "Downturned" },
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: t("nav.divination") || "Divination", href: localeHref("/face-reading") },
          ]}
          currentPath={`/${locale}/face-reading/features/${data.id}`}
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
            "url": `https://www.khanfate.com/${locale}/face-reading/features/${data.id}`,
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-6xl mb-4">{data.emoji}</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {content.title}
            </h1>
            <p className="text-parchment-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {content.overview}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "📍 位置" : "📍 Location"}
            </h2>
            <p className="text-parchment-400 text-sm leading-relaxed">{content.location}</p>
          </div>
        </ScrollReveal>

        {Object.entries(content.interpretations).map(([key, value], index) => (
          <ScrollReveal key={key} delay={0.15 + index * 0.05}>
            <div className="card-solid p-8 md:p-10 mb-8">
              <h2 className="font-serif text-2xl text-gold mb-6">
                {isZh ? interpretationLabels[key]?.zh : interpretationLabels[key]?.en}
              </h2>
              <p className="text-parchment-400 text-sm leading-relaxed">{value}</p>
            </div>
          </ScrollReveal>
        ))}

        <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />

        <ScrollReveal delay={0.5}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "探索其他五官" : "Explore Other Features"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.related_features.map(feature => {
                const relatedFeature = FaceFeatures.find(f => f.id === feature)
                return (
                  <Link
                    key={feature}
                    href={localeHref(`/face-reading/features/${feature}`)}
                    className="card-interactive p-3 text-center hover:border-gold/30 transition-all group"
                  >
                    <div className="text-2xl mb-1">{relatedFeature?.emoji}</div>
                    <div className="text-xs text-parchment-400 group-hover:text-gold transition-colors">
                      {isZh ? relatedFeature?.name_zh : relatedFeature?.name_en}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.55}>
          <div className="text-center card-solid-elevated p-10 relative overflow-hidden mt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">👤</div>
              <h2 className="font-serif text-2xl text-gold mb-4">
                {isZh ? "获取你的完整面相分析" : "Get Your Complete Face Reading"}
              </h2>
              <Link
                href={localeHref("/reading/new")}
                className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {isZh ? "开始分析" : "Start Reading"} 👤
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
