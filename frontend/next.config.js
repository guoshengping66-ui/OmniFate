/** @type {import("next").NextConfig} */

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8002"

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "localhost" },
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
