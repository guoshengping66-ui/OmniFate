"use client"
import { motion } from "framer-motion"
import { Crown } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface FounderBadgeProps {
  seatNo?: number
  size?: "sm" | "md"
}

export function FounderBadge({ seatNo, size = "sm" }: FounderBadgeProps) {
  const { t } = useLanguage()
  const isSmall = size === "sm"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 rounded-full
        bg-gradient-to-r from-violet-500/20 to-purple-500/20
        border border-violet-400/30
        ${isSmall ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}`}
    >
      {/* Purple star glow */}
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400" />
      </span>
      <Crown size={isSmall ? 10 : 12} className="text-violet-300" />
      <span className="text-violet-200 font-medium">
        {t("founderBadge.label")}{seatNo ? ` #${seatNo}` : ""}
      </span>
    </motion.div>
  )
}
