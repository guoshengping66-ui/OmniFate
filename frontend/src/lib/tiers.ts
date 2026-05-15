/** 5-tier pricing system — single source of truth for all monetization */

export type TierId = "free" | "full_report" | "premium_monthly" | "premium_yearly" | "event_retro" | "founder_lifetime"

export interface PricingTier {
  id: TierId
  name: string
  subtitle: string
  priceCny: number
  priceDisplay: string           // "¥69" | "¥49/月" etc.
  originalPriceCny?: number      // strikethrough for promos
  features: string[]
  cta: string
  highlight: boolean             // visually emphasized card
  badge?: string                 // e.g. "首单仅 ¥29.9"
  billingLabel?: string          // e.g. "一次性" | "每月" | "每年"
}

export const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "免费体验",
    subtitle: "基础命盘解读",
    priceCny: 0,
    priceDisplay: "免费",
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
    name: "全维报告",
    subtitle: "解锁完整命盘深度分析",
    priceCny: 69,
    priceDisplay: "¥69",
    originalPriceCny: 99,
    features: [
      "解锁完整命盘深度报告",
      "年度运势规划（12个月）",
      "五行缺失精准诊断",
      "AI 改运商品精准匹配",
      "追问功能（10次/报告）",
      "赠送 ¥60 商城代金券",
      "自动激活 3 天会员试用",
    ],
    cta: "立即解锁",
    highlight: true,
    badge: "首单仅 ¥29.9",
    billingLabel: "一次性付费",
  },
  {
    id: "premium_monthly",
    name: "Fate OS 月度",
    subtitle: "全维度命理操作系统",
    priceCny: 49,
    priceDisplay: "¥49/月",
    features: [
      "全维报告无限次解锁",
      "事件复盘 2次/月免费",
      "每日黄历完整访问",
      "追问无限次数",
      "商城会员价 88 折",
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
    priceCny: 298,
    priceDisplay: "¥298/年",
    originalPriceCny: 588,
    features: [
      "月度会员全部权益",
      "相当于 ¥24.8/月",
      "事件复盘 5次/月免费",
      "年度命盘回顾报告",
      "专属水晶定制服务 1次/年",
      "生日特别推命仪式",
      "新功能优先体验",
    ],
    cta: "订阅年度",
    highlight: true,
    badge: "省 ¥290",
    billingLabel: "每年自动续费，随时取消",
  },
  {
    id: "event_retro",
    name: "事件复盘",
    subtitle: "单次事件溯源诊断",
    priceCny: 19.9,
    priceDisplay: "¥19.9/次",
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
    subtitle: "永久会员 · 限量 999 席",
    priceCny: 999,
    priceDisplay: "¥999",
    features: [
      "永久全功能访问",
      "无限星尘额度",
      "产品路线图投票权",
      "专属黑金 UI 主题",
      "新功能优先体验",
      "专属客服通道",
      "每年 1 次水晶定制服务",
    ],
    cta: "锁定席位",
    highlight: true,
    badge: "限量 999 席",
    billingLabel: "一次性终身",
  },
]

/** Quick lookup helpers */
export const TIER_MAP: Record<string, PricingTier> = Object.fromEntries(
  TIERS.map(t => [t.id, t])
)

export const FULL_REPORT_PRICE = 69
export const FIRST_REPORT_PRICE = 29.9
export const EVENT_RETRO_PRICE = 19.9
export const PREMIUM_MONTHLY = 49
export const PREMIUM_YEARLY = 298
export const FOUNDER_LIFETIME = 999
export const SHOP_COUPON_AMOUNT = 60
export const TRIAL_DAYS = 3
export const MEMBER_DISCOUNT = 0.88
