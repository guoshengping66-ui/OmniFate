"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Clock, CheckCircle, Loader2, Copy, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"
import { apiDirect, unlockReport } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { PayPalPayment } from "./PayPalPayment"

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
  /** Shop order number — when set, uses shop payment flow */
  shopOrderNo?: string
  /** Shop order total in display currency (CNY or USD) */
  shopAmount?: number
  /** Pre-selected payment method from checkout page */
  initialMethod?: PaymentMethod
}

type PaymentMethod = "alipay" | "wechat" | "paypal" | "credit_card"
type PaymentStatus =
  | "idle"
  | "loading"
  | "showing_qr"
  | "verifying"
  | "activating"
  | "success"
  | "waiting"
  | "failed"
  | "paypal_embedded"
  | "card_embedded"

const TIER_PRICES: Record<string, { amountCny: number; amountUsd: number; labelKey: string }> = {
  premium_monthly: { amountCny: 59, amountUsd: 14.99, labelKey: "payment.monthlyPlan" },
  premium_yearly: { amountCny: 365, amountUsd: 99, labelKey: "payment.yearlyPlan" },
  onetime_unlock: { amountCny: 19.9, amountUsd: 9.9, labelKey: "payment.onetimeUnlock" },
}

const UNLOCK_PRICES = { amountCny: 19.9, amountUsd: 9.9 }

const POLL_INTERVAL = 3000
const MAX_POLL_ATTEMPTS = 20

export function QRPaymentModal({
  open,
  onClose,
  tier,
  readingId,
  orderNo: preOrderNo,
  amount: preAmount,
  label: preLabel,
  postAction,
  onSuccess,
  region = "domestic",
  shopOrderNo,
  shopAmount,
  initialMethod,
}: QRPaymentModalProps) {
  const { t: rawT } = useLanguage()
  const t = rawT as unknown as (key: string, vars?: Record<string, string | number>) => string
  const isOverseas = region === "overseas"
  const isShopPayment = !!shopOrderNo
  const effectiveMethod = initialMethod || (isOverseas ? "paypal" : "alipay")
  const [method, setMethod] = useState<PaymentMethod>(effectiveMethod)
  const [status, setStatus] = useState<PaymentStatus>(() => {
    if (initialMethod === "credit_card" && isShopPayment) return "loading"
    if (isShopPayment) return isOverseas ? "paypal_embedded" : "showing_qr"
    if (preOrderNo) return "showing_qr"
    return isOverseas ? "paypal_embedded" : "idle"
  })
  const [orderNo, setOrderNo] = useState<string | null>(shopOrderNo || preOrderNo || null)
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState("")
  const [pollAttempts, setPollAttempts] = useState(0)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollActiveRef = useRef(false)

  // Sync method state with initialMethod prop (useState only initializes once)
  useEffect(() => {
    if (initialMethod && initialMethod !== method) {
      setMethod(initialMethod)
    }
  }, [initialMethod])

  const isReportUnlock = !!readingId && tier !== "onetime_unlock"
  const isPreOrder = !!preOrderNo
  const tierInfo = isShopPayment
    ? { amountCny: shopAmount || 0, amountUsd: shopAmount || 0, labelKey: "" }
    : isPreOrder
      ? { amountCny: preAmount || 0, amountUsd: preAmount || 0, labelKey: "" }
      : isReportUnlock
        ? { amountCny: UNLOCK_PRICES.amountCny, amountUsd: UNLOCK_PRICES.amountUsd, labelKey: "payment.unlockReport" }
        : (TIER_PRICES[tier || "premium_monthly"] || TIER_PRICES.premium_monthly)
  const displayAmount = isOverseas ? tierInfo.amountUsd : tierInfo.amountCny
  const currencySymbol = isOverseas ? "$" : "¥"
  const tierLabel = isPreOrder ? (preLabel || "Founder Seat") : t(tierInfo.labelKey)

  useEffect(() => {
    if (status !== "showing_qr" || !orderNo) return
    const expiresAt = Date.now() + 30 * 60 * 1000
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining === 0) {
        setStatus("failed")
        setError(t("payment.orderExpired"))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [status, orderNo])

  useEffect(() => {
    if ((preOrderNo || shopOrderNo) && status === "showing_qr" && !qrUrl && method !== "paypal") {
      apiDirect.get(`/api/personal-payments/qr/${method}`)
        .then(r => setQrUrl(r.data.qr_url))
        .catch(err => setQrError(err?.response?.data?.detail || t("payment.qrNotConfigured")))
    }
  }, [preOrderNo, shopOrderNo, status, method])

  // Auto-create PayPal order when credit_card is pre-selected for shop orders
  useEffect(() => {
    if (status === "loading" && method === "credit_card" && isShopPayment && shopOrderNo) {
      apiDirect.post(`/api/payments/paypal/create-shop-order?order_no=${shopOrderNo}`)
        .then(res => {
          setPaypalOrderId(res.data.paypal_order_id)
          setStatus("card_embedded")
        })
        .catch(err => {
          setError(err?.response?.data?.detail || t("payment.createOrderFailed"))
          setStatus("failed")
        })
    }
  }, [status, method, isShopPayment, shopOrderNo])

  // Auto-create PayPal order when paypal_embedded for shop orders (no paypalOrderId yet)
  useEffect(() => {
    if (status === "paypal_embedded" && isShopPayment && shopOrderNo && !paypalOrderId) {
      apiDirect.post(`/api/payments/paypal/create-shop-order?order_no=${shopOrderNo}`)
        .then(res => setPaypalOrderId(res.data.paypal_order_id))
        .catch(err => {
          setError(err?.response?.data?.detail || t("payment.createOrderFailed"))
          setStatus("failed")
        })
    }
  }, [status, isShopPayment, shopOrderNo, paypalOrderId])

  // Handle user switching payment method within the modal
  const prevMethodRef = useRef(method)
  useEffect(() => {
    if (prevMethodRef.current === method) return
    prevMethodRef.current = method
    setError("")

    if (method === "paypal" || method === "credit_card") {
      setStatus("loading")
    }
  }, [method])

  // When modal opens with shop order, force correct status based on method
  useEffect(() => {
    if (open && isShopPayment && shopOrderNo) {
      if (method === "credit_card" && status !== "loading" && status !== "card_embedded" && status !== "success") {
        setStatus("loading")
      } else if (method === "paypal" && status !== "paypal_embedded" && status !== "success") {
        setStatus("paypal_embedded")
      }
    }
  }, [open, isShopPayment, shopOrderNo, method])

  const createOrder = async () => {
    setStatus("loading")
    setError("")
    setQrError(null)

    // Shop order + PayPal: create PayPal order for existing shop order
    if (isShopPayment && method === "paypal") {
      try {
        const res = await apiDirect.post(`/api/payments/paypal/create-shop-order?order_no=${shopOrderNo}`)
        setPaypalOrderId(res.data.paypal_order_id)
        setStatus("paypal_embedded")
      } catch (err: any) {
        setError(err?.response?.data?.detail || t("payment.createOrderFailed"))
        setStatus("failed")
      }
      return
    }

    if (method === "paypal") {
      // Show embedded PayPal payment component (wallet + card)
      setStatus("paypal_embedded")
      return
    }

    if (method === "credit_card") {
      // Credit card for shop orders: create PayPal order first, then show card fields
      if (isShopPayment) {
        try {
          const res = await apiDirect.post(`/api/payments/paypal/create-shop-order?order_no=${shopOrderNo}`)
          setPaypalOrderId(res.data.paypal_order_id)
          setStatus("card_embedded")
        } catch (err: any) {
          setError(err?.response?.data?.detail || t("payment.createOrderFailed"))
          setStatus("failed")
        }
        return
      }
      // Subscription/unlock: show embedded credit card payment component
      setStatus("card_embedded")
      return
    }

    // Shop order + QR: order already exists, just show QR code
    if (isShopPayment) {
      try {
        const qrRes = await apiDirect.get(`/api/personal-payments/qr/${method}`)
        setQrUrl(qrRes.data.qr_url)
        setStatus("showing_qr")
      } catch (err: any) {
        setQrError(err?.response?.data?.detail || t("payment.qrNotConfigured"))
        setStatus("failed")
      }
      return
    }

    try {
      const qrRes = await apiDirect.get(`/api/personal-payments/qr/${method}`)
      setQrUrl(qrRes.data.qr_url)
    } catch (err: any) {
      setQrError(err?.response?.data?.detail || t("payment.qrNotConfigured"))
    }

    try {
      const res = await apiDirect.post("/api/personal-payments/create", {
        amount: tierInfo.amountCny,
        currency: method === "alipay" ? "CNY_ALIPAY" : "CNY_WECHAT",
        description: isReportUnlock
          ? `Destiny Mirror - Unlock Report - ${readingId}`
          : `Destiny Mirror - ${tierLabel} - ${tier}`,
        reading_id: readingId || "",
      })
      setOrderNo(res.data.order_no)
      setStatus("showing_qr")
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("payment.createOrderFailed"))
      setStatus("failed")
    }
  }

  const handleConfirmPaid = async () => {
    if (!orderNo) return
    setStatus("verifying")
    try {
      await apiDirect.post("/api/personal-payments/verify", { order_no: orderNo })
    } catch {}
    setStatus("waiting")
    startPollForStatus()
  }

  const activateSubscription = async (paidOrderNo?: string) => {
    setStatus("activating")
    try {
      if (postAction === "founder") {
        // For founder: use the PAID order number (PayPal order or personal order)
        // The founder purchase order (FO...) may not be the one that was actually paid
        const activateOrderNo = paidOrderNo || orderNo
        if (activateOrderNo) {
          const { api } = await import("@/lib/api")
          await api.post(`/api/payments/founder/activate?order_no=${activateOrderNo}`)
        }
      } else if (postAction === "unlock" && readingId) {
        try {
          await unlockReport(readingId)
        } catch {}
      } else if (postAction === "onetime_unlock" && readingId) {
        // One-time unlock: report is activated by backend callback, no client-side action needed
        // The backend handles: unlock report + grant stardust + grant coupon
      }
      setStatus("success")
      onSuccess?.()
    } catch (err: any) {
      setStatus("waiting")
      setError(err?.response?.data?.detail || t("payment.activationIssue"))
    }
  }

  const cancelPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
    pollActiveRef.current = false
  }, [])

  const handleRefreshStatus = useCallback(async () => {
    cancelPolling()
    setStatus("verifying")
    setPollAttempts(0)
    try {
      const statusRes = await apiDirect.get(`/api/personal-payments/status/${orderNo}`)
      const orderStatus = statusRes.data.status
      if (orderStatus === "paid") {
        await activateSubscription()
      } else if (orderStatus === "cancelled") {
        setStatus("failed")
        setError(t("payment.orderCancelled"))
      } else {
        startPollForStatus()
      }
    } catch {
      setStatus("waiting")
      setError(t("payment.networkError"))
    }
  }, [orderNo])

  const startPollForStatus = useCallback(() => {
    cancelPolling()
    pollActiveRef.current = true
    let attempts = 0

    const poll = async () => {
      if (!pollActiveRef.current) return
      attempts++
      setPollAttempts(attempts)
      try {
        const statusRes = await apiDirect.get(`/api/personal-payments/status/${orderNo}`)
        const orderStatus = statusRes.data.status
        if (orderStatus === "paid") { await activateSubscription(); return }
        if (orderStatus === "cancelled") { setStatus("failed"); setError(t("payment.orderCancelled")); return }
      } catch {}
      if (pollActiveRef.current && attempts < MAX_POLL_ATTEMPTS) {
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL)
      } else {
        setStatus("waiting")
      }
    }
    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL)
  }, [orderNo])

  const startPaypalPolling = useCallback((_itemType: string) => {
    cancelPolling()
    pollActiveRef.current = true
    let attempts = 0

    const poll = async () => {
      if (!pollActiveRef.current) return
      attempts++
      setPollAttempts(attempts)
      try {
        const { apiAuth } = await import("@/lib/api")
        const userRes = await apiAuth.get("/api/auth/me")
        const user = userRes.data
        if (user?.is_premium || user?.is_founder) { await activateSubscription(); return }
      } catch {}
      if (pollActiveRef.current && attempts < MAX_POLL_ATTEMPTS) {
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL)
      } else {
        setStatus("waiting")
      }
    }
    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL)
  }, [])

  useEffect(() => {
    return () => cancelPolling()
  }, [cancelPolling])

  const reset = () => {
    cancelPolling()
    setStatus("idle")
    setOrderNo(null)
    setPaypalOrderId(null)
    setQrUrl(null)
    setQrError(null)
    setError("")
    setPollAttempts(0)
  }

  const copyOrderNo = () => {
    if (orderNo) navigator.clipboard.writeText(orderNo)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 anim-fade-in">
      <div className="card-glass p-6 max-w-md w-full relative anim-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
          <X size={20} />
        </button>

        <h3 className="text-xl font-serif font-bold text-gold mb-2">
          {status === "success" ? t("payment.success") : status === "waiting" ? t("payment.waitingConfirm") : t("payment.scanToPay")}
        </h3>
        <p className="text-white/40 text-sm mb-6">{tierLabel}</p>

        {/* Status content - keyed by status for CSS animation */}
        <div key={status} className="anim-fade-in">
          {/* idle */}
          {status === "idle" && (
            <div>
              <div className="bg-white/5 rounded-xl p-4 text-center mb-6">
                <p className="text-white/40 text-xs mb-1">{t("payment.amount")}</p>
                <p className="text-3xl font-bold text-gold">{currencySymbol}{displayAmount}</p>
                <p className="text-white/30 text-xs mt-2">
                  {tier === "premium_yearly" ? t("payment.yearly") : t("payment.monthly")}
                </p>
              </div>
              <div className="mb-6">
                <p className="text-white/50 text-xs mb-3">{t("payment.selectMethod")}</p>
                {isOverseas ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMethod("paypal")}
                      className={`p-4 rounded-xl border transition-all ${method === "paypal" ? "bg-blue-600/10 border-blue-500/40" : "bg-white/[0.03] border-white/10 hover:border-white/20"}`}
                    >
                      <div className="text-blue-400 font-medium">PayPal</div>
                      <div className="text-white/40 text-xs mt-1">PayPal Wallet</div>
                    </button>
                    <button
                      onClick={() => setMethod("credit_card")}
                      className={`p-4 rounded-xl border transition-all ${method === "credit_card" ? "bg-purple-500/10 border-purple-500/40" : "bg-white/[0.03] border-white/10 hover:border-white/20"}`}
                    >
                      <div className="text-purple-400 font-medium">{t("payment.creditCard") || "Credit Card"}</div>
                      <div className="text-white/40 text-xs mt-1">Visa / MC / Apple Pay / Google Pay</div>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setMethod("alipay")}
                      className={`p-4 rounded-xl border transition-all ${method === "alipay" ? "bg-blue-500/10 border-blue-500/40" : "bg-white/[0.03] border-white/10 hover:border-white/20"}`}>
                      <div className="text-blue-400 font-medium">Alipay</div>
                      <div className="text-white/40 text-xs mt-1">Alipay</div>
                    </button>
                    <button onClick={() => setMethod("wechat")}
                      className={`p-4 rounded-xl border transition-all ${method === "wechat" ? "bg-green-500/10 border-green-500/40" : "bg-white/[0.03] border-white/10 hover:border-white/20"}`}>
                      <div className="text-green-400 font-medium">WeChat Pay</div>
                      <div className="text-white/40 text-xs mt-1">WeChat Pay</div>
                    </button>
                  </div>
                )}
              </div>
              <button onClick={createOrder} className="btn-gold w-full py-3">
                {t("payment.confirmPay")} {currencySymbol}{displayAmount}
              </button>
            </div>
          )}

          {/* loading */}
          {status === "loading" && (
            <div className="text-center py-12">
              <Loader2 size={40} className="animate-spin text-gold mx-auto" />
              <p className="text-white/50 mt-4">
                {method === "paypal" ? "Opening PayPal..." : method === "credit_card" ? "Preparing card payment..." : t("payment.preparingQR")}
              </p>
            </div>
          )}

          {/* paypal_embedded - inline PayPal payment (wallet + card for subscriptions, wallet only for shop) */}
          {status === "paypal_embedded" && (
            <div>
              <div className="bg-white/5 rounded-xl p-4 text-center mb-4">
                <p className="text-white/40 text-xs mb-1">{t("payment.amount")}</p>
                <p className="text-2xl font-bold text-gold">${tierInfo.amountUsd}</p>
              </div>
              <PayPalPayment
                itemType={isShopPayment ? "shop" : isPreOrder ? "founder_lifetime" : isReportUnlock ? "unlock_report" : (tier || "premium_monthly")}
                readingId={readingId}
                amount={`$${tierInfo.amountUsd}`}
                compact
                mode={isShopPayment ? "wallet" : "both"}
                paypalOrderId={isShopPayment ? paypalOrderId || undefined : undefined}
                onSuccess={async (orderId?: string) => {
                  if (isShopPayment) {
                    setStatus("success")
                    onSuccess?.()
                  } else {
                    await activateSubscription(orderId)
                  }
                }}
                onError={(msg) => {
                  setError(msg)
                  setStatus("failed")
                }}
              />
              <button onClick={reset} className="text-white/30 text-xs mt-4 hover:text-white/50 w-full text-center">
                {t("payment.cancel")}
              </button>
            </div>
          )}

          {/* card_embedded - standalone credit card payment */}
          {status === "card_embedded" && (
            <div>
              <div className="bg-white/5 rounded-xl p-4 text-center mb-4">
                <p className="text-white/40 text-xs mb-1">{t("payment.amount")}</p>
                <p className="text-2xl font-bold text-gold">${tierInfo.amountUsd}</p>
              </div>
              <PayPalPayment
                itemType={isShopPayment ? "shop" : isPreOrder ? "founder_lifetime" : isReportUnlock ? "unlock_report" : (tier || "premium_monthly")}
                readingId={readingId}
                amount={`$${tierInfo.amountUsd}`}
                compact
                mode="card"
                paypalOrderId={isShopPayment ? paypalOrderId || undefined : undefined}
                onSuccess={async (orderId?: string) => {
                  if (isShopPayment) {
                    setStatus("success")
                    onSuccess?.()
                  } else {
                    await activateSubscription(orderId)
                  }
                }}
                onError={(msg) => {
                  setError(msg)
                  setStatus("failed")
                }}
              />
              <button onClick={reset} className="text-white/30 text-xs mt-4 hover:text-white/50 w-full text-center">
                {t("payment.cancel")}
              </button>
            </div>
          )}

          {/* showing_qr */}
          {status === "showing_qr" && (
            <div>
              <div className="flex items-center justify-center gap-2 mb-4 text-white/50">
                <Clock size={14} />
                <span className="text-sm">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                </span>
              </div>
              {qrUrl ? (
                <div className="bg-white rounded-2xl p-4 mb-4">
                  <img
                    src={qrUrl}
                    alt={method === "alipay" ? t("payment.alipayQR") : t("payment.wechatQR")}
                    className="w-56 h-56 mx-auto object-contain"
                    onError={() => setQrError(t("payment.qrLoadFailed"))}
                  />
                </div>
              ) : qrError ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-center">
                  <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
                  <p className="text-red-300 text-sm">{qrError}</p>
                </div>
              ) : null}
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 mb-4 text-center">
                <p className="text-gold font-bold text-lg">{t("payment.pleasePay")} {currencySymbol}{displayAmount}</p>
                <p className="text-white/40 text-xs mt-1">{t("payment.enterAmountManually")}</p>
              </div>
              {orderNo && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-white/40 text-sm">{t("payment.orderNo")}</span>
                  <span className="text-white/70 text-sm font-mono">{orderNo}</span>
                  <button onClick={copyOrderNo} className="text-gold hover:text-gold/80"><Copy size={14} /></button>
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-white/50 text-xs mb-2">
                  {method === "alipay" ? t("payment.alipaySteps") : t("payment.wechatSteps")}
                </p>
                <ol className="space-y-1">
                  <li className="text-white/40 text-xs">{method === "alipay" ? t("payment.step1Alipay") : t("payment.step1Wechat")}</li>
                  <li className="text-white/40 text-xs">{t("payment.step2")}</li>
                  <li className="text-white/40 text-xs">{t("payment.step3")} {currencySymbol}{displayAmount}</li>
                  <li className="text-white/40 text-xs">{t("payment.step4")}</li>
                  <li className="text-white/40 text-xs">{t("payment.step5")}</li>
                </ol>
                <p className="text-gold/70 text-xs mt-2">{t("payment.ensureAmount")}</p>
              </div>
              <button onClick={handleConfirmPaid} className="btn-gold w-full py-3">
                {t("payment.iHavePaid")}
              </button>
              <p className="text-white/30 text-xs text-center mt-3">
                {t("payment.completeWithin").replace("{minutes}", String(Math.floor(countdown / 60)))}
              </p>
            </div>
          )}

          {/* verifying */}
          {status === "verifying" && (
            <div className="text-center py-12">
              <Loader2 size={40} className="animate-spin text-gold mx-auto" />
              <p className="text-white/50 mt-4">{t("payment.confirming")}</p>
              <p className="text-white/30 text-xs mt-2">{t("payment.pleaseWait")}</p>
            </div>
          )}

          {/* activating */}
          {status === "activating" && (
            <div className="text-center py-12">
              <Loader2 size={40} className="animate-spin text-gold mx-auto" />
              <p className="text-white/50 mt-4">{t("payment.activating")}</p>
            </div>
          )}

          {/* success */}
          {status === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h4 className="text-xl font-bold text-green-400 mb-2">{t("payment.successTitle")}</h4>
              <p className="text-white/50 text-sm mb-6">{t("payment.successDesc")}</p>
              <button onClick={onClose} className="btn-gold px-8">{t("payment.startUsing")}</button>
            </div>
          )}

          {/* waiting */}
          {status === "waiting" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-amber-400" />
              </div>
              <h4 className="text-xl font-bold text-amber-400 mb-2">
                {method === "paypal" ? "Waiting for PayPal Payment" : t("payment.waitingTitle")}
              </h4>
              {method === "paypal" ? (
                <>
                  <p className="text-white/50 text-sm mb-2">Please complete payment in the PayPal window</p>
                  <p className="text-white/30 text-xs mb-4">Once payment is confirmed, your account will be activated automatically</p>
                  {paypalOrderId && (
                    <button onClick={() => window.open(paypalOrderId, "_blank")}
                      className="btn-secondary flex items-center justify-center gap-2 mx-auto mb-4 px-6 py-2">
                      <ExternalLink size={14} /> Reopen PayPal
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-white/50 text-sm mb-2">{t("payment.waitingDesc1")}</p>
                  <p className="text-white/30 text-xs mb-6">{t("payment.waitingDesc2")}</p>
                </>
              )}
              {error && <p className="text-amber-300/60 text-xs mb-4">{error}</p>}
              <div className="flex gap-3">
                <button onClick={handleRefreshStatus} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> {t("payment.refreshStatus")}
                </button>
                <button onClick={onClose} className="btn-secondary flex-1">{t("payment.checkLater")}</button>
              </div>
            </div>
          )}

          {/* failed */}
          {status === "failed" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h4 className="text-xl font-bold text-red-400 mb-2">{t("payment.failedTitle")}</h4>
              <p className="text-white/50 text-sm mb-6">{error || t("payment.failedDesc")}</p>
              <div className="flex gap-3">
                <button onClick={reset} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> {t("payment.retryPay")}
                </button>
                <button onClick={onClose} className="btn-secondary flex-1">{t("payment.cancel")}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
