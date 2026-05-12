"use client"

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
      <label className="label">出生日期</label>
      <div className="grid grid-cols-3 gap-3">
        <select
          value={year || ""}
          onChange={e => handleYearChange(Number(e.target.value))}
          className="input-field text-sm"
        >
          <option value="" className="bg-[#0f0f1a] text-white">年</option>
          {years.map(y => (
            <option key={y} value={y} className="bg-[#0f0f1a] text-white">{y}年</option>
          ))}
        </select>

        <select
          value={month || ""}
          onChange={e => handleMonthChange(Number(e.target.value))}
          className="input-field text-sm"
        >
          <option value="" className="bg-[#0f0f1a] text-white">月</option>
          {months.map(m => (
            <option key={m} value={m} className="bg-[#0f0f1a] text-white">{m}月</option>
          ))}
        </select>

        <select
          value={day || ""}
          onChange={e => onDayChange(Number(e.target.value))}
          className="input-field text-sm"
        >
          <option value="" className="bg-[#0f0f1a] text-white">日</option>
          {days.map(d => (
            <option key={d} value={d} className="bg-[#0f0f1a] text-white">{d}日</option>
          ))}
        </select>
      </div>
    </div>
  )
}
