import { NextRequest, NextResponse } from "next/server"

/**
 * Region detection API
 *
 * Detection priority:
 *   1. ip-api.com geolocation (free, accurate, no key required)
 *   2. CF-IPCountry header from Cloudflare (fallback)
 *   3. Accept-Language header (weak signal)
 *   4. Default to "overseas"
 *
 * NOTE: Cloudflare's cf-ipcountry can be inaccurate for some IPs.
 * We use ip-api.com from the SERVER side (not browser) which is reliable.
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
  // Get user's real IP from Cloudflare headers
  const connectingIp = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()

  // 1. Server-side geolocation via ip-api.com (accurate, free)
  if (connectingIp) {
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${connectingIp}?fields=countryCode,status`, {
        signal: AbortSignal.timeout(3000),
      })
      const geoData = await geoRes.json()
      if (geoData.status === "success" && geoData.countryCode) {
        const code = geoData.countryCode.toUpperCase()
        const region = DOMESTIC_COUNTRIES.has(code) ? "domestic" : "overseas"
        return NextResponse.json(
          { region, country: code, source: "ip-api.com" },
          { headers: noCacheHeaders },
        )
      }
    } catch {
      // ip-api.com failed — fall through to Cloudflare header
    }
  }

  // 2. Cloudflare IP country code (fallback)
  const cfCountry = request.headers.get("cf-ipcountry")?.toUpperCase()
  if (cfCountry) {
    const region = DOMESTIC_COUNTRIES.has(cfCountry) ? "domestic" : "overseas"
    return NextResponse.json(
      { region, country: cfCountry, source: "cf-ipcountry" },
      { headers: noCacheHeaders },
    )
  }

  // 3. Try Accept-Language as weak signal
  const acceptLang = request.headers.get("accept-language") || ""
  if (acceptLang.toLowerCase().includes("zh")) {
    return NextResponse.json(
      { region: "domestic", country: "UNKNOWN", source: "accept-language" },
      { headers: noCacheHeaders },
    )
  }

  // 4. Default to overseas
  return NextResponse.json(
    { region: "overseas", country: "UNKNOWN", source: "default" },
    { headers: noCacheHeaders },
  )
}
