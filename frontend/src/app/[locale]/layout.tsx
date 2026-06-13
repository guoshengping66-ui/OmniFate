import type { Metadata, Viewport } from "next"

import { getMessages, setRequestLocale } from "next-intl/server"
import { cookies } from "next/headers"
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
    title: isZh ? "行为分析镜 · 全维度行为分析" : "Behavioral Mirror · Multi-Dimension Behavioral Analysis",
    description: isZh
      ? "融合四柱分析、图表分析、符号分析、面部特征、手部特征五大 AI 分析系统，为你提供精准的行为解读与优化方案。"
      : "AI-powered behavioral analysis combining Four-Pillar, Stellar Profile, Symbolic, Facial Feature, and Hand Feature. Discover your behavioral pattern and personalized optimization guidance.",
    keywords: isZh
      ? "四柱分析,图表分析,符号分析,面部特征,手部特征,AI分析,行为分析,数据分析"
      : "four-pillar,stellar profile,symbolic,facial feature,hand feature,AI analysis,behavioral analysis,data analysis",
    authors: [{ name: "Behavioral Mirror" }],
    openGraph: {
      title: isZh ? "行为分析镜 · 全维度行为分析" : "Behavioral Mirror · Multi-Dimension Behavioral Analysis",
      description: isZh
        ? "融合四柱分析、图表分析、符号分析、面部特征、手部特征五大 AI 分析系统，为你提供精准的行为解读与优化方案。"
        : "AI-powered behavioral analysis combining Four-Pillar, Stellar Profile, Symbolic, Facial Feature, and Hand Feature.",
      url: `${baseUrl}/${locale}`,
      siteName: "Behavioral Mirror",
      images: [
        {
          url: `${baseUrl}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: isZh ? "行为分析镜" : "Behavioral Mirror",
        },
      ],
      locale: isZh ? "zh_CN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? "行为分析镜 · 全维度行为分析" : "Behavioral Mirror",
      description: isZh
        ? "AI 全维度行为分析平台"
        : "AI-powered multi-dimension behavioral analysis",
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

  // Read region cookie set by middleware (CF-IPCountry based)
  const cookieStore = await cookies()
  const regionCookie = cookieStore.get("region")?.value
  const initialRegion = regionCookie === "overseas" ? "overseas" : "domestic"

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
          <style>{`/* Fallback: make all content visible when JS fails to load */
[style*="opacity:0"] { opacity: 1 !important; transform: none !important; }
.anim-stagger > * { opacity: 1 !important; animation: none !important; }
[data-animate] { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>

        {/* Safety net: if webpack/React fails to hydrate within 4s, force all
            content visible. This inline script runs independently of the bundle.
            It's harmless when React hydrates normally (opacity is already 1). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
try{
  var t=setTimeout(function(){
    document.querySelectorAll('[style*="opacity:0"]').forEach(function(el){
      el.style.opacity='1';
      el.style.transform='none';
    });
    document.querySelectorAll('.anim-stagger>*').forEach(function(el){
      el.style.opacity='1';
      el.style.animation='none';
    });
    document.querySelectorAll('[data-animate]').forEach(function(el){
      el.style.opacity='1';
      el.style.transform='none';
    });
    document.querySelectorAll('[style*="translateY(30px)"]').forEach(function(el){
      el.style.opacity='1';
      el.style.transform='none';
    });
  },4000);
  // Cancel if React hydrates (App Router uses __next_f, not __NEXT_DATA__)
  if(window.__next_f){try{clearTimeout(t)}catch(e){}}
}catch(e){}
})();`,
          }}
        />

        {/* Pre-React chunk error recovery — defense against Cloudflare
            serving stale HTML with dead chunk hashes.

            IMMEDIATE version check: compares embedded build ID with server
            on page load. If stale, reloads instantly with cache-bust.
            Also detects <script>/<link> load failures as a fallback.
            All layers use sessionStorage (max 3 attempts) to prevent loops. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
try{
  var S="sessionStorage",K="_profile_cr",B="_profile_bid";
  var s=window[S];
  if(!s)return;
  var attempts=parseInt(s.getItem(K)||"0",10);
  if(attempts>=3)return;
  s.setItem(K,String(attempts+1));

  function reloadWithCacheBust(){
    var url=new URL(window.location.href);
    url.searchParams.set("_cb",Date.now().toString());
    window.location.href=url.toString();
  }

  // ── Layer 1: Detect <script>/<link> load failures (0ms) ──
  window.addEventListener("error",function(e){
    var tag=(e.target&&e.target.tagName)||"";
    if(tag==="SCRIPT"||tag==="LINK"){
      s.setItem(K+"_fail","1");
    }
  },true);

  // ── Layer 2: IMMEDIATE version check (0ms) ──
  // Fetch /api/version immediately and compare with stored build ID.
  // If different → new deploy happened → reload with cache-bust instantly.
  fetch("/api/version?_cb="+Date.now(),{cache:"no-store"}).then(function(r){
    return r.json();
  }).then(function(d){
    var serverBid=d&&d.buildId;
    if(!serverBid||serverBid==="unknown")return;
    var embedded=s.getItem(B);
    if(!embedded){
      s.setItem(B,serverBid);
      return;
    }
    if(serverBid!==embedded){
      reloadWithCacheBust();
    }
  }).catch(function(){});

  // ── Layer 3: If a script/link failed, reload after 500ms ──
  setTimeout(function(){
    if(s.getItem(K+"_fail")==="1"){
      reloadWithCacheBust();
    }
  },500);

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
              name: validLocale === "zh" ? "行为分析镜" : "Behavioral Mirror",
              url: `https://www.khanpattern.com/${validLocale}`,
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web",
              description: validLocale === "zh"
                ? "融合四柱分析、图表分析、符号分析、面部特征、手部特征五大 AI 分析系统"
                : "AI-powered behavioral analysis combining Four-Pillar, Stellar Profile, Symbolic, Facial Feature, and Hand Feature",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "CNY",
              },
              author: {
                "@type": "Organization",
                name: "Profile Mirror",
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
        <AppProviders messages={messages} locale={validLocale} initialRegion={initialRegion}>
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
