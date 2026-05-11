import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "我的账户 - 命盘智镜",
  description: "管理你的账户信息、查看会员状态和订单记录。",
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}
