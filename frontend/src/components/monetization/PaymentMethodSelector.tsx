"use client"

import { CreditCard, Check, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface PaymentMethodSelectorProps {
  selected: string
  onSelect: (methodId: string) => void
  className?: string
  region?: "domestic" | "overseas"
}

export function PaymentMethodSelector({ selected, onSelect, className = "" }: PaymentMethodSelectorProps) {
  const { locale } = useLanguage()
  const displayName = locale === "zh" ? "银行卡 / 信用卡支付" : "Credit or debit card"
  const isSelected = selected === "stripe"

  return (
    <div className={`space-y-4 ${className}`}>
      <button
        type="button"
        onClick={() => onSelect("stripe")}
        className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
          isSelected
            ? "bg-gold/10 border-gold/40 shadow-[0_0_20px_rgba(201,168,76,0.1)]"
            : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
        }`}
      >
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          isSelected ? "border-gold bg-gold" : "border-white/20"
        }`}>
          {isSelected && <Check size={10} className="text-ink anim-scale-in" strokeWidth={3} />}
        </div>
        <CreditCard size={18} className={isSelected ? "text-gold" : "text-white/40"} />
        <span className={`text-sm font-medium ${isSelected ? "text-gold" : "text-white/70"}`}>
          {displayName}
        </span>
        {isSelected && <ChevronRight size={14} className="text-gold/50 ml-auto" />}
      </button>
    </div>
  )
}
