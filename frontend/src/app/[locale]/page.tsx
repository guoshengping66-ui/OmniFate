"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

const EasternHomeExperience = dynamic(() => import("@/components/marketing-growth/EasternHomeExperience").then(m => m.EasternHomeExperience), { ssr: true })
const GalaxyHomeNew = dynamic(() => import("@/components/marketing-growth/GalaxyHomeNew"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, margin: "0 auto 12px", border: "2px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, fontFamily: "serif" }}>观我</p>
      </div>
    </div>
  ),
})
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
    <ErrorBoundary sectionName="Guanwo Home Experience">
      <GalaxyHomeNew />
    </ErrorBoundary>
  )
}
