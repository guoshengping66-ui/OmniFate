import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "@/i18n/config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Combined middleware:
 *  1. Locale detection & i18n routing (via next-intl)
 *  2. Block /test/* routes in production
 *  3. Add security response headers (CSP, HSTS, X-Frame-Options, etc.)
 */

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

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

const DOMESTIC_COUNTRIES = new Set(["CN", "HK", "MO", "TW"])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block test routes in production
  if (process.env.NODE_ENV === "production" && pathname.startsWith("/test")) {
    return new NextResponse("Page Not Found", { status: 404 })
  }

  // ── Region detection: set/update region cookie from CF-IPCountry ──
  // Cloudflare sets this header; nginx must pass it through (proxy_set_header CF-IPCountry $http_cf_ipcountry;)
  // Always update when country changes (e.g. user switches network/VPN)
  const cfCountry = request.headers.get("cf-ipcountry")?.toUpperCase()
  const existingCountry = request.cookies.get("country")?.value
  const existingRegion = request.cookies.get("region")?.value

  if (cfCountry) {
    const isDomestic = DOMESTIC_COUNTRIES.has(cfCountry)
    const region = isDomestic ? "domestic" : "overseas"

    // Only update if: no cookie exists yet, OR country changed
    if (!existingRegion || existingCountry !== cfCountry) {
      // Run i18n middleware first, then set cookies on its response
      const intlResponse = intlMiddleware(request)
      applySecurityHeaders(intlResponse)

      intlResponse.cookies.set("region", region, {
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        secure: true,
        path: "/",
      })
      intlResponse.cookies.set("country", cfCountry, {
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        secure: true,
        path: "/",
      })

      return intlResponse
    }
  }

  // Redirect /reading/* to /{locale}/reading/* if locale is missing
  // Skip if path already has a locale prefix (e.g. /en/reading or /zh/reading)
  if (pathname.startsWith("/reading") && !pathname.match(/^\/(en|zh)\//)) {
    const locale = request.cookies.get("NEXT_LOCALE")?.value || "zh"
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(url)
  }

  // Run i18n middleware first (handles locale detection & redirects)
  const intlResponse = intlMiddleware(request)

  // Apply security headers
  applySecurityHeaders(intlResponse)

  return intlResponse
}

export const config = {
  // Only run middleware on routes that need locale detection.
  // Static assets, _next/*, and API routes are excluded.
  // Also exclude paths already prefixed with /en or /zh to prevent double-prefix.
  matcher: ["/", "/((?!_next|api|favicon.ico|.*\\.|en/|zh/|en$|zh$).*)"],
}
