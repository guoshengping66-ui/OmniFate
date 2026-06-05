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
import { OnboardingGuide } from "@/components/ui/OnboardingGuide"
import { ChunkRecovery } from "@/components/ui/ChunkRecovery"

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
  const baseUrl = "https://www.khanfate.com"

  return {
    title: isZh ? "命盘智镜 · 全维度命理分析" : "Destiny Mirror · Multi-Dimension Destiny Analysis",
    description: isZh
      ? "融合八字、星盘、塔罗、面相、手相五大 AI 命理系统，为你提供精准的命运解读与改运方案。"
      : "AI-powered destiny analysis combining Bazi, Western astrology, Tarot, face reading, and palmistry. Discover your life blueprint and personalized fortune guidance.",
    keywords: isZh
      ? "八字,星盘,塔罗,面相,手相,命理,AI分析,运势,命运,改运"
      : "bazi,astrology,tarot,face reading,palmistry,destiny,fortune,AI analysis",
    authors: [{ name: "Destiny Mirror" }],
    openGraph: {
      title: isZh ? "命盘智镜 · 全维度命理分析" : "Destiny Mirror · Multi-Dimension Destiny Analysis",
      description: isZh
        ? "融合八字、星盘、塔罗、面相、手相五大 AI 命理系统，为你提供精准的命运解读与改运方案。"
        : "AI-powered destiny analysis combining Bazi, Western astrology, Tarot, face reading, and palmistry.",
      url: `${baseUrl}/${locale}`,
      siteName: "Destiny Mirror",
      images: [
        {
          url: `${baseUrl}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: isZh ? "命盘智镜" : "Destiny Mirror",
        },
      ],
      locale: isZh ? "zh_CN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? "命盘智镜 · 全维度命理分析" : "Destiny Mirror",
      description: isZh
        ? "AI 全维度命理分析平台"
        : "AI-powered multi-dimension destiny analysis",
      images: [`${baseUrl}/og-image.svg`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: "/en",
        zh: "/zh",
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
  const validLocale = locales.includes(locale as Locale) ? locale : "en"

  // Enable static rendering for this locale
  setRequestLocale(validLocale)

  // Load translations server-side — only the active locale is fetched
  const messages = await getMessages()

  return (
    <html lang={validLocale === "zh" ? "zh-CN" : "en"}>
      <head>
        <link rel="preconnect" href="https://fonts.font.im" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.khanfate.com" />
        {/* No prefetch links — Cloudflare returns 503 for some pages, causing console errors */}
        {/* Async font loading: non-blocking, swap to system font until loaded */}
        <link
          rel="stylesheet"
          href="https://fonts.font.im/css2?family=Inter:wght@300;400;500;600&display=swap"
          media="print"
        />
        <noscript>
          <link rel="stylesheet" href="https://fonts.font.im/css2?family=Inter:wght@300;400;500;600&display=swap" />
        </noscript>

        {/* Pre-React chunk error recovery: catches 404 on critical chunks
            (layout, page, webpack) that fail before React can mount.
            Cloudflare may serve stale HTML referencing old chunk hashes;
            this script detects the failure and forces a fresh fetch. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k="_destiny_cr",s=sessionStorage;var r=s.getItem(k);if(r==="2")return;s.setItem(k,"2");window.addEventListener("error",function(e){var t=(e.target&&e.target.tagName)||"";if(t==="SCRIPT"||t==="LINK"){s.setItem(k,"2");setTimeout(function(){window.location.reload()},200)}},{capture:true});setTimeout(function(){s.removeItem(k)},30000)}catch(e){}})();`
          }}
        />

        {/* JSON-LD Structured Data — content is server-generated, not user-controlled */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: validLocale === "zh" ? "命盘智镜" : "Destiny Mirror",
              url: `https://www.khanfate.com/${validLocale}`,
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web",
              description: validLocale === "zh"
                ? "融合八字、星盘、塔罗、面相、手相五大 AI 命理系统"
                : "AI-powered destiny analysis combining Bazi, Western astrology, Tarot, face reading, and palmistry",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "CNY",
              },
              author: {
                "@type": "Organization",
                name: "Destiny Mirror",
                url: "https://www.khanfate.com",
              },
              inLanguage: validLocale === "zh" ? "zh-CN" : "en",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.khanfate.com/{search_term_string}",
                "query-input": "required name=search_term_string",
              },
            })
          }}
        />

      </head>
      <body>
        <ChunkRecovery />
        <AppProviders messages={messages} locale={validLocale}>
          <ServiceWorkerRegistration />
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
              style: { background: "#2D1B4E", color: "#E8CB7A", border: "1px solid #C9A84C44" },
            }}
          />
        </AppProviders>
      </body>
    </html>
  )
}
