"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Crown, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { AlmanacCard } from "@/components/almanac/AlmanacCard"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { getDailyAlmanac, listMyReadings, type DailyAlmanacResponse, type ReadingListItem } from "@/lib/api"
import { getCached, setCached } from "@/lib/dailyCache"

export default function AlmanacPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t, locale, localeHref } = useLanguage()
  const cacheKey = `almanac_full_${locale}`
  const [data, setData] = useState<DailyAlmanacResponse | null>(() => getCached<DailyAlmanacResponse>(cacheKey))
  const [loading, setLoading] = useState(() => !getCached<DailyAlmanacResponse>(cacheKey))
  const [noSession, setNoSession] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAlmanac = useCallback(async () => {
    if (authLoading) return
    if (!user?.is_premium) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    setNoSession(false)
    const cached = getCached<DailyAlmanacResponse>(cacheKey)
    if (cached) {
      setData(cached)
      setLoading(false)
    }

    try {
      let readings = getCached<ReadingListItem[]>("readings_list")
      try {
        if (!readings) {
          readings = await listMyReadings()
          if (readings.length > 0) setCached("readings_list", readings)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error("[almanac] listMyReadings failed:", msg)
        setError(t("almanac.loadError") + " (" + msg.slice(0, 80) + ")")
        return
      }

      if (!readings || readings.length === 0) {
        setNoSession(true)
        return
      }

      const sessionId = readings[0].session_id
      try {
        const almanac = await getDailyAlmanac(sessionId, locale, true)
        setCached(cacheKey, almanac)
        setData(almanac)
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string }
        const detail = axiosErr?.response?.data?.detail || axiosErr?.message || "Unknown error"
        console.error("[almanac] daily-almanac API error:", detail)
        setError(detail.slice(0, 200))
        return
      }
    } catch (err: unknown) {
      console.error("[almanac] Unexpected error:", err)
      setError(String(err).slice(0, 200))
    } finally {
      setLoading(false)
    }
  }, [authLoading, user, t, locale, cacheKey])

  useEffect(() => {
    fetchAlmanac()
  }, [fetchAlmanac])

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
          <button onClick={() => router.push(localeHref("/pricing"))} className="btn-gold">
            {t("almanac.viewPlans")}
          </button>
        </div>
      </div>
    )
  }

  if (authLoading || loading) return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-gold" />
        <p className="text-white/40 text-sm">{t("almanac.loading")}</p>
      </div>
    </div>
  )

  if (noSession) return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="card-glass p-10 text-center max-w-md">
        <p className="text-white/50 text-sm mb-4">{t("almanac.needReading")}</p>
        <button onClick={() => router.push(localeHref("/reading/new"))} className="btn-gold">
          {t("almanac.startReading")}
        </button>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="card-glass p-10 text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h3 className="font-serif text-lg text-white/80 mb-2">{t("almanac.loadError")}</h3>
        <p className="text-white/40 text-xs mb-1 break-all">{error}</p>
        <button
          onClick={fetchAlmanac}
          className="btn-gold mt-4 inline-flex items-center gap-2"
        >
          <RefreshCw size={14} />
          {t("almanac.retry")}
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

        {/* Almanac Card */}
        <AlmanacCard data={data} />
      </div>
    </div>
  )
}
