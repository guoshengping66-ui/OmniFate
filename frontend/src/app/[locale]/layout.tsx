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
import { safeJsonLd } from "@/utils/safeJsonLd"

/** Inline safeJsonLd to avoid client-reference bundling issue in Server Components */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
  const baseUrl = "https://www.khanfate.com"

  return {
    title: "Guanwo Fate OS | AI Destiny Action System",
    description: "Guanwo combines Bazi, Ziwei, astrology, tarot, face and palm signals, and real questions into a reviewable destiny profile, daily action board, relationship sync, and lifestyle prescription.",
    keywords: "bazi,ziwei,astrology,tarot,face reading,palm reading,AI destiny,action system,relationship sync,lifestyle prescription",
    authors: [{ name: "Guanwo Fate OS" }],
    openGraph: {
      title: "Guanwo Fate OS | AI Destiny Action System",
      description: "Turn destiny analysis into action: profile, daily action board, relationship sync, and Treasure Hall prescriptions.",
      url: `${baseUrl}/${locale}`,
      siteName: "Guanwo Fate OS",
      images: [{ url: `${baseUrl}/og-image.svg`, width: 1200, height: 630, alt: "Guanwo Fate OS" }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Guanwo Fate OS",
      description: "AI destiny profile × daily action board × relationship sync × Treasure prescriptions",
      images: [`${baseUrl}/og-image.svg`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: { en: "/en", "x-default": "/en" },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
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

  // Unified global pricing — all regions use overseas (USD)
  const initialRegion: "domestic" | "overseas" = "overseas"

  return (
    <html lang="en" translate="no">
      <head>
        <link rel="preconnect" href="https://fonts.font.im" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.khanfate.com" />
        <link rel="preconnect" href="https://checkout.stripe.com" crossOrigin="anonymous" />
        {/* Async font loading: non-blocking via media swap trick */}
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

  // ── AUTH GUARD: Skip version check if user is logged in ──
  // When auth tokens exist, the React AuthProvider handles validation.
  // The inline version check runs BEFORE React mounts — if it triggers a
  // reload, AuthProvider never gets to restore the cached user from
  // sessionStorage, causing a flash of the logged-out state.
  // Auth tokens are now httpOnly cookies — check cached user instead
  var hasAuth=!!s.getItem("alpha_mirror_user");

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
  // Skip if user is logged in — React's AuthProvider + useVersionCheck
  // will handle version sync after mounting (avoids pre-React reload
  // that causes auth state flash).
  if(!hasAuth){
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
  }

  // ── Layer 3: If a script/link failed, reload after 500ms ──
  // Also skip if logged in — same reason as above
  if(!hasAuth){
    setTimeout(function(){
      if(s.getItem(K+"_fail")==="1"){
        reloadWithCacheBust();
      }
    },500);
  }

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
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: validLocale === "zh" ? "观我 Fate OS" : "Guanwo Fate OS",
              url: `https://www.khanfate.com/${validLocale}`,
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web",
              description: validLocale === "zh"
                ? "融合八字、紫微、星盘、塔罗、面相手相与真实问题，生成可复盘的命运画像、今日行动、关系合参和生活方式处方。"
                : "Bazi, Ziwei, astrology, tarot, face and palm signals, and real questions become a reviewable destiny profile, daily action board, relationship sync, and lifestyle prescription.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "CNY",
              },
              author: {
                "@type": "Organization",
                name: "Guanwo Fate OS",
                url: "https://www.khanfate.com",
                logo: "https://www.khanfate.com/logo.png",
                sameAs: [
                  "https://github.com/guoshengping66-ui/OmniFate",
                ],
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
