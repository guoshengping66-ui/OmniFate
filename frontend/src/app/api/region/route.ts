import { NextRequest, NextResponse } from "next/server"

/**
 * Region detection API
 *
 * Detection priority:
 *   1. ipwho.is geolocation API (free, accurate, no key required)
 *   2. Accept-Language header (weak signal)
 *   3. Default to "overseas"
 *
 * NOTE: We do NOT use CF-IPCountry because it is inaccurate for some IPs
 * (e.g. returns CN for US-based VPN IPs). ipwho.is uses MaxMind data
 * and is more reliable.
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
  // 1. Get user's real IP from Cloudflare/proxy headers
  const connectingIp = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()

  if (connectingIp) {
    try {
      const geoRes = await fetch(`https://ipwho.is/${connectingIp}`, {
        signal: AbortSignal.timeout(3000),
      })
      const geoData = await geoRes.json()
      if (geoData.success && geoData.country_code) {
        const code = geoData.country_code.toUpperCase()
        const region = DOMESTIC_COUNTRIES.has(code) ? "domestic" : "overseas"
        return NextResponse.json(
          { region, country: code, source: "ipwho.is" },
          { headers: noCacheHeaders },
        )
      }
    } catch {
      // ipwho.is failed — fall through
    }
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
