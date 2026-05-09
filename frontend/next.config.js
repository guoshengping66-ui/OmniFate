/** @type {import("next").NextConfig} */

// Production backend URL — .env files are gitignored and not deployed to Vercel,
// so we hardcode the default here. Local dev overrides via .env.local.
const PROD_BACKEND = "https://api.khanfate.com"
const BACKEND_URL = process.env.BACKEND_URL || PROD_BACKEND

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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.font.im https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.font.im https://fonts.gstatic.com",
      "connect-src 'self' https://api.khanfate.com https://api.deepseek.com http://localhost:* http://127.0.0.1:*",
      "frame-ancestors 'self'",
    ].join("; "),
  },
]

const nextConfig = {
  output: "standalone",
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
module.exports = nextConfig
