export type SeoLocale = "en" | "zh"

const SITE_URL = "https://www.khanfate.com"
const APP_NAME = "Inner Atlas AI"

const descriptions: Record<SeoLocale, string> = {
  en: "AI-assisted personal reflection, cultural interpretation, and daily action guidance.",
  zh: "面向个人反思、文化解读与每日行动引导的 AI 辅助平台。",
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  }
}

export function createWebSiteJsonLd(locale: SeoLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: `${SITE_URL}/${locale}`,
    description: descriptions[locale],
    inLanguage: locale === "zh" ? "zh-CN" : "en",
  }
}
