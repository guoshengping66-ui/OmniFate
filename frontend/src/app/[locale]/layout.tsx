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
import { ChunkRecovery } from "@/components/ui/ChunkRecovery"
import { DeferredComponents } from "@/components/ui/DeferredComponents"

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
    title: isZh ? "命运引擎 · 读懂你自己" : "Destiny Engine — Not Fortune-Telling, Self-Understanding",
    description: isZh
      ? "融合八字、星盘、塔罗、面相、手相五大古老系统，AI 交叉验证，为你生成专属人生蓝图。不是算命，是一面照见你人生的镜子。"
      : "Five ancient systems — Bazi, Astrology, Tarot, Face Reading, Palm Reading — cross-validated by AI. Not fortune-telling. A mirror for your life.",
    keywords: isZh
      ? "八字,星盘,塔罗,面相,手相,AI分析,命运,自我认知,性格分析"
      : "bazi,astrology,tarot,face reading,palm reading,AI,destiny,self-understanding,personality",
    authors: [{ name: "Destiny Engine" }],
    openGraph: {
      title: isZh ? "命运引擎 — 不是算命，是读懂你自己" : "Destiny Engine — Not Fortune-Telling, Self-Understanding",
      description: isZh
        ? "融合五大古老系统，AI 交叉验证，生成专属人生蓝图。"
        : "Five ancient systems, one AI engine. Your personal blueprint.",
      url: `${baseUrl}/${locale}`,
      siteName: "Destiny Engine",
      images: [
        {
          url: `${baseUrl}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: isZh ? "命运引擎" : "Destiny Engine",
        },
      ],
      locale: isZh ? "zh_CN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? "命运引擎 — 读懂你自己" : "Destiny Engine",
      description: isZh
        ? "五大古老系统 × AI 交叉验证 = 你的人生蓝图"
        : "Five ancient systems × AI cross-validation = your life blueprint",
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
              name: validLocale === "zh" ? "命运引擎" : "Destiny Engine",
              url: `https://www.khanfate.com/${validLocale}`,
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web",
              description: validLocale === "zh"
                ? "融合八字、星盘、塔罗、面相、手相五大古老系统，AI 交叉验证，生成专属人生蓝图"
                : "Five ancient systems — Bazi, Astrology, Tarot, Face Reading, Palm Reading — cross-validated by AI to generate your personal blueprint",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "CNY",
              },
              author: {
                "@type": "Organization",
                name: "Destiny Engine",
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
          <DeferredComponents />
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
