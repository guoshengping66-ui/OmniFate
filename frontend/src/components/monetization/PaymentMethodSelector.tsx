"use client"
import { useEffect, useState } from "react"
import { CreditCard, Check, ChevronRight } from "lucide-react"
import { getPaymentMethods, PaymentMethod } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

const PaymentIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  "credit-card": ({ size = 20, className }) => (
    <CreditCard size={size} className={className} />
  ),
  alipay: ({ size = 20, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M21.422 15.358c-3.45-1.372-6.236-2.628-6.236-2.628s1.25-3.118 1.736-4.854h-4.29v-1.35h4.872v-1.08h-4.872V4.12h-2.34c-.168 0-.304.136-.304.304V9.42H5.88v1.08h4.536v1.35H6.12v1.08h8.928c-.384 1.296-1.296 2.988-1.296 2.988s-5.016-1.5-9.432.528c0 0-1.584 1.08-.552 2.304 0 0 3.528 3.192 11.448.072 0 0 2.34-1.08 2.34-3.192v-1.08l2.4-.954v-3.252z" />
    </svg>
  ),
  wechat: ({ size = 20, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.18c.94.3 1.96.47 3 .47.17 0 .34 0 .5-.02A5.5 5.5 0 0 1 9.5 14c0-2.76 2.24-5 5-5 .52 0 1.02.08 1.5.23C15.28 6.14 12.66 4 9.5 4zm-2 3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm5 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM22 14c0-2.21-2.69-4-6-4s-6 1.79-6 4 2.69 4 6 4c.71 0 1.39-.08 2.02-.24L20 19l-.58-1.74C20.96 16.38 22 15.27 22 14zm-7.5-.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm3 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
    </svg>
  ),
  paypal: ({ size = 20, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
    </svg>
  ),
}

interface PaymentMethodSelectorProps {
  selected: string
  onSelect: (methodId: string) => void
  className?: string
  /** Filter methods by region: "domestic" = china only, "overseas" = global only */
  region?: "domestic" | "overseas"
}

export function PaymentMethodSelector({ selected, onSelect, className = "", region = "domestic" }: PaymentMethodSelectorProps) {
  const { t } = useLanguage()
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPaymentMethods()
      .then(setMethods)
      .catch(() => {
        setMethods([
          { id: "stripe", name: "银行卡 / 信用卡支付", name_en: "Card payment", icon: "credit-card", category: "china", enabled: true },
          { id: "stripe", name: "Credit or debit card", name_en: "Credit or debit card", icon: "credit-card", category: "global", enabled: true },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter by region: domestic → china methods only, overseas → global methods only
  const chinaMethods = methods.filter(m => m.category === "china" && m.enabled)
  const globalMethods = methods.filter(m => m.category === "global" && m.enabled)
  const visibleMethods = region === "overseas" ? globalMethods : chinaMethods

  // Auto-select first available method if current selection is not in visible list
  useEffect(() => {
    if (visibleMethods.length > 0 && !visibleMethods.some(m => m.id === selected)) {
      onSelect(visibleMethods[0].id)
    }
  }, [visibleMethods, selected, onSelect])

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {visibleMethods.map((method) => (
        <PaymentMethodButton
          key={method.id}
          method={method}
          selected={selected === method.id}
          onClick={() => onSelect(method.id)}
        />
      ))}
    </div>
  )
}

function PaymentMethodButton({
  method,
  selected,
  onClick,
}: {
  method: PaymentMethod
  selected: boolean
  onClick: () => void
}) {
  const { locale } = useLanguage()
  const Icon = PaymentIcons[method.icon] || PaymentIcons["credit-card"]
  const displayName = locale === "zh" ? method.name : (method.name_en || method.name)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
        selected
          ? "bg-gold/10 border-gold/40 shadow-[0_0_20px_rgba(201,168,76,0.1)]"
          : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        selected ? "border-gold bg-gold" : "border-white/20"
      }`}>
        {selected && (
          <Check size={10} className="text-ink anim-scale-in" strokeWidth={3} />
        )}
      </div>
      <Icon size={18} className={selected ? "text-gold" : "text-white/40"} />
      <span className={`text-sm font-medium ${selected ? "text-gold" : "text-white/70"}`}>
        {displayName}
      </span>
      {selected && <ChevronRight size={14} className="text-gold/50 ml-auto" />}
    </button>
  )
}
