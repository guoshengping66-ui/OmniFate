import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "命运藏宝阁 - OmniFate",
  description: "东方智慧凝萃，AI 深度分析能量档案，为你甄选最契合的命运藏品。",
  keywords: ["命运藏宝阁", "energy items", "crystals", "treasures", "AI recommendations"],
  openGraph: {
    title: "命运藏宝阁 - OmniFate",
    description: "东方智慧凝萃，每一件藏品皆是命运的馈赠",
    type: "website",
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
