import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/shop`

  return {
    title: isZh ? "命运藏宝阁 — AI 甄选能量藏品 | 命运引擎" : "Destiny Shop - AI-Curated Energy Items | Destiny Engine",
    description: isZh
      ? "东方智慧凝萃，AI 深度分析能量档案，为你甄选最契合的命运藏品。"
      : "Eastern wisdom meets AI analysis. Discover crystals, talismans, and energy items curated for your destiny profile.",
    keywords: isZh
      ? "命运藏宝阁,能量物品,水晶,护身符,AI推荐,命运藏品"
      : ["destiny shop", "energy items", "crystals", "talisman", "AI recommendations", "destiny store"],
    openGraph: {
      title: isZh ? "命运藏宝阁 — 命运引擎" : "Destiny Shop - Destiny Engine",
      description: isZh
        ? "AI 甄选能量藏品，每一件皆是命运的馈赠"
        : "AI-curated energy items for your destiny profile",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/shop`,
        zh: `${base}/zh/shop`,
        "x-default": `${base}/en/shop`,
      },
    },
  }
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
