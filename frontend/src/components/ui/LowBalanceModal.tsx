"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, ArrowRight, Crown } from "lucide-react"
import Link from "next/link"

interface LowBalanceModalProps {
  open: boolean
  onClose: () => void
  required?: number
  current?: number
  isFounder?: boolean
}

const LOW_BALANCE_MESSAGES = [
  "星辰能量暂不足以支撑此次推演",
  "星尘储备不足，无法完成此次天机推演",
  "宇宙能量尚未充盈，请先注入星尘",
]

const FOUNDER_MESSAGES = [
  "创始能量暂缓中，请稍后获取补充",
  "星尘能量正在宇宙深处凝聚，敬请稍候",
  "创始人之力暂歇，能量即将重聚",
]

export function LowBalanceModal({ open, onClose, required = 0, current = 0, isFounder = false }: LowBalanceModalProps) {
  const messages = isFounder ? FOUNDER_MESSAGES : LOW_BALANCE_MESSAGES
  const message = messages[Math.floor(Math.random() * messages.length)]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm card-glass p-6 rounded-2xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/30 hover:text-white/60"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full border flex items-center justify-center
                ${isFounder
                  ? "bg-gold/15 border-gold/30"
                  : "bg-gold/10 border-gold/20"
                }`}>
                {isFounder ? (
                  <Crown size={28} className="text-gold" />
                ) : (
                  <Zap size={28} className="text-gold/50" />
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-center font-serif text-lg text-gold mb-2">
              {isFounder ? "能量暂缓" : "能量不足"}
            </h3>

            {/* Message */}
            <p className="text-center text-white/50 text-sm mb-6 leading-relaxed">
              {message}
              {required > 0 && (
                <span className="block mt-2 text-white/30 text-xs">
                  需要 {required} 颗星尘 · 当前 {current} 颗
                </span>
              )}
            </p>

            {/* Actions */}
            <div className="space-y-3">
              {isFounder ? (
                <div className="text-center py-3">
                  <p className="text-gold/60 text-xs">
                    创始会员星尘将于下月自动注入
                  </p>
                </div>
              ) : (
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="w-full btn-gold flex items-center justify-center gap-2 text-sm"
                >
                  向星空索取更多能量
                  <ArrowRight size={14} />
                </Link>
              )}
              <button
                onClick={onClose}
                className="w-full py-2.5 text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                {isFounder ? "稍后重试" : "稍后再说"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
