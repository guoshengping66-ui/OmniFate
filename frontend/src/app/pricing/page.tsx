"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { TierComparison } from "@/components/monetization/TierComparison"
import { useAuth } from "@/contexts/AuthContext"
import { subscribe } from "@/lib/api"
import { QRPaymentModal } from "@/components/payment/QRPaymentModal"
import toast from "react-hot-toast"

export default function PricingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [selectedTier, setSelectedTier] = useState<"premium_monthly" | "premium_yearly" | null>(null)

  const handleSelect = async (tierId: string) => {
    switch (tierId) {
      case "free":
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
        setSelectedTier(tierId as "premium_monthly" | "premium_yearly")
        break
      case "event_retro":
        router.push("/events")
        break
    }
  }

  // 个人收款码支付成功回调 → mock subscribe 激活会员
  const handlePaymentSuccess = async () => {
    try {
      // 支付完成后用mock接口激活会员状态（等你手动确认收款后生效）
      const tier = selectedTier!
      const subResult = await subscribe(tier)
      toast.success(subResult.message)
      await refreshUser()
    } catch {
      toast.success("支付已提交，会员将在确认后激活")
    }
    setSelectedTier(null)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <TierComparison onSelect={handleSelect} />

        {/* 个人收款码支付弹窗 */}
        {selectedTier && (
          <QRPaymentModal
            open={!!selectedTier}
            onClose={() => setSelectedTier(null)}
            tier={selectedTier}
            onSuccess={handlePaymentSuccess}
          />
        )}

        <p className="text-center text-white/25 text-[11px] mt-8">
          订阅即表示您同意我们的{" "}
          <a href="/terms" className="text-gold/50 hover:text-gold underline">服务条款</a>
          {" "}和{" "}
          <a href="/refund" className="text-gold/50 hover:text-gold underline">退款政策</a>
          。订阅可随时取消，详见退款政策。
        </p>
      </div>
    </div>
  )
}
