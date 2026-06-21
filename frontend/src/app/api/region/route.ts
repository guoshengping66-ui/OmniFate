import { NextRequest, NextResponse } from "next/server"

/**
 * Region detection API
 *
 * Detection priority:
 *   1. CF-IPCountry header from Cloudflare (HTTPS, no privacy risk — preferred)
 *   2. ip-api.com geolocation (free, accurate, HTTP only — privacy tradeoff)
 *   3. Accept-Language header (weak signal)
 *   4. Default to "overseas"
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

  // 1. Cloudflare IP country code (HTTPS, no privacy risk — preferred)
  const cfCountry = request.headers.get("cf-ipcountry")?.toUpperCase()
  if (cfCountry) {
    const region = DOMESTIC_COUNTRIES.has(cfCountry) ? "domestic" : "overseas"
    return NextResponse.json(
      { region, country: cfCountry, source: "cf-ipcountry" },
      { headers: noCacheHeaders },
    )
  }

  // 2. Server-side geolocation via ip-api.com (accurate, free tier)
  // NOTE: ip-api.com free tier only supports HTTP — user IP is transmitted in plaintext.
  // This is a privacy tradeoff for accuracy. If privacy is critical, disable this
  // and rely solely on CF-IPCountry above.
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
      // ip-api.com failed — fall through to Accept-Language
    }
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
