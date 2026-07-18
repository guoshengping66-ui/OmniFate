import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/referral`

 return {
    robots: { index: false, follow: false },
    title: isZh ? "推荐计划 — 邀请好友获奖励 | Inner Atlas AI" : "Referral Program - Invite Friends & Earn Rewards | Inner Atlas AI",
    description: isZh
      ? "邀请好友加入Inner Atlas AI，双方均可获得星尘奖励。分享你的推荐链接开始赚取奖励。"
      : "Invite friends to Inner Atlas AI and both earn Stardust rewards. Share your referral link to start earning.",
    keywords: isZh
      ? "推荐计划,邀请好友,推荐奖励,星尘奖励,Inner Atlas AI"
      : ["referral program", "invite friends", "referral rewards", "stardust rewards", "Inner Atlas AI"],
    openGraph: {
      title: isZh ? "推荐计划 — Inner Atlas AI" : "Referral Program - Inner Atlas AI",
      description: isZh
        ? "邀请好友，双方获星尘奖励"
        : "Invite friends and both earn Stardust rewards",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/referral`,
        zh: `${base}/zh/referral`,
        "x-default": `${base}/en/referral`,
      },
    },
  }
}

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return children
}
