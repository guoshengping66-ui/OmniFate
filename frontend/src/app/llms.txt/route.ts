import { createLlmsTxt } from "@/lib/seo/siteDiscovery"

export function GET() {
  return new Response(createLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}
