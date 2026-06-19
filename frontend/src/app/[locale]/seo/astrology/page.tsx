"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AstrologySEOPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const faqItems = isZh ? [
    { question: "什么是星盘分析？", answer: "星盘是根据出生瞬间行星精确位置绘制的宇宙地图，记录了十大行星在十二宫位的分布。通过分析太阳、月亮、上升三大巨头，以及行星落座和相位，可以深入了解性格和人生使命。" },
    { question: "什么是「三大巨头」？", answer: "三大巨头指太阳星盘（核心人格）、月亮星盘（内在情感）和上升星盘（外在表现）。这三者共同构成了一个人的基本性格框架。" },
    { question: "行星相位是什么意思？", answer: "相位是行星之间的角度关系，包括合相、六合、刑相、三合和对冲。不同相位反映了天赋、挑战和人生课题。" },
    { question: "需要什么信息来分析？", answer: "需要出生日期、精确时间和出生地点。出生地点用于计算地球的精确自转角度，影响上升星座和宫位的准确性。" },
  ] : [
    { question: "What is natal chart analysis?", answer: "A natal chart is a cosmic map drawn from the precise positions of planets at birth, recording the distribution of ten planets across twelve houses. Analyzing the Big Three — Sun, Moon, and Rising — reveals personality and life mission." },
    { question: "What are the Big Three?", answer: "The Big Three refer to your Sun sign (core personality), Moon sign (inner emotions), and Rising sign (outer presentation). Together they form your basic personality framework." },
    { question: "What are planetary aspects?", answer: "Aspects are angular relationships between planets, including conjunctions, sextiles, squares, trines, and oppositions. Each reveals talents, challenges, and life lessons." },
    { question: "What information do I need?", answer: "You need your birth date, exact time, and birth location. The location calculates Earth's precise rotation angle, affecting rising sign and house accuracy." },
  ]

  const relatedServices = isZh ? [
    { icon: "📊", title: "八字分析", href: "/seo/bazi", desc: "四柱排列与十维格局" },
    { icon: "☯️", title: "五行分析", href: "/seo/five-elements", desc: "五行平衡与循环" },
    { icon: "💕", title: "星座配对", href: "/seo/zodiac-compatibility", desc: "星座兼容性分析" },
    { icon: "⭐", title: "紫微斗数", href: "/seo/ziwei", desc: "十二宫位与星曜落点" },
  ] : [
    { icon: "📊", title: "Bazi Chart", href: "/seo/bazi", desc: "Four Pillars & Ten Gods" },
    { icon: "☯️", title: "Five Elements", href: "/seo/five-elements", desc: "Elemental balance" },
    { icon: "💕", title: "Zodiac Match", href: "/seo/zodiac-compatibility", desc: "Compatibility analysis" },
    { icon: "⭐", title: "Purple Star", href: "/seo/ziwei", desc: "12 life palaces" },
  ]

  const features = [
    { icon: "☀️", title: t("seo.astrology.f1Title"), desc: t("seo.astrology.f1Desc") },
    { icon: "🌙", title: t("seo.astrology.f2Title"), desc: t("seo.astrology.f2Desc") },
    { icon: "⬆️", title: t("seo.astrology.f3Title"), desc: t("seo.astrology.f3Desc") },
    { icon: "🪐", title: t("seo.astrology.f4Title"), desc: t("seo.astrology.f4Desc") },
    { icon: "📐", title: t("seo.astrology.f5Title"), desc: t("seo.astrology.f5Desc") },
    { icon: "🌟", title: t("seo.astrology.f6Title"), desc: t("seo.astrology.f6Desc") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.astrology.breadcrumb") }]} currentPath={`/${locale}/seo/astrology`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.astrology.title"),
            "description": t("seo.astrology.desc"),
            "url": "https://www.khanfate.com/seo/astrology",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.astrology.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">✦</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.astrology.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.astrology.desc")}
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
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.astrology.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.astrology.p1")}</p>
              <p>{t("seo.astrology.p2")}</p>
              <p>{t("seo.astrology.p3")}</p>
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

        <ScrollReveal delay={0.3}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">🌟</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.astrology.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.astrology.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.astrology.ctaBtn")} <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
