import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/tools`

  return {
    title: isZh ? "免费探索工具｜星际分析、性格测验与今日指令 | Inner Atlas AI" : "Free Exploration Tools | Star Analysis, Personality Quiz, Today Command | Inner Atlas AI",
    description: isZh
      ? "星际分析、性格测验、八字、星盘、塔罗、面相、手相与五行查询，作为进入 Inner Atlas AI 的低门槛探索入口。"
      : "Star Analysis, personality quizzes, Bazi, astrology, tarot, face reading, palm reading, and Five Elements as low-friction entry points into Inner Atlas AI.",
    keywords: isZh
      ? "免费探索工具,星际分析,性格测验,八字,星盘,塔罗,面相,手相,五行,观我"
      : ["free exploration tools", "star analysis", "personality quiz", "bazi", "astrology", "tarot", "face reading", "palm reading", "five elements"],
    openGraph: {
      title: isZh ? "免费探索工具 | Inner Atlas AI" : "Free Exploration Tools | Inner Atlas AI",
      description: isZh ? "星际分析、性格测验和今日趋势是进入命运行动系统的低门槛入口。" : "Star Analysis, personality quizzes, and daily trends are low-friction entries into the destiny action system.",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/tools`, zh: `${base}/zh/tools`, "x-default": `${base}/en/tools` },
    },
  }
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
