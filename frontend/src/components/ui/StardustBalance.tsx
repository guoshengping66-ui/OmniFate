"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

export function StardustBalance() {
  const { user } = useAuth()
  const { t } = useLanguage()

  if (!user) return null

  const balance = user.stardust_balance ?? 0

  return (
    <Link
      href="/pricing"
      className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
                 bg-gold/10 border border-gold/20 hover:border-gold/40
                 hover:bg-gold/15 transition-all duration-200 group"
    >
      <span className="text-sm">✨</span>
      <motion.span
        key={balance}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gold text-xs font-semibold tabular-nums"
      >
        {balance}
      </motion.span>
      {/* Low balance warning dot */}
      {balance < 5 && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
      )}
    </Link>
  )
}
