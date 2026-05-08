"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, CheckCircle, Loader2, Copy, AlertCircle, RefreshCw } from "lucide-react"

interface QRPaymentModalProps {
  open: boolean
  onClose: () => void
  amount: number
  description?: string
  readingId?: string
  onSuccess?: (orderNo: string) => void
}

type PaymentMethod = "alipay" | "wechat"
type PaymentStatus = "idle" | "loading" | "showing_qr" | "waiting_confirm" | "verifying" | "success" | "failed"

interface OrderInfo {
  order_no: string
  amount: number
  qr_code_url: string
  payment_token: string
  expires_at: string
  instructions: {
    title: string
    steps: string[]
    note: string
  }
}

export function QRPaymentModal({
  open,
  onClose,
  amount,
  description = "命盘智镜 - AI分析服务",
  readingId,
  onSuccess,
}: QRPaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("alipay")
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState("")

  // 倒计时
  useEffect(() => {
    if (status !== "showing_qr" || !orderInfo) return

    const expiresAt = new Date(orderInfo.expires_at).getTime()
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining === 0) {
        setStatus("failed")
        setError("订单已过期，请重新下单")
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [status, orderInfo])

  // 创建订单
  const createOrder = async () => {
    setStatus("loading")
    setError("")

    try {
      const res = await fetch("/api/personal-payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: method === "alipay" ? "CNY_ALIPAY" : "CNY_WECHAT",
          description,
          reading_id: readingId,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "创建订单失败")

      setOrderInfo(data)
      setStatus("showing_qr")
    } catch (err: any) {
      setError(err.message)
      setStatus("failed")
    }
  }

  // 确认支付
  const confirmPayment = async () => {
    if (!orderInfo) return
    setStatus("verifying")

    try {
      // 1. 提交验证
      await fetch("/api/personal-payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_no: orderInfo.order_no,
        }),
      })

      // 2. 轮询订单状态
      let attempts = 0
      const maxAttempts = 30
      const pollInterval = 2000

      const poll = async () => {
        const statusRes = await fetch(`/api/personal-payments/status/${orderInfo.order_no}`)
        const statusData = await statusRes.json()

        if (statusData.status === "paid") {
          setStatus("success")
          onSuccess?.(orderInfo.order_no)
          return
        }

        attempts++
        if (attempts < maxAttempts && statusData.status !== "cancelled") {
          setTimeout(poll, pollInterval)
        } else if (statusData.status === "cancelled") {
          setStatus("failed")
          setError("订单已取消")
        } else {
          setStatus("failed")
          setError("确认超时，请联系客服")
        }
      }

      poll()
    } catch (err: any) {
      setError(err.message)
      setStatus("failed")
    }
  }

  // 复制订单号
  const copyOrderNo = () => {
    if (orderInfo) {
      navigator.clipboard.writeText(orderInfo.order_no)
    }
  }

  // 重新开始
  const reset = () => {
    setStatus("idle")
    setOrderInfo(null)
    setError("")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-glass p-6 max-w-md w-full relative"
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60"
        >
          <X size={20} />
        </button>

        {/* 标题 */}
        <h3 className="text-xl font-serif font-bold text-gold mb-6">
          {status === "success" ? "支付成功" : "扫码支付"}
        </h3>

        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* 金额 */}
              <div className="bg-white/5 rounded-xl p-4 text-center mb-6">
                <p className="text-white/40 text-xs mb-1">支付金额</p>
                <p className="text-3xl font-bold text-gold">¥{amount.toFixed(2)}</p>
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

              {/* 确认按钮 */}
              <button onClick={createOrder} className="btn-gold w-full py-3">
                确认支付 ¥{amount.toFixed(2)}
              </button>
            </motion.div>
          )}

          {status === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <Loader2 size={40} className="animate-spin text-gold mx-auto" />
              <p className="text-white/50 mt-4">创建订单中...</p>
            </motion.div>
          )}

          {status === "showing_qr" && orderInfo && (
            <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* 倒计时 */}
              <div className="flex items-center justify-center gap-2 mb-4 text-white/50">
                <Clock size={14} />
                <span className="text-sm">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                </span>
              </div>

              {/* 收款码 */}
              <div className="bg-white rounded-2xl p-4 mb-4">
                <img
                  src={orderInfo.qr_code_url}
                  alt="收款码"
                  className="w-56 h-56 mx-auto"
                />
              </div>

              {/* 订单号 */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-white/40 text-sm">订单号:</span>
                <span className="text-white/70 text-sm font-mono">{orderInfo.order_no}</span>
                <button onClick={copyOrderNo} className="text-gold hover:text-gold/80">
                  <Copy size={14} />
                </button>
              </div>

              {/* 说明 */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-white/50 text-xs mb-2">{orderInfo.instructions.title}</p>
                <ol className="space-y-1">
                  {orderInfo.instructions.steps.map((step, i) => (
                    <li key={i} className="text-white/40 text-xs">
                      {i + 1}. {step}
                    </li>
                  ))}
                </ol>
                <p className="text-gold/70 text-xs mt-2">{orderInfo.instructions.note}</p>
              </div>

              {/* 确认按钮 */}
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
              <p className="text-white/30 text-xs mt-2">请稍候，正在验证您的付款</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h4 className="text-xl font-bold text-green-400 mb-2">支付成功！</h4>
              <p className="text-white/50 text-sm mb-6">您的订单已确认，报告已解锁</p>
              <button onClick={onClose} className="btn-gold px-8">
                查看报告
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
                  <RefreshCw size={16} />
                  重新支付
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
