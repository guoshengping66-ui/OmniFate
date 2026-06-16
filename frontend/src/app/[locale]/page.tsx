"use client"
import { useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"

// ── Lazy-loaded cinematic marketing page ─────────────────────────────────
const CinematicHero = dynamic(() => import("@/components/destiny/CinematicHero"), { ssr: true })
const FiveDimensionsOverview = dynamic(() => import("@/components/destiny/FiveDimensionsOverview"), { ssr: false })
const Timeline = dynamic(() => import("@/components/destiny/Timeline"), { ssr: false })
const ReportPreview = dynamic(() => import("@/components/destiny/ReportPreview"), { ssr: false })
const LifestyleShowcase = dynamic(() => import("@/components/destiny/LifestyleShowcase"), { ssr: false })
const CaseStudy = dynamic(() => import("@/components/destiny/CaseStudy"), { ssr: false })
const FinalCTA = dynamic(() => import("@/components/destiny/FinalCTA"), { ssr: true })

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
  const { user } = useAuth()
  const { userProfile, loading: profileLoading, fetchBirthProfiles } = useUserStore()

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => fetchBirthProfiles(), 200)
      return () => clearTimeout(timer)
    }
  }, [user])

  const hasProfile = !!user && !!userProfile
  const profileStillLoading = !!user && profileLoading && !userProfile

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

  if (hasProfile) {
    return (
      <div className="min-h-screen">
        <section className="pt-24 pb-10 px-4">
          <UserDashboard />
        </section>

        <section className="py-12 px-4 bg-white/[0.015]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("home.dailyBadge")}</span>
              <h2 className="font-serif text-2xl font-bold text-gold mt-2">{t("home.dailyTitle")}</h2>
            </div>
            <DailyDashboard />
          </div>
        </section>

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

        <FloatingFortuneSubscribe />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      <CinematicHero />
      <FiveDimensionsOverview />
      <Timeline />
      <ReportPreview />
      <LifestyleShowcase />
      <CaseStudy />
      <FinalCTA />
    </div>
  )
}
