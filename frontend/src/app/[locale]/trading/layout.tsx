import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/trading`

  return {
    title: isZh ? "交易日志 — AI 分析交易行为 | Inner Atlas AI" : "Trading Journal - AI Trade Analysis | Inner Atlas AI",
    description: isZh
      ? "记录你的交易数据，AI 分析交易行为模式，帮助你优化投资决策。"
      : "Record your trading data. AI analyzes trade behavior patterns to help optimize investment decisions.",
    keywords: isZh
      ? "交易日志,交易分析,AI交易,投资行为,Inner Atlas AI"
      : ["trading journal", "trade analysis", "AI trading", "investment behavior", "Inner Atlas AI"],
    openGraph: {
      title: isZh ? "交易日志 — Inner Atlas AI" : "Trading Journal - Inner Atlas AI",
      description: isZh
        ? "AI 分析交易行为模式"
        : "AI analysis of trade behavior patterns",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/trading`,
        zh: `${base}/zh/trading`,
        "x-default": `${base}/en/trading`,
      },
    },
  }
}

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  return children
}
