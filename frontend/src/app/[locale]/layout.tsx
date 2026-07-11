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
import { MonthlyGrantToast } from "@/components/ui/MonthlyGrantToast"
import { OnboardingGuide } from "@/components/ui/OnboardingGuide"
import { ChunkRecovery } from "@/components/ui/ChunkRecovery"
import { safeJsonLd } from "@/utils/safeJsonLd"

const SITE_URL = "https://www.khanfate.com"
const APP_NAME = "Inner Atlas AI"
const EN_DESCRIPTION =
  "Inner Atlas AI combines ancient pattern systems with modern AI analysis to create personal reports, relationship insight, growth windows, and daily action guidance."
const ZH_DESCRIPTION =
  "Inner Atlas AI 将东方结构系统与现代 AI 分析结合，生成个人结构档案、关系模式、成长窗口和每日行动建议。"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071713",
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
  const title = isZh ? "Inner Atlas AI | AI 人生报告与每日行动" : "Inner Atlas AI | Personal insight and daily action"
  const description = isZh ? ZH_DESCRIPTION : EN_DESCRIPTION

  return {
    title,
    description,
    keywords: isZh
      ? "AI人生报告,个人成长,每日行动,关系分析,东方哲学,AI自我认知"
      : "AI life report,personal insight,self knowledge,daily action,relationship insight,growth map",
    authors: [{ name: APP_NAME }],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}`,
      siteName: APP_NAME,
      images: [
        {
          url: `${SITE_URL}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: APP_NAME,
        },
      ],
      locale: isZh ? "zh_CN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/og-image.svg`],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: "/en",
        zh: "/zh",
        "x-default": "/en",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
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
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : "en"

  setRequestLocale(validLocale)
  const messages = await getMessages()
  const initialRegion: "domestic" | "overseas" = "overseas"

  return (
    <html lang={validLocale === "zh" ? "zh-CN" : "en"} translate="no">
      <head>
        <link rel="preconnect" href="https://api.khanfate.com" />
        <link rel="preconnect" href="https://checkout.stripe.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if("serviceWorker" in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})}).catch(function(){})}}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: APP_NAME,
              url: `${SITE_URL}/${validLocale}`,
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web",
              description: validLocale === "zh" ? ZH_DESCRIPTION : EN_DESCRIPTION,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: APP_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/logo.png`,
              },
              inLanguage: validLocale === "zh" ? "zh-CN" : "en",
            }),
          }}
        />
              <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: APP_NAME,
              url: SITE_URL,
              description: validLocale === "zh" ? ZH_DESCRIPTION : EN_DESCRIPTION,
              inLanguage: validLocale === "zh" ? "zh-CN" : "en",
            }),
          }}
        />
</head>
      <body>
        <ChunkRecovery />
        <AppProviders messages={messages} locale={validLocale} initialRegion={initialRegion}>
          <MonthlyGrantToast />
          <OnboardingGuide />
          <RouteProgress />
          <AnimatedBackground />
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: "#07110F", color: "#F4EFE2", border: "1px solid rgba(201, 168, 76, 0.25)" },
            }}
          />
        </AppProviders>
      </body>
    </html>
  )
}
