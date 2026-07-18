import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const baseUrl = "https://www.khanfate.com"

 return {
    robots: { index: false, follow: false },
    title: isZh ? "积分中心 — Inner Atlas AI" : "Credits — Inner Atlas AI",
    description: isZh
      ? "管理你的 Inner Atlas AI 积分余额，查看积分使用记录与充值历史。"
      : "Manage your Inner Atlas AI credits balance, view usage history and top-up records.",
    openGraph: {
      title: isZh ? "积分中心 | Inner Atlas AI" : "Credits | Inner Atlas AI",
      description: isZh
        ? "查看积分余额、使用记录与充值"
        : "View your credit balance, usage history, and top-up",
      url: `${baseUrl}/${locale}/credits`,
      siteName: "Inner Atlas AI",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? "积分中心 | Inner Atlas AI" : "Credits | Inner Atlas AI",
      description: isZh ? "管理你的 Inner Atlas AI 积分" : "Manage your Inner Atlas AI credits",
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/credits`,
      languages: {
        en: `${baseUrl}/en/credits`,
        zh: `${baseUrl}/zh/credits`,
        "x-default": `${baseUrl}/en/credits`,
      },
    },
  }
}

export default function CreditsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
