"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { useLanguage } from "@/contexts/LanguageContext"
import type { TarotCard } from "@/data/programmatic/tarot/cards"
import { TarotCards } from "@/data/programmatic/tarot/cards"
import { safeJsonLd } from "@/utils/safeJsonLd"

interface TarotCardTemplateProps {
  data: TarotCard
  locale: string
}

export function TarotCardTemplate({ data, locale }: TarotCardTemplateProps) {
  const { t, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const content = {
    title: isZh ? data.title_zh : data.title_en,
    upright: isZh ? data.upright_meaning_zh : data.upright_meaning_en,
    reversed: isZh ? data.reversed_meaning_zh : data.reversed_meaning_en,
    love: isZh ? data.love_meaning_zh : data.love_meaning_en,
    career: isZh ? data.career_meaning_zh : data.career_meaning_en,
    advice: isZh ? data.advice_zh : data.advice_en,
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  const relatedCards = data.related_cards
    .map(id => TarotCards.find(c => c.id === id))
    .filter(Boolean) as TarotCard[]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: t("nav.tarot"), href: localeHref("/tarot") },
            { label: isZh ? "塔罗牌" : "Cards" },
          ]}
          currentPath={`/${locale}/tarot/cards/${data.id}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": content.title,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "author": { "@type": "Organization", "name": "Guanwo Fate OS" },
            "publisher": { "@type": "Organization", "name": "Guanwo Fate OS", "logo": { "@type": "ImageObject", "url": "/logo.png" } },
            "url": `https://www.khanfate.com/${locale}/tarot/cards/${data.id}`,
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-6xl mb-4">{data.emoji}</div>
            <div className="text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-2">
              {data.arcana === "major" ? (isZh ? "大阿卡纳" : "Major Arcana") : (isZh ? "小阿卡纳" : "Minor Arcana")}
              {data.suit && ` — ${isZh ? { wands: "权杖", cups: "圣杯", swords: "宝剑", pentacles: "星币" }[data.suit] : data.suit.charAt(0).toUpperCase() + data.suit.slice(1)}`}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {isZh ? data.name_zh : data.name_en}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {content.title}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "正位含义" : "Upright Meaning"}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.upright}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "逆位含义" : "Reversed Meaning"}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.reversed}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="card-glow p-6">
              <div className="text-3xl mb-3">💕</div>
              <h3 className="font-serif font-bold text-gold mb-2">{isZh ? "爱情" : "Love"}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{content.love}</p>
            </div>
            <div className="card-glow p-6">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="font-serif font-bold text-gold mb-2">{isZh ? "事业" : "Career"}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{content.career}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "建议" : "Advice"}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.advice}</p>
          </div>
        </ScrollReveal>

        {content.faq.length > 0 && (
          <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />
        )}

        {relatedCards.length > 0 && (
          <ScrollReveal delay={0.3}>
            <div className="card-glass p-8 md:p-10 mb-8">
              <h2 className="font-serif text-2xl text-gold mb-6">{isZh ? "相关牌面" : "Related Cards"}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {relatedCards.map(card => (
                  <Link
                    key={card.id}
                    href={localeHref(`/tarot/cards/${card.id}`)}
                    className="flex items-center gap-3 p-3 bg-[#030918] rounded-xl border border-white/10 hover:border-gold/30 transition-all"
                  >
                    <span className="text-2xl">{card.emoji}</span>
                    <span className="text-white/70 text-sm">{isZh ? card.name_zh : card.name_en}</span>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}
