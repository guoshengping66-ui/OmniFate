import type { MetadataRoute } from "next"

const BASE_URL = "https://khanfate.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/reading/new`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${BASE_URL}/seo/bazi`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${BASE_URL}/seo/astrology`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${BASE_URL}/seo/tarot`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${BASE_URL}/seo/face-reading`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${BASE_URL}/events`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/almanac`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/refund`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/disclaimer`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
  ]

  return staticPages
}
