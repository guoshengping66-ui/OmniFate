"use client"
import type { Intent } from "@/stores/useWizardStore"
import { useLanguage } from "@/contexts/LanguageContext"

const TIPS: Record<number, { avatar: string; nameKey: string; textKey: string }> = {
  0: { avatar: "🧙", nameKey: "fortuneGuide.wizard", textKey: "fortuneGuide.step0" },
  1: { avatar: "🔮", nameKey: "fortuneGuide.tarotSpirit", textKey: "fortuneGuide.step1" },
  2: { avatar: "👁", nameKey: "fortuneGuide.faceMaster", textKey: "fortuneGuide.step2" },
  3: { avatar: "🌟", nameKey: "fortuneGuide.chart", textKey: "fortuneGuide.step3" },
}

// Intent-specific overrides
const INTENT_TIPS: Partial<Record<Intent, Partial<Record<number, { avatar: string; nameKey: string; textKey: string }>>>> = {
  FULL_MULTIMODAL: {
    1: { avatar: "🔮", nameKey: "fortuneGuide.tarotSpirit", textKey: "fortuneGuide.full.step1" },
  },
  GENERAL_DAILY: {
    1: { avatar: "⚡", nameKey: "fortuneGuide.dailySpirit", textKey: "fortuneGuide.daily.step1" },
    3: { avatar: "🌟", nameKey: "fortuneGuide.chart", textKey: "fortuneGuide.daily.step3" },
  },
  SPECIFIC_EVENT: {
    3: { avatar: "🎯", nameKey: "fortuneGuide.investigator", textKey: "fortuneGuide.event.step3" },
  },
}

interface Props {
  step: number
  intent?: Intent | null
}

export function FortuneGuide({ step, intent }: Props) {
  const { t } = useLanguage()
  // Merge default tips with intent-specific overrides
  const base = TIPS[step]
  const override = intent ? INTENT_TIPS[intent]?.[step] : undefined
  const tip = override ? { ...base, ...override } : base

  return (
    <div
      key={`${step}-${intent}`}
      className="flex items-start gap-3 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 anim-fade-in"
    >
      <div className="text-2xl flex-shrink-0">{tip.avatar}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gold">{t(tip.nameKey)}</span>
          <span className="text-xs text-parchment-400">· {t("fortuneGuide.guideLabel")}</span>
        </div>
        <p className="text-parchment-400 text-xs leading-relaxed">{t(tip.textKey)}</p>
      </div>
    </div>
  )
}
