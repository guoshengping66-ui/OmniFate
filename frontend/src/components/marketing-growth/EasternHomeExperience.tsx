import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  CalendarClock,
  Compass,
  Fingerprint,
  HeartHandshake,
  Layers3,
  MessageCircleQuestion,
  Sparkles,
} from "lucide-react"

export function EasternHomeExperience({ locale = "en" }: { locale?: string }) {
  const activeLocale = locale === "zh" ? "zh" : "en"
  const localeHref = (href: string) => {
    if (href.startsWith("#")) return href
    return `/${activeLocale}${href.startsWith("/") ? href : `/${href}`}`
  }
  const copy = activeLocale === "zh" ? zhCopy : enCopy

  return (
    <main className="ow-page ia-home relative min-h-screen overflow-hidden text-white">
      <div className="relative z-10">
      <section className="ia-hero" aria-label={copy.heroAria}>
        <div className="ia-hero-reference-visual" aria-hidden="true">
          <Image
            className="ia-hero-reference-visual__image"
            src="/assets/reference-style/reference-hero-atlas-right-v2.png"
            alt=""
            width={952}
            height={660}
            draggable={false}
            priority
            sizes="(min-width: 1920px) 1264px, 66vw"
            style={{ objectFit: "cover", objectPosition: "center center", width: "100%", height: "100%" }}
          />
        </div>
        <div className="ia-hero-mist" aria-hidden="true" />

        <div className="ia-hero-copy">
          <div className="ia-brand-lockup">
            <span className="ia-brand-seal" aria-hidden="true" />
            <div>
              <strong>{copy.brand}</strong>
              <small>{copy.brandNote}</small>
            </div>
          </div>

          <p className="ia-eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="ia-hero-subtitle">{copy.subtitle}</p>
          <p className="ia-hero-desc">{copy.description}</p>

          <div className="ia-hero-actions">
            <Link href={localeHref("/reading/new?intent=full")} className="ia-primary-cta">
              {copy.primary}
              <ArrowRight size={18} />
            </Link>
            <Link href="#sample-report" className="ia-secondary-cta">
              {copy.secondary}
              <ArrowRight size={17} />
            </Link>
          </div>
          <p className="ia-journey-cue">{copy.journeyCue}</p>

          <div className="ia-hero-tags" aria-label={copy.tagLabel}>
            {copy.tags.map(tag => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="ia-hero-report" aria-label={copy.heroReportLabel}>
          {copy.heroReport.map(item => (
            <Link href={localeHref(item.href)} key={item.title}>
              <span>{item.kicker}</span>
              <strong>{item.title}</strong>
              <small>{item.body}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="ia-section ia-report-preview" id="sample-report">
        <div className="ia-section-heading">
          <span>{copy.reportEyebrow}</span>
          <h2>{copy.reportTitle}</h2>
          <p>{copy.reportDesc}</p>
        </div>

        <div className="ia-report-shell">
          <div className="ia-report-main">
            <div className="ia-report-header">
              <div>
                <span>{copy.reportPreviewLabel}</span>
                <h3>{copy.reportPreviewTitle}</h3>
              </div>
              <strong>{copy.reportScore}</strong>
            </div>
            <div className="ia-report-axis" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <i />
            </div>
            <p>{copy.reportSummary}</p>
          </div>

          <div className="ia-report-grid">
            {copy.reportItems.map(item => (
              <article key={item.title}>
                <item.icon size={20} />
                <span>{item.kicker}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ia-section ia-answers" id="answers">
        <div className="ia-section-heading">
          <span>{copy.answersEyebrow}</span>
          <h2>{copy.answersTitle}</h2>
        </div>
        <div className="ia-answer-grid">
          {copy.answers.map(item => (
            <article key={item}>
              <MessageCircleQuestion size={19} />
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ia-section ia-how" id="how-it-works">
        <div className="ia-section-heading">
          <span>{copy.howEyebrow}</span>
          <h2>{copy.howTitle}</h2>
          <p>{copy.howDesc}</p>
        </div>
        <div className="ia-step-line">
          {copy.steps.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ia-section ia-engine">
        <div className="ia-engine-copy">
          <span>{copy.engineEyebrow}</span>
          <h2>{copy.engineTitle}</h2>
          <p>{copy.engineDesc}</p>
        </div>
        <div className="ia-layer-list">
          {copy.layers.map(layer => (
            <article key={layer.title}>
              <Layers3 size={18} />
              <div>
                <h3>{layer.title}</h3>
                <p>{layer.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ia-section ia-daily-growth" id="daily-action">
        <div className="ia-daily-card">
          <span>{copy.dailyEyebrow}</span>
          <h2>{copy.dailyTitle}</h2>
          <p>{copy.dailyDesc}</p>
          <dl>
            {copy.dailyItems.map(item => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
          <Link href={localeHref("/almanac")} className="ia-text-link">
            {copy.dailyCta}
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="ia-growth-card" id="growth-map">
          <span>{copy.growthEyebrow}</span>
          <h2>{copy.growthTitle}</h2>
          <div className="ia-growth-line">
            {copy.timeline.map(item => (
              <div key={item.year}>
                <strong>{item.year}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ia-section ia-vault" id="vault">
        <div>
          <span>{copy.vaultEyebrow}</span>
          <h2>{copy.vaultTitle}</h2>
          <p>{copy.vaultDesc}</p>
        </div>
        <div className="ia-vault-grid">
          {copy.vaultItems.map(item => (
            <Link href={localeHref("/shop")} key={item.title}>
              <Sparkles size={17} />
              <strong>{item.title}</strong>
              <small>{item.body}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="ia-final-cta">
        <span>{copy.finalEyebrow}</span>
        <h2>{copy.finalTitle}</h2>
        <Link href={localeHref("/reading/new?intent=full")} className="ia-primary-cta">
          {copy.finalCta}
          <ArrowRight size={18} />
        </Link>
      </section>
      </div>
    </main>
  )
}

const zhCopy = {
  heroAria: "Inner Atlas AI首页首屏",
  brand: "Inner Atlas AI",
  brandNote: "AI 人生报告系统",
  eyebrow: "AI Life Report",
  title: "生成你的 AI 人生报告",
  subtitle: "看见结构，找到下一步",
  description: "融合东方结构系统与 AI 多维分析，生成你的个人结构档案、成长方向、关系模式与今日行动建议。",
  primary: "生成我的报告",
  secondary: "查看示例报告",
  journeyCue: "选择方向 · 获取分析 · 找到下一步",
  tagLabel: "首页核心能力",
  tags: ["个人结构", "成长地图", "今日行动", "关系模式"],
  heroReportLabel: "报告预览入口",
  heroReport: [
    { kicker: "Core", title: "核心结构", body: "看见长期重复模式", href: "/reading/new?intent=full" },
    { kicker: "Window", title: "阶段窗口", body: "判断下一阶段重点", href: "/reading/new?intent=full" },
    { kicker: "Action", title: "今日行动", body: "把分析落到一步", href: "/almanac" },
  ],
  reportEyebrow: "报告预览",
  reportTitle: "用户真正购买的是一份可阅读的人生报告",
  reportDesc: "首页先展示结果价值，而不是堆功能。用户需要知道付费后能看见什么、能理解什么、能做什么。",
  reportPreviewLabel: "Personal Archive Preview",
  reportPreviewTitle: "结构型创造者",
  reportScore: "87%",
  reportSummary: "外在稳定，内在高敏，适合在复杂问题中建立秩序。近期更适合收敛方向，先完成一个能带来明确反馈的任务。",
  reportItems: [
    { icon: Fingerprint, kicker: "Pattern", title: "核心结构", body: "长期优势、重复卡点和最容易消耗的位置。" },
    { icon: Compass, kicker: "Direction", title: "事业方向", body: "适合发挥判断力、表达力和系统构建能力的场景。" },
    { icon: HeartHandshake, kicker: "Relationship", title: "关系模式", body: "识别吸引点、冲突点和更稳定的相处方式。" },
    { icon: CalendarClock, kicker: "Timing", title: "阶段窗口", body: "用阶段和趋势理解机会，而不是承诺固定结果。" },
  ],
  answersEyebrow: "它能回答什么",
  answersTitle: "把玄学输入，翻译成用户真正关心的问题",
  answers: [
    "我为什么总在某类关系里反复消耗？",
    "我的事业更适合走哪种成长路径？",
    "下一阶段更应该积累、推进还是调整？",
    "今天最值得完成的一件事是什么？",
  ],
  howEyebrow: "How It Works",
  howTitle: "三步生成你的个人结构档案",
  howDesc: "用清楚的产品流程建立信任，让海外用户理解这是 AI 分析系统，而不是普通算命页面。",
  steps: [
    { title: "输入个人背景", body: "填写出生信息、当前问题和你想重点理解的方向。" },
    { title: "AI 多层合参", body: "系统综合结构、性格、象征和行为层，形成可解释的判断。" },
    { title: "获得行动报告", body: "输出核心结论、阶段窗口、关系模式和今日行动建议。" },
  ],
  engineEyebrow: "Pattern Engine",
  engineTitle: "东方底色，不等于廉价玄学",
  engineDesc: "前台用用户能理解的语言表达，底层再承接八字、星盘、塔罗、面相与手相等结构来源。",
  layers: [
    { title: "Birth Pattern", body: "长期结构与人生节奏。" },
    { title: "Cosmic Personality", body: "心理模式与关系倾向。" },
    { title: "Symbolic Reflection", body: "当下问题与选择倾向。" },
    { title: "Visual Expression", body: "外显气质与行为印象。" },
    { title: "Behavior Path", body: "行动习惯与发展轨迹。" },
  ],
  dailyEyebrow: "Daily Action",
  dailyTitle: "每天回来，只为一个清楚的下一步",
  dailyDesc: "今日行动是留存核心。它把长报告压缩成当天最值得推进的一件事。",
  dailyItems: [
    { label: "今日重点", value: "稳住节奏，先完成确定性任务。" },
    { label: "适合时间", value: "14:00 - 17:00" },
    { label: "避免事项", value: "临时改变方向、冲动承诺。" },
  ],
  dailyCta: "查看今日行动",
  growthEyebrow: "Growth Map",
  growthTitle: "未来十年不是结论，而是路径",
  timeline: [
    { year: "2026", label: "Foundation" },
    { year: "2028", label: "Expansion" },
    { year: "2030", label: "Opportunity" },
    { year: "2033", label: "Renewal" },
  ],
  vaultEyebrow: "Lifestyle Vault",
  vaultTitle: "把报告延伸到生活方式，而不是玄学商品货架",
  vaultDesc: "根据性格结构、情绪状态和生活节律，推荐更适合的空间、饰品与日常仪式感物件。",
  vaultItems: [
    { title: "情绪稳定", body: "适合需要稳定节奏的日常场景。" },
    { title: "专注提升", body: "适合工作区和深度任务。" },
    { title: "睡眠节律", body: "适合睡前建立轻仪式感。" },
  ],
  finalEyebrow: "Start",
  finalTitle: "从第一份 AI 人生报告开始",
  finalCta: "生成我的报告",
}

const enCopy = {
  heroAria: "Inner Atlas AI homepage hero",
  brand: "Inner Atlas AI",
  brandNote: "by Inner Atlas AI",
  eyebrow: "AI Life Report",
  title: "Your AI Life Atlas",
  subtitle: "Understand your patterns. Choose your next move.",
  description: "A personal insight report for self-understanding, relationships, timing windows, and daily actions.",
  primary: "Generate My Report",
  secondary: "View Sample",
  journeyCue: "Choose your focus. Receive your analysis. Review your next move.",
  tagLabel: "Homepage capabilities",
  tags: ["Personal Patterns", "Growth Map", "Daily Action", "Relationship Insight"],
  heroReportLabel: "Report preview links",
  heroReport: [
    { kicker: "Core", title: "Core Pattern", body: "See recurring life themes", href: "/reading/new?intent=full" },
    { kicker: "Window", title: "Timing Window", body: "Know what to focus on next", href: "/reading/new?intent=full" },
    { kicker: "Action", title: "Daily Action", body: "Turn insight into one move", href: "/almanac" },
  ],
  reportEyebrow: "Report Preview",
  reportTitle: "What users buy is a readable life report",
  reportDesc: "The homepage should show the value of the result first: what users will see, understand, and do next.",
  reportPreviewLabel: "Personal Archive Preview",
  reportPreviewTitle: "Strategic Creator",
  reportScore: "87%",
  reportSummary: "Calm on the outside, highly sensitive inside, strongest when turning complex information into structure. The next step is to narrow the field and finish one task with clear feedback.",
  reportItems: [
    { icon: Fingerprint, kicker: "Pattern", title: "Core Pattern", body: "Durable strengths, repeating friction, and where energy gets drained." },
    { icon: Compass, kicker: "Direction", title: "Career Direction", body: "Best-fit environments for judgment, expression, and system-building." },
    { icon: HeartHandshake, kicker: "Relationship", title: "Relationship Style", body: "Attraction points, conflict loops, and more stable ways to relate." },
    { icon: CalendarClock, kicker: "Timing", title: "Timing Window", body: "Opportunities as stages and trends, not guaranteed outcomes." },
  ],
  answersEyebrow: "What It Answers",
  answersTitle: "Turn complex inputs into questions people actually care about",
  answers: [
    "What patterns keep repeating in my life?",
    "Which career direction fits my structure?",
    "What relationship dynamics do I keep attracting?",
    "What should I focus on next?",
  ],
  howEyebrow: "How It Works",
  howTitle: "Three steps to your personal archive",
  howDesc: "A clear product flow builds trust for overseas users: this is an AI analysis system, not a generic fortune page.",
  steps: [
    { title: "Enter personal context", body: "Share birth details, current questions, and the life area you want to understand." },
    { title: "AI analyzes pattern layers", body: "The system combines structural, personality, symbolic, and behavioral signals." },
    { title: "Receive next actions", body: "Get core conclusions, timing windows, relationship patterns, and one useful action." },
  ],
  engineEyebrow: "Pattern Engine",
  engineTitle: "Eastern roots, international product language",
  engineDesc: "The frontend speaks in self-understanding and decision support. The deeper method can still draw from Bazi, astrology, symbolic cards, face, and palm signals.",
  layers: [
    { title: "Birth Pattern", body: "Long-term structure and life rhythm." },
    { title: "Cosmic Personality", body: "Psychological patterns and relationship tendencies." },
    { title: "Symbolic Reflection", body: "Current questions and decision signals." },
    { title: "Visual Expression", body: "External style and behavioral impression." },
    { title: "Behavior Path", body: "Habits, follow-through, and development track." },
  ],
  dailyEyebrow: "Daily Action",
  dailyTitle: "Return for one clear next move",
  dailyDesc: "Daily Action is the retention loop. It turns a long report into the most useful action for today.",
  dailyItems: [
    { label: "Focus", value: "Stabilize the rhythm and finish one concrete task." },
    { label: "Best window", value: "14:00 - 17:00" },
    { label: "Avoid", value: "Changing direction or over-promising too early." },
  ],
  dailyCta: "View Daily Action",
  growthEyebrow: "Growth Map",
  growthTitle: "The next decade as a path, not a promise",
  timeline: [
    { year: "2026", label: "Foundation" },
    { year: "2028", label: "Expansion" },
    { year: "2030", label: "Opportunity" },
    { year: "2033", label: "Renewal" },
  ],
  vaultEyebrow: "Lifestyle Vault",
  vaultTitle: "A lifestyle extension, not a mystic storefront",
  vaultDesc: "Objects and rituals matched to personality structure, emotional state, and daily rhythm.",
  vaultItems: [
    { title: "Emotional steadiness", body: "For people rebuilding rhythm and calm." },
    { title: "Focus support", body: "For workspaces and deep tasks." },
    { title: "Sleep rhythm", body: "For a lighter evening ritual." },
  ],
  finalEyebrow: "Start",
  finalTitle: "Start with your first AI life report",
  finalCta: "Generate My Report",
}
