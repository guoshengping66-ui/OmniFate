"use client"

import Link from "next/link"
import { ArrowRight, Brain, HeartHandshake, MessageCircleQuestion } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { EasternPageShell } from "@/components/brand/EasternDesign"

export function EasternHomeExperience() {
  const { locale, localeHref } = useLanguage()
  const isZh = locale === "zh"
  const copy = isZh ? zhCopy : enCopy

  return (
    <EasternPageShell className="gw-live-home">
      <section className="gw-image-hero gw-hero-composed" aria-label={copy.heroAria}>
        <div className="gw-image-hero-bg" aria-hidden="true" />
        <div className="gw-hero-veil gw-hero-veil-left" aria-hidden="true" />
        <div className="gw-hero-veil gw-hero-veil-scroll" aria-hidden="true" />
        <div className="gw-hero-star-motion" aria-hidden="true" />
        <div className="gw-hero-orbit-motion" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="gw-hero-brandmark" aria-label={copy.brandLabel}>
          <div className="gw-hero-seal" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>{copy.title}</strong>
            <small>GUANWO</small>
          </div>
        </div>

        <div className="gw-hero-real-copy">
          <h1>{copy.title}</h1>
          <p className="gw-hero-real-subtitle">{copy.subtitle}</p>
          <p className="gw-hero-real-desc">{copy.description}</p>

          <div className="gw-hero-real-tags" aria-label={copy.tagLabel}>
            {copy.tags.map(tag => (
              <span key={tag}>
                <i aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>

          <div className="gw-hero-real-actions">
            <Link href={localeHref("/reading/new")} className="gw-hero-real-primary">
              {copy.primary}
              <ArrowRight size={18} />
            </Link>
            <Link href="#sample-report" className="gw-hero-real-secondary">
              {copy.secondary}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="gw-hero-scroll-panel" aria-label={copy.previewLabel}>
          {copy.heroPreview.map(item => (
            <Link href={localeHref(item.href)} className="gw-hero-scroll-item" key={item.title}>
              <span className="gw-hero-scroll-icon" aria-hidden="true" />
              <div>
                <strong>{item.title}</strong>
                <small>{item.body}</small>
              </div>
            </Link>
          ))}
        </div>
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
  brandLabel: "观我 Guanwo",
  title: "观我",
  subtitle: "在星河命盘中，看见自己的下一步",
  description: "融合东方命盘、人格结构与 AI 多维分析，生成你的个人档案、未来窗口与今日行动建议。",
  tagLabel: "观我能力标签",
  tags: ["星河命盘", "东方结构", "AI 合参", "今日行动"],
  primary: "生成我的个人档案",
  secondary: "查看示例报告",
  previewLabel: "报告预览入口",
  heroPreview: [
    { title: "核心结构", body: "你的长期节奏与稳定优势", href: "/reading/new" },
    { title: "未来窗口", body: "下一阶段更适合推进的方向", href: "/reading/new" },
    { title: "今日行动", body: "今天最值得完成的一步", href: "/almanac" },
  ],
  afterEyebrow: "个人档案",
  afterTitle: "从星河命盘，进入一份真正可阅读的个人档案",
  afterDesc: "观我把复杂的命盘、人格和问题分析整理成清楚的档案结构，让用户先看懂自己，再决定下一步行动。",
  reportItems: [
    { kicker: "Core Pattern", title: "核心结构", body: "看清你的先天倾向、稳定优势和容易反复消耗的位置。" },
    { kicker: "Next Opportunity", title: "未来窗口", body: "以阶段和趋势呈现事业、财富、关系中的关键机会，而不是承诺固定结果。" },
    { kicker: "Today's Action", title: "今日行动", body: "把复杂分析收束成今天最值得推进的一步，降低决策噪音。" },
  ],
  pathEyebrow: "十年路径",
  pathTitle: "未来十年不是结论，而是路径",
  pathDesc: "观我会把长期趋势拆成几个关键阶段，标记适合积累、推进、调整和转型的窗口。",
  timeline: [
    { year: "2026", label: "积累" },
    { year: "2028", label: "推进" },
    { year: "2030", label: "机会" },
    { year: "2033", label: "新周期" },
  ],
  entries: [
    { icon: Brain, title: "完整观我报告", body: "系统查看性格结构、事业财富、关系模式与未来窗口。", cta: "生成报告", href: "/reading/new" },
    { icon: MessageCircleQuestion, title: "单主题快问", body: "针对感情、事业、财富或选择题，获得一次快速分析。", cta: "提出问题", href: "/divination" },
    { icon: HeartHandshake, title: "关系合参", body: "分析两个人之间的吸引点、冲突点和相处方式。", cta: "开始合参", href: "/reading/new" },
  ],
}

const enCopy = {
  heroAria: "Guanwo homepage hero",
  brandLabel: "Guanwo",
  title: "Guanwo",
  subtitle: "See your next move inside a cosmic personal archive",
  description: "AI-powered personal insight system combining ancient wisdom and modern analysis to reveal your hidden patterns, life rhythm, and next opportunities.",
  tagLabel: "Guanwo feature tags",
  tags: ["AI Insight", "Cosmic Archive", "Eastern Pattern", "Daily Action"],
  primary: "Generate My Archive",
  secondary: "View Sample Report",
  previewLabel: "Report preview links",
  heroPreview: [
    { title: "Core Pattern", body: "Your baseline structure and energy traits", href: "/reading/new" },
    { title: "Next Opportunity", body: "Opportunity window for the next 30 days", href: "/reading/new" },
    { title: "Today’s Action", body: "The most useful action for today", href: "/almanac" },
  ],
  afterEyebrow: "Personal Archive",
  afterTitle: "Turn the cosmic chart into a readable personal archive",
  afterDesc: "Guanwo turns charts, personality layers, and real questions into a clear archive so users understand themselves before choosing the next move.",
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
    { icon: MessageCircleQuestion, title: "Focus Reading", body: "Ask one concrete question about love, work, money, or a decision.", cta: "Ask", href: "/divination" },
    { icon: HeartHandshake, title: "Relationship", body: "Explore attraction, friction, communication, and long-term rhythm.", cta: "Compare", href: "/reading/new" },
  ],
}
