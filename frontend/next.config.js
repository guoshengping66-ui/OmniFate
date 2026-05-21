const createNextIntlPlugin = require("next-intl/plugin")

const withNextIntl = createNextIntlPlugin()

/** @type {import("next").NextConfig} */

// Production backend URL — .env files are gitignored and not deployed to Vercel,
// so we hardcode the default here. Local dev overrides via .env.local.
const PROD_BACKEND = "https://api.khanfate.com"
const BACKEND_URL = process.env.BACKEND_URL || PROD_BACKEND
const isProd = process.env.NODE_ENV === "production"

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' is REQUIRED for Next.js React Server Components (RSC).
      // RSC pushes hydration data via inline <script> tags — without 'unsafe-inline'
      // the browser blocks all inline scripts, causing a blank page on every device.
      `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
      "style-src 'self' 'unsafe-inline' https://fonts.font.im https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.font.im https://fonts.gstatic.com https://fonts.gstatic.font.im",
      `connect-src 'self' https://api.khanfate.com https://api.deepseek.com${isProd ? "" : " http://localhost:* http://127.0.0.1:*"}`,
      "frame-ancestors 'self'",
    ].join("; "),
  },
]

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // HTML pages — short cache to ensure fresh deploys
        source: "/((?!_next/static|_next/image|favicon|api).*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        // Cache static assets for 1 year — Next.js already hashes filenames
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache public assets
        source: "/(favicon\\.svg|manifest\\.json|robots\\.txt)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "khanfate.com" },
      { protocol: "https", hostname: "www.khanfate.com" },
      { protocol: "https", hostname: "api.khanfate.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },   // S3
      { protocol: "https", hostname: "**.aliyuncs.com" },    // 阿里云 OSS
    ],
  },
}

module.exports = withNextIntl(nextConfig)
