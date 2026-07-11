"use client"
export const dynamic = "force-dynamic"

import Link from "next/link"
import { ArrowRight, Moon, Orbit, Sun, Telescope } from "lucide-react"
import { useMemo } from "react"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { useLanguage } from "@/contexts/LanguageContext"
import { safeJsonLd } from "@/utils/safeJsonLd"

export default function AstrologySEOPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const faqItems = useMemo(() => [1, 2, 3, 4].map(i => ({
    question: t("seo.astrology.faqQ" + i),
    answer: t("seo.astrology.faqA" + i),
  })), [t])

  const relatedServices = useMemo(() => [1, 2, 3, 4].map(i => ({
    icon: ["B", "E", "Z", "W"][i - 1],
    title: t("seo.astrology.r" + i + "Title"),
    href: ["/bazi", "/five-elements", "/astrology/zodiac-compatibility", "/ziwei"][i - 1],
    desc: t("seo.astrology.r" + i + "Desc"),
  })), [t])

  const features = [
    { icon: Sun, title: isZh ? "太阳星座" : "Sun sign", desc: isZh ? "核心身份、自我表达和长期驱动力。" : "Core identity, self-expression, and long-range motivation." },
    { icon: Moon, title: isZh ? "月亮星座" : "Moon sign", desc: isZh ? "情绪反应、安全感和亲密关系节奏。" : "Emotional reactions, security needs, and intimacy rhythm." },
    { icon: Orbit, title: isZh ? "宫位与相位" : "Houses and aspects", desc: isZh ? "把个人特质落到事业、关系、财富和成长场景。" : "Maps traits into work, relationships, wealth, and growth contexts." },
    { icon: Telescope, title: isZh ? "综合交叉验证" : "Cross-signal synthesis", desc: isZh ? "星盘会与八字、紫微、AM16 等信号合并，而不是孤立判断。" : "Astrology is merged with Bazi, Ziwei, AM16, and other signals." },
  ]

  return (
    <div className="min-h-screen px-4 pb-20 pt-24">
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs items={[{ label: t("seo.astrology.breadcrumb") }]} currentPath={`/${locale}/astrology`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": isZh ? "星盘分析：综合画像中的西方占星维度" : "Birth Chart Analysis for the Full AI Profile",
            "description": isZh
              ? "将西方占星作为完整 AI 命运画像中的人格与时机信号。"
              : "Use Western astrology as one personality and timing signal inside the complete AI destiny profile.",
            "url": "https://www.khanfate.com/astrology",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web",
          })}}
        />

        <ScrollReveal>
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-gold/50">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.astrology.breadcrumb")}
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-gold/25 bg-gold/[0.06] text-gold">
              <Orbit size={26} />
            </div>
            <h1 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              {isZh ? "星盘分析：综合画像中的西方占星维度" : "Birth Chart Analysis for the Full AI Profile"}
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/45 md:text-base">
              {isZh
                ? "太阳、月亮、上升、宫位和行星相位适合用来理解性格与时机；真正的决策建议会在完整报告中与八字、紫微、AM16 等信号合并。"
                : "Sun, moon, rising, houses, and planetary aspects explain personality and timing. For decisions, astrology is merged with Bazi, Ziwei, AM16, and other signals in the full report."}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={localeHref("/reading/new?system=astrology")} className="btn-gold inline-flex items-center gap-2 px-8 py-3 text-sm">
                {isZh ? "生成完整星盘报告" : "Generate full chart report"} <ArrowRight size={18} />
              </Link>
              <Link href={localeHref("/am16")} className="inline-flex items-center gap-2 border border-white/15 px-8 py-3 text-sm text-white/65 transition-colors hover:border-gold/30 hover:text-gold">
                {isZh ? "先做免费性格测验" : "Try free personality quiz"}
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-16 grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="card-glow p-5 transition-all duration-300 hover:border-gold/30">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center border border-gold/20 bg-gold/[0.05] text-gold">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-serif font-bold text-gold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-white/40">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass mb-16 p-8 md:p-10">
            <h2 className="mb-6 font-serif text-2xl text-gold">
              {isZh ? "星盘应该放在什么位置？" : "Where astrology fits"}
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-white/60">
              <p>{isZh ? "星座与星盘适合作为兴趣入口和人格、时机解释层，但不应该独立承担所有命运判断。" : "Astrology works best as an interest entry point and a layer for personality and timing, not as the entire decision engine."}</p>
              <p>{isZh ? "完整分析会把星盘与八字、紫微、塔罗、面相、手相和 AM16 行为画像合并，减少单一体系的偏差。" : "The full reading combines astrology with Bazi, Ziwei, tarot, face reading, palm reading, and AM16 to reduce single-system bias."}</p>
              <p>{isZh ? "如果你只是想了解星座含义，可以继续浏览知识页；如果你要行动建议，应进入综合分析。" : "Use the knowledge pages for learning meanings. Use the full analysis when you need practical next actions."}</p>
            </div>
          </div>
        </ScrollReveal>

        <SEOFaq title={t("seo.astrology.faqTitle")} items={faqItems} />

        <RelatedServices heading={t("seo.astrology.relatedTitle")} services={relatedServices} />

        <ScrollReveal delay={0.3}>
          <div className="card-glass-elevated relative overflow-hidden p-10 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="mb-4 text-gold"><Telescope className="mx-auto" size={34} /></div>
              <h2 className="mb-4 font-serif text-2xl text-gold">{isZh ? "把星盘变成可执行建议" : "Turn chart signals into action"}</h2>
              <p className="mx-auto mb-8 max-w-md text-white/50">
                {isZh ? "把星盘从兴趣内容升级为可执行的综合画像。" : "Turn your birth chart from interesting content into an actionable profile."}
              </p>
              <Link
                href={localeHref("/reading/new?system=astrology")}
                className="btn-gold inline-flex items-center gap-2 px-10 py-4 text-lg"
              >
                {isZh ? "进入综合分析" : "Open full analysis"} <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
