/**
 * AlphaMirror 双轨定价配置
 * 国内 (CNY) / 海外 (USD) 独立定价体系
 */

export type Region = "domestic" | "overseas"

// ── 星尘消耗规则 ──────────────────────────────────────────────────────────────
export const STARDUST_COST = {
  /** 高能消耗 */
  FULL_REPORT: 100,       // 解锁全维报告（完整工人报告+追问资格）
  DETAILED_REPORT: 30,    // 解锁精读报告（深度分析文本）
  EVENT_RETRO: 30,        // 生命事件复盘
  /** 中能消耗 */
  FOLLOW_UP: 10,          // AI 追问/对话 (每轮)
  /** 低能消耗 */
  ENERGY_RADAR: 5,        // 今日能量雷达 (会员免费)
  EXTRA_DIVINATION: 1,    // 额外抽签
} as const

// ── 定价数据 ──────────────────────────────────────────────────────────────────
export interface PlanConfig {
  id: string
  name: string
  subtitle: string
  /** 国内价 */
  priceCny: number
  /** 海外价 */
  priceUsd: number
  /** 月度星尘赠送 */
  monthlyStardustGrant: number
  /** 星尘折扣 (仅年度+创始) */
  stardustDiscount?: number  // 0.88 = 8.8折
  /** 展示价格 (国内) */
  displayCny: string
  /** 展示价格 (海外) */
  displayUsd: string
  /** 原价 (划线) */
  originalCny?: number
  originalUsd?: number
  features: string[]
  cta: string
  highlight: boolean
  badge?: string
  billingLabel: string
}

export const PLANS: PlanConfig[] = [
  {
    id: "premium_monthly",
    name: "Fate OS 月度",
    subtitle: "全维度命理操作系统",
    priceCny: 59,
    priceUsd: 14.99,
    monthlyStardustGrant: 100,
    displayCny: "¥59/月",
    displayUsd: "$14.99/mo",
    features: [
      "全维报告无限次解锁",
      "事件复盘 2次/月免费",
      "每日黄历完整访问",
      "追问无限次数",
      "商城会员价 88 折",
      "每月注入 100 星尘",
      "专属能量预警推送",
      "优先客服通道",
    ],
    cta: "订阅月度",
    highlight: false,
    billingLabel: "每月自动续费，随时取消",
  },
  {
    id: "premium_yearly",
    name: "Fate OS 年度",
    subtitle: "最划算的年度守护",
    priceCny: 365,
    priceUsd: 99.00,
    monthlyStardustGrant: 150,
    stardustDiscount: 0.88,
    displayCny: "¥365/年",
    displayUsd: "$99/yr",
    originalCny: 708,
    originalUsd: 179.88,
    features: [
      "月度会员全部权益",
      "相当于 ¥1/天",
      "事件复盘 5次/月免费",
      "每月注入 150 星尘",
      "星尘消耗享 8.8 折",
      "年度命盘回顾报告",
      "专属水晶定制服务 1次/年",
      "生日特别推命仪式",
      "新功能优先体验",
    ],
    cta: "订阅年度",
    highlight: true,
    badge: "推荐 · 每天仅需 1 元",
    billingLabel: "每年自动续费，随时取消",
  },
  {
    id: "founder_lifetime",
    name: "创始席位",
    subtitle: "永久会员 · 限量席位",
    priceCny: 1688,
    priceUsd: 499,
    monthlyStardustGrant: 500,
    stardustDiscount: 0,
    displayCny: "¥1,688",
    displayUsd: "$499",
    features: [
      "永久全功能访问",
      "无限星尘额度",
      "每月注入 500 星尘",
      "产品路线图投票权",
      "专属黑金 UI 主题",
      "新功能优先体验",
      "专属客服通道",
      "每年 1 次水晶定制服务",
    ],
    cta: "锁定席位",
    highlight: false,
    badge: "限量席位",
    billingLabel: "一次性终身",
  },
  {
    id: "onetime_unlock",
    name: "一次性解锁",
    subtitle: "永久解锁一份全维报告",
    priceCny: 19.9,
    priceUsd: 9.9,
    monthlyStardustGrant: 0,
    displayCny: "¥19.9",
    displayUsd: "$9.9",
    features: [
      "永久解锁一份全维报告",
      "赠送 50 星尘（追问5次）",
      "¥20 商城代金券",
      "3 天会员试用",
      "每个账户限一次",
    ],
    cta: "立即解锁",
    highlight: false,
    billingLabel: "一次性付费",
  },
]

// ── 创始席位配置 ──────────────────────────────────────────────────────────────
export const FOUNDER_CONFIG = {
  /** 国内各限量 100 席 */
  domesticLimit: 100,
  overseasLimit: 100,
  priceCny: 1688,
  priceUsd: 499,
  monthlyStardustGrant: 500,
} as const

// ── 首单优惠 ──────────────────────────────────────────────────────────────────
export const FIRST_ORDER_DISCOUNT = 30  // 首单立减 ¥30
export const ONETIME_UNLOCK_CNY = 19.9
export const ONETIME_UNLOCK_USD = 9.9

// ── 星尘注入文案 ──────────────────────────────────────────────────────────────
export const STARDUST_MESSAGES = {
  lowBalance: "星辰能量暂不足以支撑此次推演，是否向星空索取更多能量？",
  insufficientForReport: "推演全维报告需要 100 颗星尘，当前能量储备不足",
  insufficientForDetailed: "精读报告需要 30 颗星尘，当前能量储备不足",
  insufficientForRetro: "事件复盘需要 30 颗星尘，当前能量储备不足",
  insufficientForFollowUp: "每次追问需要 10 颗星尘，当前能量储备不足",
  insufficientForRadar: "能量雷达需要 5 颗星尘，当前能量储备不足",
  deductSuccess: "能量注入成功",
  refundSuccess: "能量已返还",
  monthlyGrant: "本月星尘能量已注入",
} as const

// ── 快捷查找 ──────────────────────────────────────────────────────────────────
export const PLAN_MAP: Record<string, PlanConfig> = Object.fromEntries(
  PLANS.map(p => [p.id, p])
)
