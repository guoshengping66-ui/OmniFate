"use client"
import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"

// ── Global starfield background ──────────────────────────────────────
const StarfieldBackground = dynamic(() => import("@/components/destiny/StarfieldBackground"), { ssr: false })

// ── Lazy-loaded cinematic marketing page ─────────────────────────────
const CinematicHero = dynamic(() => import("@/components/destiny/CinematicHero"), { ssr: true })
const EnergyBridge = dynamic(() => import("@/components/destiny/EnergyBridge"), { ssr: false })
const AIDestinyDeconstruction = dynamic(() => import("@/components/destiny/AIDestinyDeconstruction"), { ssr: false })
const LifeRouteGeneration = dynamic(() => import("@/components/destiny/LifeRouteGeneration"), { ssr: false })
const KeyLifeNodes = dynamic(() => import("@/components/destiny/KeyLifeNodes"), { ssr: false })
const FutureStillWriting = dynamic(() => import("@/components/destiny/FutureStillWriting"), { ssr: false })
const DestinyCollectionGallery = dynamic(() => import("@/components/destiny/DestinyCollectionGallery"), { ssr: false })
const ServicesShowcase = dynamic(() => import("@/components/destiny/ServicesShowcase"), { ssr: false })
const LifestyleShowcase = dynamic(() => import("@/components/destiny/LifestyleShowcase"), { ssr: false })

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
      <>
        <StarfieldBackground />
        <div className="relative z-10 min-h-screen pt-24 pb-16 px-4">
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
      </>
    )
  }

  if (hasProfile) {
    return (
      <>
        <StarfieldBackground />
        <div className="relative z-10 min-h-screen">
          <section className="pt-24 pb-10 px-4">
            <UserDashboard />
          </section>

          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("home.dailyBadge")}</span>
                <h2 className="font-serif text-2xl font-bold text-gold mt-2">{t("home.dailyTitle")}</h2>
              </div>
              <DailyDashboard />
            </div>
          </section>

          <ServicesShowcase />

          <LifestyleShowcase />

          <FloatingFortuneSubscribe />
        </div>
      </>
    )
  }

  return (
    <>
      <StarfieldBackground />
      <div className="relative z-10 min-h-screen">
        {/* SECTION 01: 命运引擎 Hero */}
        <CinematicHero />
        {/* SECTION 02: 能量桥梁 */}
        <EnergyBridge />
        {/* SECTION 03: AI 解构命盘 */}
        <AIDestinyDeconstruction />
        {/* SECTION 04: 银河航线生成 */}
        <LifeRouteGeneration />
        {/* SECTION 05: 关键人生节点 */}
        <KeyLifeNodes />
        {/* SECTION 06: 未来仍在书写 */}
        <FutureStillWriting />
        {/* SECTION 07: 命运藏品阁 */}
        <DestinyCollectionGallery />
        {/* SECTION 08: 服务展示 */}
        <ServicesShowcase />
        {/* SECTION 09: 生活方式 */}
        <LifestyleShowcase />
      </div>
    </>
  )
}
