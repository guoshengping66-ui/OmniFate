import { notFound } from "next/navigation"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { ZodiacSigns } from "@/data/programmatic/zodiac/signs"
import { useLanguage } from "@/contexts/LanguageContext"
import { safeJsonLd } from "@/utils/safeJsonLd"

const TOPICS = ["love", "career", "health", "wealth", "study"] as const
type Topic = (typeof TOPICS)[number]

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
    wealth: { en: "Wealth & Money", zh: "财运与理财" },
    study: { en: "Study & Learning", zh: "学习与成长" },
  }
  const label = topicLabels[topic]
  const topicDesc = isZh
    ? `${data.name_zh}${label.zh}的AI分析 — 深度解读星座${label.zh}的配对、建议与趋势`
    : `AI analysis of ${data.name_en} ${label.en} — in-depth compatibility, advice and trends for this zodiac sign topic`

  return {
    title: isZh ? `${data.name_zh}${label.zh} — 星座AI专题分析` : `${data.name_en} ${label.en} — AI Zodiac Topic Analysis`,
    description: topicDesc,
    keywords: isZh ? [...data.keywords_zh, label.zh] : [...data.keywords_en, label.en],
    openGraph: {
      title: isZh ? `${data.name_zh}${label.zh} | 观我 Fate OS` : `${data.name_en} ${label.en} | Guanwo Fate OS`,
      description: topicDesc,
      url: `https://www.khanfate.com/${locale}/zodiac/${sign}/${topic}`,
      siteName: isZh ? "观我 Fate OS" : "Guanwo Fate OS",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.name_zh}${label.zh} | 观我` : `${data.name_en} ${label.en} | Guanwo`,
      description: topicDesc,
    },
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
    wealth: {
      title_en: `${data.name_en} Wealth & Money`,
      title_zh: `${data.name_zh}财运与理财`,
      content_en: `${data.name_en} individuals tend to ${data.element === "fire" ? "be bold investors who enjoy high-risk, high-reward opportunities" : data.element === "earth" ? "be conservative savers who prefer stable, long-term investments" : data.element === "air" ? "be strategic planners who diversify their portfolio wisely" : data.element === "water" ? "be intuitive investors who flow with market trends" : "be disciplined savers who build wealth gradually"}. Their ${data.element} nature gives them ${data.element === "fire" ? "courage to take financial risks" : data.element === "earth" ? "patience for steady growth" : data.element === "air" ? "analytical skills for smart decisions" : data.element === "water" ? "adaptability in changing markets" : "discipline for consistent saving"}.`,
      content_zh: `${data.name_zh}的人通常${data.element === "fire" ? "敢于冒险投资，喜欢高风险高回报的机会" : data.element === "earth" ? "保守储蓄，偏好稳定长期的投资" : data.element === "air" ? "善于策略规划，明智地分散投资组合" : data.element === "water" ? "直觉敏锐，能顺应市场趋势" : "纪律严明，稳步积累财富"}。他们的${data.element === "fire" ? "火" : data.element === "earth" ? "土" : data.element === "air" ? "风" : data.element === "water" ? "水" : "木"}属性赋予他们${data.element === "fire" ? "承担财务风险的勇气" : data.element === "earth" ? "稳健增长的耐心" : data.element === "air" ? "明智决策的分析能力" : data.element === "water" ? "应对市场变化的适应力" : "持续储蓄的纪律性"}。`,
      icon: "💰",
    },
    study: {
      title_en: `${data.name_en} Study & Learning`,
      title_zh: `${data.name_zh}学习与成长`,
      content_en: `${data.name_en} learners are ${data.quality === "cardinal" ? "self-starters who thrive on new challenges and Initiating projects" : data.quality === "fixed" ? "persistent students who master subjects through dedication and depth" : "versatile learners who adapt quickly to new information and environments"}. They excel in ${data.element === "fire" ? "competitive, hands-on learning environments" : data.element === "earth" ? "practical, application-based studies" : data.element === "air" ? "discussion-based, intellectual exploration" : data.element === "water" ? "intuitive, creative learning" : "structured, methodical study"}.`,
      content_zh: `${data.name_zh}的学习者是${data.quality === "cardinal" ? "自驱型学习者，在新挑战和启动项目中表现出色" : data.quality === "fixed" ? "坚持不懈的学生，通过专注和深度掌握学科" : "多才多艺的学习者，能快速适应新信息和环境"}。他们在${data.element === "fire" ? "竞争性、实践性的学习环境" : data.element === "earth" ? "实用型、应用型学习" : data.element === "air" ? "讨论式、知识性探索" : data.element === "water" ? "直觉型、创造性学习" : "结构化、系统性学习"}中表现突出。`,
      icon: "📚",
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
            "author": { "@type": "Organization", "name": "Guanwo Fate OS" },
            "publisher": { "@type": "Organization", "name": "Guanwo Fate OS", "logo": { "@type": "ImageObject", "url": "/logo.png" } },
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
                {t === "love" ? (isZh ? "爱情" : "Love") : t === "career" ? (isZh ? "事业" : "Career") : t === "health" ? (isZh ? "健康" : "Health") : t === "wealth" ? (isZh ? "财运" : "Wealth") : (isZh ? "学习" : "Study")}
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
