import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI 推命 - 命盘智镜",
  description: "输入出生信息，AI 命师为你进行八字、星盘、塔罗、面相、手相五维联合分析，生成专属命理报告。",
  keywords: ["AI推命", "八字排盘", "星盘分析", "塔罗占卜", "面相分析"],
  openGraph: {
    title: "AI 推命 - 命盘智镜",
    description: "五维联合命理分析，AI 命师为你解读命运",
    type: "website",
  },
}

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  return children
}
