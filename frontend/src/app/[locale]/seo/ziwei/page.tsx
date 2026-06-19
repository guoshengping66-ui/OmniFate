"use client"
import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ZiweiSEOPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const faqItems = isZh ? [
    { question: "什么是紫微斗数？", answer: "紫微斗数是中国最精密的命运分析系统之一，通过 100 多颗星曜分布在十二宫位，绘制完整的人生轨迹图。它能深入揭示性格、事业、财运、感情和健康等各方面信息。" },
    { question: "紫微斗数和八字有什么区别？", answer: "八字以出生时间的天干地支为基础，注重五行平衡；紫微斗数则以星曜落宫为核心，更注重宫位之间的互动关系。两者可以互相补充，提供更全面的分析。" },
    { question: "紫微命盘需要精确的出生时间吗？", answer: "是的，紫微斗数对出生时间非常敏感。出生时间的差异可能导致星曜落宫不同，从而影响命盘的准确性。建议尽量提供精确到分钟的出生时间。" },
    { question: "十二宫位分别代表什么？", answer: "十二宫位涵盖人生的各个方面：命宫（核心自我）、财帛宫（财运）、夫妻宫（感情）、官禄宫（事业）、田宅宫（房产）、福德宫（精神）等，每个宫位都有独特的星曜组合。" },
  ] : [
    { question: "What is Purple Star Astrology?", answer: "Purple Star Astrology (Zi Wei Dou Shu) is one of the most sophisticated Chinese destiny analysis systems, using over 100 stars placed across 12 life palaces to map your complete life trajectory." },
    { question: "How is it different from Bazi?", answer: "Bazi focuses on Five Elements balance from birth time, while Purple Star Astrology centers on star placements across 12 palaces. They complement each other for a more comprehensive reading." },
    { question: "Do I need exact birth time?", answer: "Yes, Purple Star Astrology is highly sensitive to birth time. Even small differences can change star placements and palace assignments. Provide the most accurate time possible for best results." },
    { question: "What do the 12 palaces mean?", answer: "The 12 palaces cover all life aspects: Life Palace (self), Wealth Palace (finances), Marriage Palace (relationships), Career Palace (profession), Property Palace (assets), Fortune Palace (luck), and more." },
  ]

  const relatedServices = isZh ? [
    { icon: "📊", title: "八字分析", href: "/seo/bazi", desc: "四柱排列与十维格局" },
    { icon: "☯️", title: "五行分析", href: "/seo/five-elements", desc: "五行平衡与循环" },
    { icon: "⭐", title: "星盘分析", href: "/seo/astrology", desc: "行星落座与相位解读" },
    { icon: "🃏", title: "塔罗分析", href: "/seo/tarot", desc: "牌阵解读与行动指引" },
  ] : [
    { icon: "📊", title: "Bazi Chart", href: "/seo/bazi", desc: "Four Pillars & Ten Gods" },
    { icon: "☯️", title: "Five Elements", href: "/seo/five-elements", desc: "Elemental balance" },
    { icon: "⭐", title: "Natal Chart", href: "/seo/astrology", desc: "Planetary placements" },
    { icon: "🃏", title: "Tarot Reading", href: "/seo/tarot", desc: "Spread interpretation" },
  ]

  const features = [
    { icon: "⭐", title: t("seo.ziwei.f1Title"), desc: t("seo.ziwei.f1Desc") },
    { icon: "🏛️", title: t("seo.ziwei.f2Title"), desc: t("seo.ziwei.f2Desc") },
    { icon: "🔮", title: t("seo.ziwei.f3Title"), desc: t("seo.ziwei.f3Desc") },
    { icon: "📊", title: t("seo.ziwei.f4Title"), desc: t("seo.ziwei.f4Desc") },
    { icon: "🎯", title: t("seo.ziwei.f5Title"), desc: t("seo.ziwei.f5Desc") },
    { icon: "🛡️", title: t("seo.ziwei.f6Title"), desc: t("seo.ziwei.f6Desc") },
  ]

  const palaces = [
    { icon: "👤", name: t("seo.ziwei.p1Name"), desc: t("seo.ziwei.p1Desc") },
    { icon: "💰", name: t("seo.ziwei.p2Name"), desc: t("seo.ziwei.p2Desc") },
    { icon: "❤️", name: t("seo.ziwei.p3Name"), desc: t("seo.ziwei.p3Desc") },
    { icon: "🏢", name: t("seo.ziwei.p4Name"), desc: t("seo.ziwei.p4Desc") },
    { icon: "🏠", name: t("seo.ziwei.p5Name"), desc: t("seo.ziwei.p5Desc") },
    { icon: "🎓", name: t("seo.ziwei.p6Name"), desc: t("seo.ziwei.p6Desc") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.ziwei.breadcrumb") }]} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.ziwei.title"),
            "description": t("seo.ziwei.desc"),
            "url": "https://www.khanfate.com/seo/ziwei",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.ziwei.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">⭐</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.ziwei.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.ziwei.desc")}
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
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.ziwei.palacesTitle")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palaces.map((p) => (
                <div key={p.name} className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h3 className="text-white font-medium text-sm">{p.name}</h3>
                    <p className="text-white/40 text-xs">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.ziwei.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.ziwei.p1")}</p>
              <p>{t("seo.ziwei.p2")}</p>
              <p>{t("seo.ziwei.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-green-400" />
              <h3 className="text-white font-medium">{t("seo.ziwei.privacyTitle")}</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t("seo.ziwei.privacyDesc")}
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">⭐</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.ziwei.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.ziwei.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.ziwei.ctaBtn")} <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">{t("seo.ziwei.ctaNote")}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
