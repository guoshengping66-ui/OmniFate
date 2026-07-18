import { notFound } from "next/navigation"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { FiveElementCompatibilities } from "@/data/programmatic/five-elements/compatibility"
import { FiveElements } from "@/data/programmatic/five-elements/elements"
import { safeJsonLd } from "@/utils/safeJsonLd"

const ELEMENT_EMOJI: Record<string, string> = {
  wood: "🌳", fire: "🔥", earth: "🏔️", metal: "⚔️", water: "💧",
}

interface PageProps {
  params: Promise<{ locale: string; element: string; b: string }>
}

export async function generateStaticParams() {
  return FiveElementCompatibilities.map(c => ({ element: c.element_a, b: c.element_b }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, element, b } = await params
  const pairKey = [element, b].sort().join("-")
  const data = FiveElementCompatibilities.find(c => c.id === pairKey)
  if (!data) return {}

  const isZh = locale === "zh"

  return {
    title: isZh ? data.title_zh : data.title_en,
    description: isZh ? data.meta_description_zh : data.meta_description_en,
    keywords: isZh ? data.keywords_zh : data.keywords_en,
    openGraph: {
      title: isZh ? data.title_zh : data.title_en,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
      type: "article",
      url: `https://www.khanfate.com/${locale}/five-elements/${element}/${b}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | Inner Atlas AI` : `${data.title_en} | Inner Atlas AI`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/five-elements/${element}/with/${b}`,
      languages: {
        en: `https://www.khanfate.com/en/five-elements/${element}/with/${b}`,
        zh: `https://www.khanfate.com/zh/five-elements/${element}/with/${b}`,
        "x-default": `https://www.khanfate.com/en/five-elements/${element}/with/${b}`,
      },
    },
  }
}

export default async function FiveElementCompatibilityPage({ params }: PageProps) {
  const { locale, element, b } = await params
  const pairKey = [element, b].sort().join("-")
  const data = FiveElementCompatibilities.find(c => c.id === pairKey)
  if (!data) notFound()

  const isZh = locale === "zh"
  const elA = FiveElements.find(e => e.id === data.element_a)
  const elB = FiveElements.find(e => e.id === data.element_b)

  const getRelation = (score: number) => {
    if (score >= 80) return isZh ? "大吉" : "Excellent"
    if (score >= 60) return isZh ? "吉" : "Good"
    if (score >= 40) return isZh ? "平" : "Neutral"
    return isZh ? "凶" : "Challenging"
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: isZh ? "五行" : "Five Elements", href: "/five-elements" },
            { label: isZh ? "配对" : "Compatibility" },
          ]}
          currentPath={`/${locale}/five-elements/${element}/with/${b}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isZh ? data.title_zh : data.title_en,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "url": `https://www.khanfate.com/${locale}/five-elements/${element}/with/${b}`,
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-5xl">{ELEMENT_EMOJI[data.element_a]}</span>
              <span className="text-white/30 text-2xl font-serif">+</span>
              <span className="text-5xl">{ELEMENT_EMOJI[data.element_b]}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
              {isZh ? `${elA?.name_zh || element}与${elB?.name_zh || b} Compatibility` : `${elA?.name_en || element} and ${elB?.name_en || b} Compatibility`}
            </h1>
            <p className="text-white/40 text-sm">{isZh ? "五行 compatibility 分析" : "Five Elements Compatibility Analysis"}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-glass p-8 md:p-10 mb-8 text-center">
            <div className="text-6xl font-serif font-bold text-gold mb-2">{data.score}</div>
            <div className="text-white/50 text-sm mb-1">{isZh ? "综合 compatibility 评分" : "Overall Compatibility Score"}</div>
            <div className={`text-lg font-medium ${data.score >= 60 ? "text-gold" : data.score >= 40 ? "text-white/60" : "text-red-400"}`}>
              {getRelation(data.score)}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "五行关系" : "Element Relationship"}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{isZh ? data.overview_zh : data.overview_en}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="card-glow p-6">
              <div className="text-3xl mb-3">💕</div>
              <h3 className="font-serif font-bold text-gold mb-2">{isZh ? "爱情" : "Love"}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{isZh ? data.love_zh : data.love_en}</p>
            </div>
            <div className="card-glow p-6">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="font-serif font-bold text-gold mb-2">{isZh ? "事业" : "Career"}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{isZh ? data.career_zh : data.career_en}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "建议" : "Tips"}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{isZh ? data.tips_zh : data.tips_en}</p>
          </div>
        </ScrollReveal>

        <SEOFaq
          title={isZh ? "常见问题" : "Frequently Asked Questions"}
          items={isZh ? data.faq_zh : data.faq_en}
        />
      </div>
    </div>
  )
}
