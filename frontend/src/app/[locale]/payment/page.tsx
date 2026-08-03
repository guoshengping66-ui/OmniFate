"use client"
export const dynamic = "force-dynamic"

import { Suspense, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Clock, CreditCard } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { ComplianceNotice } from "@/components/compliance/ComplianceNotice"
import { popPendingPurchase, trackPurchase } from "@/lib/gtag"

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const { localeHref } = useLanguage()
  const paymentStatus = searchParams.get("paddle")
  const transactionId = searchParams.get("transaction_id")
  const isSuccess = paymentStatus === "success"
  const isCancelled = paymentStatus === "cancelled"
  const purchaseTracked = useRef(false)

  useEffect(() => {
    if (isSuccess) {
      refreshUser().catch(() => {})
    }
  }, [isSuccess, refreshUser])

  // Fire the GA4 purchase conversion once per successful return.
  useEffect(() => {
    if (!isSuccess || purchaseTracked.current) return
    purchaseTracked.current = true
    const pending = popPendingPurchase()
    trackPurchase({
      transaction_id: transactionId ?? pending?.transaction_id,
      value: pending?.value,
      currency: pending?.currency,
      item_name: pending?.item_name,
    })
  }, [isSuccess, transactionId])

  const icon = isSuccess ? (
    <CheckCircle size={40} className="text-green-400" />
  ) : isCancelled ? (
    <XCircle size={40} className="text-yellow-400" />
  ) : (
    <Clock size={40} className="text-gold" />
  )
  const title = isSuccess ? "Payment submitted" : isCancelled ? "Payment cancelled" : "Payment status pending"
  const description = isSuccess
    ? "Paddle is processing the payment. Digital access and credits are granted only after the verified payment webhook is received."
    : isCancelled
      ? "Your Paddle checkout was cancelled. No payment is confirmed by this page."
      : "We could not confirm payment from this return link. Check your account again shortly after Paddle confirms it."

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="card-glass max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
          {icon}
        </div>
        <h1 className="text-2xl font-serif font-bold text-gold mb-3">{title}</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-5">{description}</p>
        {transactionId && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-6">
            <p className="text-white/30 text-xs mb-1">Transaction reference</p>
            <p className="text-white/70 text-sm font-mono">{transactionId}</p>
          </div>
        )}
        <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 mb-6 text-left">
          <div className="flex items-center gap-2 text-gold font-medium">
            <CreditCard size={18} />
            <span>Paddle Checkout</span>
          </div>
          <p className="text-white/40 text-xs mt-1">If your access has not updated yet, refresh your account page in a few seconds.</p>
        </div>
        <ComplianceNotice compact className="mb-6 text-left" />
        <div className="flex gap-3">
          <Link href={localeHref("/account")} className="btn-gold flex-1 py-3 text-sm">
            Account
          </Link>
          <Link href={localeHref("/pricing")} className="btn-gold-outline flex-1 py-3 text-sm">
            Pricing
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 text-center text-white/50">Loading...</div>}>
      <PaymentResultContent />
    </Suspense>
  )
}
