"use client"
import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  value: string
  onChange: (q: string) => void
  intent?: string | null
}

const GENERAL_QUESTIONS = [
  { key: "1" as const, icon: "💼" },
  { key: "2" as const, icon: "💕" },
  { key: "3" as const, icon: "💰" },
  { key: "4" as const, icon: "🌟" },
  { key: "5" as const, icon: "🚀" },
  { key: "6" as const, icon: "🏠" },
]

const RELATIONSHIP_QUESTIONS = [
  { key: "RelQ1" as const, icon: "💞" },
  { key: "RelQ2" as const, icon: "🔄" },
  { key: "RelQ3" as const, icon: "💍" },
  { key: "RelQ4" as const, icon: "🧠" },
  { key: "RelQ5" as const, icon: "☯️" },
  { key: "RelQ6" as const, icon: "📅" },
]

export function HotQuestions({ value, onChange, intent }: Props) {
  const { t } = useLanguage()

  const isRelationship = intent === "RELATIONSHIP"
  const questions = isRelationship ? RELATIONSHIP_QUESTIONS : GENERAL_QUESTIONS
  const prefix = isRelationship ? "hotRelQ" : "hotQ"

  return (
    <div>
      <label className="label text-sm text-white/50 mb-3">
        {isRelationship ? t("new.hotQuestionsLabelRel") || t("new.hotQuestionsLabel") : t("new.hotQuestionsLabel")}
      </label>
      <div className="flex flex-wrap gap-2">
        {questions.map(({ key, icon }) => {
          const text = t(`new.${prefix}${key}`)
          const fullText = t(`new.${prefix}${key}Full`)
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
