"use client"
import { Calendar, Check, X, Shield } from "lucide-react"

interface AlmanacItem {
  label: string
  value: string
  score: number  // 0-100
}

interface AlmanacCardProps {
  date: string
  lunarDate: string
  yi: AlmanacItem[]   // 宜
  ji: AlmanacItem[]    // 忌
  hu: AlmanacItem[]    // 护 (protection items)
  dayScore: number     // overall day score
  baziDayPillar: string
}

export function AlmanacCard({ date, lunarDate, yi, ji, hu, dayScore, baziDayPillar }: AlmanacCardProps) {
  const scoreColor = dayScore >= 80 ? "text-green-400" : dayScore >= 50 ? "text-gold" : "text-red-400"

  return (
    <div className="card-glass p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gold" />
            <h3 className="font-serif text-lg text-gold">{date}</h3>
          </div>
          <p className="text-white/40 text-xs mt-0.5">{lunarDate} · 日柱: {baziDayPillar}</p>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${scoreColor}`}>{dayScore}</div>
          <p className="text-white/30 text-[10px]">今日能量分</p>
        </div>
      </div>

      {/* Three columns: 宜 / 忌 / 护 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 宜 — Auspicious */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-2">
            <Check size={12} className="text-green-400" />
            <span className="text-xs text-green-400 font-medium">宜</span>
          </div>
          <ul className="space-y-1.5">
            {yi.map((item, i) => (
              <li key={i} className="text-[11px] text-white/60">
                <span className="text-green-400/60">{item.label}</span>
                <span className="text-white/30 ml-1">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 忌 — Inauspicious */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-2">
            <X size={12} className="text-red-400" />
            <span className="text-xs text-red-400 font-medium">忌</span>
          </div>
          <ul className="space-y-1.5">
            {ji.map((item, i) => (
              <li key={i} className="text-[11px] text-white/60">
                <span className="text-red-400/60">{item.label}</span>
                <span className="text-white/30 ml-1">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 护 — Protection */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-2">
            <Shield size={12} className="text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">护</span>
          </div>
          <ul className="space-y-1.5">
            {hu.map((item, i) => (
              <li key={i} className="text-[11px] text-white/60">
                <span className="text-blue-400/60">{item.label}</span>
                <span className="text-white/30 ml-1">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
