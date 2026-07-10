/**
 * Fast deterministic daily action generation for the logged-in home page.
 * It changes by user birth date and current date without waiting for a report API.
 */

export interface DailySignal {
  n: string
  v: string
  t: string
}

export interface DailyActionSummary {
  theme: string
  best: string
  avoid: string
  reminder: string
  window: string
  source: string
  signals: DailySignal[]
}

const STEMS = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"] as const
const STEM_ELEMENTS: Record<string, "wood" | "fire" | "earth" | "metal" | "water"> = {
  Jia: "wood",
  Yi: "wood",
  Bing: "fire",
  Ding: "fire",
  Wu: "earth",
  Ji: "earth",
  Geng: "metal",
  Xin: "metal",
  Ren: "water",
  Gui: "water",
}

const ELEMENT_LABEL: Record<string, string> = {
  wood: "Wood",
  fire: "Fire",
  earth: "Earth",
  metal: "Metal",
  water: "Water",
}

type Relation = "support" | "same" | "output" | "pressure"
type ElementName = "wood" | "fire" | "earth" | "metal" | "water"

function dateKey(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
}

function dayStemIndex(date: Date): number {
  const base = Date.UTC(1900, 0, 1) / 86400000
  return (((dateKey(date) - base) % 10) + 10) % 10
}

function birthStemIndex(year: number, month: number, day: number): number {
  const base = Date.UTC(1900, 0, 1) / 86400000
  const born = Date.UTC(year, month - 1, day) / 86400000
  return (((born - base) % 10) + 10) % 10
}

function relation(birthElement: ElementName, todayElement: ElementName): Relation {
  const generating: Record<ElementName, ElementName> = {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood",
  }
  if (birthElement === todayElement) return "same"
  if (generating[todayElement] === birthElement) return "support"
  if (generating[birthElement] === todayElement) return "output"
  return "pressure"
}

const SIGNALS: Record<string, Record<Relation, [string, string]>> = {
  structure: {
    support: ["Stable structure", "Build a small routine first, then move into harder work."],
    same: ["Hold rhythm", "Review what already exists before opening a new direction."],
    output: ["Reduce drain", "Small tasks can scatter your energy. Move non-essentials later."],
    pressure: ["Adapt", "Outside pressure may test your limits. Keep one backup option."],
  },
  career: {
    support: ["Use support", "Ask for feedback, resources, or a clearer next step."],
    same: ["Steady execution", "Finish the most certain task already in front of you."],
    output: ["Focused output", "Good for writing, presenting, or shipping one clear outcome."],
    pressure: ["Reduce friction", "Handle the smallest blocker instead of forcing the whole plan."],
  },
  relationship: {
    support: ["Connect", "Good for gratitude, boundary-setting, or a calm conversation."],
    same: ["Keep it easy", "Good for simple contact; avoid forcing heavy conversations."],
    output: ["Save energy", "Do not explain everything today. Keep emotional bandwidth."],
    pressure: ["Listen first", "You may meet mismatched rhythms. Hear them out before replying."],
  },
  wealth: {
    support: ["Review resources", "Good for budgets, pricing, and long-term accumulation."],
    same: ["Steady judgment", "Move conservatively; avoid large swings."],
    output: ["Invest wisely", "Spend on growth if needed, but avoid impulse buys."],
    pressure: ["Delay payment", "Wait ten minutes before paying; check it is not emotional."],
  },
  intuition: {
    support: ["Clear intuition", "Your first read is useful, but turn it into one action."],
    same: ["Reflect", "Observe patterns today instead of rushing a conclusion."],
    output: ["Capture ideas", "Ideas arrive fast and fade fast. Write them down."],
    pressure: ["Check facts", "Emotion can amplify judgment. Use evidence for important calls."],
  },
}

const SUMMARY: Record<Relation, Pick<DailyActionSummary, "theme" | "best" | "avoid" | "reminder">> = {
  support: {
    theme: "Use support before pushing",
    best: "Complete one action that needs feedback, resources, or collaboration.",
    avoid: "Carrying everything alone or deciding before the facts are clear.",
    reminder: "Today is less about proving yourself and more about letting the right support enter the process.",
  },
  same: {
    theme: "Hold rhythm and finish what is clear",
    best: "Close one task that can give you clear feedback.",
    avoid: "Changing direction suddenly or opening too many new branches.",
    reminder: "Finish what is certain before handling uncertain people or money.",
  },
  output: {
    theme: "Focus output, reduce scatter",
    best: "Write, ship, or communicate one concrete outcome.",
    avoid: "Answering too many people, messages, or sudden ideas at once.",
    reminder: "Today favors output, but not spreading your attention too thin.",
  },
  pressure: {
    theme: "Break friction into smaller moves",
    best: "Resolve one small blocker so the situation can move again.",
    avoid: "Forcing, over-explaining, or making long commitments under pressure.",
    reminder: "Resistance is information. Adjust rhythm and boundaries.",
  },
}

export function generateDailyActionSummary(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  _isZh: boolean,
  date = new Date(),
): DailyActionSummary {
  const birthStem = STEMS[birthStemIndex(birthYear, birthMonth, birthDay)]
  const todayStem = STEMS[dayStemIndex(date)]
  const birthElement = STEM_ELEMENTS[birthStem]
  const todayElement = STEM_ELEMENTS[todayStem]
  const rel = relation(birthElement, todayElement)
  const source = `Based on your ${ELEMENT_LABEL[birthElement]} day pattern and today's ${ELEMENT_LABEL[todayElement]} signal`
  const names = {
    structure: "Structure",
    career: "Career push",
    relationship: "Relationship",
    wealth: "Money judgment",
    intuition: "Intuition",
  }

  const signals = (Object.keys(names) as Array<keyof typeof names>).map((dim) => {
    const [v, t] = SIGNALS[dim][rel]
    return { n: names[dim], v, t }
  })

  return {
    ...SUMMARY[rel],
    window: rel === "output" ? "10:00 - 13:00" : rel === "pressure" ? "15:00 - 18:00" : "14:00 - 17:00",
    source,
    signals,
  }
}

export function generateDailySignals(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  isZh: boolean,
  date = new Date(),
): DailySignal[] {
  return generateDailyActionSummary(birthYear, birthMonth, birthDay, isZh, date).signals
}
