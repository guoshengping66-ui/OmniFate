"use client"
import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  value: string
  onChange: (q: string) => void
}

export function HotQuestions({ value, onChange }: Props) {
  const { t } = useLanguage()

  const HOT_QUESTIONS = [
    { key: "1" as const, icon: "💼" },
    { key: "2" as const, icon: "💕" },
    { key: "3" as const, icon: "💰" },
    { key: "4" as const, icon: "🌟" },
    { key: "5" as const, icon: "🚀" },
    { key: "6" as const, icon: "🏠" },
  ]

  return (
    <div>
      <label className="label text-sm text-white/50 mb-3">
        {t("new.hotQuestionsLabel")}
      </label>
      <div className="flex flex-wrap gap-2">
        {HOT_QUESTIONS.map(({ key, icon }) => {
          const text = t(`new.hotQ${key}`)
          const fullText = t(`new.hotQ${key}Full`)
          const selected = value === fullText

          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(fullText)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all
                ${selected
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-white/15 text-white/40 hover:border-white/30 hover:text-white/60 hover:bg-white/5"}`}
            >
              <span>{icon}</span>
              <span>{text}</span>
            </button>
          )
        })}
      </div>
      <p className="text-white/20 text-xs mt-2">{t("new.hotQuestionsHint")}</p>
    </div>
  )
}
