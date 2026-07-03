import type { Product } from "@/lib/api"

export type TreasureLocale = "zh" | "en"

export interface NeedPath {
  key: string
  label: Record<TreasureLocale, string>
  description: Record<TreasureLocale, string>
  tags: string[]
  elements: string[]
  planets: string[]
}

export const NEED_PATHS: NeedPath[] = [
  {
    key: "wealth-stability",
    label: { zh: "财富稳定", en: "Wealth stability" },
    description: { zh: "关注财务节奏、事业根基和长期安全感。", en: "Financial rhythm, career grounding, and long-term security." },
    tags: ["#财务重启", "#财务低潮", "#积极心态", "#FinancialRenewal", "#FinancialDownturn", "#PositiveMindset"],
    elements: ["earth", "metal"],
    planets: ["sun", "jupiter"],
  },
  {
    key: "relationship-repair",
    label: { zh: "关系修复", en: "Relationship repair" },
    description: { zh: "沟通卡住、关系紧张或需要柔和支持。", en: "Blocked communication, tense relationships, and softer support." },
    tags: ["#人际关系", "#沟通障碍", "#表达困难", "#Relationships", "#ExpressionDifficulty", "#Communication"],
    elements: ["water", "wood", "fire"],
    planets: ["venus", "mercury", "moon"],
  },
  {
    key: "motivation-execution",
    label: { zh: "行动力提升", en: "Motivation and execution" },
    description: { zh: "动力不足、职业挑战、创作瓶颈和执行低潮。", en: "Low momentum, career challenges, creative blocks, and execution dips." },
    tags: ["#动力提升", "#职业挑战", "#创作瓶颈", "#MotivationBoost", "#CareerChallenge", "#CreativeBlock"],
    elements: ["fire", "wood"],
    planets: ["mars", "sun"],
  },
  {
    key: "emotional-calm",
    label: { zh: "情绪安定", en: "Emotional calm" },
    description: { zh: "压力管理、内在成长、睡眠和安静反思。", en: "Stress management, inner growth, rest, and quiet reflection." },
    tags: ["#平静需求", "#平静心神", "#压力管理", "#NeedForCalm", "#MentalPeace", "#StressManagement"],
    elements: ["water", "metal"],
    planets: ["moon", "neptune"],
  },
  {
    key: "communication-expression",
    label: { zh: "表达沟通", en: "Communication and expression" },
    description: { zh: "会议表达、社交紧张和自信沟通。", en: "Meetings, expression, social tension, and confident communication." },
    tags: ["#表达困难", "#社交恐惧", "#沟通障碍", "#ExpressionDifficulty", "#SocialAnxiety", "#Communication"],
    elements: ["water", "wood"],
    planets: ["mercury"],
  },
  {
    key: "space-cleansing",
    label: { zh: "空间净化", en: "Space cleansing" },
    description: { zh: "居家、办公、冥想空间的日常清理。", en: "Home, work, and meditation space clearing." },
    tags: ["#净化空间", "#空间净化", "#SpacePurification", "#MentalPeace"],
    elements: ["metal", "water"],
    planets: ["moon"],
  },
  {
    key: "protection-conflict",
    label: { zh: "防护化冲", en: "Protection and conflict reduction" },
    description: { zh: "冲突模式、人际干扰、挑战阶段和边界感。", en: "Conflict patterns, interpersonal noise, challenging phases, and boundaries." },
    tags: ["#冲突模式", "#防护", "#挑战阶段", "#ConflictPattern", "#Protection", "#ChallengingPhase"],
    elements: ["water", "metal"],
    planets: ["saturn", "mars"],
  },
]

const MOJIBAKE_MARKERS = /[�]|(?:鈺|愨|晲|馃|涓|榛|鐨|鍟|绾|鎻|€|锛|閫|浣|鍛|鐞|彂|殑|氭)/

export function isMojibakeText(value?: string | null): boolean {
  if (!value) return false
  return MOJIBAKE_MARKERS.test(value)
}

export function safeLocalizedText(primary?: string | null, fallback?: string | null): string {
  if (primary && !isMojibakeText(primary)) return primary
  if (fallback && !isMojibakeText(fallback)) return fallback
  return ""
}

export function normalizeProductCategory(category?: string | null): string {
  if (!category) return "other"
  if (category === "accessory") return "talisman"
  return category
}

export function getMatchTier(score: number | null | undefined, locale: string): string {
  const isZh = locale === "zh"
  if (score == null || score <= 0) return isZh ? "精选" : "Curated"
  if (score >= 10) return isZh ? "高度匹配" : "High match"
  if (score >= 7) return isZh ? "强推荐" : "Strong fit"
  if (score >= 4) return isZh ? "可参考" : "Good fit"
  return isZh ? "轻匹配" : "Light fit"
}

export function getNeedTags(product: Product, locale: string): string[] {
  const source = locale === "en"
    ? (product.keyword_tags_en || product.keyword_tags || [])
    : (product.keyword_tags || product.keyword_tags_en || [])
  return source.filter(tag => !isMojibakeText(tag)).slice(0, 2)
}

export function productMatchesNeed(product: Product, needKey: string): boolean {
  const need = NEED_PATHS.find(item => item.key === needKey)
  if (!need) return true

  const productTags = [
    ...(product.keyword_tags || []),
    ...(product.keyword_tags_en || []),
    ...(product.wuxing_tags || []),
    ...(product.astro_tags || []),
  ].map(item => String(item).toLowerCase())

  return [
    ...need.tags,
    ...need.elements,
    ...need.planets,
  ].some(tag => productTags.includes(String(tag).toLowerCase()))
}

