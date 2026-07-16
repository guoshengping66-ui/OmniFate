export type CrawlerRule = {
  userAgent: string | string[]
  allow?: string | string[]
  disallow?: string | string[]
}

export const PRIVATE_DISALLOW_PATHS = ["/account", "/checkout", "/readings", "/api/"]
export const AI_SEARCH_CRAWLERS = ["OAI-SearchBot", "OAI-AdsBot", "PerplexityBot", "ClaudeBot"]
export const TRAINING_CRAWLERS = ["GPTBot"]

export function createRobotsRules(): CrawlerRule[] {
  return [
    {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_DISALLOW_PATHS,
    },
    {
      userAgent: ["Googlebot", "Bingbot", "Yandex", ...AI_SEARCH_CRAWLERS],
      allow: ["/en/", "/zh/", "/sitemap.xml", "/llms.txt"],
      disallow: PRIVATE_DISALLOW_PATHS,
    },
    ...TRAINING_CRAWLERS.map((userAgent) => ({ userAgent, disallow: ["/"] })),
  ]
}
