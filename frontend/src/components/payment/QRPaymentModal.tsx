"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CreditCard, Loader2, X } from "lucide-react"
import { createShopStripeCheckout, createStripeCheckout, getPaymentCatalog, type PaymentCatalog } from "@/lib/api"
import { stashPendingPurchase } from "@/lib/gtag"
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
  const [catalog, setCatalog] = useState<PaymentCatalog | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const isShopPayment = !!shopOrderNo
  const isReportUnlock = !!readingId && tier !== "onetime_unlock"
  const isFounderPayment = postAction === "founder" || !!preOrderNo
  const itemType = isFounderPayment ? "founder_lifetime" : isReportUnlock ? "unlock_report" : (tier || "premium_monthly")

  useEffect(() => {
    if (!open || isShopPayment) return
    let cancelled = false
    setCatalogLoading(true)
    setCatalog(null)
    getPaymentCatalog()
      .then((response) => { if (!cancelled) setCatalog(response) })
      .catch(() => { if (!cancelled) setError(t("payment.priceUnavailable")) })
      .finally(() => { if (!cancelled) setCatalogLoading(false) })
    return () => { cancelled = true }
  }, [open, isShopPayment, t])

  const serverQuote = catalog?.items[itemType]
  const customAmount = isShopPayment ? shopAmount : preAmount
  const displayAmount = serverQuote ? serverQuote.amount : customAmount
  const currencySymbol = serverQuote ? catalog?.symbol : (region === "overseas" ? "$" : "¥")
  const tierLabel = isFounderPayment
    ? (preLabel || serverQuote?.label || "")
    : serverQuote?.label || ""
  const priceReady = isShopPayment || Boolean(serverQuote)

  const handleStripeCheckout = async () => {
    if (!priceReady) return
    setLoading(true)
    setError("")
    try {
      if (isShopPayment && shopOrderNo) {
        const res = await createShopStripeCheckout(shopOrderNo, region)
        stashPendingPurchase({
          transaction_id: shopOrderNo,
          value: typeof displayAmount === "number" ? displayAmount : undefined,
          currency: region === "overseas" ? "USD" : "CNY",
          item_name: "shop_order",
        })
        window.location.href = res.checkout_url
        return
      }
      const res = await createStripeCheckout(itemType, readingId, region)
      stashPendingPurchase({
        transaction_id: res.order_no,
        value: serverQuote?.amount,
        currency: serverQuote?.currency ?? catalog?.currency,
        item_name: itemType,
      })
      window.location.href = res.checkout_url
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail || t("payment.createOrderFailed") || "Unable to start Stripe Checkout")
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 anim-fade-in">
      <div className="card-glass p-6 max-w-md w-full relative anim-scale-in">
        <button onClick={onClose} aria-label={t("common.close")} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
          <X size={20} />
        </button>

        <h3 className="text-xl font-serif font-bold text-gold mb-2">Stripe Checkout</h3>
        <p className="text-white/40 text-sm mb-6">{tierLabel}</p>

        <div className="bg-white/5 rounded-xl p-4 text-center mb-6">
          <p className="text-white/40 text-xs mb-1">{t("payment.amount")}</p>
          <p className="text-3xl font-bold text-gold">{catalogLoading ? "…" : displayAmount == null ? "—" : `${currencySymbol || ""}${displayAmount}`}</p>
          {!isShopPayment && <p className="mt-2 text-xs text-white/35">{t("payment.serverPriceNotice")}</p>}
        </div>

        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 mb-6">
          <div className="flex items-center gap-2 text-gold font-medium">
            <CreditCard size={18} />
            <span>{t("payment.card")}</span>
          </div>
          <p className="text-white/40 text-xs mt-1">{t("payment.stripeSecurity")}</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button onClick={handleStripeCheckout} disabled={loading || catalogLoading || !priceReady} className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40">
          {loading ? <><Loader2 size={18} className="animate-spin" /> {t("payment.redirecting")}</> : t("payment.continueToStripe")}
        </button>
      </div>
    </div>
  )
}
