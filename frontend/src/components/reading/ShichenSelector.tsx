"use client"

const SHICHEN = [
  { branch: "子", label: "子时", range: "23:00-00:59", hour: 23 },
  { branch: "丑", label: "丑时", range: "01:00-02:59", hour: 1 },
  { branch: "寅", label: "寅时", range: "03:00-04:59", hour: 3 },
  { branch: "卯", label: "卯时", range: "05:00-06:59", hour: 5 },
  { branch: "辰", label: "辰时", range: "07:00-08:59", hour: 7 },
  { branch: "巳", label: "巳时", range: "09:00-10:59", hour: 9 },
  { branch: "午", label: "午时", range: "11:00-12:59", hour: 11 },
  { branch: "未", label: "未时", range: "13:00-14:59", hour: 13 },
  { branch: "申", label: "申时", range: "15:00-16:59", hour: 15 },
  { branch: "酉", label: "酉时", range: "17:00-18:59", hour: 17 },
  { branch: "戌", label: "戌时", range: "19:00-20:59", hour: 19 },
  { branch: "亥", label: "亥时", range: "21:00-22:59", hour: 21 },
]

interface Props {
  value: number
  onChange: (hour: number) => void
}

export function ShichenSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="label">
        出生时辰
        <span className="text-white/30 text-xs ml-2">选择对应的时辰</span>
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {SHICHEN.map(s => {
          const active = s.hour === value
          return (
            <button
              key={s.branch}
              type="button"
              onClick={() => onChange(s.hour)}
              className={`py-2 rounded-xl border text-sm transition-all duration-200
                ${active
                  ? "border-gold bg-gold/15 text-gold shadow-[0_0_12px_rgba(201,168,76,0.3)]"
                  : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/70 hover:bg-white/5"}`}
            >
              <div className="font-bold text-lg leading-tight">{s.branch}</div>
              <div className="text-[10px] opacity-60 leading-tight mt-0.5">{s.range}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
