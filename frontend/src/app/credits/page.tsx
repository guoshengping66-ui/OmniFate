"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { BillingDashboard } from "@/components/BillingDashboard"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

export default function CreditsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ label: "星尘充值" }]} />
        <BillingDashboard />
      </div>
    </div>
  )
}
