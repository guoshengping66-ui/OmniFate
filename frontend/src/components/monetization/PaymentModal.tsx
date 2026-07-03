"use client"
import { useState } from "react"
import { X, Sparkles, Shield, CreditCard, CheckCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { PaymentMethodSelector } from "./PaymentMethodSelector"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (paymentMethod: string) => Promise<void>
  title: string
  priceDisplay: string
  description: string
  perks?: string[]
  showStardustOption?: boolean
  stardustCost?: number
  onStardustPayment?: () => Promise<void>
}

export function PaymentModal({
  open,
  onClose,
  onConfirm,
  title,
  priceDisplay,
  description,
  perks = [],
  showStardustOption = false,
  stardustCost = 0,
  onStardustPayment,
}: PaymentModalProps) {
  const { t } = useLanguage()
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle")
  const [paymentMethod, setPaymentMethod] = useState("stripe")

  if (!open) return null

  const handlePay = async () => {
    setStatus("processing")
    try {
      await onConfirm(paymentMethod)
      setStatus("success")
    } catch {
      setStatus("idle")
    }
  }

  const handleStardustPay = async () => {
    if (!onStardustPayment) return
    setStatus("processing")
    try {
      await onStardustPayment()
      setStatus("success")
    } catch {
      setStatus("idle")
    }
  }

  if (status === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="card-solid p-8 text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h3 className="text-xl font-serif font-bold text-gold mb-2">{t("paymentModal.paid")}</h3>
          <p className="text-parchment-400 text-sm mb-6">{t("paymentModal.paidDesc")}</p>
          <button onClick={onClose} className="btn-primary w-full">
            {t("paymentModal.viewReport")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card-solid p-6 md:p-8 max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-gold" />
            <h3 className="font-serif text-lg font-bold text-gold">{title}</h3>
          </div>
          <button onClick={onClose} disabled={status === "processing"}
            className="text-parchment-400 hover:text-parchment-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-parchment-400 text-sm mb-6">{description}</p>

        <div className="bg-white/[0.04] rounded-xl p-5 mb-6 text-center">
          <p className="text-parchment-400 text-xs mb-1">{t("paymentModal.amount")}</p>
          <p className="text-3xl font-bold text-gold">{priceDisplay}</p>
        </div>

        {/* Stardust option */}
        {showStardustOption && onStardustPayment && (
          <div className="mb-4">
            <button
              onClick={handleStardustPay}
              disabled={status === "processing"}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl
                       bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30
                       text-purple-300 hover:border-purple-400/50 hover:bg-purple-500/30 transition-all"
            >
              {status === "processing"
                ? <Loader2 size={18} className="animate-spin" />
                : <Sparkles size={18} className="text-purple-400" />}
              <span className="text-sm font-medium">
                {t("paymentModal.useStardust")} ({stardustCost} ✨)
              </span>
            </button>
            <div className="flex items-center justify-center gap-2 my-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-parchment-400 text-xs">{t("paymentModal.or")}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={14} className="text-gold/60" />
            <span className="text-parchment-400 text-xs font-medium">{t("paymentModal.selectPayment")}</span>
          </div>
          <PaymentMethodSelector
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />
        </div>

        {perks.length > 0 && (
          <div className="mb-6 space-y-2">
            {perks.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-parchment-400">
                <Sparkles size={12} className="text-gold flex-shrink-0" />
                {p}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={status === "processing"}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {status === "processing"
            ? <><Loader2 size={18} className="animate-spin" /> {t("paymentModal.processing")}</>
            : <>{t("paymentModal.confirmPay")} {priceDisplay}</>}
        </button>

        <p className="text-parchment-400 text-xs text-center mt-4">
          Secure checkout powered by Stripe.
        </p>
      </div>
    </div>
  )
}
