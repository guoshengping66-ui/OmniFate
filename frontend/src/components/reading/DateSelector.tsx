"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  solarToLunar,
  lunarToSolar,
  getLunarMonthDays,
  getLunarMonths,
  getLunarMonthName,
  lunarToDateStr,
  solarToDateStr,
  type LunarDate,
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
  year, month, day,
  onYearChange, onMonthChange, onDayChange,
  calendarType: externalCalendarType,
  onCalendarTypeChange,
}: Props) {
  const { t } = useLanguage()
  const isEn = t("new.year") === "Year"

  // Internal calendar type state (for uncontrolled usage)
  const [internalCalendarType, setInternalCalendarType] = useState<CalendarType>("solar")
  const calendarType = externalCalendarType ?? internalCalendarType

  // Lunar state
  const [lunarYear, setLunarYear] = useState(0)
  const [lunarMonth, setLunarMonth] = useState(0)
  const [lunarDay, setLunarDay] = useState(0)
  const [isLeapMonth, setIsLeapMonth] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i)

  // ── Solar mode ──
  const solarMonths = Array.from({ length: 12 }, (_, i) => i + 1)
  const solarMaxDay = month > 0 && year > 0 ? getSolarDaysInMonth(year, month) : 31
  const solarDays = Array.from({ length: solarMaxDay }, (_, i) => i + 1)

  // ── Lunar mode ──
  const lunarMonths = lunarYear > 0 ? getLunarMonths(lunarYear) : []
  const lunarMaxDay = lunarYear > 0 && lunarMonth > 0 ? getLunarMonthDays(lunarYear, lunarMonth, isLeapMonth) : 30
  const lunarDays = Array.from({ length: lunarMaxDay }, (_, i) => i + 1)

  // ── Sync: solar → lunar when switching to lunar ──
  useEffect(() => {
    if (calendarType === "lunar" && year > 0 && month > 0 && day > 0) {
      const lunar = solarToLunar(year, month, day)
      setLunarYear(lunar.lunarYear)
      setLunarMonth(lunar.lunarMonth)
      setLunarDay(lunar.lunarDay)
      setIsLeapMonth(lunar.isLeapMonth)
    }
  }, [calendarType])

  // ── Sync: lunar → solar when switching to solar ──
  useEffect(() => {
    if (calendarType === "solar" && lunarYear > 0 && lunarMonth > 0 && lunarDay > 0) {
      try {
        const solar = lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth)
        onYearChange(solar.year)
        onMonthChange(solar.month)
        onDayChange(solar.day)
      } catch {
        // Invalid lunar date, ignore
      }
    }
  }, [calendarType])

  // ── Calendar type toggle ──
  const handleCalendarTypeChange = (type: CalendarType) => {
    if (onCalendarTypeChange) {
      onCalendarTypeChange(type)
    } else {
      setInternalCalendarType(type)
    }
  }

  // ── Solar handlers ──
  const handleSolarMonthChange = (m: number) => {
    onMonthChange(m)
    if (year > 0 && m > 0) {
      const max = getSolarDaysInMonth(year, m)
      if (day > max) onDayChange(max)
    }
  }

  const handleSolarYearChange = (y: number) => {
    onYearChange(y)
    if (month > 0 && y > 0) {
      const max = getSolarDaysInMonth(y, month)
      if (day > max) onDayChange(max)
    }
  }

  // ── Lunar handlers ──
  const handleLunarYearChange = (y: number) => {
    setLunarYear(y)
    setLunarMonth(0)
    setLunarDay(0)
    setIsLeapMonth(false)
  }

  const handleLunarMonthChange = (m: number, leap: boolean) => {
    setLunarMonth(m)
    setIsLeapMonth(leap)
    setLunarDay(0)
  }

  const handleLunarDayChange = (d: number) => {
    setLunarDay(d)
    // Convert to solar and update parent
    if (lunarYear > 0 && lunarMonth > 0 && d > 0) {
      try {
        const solar = lunarToSolar(lunarYear, lunarMonth, d, isLeapMonth)
        onYearChange(solar.year)
        onMonthChange(solar.month)
        onDayChange(solar.day)
      } catch {
        // Invalid date
      }
    }
  }

  // ── Corresponding date display ──
  const correspondingDate = calendarType === "lunar" && year > 0 && month > 0 && day > 0
    ? solarToDateStr(year, month, day)
    : calendarType === "solar" && lunarYear > 0 && lunarMonth > 0 && lunarDay > 0
      ? lunarToDateStr(lunarYear, lunarMonth, lunarDay, isLeapMonth)
      : ""

  const correspondingLabel = calendarType === "lunar"
    ? (isEn ? "Solar" : "阳历")
    : (isEn ? "Lunar" : "农历")

  return (
    <div>
      <label className="label">{t("new.birthDate")}</label>

      {/* Calendar type toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => handleCalendarTypeChange("solar")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            calendarType === "solar"
              ? "bg-gold/20 text-gold border border-gold/40"
              : "bg-white/[0.04] text-parchment-400 border border-white/[0.06] hover:border-white/20"
          }`}
        >
          ☀️ {isEn ? "Solar" : "阳历"}
        </button>
        <button
          type="button"
          onClick={() => handleCalendarTypeChange("lunar")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            calendarType === "lunar"
              ? "bg-gold/20 text-gold border border-gold/40"
              : "bg-white/[0.04] text-parchment-400 border border-white/[0.06] hover:border-white/20"
          }`}
        >
          🌙 {isEn ? "Lunar" : "农历"}
        </button>
      </div>

      {/* Solar selectors */}
      {calendarType === "solar" && (
        <div className="grid grid-cols-3 gap-3">
          <select
            value={year || ""}
            onChange={e => handleSolarYearChange(Number(e.target.value))}
            className="input-field text-sm"
          >
            <option value="" className="bg-[#0f0f1a] text-white">{t("new.year")}</option>
            {years.map(y => (
              <option key={y} value={y} className="bg-[#0f0f1a] text-white">{y}{t("new.yearSuffix")}</option>
            ))}
          </select>

          <select
            value={month || ""}
            onChange={e => handleSolarMonthChange(Number(e.target.value))}
            className="input-field text-sm"
          >
            <option value="" className="bg-[#0f0f1a] text-white">{t("new.month")}</option>
            {solarMonths.map(m => (
              <option key={m} value={m} className="bg-[#0f0f1a] text-white">{m}{t("new.monthSuffix")}</option>
            ))}
          </select>

          <select
            value={day || ""}
            onChange={e => onDayChange(Number(e.target.value))}
            className="input-field text-sm"
          >
            <option value="" className="bg-[#0f0f1a] text-white">{t("new.day")}</option>
            {solarDays.map(d => (
              <option key={d} value={d} className="bg-[#0f0f1a] text-white">{d}{t("new.daySuffix")}</option>
            ))}
          </select>
        </div>
      )}

      {/* Lunar selectors */}
      {calendarType === "lunar" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <select
              value={lunarYear || ""}
              onChange={e => handleLunarYearChange(Number(e.target.value))}
              className="input-field text-sm"
            >
              <option value="" className="bg-[#0f0f1a] text-white">{t("new.year")}</option>
              {years.map(y => (
                <option key={y} value={y} className="bg-[#0f0f1a] text-white">{y}{t("new.yearSuffix")}</option>
              ))}
            </select>

            <select
              value={lunarMonth > 0 ? `${lunarMonth}-${isLeapMonth ? "1" : "0"}` : ""}
              onChange={e => {
                const [m, leap] = e.target.value.split("-")
                handleLunarMonthChange(Number(m), leap === "1")
              }}
              className="input-field text-sm"
            >
              <option value="" className="bg-[#0f0f1a] text-white">{t("new.month")}</option>
              {lunarMonths.map(m => (
                <option
                  key={`${m.month}-${m.isLeap}`}
                  value={`${m.month}-${m.isLeap ? "1" : "0"}`}
                  className="bg-[#0f0f1a] text-white"
                >
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={lunarDay || ""}
              onChange={e => handleLunarDayChange(Number(e.target.value))}
              className="input-field text-sm"
            >
              <option value="" className="bg-[#0f0f1a] text-white">{t("new.day")}</option>
              {lunarDays.map(d => (
                <option key={d} value={d} className="bg-[#0f0f1a] text-white">{d}{t("new.daySuffix")}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Corresponding date hint */}
      {correspondingDate && (
        <p className="text-parchment-400 text-xs mt-2 text-center">
          {isEn ? `Corresponding ${correspondingLabel}` : `对应${correspondingLabel}`}：{correspondingDate}
        </p>
      )}
    </div>
  )
}
