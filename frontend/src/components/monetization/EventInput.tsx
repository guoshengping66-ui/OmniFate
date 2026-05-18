"use client"
import { useState } from "react"
import { Calendar, Clock, Smile, Zap } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface EventInputProps {
  onSubmit: (data: EventFormData) => void
  loading?: boolean
  freeQuota?: number
}

export interface EventFormData {
  description: string
  eventDate: string
  eventTime: string
  emotionScore: number
}

export function EventInput({ onSubmit, loading, freeQuota = 0 }: EventInputProps) {
  const { t } = useLanguage()
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("12:00")
  const [emotionScore, setEmotionScore] = useState(5)

  const EMOTION_LABELS: Record<number, string> = {
    1: t("eventInput.emotion1"),
    3: t("eventInput.emotion3"),
    5: t("eventInput.emotion5"),
    7: t("eventInput.emotion7"),
    9: t("eventInput.emotion9"),
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !eventDate) return
    onSubmit({ description, eventDate, eventTime, emotionScore })
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={20} className="text-gold" />
        <h2 className="font-serif text-xl text-gold">{t("eventInput.title")}</h2>
        {freeQuota > 0 && (
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full ml-auto">
            {t("eventInput.freeRemaining").replace("{count}", String(freeQuota))}
          </span>
        )}
      </div>

      <p className="text-white/40 text-sm">
        {t("eventInput.desc")}
        {freeQuota === 0 && (
          <span className="text-gold/80 ml-1">{t("eventInput.price")}</span>
        )}
      </p>

      {/* Event description */}
      <div>
        <label className="label">{t("eventInput.eventDesc")}</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t("eventInput.eventDescPlaceholder")}
          rows={4}
          className="input-field resize-none"
          required
        />
      </div>

      {/* Date & Time */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label flex items-center gap-1">
            <Calendar size={12} /> {t("eventInput.eventDate")}
          </label>
          <input
            type="date"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="label flex items-center gap-1">
            <Clock size={12} /> {t("eventInput.approxTime")}
          </label>
          <input
            type="time"
            value={eventTime}
            onChange={e => setEventTime(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* Emotion score */}
      <div>
        <label className="label flex items-center gap-1">
          <Smile size={12} /> {t("eventInput.emotionLabel")}
        </label>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="range"
            min={1}
            max={9}
            step={2}
            value={emotionScore}
            onChange={e => setEmotionScore(Number(e.target.value))}
            className="flex-1 accent-gold"
          />
          <span className="text-sm text-white/60 min-w-[80px] text-right">
            {emotionScore} · {EMOTION_LABELS[emotionScore] || t("eventInput.emotion5")}
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !description || !eventDate}
        className="btn-gold w-full flex items-center justify-center gap-2 py-3"
      >
        {loading ? (
          <><span className="animate-spin inline-block">⏳</span> {t("eventInput.analyzing")}</>
        ) : (
          <><Zap size={16} /> {freeQuota > 0 ? t("eventInput.freeReview") : t("eventInput.startReview")}</>
        )}
      </button>
    </form>
  )
}
