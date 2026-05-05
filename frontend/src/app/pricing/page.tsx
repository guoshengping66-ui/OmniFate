"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { TierComparison } from "@/components/monetization/TierComparison"
import { useAuth } from "@/contexts/AuthContext"
import { subscribe } from "@/lib/api"
import toast from "react-hot-toast"

export default function PricingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [subLoading, setSubLoading] = useState<string | null>(null)

  const handleSelect = async (tierId: string) => {
    switch (tierId) {
      case "free":
        router.push("/reading/new")
        break
      case "full_report":
        router.push("/reading/new")
        break
      case "premium_monthly":
      case "premium_yearly":
        if (!user) {
          toast.error("请先登录后再订阅")
          router.push("/login")
          return
        }
        setSubLoading(tierId)
        try {
          const tier = tierId === "premium_monthly" ? "premium_monthly" : "premium_yearly"
          const result = await subscribe(tier)
          toast.success(result.message)
          await refreshUser()
        } catch (err: any) {
          toast.error(err?.response?.data?.detail ?? "订阅失败")
        } finally {
          setSubLoading(null)
        }
        break
      case "event_retro":
        router.push("/events")
        break
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <TierComparison onSelect={handleSelect} />
      </div>
    </div>
  )
}
