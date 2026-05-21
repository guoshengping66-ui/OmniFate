import type { Metadata, Viewport } from "next"
import { getMessages, setRequestLocale } from "next-intl/server"
import { locales, type Locale } from "@/i18n/config"
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

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  return {
    title: isZh ? "命盘智镜 · 全维度命理分析" : "Destiny Mirror · Multi-Dimension Destiny Analysis",
    description: isZh
      ? "融合八字、星盘、塔罗、面相、手相五大 AI 命理系统，为你提供精准的命运解读与改运方案。"
      : "AI-powered destiny analysis combining Bazi, Western astrology, Tarot, face reading, and palmistry. Discover your life blueprint and personalized fortune guidance.",
    alternates: {
      languages: {
        en: "/en",
        zh: "/zh",
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const validLocale = locales.includes(locale as Locale) ? locale : "en"

  // Enable static rendering for this locale
  setRequestLocale(validLocale)

  // Load translations server-side — only the active locale is fetched
  const messages = await getMessages()

  return (
    <html lang={validLocale === "zh" ? "zh-CN" : "en"}>
      <body>
        <AppProviders messages={messages} locale={validLocale}>
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
