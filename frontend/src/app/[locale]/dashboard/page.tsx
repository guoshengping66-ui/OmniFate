"use client"

import { useEffect, Suspense, lazy } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRouter } from "next/navigation"

const UserDashboard = lazy(() => import("@/components/dashboard/UserDashboard").then(m => ({ default: m.UserDashboard })))

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { localeHref } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace(localeHref("/login"))
  }, [user, loading, router, localeHref])

  if (loading || !user) {
    return (
      <div className="min-h-screen px-4 pt-32">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-white/[0.06] bg-[#060E24] p-8">
          <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen px-4 pb-16 pt-28">
      <Suspense fallback={<div className="mx-auto max-w-4xl rounded-[28px] border border-white/[0.06] bg-[#060E24] p-8"><div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" /></div>}>
        <UserDashboard />
      </Suspense>
    </section>
  )
}
