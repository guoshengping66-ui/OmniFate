export type CrawlerRule = {
  userAgent: string | string[]
  allow?: string | string[]
  disallow?: string | string[]
}

export const PRIVATE_DISALLOW_PATHS = ["/account", "/checkout", "/readings", "/api/"]
export const AI_SEARCH_CRAWLERS = ["OAI-SearchBot", "OAI-AdsBot", "PerplexityBot", "ClaudeBot"]
export const TRAINING_CRAWLERS = ["GPTBot"]
const SEARCH_CRAWLERS = ["Googlebot", "Bingbot", "Yandex", ...AI_SEARCH_CRAWLERS]
const PUBLIC_SEARCH_ALLOW_PATHS = ["/en/", "/zh/", "/sitemap.xml", "/llms.txt"]

export function createRobotsRules(): CrawlerRule[] {
  return [
    {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_DISALLOW_PATHS,
    },
    ...SEARCH_CRAWLERS.map((userAgent) => ({
      userAgent,
      allow: PUBLIC_SEARCH_ALLOW_PATHS,
      disallow: PRIVATE_DISALLOW_PATHS,
    })),
    ...TRAINING_CRAWLERS.map((userAgent) => ({ userAgent, disallow: ["/"] })),
  ]
}
