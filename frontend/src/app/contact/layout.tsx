import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "联系我们 - 命盘智镜",
  description: "如有任何问题或建议，欢迎联系命盘智镜团队。我们提供电子邮件和微信客服支持。",
  keywords: ["联系我们", "客服", "技术支持", "反馈"],
  openGraph: {
    title: "联系我们 - 命盘智镜",
    description: "联系命盘智镜团队",
    type: "website",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
