import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "结算 - 命盘智镜",
  description: "确认订单信息，选择支付方式完成购买。",
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
