import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "常见问题 - 命盘智镜",
  description: "关于命盘智镜 AI 命理分析平台的常见问题解答，包括功能介绍、隐私安全、付费说明等。",
  keywords: ["常见问题", "FAQ", "命理分析", "隐私安全"],
  openGraph: {
    title: "常见问题 - 命盘智镜",
    description: "关于命盘智镜的常见问题解答",
    type: "website",
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
