"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { useLanguage } from "@/contexts/LanguageContext"
import type { CompatibilityPair } from "@/data/programmatic/zodiac/compatibility"
import { ZodiacSigns } from "@/data/programmatic/zodiac/signs"
import { safeJsonLd } from "@/utils/safeJsonLd"

interface CompatibilityTemplateProps {
  data: CompatibilityPair
  locale: string
}

export function CompatibilityTemplate({ data, locale }: CompatibilityTemplateProps) {
  const { t, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const signA = ZodiacSigns.find(s => s.id === data.sign_a)
  const signB = ZodiacSigns.find(s => s.id === data.sign_b)

  const content = {
    title: isZh ? data.title_zh : data.title_en,
    overview: isZh ? data.overview_zh : data.overview_en,
    love: isZh ? data.love_analysis_zh : data.love_analysis_en,
    friendship: isZh ? data.friendship_analysis_zh : data.friendship_analysis_en,
    work: isZh ? data.work_analysis_zh : data.work_analysis_en,
    challenges: isZh ? data.challenges_zh : data.challenges_en,
    tips: isZh ? data.tips_zh : data.tips_en,
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: t("nav.astrology") || "Astrology", href: localeHref("/astrology") },
            { label: t("nav.zodiac") || "Zodiac", href: localeHref("/zodiac") },
            { label: isZh ? `${signA?.name_zh}配对` : `${signA?.name_en} Compatibility`, href: localeHref(`/zodiac/${data.sign_a}`) },
          ]}
          currentPath={`/${locale}/zodiac/${data.sign_a}/compatibility/${data.sign_b}`}
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": content.title,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "author": {
              "@type": "Organization",
              "name": "Destiny Engine"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Destiny Engine",
              "url": "https://www.khanfate.com"
            },
            "url": `https://www.khanfate.com/${locale}/zodiac/${data.sign_a}/compatibility/${data.sign_b}`,
          })}}
        />

        {/* Hero Section */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-6xl">{signA?.symbol}</span>
              <span className="text-4xl text-gold">❤️</span>
              <span className="text-6xl">{signB?.symbol}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {content.title}
            </h1>
            <p className="text-parchment-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {content.overview}
            </p>
          </div>
        </ScrollReveal>

        {/* Compatibility Scores */}
        <ScrollReveal delay={0.1}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6 text-center">
              {isZh ? "配对分数" : "Compatibility Scores"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(data.overall_score)}`}>
                  {data.overall_score}%
                </div>
                <div className="text-xs text-parchment-400 mt-1">{isZh ? "总体" : "Overall"}</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(data.love_score)}`}>
                  {data.love_score}%
                </div>
                <div className="text-xs text-parchment-400 mt-1">{isZh ? "爱情" : "Love"}</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(data.friendship_score)}`}>
                  {data.friendship_score}%
                </div>
                <div className="text-xs text-parchment-400 mt-1">{isZh ? "友谊" : "Friendship"}</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(data.work_score)}`}>
                  {data.work_score}%
                </div>
                <div className="text-xs text-parchment-400 mt-1">{isZh ? "工作" : "Work"}</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Love Analysis */}
        <ScrollReveal delay={0.15}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💕 爱情配对分析" : "💕 Love Compatibility"}
            </h2>
            <p className="text-parchment-400 text-sm leading-relaxed">{content.love}</p>
          </div>
        </ScrollReveal>

        {/* Friendship Analysis */}
        <ScrollReveal delay={0.2}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "👥 友谊配对分析" : "👥 Friendship Compatibility"}
            </h2>
            <p className="text-parchment-400 text-sm leading-relaxed">{content.friendship}</p>
          </div>
        </ScrollReveal>

        {/* Work Analysis */}
        <ScrollReveal delay={0.25}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💼 工作配对分析" : "💼 Work Compatibility"}
            </h2>
            <p className="text-parchment-400 text-sm leading-relaxed">{content.work}</p>
          </div>
        </ScrollReveal>

        {/* Challenges */}
        <ScrollReveal delay={0.3}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "⚠️ 挑战与注意事项" : "⚠️ Challenges"}
            </h2>
            <p className="text-parchment-400 text-sm leading-relaxed">{content.challenges}</p>
          </div>
        </ScrollReveal>

        {/* Tips */}
        <ScrollReveal delay={0.35}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💡 成功秘诀" : "💡 Tips for Success"}
            </h2>
            <p className="text-parchment-400 text-sm leading-relaxed">{content.tips}</p>
          </div>
        </ScrollReveal>

        {/* FAQ Section */}
        <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />

        {/* Related Compatibility */}
        <ScrollReveal delay={0.4}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "探索其他配对" : "Explore Other Compatibility"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {signA?.related_signs.map(sign => {
                const relatedSign = ZodiacSigns.find(s => s.id === sign)
                return (
                  <Link
                    key={sign}
                    href={localeHref(`/zodiac/${data.sign_a}/compatibility/${sign}`)}
                    className="card-interactive p-3 text-center hover:border-gold/30 transition-all group"
                  >
                    <div className="text-2xl mb-1">{relatedSign?.symbol}</div>
                    <div className="text-xs text-parchment-400 group-hover:text-gold transition-colors">
                      {isZh ? signA?.name_zh : signA?.name_en} + {isZh ? relatedSign?.name_zh : relatedSign?.name_en}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.45}>
          <div className="text-center card-solid-elevated p-10 relative overflow-hidden mt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">🔮</div>
              <h2 className="font-serif text-2xl text-gold mb-4">
                {isZh ? "获取你们的完整配对分析" : "Get Your Complete Pair Reading"}
              </h2>
              <p className="text-parchment-400 mb-8 max-w-md mx-auto">
                {isZh
                  ? "获取 AI 生成的详细配对分析，包含双方的星盘解读"
                  : "Get an AI-generated detailed pair reading with both charts interpreted"}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4"
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
