"use client"
import { useState } from "react"
import { Loader2, CheckCircle, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { useUserStore } from "@/stores/useUserStore"
import { DateSelector } from "@/components/reading/DateSelector"
import { ShichenSelector } from "@/components/reading/ShichenSelector"
import { LocationSelector } from "@/components/reading/LocationSelector"
import { motion } from "framer-motion"

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

  const hasData = year > 0 && month > 0 && day > 0

  const handleSubmit = async () => {
    if (!hasData) return
    setLoading(true)
    try {
      await createBirthProfile({
        nickname: "本命",
        gender,
        birth_year: year,
        birth_month: month,
        birth_day: day,
        birth_hour: hour,
        birth_minute: minute,
        birth_city: city,
      })
      toast.success("出生信息已保存！")
    } catch {
      toast.error("保存失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <div className="text-center mb-5">
        <Sparkles size={24} className="text-gold mx-auto mb-2" />
        <h2 className="font-serif text-lg text-gold">完善命理底座</h2>
        <p className="text-white/40 text-sm mt-1">填写出生信息，解锁个性化推命分析</p>
      </div>

      <div className="space-y-4">
        {/* Gender */}
        <div>
          <label className="label">性别</label>
          <div className="flex gap-3">
            {([["female", "女"], ["male", "男"], ["other", "其他"]] as [string, string][]).map(([v, l]) => (
              <label key={v} className="flex-1 cursor-pointer">
                <input type="radio" value={v} checked={gender === v}
                  onChange={() => setGender(v as any)} className="sr-only peer" />
                <div className="text-center py-2 rounded-xl border border-white/20 text-white/60 peer-checked:border-gold peer-checked:text-gold peer-checked:bg-gold/10 hover:border-white/40 transition-all text-sm">{l}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Date */}
        <DateSelector
          year={year}
          month={month}
          day={day}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onDayChange={setDay}
        />

        {/* Time */}
        <ShichenSelector
          value={hour}
          onChange={(h) => { setHour(h); setMinute(0) }}
        />

        {/* City */}
        <LocationSelector
          value={city}
          onChange={setCity}
          placeholder="请输入出生城市（可选）"
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !hasData}
          className="btn-gold w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> 保存中...</>
          ) : (
            <><CheckCircle size={16} /> 保存底座信息</>
          )}
        </button>

        <p className="text-white/25 text-[10px] text-center">
          出生信息将安全加密存储，仅用于命理分析
        </p>
      </div>
    </motion.div>
  )
}
