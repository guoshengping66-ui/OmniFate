import type { MetadataRoute } from "next"
import { locales } from "@/i18n/config"
import { ARTICLES } from "@/data/articles"

const BASE_URL = "https://www.khanfate.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPaths = [
    "/",
    "/about",
    "/pricing",
    "/pricing/founder",
    "/shop",
    "/blog",
    "/reading/new",
    "/seo/bazi",
    "/seo/astrology",
    "/seo/tarot",
    "/seo/face-reading",
    "/seo/five-elements",
    "/seo/ziwei",
    "/seo/palm-reading",
    "/seo/zodiac-compatibility",
    "/events",
    "/events/radar",
    "/divination",
    "/trading",
    "/referral",
    "/almanac",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/refund",
    "/disclaimer",
  ]

  // Generate sitemap entries for all locales
  const staticEntries = staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: (path === "/" || path === "/shop" || path === "/blog"
        ? "weekly"
        : path.startsWith("/seo") || path === "/pricing"
          ? "monthly"
          : "yearly") as MetadataRoute.Sitemap[0]["changeFrequency"],
      priority: path === "/" ? 1.0 : path.startsWith("/seo") ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}${path === "/" ? "" : path}`]),
        ),
      },
    })),
  )

  // Dynamic blog article entries
  const blogEntries = ARTICLES.flatMap((article) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/blog/${article.id}`,
      lastModified: new Date(article.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/blog/${article.id}`]),
        ),
      },
    })),
  )

  return [...staticEntries, ...blogEntries]
}
