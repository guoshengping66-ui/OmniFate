"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, CheckCircle, Loader2, Copy, AlertCircle, RefreshCw } from "lucide-react"
import { apiDirect } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

interface QRPaymentModalProps {
  open: boolean
  onClose: () => void
  /** Subscription tier: premium_monthly or premium_yearly */
  tier: "premium_monthly" | "premium_yearly"
  /** Called ONLY after backend confirms payment and activates subscription */
  onSuccess?: () => void
}

type PaymentMethod = "alipay" | "wechat"
type PaymentStatus =
  | "idle"
  | "loading"
  | "showing_qr"
  | "verifying"
  | "activating"
  | "success"
  | "waiting"
  | "failed"

/** Prices from tiers.ts — client side display only, backend validates */
const TIER_PRICES: Record<string, { amount: number; labelKey: string }> = {
  premium_monthly: { amount: 59, labelKey: "payment.monthlyPlan" },
  premium_yearly: { amount: 365, labelKey: "payment.yearlyPlan" },
}

const POLL_INTERVAL = 3000
const MAX_POLL_ATTEMPTS = 20

export function QRPaymentModal({
  open,
  onClose,
  tier,
  onSuccess,
}: QRPaymentModalProps) {
  const { t: rawT } = useLanguage()
  const t = rawT as unknown as (key: string, vars?: Record<string, string | number>) => string
  const [method, setMethod] = useState<PaymentMethod>("alipay")
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [orderNo, setOrderNo] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState("")
  const [pollAttempts, setPollAttempts] = useState(0)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollActiveRef = useRef(false)

  const tierInfo = TIER_PRICES[tier] || TIER_PRICES.premium_monthly
  const tierLabel = t(tierInfo.labelKey)

  // 倒计时（订单30分钟过期）
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

  // 创建订单并获取收款码
  const createOrder = async () => {
    setStatus("loading")
    setError("")
    setQrError(null)

    try {
      const qrRes = await apiDirect.get(`/api/personal-payments/qr/${method}`)
      setQrUrl(qrRes.data.qr_url)
    } catch (err: any) {
      setQrError(err?.response?.data?.detail || t("payment.qrNotConfigured"))
    }

    try {
      const res = await apiDirect.post("/api/personal-payments/create", {
        amount: tierInfo.amount,
        currency: method === "alipay" ? "CNY_ALIPAY" : "CNY_WECHAT",
        description: `Destiny Mirror - ${tierLabel} - ${tier}`,
        reading_id: "",
      })
      setOrderNo(res.data.order_no)
      setStatus("showing_qr")
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("payment.createOrderFailed"))
      setStatus("failed")
    }
  }

  // ── 核心：用户点击"我已完成支付" ──────────────────────────────────────────
  // 直接调用 /confirm 激活订阅，由管理员在收款APP中手动核实
  const handleConfirmPaid = async () => {
    if (!orderNo) return
    setStatus("verifying")

    try {
      // 1. 先标记为 processing（可选，失败不影响）
      await apiDirect.post("/api/personal-payments/verify", { order_no: orderNo })
    } catch { /* verify 失败不影响后续 */ }

    // 2. 直接调 /confirm 激活订阅（不再轮询等待 "paid"）
    await activateSubscription()
  }

  // ── 调用后端 /confirm 激活订阅 ──────────────────────────────────────────
  const activateSubscription = async () => {
    setStatus("activating")

    try {
      await apiDirect.post(`/api/personal-payments/confirm?order_no=${orderNo}`)
      // 激活成功
      setStatus("success")
      onSuccess?.()  // 通知父组件刷新用户信息
    } catch (err: any) {
      setStatus("waiting")
      setError(err?.response?.data?.detail || t("payment.activationIssue"))
    }
  }

  // ── 取消旧轮询（防止状态覆盖）────────────────────────────────────────────
  const cancelPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
    pollActiveRef.current = false
  }, [])

  // ── 刷新状态：重新轮询订单（用于 waiting 状态下的手动刷新）──────────────
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
        // 仍然是 processing/pending — 启动轮询
        startPollForStatus()
      }
    } catch {
      setStatus("waiting")
      setError(t("payment.networkError"))
    }
  }, [orderNo])

  // ── 轮询订单状态（仅用于刷新按钮）────────────────────────────────────────
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

        if (orderStatus === "paid") {
          await activateSubscription()
          return
        }
        if (orderStatus === "cancelled") {
          setStatus("failed")
          setError(t("payment.orderCancelled"))
          return
        }
      } catch { /* ignore network errors */ }

      if (pollActiveRef.current && attempts < MAX_POLL_ATTEMPTS) {
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL)
      } else {
        setStatus("waiting")
      }
    }

    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL)
  }, [orderNo])

  // 卸载时清理轮询
  useEffect(() => {
    return () => cancelPolling()
  }, [cancelPolling])

  const reset = () => {
    cancelPolling()
    setStatus("idle")
    setOrderNo(null)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-glass p-6 max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
          <X size={20} />
        </button>

        <h3 className="text-xl font-serif font-bold text-gold mb-2">
          {status === "success" ? t("payment.success") : status === "waiting" ? t("payment.waitingConfirm") : t("payment.scanToPay")}
        </h3>
        <p className="text-white/40 text-sm mb-6">{tierLabel}</p>

        <AnimatePresence mode="wait">
          {/* ═══ 选择金额 + 支付方式 ═══ */}
          {status === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white/5 rounded-xl p-4 text-center mb-6">
                <p className="text-white/40 text-xs mb-1">{t("payment.amount")}</p>
                <p className="text-3xl font-bold text-gold">¥{tierInfo.amount}</p>
                <p className="text-white/30 text-xs mt-2">
                  {tier === "premium_yearly" ? t("payment.yearly") : t("payment.monthly")}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-white/50 text-xs mb-3">{t("payment.selectMethod")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMethod("alipay")}
                    className={`p-4 rounded-xl border transition-all ${
                      method === "alipay"
                        ? "bg-blue-500/10 border-blue-500/40"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="text-blue-400 font-medium">Alipay</div>
                    <div className="text-white/40 text-xs mt-1">Alipay</div>
                  </button>
                  <button
                    onClick={() => setMethod("wechat")}
                    className={`p-4 rounded-xl border transition-all ${
                      method === "wechat"
                        ? "bg-green-500/10 border-green-500/40"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="text-green-400 font-medium">WeChat Pay</div>
                    <div className="text-white/40 text-xs mt-1">WeChat Pay</div>
                  </button>
                </div>
              </div>

              <button onClick={createOrder} className="btn-gold w-full py-3">
                {t("payment.confirmPay")} ¥{tierInfo.amount}
              </button>
            </motion.div>
          )}

          {/* ═══ 加载中 ═══ */}
          {status === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <Loader2 size={40} className="animate-spin text-gold mx-auto" />
              <p className="text-white/50 mt-4">{t("payment.preparingQR")}</p>
            </motion.div>
          )}

          {/* ═══ 显示收款码 ═══ */}
          {status === "showing_qr" && (
            <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                <p className="text-gold font-bold text-lg">{t("payment.pleasePay")} ¥{tierInfo.amount}</p>
                <p className="text-white/40 text-xs mt-1">{t("payment.enterAmountManually")}</p>
              </div>

              {orderNo && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-white/40 text-sm">{t("payment.orderNo")}</span>
                  <span className="text-white/70 text-sm font-mono">{orderNo}</span>
                  <button onClick={copyOrderNo} className="text-gold hover:text-gold/80">
                    <Copy size={14} />
                  </button>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-white/50 text-xs mb-2">
                  {method === "alipay" ? t("payment.alipaySteps") : t("payment.wechatSteps")}
                </p>
                <ol className="space-y-1">
                  <li className="text-white/40 text-xs">{method === "alipay" ? t("payment.step1Alipay") : t("payment.step1Wechat")}</li>
                  <li className="text-white/40 text-xs">{t("payment.step2")}</li>
                  <li className="text-white/40 text-xs">{t("payment.step3")} ¥{tierInfo.amount}</li>
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
            </motion.div>
          )}

          {/* ═══ 正在验证 ═══ */}
          {status === "verifying" && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <Loader2 size={40} className="animate-spin text-gold mx-auto" />
              <p className="text-white/50 mt-4">{t("payment.confirming")}</p>
              <p className="text-white/30 text-xs mt-2">{t("payment.pleaseWait")}</p>
            </motion.div>
          )}

          {/* ═══ 正在激活会员 ═══ */}
          {status === "activating" && (
            <motion.div key="activating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <Loader2 size={40} className="animate-spin text-gold mx-auto" />
              <p className="text-white/50 mt-4">{t("payment.activating")}</p>
            </motion.div>
          )}

          {/* ═══ 支付成功（仅后端 confirm 成功后显示）═══ */}
          {status === "success" && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h4 className="text-xl font-bold text-green-400 mb-2">{t("payment.successTitle")}</h4>
              <p className="text-white/50 text-sm mb-6">{t("payment.successDesc")}</p>
              <button onClick={onClose} className="btn-gold px-8">
                {t("payment.startUsing")}
              </button>
            </motion.div>
          )}

          {/* ═══ 等待确认（超时或 confirm 失败）═══ */}
          {status === "waiting" && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-amber-400" />
              </div>
              <h4 className="text-xl font-bold text-amber-400 mb-2">{t("payment.waitingTitle")}</h4>
              <p className="text-white/50 text-sm mb-2">
                {t("payment.waitingDesc1")}
              </p>
              <p className="text-white/30 text-xs mb-6">
                {t("payment.waitingDesc2")}
              </p>
              {error && (
                <p className="text-amber-300/60 text-xs mb-4">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleRefreshStatus}
                  className="btn-gold flex-1 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> {t("payment.refreshStatus")}
                </button>
                <button onClick={onClose} className="btn-secondary flex-1">
                  {t("payment.checkLater")}
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ 失败 ═══ */}
          {status === "failed" && (
            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h4 className="text-xl font-bold text-red-400 mb-2">{t("payment.failedTitle")}</h4>
              <p className="text-white/50 text-sm mb-6">{error || t("payment.failedDesc")}</p>
              <div className="flex gap-3">
                <button onClick={reset} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> {t("payment.retryPay")}
                </button>
                <button onClick={onClose} className="btn-secondary flex-1">
                  {t("payment.cancel")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
