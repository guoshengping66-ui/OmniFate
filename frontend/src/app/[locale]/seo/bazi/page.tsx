"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useLanguage } from "@/contexts/LanguageContext"

export default function BaziSEOPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const faqItems = isZh ? [
    { question: "什么是八字分析？", answer: "八字分析是将出生年、月、日、时转化为天干地支组合，形成八个字——即「生辰八字」。通过分析五行关系、十维配置和格局层次，可以推断性格、事业、财运、婚姻、健康等各方面。" },
    { question: "八字分析需要什么信息？", answer: "需要提供出生的年、月、日、时（精确到小时），以及出生城市（用于真太阳时校正）。AI 会自动完成所有计算和分析。" },
    { question: "什么是十维格局？", answer: "十维（十神）是八字分析中的核心概念，包括正官、偏官、正财、偏财、食神、伤官、比肩、劫财、正印、偏印，反映了人生各方面的关系模式。" },
    { question: "八字分析准确吗？", answer: "AI 八字系统结合传统命理学与现代技术，提供多维度交叉验证。但命理分析仅供参考和娱乐，不能替代专业建议。" },
  ] : [
    { question: "What is Bazi analysis?", answer: "Bazi analysis converts your birth year, month, day, and hour into Heavenly Stems and Earthly Branches — the so-called 'Eight Characters'. It analyzes Five Elements, Ten Gods patterns, and chart levels to reveal personality, career, wealth, relationships, and health." },
    { question: "What information do I need?", answer: "You need your birth year, month, day, and hour (down to the hour), plus your birth city (for true solar time correction). AI handles all calculations automatically." },
    { question: "What are the Ten Gods?", answer: "The Ten Gods (Shi Shen) are the core concept in Bazi, including Officer, Wealth, Food God, and others. They reveal relationship patterns across all life aspects." },
    { question: "How accurate is Bazi analysis?", answer: "The AI Bazi system combines traditional wisdom with modern technology for multi-dimension cross-validation. However, destiny analysis is for reference and entertainment only." },
  ]

  const relatedServices = isZh ? [
    { icon: "☯️", title: "五行分析", href: "/seo/five-elements", desc: "五行平衡与循环" },
    { icon: "⭐", title: "星盘分析", href: "/seo/astrology", desc: "行星落座与相位解读" },
    { icon: "🃏", title: "塔罗分析", href: "/seo/tarot", desc: "牌阵解读与行动指引" },
    { icon: "⭐", title: "紫微斗数", href: "/seo/ziwei", desc: "十二宫位与星曜落点" },
  ] : [
    { icon: "☯️", title: "Five Elements", href: "/seo/five-elements", desc: "Elemental balance" },
    { icon: "⭐", title: "Natal Chart", href: "/seo/astrology", desc: "Planetary placements" },
    { icon: "🃏", title: "Tarot Reading", href: "/seo/tarot", desc: "Spread interpretation" },
    { icon: "⭐", title: "Purple Star", href: "/seo/ziwei", desc: "12 life palaces" },
  ]

  const features = [
    { icon: "☯", title: t("seo.bazi.f1Title"), desc: t("seo.bazi.f1Desc") },
    { icon: "🔥", title: t("seo.bazi.f2Title"), desc: t("seo.bazi.f2Desc") },
    { icon: "📊", title: t("seo.bazi.f3Title"), desc: t("seo.bazi.f3Desc") },
    { icon: "📅", title: t("seo.bazi.f4Title"), desc: t("seo.bazi.f4Desc") },
    { icon: "💡", title: t("seo.bazi.f5Title"), desc: t("seo.bazi.f5Desc") },
    { icon: "🎯", title: t("seo.bazi.f6Title"), desc: t("seo.bazi.f6Desc") },
  ]

  const steps = [
    { n: "01", title: t("seo.bazi.s1Title"), desc: t("seo.bazi.s1Desc") },
    { n: "02", title: t("seo.bazi.s2Title"), desc: t("seo.bazi.s2Desc") },
    { n: "03", title: t("seo.bazi.s3Title"), desc: t("seo.bazi.s3Desc") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.bazi.breadcrumb") }]} currentPath={`/${locale}/seo/bazi`} />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.bazi.title"),
            "description": t("seo.bazi.desc"),
            "url": "https://www.khanfate.com/seo/bazi",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY",
            },
          })}}
        />

        {/* Hero */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.bazi.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">☯</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.bazi.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.bazi.desc")}
            </p>
          </div>
        </ScrollReveal>

        {/* Features Grid */}
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

        {/* How It Works */}
        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-8 text-center">{t("seo.bazi.stepsTitle")}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center mx-auto mb-4 text-gold font-bold">
                    {s.n}
                  </div>
                  <h3 className="text-white font-medium mb-2">{s.title}</h3>
                  <p className="text-white/40 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* SEO Content */}
        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.bazi.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.bazi.p1")}</p>
              <p>{t("seo.bazi.p2")}</p>
              <p>{t("seo.bazi.p3")}</p>
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

        {/* CTA */}
        <ScrollReveal delay={0.4}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">🔮</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.bazi.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.bazi.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.bazi.ctaBtn")} <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">{t("seo.bazi.ctaNote")}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
