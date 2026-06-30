"use client"

import { useState } from "react"
import { AlertCircle, CreditCard, Loader2, X } from "lucide-react"
import { createShopStripeCheckout, createStripeCheckout } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

interface QRPaymentModalProps {
  open: boolean
  onClose: () => void
  tier?: "premium_monthly" | "premium_yearly" | "onetime_unlock"
  readingId?: string
  orderNo?: string
  amount?: number
  label?: string
  postAction?: "subscription" | "unlock" | "founder" | "onetime_unlock"
  onSuccess?: () => void
  region?: "domestic" | "overseas"
  shopOrderNo?: string
  shopAmount?: number
  initialMethod?: string
}

const TIER_PRICES: Record<string, { amountCny: number; amountUsd: number; labelKey: string }> = {
  premium_monthly: { amountCny: 59, amountUsd: 14.99, labelKey: "payment.monthlyPlan" },
  premium_yearly: { amountCny: 365, amountUsd: 99, labelKey: "payment.yearlyPlan" },
  onetime_unlock: { amountCny: 19.9, amountUsd: 9.9, labelKey: "payment.onetimeUnlock" },
}

const UNLOCK_PRICES = { amountCny: 19.9, amountUsd: 9.9 }

export function QRPaymentModal({
  open,
  onClose,
  tier,
  readingId,
  orderNo: preOrderNo,
  amount: preAmount,
  label: preLabel,
  postAction,
  region = "domestic",
  shopOrderNo,
  shopAmount,
}: QRPaymentModalProps) {
  const { t: rawT } = useLanguage()
  const t = rawT as unknown as (key: string, vars?: Record<string, string | number>) => string
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isOverseas = region === "overseas"
  const isShopPayment = !!shopOrderNo
  const isReportUnlock = !!readingId && tier !== "onetime_unlock"
  const isFounderPayment = postAction === "founder" || !!preOrderNo
  const tierInfo = isShopPayment
    ? { amountCny: shopAmount || 0, amountUsd: shopAmount || 0, labelKey: "" }
    : preAmount
      ? { amountCny: preAmount, amountUsd: preAmount, labelKey: "" }
      : isReportUnlock
        ? { amountCny: UNLOCK_PRICES.amountCny, amountUsd: UNLOCK_PRICES.amountUsd, labelKey: "payment.unlockReport" }
        : (TIER_PRICES[tier || "premium_monthly"] || TIER_PRICES.premium_monthly)
  const displayAmount = Math.round((isOverseas ? tierInfo.amountUsd : tierInfo.amountCny) * 100) / 100
  const currencySymbol = isOverseas ? "$" : "¥"
  const tierLabel = isFounderPayment
    ? (preLabel || "Founder Seat")
    : tierInfo.labelKey
      ? t(tierInfo.labelKey)
      : ""

  const handleStripeCheckout = async () => {
    setLoading(true)
    setError("")
    try {
      if (isShopPayment && shopOrderNo) {
        const res = await createShopStripeCheckout(shopOrderNo, region)
        window.location.href = res.checkout_url
        return
      }
      const itemType = isFounderPayment ? "founder_lifetime" : isReportUnlock ? "unlock_report" : (tier || "premium_monthly")
      const res = await createStripeCheckout(itemType, readingId, region)
      window.location.href = res.checkout_url
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("payment.createOrderFailed") || "Unable to start Stripe Checkout")
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 anim-fade-in">
      <div className="card-glass p-6 max-w-md w-full relative anim-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
          <X size={20} />
        </button>

        <h3 className="text-xl font-serif font-bold text-gold mb-2">Stripe Checkout</h3>
        <p className="text-white/40 text-sm mb-6">{tierLabel}</p>

        <div className="bg-white/5 rounded-xl p-4 text-center mb-6">
          <p className="text-white/40 text-xs mb-1">{t("payment.amount")}</p>
          <p className="text-3xl font-bold text-gold">{currencySymbol}{displayAmount}</p>
        </div>

        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 mb-6">
          <div className="flex items-center gap-2 text-gold font-medium">
            <CreditCard size={18} />
            <span>Credit or debit card</span>
          </div>
          <p className="text-white/40 text-xs mt-1">Secure checkout powered by Stripe.</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button onClick={handleStripeCheckout} disabled={loading} className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Redirecting...</> : <>Continue to Stripe</>}
        </button>
      </div>
    </div>
  )
}
