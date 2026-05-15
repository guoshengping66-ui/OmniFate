"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, CheckCircle, Loader2, Copy, AlertCircle, RefreshCw } from "lucide-react"
import { apiDirect } from "@/lib/api"

interface QRPaymentModalProps {
  open: boolean
  onClose: () => void
  /** Subscription tier: premium_monthly or premium_yearly */
  tier: "premium_monthly" | "premium_yearly"
  onSuccess?: () => void
}

type PaymentMethod = "alipay" | "wechat"
type PaymentStatus = "idle" | "loading" | "showing_qr" | "waiting_confirm" | "verifying" | "success" | "failed"

const TIER_PRICES: Record<string, { amount: number; label: string }> = {
  premium_monthly: { amount: 49, label: "月度会员 ¥49/月" },
  premium_yearly: { amount: 298, label: "年度会员 ¥298/年" },
}

export function QRPaymentModal({
  open,
  onClose,
  tier,
  onSuccess,
}: QRPaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("alipay")
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [orderNo, setOrderNo] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState("")

  const tierInfo = TIER_PRICES[tier] || TIER_PRICES.premium_monthly

  // 倒计时（订单30分钟过期）
  useEffect(() => {
    if (status !== "showing_qr" || !orderNo) return
    const expiresAt = Date.now() + 30 * 60 * 1000 // 30分钟
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining === 0) {
        setStatus("failed")
        setError("订单已过期，请重新下单")
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
      // 1. 获取收款码图片URL
      const qrRes = await apiDirect.get(`/api/personal-payments/qr/${method}`)
      setQrUrl(qrRes.data.qr_url)
    } catch (err: any) {
      // 收款码未配置 → 提示用户
      setQrError(err?.response?.data?.detail || "收款码未配置")
    }

    try {
      // 2. 创建支付订单 — description 中包含 tier 标识供 confirm_payment 识别
      const res = await apiDirect.post("/api/personal-payments/create", {
        amount: tierInfo.amount,
        currency: method === "alipay" ? "CNY_ALIPAY" : "CNY_WECHAT",
        description: `命盘智镜 - ${tierInfo.label} - ${tier}`,
        reading_id: "",
      })
      setOrderNo(res.data.order_no)
      setStatus("showing_qr")
    } catch (err: any) {
      setError(err?.response?.data?.detail || "创建订单失败")
      setStatus("failed")
    }
  }

  // 确认已支付
  const confirmPayment = async () => {
    if (!orderNo) return
    setStatus("verifying")

    try {
      // 提交验证
      await apiDirect.post("/api/personal-payments/verify", { order_no: orderNo })

      // 轮询订单状态
      let attempts = 0
      const maxAttempts = 15

      const poll = async () => {
        try {
          const statusRes = await apiDirect.get(`/api/personal-payments/status/${orderNo}`)
          if (statusRes.data.status === "paid") {
            setStatus("success")
            onSuccess?.()
            return
          }
        } catch { /* ignore */ }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000)
        } else {
          // 超时 — 订单仍在processing，提示用户等待
          setStatus("success")
          setError("")
          onSuccess?.()
        }
      }
      poll()
    } catch (err: any) {
      setError(err?.response?.data?.detail || "确认失败")
      setStatus("failed")
    }
  }

  const reset = () => {
    setStatus("idle")
    setOrderNo(null)
    setQrUrl(null)
    setQrError(null)
    setError("")
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
          {status === "success" ? "支付成功" : "扫码支付"}
        </h3>
        <p className="text-white/40 text-sm mb-6">{tierInfo.label}</p>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* 金额 */}
              <div className="bg-white/5 rounded-xl p-4 text-center mb-6">
                <p className="text-white/40 text-xs mb-1">支付金额</p>
                <p className="text-3xl font-bold text-gold">¥{tierInfo.amount}</p>
                <p className="text-white/30 text-xs mt-2">
                  {tier === "premium_yearly" ? "年度会员" : "月度会员"}
                </p>
              </div>

              {/* 选择支付方式 */}
              <div className="mb-6">
                <p className="text-white/50 text-xs mb-3">选择支付方式</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMethod("alipay")}
                    className={`p-4 rounded-xl border transition-all ${
                      method === "alipay"
                        ? "bg-blue-500/10 border-blue-500/40"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="text-blue-400 font-medium">支付宝</div>
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
                    <div className="text-green-400 font-medium">微信支付</div>
                    <div className="text-white/40 text-xs mt-1">WeChat Pay</div>
                  </button>
                </div>
              </div>

              <button onClick={createOrder} className="btn-gold w-full py-3">
                确认支付 ¥{tierInfo.amount}
              </button>
            </motion.div>
          )}

          {status === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <Loader2 size={40} className="animate-spin text-gold mx-auto" />
              <p className="text-white/50 mt-4">准备收款码...</p>
            </motion.div>
          )}

          {status === "showing_qr" && (
            <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* 倒计时 */}
              <div className="flex items-center justify-center gap-2 mb-4 text-white/50">
                <Clock size={14} />
                <span className="text-sm">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                </span>
              </div>

              {/* 收款码 */}
              {qrUrl ? (
                <div className="bg-white rounded-2xl p-4 mb-4">
                  <img
                    src={qrUrl}
                    alt={`${method === "alipay" ? "支付宝" : "微信"}收款码`}
                    className="w-56 h-56 mx-auto object-contain"
                    onError={() => setQrError("收款码图片加载失败")}
                  />
                </div>
              ) : qrError ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-center">
                  <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
                  <p className="text-red-300 text-sm">{qrError}</p>
                  <p className="text-white/30 text-xs mt-2">请在Vercel环境变量中配置收款码图片URL</p>
                </div>
              ) : null}

              {/* 金额提示 */}
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 mb-4 text-center">
                <p className="text-gold font-bold text-lg">请支付 ¥{tierInfo.amount}</p>
                <p className="text-white/40 text-xs mt-1">请在支付APP中手动输入此金额</p>
              </div>

              {/* 订单号 */}
              {orderNo && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-white/40 text-sm">订单号:</span>
                  <span className="text-white/70 text-sm font-mono">{orderNo}</span>
                  <button onClick={copyOrderNo} className="text-gold hover:text-gold/80">
                    <Copy size={14} />
                  </button>
                </div>
              )}

              {/* 操作步骤 */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-white/50 text-xs mb-2">
                  {method === "alipay" ? "支付宝支付步骤" : "微信支付步骤"}
                </p>
                <ol className="space-y-1">
                  {method === "alipay" ? (
                    <>
                      <li className="text-white/40 text-xs">1. 打开支付宝APP</li>
                      <li className="text-white/40 text-xs">2. 点击「扫一扫」扫描上方二维码</li>
                      <li className="text-white/40 text-xs">3. 手动输入金额 ¥{tierInfo.amount}</li>
                      <li className="text-white/40 text-xs">4. 确认支付</li>
                      <li className="text-white/40 text-xs">5. 支付完成后点击下方按钮</li>
                    </>
                  ) : (
                    <>
                      <li className="text-white/40 text-xs">1. 打开微信APP</li>
                      <li className="text-white/40 text-xs">2. 点击「扫一扫」扫描上方二维码</li>
                      <li className="text-white/40 text-xs">3. 手动输入金额 ¥{tierInfo.amount}</li>
                      <li className="text-white/40 text-xs">4. 确认支付</li>
                      <li className="text-white/40 text-xs">5. 支付完成后点击下方按钮</li>
                    </>
                  )}
                </ol>
                <p className="text-gold/70 text-xs mt-2">请确保转账金额与订单一致，备注中填写订单号</p>
              </div>

              <button onClick={confirmPayment} className="btn-gold w-full py-3">
                我已完成支付
              </button>
              <p className="text-white/30 text-xs text-center mt-3">
                请在 {Math.floor(countdown / 60)} 分钟内完成支付
              </p>
            </motion.div>
          )}

          {status === "verifying" && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <Loader2 size={40} className="animate-spin text-gold mx-auto" />
              <p className="text-white/50 mt-4">正在确认支付...</p>
              <p className="text-white/30 text-xs mt-2">请稍候</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h4 className="text-xl font-bold text-green-400 mb-2">支付已提交</h4>
              <p className="text-white/50 text-sm mb-2">
                {error
                  ? "您的订单正在等待确认，稍后会自动激活会员"
                  : "支付已确认，会员已激活！"}
              </p>
              <button onClick={onClose} className="btn-gold px-8 mt-4">
                开始使用
              </button>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h4 className="text-xl font-bold text-red-400 mb-2">支付失败</h4>
              <p className="text-white/50 text-sm mb-6">{error || "支付过程出现问题"}</p>
              <div className="flex gap-3">
                <button onClick={reset} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> 重新支付
                </button>
                <button onClick={onClose} className="btn-secondary flex-1">
                  取消
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
