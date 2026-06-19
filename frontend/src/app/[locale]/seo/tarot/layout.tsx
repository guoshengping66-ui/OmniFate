import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/seo/tarot`

  return {
    title: isZh ? "塔罗牌分析 — AI 塔罗牌解读与行动指引 | 命运引擎" : "Tarot Reading - AI Symbol Card Interpretation | Destiny Engine",
    description: isZh
      ? "在线塔罗牌分析，AI 解读牌面含义。多种牌阵可选，揭示当前状态并给出可执行的行动建议。"
      : "Online tarot reading with AI interpretation. Multiple spread options available, revealing current state with action guidance and advice.",
    keywords: isZh
      ? "塔罗牌,塔罗分析,塔罗占卜,AI塔罗,在线塔罗,塔罗牌阵,牌意解读"
      : ["tarot reading", "tarot cards", "online tarot", "tarot spread", "AI tarot", "tarot interpretation"],
    openGraph: {
      title: isZh ? "塔罗牌分析 — AI 塔罗解读 | 命运引擎" : "Tarot Reading - AI Symbol Card Interpretation",
      description: isZh
        ? "AI 塔罗牌分析，揭示当前状态与行动指引"
        : "AI-powered tarot reading revealing current state and guidance",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/seo/tarot`, zh: `${base}/zh/seo/tarot` },
    },
  }
}

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return children
}
