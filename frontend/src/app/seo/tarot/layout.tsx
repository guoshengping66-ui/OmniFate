import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "塔罗占卜 - AI塔罗牌阵解读 | 命盘智镜",
  description: "在线塔罗牌占卜，AI解读牌阵含义。提供多种牌阵选择，揭示当下能量状态，给出行动指引和建议。",
  keywords: ["塔罗占卜", "塔罗牌", "在线占卜", "塔罗牌阵", "AI塔罗", "塔罗解读", "每日塔罗", "爱情塔罗"],
  openGraph: {
    title: "塔罗占卜 - AI塔罗牌阵解读 | 命盘智镜",
    description: "在线塔罗牌占卜，AI解读牌阵含义，揭示当下能量状态",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "https://destinymirror.com/seo/tarot",
  },
}

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return children
}
