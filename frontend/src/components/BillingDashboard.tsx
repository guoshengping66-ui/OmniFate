"use client"

import { useCallback, useEffect, useState } from "react"
import { Coins, CreditCard, Loader2, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"

function BalanceCard({ balance }: { balance: number }) {
  const { t } = useLanguage()
  return (
    <div className="card-glow p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
          <Coins size={28} className="text-gold" />
        </div>
        <div>
          <p className="text-white/40 text-xs tracking-wider uppercase mb-1">{t("billing.balance")}</p>
          <p className="text-3xl font-bold text-gold font-serif">{balance.toLocaleString()}</p>
          <p className="text-white/30 text-xs mt-1">{t("billing.balanceDesc")}</p>
        </div>
      </div>
    </div>
  )
}

export function BillingDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)

  const fetchBalance = useCallback(async () => {
    try {
      const { api } = await import("@/lib/api")
      const res = await api.get("/api/credits/balance")
      setBalance(res.data.balance)
    } catch {
      if (user) setBalance(user.stardust_balance || 0)
    }
  }, [user])

  useEffect(() => {
    fetchBalance().finally(() => setLoading(false))
  }, [fetchBalance])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center py-16">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BalanceCard balance={balance} />

      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-gold" />
          <span className="text-white/70 text-sm font-medium">Stripe payments only</span>
        </div>
        <p className="text-white/40 text-xs leading-relaxed mb-4">
          Online payments are processed only through Stripe.
        </p>
        <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
          <div className="flex items-center gap-2 text-gold font-medium">
            <CreditCard size={18} />
            <span>Credit or debit card</span>
          </div>
          <p className="text-white/40 text-xs mt-1">Secure checkout powered by Stripe.</p>
        </div>
      </div>
    </div>
  )
}
