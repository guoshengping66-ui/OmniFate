"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

const EasternHomeExperience = dynamic(() => import("@/components/marketing-growth/EasternHomeExperience").then(m => m.EasternHomeExperience), { ssr: true })
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
      <div className="relative z-10 min-h-screen px-4 pb-16 pt-24">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="card-solid space-y-4 p-8">
            <div className="h-6 w-1/3 animate-pulse rounded bg-white/[0.04]" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.04]" />
            <div className="mt-6 flex gap-4">
              <div className="h-10 w-32 animate-pulse rounded-full bg-white/[0.04]" />
              <div className="h-10 w-32 animate-pulse rounded-full bg-white/[0.04]" />
            </div>
          </div>
          <div className="card-solid space-y-4 p-8">
            <div className="h-5 w-1/4 animate-pulse rounded bg-white/[0.04]" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded bg-white/[0.04]" />)}
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
    <div className="relative z-10 min-h-screen">
      <ErrorBoundary sectionName="Guanwo Home Experience">
        <EasternHomeExperience />
      </ErrorBoundary>
    </div>
  )
}
