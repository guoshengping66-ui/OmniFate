"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { TierComparison } from "@/components/monetization/TierComparison"
import { PaymentMethodSelector } from "@/components/monetization/PaymentMethodSelector"
import { useAuth } from "@/contexts/AuthContext"
import { subscribe, createCheckoutUrl } from "@/lib/api"
import toast from "react-hot-toast"

export default function PricingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [subLoading, setSubLoading] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>("")
  const [showPaymentSelect, setShowPaymentSelect] = useState(false)

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
        // Show payment method selector
        setSelectedTier(tierId)
        setShowPaymentSelect(true)
        break
      case "event_retro":
        router.push("/events")
        break
    }
  }

  const handlePay = async () => {
    if (!selectedTier || !selectedPayment) {
      toast.error("请选择支付方式")
      return
    }

    setSubLoading(selectedTier)
    try {
      // Try real payment flow first (Alipay/WeChat/PayPal)
      const itemType = selectedTier // "premium_monthly" or "premium_yearly"
      const result = await createCheckoutUrl("", selectedPayment, itemType)

      if (result.pay_url) {
        // Alipay — redirect to payment page
        window.location.href = result.pay_url
      } else if (result.code_url) {
        // WeChat — show QR code (for now, show the URL)
        toast.success("请使用微信扫码支付")
        window.open(result.code_url, "_blank")
      } else if (result.approve_url) {
        // PayPal — redirect to PayPal
        window.location.href = result.approve_url
      } else {
        // Fallback to mock subscribe
        const tier = selectedTier === "premium_monthly" ? "premium_monthly" : "premium_yearly"
        const subResult = await subscribe(tier)
        toast.success(subResult.message)
        await refreshUser()
        setShowPaymentSelect(false)
      }
    } catch (err: any) {
      // If real payment fails (e.g., not enabled), fallback to mock
      try {
        const tier = selectedTier === "premium_monthly" ? "premium_monthly" : "premium_yearly"
        const subResult = await subscribe(tier)
        toast.success(subResult.message)
        await refreshUser()
        setShowPaymentSelect(false)
      } catch (subErr: any) {
        toast.error(subErr?.response?.data?.detail ?? "订阅失败")
      }
    } finally {
      setSubLoading(null)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <TierComparison onSelect={handleSelect} />

        {/* Payment method selection modal */}
        {showPaymentSelect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="card-glass p-6 max-w-md w-full">
              <h3 className="text-xl font-serif font-bold text-gold mb-2">
                选择支付方式
              </h3>
              <p className="text-white/50 text-sm mb-6">
                {selectedTier === "premium_monthly" ? "月度会员 ¥49/月" : "年度会员 ¥298/年"}
              </p>

              <PaymentMethodSelector
                selected={selectedPayment}
                onSelect={setSelectedPayment}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPaymentSelect(false)
                    setSelectedPayment("")
                  }}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 hover:border-white/40 transition-all text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handlePay}
                  disabled={!selectedPayment || !!subLoading}
                  className="flex-1 btn-gold py-3 disabled:opacity-50"
                >
                  {subLoading ? "处理中..." : "确认支付"}
                </button>
              </div>
            </div>
          </div>
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
