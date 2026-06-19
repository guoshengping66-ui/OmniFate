"use client"
import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useLanguage } from "@/contexts/LanguageContext"

export default function FaceReadingSEOPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const faqItems = isZh ? [
    { question: "什么是面相学？", answer: "面相学是中国传统分析学的重要分支，已有数千年历史。通过分析脸型、三停五眼比例和五官特征，可以评估财运、事业、感情和健康状态。古人认为「相由心生」。" },
    { question: "AI 面相分析怎么工作？", answer: "AI 使用 MediaPipe 468 点面部识别技术，自动检测面部特征点，结合传统面相学智慧进行深度分析。整个过程仅需几秒钟。" },
    { question: "需要什么样的照片？", answer: "需要一张正面、光线充足、无遮挡的面部照片。建议不要使用美颜或滤镜，以确保分析的准确性。" },
    { question: "照片安全吗？", answer: "完全安全。照片仅用于 AI 特征提取，处理完成后立即删除，不会存储或分享任何个人信息。" },
  ] : [
    { question: "What is face reading?", answer: "Face reading (physiognomy) is an important branch of Chinese analysis with thousands of years of history. By analyzing face shape, proportions, and features, it assesses wealth, career, relationships, and health." },
    { question: "How does AI face analysis work?", answer: "AI uses MediaPipe 468-point facial recognition to automatically detect facial feature points, combined with traditional face reading wisdom for deep analysis. The process takes just seconds." },
    { question: "What kind of photo do I need?", answer: "You need a front-facing, well-lit photo without obstructions. Avoid beauty filters or effects for the most accurate analysis." },
    { question: "Is my photo safe?", answer: "Absolutely. Photos are used only for AI feature extraction and deleted immediately after processing. No personal information is stored or shared." },
  ]

  const relatedServices = isZh ? [
    { icon: "✋", title: "手相分析", href: "/seo/palm-reading", desc: "AI 掌纹识别与解读" },
    { icon: "📊", title: "八字分析", href: "/seo/bazi", desc: "四柱排列与十维格局" },
    { icon: "⭐", title: "星盘分析", href: "/seo/astrology", desc: "行星落座与相位解读" },
    { icon: "☯️", title: "五行分析", href: "/seo/five-elements", desc: "五行平衡与循环" },
  ] : [
    { icon: "✋", title: "Palm Reading", href: "/seo/palm-reading", desc: "AI palm line analysis" },
    { icon: "📊", title: "Bazi Chart", href: "/seo/bazi", desc: "Four Pillars & Ten Gods" },
    { icon: "⭐", title: "Natal Chart", href: "/seo/astrology", desc: "Planetary placements" },
    { icon: "☯️", title: "Five Elements", href: "/seo/five-elements", desc: "Elemental balance" },
  ]

  const features = [
    { icon: "📸", title: t("seo.face.f1Title"), desc: t("seo.face.f1Desc") },
    { icon: "🎭", title: t("seo.face.f2Title"), desc: t("seo.face.f2Desc") },
    { icon: "👁️", title: t("seo.face.f3Title"), desc: t("seo.face.f3Desc") },
    { icon: "👃", title: t("seo.face.f4Title"), desc: t("seo.face.f4Desc") },
    { icon: "✨", title: t("seo.face.f5Title"), desc: t("seo.face.f5Desc") },
    { icon: "🔒", title: t("seo.face.f6Title"), desc: t("seo.face.f6Desc") },
  ]

  const areas = [
    { area: t("seo.face.a1Area"), icon: "🧠", meaning: t("seo.face.a1Meaning") },
    { area: t("seo.face.a2Area"), icon: "👁️", meaning: t("seo.face.a2Meaning") },
    { area: t("seo.face.a3Area"), icon: "✨", meaning: t("seo.face.a3Meaning") },
    { area: t("seo.face.a4Area"), icon: "👃", meaning: t("seo.face.a4Meaning") },
    { area: t("seo.face.a5Area"), icon: "👄", meaning: t("seo.face.a5Meaning") },
    { area: t("seo.face.a6Area"), icon: "😊", meaning: t("seo.face.a6Meaning") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.face.breadcrumb") }]} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.face.title"),
            "description": t("seo.face.desc"),
            "url": "https://www.khanfate.com/seo/face-reading",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.face.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">👁️</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.face.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.face.desc")}
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
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.face.areasTitle")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((a) => (
                <div key={a.area} className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <h3 className="text-white font-medium text-sm">{a.area}</h3>
                    <p className="text-white/40 text-xs">{a.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.face.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.face.p1")}</p>
              <p>{t("seo.face.p2")}</p>
              <p>{t("seo.face.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-green-400" />
              <h3 className="text-white font-medium">{t("seo.face.privacyTitle")}</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t("seo.face.privacyDesc")}
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">📸</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.face.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.face.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.face.ctaBtn")} <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">{t("seo.face.ctaNote")}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
