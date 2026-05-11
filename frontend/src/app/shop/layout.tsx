import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "改运商城 - 命盘智镜",
  description: "根据命盘分析精准推荐改运商品，包括水晶、珠宝、香薰、符咒等，每件推荐都有命理依据。",
  keywords: ["改运商品", "水晶", "开运", "命理商城", "八字推荐"],
  openGraph: {
    title: "改运商城 - 命盘智镜",
    description: "AI 根据命盘弱点自动匹配专属改运商品",
    type: "website",
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
