/** @type {import("next").NextConfig} */

// Production backend URL — .env files are gitignored and not deployed to Vercel,
// so we hardcode the default here. Local dev overrides via .env.local.
// NOTE: Server has no SSL, so use HTTP. Vercel's rewrite proxies server-side
// (no mixed-content issue since it's server-to-server).
const PROD_BACKEND = "http://api.khanfate.com"
const BACKEND_URL = process.env.BACKEND_URL || PROD_BACKEND

const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
  },
  async rewrites() {
    return [{
      source: "/api/:path*",
      destination: `${BACKEND_URL}/api/:path*`,
    }]
  },
}
module.exports = nextConfig
