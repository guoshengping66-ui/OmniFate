/** @type {import("next").NextConfig} */

// Production backend URL — .env files are gitignored and not deployed to Vercel,
// so we hardcode the default here. Local dev overrides via .env.local.
const PROD_BACKEND = "https://api.khanfate.com"
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
      { protocol: "http",  hostname: "localhost" },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || PROD_BACKEND,
  },
  async rewrites() {
    return [{
      source: "/api/:path*",
      destination: `${BACKEND_URL}/api/:path*`,
    }]
  },
}
module.exports = nextConfig
