import { NextRequest, NextResponse } from "next/server"

/**
 * Debug endpoint — shows all incoming headers
 * Used to verify Cloudflare header forwarding through nginx
 *
 * DELETE THIS FILE IN PRODUCTION
 */
export async function GET(request: NextRequest) {
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  // Check specific Cloudflare headers
  const cfCountry = request.headers.get("cf-ipcountry")
    || request.headers.get("CF-IPCountry")
    || request.headers.get("cf_visiting_country")
  const cfIp = request.headers.get("cf-connecting-ip")
    || request.headers.get("CF-Connecting-IP")
  const xForwardedFor = request.headers.get("x-forwarded-for")

  return NextResponse.json({
    cf_country_header: cfCountry || "NOT FOUND",
    cf_ip_header: cfIp || "NOT FOUND",
    x_forwarded_for: xForwardedFor || "NOT FOUND",
    all_headers: headers,
  })
}
