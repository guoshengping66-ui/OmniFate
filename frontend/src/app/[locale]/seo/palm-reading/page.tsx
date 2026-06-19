"use client"
import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useLanguage } from "@/contexts/LanguageContext"

export default function PalmReadingSEOPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const faqItems = isZh ? [
    { question: "什么是手相学？", answer: "手相学是一门有数千年历史的古老分析体系，通过分析手掌的纹路、形状和丘位来了解一个人的性格、潜力和人生道路。古人认为手掌能反映内心世界。" },
    { question: "感情线、智慧线、生命线分别代表什么？", answer: "感情线反映情感表达和恋爱倾向；智慧线体现思维模式和决策风格；生命线代表生命力和健康状况。每条线的长度、深度和弧度都有不同的含义。" },
    { question: "掌纹会随着时间变化吗？", answer: "是的，掌纹会随着人生经历和身体状况的变化而微妙改变。这反映了人的成长和转变。AI 手相分析可以捕捉这些细微变化。" },
    { question: "上传的照片安全吗？", answer: "完全安全。照片仅用于 AI 掌纹特征提取，处理完成后立即删除，不会存储或分享任何个人信息。所有数据传输均采用 SSL 加密。" },
  ] : [
    { question: "What is palm reading?", answer: "Palm reading (palmistry) is an ancient analysis system with thousands of years of history. By analyzing palm lines, shape, and mounts, it reveals character traits, potential, and life path patterns." },
    { question: "What do the heart, head, and life lines mean?", answer: "The heart line reflects emotional expression and romantic tendencies. The head line shows thinking style and decision-making patterns. The life line indicates vitality and health trajectory." },
    { question: "Can palm lines change over time?", answer: "Yes, palm lines can subtly change with life experiences and health conditions, reflecting personal growth and transformation. AI palm reading can capture these nuanced changes." },
    { question: "Is my photo safe?", answer: "Absolutely. Photos are used only for AI line extraction and deleted immediately after processing. No personal information is stored or shared. All data transmission uses SSL encryption." },
  ]

  const relatedServices = isZh ? [
    { icon: "👁️", title: "面相分析", href: "/seo/face-reading", desc: "AI 面部特征识别" },
    { icon: "📊", title: "八字分析", href: "/seo/bazi", desc: "四柱排列与十维格局" },
    { icon: "⭐", title: "星盘分析", href: "/seo/astrology", desc: "行星落座与相位解读" },
    { icon: "☯️", title: "五行分析", href: "/seo/five-elements", desc: "五行平衡与循环" },
  ] : [
    { icon: "👁️", title: "Face Analysis", href: "/seo/face-reading", desc: "AI facial recognition" },
    { icon: "📊", title: "Bazi Chart", href: "/seo/bazi", desc: "Four Pillars & Ten Gods" },
    { icon: "⭐", title: "Natal Chart", href: "/seo/astrology", desc: "Planetary placements" },
    { icon: "☯️", title: "Five Elements", href: "/seo/five-elements", desc: "Elemental balance" },
  ]

  const features = [
    { icon: "📸", title: t("seo.palm.f1Title"), desc: t("seo.palm.f1Desc") },
    { icon: "✋", title: t("seo.palm.f2Title"), desc: t("seo.palm.f2Desc") },
    { icon: "📏", title: t("seo.palm.f3Title"), desc: t("seo.palm.f3Desc") },
    { icon: "🔍", title: t("seo.palm.f4Title"), desc: t("seo.palm.f4Desc") },
    { icon: "✨", title: t("seo.palm.f5Title"), desc: t("seo.palm.f5Desc") },
    { icon: "🔒", title: t("seo.palm.f6Title"), desc: t("seo.palm.f6Desc") },
  ]

  const lines = [
    { icon: "❤️", name: t("seo.palm.l1Name"), desc: t("seo.palm.l1Desc") },
    { icon: "🧠", name: t("seo.palm.l2Name"), desc: t("seo.palm.l2Desc") },
    { icon: "💪", name: t("seo.palm.l3Name"), desc: t("seo.palm.l3Desc") },
    { icon: "💍", name: t("seo.palm.l4Name"), desc: t("seo.palm.l4Desc") },
    { icon: "🌟", name: t("seo.palm.l5Name"), desc: t("seo.palm.l5Desc") },
    { icon: "🛡️", name: t("seo.palm.l6Name"), desc: t("seo.palm.l6Desc") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.palm.breadcrumb") }]} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.palm.title"),
            "description": t("seo.palm.desc"),
            "url": "https://www.khanfate.com/seo/palm-reading",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.palm.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">✋</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.palm.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.palm.desc")}
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
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.palm.linesTitle")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lines.map((l) => (
                <div key={l.name} className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                  <span className="text-2xl">{l.icon}</span>
                  <div>
                    <h3 className="text-white font-medium text-sm">{l.name}</h3>
                    <p className="text-white/40 text-xs">{l.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.palm.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.palm.p1")}</p>
              <p>{t("seo.palm.p2")}</p>
              <p>{t("seo.palm.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-green-400" />
              <h3 className="text-white font-medium">{t("seo.palm.privacyTitle")}</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t("seo.palm.privacyDesc")}
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
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">✋</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.palm.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.palm.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.palm.ctaBtn")} <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">{t("seo.palm.ctaNote")}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
