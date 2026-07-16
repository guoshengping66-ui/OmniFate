"use client"

const TIME_PERIODS = [
  { label: "23:00", range: "23:00-00:59", hour: 23 },
  { label: "01:00", range: "01:00-02:59", hour: 1 },
  { label: "03:00", range: "03:00-04:59", hour: 3 },
  { label: "05:00", range: "05:00-06:59", hour: 5 },
  { label: "07:00", range: "07:00-08:59", hour: 7 },
  { label: "09:00", range: "09:00-10:59", hour: 9 },
  { label: "11:00", range: "11:00-12:59", hour: 11 },
  { label: "13:00", range: "13:00-14:59", hour: 13 },
  { label: "15:00", range: "15:00-16:59", hour: 15 },
  { label: "17:00", range: "17:00-18:59", hour: 17 },
  { label: "19:00", range: "19:00-20:59", hour: 19 },
  { label: "21:00", range: "21:00-22:59", hour: 21 },
]

interface Props {
  value: number
  onChange: (hour: number) => void
}

export function ShichenSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="label">
        Birth time
        <span className="ml-2 text-xs text-white/30">Select approximate time period</span>
      </label>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {TIME_PERIODS.map((period) => {
          const active = period.hour === value
          return (
            <button
              key={period.hour}
              type="button"
              onClick={() => onChange(period.hour)}
              className={`rounded-xl border py-2 text-sm transition-all duration-200 ${
                active
                  ? "border-gold bg-gold/15 text-gold shadow-[0_0_12px_rgba(201,168,76,0.3)]"
                  : "border-white/20 text-white/50 hover:border-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <div className="text-lg font-bold leading-tight">{period.label}</div>
              <div className="mt-0.5 text-[10px] leading-tight opacity-60">{period.range}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
