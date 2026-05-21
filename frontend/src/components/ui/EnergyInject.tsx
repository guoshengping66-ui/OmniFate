"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface EnergyInjectProps {
  show: boolean
  amount: number
  onComplete?: () => void
}

export function EnergyInject({ show, amount, onComplete }: EnergyInjectProps) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Radial glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 2, 3] }}
            transition={{ duration: 1.5 }}
            className="absolute w-32 h-32 rounded-full bg-gold/30 blur-xl"
          />

          {/* Particle burst */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * 360
            const rad = (angle * Math.PI) / 180
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(rad) * 100,
                  y: Math.sin(rad) * 100,
                  opacity: 0,
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute w-2 h-2 bg-gold rounded-full"
              />
            )
          })}

          {/* Center icon + amount */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="relative flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold/40
                          flex items-center justify-center mb-2">
              <Zap size={28} className="text-gold" />
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gold font-bold text-lg"
            >
              {amount > 0 ? `+${amount}` : amount} {t("energyInject.stardust")}
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
