"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  getLunarMonthDays,
  getLunarMonths,
  lunarToDateStr,
  lunarToSolar,
  solarToDateStr,
  solarToLunar,
} from "@/lib/lunarCalendar"

type CalendarType = "solar" | "lunar"

interface Props {
  year: number
  month: number
  day: number
  onYearChange: (v: number) => void
  onMonthChange: (v: number) => void
  onDayChange: (v: number) => void
  calendarType?: CalendarType
  onCalendarTypeChange?: (type: CalendarType) => void
}

function getSolarDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function DateSelector({
  year,
  month,
  day,
  onYearChange,
  onMonthChange,
  onDayChange,
  calendarType: externalCalendarType,
  onCalendarTypeChange,
}: Props) {
  const { t } = useLanguage()
  const [internalCalendarType, setInternalCalendarType] = useState<CalendarType>("solar")
  const calendarType = externalCalendarType ?? internalCalendarType

  const [lunarYear, setLunarYear] = useState(0)
  const [lunarMonth, setLunarMonth] = useState(0)
  const [lunarDay, setLunarDay] = useState(0)
  const [isLeapMonth, setIsLeapMonth] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i)
  const solarMonths = Array.from({ length: 12 }, (_, i) => i + 1)
  const solarMaxDay = month > 0 && year > 0 ? getSolarDaysInMonth(year, month) : 31
  const solarDays = Array.from({ length: solarMaxDay }, (_, i) => i + 1)
  const lunarMonths = lunarYear > 0 ? getLunarMonths(lunarYear) : []
  const lunarMaxDay = lunarYear > 0 && lunarMonth > 0 ? getLunarMonthDays(lunarYear, lunarMonth, isLeapMonth) : 30
  const lunarDays = Array.from({ length: lunarMaxDay }, (_, i) => i + 1)

  useEffect(() => {
    if (calendarType !== "lunar" || year <= 0 || month <= 0 || day <= 0) return
    const lunar = solarToLunar(year, month, day)
    setLunarYear(lunar.lunarYear)
    setLunarMonth(lunar.lunarMonth)
    setLunarDay(lunar.lunarDay)
    setIsLeapMonth(lunar.isLeapMonth)
  }, [calendarType, day, month, year])

  useEffect(() => {
    if (calendarType !== "solar" || lunarYear <= 0 || lunarMonth <= 0 || lunarDay <= 0) return
    try {
      const solar = lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth)
      onYearChange(solar.year)
      onMonthChange(solar.month)
      onDayChange(solar.day)
    } catch {
      // Ignore invalid lunar dates from edge-case calendar conversions.
    }
  }, [calendarType, isLeapMonth, lunarDay, lunarMonth, lunarYear, onDayChange, onMonthChange, onYearChange])

  const handleCalendarTypeChange = (type: CalendarType) => {
    if (onCalendarTypeChange) onCalendarTypeChange(type)
    else setInternalCalendarType(type)
  }

  const handleSolarYearChange = (nextYear: number) => {
    onYearChange(nextYear)
    if (month > 0 && nextYear > 0) {
      const max = getSolarDaysInMonth(nextYear, month)
      if (day > max) onDayChange(max)
    }
  }

  const handleSolarMonthChange = (nextMonth: number) => {
    onMonthChange(nextMonth)
    if (year > 0 && nextMonth > 0) {
      const max = getSolarDaysInMonth(year, nextMonth)
      if (day > max) onDayChange(max)
    }
  }

  const handleLunarYearChange = (nextYear: number) => {
    setLunarYear(nextYear)
    setLunarMonth(0)
    setLunarDay(0)
    setIsLeapMonth(false)
  }

  const handleLunarMonthChange = (nextMonth: number, leap: boolean) => {
    setLunarMonth(nextMonth)
    setIsLeapMonth(leap)
    setLunarDay(0)
  }

  const handleLunarDayChange = (nextDay: number) => {
    setLunarDay(nextDay)
    if (lunarYear <= 0 || lunarMonth <= 0 || nextDay <= 0) return
    try {
      const solar = lunarToSolar(lunarYear, lunarMonth, nextDay, isLeapMonth)
      onYearChange(solar.year)
      onMonthChange(solar.month)
      onDayChange(solar.day)
    } catch {
      // Ignore invalid lunar dates.
    }
  }

  const correspondingDate =
    calendarType === "lunar" && year > 0 && month > 0 && day > 0
      ? solarToDateStr(year, month, day)
      : calendarType === "solar" && lunarYear > 0 && lunarMonth > 0 && lunarDay > 0
        ? lunarToDateStr(lunarYear, lunarMonth, lunarDay, isLeapMonth)
        : ""
  const correspondingLabel = calendarType === "lunar" ? "Solar" : "Lunar"

  return (
    <div>
      <label className="label">{t("new.birthDate") === "new.birthDate" ? "Birth date" : t("new.birthDate")}</label>

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => handleCalendarTypeChange("solar")}
          className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${
            calendarType === "solar"
              ? "border-gold/40 bg-gold/20 text-gold"
              : "border-white/10 bg-white/5 text-white/40 hover:border-white/20"
          }`}
        >
          Solar
        </button>
        <button
          type="button"
          onClick={() => handleCalendarTypeChange("lunar")}
          className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${
            calendarType === "lunar"
              ? "border-gold/40 bg-gold/20 text-gold"
              : "border-white/10 bg-white/5 text-white/40 hover:border-white/20"
          }`}
        >
          Lunar
        </button>
      </div>

      {calendarType === "solar" && (
        <div className="grid grid-cols-3 gap-3">
          <select value={year || ""} onChange={(e) => handleSolarYearChange(Number(e.target.value))} className="input-field text-sm">
            <option value="" className="bg-[#0f0f1a] text-white">Year</option>
            {years.map((item) => (
              <option key={item} value={item} className="bg-[#0f0f1a] text-white">{item}</option>
            ))}
          </select>

          <select value={month || ""} onChange={(e) => handleSolarMonthChange(Number(e.target.value))} className="input-field text-sm">
            <option value="" className="bg-[#0f0f1a] text-white">Month</option>
            {solarMonths.map((item) => (
              <option key={item} value={item} className="bg-[#0f0f1a] text-white">{item}</option>
            ))}
          </select>

          <select value={day || ""} onChange={(e) => onDayChange(Number(e.target.value))} className="input-field text-sm">
            <option value="" className="bg-[#0f0f1a] text-white">Day</option>
            {solarDays.map((item) => (
              <option key={item} value={item} className="bg-[#0f0f1a] text-white">{item}</option>
            ))}
          </select>
        </div>
      )}

      {calendarType === "lunar" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <select value={lunarYear || ""} onChange={(e) => handleLunarYearChange(Number(e.target.value))} className="input-field text-sm">
              <option value="" className="bg-[#0f0f1a] text-white">Year</option>
              {years.map((item) => (
                <option key={item} value={item} className="bg-[#0f0f1a] text-white">{item}</option>
              ))}
            </select>

            <select
              value={lunarMonth > 0 ? `${lunarMonth}-${isLeapMonth ? "1" : "0"}` : ""}
              onChange={(e) => {
                const [nextMonth, leap] = e.target.value.split("-")
                handleLunarMonthChange(Number(nextMonth), leap === "1")
              }}
              className="input-field text-sm"
            >
              <option value="" className="bg-[#0f0f1a] text-white">Month</option>
              {lunarMonths.map((item) => (
                <option key={`${item.month}-${item.isLeap}`} value={`${item.month}-${item.isLeap ? "1" : "0"}`} className="bg-[#0f0f1a] text-white">
                  {item.name}
                </option>
              ))}
            </select>

            <select value={lunarDay || ""} onChange={(e) => handleLunarDayChange(Number(e.target.value))} className="input-field text-sm">
              <option value="" className="bg-[#0f0f1a] text-white">Day</option>
              {lunarDays.map((item) => (
                <option key={item} value={item} className="bg-[#0f0f1a] text-white">{item}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {correspondingDate && (
        <p className="mt-2 text-center text-[11px] text-white/30">
          Corresponding {correspondingLabel}: {correspondingDate}
        </p>
      )}
    </div>
  )
}
