import { notFound } from "next/navigation"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { BaziDayMasters } from "@/data/programmatic/bazi/dayMasters"
import { safeJsonLd } from "@/utils/safeJsonLd"

const ELEMENT_SCORES: Record<string, Record<string, number>> = {
  wood: { wood: 60, fire: 90, earth: 30, metal: 20, water: 80 },
  fire: { wood: 80, fire: 60, earth: 90, metal: 30, water: 20 },
  earth: { wood: 30, fire: 80, earth: 60, metal: 90, water: 30 },
  metal: { wood: 20, fire: 30, earth: 80, metal: 60, water: 90 },
  water: { wood: 90, fire: 20, earth: 30, metal: 80, water: 60 },
}

const ELEMENT_DESC: Record<string, { en: string; zh: string }> = {
  wood: { en: "Wood", zh: "木" },
  fire: { en: "Fire", zh: "火" },
  earth: { en: "Earth", zh: "土" },
  metal: { en: "Metal", zh: "金" },
  water: { en: "Water", zh: "水" },
}

interface PageProps {
  params: Promise<{ locale: string; a: string; b: string }>
}

export async function generateStaticParams() {
  const params: Array<{ a: string; b: string }> = []
  for (const a of BaziDayMasters) {
    for (const b of BaziDayMasters) {
      if (a.id !== b.id) params.push({ a: a.id, b: b.id })
    }
  }
  return params
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, a, b } = await params
  const dataA = BaziDayMasters.find(d => d.id === a)
  const dataB = BaziDayMasters.find(d => d.id === b)
  if (!dataA || !dataB) return {}

  const isZh = locale === "zh"
  const nameA = isZh ? dataA.name_zh : dataA.name_en
  const nameB = isZh ? dataB.name_zh : dataB.name_en

  return {
    title: isZh ? `${nameA}与${nameB} compatibility` : `${nameA} and ${nameB} Compatibility`,
    description: isZh
      ? `分析${nameA}与${nameB}的八字配对 compatibility，了解五行相生相克关系`
      : `Analyze ${nameA} and ${nameB} Bazi compatibility. Understand the Five Element interactions.`,
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/bazi/compatibility/${a}/${b}`,
      languages: {
        en: `https://www.khanfate.com/en/bazi/compatibility/${a}/${b}`,
        zh: `https://www.khanfate.com/zh/bazi/compatibility/${a}/${b}`,
        "x-default": `https://www.khanfate.com/en/bazi/compatibility/${a}/${b}`,
      },
    },
  }
}

export default async function BaziCompatibilityPage({ params }: PageProps) {
  const { locale, a, b } = await params
  const dataA = BaziDayMasters.find(d => d.id === a)
  const dataB = BaziDayMasters.find(d => d.id === b)
  if (!dataA || !dataB) notFound()

  const isZh = locale === "zh"
  const score = ELEMENT_SCORES[dataA.element]?.[dataB.element] ?? 50

  const getRelation = (score: number) => {
    if (score >= 80) return isZh ? "大吉" : "Excellent"
    if (score >= 60) return isZh ? "吉" : "Good"
    if (score >= 40) return isZh ? "平" : "Neutral"
    return isZh ? "凶" : "Challenging"
  }

  const getRelationDesc = (elA: string, elB: string, score: number) => {
    const aName = ELEMENT_DESC[elA]
    const bName = ELEMENT_DESC[elB]
    if (score >= 80) {
      return isZh
        ? `${aName.zh}生${bName.zh}，两者 compatibility 极佳。${aName.zh}为${bName.zh}提供滋养和支持，形成和谐的互动关系。`
        : `${aName.en} nourishes ${bName.en}, creating excellent compatibility. ${aName.en} provides support and nurture to ${bName.en}.`
    }
    if (score >= 60) {
      return isZh
        ? `${aName.zh}与${bName.zh} compatibility 良好。两者能够相互理解，在大多数方面协调一致。`
        : `${aName.en} and ${bName.en} have good compatibility. They can understand each other and协调 in most areas.`
    }
    if (score >= 40) {
      return isZh
        ? `${aName.zh}与${bName.zh} compatibility 一般。需要更多沟通和理解来维持和谐关系。`
        : `${aName.en} and ${bName.en} have neutral compatibility. More communication and understanding needed.`
    }
    return isZh
      ? `${aName.zh}克${bName.zh}，compatibility 较低。两者需要额外努力来平衡五行能量。`
      : `${aName.en} clashes with ${bName.en}, presenting challenges. Extra effort needed to balance elemental energies.`
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Bazi", href: "/bazi" },
            { label: isZh ? "配对" : "Compatibility" },
          ]}
          currentPath={`/${locale}/bazi/compatibility/${a}/${b}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isZh ? `${dataA.name_zh}与${dataB.name_zh}配对分析` : `${dataA.name_en} and ${dataB.name_en} Compatibility`,
            "url": `https://www.khanfate.com/${locale}/bazi/compatibility/${a}/${b}`,
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-5xl">{dataA.emoji}</span>
              <span className="text-white/30 text-2xl font-serif">+</span>
              <span className="text-5xl">{dataB.emoji}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
              {isZh ? `${dataA.name_zh} + ${dataB.name_zh}` : `${dataA.name_en} + ${dataB.name_en}`}
            </h1>
            <p className="text-white/40 text-sm">
              {isZh ? "八字日主配对分析" : "Bazi Day Master Compatibility"}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-glass p-8 md:p-10 mb-8 text-center">
            <div className="text-6xl font-serif font-bold text-gold mb-2">{score}</div>
            <div className="text-white/50 text-sm mb-1">{isZh ? "综合 compatibility 评分" : "Overall Compatibility Score"}</div>
            <div className={`text-lg font-medium ${score >= 60 ? "text-gold" : score >= 40 ? "text-white/60" : "text-red-400"}`}>
              {getRelation(score)}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "五行分析" : "Five Element Analysis"}</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              {getRelationDesc(dataA.element, dataB.element, score)}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">{dataA.emoji}</div>
                <div className="text-white/70 text-sm">{isZh ? dataA.name_zh : dataA.name_en}</div>
                <div className="text-gold/60 text-xs">{ELEMENT_DESC[dataA.element][isZh ? "zh" : "en"]}</div>
              </div>
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">{dataB.emoji}</div>
                <div className="text-white/70 text-sm">{isZh ? dataB.name_zh : dataB.name_en}</div>
                <div className="text-gold/60 text-xs">{ELEMENT_DESC[dataB.element][isZh ? "zh" : "en"]}</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
