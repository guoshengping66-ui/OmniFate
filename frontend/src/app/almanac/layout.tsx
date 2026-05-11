import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "每日黄历 - 命盘智镜",
  description: "基于你的命盘生成专属每日黄历，包含能量指数、宜忌指南和个性化护身建议。",
  keywords: ["每日黄历", "能量指数", "宜忌", "运势日历"],
  openGraph: {
    title: "每日黄历 - 命盘智镜",
    description: "基于你的命盘生成专属每日黄历",
    type: "website",
  },
}

export default function AlmanacLayout({ children }: { children: React.ReactNode }) {
  return children
}
