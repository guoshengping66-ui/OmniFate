"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Brain, HeartHandshake, MessageCircleQuestion, Moon, Sparkles, Sun } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { EasternCard, EasternPageShell, EasternSection, FiveDimensionOrbit, ReportPreviewPanel, TenYearPath } from "@/components/brand/EasternDesign"

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
        heroKicker: "在星河里，看见自己的下一步",
        heroDesc: "以周易八卦为底，融合八字、星盘、塔罗、面相与手相，生成你的个人命盘档案与行动建议。",
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

  return (
    <EasternPageShell className={`gw-home-theme gw-theme-${skyMode}`}>
      <section className="gw-hero-section mx-auto grid min-h-[720px] w-[min(1180px,calc(100vw-32px))] items-center gap-8 py-10 lg:grid-cols-[0.86fr_1.14fr] lg:py-16">
        <div className="relative z-10">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {copy.tags.map(tag => <span key={tag} className="gw-hero-tag">{tag}</span>)}
            <button type="button" className="gw-sky-toggle" onClick={toggleSkyMode} aria-label={isZh ? "切换昼夜模式" : "Toggle day and night mode"}>
              {skyMode === "night" ? <Moon size={14} /> : <Sun size={14} />}
              <span>{skyMode === "night" ? (isZh ? "夜观" : "Night") : (isZh ? "昼观" : "Day")}</span>
            </button>
          </div>
          <h1 className="gw-hero-brand">
            {copy.heroTitle}
          </h1>
          <p className="gw-hero-kicker">{copy.heroKicker}</p>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">{copy.heroDesc}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={localeHref("/reading/new")} className="ow-gold-button">{copy.primary}<ArrowRight size={17} /></Link>
            <Link href="#sample-report" className="ow-ghost-button">{copy.secondary}<ArrowRight size={16} /></Link>
          </div>
        </div>

        <OrientalSkyAtlas labels={copy.dimensionLabels} center={copy.engine} isZh={isZh} mode={skyMode} />
      </section>

      <EasternSection eyebrow={copy.questionsEyebrow} title={copy.questionsTitle} description={copy.questionsDesc}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {copy.questions.map((question, index) => (
            <EasternCard key={question} className="p-5">
              <span className="text-sm font-semibold text-[var(--color-gold)]">0{index + 1}</span>
              <p className="mt-4 text-base font-semibold leading-7 text-[var(--color-text-primary)]">{question}</p>
            </EasternCard>
          ))}
        </div>
      </EasternSection>

      <EasternSection eyebrow={copy.systemEyebrow} title={copy.systemTitle} description={copy.systemDesc}>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.86fr]">
          <FiveDimensionOrbit labels={copy.dimensionLabels} center={copy.engine} />
          <div className="grid content-center gap-4">
            {copy.dimensions.map(item => (
              <EasternCard key={item.title} className="p-5">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{item.body}</p>
              </EasternCard>
            ))}
          </div>
        </div>
      </EasternSection>

      <EasternSection eyebrow={copy.reportEyebrow} title={copy.reportTitle} description={copy.reportDesc} className="scroll-mt-20" >
        <div id="sample-report" className="grid gap-8 lg:grid-cols-[0.86fr_1fr]">
          <div className="grid gap-4">
            {copy.reportModules.map(item => (
              <EasternCard key={item.title} className="p-5">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{item.body}</p>
              </EasternCard>
            ))}
          </div>
          <ReportPreviewPanel locale={isZh ? "zh" : "en"} />
        </div>
      </EasternSection>

      <EasternSection eyebrow={copy.pathEyebrow} title={copy.pathTitle} description={copy.pathDesc}>
        <TenYearPath locale={isZh ? "zh" : "en"} />
      </EasternSection>

      <EasternSection eyebrow={copy.entryEyebrow} title={copy.entryTitle}>
        <div className="grid gap-5 lg:grid-cols-3">
          {copy.entries.map(entry => (
            <Link key={entry.title} href={localeHref(entry.href)} className="group ow-card block p-7 transition hover:border-[var(--color-gold-soft)]">
              <entry.icon className="text-[var(--color-gold)]" size={28} />
              <h3 className="mt-5 text-xl font-semibold text-[var(--color-text-primary)]">{entry.title}</h3>
              <p className="mt-3 min-h-[78px] text-sm leading-7 text-[var(--color-text-secondary)]">{entry.body}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-gold)]">
                {entry.cta}
                <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </EasternSection>

      <EasternSection eyebrow={copy.vaultEyebrow} title={copy.vaultTitle} description={copy.vaultDesc}>
        <div className="grid gap-4 md:grid-cols-5">
          {copy.vaultTags.map(tag => (
            <EasternCard key={tag} className="grid min-h-[120px] place-items-center p-5 text-center text-sm font-semibold text-[var(--color-text-primary)]">
              {tag}
            </EasternCard>
          ))}
        </div>
      </EasternSection>

      <section className="mx-auto w-[min(960px,calc(100vw-32px))] pb-24 pt-10 text-center">
        <EasternCard className="p-8 md:p-12">
          <Sparkles className="mx-auto text-[var(--color-gold)]" size={32} />
          <h2 className="mt-5 text-3xl font-semibold leading-tight text-[var(--color-text-primary)] md:text-5xl">{copy.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)]">{copy.finalDesc}</p>
          <Link href={localeHref("/reading/new")} className="ow-gold-button mt-8">{copy.primary}<ArrowRight size={17} /></Link>
        </EasternCard>
      </section>
    </EasternPageShell>
  )
}

function OrientalSkyAtlas({ labels, center, isZh, mode }: { labels: string[]; center: string; isZh: boolean; mode: "night" | "day" }) {
  const trigrams = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"]
  const stars = Array.from({ length: 36 }, (_, index) => ({
    left: `${5 + ((index * 29) % 90)}%`,
    top: `${6 + ((index * 19) % 76)}%`,
    delay: `${(index % 6) * 0.4}s`,
  }))

  return (
    <div className="gw-atlas-stage" aria-label={center}>
      <div className="gw-taiji-field" aria-hidden="true">
        <div className="gw-taiji-symbol" />
        <div className="gw-bagua-orbit">
          {trigrams.map((mark, index) => (
            <span key={mark} className={`gw-bagua-glyph gw-bagua-glyph-${index + 1}`}>{mark}</span>
          ))}
        </div>
      </div>
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

      <div className="gw-atlas-scroll">
        <span>{isZh ? (mode === "night" ? "夜观星河" : "昼观命盘") : (mode === "night" ? "Night Atlas" : "Day Atlas")}</span>
        <strong>{center}</strong>
        <p>{isZh ? "五维合参 · 太极八卦 · 行动路径" : "Five-source synthesis · Bagua field · action path"}</p>
        <div className="gw-atlas-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className="gw-atlas-sources" aria-hidden="true">
        {labels.map((label, index) => (
          <span key={label}>{index + 1}. {label}</span>
        ))}
      </div>

      <div className="gw-atlas-action">
        <span>{isZh ? "今日行动" : "Today"}</span>
        <strong>{isZh ? "先定一事，再看全局" : "One clear move first"}</strong>
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
