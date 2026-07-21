/** Dual-track pricing system — domestic (CNY) & overseas (USD) */

export type TierId = "free" | "premium_monthly" | "premium_yearly" | "event_retro" | "founder_lifetime" | "onetime_unlock"
export type Region = "domestic" | "overseas"

export interface PricingTier {
  id: TierId
  name: string
  subtitle: string
  priceCny: number
  priceUsd: number
  stardust?: number              // stardust cost for single purchases
  stardustGrant?: number         // stardust granted monthly
  stardustDiscount?: number      // 0.88 = 8.8折 (yearly)
  priceDisplay: string
  priceDisplayUsd: string
  originalPriceCny?: number
  originalPriceUsd?: number
  features: string[]
  cta: string
  highlight: boolean
  badge?: string
  billingLabel?: string
}

export const PRICING_DATA = {
  domestic: {
    currency: "¥",
    single_report: { price: 9.9, stardust: 50, label: "全维全景报告" },
    onetime_unlock: { price: 19.9, stardust_grant: 50, label: "一次性解锁", tag: "每个账户限一次" },
    monthly: { price: 59, stardust_grant: 100, label: "Fate OS 月度订阅" },
    yearly: { price: 365, stardust_grant: 150, label: "Fate OS 年度订阅", tag: "每天仅需 1 元" },
    founder: { price: 1299, stardust_grant: 500, label: "创始席位", limit: 100 },
  },
  overseas: {
    currency: "$",
    single_report: { price: 5.9, stardust: 50, label: "Full-Dimension Report" },
    onetime_unlock: { price: 9.9, stardust_grant: 50, label: "One-Time Unlock", tag: "One per account" },
    monthly: { price: 14.99, stardust_grant: 100, label: "Fate OS Monthly" },
    yearly: { price: 99.00, stardust_grant: 150, label: "Fate OS Yearly", tag: "Best Value" },
    founder: { price: 299.00, stardust_grant: 500, label: "Founder Circle", limit: 100 },
  },
} as const

export const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "免费体验",
    subtitle: "基础档案解读",
    priceCny: 0,
    priceUsd: 0,
    priceDisplay: "免费",
    priceDisplayUsd: "Free",
    features: [
      "八字格局分析",
      "星盘落宫解读",
      "塔罗分析一次",
      "档案总览摘要（限制预览）",
      "优化商城浏览",
    ],
    cta: "免费开始",
    highlight: false,
    billingLabel: "永久免费",
  },
  {
    id: "premium_monthly",
    name: "Fate OS 月度",
    subtitle: "全维度行为分析操作系统",
    priceCny: 59,
    priceUsd: 14.99,
    stardustGrant: 100,
    priceDisplay: "¥59/月",
    priceDisplayUsd: "$14.99/mo",
    features: [
      "全维报告无限次解锁",
      "事件复盘 2次/月免费",
      "每日黄历完整访问",
      "追问无限次数",
      "商城会员价 88 折",
      "每月注入 100 星尘",
      "专属能量趋势参考",
      "优先客服通道",
    ],
    cta: "订阅月度",
    highlight: false,
    billingLabel: "每月自动续费，随时取消",
  },
  {
    id: "premium_yearly",
    name: "Fate OS 年度",
    subtitle: "最划算的年度方案",
    priceCny: 365,
    priceUsd: 99.00,
    stardustGrant: 150,
    stardustDiscount: 0.88,
    priceDisplay: "¥365/年",
    priceDisplayUsd: "$99/yr",
    originalPriceCny: 708,
    originalPriceUsd: 179.88,
    features: [
      "月度会员全部权益",
      "相当于 ¥1/天",
      "事件复盘 5次/月免费",
      "每月注入 150 星尘",
      "星尘消耗享 8.8 折",
      "年度档案回顾报告",
      "专属水晶定制服务 1次/年",
      "生日特别分析仪式",
      "新功能优先体验",
    ],
    cta: "订阅年度",
    highlight: true,
    badge: "推荐 · 每天仅需 ¥1",
    billingLabel: "每年自动续费，随时取消",
  },
  {
    id: "event_retro",
    name: "事件分析",
    subtitle: "单次事件溯源诊断",
    priceCny: 9.9,
    priceUsd: 5.9,
    stardust: 50,
    priceDisplay: "¥9.9/次",
    priceDisplayUsd: "$5.9/time",
    features: [
      "事件时刻流时星盘",
      "因果链 AI 溯源分析",
      "当下应对策略建议",
      "未来预防方案",
      "能量处方商品推荐",
      "情绪能量评分",
    ],
    cta: "开始复盘",
    highlight: false,
    billingLabel: "按次计费",
  },
  {
    id: "onetime_unlock",
    name: "一次性解锁",
    subtitle: "永久解锁一份全维报告",
    priceCny: 19.9,
    priceUsd: 9.9,
    stardust: 0,
    stardustGrant: 50,
    priceDisplay: "¥19.9",
    priceDisplayUsd: "$9.9",
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
  {
    id: "founder_lifetime",
    name: "创始席位",
    subtitle: "永久会员 · 限量席位",
    priceCny: 1299,
    priceUsd: 299,
    stardustGrant: 500,
    stardustDiscount: 0,
    priceDisplay: "¥1,299",
    priceDisplayUsd: "$299",
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
]

export const TIER_MAP: Record<string, PricingTier> = Object.fromEntries(
  TIERS.map(t => [t.id, t])
)

// ── Convenience constants (keep in sync with TIERS above and pricing.config.ts) ──
const _event = TIER_MAP.event_retro
const _monthly = TIER_MAP.premium_monthly
const _yearly = TIER_MAP.premium_yearly
const _founder = TIER_MAP.founder_lifetime
const _unlock = TIER_MAP.onetime_unlock

export const FULL_REPORT_PRICE = _unlock?.priceCny ?? 19.9
export const FULL_REPORT_PRICE_USD = _unlock?.priceUsd ?? 9.9
export const FIRST_REPORT_PRICE = 29.9
export const EVENT_RETRO_PRICE = _event?.priceCny ?? 9.9
export const EVENT_RETRO_PRICE_USD = _event?.priceUsd ?? 5.9
export const PREMIUM_MONTHLY = _monthly?.priceCny ?? 59
export const PREMIUM_MONTHLY_USD = _monthly?.priceUsd ?? 14.99
export const PREMIUM_YEARLY = _yearly?.priceCny ?? 365
export const PREMIUM_YEARLY_USD = _yearly?.priceUsd ?? 99
export const SHOP_COUPON_AMOUNT = 50
export const TRIAL_DAYS = 3
export const MEMBER_DISCOUNT = 0.88
export const FOUNDER_PRICE = _founder?.priceCny ?? 1299
export const FOUNDER_PRICE_USD = _founder?.priceUsd ?? 299
export const FOUNDER_MAX_SEATS = 200
export const ONETIME_UNLOCK_PRICE = _unlock?.priceCny ?? 19.9
export const ONETIME_UNLOCK_PRICE_USD = _unlock?.priceUsd ?? 9.9
