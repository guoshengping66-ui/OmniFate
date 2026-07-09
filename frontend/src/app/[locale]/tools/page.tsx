"use client"

import Link from "next/link"
import { ArrowRight, Brain, Hand, Orbit, ScanFace, Sparkles, Stars } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"
import { safeJsonLd } from "@/utils/safeJsonLd"

const tools = [
  { icon: Brain, title: "AM16 Personality Quiz", titleZh: "AM16 性格测验", desc: "Free one-minute behavioral test. Use it as a light entry point before a full AI destiny profile.", descZh: "免费一分钟行为测试。在完整AI命运画像之前，作为轻松的入门入口。", href: "/am16", color: "from-gold/10", tag: "Free entry", tagZh: "免费入口" },
  { icon: Orbit, title: "Birth Chart", titleZh: "本命星盘", desc: "Western astrology as one signal in the complete report: planets, houses, aspects, and timing.", descZh: "西方占星作为完整报告中的一个信号：行星、宫位、相位和时机。", href: "/astrology", color: "from-blue-500/10", tag: "Astrology signal", tagZh: "占星信号" },
  { icon: Stars, title: "Full AI Profile", titleZh: "完整AI画像", desc: "Combine Bazi, Ziwei, astrology, tarot, face, palm, and AM16 into one action-oriented reading.", descZh: "融合八字、紫微、占星、塔罗、面相、手相和AM16，生成一份行动导向的综合解读。", href: "/reading/new?intent=full", color: "from-emerald-500/10", tag: "Core flow", tagZh: "核心流程" },
  { icon: Sparkles, title: "Bazi Calculator", titleZh: "八字排盘", desc: "AI-powered Four Pillars chart generation with Five Elements analysis.", descZh: "AI驱动四柱八字排盘，含五行分析。", href: "/bazi", color: "from-amber-500/10", tag: "", tagZh: "" },
  { icon: Stars, title: "Ziwei Doushu", titleZh: "紫微斗数", desc: "Purple Star Astrology chart with 12 life palaces mapping.", descZh: "紫微斗数命盘，十二宫分布与主星定位。", href: "/ziwei", color: "from-purple-500/10", tag: "", tagZh: "" },
  { icon: Sparkles, title: "Tarot Reading", titleZh: "塔罗占卜", desc: "AI tarot card interpretation with multiple spread options.", descZh: "AI塔罗牌解读，支持多种牌阵选择。", href: "/tarot", color: "from-violet-500/10", tag: "", tagZh: "" },
  { icon: ScanFace, title: "Face Reading", titleZh: "面相分析", desc: "AI face analysis for features, shape, and behavioral patterns.", descZh: "AI面相分析：五官特征、脸型与行为模式。", href: "/face-reading", color: "from-cyan-500/10", tag: "", tagZh: "" },
  { icon: Hand, title: "Palm Reading", titleZh: "手相分析", desc: "AI palm line analysis for life, head, heart, and fate lines.", descZh: "AI手相分析：生命线、智慧线、感情线和命运线解读。", href: "/palm-reading", color: "from-amber-500/10", tag: "", tagZh: "" },
  { icon: Sparkles, title: "Five Elements", titleZh: "五行分析", desc: "Discover your elemental balance and generating or overcoming cycles.", descZh: "探索你的五行平衡：相生与相克关系。", href: "/five-elements", color: "from-green-500/10", tag: "", tagZh: "" },
  { icon: Orbit, title: "Zodiac Compatibility", titleZh: "星座配对", desc: "AI-powered star sign matching for love, friendship, and work.", descZh: "AI星座配对：恋爱、友谊和工作契合度分析。", href: "/astrology/zodiac-compatibility", color: "from-pink-500/10", tag: "", tagZh: "" },
]

export default function ToolsPage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  return (
    <div className="min-h-screen px-4 pb-20 pt-24">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs items={[{ label: t("nav.tools") || "Tools" }]} currentPath={`/${locale}/tools`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Destiny Analysis Tools",
            "description": "Free AI-powered destiny analysis tools including AM16, astrology, Bazi, Ziwei, tarot, face reading, palm reading, and more.",
            "url": "https://www.khanfate.com/tools",
          })}}
        />

        <ScrollReveal>
          <div className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-gold/50">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/30" />
              {t("nav.tools") || "Tools"}
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <h1 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              {isZh ? "命运分析工具中心" : "Destiny Analysis Tools"}
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/45 md:text-base">
              {isZh
                ? "先用免费测验和单项工具建立兴趣，再进入完整 AI 综合画像。"
                : "Start with free and single-signal tools, then move into the complete AI profile when you need synthesis."}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="mb-6 border border-gold/20 bg-gold/[0.04] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/60">
                  Recommended path
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  {isZh ? "AM16 拉新，占星承接兴趣，完整报告负责付费转化" : "AM16 opens the door, astrology builds intent, the full report converts."}
                </h2>
              </div>
              <Link href={localeHref("/reading/new?intent=full")} className="btn-gold inline-flex items-center justify-center gap-2 px-5 py-3 text-sm">
                {isZh ? "生成完整画像" : "Build full profile"} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <ScrollReveal key={tool.href} delay={0.1}>
              <Link
                href={localeHref(tool.href)}
                className="card-glow group block p-6 transition-all duration-300 hover:border-gold/30"
              >
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${tool.color} via-transparent to-transparent pointer-events-none`} />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-white/10 bg-white/[0.04] text-gold transition-colors group-hover:border-gold/30">
                    <tool.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-serif font-bold text-gold transition-colors group-hover:text-gold-light">{isZh ? (tool.titleZh || tool.title) : tool.title}</h3>
                      {isZh && tool.tagZh ? <span className="border border-white/10 px-2 py-0.5 text-[10px] tracking-[0.16em] text-white/35">{tool.tagZh}</span> : tool.tag ? <span className="border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/35">{tool.tag}</span> : null}
                    </div>
                    <p className="text-sm leading-relaxed text-white/40">{isZh ? (tool.descZh || tool.desc) : tool.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-gold/60 transition-colors group-hover:text-gold">
                      {isZh ? "进入" : "Try now"} <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
