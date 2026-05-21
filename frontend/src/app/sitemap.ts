import type { MetadataRoute } from "next"
import { locales } from "@/i18n/config"

const BASE_URL = "https://khanfate.com"

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
  return staticPaths.flatMap((path) =>
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
}
