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
  // CSP is now handled by nginx (server block) to avoid Cloudflare override issues.
  // See /etc/nginx/conf.d/frontend.conf for the Content-Security-Policy header.
]

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Use standalone output for better performance on self-hosted
  output: "standalone",

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
        // HTML pages — never cache. After each deploy new chunk hashes are
        // generated; serving stale HTML causes ChunkLoadError (404 on old
        // chunk filenames).  Surrogate-Control tells Cloudflare to never cache.
        source: "/((?!_next|api|favicon|logo|og|robots|manifest).*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Surrogate-Control", value: "no-store" },
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
      { protocol: "https", hostname: "s3.amazonaws.com" },   // S3
      { protocol: "https", hostname: "oss-cn-hangzhou.aliyuncs.com" },  // 阿里云 OSS
    ],
  },
}

module.exports = withNextIntl(nextConfig)
