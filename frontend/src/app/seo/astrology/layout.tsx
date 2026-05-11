import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "星盘分析 - AI占星解读 | 命盘智镜",
  description: "输入出生信息，AI自动绘制星盘并分析行星落宫、相位角度、灵魂使命。专业占星分析，揭示你的星盘密码。",
  keywords: ["星盘分析", "占星术", "natal chart", "星盘解读", "行星落宫", "相位分析", "AI占星", "在线星盘"],
  openGraph: {
    title: "星盘分析 - AI占星解读 | 命盘智镜",
    description: "输入出生信息，AI自动绘制星盘并分析行星落宫、相位角度",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "https://destinymirror.com/seo/astrology",
  },
}

export default function AstrologyLayout({ children }: { children: React.ReactNode }) {
  return children
}
