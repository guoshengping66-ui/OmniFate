import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "八字排盘 - AI智能八字分析 | 命盘智镜",
  description: "输入出生时间，AI自动排盘并分析四柱八字、五行强弱、十神格局、流年运势。精准的八字排盘工具，帮你了解命运密码。",
  keywords: ["八字排盘", "八字分析", "四柱八字", "生辰八字", "五行分析", "八字算命", "AI八字", "在线排盘"],
  openGraph: {
    title: "八字排盘 - AI智能八字分析 | 命盘智镜",
    description: "输入出生时间，AI自动排盘并分析四柱八字、五行强弱、十神格局",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "https://destinymirror.com/seo/bazi",
  },
}

export default function BaziLayout({ children }: { children: React.ReactNode }) {
  return children
}
