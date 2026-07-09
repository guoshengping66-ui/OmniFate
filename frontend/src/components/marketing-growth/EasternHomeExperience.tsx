"use client"

import Link from "next/link"
import { ArrowRight, Brain, HeartHandshake, MessageCircleQuestion, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { EasternPageShell } from "@/components/brand/EasternDesign"

const trigrams = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"]
const orbitQuestionsZh = ["我真正的性格底色是什么？", "事业适合走哪条路？", "关系里为什么反复消耗？", "今天最该推进什么？"]
const orbitQuestionsEn = ["What patterns shape me?", "Which path fits my work?", "Why do relationships drain me?", "What should move today?"]

export function EasternHomeExperience() {
  const { locale, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const copy = isZh ? zhCopy : enCopy
  const questions = isZh ? orbitQuestionsZh : orbitQuestionsEn

  return (
    <EasternPageShell className="gw-live-home">
      <section className="gw-live-hero">
        <div className="gw-live-bg" aria-hidden="true">
          <div className="gw-live-milkyway" />
          <div className="gw-live-stars" />
          <div className="gw-live-mountains" />
        </div>

        <div className="gw-live-hero-inner">
          <div className="gw-live-copy">
            <div className="gw-live-eyebrow">
              <Sparkles size={15} />
              <span>{copy.eyebrow}</span>
            </div>
            <h1>{copy.title}</h1>
            <p className="gw-live-subtitle">{copy.subtitle}</p>
            <p className="gw-live-description">{copy.description}</p>

            <div className="gw-live-tags" aria-label={copy.tagLabel}>
              {copy.tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>

            <div className="gw-live-actions">
              <Link href={localeHref("/reading/new")} className="gw-live-primary">
                {copy.primary}
                <ArrowRight size={18} />
              </Link>
              <Link href="#sample-report" className="gw-live-secondary">
                {copy.secondary}
              </Link>
            </div>

            <div className="gw-live-trust">
              <span>{copy.trustA}</span>
              <span>{copy.trustB}</span>
              <span>{copy.trustC}</span>
            </div>
          </div>

          <div className="gw-live-visual" aria-label={copy.visualLabel}>
            <CosmicBaguaInstrument />
          </div>
        </div>
      </section>

      <section className="gw-live-section gw-live-question-section">
        <div className="gw-live-section-head">
          <span>{copy.questionsEyebrow}</span>
          <h2>{copy.questionsTitle}</h2>
          <p>{copy.questionsDesc}</p>
        </div>
        <div className="gw-live-question-orbit">
          <div className="gw-live-question-core">
            <strong>{copy.archive}</strong>
            <small>{copy.archiveSub}</small>
          </div>
          {questions.map((question, index) => (
            <Link
              key={question}
              href={localeHref(index === 3 ? "/daily" : "/reading/new")}
              className={`gw-live-question gw-live-question-${index + 1}`}
            >
              <span>0{index + 1}</span>
              {question}
            </Link>
          ))}
        </div>
      </section>

      <section id="sample-report" className="gw-live-section gw-live-report-section">
        <div className="gw-live-report-copy">
          <span>{copy.reportEyebrow}</span>
          <h2>{copy.reportTitle}</h2>
          <p>{copy.reportDesc}</p>
          <Link href={localeHref("/reading/new")} className="gw-live-text-link">
            {copy.reportCta}
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="gw-live-report-card">
          <div className="gw-live-report-top">
            <span>{copy.previewLabel}</span>
            <strong>87%</strong>
          </div>
          {copy.reportItems.map(item => (
            <div className="gw-live-report-row" key={item.title}>
              <span>{item.title}</span>
              <p>{item.body}</p>
            </div>
          ))}
          <div className="gw-live-timeline">
            {copy.timeline.map(item => (
              <div key={item.year}>
                <strong>{item.year}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gw-live-section gw-live-entry-section">
        {copy.entries.map(entry => (
          <Link href={localeHref(entry.href)} className="gw-live-entry" key={entry.title}>
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

function CosmicBaguaInstrument() {
  return (
    <div className="gw-live-disc">
      <div className="gw-live-disc-glow" />
      <div className="gw-live-ring gw-live-ring-1" />
      <div className="gw-live-ring gw-live-ring-2" />
      <div className="gw-live-ring gw-live-ring-3" />
      <div className="gw-live-disc-lines" />
      <div className="gw-live-yinyang">
        <i />
      </div>
      <div className="gw-live-bagua">
        {trigrams.map((mark, index) => (
          <span key={mark} className={`gw-live-gua gw-live-gua-${index + 1}`}>{mark}</span>
        ))}
      </div>
      <div className="gw-live-data-card gw-live-data-card-a">
        <span>Pattern</span>
        <strong>Strategic Creator</strong>
      </div>
      <div className="gw-live-data-card gw-live-data-card-b">
        <span>Next Move</span>
        <strong>Focus before expansion</strong>
      </div>
    </div>
  )
}

const zhCopy = {
  eyebrow: "东方星图档案系统",
  title: "观我",
  subtitle: "在星河命盘中，看见自己的下一步",
  description: "一个 AI 个人洞察系统，将东方智慧、人格结构与行动建议整理成可阅读、可复盘、可执行的个人档案。",
  tagLabel: "观我能力标签",
  tags: ["星河命盘", "太极八卦", "AI 合参", "今日行动"],
  primary: "生成我的个人档案",
  secondary: "查看示例报告",
  trustA: "AI 多维分析",
  trustB: "不承诺结果",
  trustC: "只提供行动参考",
  visualLabel: "银河八卦命盘仪",
  questionsEyebrow: "Question Orbit",
  questionsTitle: "先回答真正影响你的问题",
  questionsDesc: "用户进入观我，不是为了看功能列表，而是想知道自己为什么反复卡住，以及今天该做什么。",
  archive: "观我档案",
  archiveSub: "Personal Archive",
  reportEyebrow: "Report Preview",
  reportTitle: "付费后看到的不是概念，而是一份真实档案",
  reportDesc: "核心结论、人格结构、事业方向、关系模式、未来窗口和今日行动，会以清楚的层级呈现。",
  reportCta: "生成完整报告",
  previewLabel: "Personal Archive Preview",
  reportItems: [
    { title: "核心结构", body: "外在稳定，内在高敏，适合在复杂问题中建立秩序。" },
    { title: "事业方向", body: "适合判断力、表达力和系统构建能力并重的项目。" },
    { title: "关系模式", body: "容易被强烈情绪吸引，长期关系更需要稳定反馈。" },
    { title: "今日行动", body: "先完成一个能带来明确反馈的任务，再处理复杂决策。" },
  ],
  timeline: [
    { year: "2026", label: "Foundation" },
    { year: "2028", label: "Expansion" },
    { year: "2030", label: "Transform" },
  ],
  entries: [
    { icon: Brain, title: "完整观我报告", body: "系统查看性格结构、事业财富、关系模式与未来窗口。", cta: "生成报告", href: "/reading/new" },
    { icon: MessageCircleQuestion, title: "单主题快问", body: "针对感情、事业、财富或选择题，获得一次快速分析。", cta: "提出问题", href: "/ask" },
    { icon: HeartHandshake, title: "关系合参", body: "分析两个人之间的吸引点、冲突点和相处方式。", cta: "开始合参", href: "/compatibility" },
  ],
}

const enCopy = {
  eyebrow: "Eastern Star Archive System",
  title: "Guanwo",
  subtitle: "Discover your hidden patterns in a cosmic personal archive",
  description: "An AI-powered personal insight system combining ancient wisdom, personality layers, and action guidance into one readable archive.",
  tagLabel: "Guanwo feature tags",
  tags: ["Cosmic Chart", "Bagua Logic", "AI Synthesis", "Daily Action"],
  primary: "Generate My Archive",
  secondary: "View Sample Report",
  trustA: "Multi-layer AI analysis",
  trustB: "No guaranteed outcomes",
  trustC: "Decision support only",
  visualLabel: "Cosmic Bagua instrument",
  questionsEyebrow: "Question Orbit",
  questionsTitle: "Start with the questions that shape your decisions",
  questionsDesc: "Guanwo is not a feature list. It helps users understand repeating patterns and choose the next practical move.",
  archive: "Guanwo Archive",
  archiveSub: "Personal Insight",
  reportEyebrow: "Report Preview",
  reportTitle: "Show the value before asking users to pay",
  reportDesc: "Core conclusions, personality structure, work direction, relationship patterns, future windows, and daily action are shown in a clear hierarchy.",
  reportCta: "Generate Full Report",
  previewLabel: "Personal Archive Preview",
  reportItems: [
    { title: "Core Pattern", body: "Calm on the outside, highly sensitive inside; strong at building order from complexity." },
    { title: "Career Direction", body: "Best suited for projects that combine judgment, expression, and system building." },
    { title: "Relationship Pattern", body: "Drawn to strong emotion, but long-term bonds need steady feedback." },
    { title: "Daily Action", body: "Finish one task with clear feedback before handling complex decisions." },
  ],
  timeline: [
    { year: "2026", label: "Foundation" },
    { year: "2028", label: "Expansion" },
    { year: "2030", label: "Transform" },
  ],
  entries: [
    { icon: Brain, title: "Full Archive", body: "Understand personality, work, wealth, relationship patterns, and future windows.", cta: "Generate", href: "/reading/new" },
    { icon: MessageCircleQuestion, title: "Focus Reading", body: "Ask one concrete question about love, work, money, or a decision.", cta: "Ask", href: "/ask" },
    { icon: HeartHandshake, title: "Relationship", body: "Explore attraction, friction, communication, and long-term rhythm.", cta: "Compare", href: "/compatibility" },
  ],
}
