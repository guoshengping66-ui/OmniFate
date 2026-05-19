import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { Toaster } from "react-hot-toast"
import AnimatedBackground from "@/components/ui/AnimatedBackground"
import { AppProviders } from "@/components/ui/AppProviders"
import { RouteProgress } from "@/components/ui/RouteProgress"
import { ServiceWorkerRegistration } from "@/components/ui/ServiceWorkerRegistration"
import { MonthlyGrantToast } from "@/components/ui/MonthlyGrantToast"

export const viewport: Viewport = {
  themeColor: "#C9A84C",
}

export const metadata: Metadata = {
  title: "Destiny Mirror · Multi-Dimension Destiny Analysis",
  description: "AI-powered destiny analysis combining Bazi, Western astrology, Tarot, face reading, and palmistry. Discover your life blueprint and personalized fortune guidance.",
  keywords: ["bazi", "astrology", "tarot", "face reading", "destiny", "fortune"],
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Destiny Mirror",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <ServiceWorkerRegistration />
          <MonthlyGrantToast />
          <RouteProgress />
          <AnimatedBackground />
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
      </body>
    </html>
  )
}
