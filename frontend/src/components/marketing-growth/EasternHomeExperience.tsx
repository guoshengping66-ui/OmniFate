"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  Archive,
  Brain,
  CalendarDays,
  Compass,
  HeartHandshake,
  Layers3,
  LineChart,
  MessageCircleQuestion,
  Moon,
  Radar,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Users,
  Zap,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { EasternPageShell } from "@/components/brand/EasternDesign"

export function EasternHomeExperience() {
  const { locale, localeHref } = useLanguage()
  const isZh = locale === "zh"
  const [skyMode, setSkyMode] = useState<"night" | "day">("night")

  useEffect(() => {
    const saved = window.localStorage.getItem("guanwo-sky-mode")
    if (saved === "day" || saved === "night") setSkyMode(saved)
  }, [])

  const toggleSkyMode = () => {
    const next = skyMode === "night" ? "day" : "night"
    setSkyMode(next)
    window.localStorage.setItem("guanwo-sky-mode", next)
  }

  const copy = isZh
    ? {
        ...zhCopy,
        tags: ["星河命盘", "太极八卦", "AI 合参"],
        heroTitle: "观我",
        heroKicker: "在星河命盘中，看见自己的下一步",
        heroDesc: "融合八字、星盘、塔罗、面相与手相，生成你的个人结构档案与未来行动建议。",
        questionsDesc: "先回答最影响你当下决策的问题。",
        questions: ["我真正的性格底色是什么？", "为什么我总在关系里消耗？", "事业适合走哪条路径？", "今天最该推进什么？"],
        reportModules: [
          { title: "性格结构", body: "看清稳定优势和容易卡住的位置。" },
          { title: "事业方向", body: "找到更适合你的能力使用方式。" },
          { title: "今日行动", body: "把分析落成今天的一步。" },
        ],
        vaultDesc: "根据你的状态推荐空间、饰品与仪式感物件。",
        finalDesc: "生成档案，查看结构、关系和今日行动。",
      }
    : {
        ...enCopy,
        tags: ["Milky Way Map", "Bagua Field", "AI Synthesis"],
        heroTitle: "Guanwo",
        heroKicker: "Read your next move inside the galaxy",
        heroDesc: "A personal chart dossier built from I Ching patterns, Bazi, astrology, tarot, face reading, palm reading, and daily action guidance.",
        questionsDesc: "Start with the questions that affect today's decisions.",
        questions: ["What is my real baseline?", "Why do I repeat relationship drain?", "Which career path fits?", "What should move today?"],
        reportModules: [
          { title: "Inner structure", body: "See strengths and friction points." },
          { title: "Career direction", body: "Find the right way to use your abilities." },
          { title: "Daily action", body: "Turn insight into one move today." },
        ],
        vaultDesc: "Objects for space, personal rhythm, and daily ritual.",
        finalDesc: "Generate your dossier for structure, relationships, and daily action.",
      }
  const homeCopy = isZh ? zhHomeCopy : enHomeCopy

  return (
    <EasternPageShell className={`gw-home-theme gw-theme-${skyMode}`}>
      <section className="gw-hero-section min-h-[780px] w-full py-10 lg:py-16">
        <OrientalSkyAtlas mode={skyMode} />
        <div className="relative z-10 mx-auto grid min-h-[700px] w-[min(1180px,calc(100vw-32px))] items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="max-w-2xl">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {homeCopy.heroTags.map(tag => <span key={tag} className="gw-hero-tag">{tag}</span>)}
              <button type="button" className="gw-sky-toggle" onClick={toggleSkyMode} aria-label={isZh ? "切换昼夜模式" : "Toggle day and night mode"}>
                {skyMode === "night" ? <Moon size={14} /> : <Sun size={14} />}
                <span>{skyMode === "night" ? (isZh ? "夜观" : "Night") : (isZh ? "昼观" : "Day")}</span>
              </button>
            </div>
            <h1 className={`gw-hero-brand ${isZh ? "" : "gw-hero-brand-en"}`}>
              {homeCopy.heroTitle}
            </h1>
            <p className="gw-hero-kicker">{homeCopy.heroKicker}</p>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">{homeCopy.heroDesc}</p>
            <div className="gw-powered-row" aria-label={homeCopy.poweredByLabel}>
              <span>{homeCopy.poweredByLabel}</span>
              {homeCopy.poweredBy.map(item => <strong key={item}>{item}</strong>)}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={localeHref("/reading/new")} className="ow-gold-button">{homeCopy.primary}<ArrowRight size={17} /></Link>
              <Link href="#sample-report" className="ow-ghost-button">{homeCopy.secondary}<ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="gw-hero-visual-spacer" aria-hidden="true" />
        </div>
      </section>

      <ArchiveShowcase copy={homeCopy} />
      <HowItWorks copy={homeCopy} />
      <QuestionOrbit copy={homeCopy} />
      <PatternLayers copy={homeCopy} />
      <DailyActionPanel copy={homeCopy} />
      <FutureWindows copy={homeCopy} />
      <ProductPaths copy={homeCopy} localeHref={localeHref} />
      <LifestyleVault copy={homeCopy} />

      <section className="gw-final-cta">
        <Sparkles className="mx-auto text-[var(--color-gold)]" size={32} />
        <h2>{homeCopy.finalTitle}</h2>
        <p>{homeCopy.finalDesc}</p>
        <Link href={localeHref("/reading/new")} className="ow-gold-button mt-8">{homeCopy.primary}<ArrowRight size={17} /></Link>
      </section>
    </EasternPageShell>
  )
}

const zhHomeCopy = {
  heroTags: ["个人洞察系统", "东方星图", "AI 档案", "夜观"],
  heroTitle: "观我",
  heroKicker: "在星河命盘中，看见自己的下一步",
  heroDesc: "观我把东方哲学、星图结构与 AI 分析整理成一份个人档案，帮助你看清性格底层、关系模式、事业方向和当下最该推进的行动。",
  poweredByLabel: "基于",
  poweredBy: ["出生结构", "星图节奏", "象征分析", "人格洞察"],
  primary: "生成我的个人档案",
  secondary: "查看示例报告",
  reportEyebrow: "付费前先看清价值",
  reportTitle: "你得到的不是一句结论，而是一份可阅读的个人档案",
  reportDesc: "报告会把复杂分析拆成总览结论、性格结构、事业财富、关系模式、未来窗口和今日行动。",
  reportStats: ["87% 结构清晰度", "2027-2029 成长窗口", "今日 1 个关键行动"],
  reportModules: [
    ["核心模式", "外在稳定，内在敏感，适合在复杂问题中建立秩序。"],
    ["事业方向", "适合判断、表达和系统构建并重的长期项目。"],
    ["关系模式", "需要稳定反馈，避免在高情绪关系里反复消耗。"],
    ["行动建议", "先完成一个能带来确定反馈的任务，再处理复杂决策。"],
  ],
  howEyebrow: "它如何工作",
  howTitle: "把神秘感变成可理解的分析流程",
  howSteps: [
    ["输入个人资料", "只收集生成档案所需的信息，并可随时校准。"],
    ["AI 多层合参", "从长期结构、心理倾向、当下问题和行为模式交叉判断。"],
    ["生成行动档案", "输出今天可执行的一步，以及未来阶段的机会窗口。"],
  ],
  questionsEyebrow: "从真实问题开始",
  questionsTitle: "点击一个问题，先看到你会得到怎样的回答",
  questions: [
    ["我真正的性格底色是什么？", "系统会先提炼你的核心模式，而不是给出笼统标签。"],
    ["我的事业适合走哪条路径？", "从能力使用方式、环境偏好和阶段窗口里寻找方向。"],
    ["我的财富机会在哪个阶段？", "标记适合积累、推进和谨慎判断的时间段。"],
    ["今天最适合推进什么？", "把长期档案落到一个明确、可执行的今日行动。"],
  ],
  layersEyebrow: "个人模式层",
  layersTitle: "五层信息，不再只看单一结果",
  layersDesc: "东方来源被转译成用户能理解的分析层：结构、心理、象征、表达和行动。",
  layers: [
    ["Birth Pattern", "长期结构与人生节奏"],
    ["Cosmic Personality", "心理模式与关系倾向"],
    ["Symbolic Reflection", "当下问题与选择倾向"],
    ["Visual Expression", "外显气质与行为印象"],
    ["Behavior Path", "行动习惯与发展轨迹"],
  ],
  dailyEyebrow: "长期留存核心",
  dailyTitle: "每天回来，不是看模板，而是看你的今日行动",
  dailyTheme: "今日主题：稳步推进，不急于证明",
  dailyItems: ["最适合：完成一件能带来明确反馈的任务", "避免：临时改变方向或冲动承诺", "时间窗口：14:00 - 17:00"],
  timelineEyebrow: "未来窗口",
  timelineTitle: "把未来十年看成一条可调整的星河路径",
  timeline: [
    ["2026", "Foundation", "稳定积累，建立秩序"],
    ["2028", "Expansion", "事业推进窗口"],
    ["2030", "Wealth Window", "财富判断与资源整合"],
    ["2033", "New Cycle", "身份与关系节奏重组"],
  ],
  entryEyebrow: "选择路径",
  entryTitle: "不同问题，用不同深度的分析方式",
  entries: [
    { icon: Brain, title: "完整观我报告", body: "系统查看性格结构、事业财富、关系模式和未来窗口。", cta: "生成完整报告", href: "/reading/new" },
    { icon: MessageCircleQuestion, title: "单主题快问", body: "针对感情、事业、财富或选择题获得一次快速分析。", cta: "提出一个问题", href: "/reading/new?intent=quick" },
    { icon: HeartHandshake, title: "关系合参", body: "分析两个人之间的吸引点、冲突点和相处方式。", cta: "开始关系合参", href: "/reading/new?intent=relationship" },
  ],
  vaultEyebrow: "Lifestyle Vault",
  vaultTitle: "藏宝阁不是玄学货架，而是状态匹配的生活方式推荐",
  vaultDesc: "根据你的性格结构、情绪状态与生活节律，推荐更适合空间、专注、睡眠与日常仪式感的物件。",
  vaultTags: ["情绪稳定", "专注提升", "睡眠节律", "空间氛围", "日常仪式感"],
  finalTitle: "从今天开始，看懂自己的下一步",
  finalDesc: "生成你的观我档案，查看性格结构、关系模式、事业方向与今日行动建议。",
}

const enHomeCopy = {
  heroTags: ["Personal Insight", "Cosmic Archive", "AI Analysis", "Night Mode"],
  heroTitle: "Discover Your Hidden Patterns",
  heroKicker: "An AI-powered personal insight system",
  heroDesc: "Guanwo combines ancient wisdom and modern analysis to reveal your personality structure, life patterns, relationship tendencies, and next opportunities.",
  poweredByLabel: "Powered by",
  poweredBy: ["Birth Pattern", "Astrology", "Symbolic Analysis", "Personality Insights"],
  primary: "Generate My Archive",
  secondary: "View Sample Report",
  reportEyebrow: "See the value first",
  reportTitle: "Not a single prediction, but a readable personal archive",
  reportDesc: "Your report turns complex analysis into core findings, personality structure, career direction, relationship patterns, future windows, and daily action.",
  reportStats: ["87% Pattern Clarity", "2027-2029 Growth Window", "1 Key Action Today"],
  reportModules: [
    ["Core Pattern", "Calm on the surface, sensitive underneath, strong at building order."],
    ["Career Direction", "Best suited for work that combines judgment, expression, and systems."],
    ["Relationship Pattern", "Needs steady feedback and less emotional over-consumption."],
    ["Daily Action", "Finish one task with clear feedback before complex decisions."],
  ],
  howEyebrow: "How It Works",
  howTitle: "A clear process behind a mysterious experience",
  howSteps: [
    ["Enter Your Data", "Provide only what is needed to generate and calibrate your archive."],
    ["AI Synthesizes Layers", "Multiple insight layers are cross-read for stronger signal."],
    ["Receive Your Archive", "Get one action for today and key windows for the next stage."],
  ],
  questionsEyebrow: "Start With Real Questions",
  questionsTitle: "Choose a question and see the kind of answer you will receive",
  questions: [
    ["What is my core personality pattern?", "The system extracts your baseline instead of generic labels."],
    ["Which career path fits me?", "Direction is mapped from ability use, environment, and timing."],
    ["Where are my wealth windows?", "The archive marks accumulation, expansion, and caution phases."],
    ["What should move today?", "Long-term insight becomes one clear action for today."],
  ],
  layersEyebrow: "Pattern Layers",
  layersTitle: "Five layers, not one isolated reading",
  layersDesc: "Eastern sources are translated into readable layers: structure, psychology, symbols, expression, and behavior.",
  layers: [
    ["Birth Pattern", "Long-term structure and rhythm"],
    ["Cosmic Personality", "Psychology and relationship tendencies"],
    ["Symbolic Reflection", "Current question and choice tendency"],
    ["Visual Expression", "External style and behavioral impression"],
    ["Behavior Path", "Habits and development trajectory"],
  ],
  dailyEyebrow: "Daily Retention",
  dailyTitle: "Return each day for your real daily action, not a rotating template",
  dailyTheme: "Today: steady progress, no need to prove yourself",
  dailyItems: ["Best for: finish one task with clear feedback", "Avoid: changing direction impulsively", "Window: 14:00 - 17:00"],
  timelineEyebrow: "Future Windows",
  timelineTitle: "See the next decade as an adjustable galaxy path",
  timeline: [
    ["2026", "Foundation", "Build stability and order"],
    ["2028", "Expansion", "Career growth window"],
    ["2030", "Wealth Window", "Resource and judgment phase"],
    ["2033", "New Cycle", "Identity and relationship reset"],
  ],
  entryEyebrow: "Choose Your Path",
  entryTitle: "Different questions need different depth",
  entries: [
    { icon: Brain, title: "Full Guanwo Report", body: "See personality, career, wealth, relationships, and future windows.", cta: "Generate Report", href: "/reading/new" },
    { icon: MessageCircleQuestion, title: "Focus Reading", body: "Ask one specific question about love, career, money, or choices.", cta: "Ask a Question", href: "/reading/new?intent=quick" },
    { icon: HeartHandshake, title: "Relationship Synthesis", body: "Understand attraction, friction, and how two people relate.", cta: "Start Relationship", href: "/reading/new?intent=relationship" },
  ],
  vaultEyebrow: "Lifestyle Vault",
  vaultTitle: "Not a mystic shop, but lifestyle recommendations matched to your state",
  vaultDesc: "Recommendations for space, focus, sleep rhythm, and daily ritual based on your personality structure and current state.",
  vaultTags: ["Emotional Stability", "Focus", "Sleep Rhythm", "Space Atmosphere", "Daily Ritual"],
  finalTitle: "Start with one clearer next step",
  finalDesc: "Generate your Guanwo archive to see personality structure, relationship patterns, career direction, and today's action.",
}

function ArchiveShowcase({ copy }: { copy: typeof zhHomeCopy }) {
  return (
    <section id="sample-report" className="gw-section gw-report-showcase">
      <div className="gw-section-copy">
        <span className="gw-section-kicker">{copy.reportEyebrow}</span>
        <h2>{copy.reportTitle}</h2>
        <p>{copy.reportDesc}</p>
      </div>
      <div className="gw-report-grid">
        <div className="gw-report-list">
          {copy.reportModules.map(([title, body]) => (
            <article key={title} className="gw-soft-card">
              <Archive size={18} />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="gw-archive-card">
          <div className="gw-archive-top">
            <span>Your Personal Archive</span>
            <strong>Guanwo</strong>
          </div>
          <div className="gw-archive-radar">
            <i /><i /><i />
            <Radar size={74} />
          </div>
          <div className="gw-report-stats">
            {copy.reportStats.map(stat => <span key={stat}>{stat}</span>)}
          </div>
          <div className="gw-mini-timeline">
            <b />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks({ copy }: { copy: typeof zhHomeCopy }) {
  return (
    <section className="gw-section">
      <div className="gw-section-copy gw-section-copy-center">
        <span className="gw-section-kicker">{copy.howEyebrow}</span>
        <h2>{copy.howTitle}</h2>
      </div>
      <div className="gw-how-grid">
        {copy.howSteps.map(([title, body], index) => (
          <article key={title} className="gw-how-step">
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function QuestionOrbit({ copy }: { copy: typeof zhHomeCopy }) {
  const [active, setActive] = useState(0)
  const selected = copy.questions[active]

  return (
    <section className="gw-section gw-question-section">
      <div className="gw-section-copy">
        <span className="gw-section-kicker">{copy.questionsEyebrow}</span>
        <h2>{copy.questionsTitle}</h2>
      </div>
      <div className="gw-question-orbit">
        <div className="gw-question-core">
          <Compass size={34} />
          <strong>Guanwo Archive</strong>
        </div>
        {copy.questions.map(([question], index) => (
          <button key={question} type="button" className={`gw-question-node gw-question-node-${index + 1} ${active === index ? "is-active" : ""}`} onClick={() => setActive(index)}>
            {question}
          </button>
        ))}
        <div className="gw-question-preview">
          <span>Preview</span>
          <h3>{selected[0]}</h3>
          <p>{selected[1]}</p>
        </div>
      </div>
    </section>
  )
}

function PatternLayers({ copy }: { copy: typeof zhHomeCopy }) {
  return (
    <section className="gw-section gw-layer-section">
      <div className="gw-section-copy">
        <span className="gw-section-kicker">{copy.layersEyebrow}</span>
        <h2>{copy.layersTitle}</h2>
        <p>{copy.layersDesc}</p>
      </div>
      <div className="gw-layer-grid">
        <div className="gw-layer-orbit">
          <Layers3 size={46} />
          <strong>AI Synthesis Engine</strong>
        </div>
        <div className="gw-layer-list">
          {copy.layers.map(([title, body]) => (
            <article key={title} className="gw-layer-card">
              <span>{title}</span>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function DailyActionPanel({ copy }: { copy: typeof zhHomeCopy }) {
  return (
    <section className="gw-section gw-daily-panel">
      <div className="gw-section-copy">
        <span className="gw-section-kicker">{copy.dailyEyebrow}</span>
        <h2>{copy.dailyTitle}</h2>
      </div>
      <div className="gw-daily-card">
        <CalendarDays size={28} />
        <h3>{copy.dailyTheme}</h3>
        <div>
          {copy.dailyItems.map(item => <p key={item}>{item}</p>)}
        </div>
      </div>
    </section>
  )
}

function FutureWindows({ copy }: { copy: typeof zhHomeCopy }) {
  return (
    <section className="gw-section">
      <div className="gw-section-copy">
        <span className="gw-section-kicker">{copy.timelineEyebrow}</span>
        <h2>{copy.timelineTitle}</h2>
      </div>
      <div className="gw-window-timeline">
        {copy.timeline.map(([year, title, body]) => (
          <article key={year}>
            <span>{year}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function ProductPaths({ copy, localeHref }: { copy: typeof zhHomeCopy, localeHref: (href: string) => string }) {
  return (
    <section className="gw-section">
      <div className="gw-section-copy">
        <span className="gw-section-kicker">{copy.entryEyebrow}</span>
        <h2>{copy.entryTitle}</h2>
      </div>
      <div className="gw-path-grid">
        {copy.entries.map(entry => (
          <Link key={entry.title} href={localeHref(entry.href)} className="gw-path-card">
            <entry.icon size={28} />
            <h3>{entry.title}</h3>
            <p>{entry.body}</p>
            <span>{entry.cta}<ArrowRight size={15} /></span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function LifestyleVault({ copy }: { copy: typeof zhHomeCopy }) {
  return (
    <section className="gw-section gw-vault-section">
      <div className="gw-section-copy">
        <span className="gw-section-kicker">{copy.vaultEyebrow}</span>
        <h2>{copy.vaultTitle}</h2>
        <p>{copy.vaultDesc}</p>
      </div>
      <div className="gw-vault-grid">
        {copy.vaultTags.map((tag, index) => (
          <article key={tag} className="gw-vault-item">
            {index === 0 ? <ShieldCheck size={22} /> : index === 1 ? <Target size={22} /> : index === 2 ? <Moon size={22} /> : index === 3 ? <Sparkles size={22} /> : <Zap size={22} />}
            <span>{tag}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function OrientalSkyAtlas({ mode }: { mode: "night" | "day" }) {
  const trigrams = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"]
  const ticks = Array.from({ length: 48 }, (_, index) => index)
  const stars = Array.from({ length: 36 }, (_, index) => ({
    left: `${5 + ((index * 29) % 90)}%`,
    top: `${6 + ((index * 19) % 76)}%`,
    delay: `${(index % 6) * 0.4}s`,
  }))

  return (
    <div className="gw-atlas-stage" aria-hidden="true">
      <div className="gw-galaxy-band gw-galaxy-band-back" aria-hidden="true" />
      <div className="gw-galaxy-band gw-galaxy-band-front" aria-hidden="true" />
      <div className="gw-galaxy-dust" aria-hidden="true" />
      <div className="gw-atlas-stars" aria-hidden="true">
        {stars.map((star, index) => (
          <span key={index} style={{ left: star.left, top: star.top, animationDelay: star.delay }} />
        ))}
      </div>
      <div className="gw-atlas-moon" data-mode={mode} aria-hidden="true" />
      <div className="gw-atlas-constellation" aria-hidden="true" />
      <div className="gw-cosmic-disc" aria-hidden="true">
        <div className="gw-disc-glow" />
        <div className="gw-disc-ring gw-disc-ring-a" />
        <div className="gw-disc-ring gw-disc-ring-b" />
        <div className="gw-disc-ring gw-disc-ring-c" />
        <div className="gw-disc-ticks">
          {ticks.map(tick => <i key={tick} style={{ transform: `rotate(${tick * 7.5}deg)` }} />)}
        </div>
        <div className="gw-disc-orbit gw-disc-orbit-a" />
        <div className="gw-disc-orbit gw-disc-orbit-b" />
        <div className="gw-taiji-symbol" />
        <div className="gw-bagua-orbit">
          {trigrams.map((mark, index) => (
            <span key={mark} className={`gw-bagua-glyph gw-bagua-glyph-${index + 1}`}>{mark}</span>
          ))}
        </div>
        <div className="gw-disc-core" />
      </div>
    </div>
  )
}

const zhCopy = {
  tags: ["AI 多维合参", "五维人格结构", "今日行动建议", "未来机会窗口"],
  heroTitle: "看见你的内在结构\n找到下一步该走的路",
  heroDesc: "观我融合八字、星盘、塔罗、面相、手相与 AI 人格模型，生成你的性格底色、关系模式、事业方向与未来机会窗口。",
  primary: "开始生成我的报告",
  secondary: "查看样例报告",
  dimensionLabels: ["八字", "星盘", "塔罗", "面相", "手相"],
  engine: "观我合参引擎",
  blindspotTitle: "当前盲点",
  blindspot: "容易在关系与事业选择中反复消耗，需要先看清自己的稳定结构。",
  actionTitle: "今日行动",
  action: "先完成一个确定性任务，再处理复杂决策。",
  questionsEyebrow: "真实问题",
  questionsTitle: "一份报告，回答你真正关心的问题",
  questionsDesc: "不是只看一个结果，而是从性格、关系、事业、财富和当下状态中，找到更清楚的行动方向。",
  questions: ["我真正的性格底色是什么？", "为什么我总在某类关系里消耗？", "我的事业适合走哪条路径？", "财富机会会在哪些阶段出现？", "今天最适合推进什么事？", "哪种生活方式更适合我的状态？"],
  systemEyebrow: "五维合参",
  systemTitle: "不是单一算命，而是五维交叉验证",
  systemDesc: "观我把八字、星盘、塔罗、面相、手相放进同一个 AI 分析框架，从长期结构、心理模式、当前问题、外显气质和行动习惯中交叉判断。",
  dimensions: [
    { title: "八字", body: "观察长期结构与人生节奏。" },
    { title: "星盘", body: "识别心理模式与关系倾向。" },
    { title: "塔罗", body: "聚焦当下问题与选择倾向。" },
    { title: "面相", body: "理解外显气质与行为印象。" },
    { title: "手相", body: "参考行动习惯与发展轨迹。" },
  ],
  reportEyebrow: "报告样例",
  reportTitle: "你将获得一份怎样的观我报告？",
  reportDesc: "从性格结构到未来窗口，从关系模式到今日行动，观我把复杂分析整理成可阅读、可理解、可执行的个人档案。",
  reportModules: [
    { title: "性格结构", body: "外在稳定，内在高敏，适合在复杂问题中建立秩序。" },
    { title: "事业方向", body: "适合做需要判断力、表达力和系统构建能力的项目。" },
    { title: "关系模式", body: "容易被强烈情绪吸引，但长期关系更需要稳定反馈。" },
    { title: "财富窗口", body: "适合在稳定积累后寻找阶段性突破，而不是频繁切换方向。" },
    { title: "今日行动", body: "先推进一个能带来确定反馈的任务，避免同时开启多个方向。" },
  ],
  pathEyebrow: "行动地图",
  pathTitle: "看见未来十年的关键窗口",
  pathDesc: "不是告诉你一个固定结局，而是标记事业、财富、关系和成长中的关键阶段。",
  entryEyebrow: "选择路径",
  entryTitle: "不同问题，用不同深度的分析方式",
  entries: [
    { icon: Brain, title: "完整观我报告", body: "系统了解自己，输出性格结构、人生节奏、事业财富、关系模式与行动建议。", cta: "生成完整报告", href: "/reading/new" },
    { icon: MessageCircleQuestion, title: "单主题快问", body: "针对感情、事业、财富、选择题，快速获得一次问题分析。", cta: "提出一个问题", href: "/reading/new?intent=quick" },
    { icon: HeartHandshake, title: "关系合参", body: "适合恋爱、婚姻、合作关系，分析两个人之间的吸引点、冲突点和相处方式。", cta: "开始关系合参", href: "/reading/new?intent=relationship" },
  ],
  vaultEyebrow: "藏宝阁",
  vaultTitle: "根据你的分析结果，匹配适合你的生活方式物件",
  vaultDesc: "观我不会承诺改变命运，而是根据你的性格结构、情绪状态与生活节律，推荐更适合你的空间、饰品与仪式感物件。",
  vaultTags: ["情绪稳定", "专注提升", "睡眠节律", "空间氛围", "日常仪式感"],
  finalTitle: "从今天开始，看懂自己的下一步",
  finalDesc: "生成你的观我档案，查看性格结构、关系模式、事业方向与今日行动建议。",
}

const enCopy = {
  tags: ["AI synthesis", "Five-source profile", "Daily action", "Future windows"],
  heroTitle: "See your inner structure\nfind the next step",
  heroDesc: "Guanwo combines Bazi, astrology, tarot, facial reading, palm reading, and AI personality models into one readable dossier for self-knowledge and action.",
  primary: "Generate my report",
  secondary: "View sample report",
  dimensionLabels: ["Bazi", "Astrology", "Tarot", "Face", "Palm"],
  engine: "Guanwo synthesis",
  blindspotTitle: "Current blind spot",
  blindspot: "Repeated friction in relationships and work choices often starts with an unseen pattern.",
  actionTitle: "Daily action",
  action: "Finish one certain task before complex decisions.",
  questionsEyebrow: "Real questions",
  questionsTitle: "One report for the questions that actually matter",
  questionsDesc: "Not a single verdict. A clearer view across personality, relationships, career, wealth, and current timing.",
  questions: ["What is my real personality base?", "Why do I repeat the same relationship drain?", "Which career path fits my structure?", "Where might opportunity windows appear?", "What should I move forward today?", "Which lifestyle rhythm fits my state?"],
  systemEyebrow: "Five-source synthesis",
  systemTitle: "Not one reading, but cross-validation",
  systemDesc: "Guanwo places Bazi, astrology, tarot, face reading, and palm reading into one AI framework for long-term structure, psychology, current choices, outer presence, and habits.",
  dimensions: [
    { title: "Bazi", body: "Long-term structure and life rhythm." },
    { title: "Astrology", body: "Psychological patterns and relationship tendencies." },
    { title: "Tarot", body: "Current questions and choice pressure." },
    { title: "Face reading", body: "Outer temperament and behavioral impression." },
    { title: "Palm reading", body: "Habits, action style, and development trail." },
  ],
  reportEyebrow: "Sample report",
  reportTitle: "What will your Guanwo report include?",
  reportDesc: "From inner structure to future windows and daily action, Guanwo turns complex analysis into a readable personal dossier.",
  reportModules: [
    { title: "Inner structure", body: "Steady outside, sensitive inside, strongest when creating order." },
    { title: "Career direction", body: "Best for projects that require judgment, expression, and systems." },
    { title: "Relationship mode", body: "Attracted by intensity, sustained by steady feedback." },
    { title: "Wealth window", body: "Better to seek breakthroughs after stable accumulation." },
    { title: "Daily action", body: "Move one task with clear feedback before opening more directions." },
  ],
  pathEyebrow: "Action map",
  pathTitle: "See the key windows of the next decade",
  pathDesc: "Not a fixed ending. A map of career, wealth, relationship, and growth stages.",
  entryEyebrow: "Choose depth",
  entryTitle: "Different questions need different depth",
  entries: [
    { icon: Brain, title: "Complete Guanwo report", body: "Personality, rhythm, career, wealth, relationships, and action guidance in one dossier.", cta: "Generate report", href: "/reading/new" },
    { icon: MessageCircleQuestion, title: "Focus reading", body: "Ask one specific question about love, work, money, or a decision.", cta: "Ask a question", href: "/reading/new?intent=quick" },
    { icon: HeartHandshake, title: "Relationship synthesis", body: "Understand attraction, friction, communication, and relationship rhythm.", cta: "Start relationship reading", href: "/reading/new?intent=relationship" },
  ],
  vaultEyebrow: "Vault",
  vaultTitle: "Lifestyle objects matched to your current state",
  vaultDesc: "Guanwo does not promise fate changes. It recommends spatial, personal, and ritual objects based on structure, mood, and rhythm.",
  vaultTags: ["Emotional steadiness", "Focus", "Sleep rhythm", "Spatial atmosphere", "Daily ritual"],
  finalTitle: "Start today by understanding your next step",
  finalDesc: "Generate your Guanwo dossier for inner structure, relationship patterns, career direction, and daily action.",
}
