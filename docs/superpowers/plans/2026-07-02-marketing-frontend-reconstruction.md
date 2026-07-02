# Marketing Frontend Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the unauthenticated homepage and `/destiny` page into a complete, premium product journey that shows the five-dimensional analysis method, main content, trust model, and conversion path without feeling like a slide deck.

**Architecture:** Replace the current long chain of spectacle sections with a smaller set of focused product-led components. Shared copy and sample data live in one module, shared homepage/destiny components live under `frontend/src/components/marketing-growth/`, and route files compose those components into distinct homepage and product-detail journeys.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind CSS, lucide-react icons, existing `useLanguage()` locale utilities.

## Global Constraints

- Do not change backend algorithms, payment flow, authenticated dashboard, or database behavior.
- Primary conversion destination is `/reading/new`.
- The first viewport must answer what is analyzed, how it is analyzed, and what the user gets.
- The site must position the product as a five-dimensional growth command center, not generic AI fortune telling.
- Chinese and English copy must be deterministic and stored in UTF-8 source files without mojibake.
- Avoid random demo scores; sample output must be deterministic.
- Respect reduced motion.
- Verify `/zh`, `/en`, `/zh/destiny`, and `/en/destiny` on desktop and mobile.

---

## File Structure

- Create `frontend/src/components/marketing-growth/growthContent.ts`
  - Owns deterministic bilingual copy, five-dimension definitions, analysis inputs, sample report data, service paths, trust points, and CTA labels.
- Create `frontend/src/components/marketing-growth/GrowthCommandHero.tsx`
  - Shared first-screen product hero for homepage and destiny page.
- Create `frontend/src/components/marketing-growth/FiveDimensionCommandCenter.tsx`
  - Interactive five-dimensional synthesis section.
- Create `frontend/src/components/marketing-growth/SignalToActionWorkflow.tsx`
  - Explains the analysis pipeline from signals to practical action.
- Create `frontend/src/components/marketing-growth/SampleGrowthReport.tsx`
  - Shows concrete sample output with tabs for today, week, and long cycle.
- Create `frontend/src/components/marketing-growth/MethodTrustSection.tsx`
  - Differentiates the method from competitors and states boundaries.
- Create `frontend/src/components/marketing-growth/GrowthServicePaths.tsx`
  - Presents the main product/service paths without turning the page into cards-only marketing.
- Create `frontend/src/components/marketing-growth/FinalGrowthCTA.tsx`
  - Final conversion section.
- Modify `frontend/src/app/[locale]/page.tsx`
  - Replace unauthenticated route composition with the new homepage journey.
- Modify `frontend/src/app/[locale]/destiny/page.tsx`
  - Replace current destiny route composition with the new product-detail journey.

---

### Task 1: Shared Content Model

**Files:**
- Create: `frontend/src/components/marketing-growth/growthContent.ts`

**Interfaces:**
- Produces:
  - `type Locale = "zh" | "en"`
  - `type HeroVariant = "home" | "destiny"`
  - `const getGrowthCopy(locale: Locale): GrowthCopy`
  - `const getHeroCopy(locale: Locale, variant: HeroVariant): HeroCopy`

- [ ] **Step 1: Create shared deterministic content**

Create `frontend/src/components/marketing-growth/growthContent.ts` with this structure:

```ts
export type Locale = "zh" | "en"
export type HeroVariant = "home" | "destiny"

export type DimensionKey = "wealth" | "career" | "relationship" | "health" | "spirit"

export type Dimension = {
  key: DimensionKey
  name: string
  label: string
  color: string
  signal: string
  contribution: string
  action: string
}

export type HeroCopy = {
  eyebrow: string
  title: string
  subtitle: string
  methodLabel: string
  primaryCta: string
  secondaryCta: string
}

export type GrowthCopy = {
  hero: Record<HeroVariant, HeroCopy>
  methodStrip: string[]
  commandCenter: {
    title: string
    description: string
    todayPattern: string
    blindSpot: string
    opportunity: string
    action: string
  }
  dimensions: Dimension[]
  workflow: Array<{ title: string; body: string; output: string }>
  reportTabs: Array<{ key: "today" | "week" | "cycle"; label: string; title: string; body: string; bullets: string[] }>
  services: Array<{ title: string; body: string; href: string }>
  trust: Array<{ title: string; body: string }>
  finalCta: { title: string; body: string; primary: string; secondary: string }
}

const zh: GrowthCopy = {
  hero: {
    home: {
      eyebrow: "五维合参 · 个人成长命盘",
      title: "打开你的成长命盘指挥台",
      subtitle: "把八字、紫微、星盘、塔罗、面相手相与行为上下文连成一张动态地图，生成今天能执行的成长建议。",
      methodLabel: "分析方式",
      primaryCta: "生成我的成长命盘",
      secondaryCta: "查看样例报告",
    },
    destiny: {
      eyebrow: "不是一次算命，是持续更新的成长系统",
      title: "用五维合参看清当下模式",
      subtitle: "系统交叉验证财富、事业、关系、健康与精神状态，输出当前阶段、盲点、机会窗口和行动建议。",
      methodLabel: "合参信号",
      primaryCta: "开始生成命盘",
      secondaryCta: "先看完整样例",
    },
  },
  methodStrip: ["八字", "紫微", "星盘", "塔罗", "面相/手相", "行为上下文"],
  commandCenter: {
    title: "今日成长命盘",
    description: "样例展示：真实结果会根据你的出生信息、当前问题和反馈记录动态生成。",
    todayPattern: "调整后上升期",
    blindSpot: "容易把短期情绪当成长期判断",
    opportunity: "适合推进已验证的计划，不适合临时更换方向",
    action: "先完成一件高确定性的任务，再处理关系或金钱相关决策。",
  },
  dimensions: [
    { key: "wealth", name: "财富", label: "资源流动", color: "#C7A45D", signal: "风险偏好与资源压力", contribution: "判断今天适合守、攻，还是延后承诺。", action: "避免因为焦虑做长期财务承诺。" },
    { key: "career", name: "事业", label: "执行节奏", color: "#4FA37B", signal: "推进力、协作阻力、时间窗口", contribution: "识别适合独立推进还是借力协作。", action: "把复杂任务拆成一个可交付节点。" },
    { key: "relationship", name: "关系", label: "情绪摩擦", color: "#C85D72", signal: "沟通压力与亲密边界", contribution: "发现关系中的投射和误判。", action: "先复述对方需求，再表达自己的边界。" },
    { key: "health", name: "健康", label: "能量恢复", color: "#5A8FD8", signal: "体力节律、睡眠压力、恢复速度", contribution: "判断今天适合冲刺还是修复。", action: "把高消耗任务放到上午，晚上减少刺激。" },
    { key: "spirit", name: "精神", label: "意义方向", color: "#9A78D6", signal: "自我信念与长期方向感", contribution: "校准短期行动和长期意义是否一致。", action: "写下今天最想保护的一件长期价值。" },
  ],
  workflow: [
    { title: "输入信号", body: "出生信息、当前问题、行为反馈进入同一个上下文。", output: "得到一组可交叉验证的基础信号。" },
    { title: "五维合参", body: "系统把财富、事业、关系、健康、精神放在同一张图里比较。", output: "识别当前模式、主要矛盾和变化窗口。" },
    { title: "转成行动", body: "不是停在解释，而是把模式翻译成今日建议和本周实验。", output: "获得一个能执行、能复盘的行动。" },
  ],
  reportTabs: [
    { key: "today", label: "今日", title: "先稳住节奏，再做选择", body: "今天的关键不是增加信息，而是减少摇摆。", bullets: ["推进一个已确认任务", "延后高情绪决策", "记录一个反复出现的念头"] },
    { key: "week", label: "本周", title: "建立可复盘的小闭环", body: "本周适合用小结果验证方向，不适合一次性推翻原计划。", bullets: ["选一个核心项目", "设置三天反馈点", "减少无效社交消耗"] },
    { key: "cycle", label: "长周期", title: "从证明自己转向建设系统", body: "长期主题是把个人能力沉淀为稳定结构。", bullets: ["建立固定输出机制", "保留恢复时间", "选择能复利的关系"] },
  ],
  services: [
    { title: "成长命盘", body: "生成你的五维画像、当前阶段和行动建议。", href: "/reading/new" },
    { title: "今日趋势", body: "查看当天节奏、风险提醒和适合推进的事。", href: "/almanac" },
    { title: "知识地图", body: "理解八字、紫微、星盘等系统如何参与合参。", href: "/knowledge" },
  ],
  trust: [
    { title: "不把命理包装成绝对预测", body: "系统用于模式识别、反思和决策辅助，不替代医疗、法律或财务建议。" },
    { title: "不是越长越专业", body: "报告重点是结论、依据和行动，而不是堆砌术语。" },
    { title: "五维交叉验证", body: "单一信号只做参考，最终建议来自多个维度之间的一致与冲突。" },
  ],
  finalCta: {
    title: "从今天开始记录你的变化",
    body: "生成一次命盘，获得今日行动，并在后续反馈中让画像持续更新。",
    primary: "生成我的成长命盘",
    secondary: "查看方法说明",
  },
}

const en: GrowthCopy = {
  hero: {
    home: {
      eyebrow: "Five-Dimensional Growth Chart",
      title: "Open your growth command center",
      subtitle: "Bazi, Ziwei, astrology, tarot, face and palm signals, and behavior context become a living map with one practical action for today.",
      methodLabel: "Analysis method",
      primaryCta: "Generate My Growth Chart",
      secondaryCta: "View Sample Report",
    },
    destiny: {
      eyebrow: "Not a one-time reading. A living growth system.",
      title: "Understand your current pattern through five dimensions",
      subtitle: "We cross-check wealth, career, relationships, health, and spirit to surface your phase, blind spot, opportunity window, and next action.",
      methodLabel: "Signals",
      primaryCta: "Start My Chart",
      secondaryCta: "View Full Sample",
    },
  },
  methodStrip: ["Bazi", "Ziwei", "Astrology", "Tarot", "Face/Palm", "Behavior Context"],
  commandCenter: {
    title: "Today Growth Chart",
    description: "Sample view: your real result is generated from your birth data, current question, and feedback history.",
    todayPattern: "Rising after adjustment",
    blindSpot: "Treating temporary emotion as long-term truth",
    opportunity: "Good for advancing validated plans, not sudden direction changes",
    action: "Complete one high-certainty task before handling relationship or money decisions.",
  },
  dimensions: [
    { key: "wealth", name: "Wealth", label: "Resource Flow", color: "#C7A45D", signal: "Risk appetite and resource pressure", contribution: "Clarifies whether today favors holding, pushing, or delaying commitments.", action: "Avoid long-term financial promises made from anxiety." },
    { key: "career", name: "Career", label: "Execution Rhythm", color: "#4FA37B", signal: "Momentum, collaboration friction, timing", contribution: "Shows whether to move alone or borrow support.", action: "Turn the complex task into one shippable checkpoint." },
    { key: "relationship", name: "Relationship", label: "Emotional Friction", color: "#C85D72", signal: "Communication pressure and boundaries", contribution: "Reveals projection and misread tension.", action: "Repeat the other person's need before stating your boundary." },
    { key: "health", name: "Health", label: "Recovery Rhythm", color: "#5A8FD8", signal: "Energy, sleep pressure, recovery speed", contribution: "Clarifies whether today is for sprinting or repair.", action: "Put demanding work in the morning and reduce stimulation at night." },
    { key: "spirit", name: "Spirit", label: "Meaning Direction", color: "#9A78D6", signal: "Self-belief and long-cycle direction", contribution: "Checks whether short actions match long-term meaning.", action: "Write down one long-term value you want to protect today." },
  ],
  workflow: [
    { title: "Collect signals", body: "Birth data, current question, and behavior feedback enter one context.", output: "A base set of cross-checkable signals." },
    { title: "Synthesize dimensions", body: "We compare wealth, career, relationships, health, and spirit in one map.", output: "Your current pattern, core tension, and change window." },
    { title: "Translate to action", body: "The system turns interpretation into one daily action and one weekly experiment.", output: "A practical step you can execute and review." },
  ],
  reportTabs: [
    { key: "today", label: "Today", title: "Stabilize rhythm before choosing", body: "Today is about reducing swing, not collecting more information.", bullets: ["Move one confirmed task", "Delay high-emotion decisions", "Log one recurring thought"] },
    { key: "week", label: "This Week", title: "Build a reviewable loop", body: "Use small outcomes to test direction instead of replacing the whole plan.", bullets: ["Choose one core project", "Set a three-day feedback point", "Reduce low-value social drain"] },
    { key: "cycle", label: "Long Cycle", title: "Shift from proving yourself to building systems", body: "The long-term theme is turning personal ability into stable structure.", bullets: ["Create a fixed output rhythm", "Protect recovery time", "Choose compounding relationships"] },
  ],
  services: [
    { title: "Growth Chart", body: "Generate your five-dimensional profile, current phase, and action plan.", href: "/reading/new" },
    { title: "Daily Trend", body: "See today's rhythm, risk reminders, and suitable moves.", href: "/almanac" },
    { title: "Knowledge Map", body: "Learn how Bazi, Ziwei, astrology, and other systems join the synthesis.", href: "/knowledge" },
  ],
  trust: [
    { title: "Not absolute prediction", body: "The system supports pattern recognition, reflection, and decisions. It does not replace medical, legal, or financial advice." },
    { title: "Not longer for the sake of longer", body: "Reports prioritize conclusion, reasoning, and action over terminology." },
    { title: "Cross-validated by five dimensions", body: "Single signals are reference points. Final guidance comes from agreements and conflicts across dimensions." },
  ],
  finalCta: {
    title: "Start tracking your change today",
    body: "Generate your chart, receive today's action, and let your profile evolve through feedback.",
    primary: "Generate My Growth Chart",
    secondary: "Read Method",
  },
}

export function getGrowthCopy(locale: Locale): GrowthCopy {
  return locale === "zh" ? zh : en
}

export function getHeroCopy(locale: Locale, variant: HeroVariant): HeroCopy {
  return getGrowthCopy(locale).hero[variant]
}
```

- [ ] **Step 2: Run TypeScript check after content creation**

Run: `cd frontend; npx.cmd tsc --noEmit`

Expected: no new type errors from `growthContent.ts`.

- [ ] **Step 3: Commit**

Run:

```powershell
git add frontend/src/components/marketing-growth/growthContent.ts
git commit -m "feat: add growth marketing content model"
```

---

### Task 2: Shared Product-Led Hero

**Files:**
- Create: `frontend/src/components/marketing-growth/GrowthCommandHero.tsx`

**Interfaces:**
- Consumes:
  - `getGrowthCopy(locale)`
  - `getHeroCopy(locale, variant)`
  - `HeroVariant`
- Produces:
  - `GrowthCommandHero({ variant }: { variant: HeroVariant })`

- [ ] **Step 1: Create the shared first-screen hero**

Create `frontend/src/components/marketing-growth/GrowthCommandHero.tsx`:

```tsx
"use client"

import Link from "next/link"
import { ArrowRight, Activity, Brain, CheckCircle2, GitBranch, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy, getHeroCopy, type HeroVariant } from "./growthContent"

export function GrowthCommandHero({ variant }: { variant: HeroVariant }) {
  const { locale, localeHref } = useLanguage()
  const copy = getGrowthCopy(locale === "zh" ? "zh" : "en")
  const hero = getHeroCopy(locale === "zh" ? "zh" : "en", variant)

  return (
    <section className="relative min-h-[92vh] overflow-hidden px-4 pb-14 pt-24 sm:pt-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(199,164,93,0.16),transparent_34%),linear-gradient(180deg,rgba(8,10,14,0.3),#080808_82%)]" />
        <div className="absolute left-1/2 top-16 h-[520px] w-[880px] -translate-x-1/2 rounded-full border border-white/[0.04]" />
        <div className="absolute left-1/2 top-28 h-[360px] w-[620px] -translate-x-1/2 rounded-full border border-gold/[0.08]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 border border-gold/20 bg-gold/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/75">
            <Sparkles size={14} />
            {hero.eyebrow}
          </div>

          <h1 className="font-serif text-4xl font-bold leading-[1.02] tracking-normal text-white sm:text-5xl lg:text-7xl">
            {hero.title}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/62">
            {hero.subtitle}
          </p>

          <div className="mt-7">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/60">
              {hero.methodLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {copy.methodStrip.map((item) => (
                <span key={item} className="border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-white/62">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={localeHref("/reading/new")} className="btn-gold inline-flex items-center justify-center gap-2 px-7 py-3 text-sm">
              {hero.primaryCta}
              <ArrowRight size={16} />
            </Link>
            <a href="#sample-growth-report" className="btn-gold-outline inline-flex items-center justify-center gap-2 px-7 py-3 text-sm">
              {hero.secondaryCta}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="border border-white/[0.08] bg-[#0A1118]/92 p-4 shadow-[0_40px_140px_rgba(0,0,0,0.48)] sm:p-5">
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="border border-gold/15 bg-gold/[0.045] p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/65">{copy.commandCenter.title}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{copy.commandCenter.todayPattern}</h2>
                  </div>
                  <Activity className="text-gold" size={22} />
                </div>

                <div className="relative mx-auto my-7 aspect-square max-w-[330px]">
                  <div className="absolute inset-[15%] rounded-full border border-white/[0.06]" />
                  <div className="absolute inset-[27%] rounded-full border border-gold/[0.10]" />
                  <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 border border-gold/25 bg-black/25 text-center">
                    <div className="flex h-full flex-col items-center justify-center">
                      <Brain size={20} className="mb-1 text-gold" />
                      <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">5D Sync</span>
                    </div>
                  </div>
                  {copy.dimensions.map((dimension, index) => {
                    const positions = [
                      "left-1/2 top-0 -translate-x-1/2",
                      "right-0 top-[28%]",
                      "right-[10%] bottom-[4%]",
                      "left-[10%] bottom-[4%]",
                      "left-0 top-[28%]",
                    ]
                    return (
                      <div key={dimension.key} className={`absolute ${positions[index]} w-28 border border-white/[0.08] bg-black/35 p-2 backdrop-blur`}>
                        <div className="mb-1 h-1.5 w-8" style={{ backgroundColor: dimension.color }} />
                        <p className="text-xs font-semibold text-white/85">{dimension.name}</p>
                        <p className="mt-1 text-[10px] leading-snug text-white/42">{dimension.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="border border-white/[0.08] bg-white/[0.035] p-5">
                  <div className="mb-4 flex items-center gap-2 text-gold/75">
                    <GitBranch size={18} />
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]">Output Preview</p>
                  </div>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.16em] text-white/35">Blind spot</dt>
                      <dd className="mt-1 text-sm leading-6 text-white/78">{copy.commandCenter.blindSpot}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.16em] text-white/35">Opportunity</dt>
                      <dd className="mt-1 text-sm leading-6 text-white/78">{copy.commandCenter.opportunity}</dd>
                    </div>
                  </dl>
                </div>

                <div className="border border-gold/18 bg-gold/[0.055] p-5">
                  <div className="mb-3 flex items-center gap-2 text-gold">
                    <CheckCircle2 size={18} />
                    <p className="text-sm font-semibold">Today Action</p>
                  </div>
                  <p className="text-sm leading-7 text-white/76">{copy.commandCenter.action}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd frontend; npx.cmd tsc --noEmit`

Expected: no errors from `GrowthCommandHero.tsx`.

- [ ] **Step 3: Commit**

Run:

```powershell
git add frontend/src/components/marketing-growth/GrowthCommandHero.tsx
git commit -m "feat: add product-led growth hero"
```

---

### Task 3: Mid-Page Product Journey Sections

**Files:**
- Create: `frontend/src/components/marketing-growth/FiveDimensionCommandCenter.tsx`
- Create: `frontend/src/components/marketing-growth/SignalToActionWorkflow.tsx`
- Create: `frontend/src/components/marketing-growth/SampleGrowthReport.tsx`

**Interfaces:**
- Produces:
  - `FiveDimensionCommandCenter()`
  - `SignalToActionWorkflow()`
  - `SampleGrowthReport()`

- [ ] **Step 1: Build five-dimension command center**

Create `frontend/src/components/marketing-growth/FiveDimensionCommandCenter.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy, type DimensionKey } from "./growthContent"

export function FiveDimensionCommandCenter() {
  const { locale } = useLanguage()
  const copy = getGrowthCopy(locale === "zh" ? "zh" : "en")
  const [active, setActive] = useState<DimensionKey>("career")
  const activeDimension = copy.dimensions.find((dimension) => dimension.key === active) ?? copy.dimensions[0]

  return (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/60">Five-Dimensional Synthesis</p>
            <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">{copy.commandCenter.title}</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/55 lg:ml-auto">{copy.commandCenter.description}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border border-white/[0.08] bg-white/[0.025] p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.dimensions.map((dimension) => (
                <button
                  key={dimension.key}
                  type="button"
                  onClick={() => setActive(dimension.key)}
                  className="group border p-4 text-left transition-colors"
                  style={{
                    borderColor: active === dimension.key ? `${dimension.color}80` : "rgba(255,255,255,0.08)",
                    background: active === dimension.key ? `${dimension.color}12` : "rgba(255,255,255,0.02)",
                  }}
                >
                  <div className="mb-3 h-1 w-10" style={{ backgroundColor: dimension.color }} />
                  <h3 className="text-base font-semibold text-white">{dimension.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/36">{dimension.label}</p>
                  <p className="mt-3 text-sm leading-6 text-white/56">{dimension.signal}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-gold/15 bg-[#0B1118] p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/60">Active Lens</p>
            <h3 className="mt-3 text-3xl font-semibold text-white" style={{ color: activeDimension.color }}>{activeDimension.name}</h3>
            <div className="mt-8 grid gap-4">
              <div className="border border-white/[0.08] bg-black/20 p-5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Contribution</p>
                <p className="mt-2 text-base leading-7 text-white/75">{activeDimension.contribution}</p>
              </div>
              <div className="border border-white/[0.08] bg-black/20 p-5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Action Translation</p>
                <p className="mt-2 text-base leading-7 text-white/75">{activeDimension.action}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Build signal-to-action workflow**

Create `frontend/src/components/marketing-growth/SignalToActionWorkflow.tsx`:

```tsx
"use client"

import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy } from "./growthContent"

export function SignalToActionWorkflow() {
  const { locale } = useLanguage()
  const copy = getGrowthCopy(locale === "zh" ? "zh" : "en")

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/60">Signal To Action</p>
          <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">
            {locale === "zh" ? "从命理信号到今天能做的事" : "From destiny signals to today's action"}
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {copy.workflow.map((step, index) => (
            <div key={step.title} className="relative border border-white/[0.08] bg-white/[0.025] p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/65">0{index + 1}</span>
                {index < copy.workflow.length - 1 && <ArrowRight className="hidden text-white/25 lg:block" size={18} />}
              </div>
              <h3 className="text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/52">{step.body}</p>
              <div className="mt-6 border border-gold/15 bg-gold/[0.045] p-4">
                <p className="text-xs leading-6 text-gold/85">{step.output}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Build sample report section**

Create `frontend/src/components/marketing-growth/SampleGrowthReport.tsx`:

```tsx
"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy } from "./growthContent"

export function SampleGrowthReport() {
  const { locale } = useLanguage()
  const copy = getGrowthCopy(locale === "zh" ? "zh" : "en")
  const [activeKey, setActiveKey] = useState(copy.reportTabs[0].key)
  const active = copy.reportTabs.find((tab) => tab.key === activeKey) ?? copy.reportTabs[0]

  return (
    <section id="sample-growth-report" className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl border border-white/[0.08] bg-[#0A1017] p-4 sm:p-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/60">Sample Report</p>
            <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">
              {locale === "zh" ? "不是长篇玄学解释，而是可复盘的输出" : "Not a long mystical essay. A reviewable output."}
            </h2>
          </div>
          <div className="flex border border-white/[0.08] bg-black/20 p-1">
            {copy.reportTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveKey(tab.key)}
                className={`px-4 py-2 text-sm transition-colors ${active.key === tab.key ? "bg-gold text-black" : "text-white/55 hover:text-white"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border border-gold/15 bg-gold/[0.045] p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold/60">Growth Archetype</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">{active.title}</h3>
            <p className="mt-4 text-base leading-8 text-white/65">{active.body}</p>
          </div>
          <div className="grid gap-3">
            {active.bullets.map((bullet) => (
              <div key={bullet} className="flex gap-3 border border-white/[0.08] bg-white/[0.025] p-4">
                <Check className="mt-0.5 shrink-0 text-gold" size={18} />
                <p className="text-sm leading-6 text-white/70">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run TypeScript check**

Run: `cd frontend; npx.cmd tsc --noEmit`

Expected: no errors from the three new components.

- [ ] **Step 5: Commit**

Run:

```powershell
git add frontend/src/components/marketing-growth/FiveDimensionCommandCenter.tsx frontend/src/components/marketing-growth/SignalToActionWorkflow.tsx frontend/src/components/marketing-growth/SampleGrowthReport.tsx
git commit -m "feat: add growth marketing journey sections"
```

---

### Task 4: Trust, Service Paths, Final CTA

**Files:**
- Create: `frontend/src/components/marketing-growth/MethodTrustSection.tsx`
- Create: `frontend/src/components/marketing-growth/GrowthServicePaths.tsx`
- Create: `frontend/src/components/marketing-growth/FinalGrowthCTA.tsx`

**Interfaces:**
- Produces:
  - `MethodTrustSection()`
  - `GrowthServicePaths()`
  - `FinalGrowthCTA()`

- [ ] **Step 1: Build trust section**

Create `frontend/src/components/marketing-growth/MethodTrustSection.tsx`:

```tsx
"use client"

import { ShieldCheck } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy } from "./growthContent"

export function MethodTrustSection() {
  const { locale } = useLanguage()
  const copy = getGrowthCopy(locale === "zh" ? "zh" : "en")

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/60">Method & Trust</p>
          <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">
            {locale === "zh" ? "我们不和别人拼更玄，而是拼更有用" : "We do not compete on being more mystical. We compete on usefulness."}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {copy.trust.map((item) => (
            <div key={item.title} className="border border-white/[0.08] bg-white/[0.025] p-6">
              <ShieldCheck className="mb-5 text-gold" size={24} />
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/55">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Build service paths**

Create `frontend/src/components/marketing-growth/GrowthServicePaths.tsx`:

```tsx
"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy } from "./growthContent"

export function GrowthServicePaths() {
  const { locale, localeHref } = useLanguage()
  const copy = getGrowthCopy(locale === "zh" ? "zh" : "en")

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/60">Product Paths</p>
            <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">
              {locale === "zh" ? "从一次生成，到每天使用" : "From one generation to daily use"}
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/55 lg:ml-auto">
            {locale === "zh" ? "首页不再只展示功能，而是让用户看到自己可以从哪里开始、接下来用什么。" : "The homepage should not only list features. It should show where users start and what they use next."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {copy.services.map((service) => (
            <Link key={service.title} href={localeHref(service.href)} className="group border border-white/[0.08] bg-white/[0.025] p-6 transition-colors hover:border-gold/35 hover:bg-gold/[0.045]">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.2em] text-gold/60">Path</span>
                <ArrowUpRight className="text-white/35 transition-colors group-hover:text-gold" size={18} />
              </div>
              <h3 className="text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/55">{service.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Build final CTA**

Create `frontend/src/components/marketing-growth/FinalGrowthCTA.tsx`:

```tsx
"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy } from "./growthContent"

export function FinalGrowthCTA() {
  const { locale, localeHref } = useLanguage()
  const copy = getGrowthCopy(locale === "zh" ? "zh" : "en")

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl border border-gold/18 bg-[linear-gradient(135deg,rgba(199,164,93,0.12),rgba(255,255,255,0.025))] p-8 text-center sm:p-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/65">Start</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl font-bold text-white sm:text-5xl">{copy.finalCta.title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/62">{copy.finalCta.body}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={localeHref("/reading/new")} className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-3 text-sm">
            {copy.finalCta.primary}
            <ArrowRight size={16} />
          </Link>
          <a href="#sample-growth-report" className="btn-gold-outline inline-flex items-center justify-center px-8 py-3 text-sm">
            {copy.finalCta.secondary}
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run TypeScript check**

Run: `cd frontend; npx.cmd tsc --noEmit`

Expected: no errors from the three new components.

- [ ] **Step 5: Commit**

Run:

```powershell
git add frontend/src/components/marketing-growth/MethodTrustSection.tsx frontend/src/components/marketing-growth/GrowthServicePaths.tsx frontend/src/components/marketing-growth/FinalGrowthCTA.tsx
git commit -m "feat: add growth marketing trust and conversion sections"
```

---

### Task 5: Recompose Homepage And Destiny Page

**Files:**
- Modify: `frontend/src/app/[locale]/page.tsx`
- Modify: `frontend/src/app/[locale]/destiny/page.tsx`

**Interfaces:**
- Consumes all components from Tasks 2-4.
- Produces complete unauthenticated journeys for `/zh`, `/en`, `/zh/destiny`, and `/en/destiny`.

- [ ] **Step 1: Replace unauthenticated homepage route composition**

In `frontend/src/app/[locale]/page.tsx`, keep authenticated user dashboard behavior unchanged. Replace only the unauthenticated return path imports and JSX.

Use these imports:

```tsx
const GrowthCommandHero = dynamic(() => import("@/components/marketing-growth/GrowthCommandHero").then(m => m.GrowthCommandHero), { ssr: true })
const FiveDimensionCommandCenter = dynamic(() => import("@/components/marketing-growth/FiveDimensionCommandCenter").then(m => m.FiveDimensionCommandCenter), { ssr: false })
const SignalToActionWorkflow = dynamic(() => import("@/components/marketing-growth/SignalToActionWorkflow").then(m => m.SignalToActionWorkflow), { ssr: false })
const SampleGrowthReport = dynamic(() => import("@/components/marketing-growth/SampleGrowthReport").then(m => m.SampleGrowthReport), { ssr: false })
const GrowthServicePaths = dynamic(() => import("@/components/marketing-growth/GrowthServicePaths").then(m => m.GrowthServicePaths), { ssr: false })
const MethodTrustSection = dynamic(() => import("@/components/marketing-growth/MethodTrustSection").then(m => m.MethodTrustSection), { ssr: false })
const FinalGrowthCTA = dynamic(() => import("@/components/marketing-growth/FinalGrowthCTA").then(m => m.FinalGrowthCTA), { ssr: false })
```

Use this unauthenticated route body:

```tsx
return (
  <div className="relative z-10 min-h-screen bg-[#080808]">
    <GrowthCommandHero variant="home" />
    <ErrorBoundary sectionName="Five Dimension Command Center">
      <FiveDimensionCommandCenter />
    </ErrorBoundary>
    <ErrorBoundary sectionName="Signal To Action Workflow">
      <SignalToActionWorkflow />
    </ErrorBoundary>
    <ErrorBoundary sectionName="Sample Growth Report">
      <SampleGrowthReport />
    </ErrorBoundary>
    <ErrorBoundary sectionName="Growth Service Paths">
      <GrowthServicePaths />
    </ErrorBoundary>
    <ErrorBoundary sectionName="Method Trust">
      <MethodTrustSection />
    </ErrorBoundary>
    <ErrorBoundary sectionName="Final Growth CTA">
      <FinalGrowthCTA />
    </ErrorBoundary>
  </div>
)
```

- [ ] **Step 2: Replace destiny route composition**

In `frontend/src/app/[locale]/destiny/page.tsx`, replace the current route with:

```tsx
"use client"

import dynamic from "next/dynamic"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

const GrowthCommandHero = dynamic(() => import("@/components/marketing-growth/GrowthCommandHero").then(m => m.GrowthCommandHero), { ssr: true })
const FiveDimensionCommandCenter = dynamic(() => import("@/components/marketing-growth/FiveDimensionCommandCenter").then(m => m.FiveDimensionCommandCenter), { ssr: false })
const SignalToActionWorkflow = dynamic(() => import("@/components/marketing-growth/SignalToActionWorkflow").then(m => m.SignalToActionWorkflow), { ssr: false })
const SampleGrowthReport = dynamic(() => import("@/components/marketing-growth/SampleGrowthReport").then(m => m.SampleGrowthReport), { ssr: false })
const MethodTrustSection = dynamic(() => import("@/components/marketing-growth/MethodTrustSection").then(m => m.MethodTrustSection), { ssr: false })
const GrowthServicePaths = dynamic(() => import("@/components/marketing-growth/GrowthServicePaths").then(m => m.GrowthServicePaths), { ssr: false })
const FinalGrowthCTA = dynamic(() => import("@/components/marketing-growth/FinalGrowthCTA").then(m => m.FinalGrowthCTA), { ssr: false })

export default function DestinyPage() {
  return (
    <div className="relative z-10 min-h-screen bg-[#080808]">
      <GrowthCommandHero variant="destiny" />
      <ErrorBoundary sectionName="Five Dimension Command Center">
        <FiveDimensionCommandCenter />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Signal To Action Workflow">
        <SignalToActionWorkflow />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Sample Growth Report">
        <SampleGrowthReport />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Method Trust">
        <MethodTrustSection />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Growth Service Paths">
        <GrowthServicePaths />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Final Growth CTA">
        <FinalGrowthCTA />
      </ErrorBoundary>
    </div>
  )
}
```

- [ ] **Step 3: Run TypeScript check**

Run: `cd frontend; npx.cmd tsc --noEmit`

Expected: no route composition type errors.

- [ ] **Step 4: Commit**

Run:

```powershell
git add frontend/src/app/[locale]/page.tsx frontend/src/app/[locale]/destiny/page.tsx
git commit -m "feat: recompose homepage and destiny growth journeys"
```

---

### Task 6: Verification, Polish, And Deploy Readiness

**Files:**
- Modify only files from Tasks 1-5 if verification finds concrete defects.

**Interfaces:**
- Produces verified local build and browser-reviewed pages.

- [ ] **Step 1: Run lint**

Run: `cd frontend; npm.cmd run lint`

Expected: command completes. Existing warnings are acceptable only if unrelated to touched files.

- [ ] **Step 2: Run production build**

Run: `cd frontend; npm.cmd run build`

Expected: build completes and includes `/en`, `/zh`, `/en/destiny`, `/zh/destiny`.

- [ ] **Step 3: Start local server**

Run: `cd frontend; npm.cmd run start -- --hostname 127.0.0.1 --port 3000`

Expected: local Next server starts on `http://127.0.0.1:3000`.

- [ ] **Step 4: Browser-check core pages**

Use Playwright or browser testing to check:

- `http://127.0.0.1:3000/zh`
- `http://127.0.0.1:3000/en`
- `http://127.0.0.1:3000/zh/destiny`
- `http://127.0.0.1:3000/en/destiny`

Expected:

- First viewport shows product UI, method strip, output preview, and CTA.
- No text overlap on desktop or mobile.
- CTA links resolve to localized `/reading/new`.
- Sample report anchor scrolls to the report section.
- Chinese text renders without mojibake.

- [ ] **Step 5: Stop local server**

Stop the local server session cleanly.

- [ ] **Step 6: Commit verification fixes**

If fixes were needed:

```powershell
git add frontend/src/components/marketing-growth frontend/src/app/[locale]/page.tsx frontend/src/app/[locale]/destiny/page.tsx
git commit -m "fix: polish growth marketing page verification issues"
```

If no fixes were needed, do not create an empty commit.

