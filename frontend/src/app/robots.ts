import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/checkout", "/readings", "/api/"],
      },
      {
        // Allow search engines full access to programmatic SEO pages
        userAgent: ["Googlebot", "Bingbot", "Yandex"],
        allow: [
          "/en/",
          "/zh/",
          "/sitemap.xml",
        ],
        disallow: ["/account", "/checkout", "/readings", "/api/"],
      },
    ],
    sitemap: "https://www.khanfate.com/sitemap.xml",
  }
}
