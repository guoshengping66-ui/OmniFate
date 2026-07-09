/** Daily signal generation based on user's Bazi day master and current date's heavenly stems/earthly branches */

export interface DailySignal {
  n: string
  v: string
  t: string
}

const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

const STEM_NAMES: Record<string, string> = {
  "甲": "Yang Wood", "乙": "Yin Wood", "丙": "Yang Fire", "丁": "Yin Fire",
  "戊": "Yang Earth", "己": "Yin Earth", "庚": "Yang Metal", "辛": "Yin Metal",
  "壬": "Yang Water", "癸": "Yin Water",
}

// Five Element relationships for generating insights
const ELEMENT: Record<string, string> = {
  "甲": "wood", "乙": "wood", "丙": "fire", "丁": "fire",
  "戊": "earth", "己": "earth", "庚": "metal", "辛": "metal",
  "壬": "water", "癸": "water",
}

// Element cycle: generating (生), controlling (克), same (比)
function relation(dayStem: string, todayStem: string): "generate" | "control" | "same" | "drain" {
  const d = ELEMENT[dayStem]
  const t = ELEMENT[todayStem]
  const cycle: Record<string, string> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" }
  if (d === t) return "same"
  if (cycle[d] === t) return "drain"  // user's element generates today's → energy output
  if (cycle[t] === d) return "generate"  // today's element generates user's → energy input
  return "control"
}

/** Calculate heavenly stem index from a date */
function getDayStem(date: Date): number {
  // Known: 1900-01-01 is 甲子 day (stem=0, branch=0)
  const base = new Date(1900, 0, 1)
  const diffDays = Math.floor((date.getTime() - base.getTime()) / 86400000)
  return ((diffDays % 10) + 10) % 10
}

function getDayBranch(date: Date): number {
  const base = new Date(1900, 0, 1)
  const diffDays = Math.floor((date.getTime() - base.getTime()) / 86400000)
  return ((diffDays % 12) + 12) % 12
}

/** Compute the user's day stem from birth year/month/day using a simplified formula */
function computeBirthDayStem(year: number, month: number, day: number): string {
  // Use known reference: 1900-01-01 is 甲子 (stem 0)
  const base = new Date(1900, 0, 1)
  const birth = new Date(year, month - 1, day)
  const diffDays = Math.floor((birth.getTime() - base.getTime()) / 86400000)
  const stemIdx = ((diffDays % 10) + 10) % 10
  return HEAVENLY_STEMS[stemIdx]
}

interface SignalTemplate {
  zh: { v: string; t: string }
  en: { v: string; t: string }
}

function getDimensionSignals(
  dimension: string,
  birthStem: string,
  todayStem: string,
): SignalTemplate {
  const rel = relation(birthStem, todayStem)

  // Signals for each dimension based on the stem relationship
  const careerRel: Record<string, SignalTemplate> = {
    generate: { zh: { v: "借力推进", t: "适合找贵人帮忙，别一个人扛。" }, en: { v: "Leverage", t: "Ask for help today — don't carry it alone." } },
    same: { zh: { v: "稳扎稳打", t: "按节奏推进手上的事，不求快但求稳。" }, en: { v: "Steady", t: "Stick to the rhythm. Speed matters less than consistency." } },
    control: { zh: { v: "迎接挑战", t: "有阻力是正常的，过了今天局面会打开。" }, en: { v: "Push through", t: "Resistance is normal today. It clears tomorrow." } },
    drain: { zh: { v: "聚焦核心", t: "精力容易分散，今天只盯最重要的一个任务。" }, en: { v: "Focus", t: "Energy scatters easily — lock onto ONE priority today." } },
  }

  const structureRel: Record<string, SignalTemplate> = {
    generate: { zh: { v: "适合建设", t: "外界给你能量支持，适合搭建新框架或培养新习惯。" }, en: { v: "Build", t: "External energy supports you — build new frameworks or habits." } },
    same: { zh: { v: "巩固根基", t: "适合检查已有的结构和系统是否稳固。" }, en: { v: "Reinforce", t: "Check if your structures and systems are solid." } },
    control: { zh: { v: "调整节奏", t: "外压测试你的底线，不要硬顶，灵活调整。" }, en: { v: "Adapt", t: "Pressure tests your limits — flex, don't resist." } },
    drain: { zh: { v: "减少消耗", t: "把非必要的事推掉，保存精力。" }, en: { v: "Conserve", t: "Cancel non-essentials. Save your battery." } },
  }

  const relationshipRel: Record<string, SignalTemplate> = {
    generate: { zh: { v: "适合连接", t: "今天适合主动联系、表达感谢或开启对话。" }, en: { v: "Connect", t: "Reach out, say thanks, or start a conversation today." } },
    same: { zh: { v: "平静相处", t: "关系无风无浪，适合日常陪伴，不宜深谈。" }, en: { v: "Easy", t: "Smooth sailing — good for companionship, not deep talks." } },
    control: { zh: { v: "避免争执", t: "容易碰到不同频的人，少争论多包容。" }, en: { v: "Avoid conflict", t: "You'll meet people on different wavelengths — less debate, more grace." } },
    drain: { zh: { v: "设立边界", t: "有人在消耗你的情绪，勇敢说不。" }, en: { v: "Set boundaries", t: "Someone's draining you. Say no with courage." } },
  }

  const intuitionRel: Record<string, SignalTemplate> = {
    generate: { zh: { v: "灵感充沛", t: "创意和直觉今天很准，相信你第一时间的感觉。" }, en: { v: "Inspired", t: "Your intuition is sharp today — trust your first feeling." } },
    same: { zh: { v: "深度思考", t: "适合复盘和反思，不急着做新决策。" }, en: { v: "Reflect", t: "Good day for review and reflection. Don't rush new decisions." } },
    control: { zh: { v: "核对事实", t: "直觉可能被情绪干扰，多看数据少凭感觉。" }, en: { v: "Check facts", t: "Emotions may cloud intuition — lean on data today." } },
    drain: { zh: { v: "记录灵感", t: "想法容易遗忘，把今天冒出的点子都记下来。" }, en: { v: "Capture ideas", t: "Ideas fade fast today — write everything down." } },
  }

  const dims: Record<string, Record<string, SignalTemplate>> = {
    structure: structureRel,
    career: careerRel,
    relationship: relationshipRel,
    wealth: {
      generate: { zh: { v: "能量流入", t: "有外部财运助力，适合接收而非主动出击。" }, en: { v: "Inflow", t: "Wealth energy flows in — receive, don't chase." } },
      same: { zh: { v: "平稳积累", t: "不宜大进大出，把精力放在整理已有资源上。" }, en: { v: "Steady", t: "Conserve and organize existing resources today." } },
      control: { zh: { v: "谨慎支出", t: "冲动消费概率偏高，付款前等10分钟。" }, en: { v: "Caution", t: "Impulse risk is high — wait 10 min before paying." } },
      drain: { zh: { v: "理性投资", t: "适合为长期成长付费，不适合短线操作。" }, en: { v: "Invest wisely", t: "Good for long-term investment, bad for short-term moves." } },
    },
    intuition: intuitionRel,
  }

  return dims[dimension]?.[rel] || dims.structure[rel]
}

export function generateDailySignals(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  isZh: boolean,
): DailySignal[] {
  const birthStem = computeBirthDayStem(birthYear, birthMonth, birthDay)
  const today = new Date()
  const todayStemIdx = getDayStem(today)
  const todayStem = HEAVENLY_STEMS[todayStemIdx]
  const todayBranch = EARTHLY_BRANCHES[getDayBranch(today)]

  const dimensions = ["structure", "career", "relationship", "wealth", "intuition"]
  const zhNames: Record<string, string> = {
    structure: "结构稳定度", career: "事业推进力", relationship: "关系活跃度", wealth: "财富判断力", intuition: "直觉敏感度",
  }
  const enNames: Record<string, string> = {
    structure: "Structure", career: "Career push", relationship: "Relationship", wealth: "Money judgment", intuition: "Intuition",
  }

  return dimensions.map((dim, i) => {
    const signal = getDimensionSignals(dim, birthStem, todayStem)
    return {
      n: isZh ? zhNames[dim] : enNames[dim],
      v: isZh ? signal.zh.v : signal.en.v,
      t: isZh ? signal.zh.t : signal.en.t,
    }
  })
}
