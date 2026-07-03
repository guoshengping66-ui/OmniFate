"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

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
  loading: () => <div className="card-solid p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
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
      <div className="relative z-10 min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
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
    <div className="relative z-10 min-h-screen bg-black">
      <ErrorBoundary sectionName="Guanwo Home Experience">
        <GalaxyHomeNew />
      </ErrorBoundary>
    </div>
  )
}
