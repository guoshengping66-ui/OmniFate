"use client"

import dynamic from "next/dynamic"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { useAuth } from "@/contexts/AuthContext"

const EasternHomeExperience = dynamic(() => import("@/components/marketing-growth/EasternHomeExperience").then(m => m.EasternHomeExperience), { ssr: true })
const UserDashboard = dynamic(() => import("@/components/dashboard/UserDashboard").then(m => m.UserDashboard), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen px-4 pt-32">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/[0.06] bg-[#060E24] p-8">
        <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    </div>
  ),
})

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen px-4 pt-32">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-white/[0.06] bg-[#060E24] p-8">
          <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <ErrorBoundary sectionName="Guanwo User Home">
        <section className="min-h-screen px-4 pb-16 pt-28">
          <UserDashboard />
        </section>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary sectionName="Guanwo Home Experience">
      <EasternHomeExperience />
    </ErrorBoundary>
  )
}
