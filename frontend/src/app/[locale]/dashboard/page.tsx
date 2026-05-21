"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserDashboard } from "@/components/dashboard/UserDashboard"
import { LiveBar } from "@/components/ui/LiveBar"
import { DailyFortune } from "@/components/reading/DailyFortune"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"

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
      <LiveBar />
      <section className="pt-28 pb-16 px-4">
        <UserDashboard />
      </section>

      {/* Daily fortune section */}
      <section className="py-16 px-4 bg-white/[0.015] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("fortune.badge")}</span>
              <h2 className="section-title mt-3">{t("fortune.sectionTitle")}</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <DailyFortune />
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
