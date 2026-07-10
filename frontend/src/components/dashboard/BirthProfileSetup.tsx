"use client"

import { useState } from "react"
import { CheckCircle, Loader2, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { useUserStore } from "@/stores/useUserStore"
import { DateSelector } from "@/components/reading/DateSelector"
import { ShichenSelector } from "@/components/reading/ShichenSelector"
import { LocationSelector } from "@/components/reading/LocationSelector"
import type { CalendarType } from "@/lib/lunarCalendar"

export function BirthProfileSetup() {
  const { createBirthProfile } = useUserStore()
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
        nickname: "Self",
        gender,
        birth_year: year,
        birth_month: month,
        birth_day: day,
        birth_hour: hour,
        birth_minute: minute,
        birth_city: city,
      })
      toast.success("Profile saved")
    } catch {
      toast.error("Save failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-glass p-6 anim-slide-up">
      <div className="mb-5 text-center">
        <Sparkles size={24} className="mx-auto mb-2 text-gold" />
        <h2 className="font-serif text-lg text-gold">Complete your personal atlas</h2>
        <p className="mt-1 text-sm text-white/40">
          Add birth details to unlock daily action and reports based on your real profile.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Gender</label>
          <div className="flex gap-3">
            {([
              ["female", "Female"],
              ["male", "Male"],
              ["other", "Other"],
            ] as [string, string][]).map(([v, l]) => (
              <label key={v} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value={v}
                  checked={gender === v}
                  onChange={() => setGender(v as "female" | "male" | "other")}
                  className="peer sr-only"
                />
                <div className="rounded-xl border border-white/20 py-2 text-center text-sm text-white/60 transition-all hover:border-white/40 peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-gold">
                  {l}
                </div>
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
          onChange={(h) => {
            setHour(h)
            setMinute(0)
          }}
        />

        <LocationSelector
          value={city}
          onChange={setCity}
          placeholder="Enter city, e.g. Kuala Lumpur"
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !hasData}
          className="btn-gold flex w-full items-center justify-center gap-2 py-3 disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <CheckCircle size={16} /> Save profile
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-white/25">
          Your birth details are used only for personal analysis and action guidance.
        </p>
      </div>
    </div>
  )
}
