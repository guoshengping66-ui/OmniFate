import { notFound } from "next/navigation"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { ZodiacSigns } from "@/data/programmatic/zodiac/signs"
import { useLanguage } from "@/contexts/LanguageContext"

const TOPICS = ["love", "career", "health"] as const
type Topic = (typeof TOPICS)[number]

function safeJsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, '\u003c').replace(/>/g, '\u003e').replace(/&/g, '\u0026')
}

interface PageProps {
  params: Promise<{ locale: string; sign: string; topic: Topic }>
}

export async function generateStaticParams() {
  const params: Array<{ sign: string; topic: string }> = []
  for (const sign of ZodiacSigns) {
    for (const topic of TOPICS) {
      params.push({ sign: sign.id, topic })
    }
  }
  return params
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, sign, topic } = await params
  const data = ZodiacSigns.find(s => s.id === sign)
  if (!data || !TOPICS.includes(topic)) return {}

  const isZh = locale === "zh"
  const topicLabels: Record<Topic, { en: string; zh: string }> = {
    love: { en: "Love & Relationships", zh: "爱情与人际关系" },
    career: { en: "Career & Finance", zh: "事业与财富" },
    health: { en: "Health & Wellness", zh: "健康与养生" },
  }
  const label = topicLabels[topic]

  return {
    title: isZh ? `${data.name_zh}${label.zh}` : `${data.name_en} ${label.en}`,
    description: isZh ? data.meta_description_zh : data.meta_description_en,
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/zodiac/${sign}/${topic}`,
      languages: {
        en: `https://www.khanfate.com/en/zodiac/${sign}/${topic}`,
        zh: `https://www.khanfate.com/zh/zodiac/${sign}/${topic}`,
        "x-default": `https://www.khanfate.com/en/zodiac/${sign}/${topic}`,
      },
    },
  }
}

export default async function ZodiacTopicPage({ params }: PageProps) {
  const { locale, sign, topic } = await params
  const data = ZodiacSigns.find(s => s.id === sign)
  if (!data || !TOPICS.includes(topic)) notFound()

  const isZh = locale === "zh"

  const topicContent: Record<Topic, { title_en: string; title_zh: string; content_en: string; content_zh: string; icon: string }> = {
    love: {
      title_en: `${data.name_en} Love & Relationships`,
      title_zh: `${data.name_zh}爱情与人际关系`,
      content_en: data.love_traits_en,
      content_zh: data.love_traits_zh,
      icon: "💕",
    },
    career: {
      title_en: `${data.name_en} Career & Finance`,
      title_zh: `${data.name_zh}事业与财富`,
      content_en: data.career_traits_en,
      content_zh: data.career_traits_zh,
      icon: "💼",
    },
    health: {
      title_en: `${data.name_en} Health & Wellness`,
      title_zh: `${data.name_zh}健康与养生`,
      content_en: data.health_traits_en,
      content_zh: data.health_traits_zh,
      icon: "🏥",
    },
  }

  const tc = topicContent[topic]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: isZh ? "星座" : "Zodiac", href: `/zodiac` },
            { label: isZh ? data.name_zh : data.name_en, href: `/zodiac/${data.id}` },
            { label: isZh ? tc.title_zh : tc.title_en },
          ]}
          currentPath={`/${locale}/zodiac/${sign}/${topic}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isZh ? tc.title_zh : tc.title_en,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "url": `https://www.khanfate.com/${locale}/zodiac/${sign}/${topic}`,
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">{tc.icon}</div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              {isZh ? tc.title_zh : tc.title_en}
            </h1>
            <p className="text-white/40 text-sm max-w-2xl mx-auto">
              {isZh ? data.meta_description_zh : data.meta_description_en}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
              {isZh ? tc.content_zh : tc.content_en}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap gap-3 justify-center">
            {TOPICS.filter(t => t !== topic).map(t => (
              <Link
                key={t}
                href={`/zodiac/${data.id}/${t}`}
                className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/50 text-sm hover:border-gold/30 hover:text-gold transition-all"
              >
                {t === "love" ? (isZh ? "爱情" : "Love") : t === "career" ? (isZh ? "事业" : "Career") : (isZh ? "健康" : "Health")}
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
