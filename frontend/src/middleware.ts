import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "@/i18n/config"

/**
 * Edge-optimized middleware:
 *  • Only actively processes the root "/" redirect — all other routes are
 *    pre-rendered static assets or already under /[locale]/…
 *  • Locale detection: Cookie → Accept-Language header → fallback to default
 *  • Matching pre-rendered pages bypasses server compilation entirely
 */
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

export const config = {
  // Only run middleware on routes that need locale detection.
  // Static assets, _next/*, and API routes are excluded.
  matcher: ["/", "/(zh|en)/:path*", "/((?!_next|api|favicon|manifest|robots).*)"],
}
