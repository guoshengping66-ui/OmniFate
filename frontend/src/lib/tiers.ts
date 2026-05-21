/** Dual-track pricing system — domestic (CNY) & overseas (USD) */

export type TierId = "free" | "full_report" | "premium_monthly" | "premium_yearly" | "event_retro" | "founder_lifetime"
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
    single_report: { price: 88, stardust: 100, label: "全维全景报告" },
    monthly: { price: 59, stardust_grant: 100, label: "Fate OS 月度订阅" },
    yearly: { price: 365, stardust_grant: 150, label: "Fate OS 年度订阅", tag: "每天仅需 1 元" },
    founder: { price: 1288, stardust_grant: 500, label: "创始席位", limit: 100 },
  },
  overseas: {
    currency: "$",
    single_report: { price: 24.99, stardust: 100, label: "Full-Dimension Report" },
    monthly: { price: 14.99, stardust_grant: 100, label: "Fate OS Monthly" },
    yearly: { price: 99.00, stardust_grant: 150, label: "Fate OS Yearly", tag: "Best Value" },
    founder: { price: 399.00, stardust_grant: 500, label: "Founder Circle", limit: 100 },
  },
} as const

export const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "免费体验",
    subtitle: "基础命盘解读",
    priceCny: 0,
    priceUsd: 0,
    priceDisplay: "免费",
    priceDisplayUsd: "Free",
    features: [
      "八字四柱格局分析",
      "西方星盘落宫解读",
      "塔罗牌阵一次",
      "命盘总览摘要（限制预览）",
      "改运商城浏览",
    ],
    cta: "免费开始",
    highlight: false,
    billingLabel: "永久免费",
  },
  {
    id: "full_report",
    name: "全维全景报告",
    subtitle: "单次解锁完整命盘深度分析",
    priceCny: 88,
    priceUsd: 24.99,
    stardust: 100,
    priceDisplay: "¥88",
    priceDisplayUsd: "$24.99",
    originalPriceCny: 118,
    originalPriceUsd: 34.99,
    features: [
      "解锁完整命盘深度报告",
      "年度运势规划（12个月）",
      "五行缺失精准诊断",
      "AI 改运商品精准匹配",
      "追问功能（10次/报告）",
      "赠送 100 星尘能量",
      "自动激活 3 天会员试用",
    ],
    cta: "立即解锁",
    highlight: false,
    badge: "首单立减 ¥30",
    billingLabel: "一次性付费",
  },
  {
    id: "premium_monthly",
    name: "Fate OS 月度",
    subtitle: "全维度命理操作系统",
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
    id: "event_retro",
    name: "事件复盘",
    subtitle: "单次事件溯源诊断",
    priceCny: 19.9,
    priceUsd: 4.99,
    stardust: 30,
    priceDisplay: "¥19.9/次",
    priceDisplayUsd: "$4.99/time",
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
    id: "founder_lifetime",
    name: "创始席位",
    subtitle: "永久会员 · 限量席位",
    priceCny: 1288,
    priceUsd: 399,
    stardustGrant: 500,
    stardustDiscount: 0,
    priceDisplay: "¥1,288",
    priceDisplayUsd: "$399",
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

export const FULL_REPORT_PRICE = 88
export const FULL_REPORT_PRICE_USD = 24.99
export const FIRST_REPORT_PRICE = 29.9
export const EVENT_RETRO_PRICE = 19.9
export const EVENT_RETRO_PRICE_USD = 4.99
export const PREMIUM_MONTHLY = 59
export const PREMIUM_MONTHLY_USD = 14.99
export const PREMIUM_YEARLY = 365
export const PREMIUM_YEARLY_USD = 99
export const SHOP_COUPON_AMOUNT = 60
export const TRIAL_DAYS = 3
export const MEMBER_DISCOUNT = 0.88
export const FOUNDER_PRICE = 1288
export const FOUNDER_PRICE_USD = 399
export const FOUNDER_MAX_SEATS = 200
