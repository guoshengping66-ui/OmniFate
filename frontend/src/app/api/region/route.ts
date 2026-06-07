import { NextRequest, NextResponse } from "next/server"

/**
 * Region detection API
 *
 * Reads Cloudflare's CF-IPCountry header (ISO 3166-1 alpha-2)
 * and returns a normalized region: "domestic" (CN/HK/MO/TW) or "overseas".
 *
 * Detection priority:
 *   1. CF-IPCountry header (Cloudflare, most accurate)
 *   2. X-Forwarded-For + country hints from nginx
 *   3. Fallback to "overseas" (safe default)
 *
 * Response: { region: "domestic" | "overseas", country: string, source: string }
 */

const DOMESTIC_COUNTRIES = new Set([
  "CN", // China mainland
  "HK", // Hong Kong
  "MO", // Macau
  "TW", // Taiwan
])

export async function GET(request: NextRequest) {
  // 1. Try Cloudflare IP Country header
  const cfCountry = request.headers.get("cf-ipcountry")
  if (cfCountry && DOMESTIC_COUNTRIES.has(cfCountry.toUpperCase())) {
    return NextResponse.json(
      { region: "domestic", country: cfCountry.toUpperCase(), source: "cf-ipcountry" },
      { headers: noCacheHeaders },
    )
  }
  if (cfCountry) {
    return NextResponse.json(
      { region: "overseas", country: cfCountry.toUpperCase(), source: "cf-ipcountry" },
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

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Surrogate-Control": "no-store",
  "CDN-Cache-Control": "no-store",
}
