"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

const GalaxyHomeExperience = dynamic(() => import("@/components/marketing-growth/GalaxyHomeExperience").then(m => m.GalaxyHomeExperience), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-parchment-300/40 text-sm font-display">观我</p>
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
        <GalaxyHomeExperience />
      </ErrorBoundary>
    </div>
  )
}
