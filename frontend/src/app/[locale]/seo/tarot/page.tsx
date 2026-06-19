"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useLanguage } from "@/contexts/LanguageContext"

export default function TarotSEOPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const faqItems = isZh ? [
    { question: "什么是塔罗分析？", answer: "塔罗牌是一种古老的分析工具，共 78 张牌，每张都蕴含丰富的象征意义。通过牌阵，塔罗帮助探索潜意识，理解当下处境，发现被忽视的可能性。" },
    { question: "塔罗牌阵有哪些？", answer: "常见牌阵包括：单牌速占（快速指引）、三角阵（过去-现在-未来）、时间流（事件发展）和凯尔特十字（最全面的深度分析）。不同牌阵适合不同问题。" },
    { question: "正位和逆位有什么区别？", answer: "正位代表牌的正面能量和显性含义；逆位则表示能量的阻滞、内在挑战或需要反思的方面。AI 会精准区分正逆位的不同解读。" },
    { question: "塔罗分析是算命吗？", answer: "不是。塔罗分析是自我探索和反思的工具，帮助发现被忽视的可能性，做出更明智的选择。它不是宿命论的预言。" },
  ] : [
    { question: "What is tarot reading?", answer: "Tarot is an ancient analysis tool of 78 cards, each carrying rich symbolic meaning. Through spreads, tarot helps explore the subconscious, understand current situations, and discover overlooked possibilities." },
    { question: "What tarot spreads are available?", answer: "Common spreads include: Single Card (quick guidance), Triangle (past-present-future), Time-Flow (event development), and Celtic Cross (most comprehensive deep analysis)." },
    { question: "What's the difference between upright and reversed?", answer: "Upright represents the card's positive energy and manifest meaning. Reversed indicates energy blockage, inner challenges, or aspects needing reflection." },
    { question: "Is tarot fortune-telling?", answer: "No. Tarot reading is a tool for self-exploration and reflection, helping discover overlooked possibilities and make wiser choices. It is not fatalistic prediction." },
  ]

  const relatedServices = isZh ? [
    { icon: "⭐", title: "星盘分析", href: "/seo/astrology", desc: "行星落座与相位解读" },
    { icon: "📊", title: "八字分析", href: "/seo/bazi", desc: "四柱排列与十维格局" },
    { icon: "💕", title: "星座配对", href: "/seo/zodiac-compatibility", desc: "星座兼容性分析" },
    { icon: "☯️", title: "五行分析", href: "/seo/five-elements", desc: "五行平衡与循环" },
  ] : [
    { icon: "⭐", title: "Natal Chart", href: "/seo/astrology", desc: "Planetary placements" },
    { icon: "📊", title: "Bazi Chart", href: "/seo/bazi", desc: "Four Pillars & Ten Gods" },
    { icon: "💕", title: "Zodiac Match", href: "/seo/zodiac-compatibility", desc: "Compatibility analysis" },
    { icon: "☯️", title: "Five Elements", href: "/seo/five-elements", desc: "Elemental balance" },
  ]

  const features = [
    { icon: "🃏", title: t("seo.tarot.f1Title"), desc: t("seo.tarot.f1Desc") },
    { icon: "🔮", title: t("seo.tarot.f2Title"), desc: t("seo.tarot.f2Desc") },
    { icon: "✨", title: t("seo.tarot.f3Title"), desc: t("seo.tarot.f3Desc") },
    { icon: "💫", title: t("seo.tarot.f4Title"), desc: t("seo.tarot.f4Desc") },
    { icon: "🎯", title: t("seo.tarot.f5Title"), desc: t("seo.tarot.f5Desc") },
    { icon: "🧘", title: t("seo.tarot.f6Title"), desc: t("seo.tarot.f6Desc") },
  ]

  const spreads = [
    { name: t("seo.tarot.sp1Name"), cards: 1, desc: t("seo.tarot.sp1Desc") },
    { name: t("seo.tarot.sp2Name"), cards: 3, desc: t("seo.tarot.sp2Desc") },
    { name: t("seo.tarot.sp3Name"), cards: 5, desc: t("seo.tarot.sp3Desc") },
    { name: t("seo.tarot.sp4Name"), cards: 10, desc: t("seo.tarot.sp4Desc") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.tarot.breadcrumb") }]} currentPath={`/${locale}/seo/tarot`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.tarot.title"),
            "description": t("seo.tarot.desc"),
            "url": "https://www.khanfate.com/seo/tarot",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.tarot.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">🃏</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.tarot.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.tarot.desc")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {features.map((f) => (
              <div key={f.title} className="card-glow p-5 hover:border-gold/30 transition-all duration-300">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-serif font-bold text-gold mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.tarot.spreadsTitle")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {spreads.map((s) => (
                <div key={s.name} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold text-lg">
                    {s.cards}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{s.name}</h3>
                    <p className="text-white/40 text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.tarot.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.tarot.p1")}</p>
              <p>{t("seo.tarot.p2")}</p>
              <p>{t("seo.tarot.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <SEOFaq
          title={isZh ? "常见问题" : "Frequently Asked Questions"}
          items={faqItems}
        />

        <RelatedServices
          heading={isZh ? "探索更多分析" : "Explore More Analysis"}
          services={relatedServices}
        />

        <ScrollReveal delay={0.4}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.tarot.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.tarot.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.tarot.ctaBtn")} <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
