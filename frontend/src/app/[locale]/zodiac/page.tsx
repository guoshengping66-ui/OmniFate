"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"
import { ZodiacSigns } from "@/data/programmatic/zodiac/signs"

function safeJsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}

const ELEMENTS = [
  { key: "fire", emoji: "🔥", zh: "火象星座", en: "Fire Signs" },
  { key: "earth", emoji: "🌍", zh: "土象星座", en: "Earth Signs" },
  { key: "air", emoji: "💨", zh: "风象星座", en: "Air Signs" },
  { key: "water", emoji: "💧", zh: "水象星座", en: "Water Signs" },
]

export default function ZodiacHubPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": isZh ? "十二星座详解" : "Zodiac Signs Guide",
    "description": isZh ? "探索十二星座的性格、爱情、事业和健康特质" : "Explore personality, love, career and health traits of all 12 zodiac signs",
    "url": `https://www.khanfate.com/${locale}/zodiac`,
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
        <Breadcrumbs items={[{ label: t("nav.zodiac") || (isZh ? "星座" : "Zodiac") }]} currentPath={`/${locale}/zodiac`} />

        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="text-5xl mb-4">⭐</div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              {isZh ? "十二星座详解" : "Zodiac Signs Guide"}
            </h1>
            <p className="text-white/40 text-sm max-w-2xl mx-auto">
              {isZh ? "探索每个星座的独特性格、爱情配对、事业优势和健康指南" : "Discover each sign's unique personality, love compatibility, career strengths and health insights"}
            </p>
          </div>
        </ScrollReveal>

        {ELEMENTS.map((el, elIdx) => {
          const signs = ZodiacSigns.filter(s => s.element === el.key)
          return (
            <ScrollReveal key={el.key} delay={0.05 * (elIdx + 1)}>
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{el.emoji}</span>
                  <h2 className="font-serif text-xl text-gold">{isZh ? el.zh : el.en}</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {signs.map(sign => (
                    <Link
                      key={sign.id}
                      href={localeHref(`/zodiac/${sign.id}`)}
                      className="card-glow p-4 hover:border-gold/30 transition-all duration-300 group"
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{sign.symbol}</div>
                      <h3 className="font-serif font-bold text-white text-sm group-hover:text-gold transition-colors">
                        {isZh ? sign.name_zh : sign.name_en}
                      </h3>
                      <p className="text-white/30 text-xs mt-1">{sign.date_range}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </div>
  )
}
