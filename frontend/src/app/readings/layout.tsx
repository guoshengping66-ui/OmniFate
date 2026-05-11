import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "我的报告 - 命盘智镜",
  description: "查看你所有的命理分析报告历史记录。",
}

export default function ReadingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
