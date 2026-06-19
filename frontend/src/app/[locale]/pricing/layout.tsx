import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/pricing`

  return {
    title: isZh ? "会员方案 — 解锁深度分析 | 命运引擎" : "Membership Plans - Unlock Deep Analysis | Destiny Engine",
    description: isZh
      ? "选择适合你的会员方案。解锁多维度行为分析、每日运势、事件复盘等专属功能。"
      : "Choose the right membership plan. Unlock multi-dimension behavioral analysis, daily almanac, event review, and exclusive features.",
    keywords: isZh
      ? "会员方案,定价,VIP,行为分析会员,命运引擎会员"
      : ["membership", "pricing", "VIP", "behavioral membership", "destiny engine plans"],
    openGraph: {
      title: isZh ? "会员方案 — 命运引擎" : "Membership Plans - Destiny Engine",
      description: isZh
        ? "解锁多维度行为分析与专属功能"
        : "Unlock multi-dimension behavioral analysis and exclusive features",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/pricing`,
        zh: `${base}/zh/pricing`,
        "x-default": `${base}/en/pricing`,
      },
    },
  }
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
