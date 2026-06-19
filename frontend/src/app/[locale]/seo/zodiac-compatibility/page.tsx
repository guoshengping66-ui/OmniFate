"use client"
import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ZodiacCompatibilitySEOPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const faqItems = isZh ? [
    { question: "星座配对是怎么分析的？", answer: "星座配对基于两个星座的元素属性（火、土、风、水）、模态（开创、固定、变动）和行星守护星来分析动态关系。每种组合都创造独特的吸引、挑战和成长模式。" },
    { question: "哪些星座最配？", answer: "同元素星座通常天然契合（如火象白羊+狮子+射手），互补星座也能产生强烈吸引。但没有绝对的好坏配对，关键在于理解和经营关系。" },
    { question: "不配的星座也能在一起吗？", answer: "当然可以。所谓的「不配」只是意味着需要更多理解和包容。了解彼此的差异反而能帮助双方更好地成长。AI 配对分析会给出具体的相处建议。" },
    { question: "AI 配对分析准确吗？", answer: "AI 配对分析结合了传统星座学智慧和现代数据分析，比简单的太阳星座匹配更全面。它会考虑多个维度的互动，提供更细致的兼容性评估。" },
  ] : [
    { question: "How does zodiac compatibility work?", answer: "Zodiac compatibility analyzes the dynamic between two signs based on elemental properties (Fire, Earth, Air, Water), modalities (Cardinal, Fixed, Mutable), and planetary rulers. Each combination creates unique patterns." },
    { question: "Which signs are most compatible?", answer: "Same-element signs naturally harmonize (e.g., Fire: Aries + Leo + Sagittarius), while complementary signs create strong attraction. There are no absolute good or bad matches — it's about understanding and nurturing the relationship." },
    { question: "Can incompatible signs have good relationships?", answer: "Absolutely. So-called 'incompatible' signs just need more understanding and compromise. Understanding differences actually helps both partners grow. AI analysis provides specific relationship tips." },
    { question: "How accurate is AI compatibility analysis?", answer: "AI compatibility analysis combines traditional astrology wisdom with modern data analysis, going beyond simple sun sign matching. It considers multiple interaction dimensions for a more nuanced assessment." },
  ]

  const relatedServices = isZh ? [
    { icon: "⭐", title: "星盘分析", href: "/seo/astrology", desc: "个人行星落座解读" },
    { icon: "📊", title: "八字分析", href: "/seo/bazi", desc: "五行婚配分析" },
    { icon: "🃏", title: "塔罗分析", href: "/seo/tarot", desc: "感情牌阵解读" },
    { icon: "☯️", title: "五行分析", href: "/seo/five-elements", desc: "五行互补关系" },
  ] : [
    { icon: "⭐", title: "Natal Chart", href: "/seo/astrology", desc: "Personal chart reading" },
    { icon: "📊", title: "Bazi Chart", href: "/seo/bazi", desc: "Five Elements matching" },
    { icon: "🃏", title: "Tarot Reading", href: "/seo/tarot", desc: "Relationship spreads" },
    { icon: "☯️", title: "Five Elements", href: "/seo/five-elements", desc: "Elemental harmony" },
  ]

  const features = [
    { icon: "💕", title: t("seo.zodiac.f1Title"), desc: t("seo.zodiac.f1Desc") },
    { icon: "🤝", title: t("seo.zodiac.f2Title"), desc: t("seo.zodiac.f2Desc") },
    { icon: "💼", title: t("seo.zodiac.f3Title"), desc: t("seo.zodiac.f3Desc") },
    { icon: "🔥", title: t("seo.zodiac.f4Title"), desc: t("seo.zodiac.f4Desc") },
    { icon: "📊", title: t("seo.zodiac.f5Title"), desc: t("seo.zodiac.f5Desc") },
    { icon: "💡", title: t("seo.zodiac.f6Title"), desc: t("seo.zodiac.f6Desc") },
  ]

  const signs = [
    { icon: "♈", name: t("seo.zodiac.s1Name"), trait: t("seo.zodiac.s1Trait") },
    { icon: "♉", name: t("seo.zodiac.s2Name"), trait: t("seo.zodiac.s2Trait") },
    { icon: "♊", name: t("seo.zodiac.s3Name"), trait: t("seo.zodiac.s3Trait") },
    { icon: "♋", name: t("seo.zodiac.s4Name"), trait: t("seo.zodiac.s4Trait") },
    { icon: "♌", name: t("seo.zodiac.s5Name"), trait: t("seo.zodiac.s5Trait") },
    { icon: "♍", name: t("seo.zodiac.s6Name"), trait: t("seo.zodiac.s6Trait") },
    { icon: "♎", name: t("seo.zodiac.s7Name"), trait: t("seo.zodiac.s7Trait") },
    { icon: "♏", name: t("seo.zodiac.s8Name"), trait: t("seo.zodiac.s8Trait") },
    { icon: "♐", name: t("seo.zodiac.s9Name"), trait: t("seo.zodiac.s9Trait") },
    { icon: "♑", name: t("seo.zodiac.s10Name"), trait: t("seo.zodiac.s10Trait") },
    { icon: "♒", name: t("seo.zodiac.s11Name"), trait: t("seo.zodiac.s11Trait") },
    { icon: "♓", name: t("seo.zodiac.s12Name"), trait: t("seo.zodiac.s12Trait") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.zodiac.breadcrumb") }]} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.zodiac.title"),
            "description": t("seo.zodiac.desc"),
            "url": "https://www.khanfate.com/seo/zodiac-compatibility",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.zodiac.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">💕</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.zodiac.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.zodiac.desc")}
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
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.zodiac.signsTitle")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {signs.map((s) => (
                <div key={s.name} className="text-center p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:border-gold/20 transition-all">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <h3 className="text-white font-medium text-xs">{s.name}</h3>
                  <p className="text-white/40 text-[10px] mt-1">{s.trait}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.zodiac.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.zodiac.p1")}</p>
              <p>{t("seo.zodiac.p2")}</p>
              <p>{t("seo.zodiac.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-green-400" />
              <h3 className="text-white font-medium">{t("seo.zodiac.privacyTitle")}</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t("seo.zodiac.privacyDesc")}
            </p>
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

        <ScrollReveal delay={0.5}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">💕</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.zodiac.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.zodiac.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.zodiac.ctaBtn")} <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">{t("seo.zodiac.ctaNote")}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
