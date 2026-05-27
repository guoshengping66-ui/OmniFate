"use client"
import { useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"

// ── Lazy-loaded marketing page ─────────────────────────────────────────────
// SSR enabled so text content renders immediately (no blank page)
// Heavy 3D components inside MarketingPage are still dynamically loaded
const MarketingPage = dynamic(() => import("@/components/MarketingPage"), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-gold/50 text-sm font-serif tracking-wider">DESTINY MIRROR</p>
      </div>
    </div>
  ),
})

// ── Lazy-loaded below-the-fold sections ──────────────────────────
const UserDashboard = dynamic(() => import("@/components/dashboard/UserDashboard").then(m => m.UserDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})
const DailyDashboard = dynamic(() => import("@/components/DailyDashboard").then(m => m.DailyDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})

const FloatingFortuneSubscribe = dynamic(() => import("@/components/ui/FloatingFortuneSubscribe").then(m => m.FloatingFortuneSubscribe), { ssr: false })

export default function HomePage() {
  const { t, localeHref } = useLanguage()
  const { user, loading: authLoading } = useAuth()
  const { userProfile, loading: profileLoading, fetchBirthProfiles } = useUserStore()

  // Fetch birth profile on mount when user is logged in
  useEffect(() => {
    if (user) fetchBirthProfiles()
  }, [user])

  const hasProfile = !!user && !!userProfile
  const profileStillLoading = !!user && profileLoading && !userProfile

  // ── Logged-in user waiting for profile → skeleton (avoid flash of MarketingPage) ──
  if (profileStillLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="card-glass p-8 space-y-4">
            <div className="h-6 bg-white/5 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
            <div className="flex gap-4 mt-6">
              <div className="h-10 bg-white/5 rounded-full w-32 animate-pulse" />
              <div className="h-10 bg-white/5 rounded-full w-32 animate-pulse" />
            </div>
          </div>
          <div className="card-glass p-8 space-y-4">
            <div className="h-5 bg-white/5 rounded w-1/4 animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Returning users with profile → Dashboard vertical flow ──
  if (hasProfile) {
    return (
      <div className="min-h-screen">
        {/* ── Hero Fold: 底座 + 意图按钮 ───────────────────── */}
        <section className="pt-24 pb-10 px-4">
          <UserDashboard />
        </section>

        {/* ── Daily Focus Fold: 今日运势 + 黄历 ─────────────── */}
        <section className="py-12 px-4 bg-white/[0.015]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("home.dailyBadge")}</span>
              <h2 className="font-serif text-2xl font-bold text-gold mt-2">{t("home.dailyTitle")}</h2>
            </div>
            <DailyDashboard />
          </div>
        </section>

        {/* ── CTA Fold: 改运商城/知识库 ────────────────────── */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="card-glass p-8 text-center">
              <div className="text-3xl mb-4">🛍️</div>
              <h3 className="font-serif text-lg text-gold mb-2">{t("home.shopCta")}</h3>
              <p className="text-white/40 text-sm mb-5">{t("home.shopDesc")}</p>
              <div className="flex justify-center gap-4">
                <Link href={localeHref("/shop")} className="btn-gold text-sm px-6 py-2">{t("home.shopButton")}</Link>
                <Link href={localeHref("/blog")} className="border border-white/20 text-white/60 hover:text-gold hover:border-gold/30 rounded-full text-sm px-6 py-2 transition-all">{t("home.knowledgeButton")}</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Floating Fortune Subscribe ──────────────────────── */}
        <FloatingFortuneSubscribe />
      </div>
    )
  }

  // ── New / logged-out visitors → Marketing (lazy-loaded) ────────
  return <MarketingPage />
}
