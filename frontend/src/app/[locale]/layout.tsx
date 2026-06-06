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

        {/* Pre-React chunk error recovery — multi-layer defense against
            Cloudflare serving stale HTML with dead chunk hashes.

            Layer 1 (0ms): Listen for <script>/<link> load failures → reload
            Layer 2 (200ms): Probe a known critical chunk → if 404, hard reload
            Layer 3 (5s): Fetch /api/version → if build ID differs, reload
            All layers use sessionStorage to prevent reload loops. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
try{
  var S="sessionStorage",K="_destiny_cr",B="_destiny_bid";
  var s=window[S];
  if(!s)return;
  // Prevent reload loops: if we already reloaded once, stop
  var attempts=parseInt(s.getItem(K)||"0",10);
  if(attempts>=3)return;
  s.setItem(K,String(attempts+1));

  // ── Layer 1: Catch <script>/<link> load failures (0ms) ──
  window.addEventListener("error",function(e){
    var tag=(e.target&&e.target.tagName)||"";
    if(tag==="SCRIPT"||tag==="LINK"){
      // Don't reload immediately — wait for Layer 2 probe
      s.setItem(K+"_fail","1");
    }
  },true);

  // ── Layer 2: Probe the page itself for build ID mismatch (200ms) ──
  setTimeout(function(){
    // Extract build ID from existing script tags in the page
    var scripts=document.querySelectorAll('script[src*="/_next/static/"]');
    var buildId=null;
    for(var i=0;i<scripts.length;i++){
      var m=scripts[i].src.match(/\\/_next\\/static\\/([^/]+)\\//);
      if(m){buildId=m[1];break;}
    }
    if(!buildId)return; // Can't determine build ID, skip probe

    // Fetch the current page HTML and check if its build ID matches
    var xhr=new XMLHttpRequest();
    xhr.open("GET",window.location.href,true);
    xhr.timeout=5000;
    xhr.onload=function(){
      if(xhr.status===200){
        var html=xhr.responseText;
        var match=html.match(/\\/_next\\/static\\/([^/]+)\\//);
        if(match&&match[1]!==buildId){
          // Server has a different build — stale HTML, reload
          window.location.reload(true);
        }
      }
    };
    xhr.onerror=function(){
      // Network error — if Layer 1 already detected failures, reload
      if(s.getItem(K+"_fail")==="1"){
        window.location.reload(true);
      }
    };
    xhr.send();
  },200);

  // ── Layer 3: Version check (5s) ──
  setTimeout(function(){
    fetch("/api/version",{cache:"no-store"}).then(function(r){
      return r.json();
    }).then(function(d){
      var serverBid=d&&d.buildId;
      if(!serverBid)return;
      var embedded=s.getItem(B);
      if(!embedded){
        s.setItem(B,serverBid);
        return;
      }
      if(serverBid!==embedded){
        window.location.reload(true);
      }
    }).catch(function(){});
  },5000);

  // ── Cleanup after 60s ──
  setTimeout(function(){
    try{s.removeItem(K);s.removeItem(K+"_fail");}catch(e){}
  },60000);
}catch(e){}
})();`
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
