import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "登录 - 命盘智镜",
  description: "登录你的命盘智镜账户，查看历史报告和会员权益。",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
