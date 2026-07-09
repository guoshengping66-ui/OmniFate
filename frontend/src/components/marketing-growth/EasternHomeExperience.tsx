"use client"

import Link from "next/link"
import { ArrowRight, Brain, HeartHandshake, MessageCircleQuestion, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { EasternPageShell } from "@/components/brand/EasternDesign"

export function EasternHomeExperience() {
  const { locale, localeHref } = useLanguage()
  const isZh = locale === "zh"
  const copy = isZh ? zhCopy : enCopy

  return (
    <EasternPageShell className="gw-live-home">
      <section className="gw-image-hero" aria-label={copy.heroAria}>
        <div className="gw-image-hero-bg" aria-hidden="true" />

        <div className="gw-image-hero-seo">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
          <p>{copy.description}</p>
        </div>

        <Link
          href={localeHref("/reading/new")}
          className="gw-hero-hit gw-hero-hit-primary"
          aria-label={copy.primary}
        />
        <Link
          href="#sample-report"
          className="gw-hero-hit gw-hero-hit-secondary"
          aria-label={copy.secondary}
        />
        <Link
          href={localeHref("/reading/new")}
          className="gw-hero-hit gw-hero-hit-pattern"
          aria-label={copy.corePattern}
        />
        <Link
          href={localeHref("/reading/new")}
          className="gw-hero-hit gw-hero-hit-opportunity"
          aria-label={copy.nextOpportunity}
        />
        <Link
          href={localeHref("/daily")}
          className="gw-hero-hit gw-hero-hit-action"
          aria-label={copy.todayAction}
        />
      </section>

      <section className="gw-scroll-section" id="sample-report">
        <div className="gw-scroll-intro">
          <span>{copy.afterEyebrow}</span>
          <h2>{copy.afterTitle}</h2>
          <p>{copy.afterDesc}</p>
        </div>

        <div className="gw-scroll-grid">
          {copy.reportItems.map(item => (
            <article className="gw-scroll-card" key={item.title}>
              <span>{item.kicker}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gw-path-section">
        <div className="gw-path-panel">
          <div>
            <span>{copy.pathEyebrow}</span>
            <h2>{copy.pathTitle}</h2>
            <p>{copy.pathDesc}</p>
          </div>
          <div className="gw-path-line">
            {copy.timeline.map(item => (
              <div key={item.year}>
                <strong>{item.year}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gw-entry-section">
        {copy.entries.map(entry => (
          <Link href={localeHref(entry.href)} className="gw-entry-card" key={entry.title}>
            <entry.icon size={25} />
            <h3>{entry.title}</h3>
            <p>{entry.body}</p>
            <span>{entry.cta}<ArrowRight size={15} /></span>
          </Link>
        ))}
      </section>
    </EasternPageShell>
  )
}

const zhCopy = {
  heroAria: "观我首页首屏",
  title: "观我",
  subtitle: "在星河命盘中，看见自己的下一步",
  description: "AI-powered personal insight system combining ancient wisdom and modern analysis to reveal your hidden patterns, life rhythm, and next opportunities.",
  primary: "生成我的个人档案",
  secondary: "查看示例报告",
  corePattern: "查看核心结构",
  nextOpportunity: "查看未来机会窗口",
  todayAction: "查看今日行动",
  afterEyebrow: "Personal Archive",
  afterTitle: "把首屏的星河命盘，延展成一份可阅读的个人档案",
  afterDesc: "首页下方不再堆功能卡片，而是沿用卷轴、星轨与暗金线条，解释观我能给用户看到什么，以及为什么值得开始。",
  reportItems: [
    { kicker: "Core Pattern", title: "核心结构", body: "看清你的先天倾向、稳定优势和容易反复消耗的位置。" },
    { kicker: "Next Opportunity", title: "未来窗口", body: "以阶段和趋势呈现事业、财富、关系中的关键机会，而不是承诺固定结果。" },
    { kicker: "Today's Action", title: "今日行动", body: "把复杂分析收束成今天最值得推进的一步，降低决策噪音。" },
  ],
  pathEyebrow: "Ten-Year Map",
  pathTitle: "未来十年不是结论，而是路径",
  pathDesc: "观我会把长期趋势拆成几个关键阶段，标记适合积累、推进、调整和转型的窗口。",
  timeline: [
    { year: "2026", label: "Foundation" },
    { year: "2028", label: "Expansion" },
    { year: "2030", label: "Opportunity" },
    { year: "2033", label: "New Cycle" },
  ],
  entries: [
    { icon: Brain, title: "完整观我报告", body: "系统查看性格结构、事业财富、关系模式与未来窗口。", cta: "生成报告", href: "/reading/new" },
    { icon: MessageCircleQuestion, title: "单主题快问", body: "针对感情、事业、财富或选择题，获得一次快速分析。", cta: "提出问题", href: "/ask" },
    { icon: HeartHandshake, title: "关系合参", body: "分析两个人之间的吸引点、冲突点和相处方式。", cta: "开始合参", href: "/compatibility" },
  ],
}

const enCopy = {
  heroAria: "Guanwo homepage hero",
  title: "Guanwo",
  subtitle: "See your next move inside a cosmic personal archive",
  description: "AI-powered personal insight system combining ancient wisdom and modern analysis to reveal your hidden patterns, life rhythm, and next opportunities.",
  primary: "Generate My Archive",
  secondary: "View Sample Report",
  corePattern: "View core pattern",
  nextOpportunity: "View next opportunity",
  todayAction: "View today's action",
  afterEyebrow: "Personal Archive",
  afterTitle: "Turn the cosmic chart into a readable personal archive",
  afterDesc: "The sections below extend the same scroll, star-map, and antique-gold language instead of falling back to generic feature cards.",
  reportItems: [
    { kicker: "Core Pattern", title: "Core Pattern", body: "Understand your baseline tendencies, durable strengths, and repeating friction points." },
    { kicker: "Next Opportunity", title: "Next Opportunity", body: "View work, money, and relationship windows as stages and trends, not guaranteed outcomes." },
    { kicker: "Today's Action", title: "Today's Action", body: "Compress the analysis into one practical move that reduces decision noise today." },
  ],
  pathEyebrow: "Ten-Year Map",
  pathTitle: "The next decade as a path, not a promise",
  pathDesc: "Guanwo turns long-range patterns into key stages for foundation, expansion, adjustment, and renewal.",
  timeline: [
    { year: "2026", label: "Foundation" },
    { year: "2028", label: "Expansion" },
    { year: "2030", label: "Opportunity" },
    { year: "2033", label: "New Cycle" },
  ],
  entries: [
    { icon: Brain, title: "Full Archive", body: "Understand personality, work, wealth, relationship patterns, and future windows.", cta: "Generate", href: "/reading/new" },
    { icon: MessageCircleQuestion, title: "Focus Reading", body: "Ask one concrete question about love, work, money, or a decision.", cta: "Ask", href: "/ask" },
    { icon: HeartHandshake, title: "Relationship", body: "Explore attraction, friction, communication, and long-term rhythm.", cta: "Compare", href: "/compatibility" },
  ],
}
