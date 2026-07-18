import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/pricing`

  return {
    title: isZh ? "会员方案 — 解锁 AI 成长系统 | KhanFate" : "Pricing - Unlock Your AI Growth System | KhanFate",
    description: isZh
      ? "选择适合你的会员方案，解锁完整 AI 命运画像、每日趋势、今日签、人生趋势曲线和成长复盘档案。"
      : "Choose the right membership plan. Unlock your AI destiny profile, daily trends, daily oracle, life growth curve, and reflection records.",
    keywords: isZh
      ? "KhanFate,会员方案,定价,AI命运画像,每日趋势,个人成长系统"
      : ["KhanFate", "pricing", "AI destiny profile", "daily trend", "personal growth system"],
    openGraph: {
      title: isZh ? "会员方案 — KhanFate 成长系统" : "Pricing - KhanFate Growth System",
      description: isZh
        ? "解锁完整 AI 命运画像、每日趋势与长期成长档案。"
        : "Unlock your AI destiny profile, daily trends, and long-term growth archive.",
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
