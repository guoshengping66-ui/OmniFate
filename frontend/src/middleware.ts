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

  // Run i18n middleware first (handles locale detection & redirects)
  const intlResponse = intlMiddleware(request)

  // Add security headers to the i18n response
  // CSP is handled by nginx — do NOT set it here to avoid double-header conflicts
  intlResponse.headers.set("X-Content-Type-Options", "nosniff")
  intlResponse.headers.set("X-Frame-Options", "DENY")
  intlResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  intlResponse.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // HSTS (production only)
  if (process.env.NODE_ENV === "production") {
    intlResponse.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    )
  }

  // Prevent Cloudflare from caching HTML pages
  intlResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")

  return intlResponse
}

export const config = {
  // Only run middleware on routes that need locale detection.
  // Static assets, _next/*, and API routes are excluded.
  // Also exclude paths already prefixed with /en or /zh to prevent double-prefix.
  matcher: ["/", "/((?!_next|api|favicon.ico|.*\\.|en/|zh/|en$|zh$).*)"],
}
