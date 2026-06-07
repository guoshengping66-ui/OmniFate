import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "@/i18n/config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Combined middleware:
 *  1. Locale detection & i18n routing (via next-intl)
 *  2. Block /test/* routes in production
 *  3. Add security response headers (CSP, HSTS, X-Frame-Options, etc.)
 *
 * NOTE: Region detection is NOT done in middleware because Cloudflare's
 * CF-IPCountry header can be inaccurate (returns wrong country for some IPs).
 * Instead, the frontend calls /api/region on mount to get the correct region
 * from the CF-IPCountry header, and sets the cookie client-side.
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

  return intlResponse
}

export const config = {
  // Run on ALL routes except static assets, API routes, and files with extensions.
  matcher: ["/", "/((?!_next|api|favicon.ico|.*\\.).*)"],
}
