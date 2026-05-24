"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, Suspense, lazy } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const UserDashboard = lazy(() => import("@/components/dashboard/UserDashboard").then(m => ({ default: m.UserDashboard })))
const LiveBar = lazy(() => import("@/components/ui/LiveBar").then(m => ({ default: m.LiveBar })))
const DailyFortune = lazy(() => import("@/components/reading/DailyFortune").then(m => ({ default: m.DailyFortune })))
const ScrollReveal = lazy(() => import("@/components/ui/ScrollReveal").then(m => ({ default: m.ScrollReveal })))

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <LiveBar />
      </Suspense>
      <section className="pt-28 pb-16 px-4">
        <Suspense fallback={<div className="max-w-4xl mx-auto space-y-4"><div className="h-8 bg-white/5 rounded w-1/3 animate-pulse" /><div className="card-glass p-6 h-48 bg-white/[0.03] animate-pulse rounded-2xl" /></div>}>
          <UserDashboard />
        </Suspense>
      </section>

      {/* Daily fortune section */}
      <section className="py-16 px-4 bg-white/[0.015] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <Suspense fallback={null}>
            <ScrollReveal>
              <div className="text-center mb-10">
                <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("fortune.badge")}</span>
                <h2 className="section-title mt-3">{t("fortune.sectionTitle")}</h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <DailyFortune />
            </ScrollReveal>
          </Suspense>
        </div>
      </section>
    </div>
  )
}
