import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "会员方案 - 命盘智镜",
  description: "选择适合你的会员方案，解锁全维度命理分析、每日黄历、事件复盘等专属功能。",
  keywords: ["会员订阅", "定价", "VIP", "命理会员"],
  openGraph: {
    title: "会员方案 - 命盘智镜",
    description: "解锁全维度命理分析与专属功能",
    type: "website",
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
