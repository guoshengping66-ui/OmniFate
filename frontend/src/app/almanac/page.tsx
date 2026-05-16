"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Crown, Loader2, ShoppingBag } from "lucide-react"
import toast from "react-hot-toast"
import { AlmanacCard } from "@/components/almanac/AlmanacCard"
import { EnergyWaveWarning } from "@/components/almanac/EnergyWaveWarning"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { api, listMyReadings } from "@/lib/api"

interface AlmanacData {
  date: string
  lunar_date: string
  day_score: number
  bazi_day_pillar: string
  yi: { label: string; value: string; score: number }[]
  ji: { label: string; value: string; score: number }[]
  hu: { label: string; value: string; score: number }[]
  energy_wave: {
    current_energy: number
    trend: "rising" | "falling" | "stable"
    warning_message: string
    next_peak: string
    next_trough: string
  }
}

export default function AlmanacPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [data, setData] = useState<AlmanacData | null>(null)
  const [loading, setLoading] = useState(true)
  const [noSession, setNoSession] = useState(false)

  useEffect(() => {
    if (!user?.is_premium) {
      setLoading(false)
      return
    }

    // First get the user's latest reading session to obtain session_id
    listMyReadings()
      .then(readings => {
        if (!readings || readings.length === 0) {
          setNoSession(true)
          setLoading(false)
          return
        }
        // Use the most recent reading's session_id
        const sessionId = readings[0].session_id
        return api.get("/api/readings/daily-almanac", {
          params: { session_id: sessionId },
          timeout: 30_000,
        })
      })
      .then(res => {
        if (res) setData(res.data)
      })
      .catch(() => toast.error(t("almanac.loadError")))
      .finally(() => setLoading(false))
  }, [user])

  // Non-premium gate
  if (!loading && !user?.is_premium) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="card-glass p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
            <Crown size={28} className="text-gold" />
          </div>
          <h2 className="font-serif text-xl text-gold mb-2">{t("almanac.premiumTitle")}</h2>
          <p className="text-white/50 text-sm mb-6">
            {t("almanac.premiumDesc")}
          </p>
          <button onClick={() => router.push("/pricing")} className="btn-gold">
            {t("almanac.viewPlans")}
          </button>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-gold" />
    </div>
  )

  if (noSession) return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="card-glass p-10 text-center max-w-md">
        <p className="text-white/50 text-sm mb-4">{t("almanac.needReading")}</p>
        <button onClick={() => router.push("/reading/new")} className="btn-gold">
          {t("almanac.startReading")}
        </button>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <p className="text-white/40">{t("almanac.noData")}</p>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Sparkles className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold">{t("almanac.title")}</h1>
          <p className="text-white/40 text-sm mt-1">
            {t("almanac.personalTitle")}
          </p>
        </div>

        {/* Energy Wave Warning */}
        {data.energy_wave && (
          <div className="mb-6">
            <EnergyWaveWarning
              currentEnergy={data.energy_wave.current_energy}
              trend={data.energy_wave.trend}
              warningMessage={data.energy_wave.warning_message}
              nextPeak={data.energy_wave.next_peak}
              nextTrough={data.energy_wave.next_trough}
            />
          </div>
        )}

        {/* Almanac Card */}
        <AlmanacCard
          date={data.date}
          lunarDate={data.lunar_date}
          yi={data.yi}
          ji={data.ji}
          hu={data.hu}
          dayScore={data.day_score}
          baziDayPillar={data.bazi_day_pillar}
        />
      </div>
    </div>
  )
}
