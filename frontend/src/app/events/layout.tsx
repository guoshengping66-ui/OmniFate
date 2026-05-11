import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "事件复盘 - 命盘智镜",
  description: "输入关键事件的时间和描述，AI 从命理角度分析事件成因、影响及后续走向。",
  keywords: ["事件复盘", "命理分析", "运势分析", "关键事件"],
  openGraph: {
    title: "事件复盘 - 命盘智镜",
    description: "从命理角度分析关键事件的成因与走向",
    type: "website",
  },
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
