export type SeoLocale = "en" | "zh"

import { SEO_BRAND_NAME, SEO_SITE_URL } from "./brand"

const descriptions: Record<SeoLocale, string> = {
  en: "AI-assisted personal reflection, cultural interpretation, and daily action guidance.",
  zh: "面向个人反思、文化解读与每日行动引导的 AI 辅助平台。",
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_BRAND_NAME,
    url: SEO_SITE_URL,
    logo: `${SEO_SITE_URL}/logo.png`,
  }
}

export function createPublisherJsonLd() {
  return { "@type": "Organization", name: SEO_BRAND_NAME, url: SEO_SITE_URL, logo: `${SEO_SITE_URL}/logo.png` }
}

export function createWebApplicationJsonLd(locale: SeoLocale) {
  return {
    "@context": "https://schema.org", "@type": "WebApplication", name: SEO_BRAND_NAME,
    url: `${SEO_SITE_URL}/${locale}`, applicationCategory: "LifestyleApplication", operatingSystem: "Web",
    description: descriptions[locale], offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: createPublisherJsonLd(), inLanguage: locale === "zh" ? "zh-CN" : "en",
  }
}

export function createWebSiteJsonLd(locale: SeoLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_BRAND_NAME,
    url: `${SEO_SITE_URL}/${locale}`,
    description: descriptions[locale],
    inLanguage: locale === "zh" ? "zh-CN" : "en",
  }
}

export function createBreadcrumbJsonLd(locale: SeoLocale) {
  const siteUrl = locale === "zh" ? `${SEO_SITE_URL}/zh` : `${SEO_SITE_URL}/en`
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "item": { "@id": siteUrl, "name": locale === "zh" ? "首页" : "Home" } }
    ],
  }
}
