import { translateYiJi } from "@/lib/translations"

export interface TrendAlmanacItem {
  label: string
  value?: string
  score?: number
}

export interface TrendGuardItem {
  label: string
  value?: string
  reason?: string
  productName?: string
  score?: number
}

export interface DailyTrendSource {
  date: string
  lunar_date?: string
  lunarDate?: string
  bazi_day_pillar?: string
  baziDayPillar?: string
  energy_score?: number
  day_score?: number
  dayScore?: number
  yi?: Array<string | TrendAlmanacItem>
  ji?: Array<string | TrendAlmanacItem>
  hu?: Array<TrendGuardItem | { product?: { name?: string }; reason?: string }>
  daily_quote?: string
  dailyQuote?: string
  wuxing_analysis?: string
  wuxingAnalysis?: string
}

export interface DailyTrendViewModel {
  date: string
  lunarDate: string
  baziDayPillar: string
  score: number
  level: "high" | "steady" | "low"
  trendLabel: string
  headline: string
  summary: string
  focusArea: string
  riskSignal: string
  actions: string[]
  timeWindows: Array<{ label: string; text: string }>
  dimensions: Array<{ label: string; value: number; note: string }>
  yi: TrendAlmanacItem[]
  ji: TrendAlmanacItem[]
  hu: TrendGuardItem[]
  dailyQuote: string
  wuxingAnalysis: string
}

const zhCopy = {
  level: {
    high: "顺势推进",
    steady: "稳中校准",
    low: "收缩防守",
  },
  headline: {
    high: "今天适合把重要事项往前推一步",
    steady: "今天适合稳住节奏，先校准再行动",
    low: "今天适合减少消耗，优先处理风险与边界",
  },
  summary: {
    high: "整体状态偏强，可以安排需要判断力、表达力和推进力的任务，但仍要给关键决定留复盘空间。",
    steady: "整体状态中性偏稳，适合处理已知事项、补齐信息和推进小步实验，不宜临时扩大承诺。",
    low: "整体状态偏紧，容易被外部节奏牵动。先保护专注、现金流和身体状态，再考虑新的动作。",
  },
  focus: {
    high: "推进关键任务",
    steady: "整理信息与节奏",
    low: "降低风险敞口",
  },
  risk: {
    high: "避免因为状态好就过度承诺，尤其是时间、金钱和关系中的长期承诺。",
    steady: "警惕拖延式观望。今天不是完全不动，而是用小动作验证方向。",
    low: "避免硬扛、硬谈、硬启动。把高成本决定延后到信息更清楚的时候。",
  },
  actions: {
    high: ["先完成一件最能改变局面的任务", "把沟通写成明确下一步，不停留在感觉层面", "晚上复盘今天新增的承诺，删掉不必要的"],
    steady: ["列出今天三个必须完成的小闭环", "先补证据再做判断，避免凭情绪下结论", "把一个长期目标拆成 30 分钟动作"],
    low: ["推迟非必要的大额支出或强对抗沟通", "清理一个会持续消耗注意力的未完成事项", "给身体和睡眠留出不可被挤占的恢复时间"],
  },
  time: {
    morning: "上午",
    afternoon: "下午",
    evening: "晚上",
    high: ["处理最难的判断或表达", "推进协作、签字、发布或对外沟通", "收口承诺，做一次轻复盘"],
    steady: ["整理资料和优先级", "完成可验证的小动作", "做计划修正，不临时加码"],
    low: ["只做必要事项", "处理存量问题，少开新局", "降低刺激，早点恢复"],
  },
  dims: ["事业", "财富", "关系", "身心"],
}

const enCopy = {
  level: {
    high: "Push forward",
    steady: "Calibrate first",
    low: "Protect energy",
  },
  headline: {
    high: "A good day to move one important thing forward",
    steady: "A day for steady progress and clearer judgment",
    low: "A day to reduce exposure and protect your bandwidth",
  },
  summary: {
    high: "Your overall signal is strong. Use it for decisions, communication, and meaningful progress while leaving room to review commitments.",
    steady: "The signal is balanced. Handle known work, fill information gaps, and test direction with small moves instead of expanding commitments.",
    low: "The signal is tight. External pressure may pull your attention. Protect focus, cash flow, and recovery before starting anything new.",
  },
  focus: {
    high: "Move key work",
    steady: "Clarify the rhythm",
    low: "Reduce exposure",
  },
  risk: {
    high: "Do not overcommit just because the day feels open, especially with time, money, or long-term relationships.",
    steady: "Watch for passive waiting. The right move today is small validation, not total stillness.",
    low: "Avoid forcing launches, confrontations, or large decisions before the facts are clearer.",
  },
  actions: {
    high: ["Finish the task that changes the most", "Turn conversations into explicit next steps", "Review new commitments tonight and remove the weak ones"],
    steady: ["Close three small loops today", "Collect evidence before making the call", "Break one long-term goal into a 30-minute action"],
    low: ["Delay nonessential spending or high-friction talks", "Clear one open loop that keeps draining attention", "Protect recovery time from being crowded out"],
  },
  time: {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    high: ["Do the hardest judgment or expression work", "Move collaboration, signing, publishing, or outreach", "Close commitments and run a light review"],
    steady: ["Sort priorities and materials", "Complete one verifiable small action", "Adjust the plan without adding scope"],
    low: ["Do only what is necessary", "Handle existing issues instead of opening new ones", "Lower stimulation and recover early"],
  },
  dims: ["Career", "Wealth", "Relationships", "Body"],
}

function normalizeItems(items: DailyTrendSource["yi"] = [], isZh: boolean): TrendAlmanacItem[] {
  return items.map((item) => {
    if (typeof item === "string") {
      return { label: isZh ? item : translateYiJi(item), value: "" }
    }
    return {
      label: isZh ? item.label : translateYiJi(item.label),
      value: item.value ?? "",
      score: item.score,
    }
  })
}

function normalizeGuardItems(items: DailyTrendSource["hu"] = []): TrendGuardItem[] {
  return items.map((item) => {
    const guard = item as TrendGuardItem & { product?: { name?: string } }
    const productName = guard.product?.name ?? guard.productName
    const label = guard.label ?? ""
    const value = guard.value ?? productName
    const score = guard.score
    const reason = guard.reason ?? label ?? ""
    return {
      label: reason || productName || "",
      value,
      productName,
      reason,
      score,
    }
  })
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 50
  return Math.max(0, Math.min(100, Math.round(score)))
}

function buildDimensions(score: number, yiCount: number, jiCount: number, labels: string[]) {
  const offsets = [4 + yiCount * 2, -2 - jiCount * 2, 1 + yiCount - jiCount, -4 + Math.min(jiCount, 2)]
  const notesZh = ["推进力", "谨慎度", "沟通温度", "恢复余量"]
  const notesEn = ["Momentum", "Caution", "Connection", "Recovery"]
  const notes = labels[0] === "事业" ? notesZh : notesEn

  return labels.map((label, index) => ({
    label,
    value: clampScore(score + offsets[index]),
    note: notes[index],
  }))
}

export function buildDailyTrendViewModel(source: DailyTrendSource, locale: string): DailyTrendViewModel {
  const isZh = locale === "zh"
  const copy = isZh ? zhCopy : enCopy
  const score = clampScore(source.energy_score ?? source.day_score ?? source.dayScore ?? 50)
  const level: DailyTrendViewModel["level"] = score >= 72 ? "high" : score >= 45 ? "steady" : "low"
  const yi = normalizeItems(source.yi, isZh).slice(0, 5)
  const ji = normalizeItems(source.ji, isZh).slice(0, 5)
  const hu = normalizeGuardItems(source.hu).slice(0, 3)
  const timeTexts = copy.time[level]

  return {
    date: source.date,
    lunarDate: source.lunar_date ?? source.lunarDate ?? "",
    baziDayPillar: source.bazi_day_pillar ?? source.baziDayPillar ?? "",
    score,
    level,
    trendLabel: copy.level[level],
    headline: copy.headline[level],
    summary: copy.summary[level],
    focusArea: copy.focus[level],
    riskSignal: copy.risk[level],
    actions: copy.actions[level],
    timeWindows: [
      { label: copy.time.morning, text: timeTexts[0] },
      { label: copy.time.afternoon, text: timeTexts[1] },
      { label: copy.time.evening, text: timeTexts[2] },
    ],
    dimensions: buildDimensions(score, yi.length, ji.length, copy.dims),
    yi,
    ji,
    hu,
    dailyQuote: source.daily_quote ?? source.dailyQuote ?? "",
    wuxingAnalysis: source.wuxing_analysis ?? source.wuxingAnalysis ?? "",
  }
}
