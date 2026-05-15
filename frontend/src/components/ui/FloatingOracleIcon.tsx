"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export function FloatingOracleIcon() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link
        href="/divination"
        className="relative flex items-center gap-2 px-4 py-2 rounded-full
                   bg-gradient-to-r from-gold/15 to-gold/5
                   border border-gold/25 hover:border-gold/50
                   hover:shadow-[0_0_20px_rgba(201,168,76,0.2)]
                   transition-all duration-300 group"
      >
        {/* Breathing glow */}
        <div className="absolute inset-0 rounded-full bg-gold/10 animate-[pulse_3s_ease-in-out_infinite] pointer-events-none" />

        <div className="relative flex items-center gap-2">
          <Sparkles size={14} className="text-gold group-hover:animate-spin" />
          <span className="text-gold text-xs font-medium">星际抽签</span>
          {/* Free badge */}
          <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 text-[10px] font-bold">
            FREE
          </span>
        </div>
      </Link>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
          >
            <div className="bg-ink/95 backdrop-blur-xl border border-gold/20 rounded-xl px-4 py-2.5
                          shadow-[0_8px_32px_rgba(0,0,0,0.4)] whitespace-nowrap">
              <p className="text-gold text-xs font-medium">今日免费</p>
              <p className="text-white/40 text-[11px] mt-0.5">每日首次免费，感受星辰指引</p>
              {/* Arrow */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-ink/95 border-l border-t border-gold/20 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
