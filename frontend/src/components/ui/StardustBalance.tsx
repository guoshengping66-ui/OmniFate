"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Link } from "@/i18n/navigation"

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
      <span
        key={balance}
        className="text-gold text-xs font-semibold tabular-nums anim-fade-in"
      >
        {balance}
      </span>
      {balance < 5 && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
      )}
    </Link>
  )
}
