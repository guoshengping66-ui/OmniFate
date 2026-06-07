import { NextRequest, NextResponse } from "next/server"

/**
 * Region detection API
 *
 * Detection priority:
 *   1. CF-IPCountry header (Cloudflare — may be inaccurate for some IPs)
 *   2. ipwho.is geolocation API (free, no key required — fallback)
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
  // 1. Try Cloudflare IP Country header
  const cfCountry = request.headers.get("cf-ipcountry")?.toUpperCase()
  if (cfCountry && DOMESTIC_COUNTRIES.has(cfCountry)) {
    return NextResponse.json(
      { region: "domestic", country: cfCountry, source: "cf-ipcountry" },
      { headers: noCacheHeaders },
    )
  }
  if (cfCountry && !DOMESTIC_COUNTRIES.has(cfCountry)) {
    return NextResponse.json(
      { region: "overseas", country: cfCountry, source: "cf-ipcountry" },
      { headers: noCacheHeaders },
    )
  }

  // 2. Fallback: use ipwho.is geolocation API (free, no key required)
  const connectingIp = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (connectingIp) {
    try {
      const geoRes = await fetch(`https://ipwho.is/${connectingIp}`, {
        signal: AbortSignal.timeout(3000), // 3 second timeout
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
      // ipwho.is failed — fall through to next method
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
