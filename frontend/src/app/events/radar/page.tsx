"use client"
import { useEffect, useState } from "react"
import { Loader2, AlertTriangle, Shield, TrendingUp, Calendar } from "lucide-react"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

interface RadarDay {
  date: string
  score: number  // 1-10, 10 = most volatile
  events: string[]
  advice: string
  level: "safe" | "caution" | "danger"
}

export default function RadarPage() {
  const [radar, setRadar] = useState<RadarDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Generate mock radar data for now (replace with real API later)
    const days: RadarDay[] = []
    const now = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() + i)
      const score = Math.floor(Math.random() * 10) + 1
      days.push({
        date: date.toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" }),
        score,
        events: score > 7
          ? ["月空时段", "水星刑土星"]
          : score > 4
          ? ["月亮六合木星"]
          : ["能量平稳"],
        advice: score > 7
          ? "高波动期，建议观望或减仓"
          : score > 4
          ? "适合短线操作，注意止盈"
          : "能量平稳，可按计划执行",
        level: score > 7 ? "danger" : score > 4 ? "caution" : "safe",
      })
    }
    setRadar(days)
    setLoading(false)
  }, [])

  const getLevelColor = (level: string) => {
    switch (level) {
      case "danger": return "border-red-500/40 bg-red-500/5"
      case "caution": return "border-yellow-500/40 bg-yellow-500/5"
      default: return "border-green-500/40 bg-green-500/5"
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "danger": return <AlertTriangle size={18} className="text-red-400" />
      case "caution": return <Shield size={18} className="text-yellow-400" />
      default: return <TrendingUp size={18} className="text-green-400" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score > 7) return "text-red-400"
    if (score > 4) return "text-yellow-400"
    return "text-green-400"
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "事件复盘", href: "/events" }, { label: "能量雷达" }]} />

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gold mb-2">能量雷达</h1>
          <p className="text-white/40">未来 7 天星象能量波动预测</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-white/50">平稳</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-white/50">波动</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-white/50">高危</span>
          </div>
        </div>

        {/* Radar Grid */}
        <div className="grid gap-4">
          {radar.map((day, i) => (
            <div key={i} className={`card-glass p-5 border-l-4 ${getLevelColor(day.level)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getLevelIcon(day.level)}
                  <div>
                    <p className="text-white/80 font-medium">{day.date}</p>
                    <p className="text-white/40 text-sm mt-0.5">{day.advice}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getScoreColor(day.score)}`}>
                    {day.score}
                  </p>
                  <p className="text-white/20 text-xs">波动指数</p>
                </div>
              </div>

              {/* Events */}
              <div className="flex flex-wrap gap-2 mt-3">
                {day.events.map((event, j) => (
                  <span key={j} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs">
                    {event}
                  </span>
                ))}
              </div>

              {/* Energy bar */}
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    day.level === "danger"
                      ? "bg-gradient-to-r from-red-500 to-red-400"
                      : day.level === "caution"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                      : "bg-gradient-to-r from-green-500 to-green-400"
                  }`}
                  style={{ width: `${day.score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-white/20 text-xs mt-8">
          能量雷达基于占星学原理生成，仅供参考，不构成投资建议
        </p>
      </div>
    </div>
  )
}
