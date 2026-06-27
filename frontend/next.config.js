const createNextIntlPlugin = require("next-intl/plugin")
const path = require("path")

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
  // CSP is primarily handled by nginx (server block) to avoid Cloudflare override issues.
  // See /etc/nginx/conf.d/frontend.conf for the Content-Security-Policy header.
  // This Next.js header serves as a FALLBACK — browsers use the strictest policy
  // when multiple CSP headers are present, so if nginx is misconfigured or
  // Cloudflare strips it, this provides baseline XSS protection.
  { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://www.paypal.com; style-src 'self' 'unsafe-inline' https://fonts.font.im https://www.gstatic.com; img-src 'self' https: data: blob:; font-src 'self' https://fonts.font.im; connect-src 'self' https://api.khanfate.com https://www.paypal.com https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'self' https://accounts.google.com https://www.paypal.com" },
]

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Use standalone output for better performance on self-hosted
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),

  // ── Bundle optimization ──────────────────────────────────────────────
  modularizeImports: {
    // Transform lucide-react barrel imports into individual icon imports
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{ kebabCase member }}",
    },
  },
  // Packages to exclude from server bundle (only used client-side)
  serverExternalPackages: [
    "three",
    "@react-three/fiber",
  ],
  experimental: {
    // Optimize CSS to reduce render-blocking resources
    optimizeCss: true,
    // Tree-shake heavy packages more aggressively
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "lodash",
      "ramda",
      "rxjs",
      "@mui/material",
      "@mui/icons-material",
      "date-fns-tz",
      "nanoid",
      "framer-motion",
      "swr",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Cache static assets for 1 year — Next.js already hashes filenames
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache public assets (icons, manifest, robots)
        source: "/(favicon\\.svg|manifest\\.json|robots\\.txt|logo\\.png|logo-.*\\.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
      {
        // OG images — cache 1 day, stale-while-revalidate for fast social previews
        source: "/api/og(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        // Programmatic SEO pages — cache 1 hour at CDN (Cloudflare)
        // These are static SSG pages that rarely change
        source: "/((?:zodiac|tarot|palm-reading|face-reading|bazi|five-elements|ziwei|astrology)/.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
          { key: "CDN-Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        // HTML pages — never cache. After each deploy new chunk hashes are
        // generated; serving stale HTML causes ChunkLoadError (404 on old
        // chunk filenames).  CDN-Cache-Control is prioritized by Cloudflare.
        source: "/((?!_next|api|favicon|logo|og|robots|manifest|zodiac|tarot|palm-reading|face-reading|bazi|five-elements|ziwei|astrology).*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Surrogate-Control", value: "no-store" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        // API routes — no cache (dynamic, auth-dependent)
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ]
  },
  // Backward-compat rewrites: old frontend paths → correct backend paths
  async rewrites() {
    return [
      {
        source: "/api/fate/event-analyze",
        destination: "/api/proxy/api/readings/analyze-event",
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "khanfate.com" },
      { protocol: "https", hostname: "www.khanfate.com" },
      { protocol: "https", hostname: "api.khanfate.com" },
      { protocol: "https", hostname: "s3.amazonaws.com" },
      { protocol: "https", hostname: "oss-cn-hangzhou.aliyuncs.com" },
    ],
    // Serve modern formats for better Core Web Vitals (LCP)
    formats: ["image/avif", "image/webp"],
    // Allow smaller images to be cached aggressively
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = withNextIntl(nextConfig)
