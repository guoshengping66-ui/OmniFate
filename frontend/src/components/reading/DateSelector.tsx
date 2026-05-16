"use client"

import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  year: number
  month: number
  day: number
  onYearChange: (v: number) => void
  onMonthChange: (v: number) => void
  onDayChange: (v: number) => void
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function DateSelector({ year, month, day, onYearChange, onMonthChange, onDayChange }: Props) {
  const { t } = useLanguage()
  const isEn = t("new.year") === "Year"
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const maxDay = month > 0 && year > 0 ? getDaysInMonth(year, month) : 31
  const days = Array.from({ length: maxDay }, (_, i) => i + 1)

  const handleMonthChange = (m: number) => {
    onMonthChange(m)
    if (year > 0 && m > 0) {
      const max = getDaysInMonth(year, m)
      if (day > max) onDayChange(max)
    }
  }

  const handleYearChange = (y: number) => {
    onYearChange(y)
    if (month > 0 && y > 0) {
      const max = getDaysInMonth(y, month)
      if (day > max) onDayChange(max)
    }
  }

  return (
    <div>
      <label className="label">{t("new.birthDate")}</label>
      <div className="grid grid-cols-3 gap-3">
        <select
          value={year || ""}
          onChange={e => handleYearChange(Number(e.target.value))}
          className="input-field text-sm"
        >
          <option value="" className="bg-[#0f0f1a] text-white">{t("new.year")}</option>
          {years.map(y => (
            <option key={y} value={y} className="bg-[#0f0f1a] text-white">{y}{t("new.yearSuffix")}</option>
          ))}
        </select>

        <select
          value={month || ""}
          onChange={e => handleMonthChange(Number(e.target.value))}
          className="input-field text-sm"
        >
          <option value="" className="bg-[#0f0f1a] text-white">{t("new.month")}</option>
          {months.map(m => (
            <option key={m} value={m} className="bg-[#0f0f1a] text-white">{m}{t("new.monthSuffix")}</option>
          ))}
        </select>

        <select
          value={day || ""}
          onChange={e => onDayChange(Number(e.target.value))}
          className="input-field text-sm"
        >
          <option value="" className="bg-[#0f0f1a] text-white">{t("new.day")}</option>
          {days.map(d => (
            <option key={d} value={d} className="bg-[#0f0f1a] text-white">{d}{t("new.daySuffix")}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
