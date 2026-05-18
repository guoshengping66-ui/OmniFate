"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, ArrowRight, Crown } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

interface LowBalanceModalProps {
  open: boolean
  onClose: () => void
  required?: number
  current?: number
  isFounder?: boolean
}

const LOW_BALANCE_KEYS = [
  "lowBalance.msg1",
  "lowBalance.msg2",
  "lowBalance.msg3",
]

const FOUNDER_BALANCE_KEYS = [
  "lowBalance.founder1",
  "lowBalance.founder2",
  "lowBalance.founder3",
]

export function LowBalanceModal({ open, onClose, required = 0, current = 0, isFounder = false }: LowBalanceModalProps) {
  const { t } = useLanguage()
  const keys = isFounder ? FOUNDER_BALANCE_KEYS : LOW_BALANCE_KEYS
  const message = t(keys[Math.floor(Math.random() * keys.length)])

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
              {isFounder ? t("lowBalance.titleFounder") : t("lowBalance.title")}
            </h3>

            {/* Message */}
            <p className="text-center text-white/50 text-sm mb-6 leading-relaxed">
              {message}
              {required > 0 && (
                <span className="block mt-2 text-white/30 text-xs">
                  {t("lowBalance.need").replace("{required}", String(required)).replace("{current}", String(current))}
                </span>
              )}
            </p>

            {/* Actions */}
            <div className="space-y-3">
              {isFounder ? (
                <div className="text-center py-3">
                  <p className="text-gold/60 text-xs">
                    {t("lowBalance.founderNote")}
                  </p>
                </div>
              ) : (
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="w-full btn-gold flex items-center justify-center gap-2 text-sm"
                >
                  {t("lowBalance.getMore")}
                  <ArrowRight size={14} />
                </Link>
              )}
              <button
                onClick={onClose}
                className="w-full py-2.5 text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                {isFounder ? t("lowBalance.retryLater") : t("lowBalance.later")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
