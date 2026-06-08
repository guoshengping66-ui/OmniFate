import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "@/i18n/config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Combined middleware:
 *  1. Region detection via GeoIP (CF-IPCountry → Accept-Language → default)
 *  2. Locale detection & i18n routing (via next-intl)
 *  3. Block /test/* routes in production
 *  4. Add security response headers (HSTS, X-Frame-Options, etc.)
 *
 * Region detection flow (always re-detects from IP):
 *   1. Use Cloudflare's CF-IPCountry header (most accurate, always fresh)
 *   2. Fall back to Accept-Language header (weak signal for zh-*)
 *   3. Default to "overseas"
 *
 * The detected region is set as a cookie and injected as x-omni-region header,
 * so server components and API routes can read it without client detection.
 */

const DOMESTIC_COUNTRY_CODES = new Set(["CN", "HK", "MO", "TW"])

type Region = "domestic" | "overseas"

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

/**
 * Detect user's region from request headers.
 * ALWAYS re-detects from CF-IPCountry on every request.
 * This ensures VPN/proxy IP changes are immediately reflected.
 *
 * Priority: CF-IPCountry > Accept-Language > default
 */
function detectRegion(request: NextRequest): Region {
  // 1. Cloudflare IP country code (most accurate, always fresh)
  const cfCountry = request.headers.get("cf-ipcountry")?.toUpperCase()
  if (cfCountry && DOMESTIC_COUNTRY_CODES.has(cfCountry)) {
    return "domestic"
  }

  // 2. Accept-Language as weak fallback
  const acceptLang = request.headers.get("accept-language") || ""
  if (acceptLang.toLowerCase().includes("zh")) {
    return "domestic"
  }

  // 3. Default to overseas
  return "overseas"
}

/** Apply common security + cache-control headers to a response */
function applySecurityHeaders(response: NextResponse) {
  // CSP is handled by nginx — do NOT set it here to avoid double-header conflicts
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    )
  }

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block test routes in production
  if (process.env.NODE_ENV === "production" && pathname.startsWith("/test")) {
    return new NextResponse("Page Not Found", { status: 404 })
  }

  // Redirect /reading/* to /{locale}/reading/* if locale is missing
  // Skip if path already has a locale prefix (e.g. /en/reading or /zh/reading)
  if (pathname.startsWith("/reading") && !pathname.match(/^\/(en|zh)\//)) {
    const locale = request.cookies.get("NEXT_LOCALE")?.value || "zh"
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(url)
  }

  // Run i18n middleware (handles locale detection & redirects)
  const intlResponse = intlMiddleware(request)

  // Apply security headers
  applySecurityHeaders(intlResponse)

  // ── Server-side region detection ──
  // Detect region from GeoIP headers and set cookie + header for downstream use
  const region = detectRegion(request)

  // Set region cookie (30-day expiry)
  intlResponse.cookies.set("region", region, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
    sameSite: "lax",
  })

  // Inject region header for server components and API routes
  intlResponse.headers.set("x-omni-region", region)

  return intlResponse
}

export const config = {
  // Run on ALL routes except static assets, API routes, and files with extensions.
  matcher: ["/", "/((?!_next|api|favicon.ico|.*\\.).*)"],
}
