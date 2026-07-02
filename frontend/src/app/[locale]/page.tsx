"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

const GrowthCommandHero = dynamic(() => import("@/components/marketing-growth/GrowthCommandHero").then(m => m.GrowthCommandHero), { ssr: true })
const ProductPathMap = dynamic(() => import("@/components/marketing-growth/ProductPathMap").then(m => m.ProductPathMap), { ssr: false })
const FiveDimensionCommandCenter = dynamic(() => import("@/components/marketing-growth/FiveDimensionCommandCenter").then(m => m.FiveDimensionCommandCenter), { ssr: false })
const SignalToActionWorkflow = dynamic(() => import("@/components/marketing-growth/SignalToActionWorkflow").then(m => m.SignalToActionWorkflow), { ssr: false })
const SampleGrowthReport = dynamic(() => import("@/components/marketing-growth/SampleGrowthReport").then(m => m.SampleGrowthReport), { ssr: false })
const GrowthServicePaths = dynamic(() => import("@/components/marketing-growth/GrowthServicePaths").then(m => m.GrowthServicePaths), { ssr: false })
const MethodTrustSection = dynamic(() => import("@/components/marketing-growth/MethodTrustSection").then(m => m.MethodTrustSection), { ssr: false })
const FinalGrowthCTA = dynamic(() => import("@/components/marketing-growth/FinalGrowthCTA").then(m => m.FinalGrowthCTA), { ssr: false })
const UserDashboard = dynamic(() => import("@/components/dashboard/UserDashboard").then(m => m.UserDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})

export default function HomePage() {
  const { user } = useAuth()
  const { userProfile, loading: profileLoading, fetchBirthProfiles } = useUserStore()

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => fetchBirthProfiles(), 200)
      return () => clearTimeout(timer)
    }
  }, [user, fetchBirthProfiles])

  const hasProfile = !!user && !!userProfile
  const profileStillLoading = !!user && profileLoading && !userProfile

  if (profileStillLoading) {
    return (
      <div className="relative z-10 min-h-screen px-4 pb-16 pt-24">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="card-glass space-y-4 p-8">
            <div className="h-6 w-1/3 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
            <div className="mt-6 flex gap-4">
              <div className="h-10 w-32 animate-pulse rounded-full bg-white/5" />
              <div className="h-10 w-32 animate-pulse rounded-full bg-white/5" />
            </div>
          </div>
          <div className="card-glass space-y-4 p-8">
            <div className="h-5 w-1/4 animate-pulse rounded bg-white/5" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded bg-white/5" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (hasProfile) {
    return (
      <div className="relative z-10 min-h-screen">
        <section className="px-4 pb-10 pt-24">
          <UserDashboard />
        </section>
      </div>
    )
  }

  return (
    <div className="relative z-10 min-h-screen bg-[#080808]">
      <GrowthCommandHero variant="home" />
      <ErrorBoundary sectionName="Product Path Map">
        <ProductPathMap />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Five Dimension Command Center">
        <FiveDimensionCommandCenter />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Signal To Action Workflow">
        <SignalToActionWorkflow />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Sample Growth Report">
        <SampleGrowthReport />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Growth Service Paths">
        <GrowthServicePaths />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Method Trust">
        <MethodTrustSection />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Final Growth CTA">
        <FinalGrowthCTA />
      </ErrorBoundary>
    </div>
  )
}
