"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, Loader2, RefreshCw, Sun } from "lucide-react"
import toast from "react-hot-toast"
import { AlmanacCard } from "@/components/almanac/AlmanacCard"
import { useLanguage } from "@/contexts/LanguageContext"
import { getDailyAlmanac, type DailyAlmanacResponse } from "@/lib/api"
import { getCached, setCached } from "@/lib/dailyCache"

interface Props {
  sessionId: string
}

export default function DailyAlmanac({ sessionId }: Props) {
  const { locale, t } = useLanguage()
  const cacheKey = `almanac_full_${locale}_${sessionId}`
  const [data, setData] = useState<DailyAlmanacResponse | null>(() => getCached<DailyAlmanacResponse>(cacheKey))
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(() => Boolean(getCached<DailyAlmanacResponse>(cacheKey)))

  const fetchAlmanac = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDailyAlmanac(sessionId, locale, true)
      setCached(cacheKey, res)
      setData(res)
      setLoaded(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      const detail = axiosErr?.response?.data?.detail ?? t("almanac.loadFail")
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }, [sessionId, locale, t, cacheKey])

  useEffect(() => {
    fetchAlmanac()
  }, [fetchAlmanac])

  if (loading && !loaded) {
    return (
      <div className="card-glass p-10" aria-busy="true">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
          <Loader2 size={24} className="animate-spin text-gold" />
        </div>
        <div className="mx-auto h-4 w-40 rounded bg-white/[0.08]" />
        <div className="mx-auto mt-3 h-3 w-64 max-w-full rounded bg-white/[0.05]" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card-glass p-10 text-center">
        <AlertTriangle size={32} className="mx-auto mb-3 text-white/20" />
        <p className="text-sm text-white/40">{t("almanac.fetchFail")}</p>
        <button onClick={fetchAlmanac} className="btn-ghost mt-4 inline-flex items-center gap-1.5 text-xs">
          <RefreshCw size={12} /> {t("almanac.retry")}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-sm text-gold">
          <Sun size={14} />
          {t("almanac.personal")}
        </div>
        <button
          onClick={fetchAlmanac}
          disabled={loading}
          className="btn-ghost inline-flex items-center gap-1.5 text-xs disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {t("almanac.refresh")}
        </button>
      </div>

      <AlmanacCard data={data} />
    </div>
  )
}
