import type { MetadataRoute } from "next"
import { createRobotsRules } from "@/lib/seo/crawlerPolicy"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: createRobotsRules(),
    sitemap: "https://www.khanfate.com/sitemap.xml",
  }
}
