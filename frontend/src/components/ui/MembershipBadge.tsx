"use client"
import { Crown, Gem, Star, Sparkles, User } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export type MembershipTier =
  | "free"
  | "trial"
  | "monthly"
  | "yearly"
  | "founder"

interface MembershipBadgeProps {
  tier: MembershipTier
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  className?: string
}

const TIER_CONFIG: Record<MembershipTier, {
  zh: string
  en: string
  colors: string        // text + bg
  borderColor: string
  icon: typeof Crown
}> = {
  free: {
    zh: "免费用户",
    en: "Free",
    colors: "text-white/50 bg-white/5",
    borderColor: "border-white/10",
    icon: User,
  },
  trial: {
    zh: "试用会员",
    en: "Trial",
    colors: "text-blue-400 bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: Sparkles,
  },
  monthly: {
    zh: "月度会员",
    en: "Monthly",
    colors: "text-emerald-400 bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    icon: Star,
  },
  yearly: {
    zh: "年度会员",
    en: "Yearly",
    colors: "text-violet-400 bg-violet-500/10",
    borderColor: "border-violet-500/20",
    icon: Gem,
  },
  founder: {
    zh: "创始人会员",
    en: "Founder",
    colors: "text-gold bg-gold/10",
    borderColor: "border-gold/30",
    icon: Crown,
  },
}

export function getUserTier(user: {
  is_premium?: boolean
  subscription_tier?: string | null
  is_founder?: boolean
}): MembershipTier {
  if (user.is_founder || user.subscription_tier === "founder_lifetime") return "founder"
  if (!user.is_premium) return "free"
  if (user.subscription_tier === "premium_yearly") return "yearly"
  if (user.subscription_tier === "premium_monthly") return "monthly"
  return "trial"
}

export default function MembershipBadge({
  tier,
  size = "sm",
  showIcon = true,
  className = "",
}: MembershipBadgeProps) {
  const { locale } = useLanguage()
  const config = TIER_CONFIG[tier]
  const Icon = config.icon
  const label = locale === "en" ? config.en : config.zh

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  }

  const iconSizes = { sm: 10, md: 12, lg: 14 }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium
        ${config.colors} ${config.borderColor} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {label}
    </span>
  )
}
