import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AM16 天命能级测验 | AlphaMirror",
  description: "免费的AM16天命能级测验，通过12道沉浸式情景题，从四个维度精准定位你的精神状态密码。",
  openGraph: {
    title: "AM16 天命能级测验 — 解锁你的精神状态密码",
    description: "12道沉浸式情景题，从顺天逆天、心觉格物、渡人修仙、稳如执行四个维度，精准定位你的精神状态密码。",
    url: "https://alphamirror.app/am16",
    siteName: "AlphaMirror",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AM16 天命能级测验 | AlphaMirror",
    description: "12道沉浸式情景题解锁你的精神状态密码",
  },
  alternates: {
    canonical: "https://alphamirror.app/am16",
  },
}

export default function AM16Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
