import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { Toaster } from "react-hot-toast"
import { StarField } from "@/components/ui/StarField"
import { MagicCursor } from "@/components/ui/MagicCursor"
import { NebulaBackground } from "@/components/ui/NebulaBackground"
import { AppProviders } from "@/components/ui/AppProviders"
import { RouteProgress } from "@/components/ui/RouteProgress"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "命盘智镜 · 全维度命理分析平台",
  description: "融合周易八字、西方星盘、塔罗占卜与AI面相，为你揭示命运密码，推荐精准改运方案。",
  keywords: ["八字", "星盘", "塔罗", "面相", "命理", "改运"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProviders>
          <RouteProgress />
          <NebulaBackground />
          <StarField />
          <MagicCursor />
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: "#2D1B4E", color: "#E8CB7A", border: "1px solid #C9A84C44" },
            }}
          />
        </AppProviders>
        <Analytics />
      </body>
    </html>
  )
}
