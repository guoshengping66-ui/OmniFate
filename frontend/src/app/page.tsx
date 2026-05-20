"use client"
import { useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"

// ── Lazy-loaded heavy animated components (ssr: false) ───────────
const LiveBar = dynamic(() => import("@/components/ui/LiveBar").then(m => m.LiveBar), { ssr: false })

// ── Lazy-loaded marketing page (framer-motion, ScrollReveal, TiltCard, etc.) ──
const MarketingPage = dynamic(() => import("@/components/MarketingPage"), { ssr: false })

// ── Lazy-loaded below-the-fold sections ──────────────────────────
const UserDashboard = dynamic(() => import("@/components/dashboard/UserDashboard").then(m => m.UserDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})
const DailyDashboard = dynamic(() => import("@/components/DailyDashboard").then(m => m.DailyDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})

export default function HomePage() {
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuth()
  const { userProfile, loading: profileLoading, fetchBirthProfiles } = useUserStore()

  // Fetch birth profile on mount when user is logged in
  useEffect(() => {
    if (user) fetchBirthProfiles()
  }, [user])

  // ── Auth gate: prevent flash of wrong layout ────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  const hasProfile = !!user && !!userProfile
  const profileStillLoading = !!user && profileLoading && !userProfile

  // ── Returning users with profile → Dashboard vertical flow ──
  if (hasProfile) {
    return (
      <div className="min-h-screen">
        <LiveBar />

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
                <Link href="/shop" className="btn-gold text-sm px-6 py-2">{t("home.shopButton")}</Link>
                <Link href="/blog" className="border border-white/20 text-white/60 hover:text-gold hover:border-gold/30 rounded-full text-sm px-6 py-2 transition-all">{t("home.knowledgeButton")}</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ── Loading profile (logged in, no data yet) ────────────────
  if (profileStillLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  // ── New / logged-out visitors → Marketing (lazy-loaded) ────────
  return <MarketingPage />
}
