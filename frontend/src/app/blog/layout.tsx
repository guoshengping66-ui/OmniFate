import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "命理博客 - 命盘智镜",
  description: "探索八字命理、星盘占卜、塔罗牌阵、面相手相等玄学知识，AI 命理师为你解读命运密码。",
  keywords: ["命理博客", "八字教程", "星盘入门", "塔罗占卜", "面相分析"],
  openGraph: {
    title: "命理博客 - 命盘智镜",
    description: "探索八字命理、星盘占卜、塔罗牌阵等玄学知识",
    type: "website",
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
