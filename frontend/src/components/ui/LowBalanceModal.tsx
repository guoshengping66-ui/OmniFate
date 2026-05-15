"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

interface LowBalanceModalProps {
  open: boolean
  onClose: () => void
  required?: number
  current?: number
}

const LOW_BALANCE_MESSAGES = [
  "星辰能量暂不足以支撑此次推演",
  "星尘储备不足，无法完成此次天机推演",
  "宇宙能量尚未充盈，请先注入星尘",
]

export function LowBalanceModal({ open, onClose, required = 0, current = 0 }: LowBalanceModalProps) {
  const message = LOW_BALANCE_MESSAGES[Math.floor(Math.random() * LOW_BALANCE_MESSAGES.length)]

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
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20
                            flex items-center justify-center">
                <Zap size={28} className="text-gold/50" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-center font-serif text-lg text-gold mb-2">
              能量不足
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
              <Link
                href="/pricing"
                onClick={onClose}
                className="w-full btn-gold flex items-center justify-center gap-2 text-sm"
              >
                向星空索取更多能量
                <ArrowRight size={14} />
              </Link>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                稍后再说
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
