"use client"
import { useState } from "react"
import { Loader2, CheckCircle, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { useUserStore } from "@/stores/useUserStore"
import { DateSelector } from "@/components/reading/DateSelector"
import { ShichenSelector } from "@/components/reading/ShichenSelector"
import { LocationSelector } from "@/components/reading/LocationSelector"
import { useLanguage } from "@/contexts/LanguageContext"
import type { CalendarType } from "@/lib/lunarCalendar"

export function BirthProfileSetup() {
  const { createBirthProfile } = useUserStore()
  const { t } = useLanguage()
  const [gender, setGender] = useState<"female" | "male" | "other">("female")
  const [year, setYear] = useState(0)
  const [month, setMonth] = useState(0)
  const [day, setDay] = useState(0)
  const [hour, setHour] = useState(0)
  const [minute, setMinute] = useState(0)
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [calendarType, setCalendarType] = useState<CalendarType>("solar")

  const hasData = year > 0 && month > 0 && day > 0

  const handleSubmit = async () => {
    if (!hasData) return
    setLoading(true)
    try {
      await createBirthProfile({
        nickname: t("profile.selfName"),
        gender,
        birth_year: year,
        birth_month: month,
        birth_day: day,
        birth_hour: hour,
        birth_minute: minute,
        birth_city: city,
      })
      toast.success(t("profile.saved"))
    } catch {
      toast.error(t("profile.saveFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-solid p-6 anim-slide-up">
      <div className="text-center mb-5">
        <Sparkles size={24} className="text-gold mx-auto mb-2" />
        <h2 className="font-serif text-lg text-gold">{t("profile.setupTitle")}</h2>
        <p className="text-parchment-400 text-sm mt-1">{t("profile.setupDesc")}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">{t("profile.gender")}</label>
          <div className="flex gap-3">
            {([["female", t("profile.female")], ["male", t("profile.male")], ["other", t("profile.other")]] as [string, string][]).map(([v, l]) => (
              <label key={v} className="flex-1 cursor-pointer">
                <input type="radio" value={v} checked={gender === v}
                  onChange={() => setGender(v as any)} className="sr-only peer" />
                <div className="text-center py-2 rounded-xl border border-white/20 text-parchment-400 peer-checked:border-gold peer-checked:text-gold peer-checked:bg-gold/10 hover:border-white/40 transition-all text-sm">{l}</div>
              </label>
            ))}
          </div>
        </div>

        <DateSelector
          year={year}
          month={month}
          day={day}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onDayChange={setDay}
          calendarType={calendarType}
          onCalendarTypeChange={setCalendarType}
        />

        <ShichenSelector
          value={hour}
          onChange={(h) => { setHour(h); setMinute(0) }}
        />

        <LocationSelector
          value={city}
          onChange={setCity}
          placeholder={t("profile.cityPlaceholder")}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !hasData}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> {t("profile.saving")}</>
          ) : (
            <><CheckCircle size={16} /> {t("profile.save")}</>
          )}
        </button>

        <p className="text-parchment-400 text-xs text-center">
          {t("profile.privacy")}
        </p>
      </div>
    </div>
  )
}
