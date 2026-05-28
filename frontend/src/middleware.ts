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
  if (pathname.startsWith("/reading")) {
    const locale = request.cookies.get("NEXT_LOCALE")?.value || "zh"
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(url)
  }

  // Run i18n middleware first (handles locale detection & redirects)
  const intlResponse = intlMiddleware(request)

  // Add security headers to the i18n response
  intlResponse.headers.set("X-Content-Type-Options", "nosniff")
  intlResponse.headers.set("X-Frame-Options", "DENY")
  intlResponse.headers.set("X-XSS-Protection", "1; mode=block")
  intlResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  intlResponse.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // HSTS (production only)
  if (process.env.NODE_ENV === "production") {
    intlResponse.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    )
  }

  // Content-Security-Policy — restrict resource loading
  intlResponse.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.font.im https://fonts.gstatic.com https://www.gstatic.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.font.im https://fonts.gstatic.com https://fonts.gstatic.font.im",
      "connect-src 'self' https://api.khanfate.com https://fonts.googleapis.com https://fonts.font.im https://translate.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  )

  // Prevent Cloudflare from caching HTML pages
  intlResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")

  return intlResponse
}

export const config = {
  // Only run middleware on routes that need locale detection.
  // Static assets, _next/*, and API routes are excluded.
  matcher: ["/", "/((?!_next|api|favicon.ico|.*\\.|en|zh).*)"],
}
