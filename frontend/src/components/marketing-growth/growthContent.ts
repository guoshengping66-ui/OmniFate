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
    {
      key: "wealth",
      name: "财富",
      label: "资源流动",
      color: "#C7A45D",
      signal: "风险偏好与资源压力",
      contribution: "判断今天适合守、攻，还是延后承诺。",
      action: "避免因为焦虑做长期财务承诺。",
    },
    {
      key: "career",
      name: "事业",
      label: "执行节奏",
      color: "#4FA37B",
      signal: "推进力、协作阻力、时间窗口",
      contribution: "识别适合独立推进还是借力协作。",
      action: "把复杂任务拆成一个可交付节点。",
    },
    {
      key: "relationship",
      name: "关系",
      label: "情绪摩擦",
      color: "#C85D72",
      signal: "沟通压力与亲密边界",
      contribution: "发现关系中的投射和误判。",
      action: "先复述对方需求，再表达自己的边界。",
    },
    {
      key: "health",
      name: "健康",
      label: "能量恢复",
      color: "#5A8FD8",
      signal: "体力节律、睡眠压力、恢复速度",
      contribution: "判断今天适合冲刺还是修复。",
      action: "把高消耗任务放到上午，晚上减少刺激。",
    },
    {
      key: "spirit",
      name: "精神",
      label: "意义方向",
      color: "#9A78D6",
      signal: "自我信念与长期方向感",
      contribution: "校准短期行动和长期意义是否一致。",
      action: "写下今天最想保护的一件长期价值。",
    },
  ],
  workflow: [
    {
      title: "输入信号",
      body: "出生信息、当前问题、行为反馈进入同一个上下文。",
      output: "得到一组可交叉验证的基础信号。",
    },
    {
      title: "五维合参",
      body: "系统把财富、事业、关系、健康、精神放在同一张图里比较。",
      output: "识别当前模式、主要矛盾和变化窗口。",
    },
    {
      title: "转成行动",
      body: "不是停在解释，而是把模式翻译成今日建议和本周实验。",
      output: "获得一个能执行、能复盘的行动。",
    },
  ],
  reportTabs: [
    {
      key: "today",
      label: "今日",
      title: "先稳住节奏，再做选择",
      body: "今天的关键不是增加信息，而是减少摇摆。",
      bullets: ["推进一个已确认任务", "延后高情绪决策", "记录一个反复出现的念头"],
    },
    {
      key: "week",
      label: "本周",
      title: "建立可复盘的小闭环",
      body: "本周适合用小结果验证方向，不适合一次性推翻原计划。",
      bullets: ["选一个核心项目", "设置三天反馈点", "减少无效社交消耗"],
    },
    {
      key: "cycle",
      label: "长周期",
      title: "从证明自己转向建设系统",
      body: "长期主题是把个人能力沉淀为稳定结构。",
      bullets: ["建立固定输出机制", "保留恢复时间", "选择能复利的关系"],
    },
  ],
  services: [
    { title: "成长命盘", body: "生成你的五维画像、当前阶段和行动建议。", href: "/reading/new" },
    { title: "今日趋势", body: "查看当天节奏、风险提醒和适合推进的事。", href: "/almanac" },
    { title: "知识地图", body: "理解八字、紫微、星盘等系统如何参与合参。", href: "/knowledge" },
  ],
  trust: [
    {
      title: "不把命理包装成绝对预测",
      body: "系统用于模式识别、反思和决策辅助，不替代医疗、法律或财务建议。",
    },
    { title: "不是越长越专业", body: "报告重点是结论、依据和行动，而不是堆砌术语。" },
    {
      title: "五维交叉验证",
      body: "单一信号只做参考，最终建议来自多个维度之间的一致与冲突。",
    },
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
      subtitle:
        "Bazi, Ziwei, astrology, tarot, face and palm signals, and behavior context become a living map with one practical action for today.",
      methodLabel: "Analysis method",
      primaryCta: "Generate My Growth Chart",
      secondaryCta: "View Sample Report",
    },
    destiny: {
      eyebrow: "Not a one-time reading. A living growth system.",
      title: "Understand your current pattern through five dimensions",
      subtitle:
        "We cross-check wealth, career, relationships, health, and spirit to surface your phase, blind spot, opportunity window, and next action.",
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
    {
      key: "wealth",
      name: "Wealth",
      label: "Resource Flow",
      color: "#C7A45D",
      signal: "Risk appetite and resource pressure",
      contribution: "Clarifies whether today favors holding, pushing, or delaying commitments.",
      action: "Avoid long-term financial promises made from anxiety.",
    },
    {
      key: "career",
      name: "Career",
      label: "Execution Rhythm",
      color: "#4FA37B",
      signal: "Momentum, collaboration friction, timing",
      contribution: "Shows whether to move alone or borrow support.",
      action: "Turn the complex task into one shippable checkpoint.",
    },
    {
      key: "relationship",
      name: "Relationship",
      label: "Emotional Friction",
      color: "#C85D72",
      signal: "Communication pressure and boundaries",
      contribution: "Reveals projection and misread tension.",
      action: "Repeat the other person's need before stating your boundary.",
    },
    {
      key: "health",
      name: "Health",
      label: "Recovery Rhythm",
      color: "#5A8FD8",
      signal: "Energy, sleep pressure, recovery speed",
      contribution: "Clarifies whether today is for sprinting or repair.",
      action: "Put demanding work in the morning and reduce stimulation at night.",
    },
    {
      key: "spirit",
      name: "Spirit",
      label: "Meaning Direction",
      color: "#9A78D6",
      signal: "Self-belief and long-cycle direction",
      contribution: "Checks whether short actions match long-term meaning.",
      action: "Write down one long-term value you want to protect today.",
    },
  ],
  workflow: [
    {
      title: "Collect signals",
      body: "Birth data, current question, and behavior feedback enter one context.",
      output: "A base set of cross-checkable signals.",
    },
    {
      title: "Synthesize dimensions",
      body: "We compare wealth, career, relationships, health, and spirit in one map.",
      output: "Your current pattern, core tension, and change window.",
    },
    {
      title: "Translate to action",
      body: "The system turns interpretation into one daily action and one weekly experiment.",
      output: "A practical step you can execute and review.",
    },
  ],
  reportTabs: [
    {
      key: "today",
      label: "Today",
      title: "Stabilize rhythm before choosing",
      body: "Today is about reducing swing, not collecting more information.",
      bullets: ["Move one confirmed task", "Delay high-emotion decisions", "Log one recurring thought"],
    },
    {
      key: "week",
      label: "This Week",
      title: "Build a reviewable loop",
      body: "Use small outcomes to test direction instead of replacing the whole plan.",
      bullets: ["Choose one core project", "Set a three-day feedback point", "Reduce low-value social drain"],
    },
    {
      key: "cycle",
      label: "Long Cycle",
      title: "Shift from proving yourself to building systems",
      body: "The long-term theme is turning personal ability into stable structure.",
      bullets: ["Create a fixed output rhythm", "Protect recovery time", "Choose compounding relationships"],
    },
  ],
  services: [
    { title: "Growth Chart", body: "Generate your five-dimensional profile, current phase, and action plan.", href: "/reading/new" },
    { title: "Daily Trend", body: "See today's rhythm, risk reminders, and suitable moves.", href: "/almanac" },
    { title: "Knowledge Map", body: "Learn how Bazi, Ziwei, astrology, and other systems join the synthesis.", href: "/knowledge" },
  ],
  trust: [
    {
      title: "Not absolute prediction",
      body: "The system supports pattern recognition, reflection, and decisions. It does not replace medical, legal, or financial advice.",
    },
    { title: "Not longer for the sake of longer", body: "Reports prioritize conclusion, reasoning, and action over terminology." },
    {
      title: "Cross-validated by five dimensions",
      body: "Single signals are reference points. Final guidance comes from agreements and conflicts across dimensions.",
    },
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
