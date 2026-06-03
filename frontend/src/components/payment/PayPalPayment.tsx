"use client"
import { useState } from "react"
import { Loader2, CreditCard, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface PayPalPaymentProps {
  /** Product type: "unlock_report" | "premium_monthly" | "premium_yearly" | "founder_lifetime" */
  itemType: string
  /** Reading ID (for report unlock) */
  readingId?: string
  /** Display amount */
  amount?: string
  /** Called on successful payment */
  onSuccess: () => void
  /** Called on payment error */
  onError?: (error: string) => void
  /** Compact mode (smaller UI for modals) */
  compact?: boolean
}

/**
 * Server-side PayPal checkout flow.
 *
 * WHY: The PayPal JS SDK makes browser-side API calls to api-m.paypal.com.
 * In mainland China, GFW blocks paypal.com — the SDK cannot function.
 * Instead, the backend creates the order and returns PayPal's approve URL.
 * The user opens PayPal's hosted checkout page in a new tab.
 * After payment, PayPal redirects back to our callback endpoint which
 * captures the order and activates the subscription.
 */
export function PayPalPayment({
  itemType,
  readingId,
  amount,
  onSuccess,
  onError,
  compact = false,
}: PayPalPaymentProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handlePayPalCheckout = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ item_type: itemType })
      if (readingId) params.set("reading_id", readingId)
      const res = await fetch(`/api/proxy/api/payments/paypal/checkout-url?${params}`, {
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.checkout_url) {
        // Open PayPal checkout in new tab
        window.open(data.checkout_url, "_blank")
        // Show message that payment is in progress
        setSuccess(true)
        onSuccess()
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      onError?.(msg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle size={20} />
          <span>{t("payment.success") || "Payment window opened!"}</span>
        </div>
        <p className="text-white/40 text-xs text-center">
          {t("payment.paypalCompleteInNewTab") || "Complete payment in the new tab. Your subscription will activate automatically."}
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${compact ? "" : "py-2"}`}>
      {/* PayPal checkout button */}
      <button
        onClick={handlePayPalCheckout}
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 bg-[#0070ba]/15 text-[#0070ba] border border-[#0070ba]/30 hover:bg-[#0070ba]/25 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
            </svg>
            {loading ? (t("payment.connecting") || "Connecting...") : "PayPal"}
            <ExternalLink size={12} className="opacity-50" />
          </>
        )}
      </button>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 text-red-400/80 text-xs">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {/* Amount display */}
      {amount && (
        <div className="text-center text-white/30 text-xs">
          {t("payment.totalAmount") || "Total"}: <span className="text-white/60 font-medium">{amount}</span>
        </div>
      )}
    </div>
  )
}
