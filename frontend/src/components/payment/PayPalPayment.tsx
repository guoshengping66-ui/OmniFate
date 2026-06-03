"use client"
import { useState, useEffect } from "react"
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalCardFieldsProvider,
  PayPalCardFieldsForm,
  type CreateOrderActions,
  type OnApproveActions,
} from "@paypal/react-paypal-js"
import { Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { getPayPalConfig, capturePayPalOrder } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

interface PayPalPaymentProps {
  itemType: string
  readingId?: string
  amount?: string
  onSuccess: (orderId?: string) => void
  onError?: (error: string) => void
  compact?: boolean
}

export function PayPalPayment({
  itemType,
  readingId,
  amount,
  onSuccess,
  onError,
  compact = false,
}: PayPalPaymentProps) {
  const { t } = useLanguage()
  const [config, setConfig] = useState<{ clientId: string; mode: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getPayPalConfig()
      .then(c => setConfig({ clientId: c.client_id, mode: c.mode }))
      .catch(() => setError("PayPal is not available"))
      .finally(() => setLoading(false))
  }, [])

  const createOrder = async (_data: Record<string, unknown>, actions: CreateOrderActions) => {
    try {
      const { apiDirect } = await import("@/lib/api")
      const params: Record<string, string> = { item_type: itemType }
      if (readingId) params.reading_id = readingId
      const res = await apiDirect.post("/api/payments/paypal/create", null, { params })
      return res.data.paypal_order_id
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(msg)
    }
  }

  const handlePayPalApprove = async (data: Record<string, unknown>, actions?: OnApproveActions) => {
    setProcessing(true)
    try {
      const orderId = data.orderID as string
      await capturePayPalOrder(orderId)
      setSuccess(true)
      onSuccess(orderId)
    } catch (err: any) {
      // Extract actual backend error message from axios response
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || String(err)
      console.error("[PayPal] capture error:", err?.response?.status, err?.response?.data || err?.message)
      setError(msg)
      onError?.(msg)
    } finally {
      setProcessing(false)
    }
  }

  const handleCardApprove = async (data: Record<string, unknown>) => {
    setProcessing(true)
    try {
      const orderId = data.orderID as string
      if (orderId) {
        await capturePayPalOrder(orderId)
      }
      setSuccess(true)
      onSuccess(orderId)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || String(err)
      console.error("[PayPal] card capture error:", err?.response?.status, err?.response?.data || err?.message)
      setError(msg)
      onError?.(msg)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 size={20} className="animate-spin text-white/40" />
        <span className="text-white/40 text-sm ml-2">{t("payment.loading") || "Loading..."}</span>
      </div>
    )
  }

  if (error && !config) {
    return (
      <div className="flex items-center gap-2 py-4 text-red-400/80 text-sm">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 py-6 text-green-400 text-sm">
        <CheckCircle size={20} />
        <span>{t("payment.success") || "Payment successful!"}</span>
      </div>
    )
  }

  if (!config) return null

  const sdkOptions = {
    "client-id": config.clientId,
    currency: "USD",
    intent: "capture" as const,
    components: ["buttons", "card-fields"] as string[],
  }

  const style = {
    layout: "vertical" as const,
    color: "gold" as const,
    shape: "rect" as const,
    label: "pay" as const,
  }

  return (
    <PayPalScriptProvider options={sdkOptions}>
      <div className={`space-y-4 ${compact ? "" : "py-2"}`}>
        {/* Processing overlay */}
        {processing && (
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-gold text-sm">
              <Loader2 size={16} className="animate-spin" />
              <span>{t("payment.processing") || "Processing payment..."}</span>
            </div>
          </div>
        )}

        {/* PayPal Buttons */}
        <div className="relative">
          <PayPalButtons
            style={style}
            createOrder={createOrder}
            onApprove={handlePayPalApprove}
            onError={(err) => {
              setError(String(err))
              onError?.(String(err))
            }}
            disabled={processing}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">{t("payment.or") || "or"}</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Card Fields */}
        <div className="relative rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={14} className="text-white/40" />
            <span className="text-white/50 text-xs">{t("payment.creditCard") || "Credit Card"}</span>
          </div>
          <PayPalCardFieldsProvider
            createOrder={createOrder}
            onApprove={handleCardApprove}
            onError={(err) => {
              setError(String(err))
              onError?.(String(err))
            }}
            style={{
              input: {
                "font-size": "14px",
                "font-family": "system-ui, -apple-system, sans-serif",
                color: "#e5e7eb",
              },
              ".valid": { color: "#10b981" },
              ".invalid": { color: "#ef4444" },
            }}
          >
            <PayPalCardFieldsForm />
          </PayPalCardFieldsProvider>
        </div>

        {/* Error display */}
        {error && config && (
          <div className="flex items-center gap-2 text-red-400/80 text-xs mt-2">
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
    </PayPalScriptProvider>
  )
}
