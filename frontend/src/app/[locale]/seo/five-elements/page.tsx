"use client"
import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useLanguage } from "@/contexts/LanguageContext"

export default function FiveElementsSEOPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const faqItems = isZh ? [
    { question: "什么是五行？", answer: "五行——金、木、水、火、土——是中国传统分析学的基础框架。每个元素代表不同的能量特质：木代表生长与创造，火代表热情与变革，土代表稳定与滋养，金代表精准与纪律，水代表智慧与流动。" },
    { question: "如何知道自己五行缺什么？", answer: "通过输入出生年月日时，AI 会自动计算你的八字命盘，分析五行的强弱分布，找出缺失或过旺的元素，并给出相应的平衡建议。" },
    { question: "五行相生相克是什么意思？", answer: "相生：木生火、火生土、土生金、金生水、水生木。相克：木克土、土克水、水克火、火克金、金克木。这两个循环描述了五行之间相互促进和制约的关系。" },
    { question: "五行分析能帮我做什么？", answer: "五行分析可以帮助你了解自己的性格特质、适合的职业方向、人际关系模式、健康倾向，以及如何通过调整生活方式来平衡五行能量。" },
  ] : [
    { question: "What are the Five Elements?", answer: "The Five Elements — Metal, Wood, Water, Fire, and Earth — form the foundation of Chinese analysis. Each represents distinct energy: Wood for growth, Fire for passion, Earth for stability, Metal for precision, and Water for wisdom." },
    { question: "How do I know my dominant element?", answer: "By entering your birth date and time, AI automatically calculates your chart and analyzes the distribution of all five elements, identifying which are strong, weak, or missing in your profile." },
    { question: "What is the generating cycle?", answer: "The generating (Sheng) cycle: Wood feeds Fire, Fire creates Earth, Earth bears Metal, Metal collects Water, Water nourishes Wood. This cycle describes how elements support and strengthen each other." },
    { question: "How can Five Elements analysis help me?", answer: "Five Elements analysis reveals your personality traits, ideal career paths, relationship patterns, health tendencies, and how to balance your elemental energy through lifestyle adjustments." },
  ]

  const relatedServices = isZh ? [
    { icon: "📊", title: "八字分析", href: "/seo/bazi", desc: "四柱排列与十维格局" },
    { icon: "⭐", title: "星盘分析", href: "/seo/astrology", desc: "行星落座与相位解读" },
    { icon: "🃏", title: "塔罗分析", href: "/seo/tarot", desc: "牌阵解读与行动指引" },
    { icon: "👁️", title: "面相分析", href: "/seo/face-reading", desc: "AI 面部特征识别" },
  ] : [
    { icon: "📊", title: "Bazi Chart", href: "/seo/bazi", desc: "Four Pillars & Ten Gods" },
    { icon: "⭐", title: "Natal Chart", href: "/seo/astrology", desc: "Planetary placements" },
    { icon: "🃏", title: "Tarot Reading", href: "/seo/tarot", desc: "Spread interpretation" },
    { icon: "👁️", title: "Face Analysis", href: "/seo/face-reading", desc: "AI facial recognition" },
  ]

  const features = [
    { icon: "🌳", title: t("seo.fiveElements.f1Title"), desc: t("seo.fiveElements.f1Desc") },
    { icon: "🔥", title: t("seo.fiveElements.f2Title"), desc: t("seo.fiveElements.f2Desc") },
    { icon: "🌍", title: t("seo.fiveElements.f3Title"), desc: t("seo.fiveElements.f3Desc") },
    { icon: "💧", title: t("seo.fiveElements.f4Title"), desc: t("seo.fiveElements.f4Desc") },
    { icon: "🪙", title: t("seo.fiveElements.f5Title"), desc: t("seo.fiveElements.f5Desc") },
    { icon: "⚡", title: t("seo.fiveElements.f6Title"), desc: t("seo.fiveElements.f6Desc") },
  ]

  const cycles = [
    { icon: "🔄", name: t("seo.fiveElements.c1Name"), desc: t("seo.fiveElements.c1Desc") },
    { icon: "⚔️", name: t("seo.fiveElements.c2Name"), desc: t("seo.fiveElements.c2Desc") },
    { icon: "☯️", name: t("seo.fiveElements.c3Name"), desc: t("seo.fiveElements.c3Desc") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.fiveElements.breadcrumb") }]} currentPath={`/${locale}/seo/five-elements`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.fiveElements.title"),
            "description": t("seo.fiveElements.desc"),
            "url": "https://www.khanfate.com/seo/five-elements",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.fiveElements.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">☯️</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.fiveElements.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.fiveElements.desc")}
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
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.fiveElements.cyclesTitle")}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {cycles.map((c) => (
                <div key={c.name} className="text-center p-5 bg-white/[0.03] rounded-xl border border-white/10">
                  <div className="text-3xl mb-3">{c.icon}</div>
                  <h3 className="text-white font-medium text-sm mb-1">{c.name}</h3>
                  <p className="text-white/40 text-xs">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.fiveElements.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.fiveElements.p1")}</p>
              <p>{t("seo.fiveElements.p2")}</p>
              <p>{t("seo.fiveElements.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-green-400" />
              <h3 className="text-white font-medium">{t("seo.fiveElements.privacyTitle")}</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t("seo.fiveElements.privacyDesc")}
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
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">☯️</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.fiveElements.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.fiveElements.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.fiveElements.ctaBtn")} <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">{t("seo.fiveElements.ctaNote")}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
