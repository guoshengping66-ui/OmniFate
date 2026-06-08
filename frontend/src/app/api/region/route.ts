import { NextRequest, NextResponse } from "next/server"

/**
 * Region detection API
 *
 * Detection priority:
 *   1. CF-IPCountry header from Cloudflare (most reliable, no API call needed)
 *   2. Accept-Language header (weak signal)
 *   3. Default to "overseas"
 *
 * Response: { region: "domestic" | "overseas", country: string, source: string }
 */

const DOMESTIC_COUNTRIES = new Set([
  "CN", // China mainland
  "HK", // Hong Kong
  "MO", // Macau
  "TW", // Taiwan
])

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Surrogate-Control": "no-store",
  "CDN-Cache-Control": "no-store",
}

export async function GET(request: NextRequest) {
  // 1. Cloudflare IP country code (most accurate, set by Cloudflare edge)
  const cfCountry = request.headers.get("cf-ipcountry")?.toUpperCase()
  if (cfCountry) {
    const region = DOMESTIC_COUNTRIES.has(cfCountry) ? "domestic" : "overseas"
    return NextResponse.json(
      { region, country: cfCountry, source: "cf-ipcountry" },
      { headers: noCacheHeaders },
    )
  }

  // 2. Try Accept-Language as weak signal
  const acceptLang = request.headers.get("accept-language") || ""
  if (acceptLang.toLowerCase().includes("zh")) {
    return NextResponse.json(
      { region: "domestic", country: "UNKNOWN", source: "accept-language" },
      { headers: noCacheHeaders },
    )
  }

  // 3. Default to overseas
  return NextResponse.json(
    { region: "overseas", country: "UNKNOWN", source: "default" },
    { headers: noCacheHeaders },
  )
}
