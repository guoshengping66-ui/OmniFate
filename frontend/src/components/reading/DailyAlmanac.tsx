"use client"
import { useState, useCallback, useEffect } from "react"
import {
  Loader2, Sun, RefreshCw, AlertTriangle, Shield,
  Sparkles, ShoppingBag,
} from "lucide-react"
import toast from "react-hot-toast"
import { getDailyAlmanac, DailyAlmanacResponse } from "@/lib/api"
import { ProductCard } from "@/components/reading/ProductCard"
import { useLanguage } from "@/contexts/LanguageContext"
import { translateYiJi, cleanLunarDate } from "@/lib/translations"

interface Props {
  sessionId: string
}

export default function DailyAlmanac({ sessionId }: Props) {
  const { locale, t } = useLanguage()
  const isZh = locale === "zh"
  const [data, setData] = useState<DailyAlmanacResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const fetchAlmanac = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDailyAlmanac(sessionId, locale)
      setData(res)
      setLoaded(true)
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("almanac.loadFail")
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }, [sessionId, locale, t])

  useEffect(() => { fetchAlmanac() }, [fetchAlmanac])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 text-gold text-sm mb-3">
          <Sun size={14} />
          {t("almanac.personal")}
        </div>
      </div>

      {loading && !loaded ? (
        <div className="card-glass p-16 text-center">
          <Loader2 size={32} className="animate-spin text-gold mx-auto mb-4" />
          <p className="text-white/40 text-sm">{t("almanac.loading")}</p>
        </div>
      ) : !data ? (
        <div className="card-glass p-10 text-center">
          <AlertTriangle size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">{t("almanac.fetchFail")}</p>
          <button onClick={fetchAlmanac} className="btn-ghost text-xs mt-4">
            <RefreshCw size={12} /> {t("almanac.retry")}
          </button>
        </div>
      ) : (
        <>
          {/* Date + Energy Score */}
          <div className="card-glass p-8 text-center">
            <p className="text-white/40 text-xs mb-2">
              {new Date(data.date).toLocaleDateString(isZh ? "zh-CN" : "en-US", {
                year: "numeric", month: "long", day: "numeric", weekday: "long",
              })}
            </p>
            <div className="relative inline-flex items-center justify-center mb-3">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52"
                  fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="60" cy="60" r="52"
                  fill="none" stroke="currentColor" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.energy_score / 100) * 327} 327`}
                  className={data.energy_score >= 70 ? "text-gold" : data.energy_score >= 40 ? "text-jade-light" : "text-rose-400"}
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold font-serif ${
                  data.energy_score >= 70 ? "text-gold" : data.energy_score >= 40 ? "text-jade-light" : "text-rose-400"
                }`}>
                  {data.energy_score}
                </span>
                <span className="text-xs text-white/30 mt-0.5">/100</span>
              </div>
            </div>
            <p className="text-white/50 text-xs">{t("almanac.energyScore")}</p>
          </div>

          {/* Yi / Ji / Hu Grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            {/* 宜 */}
            <div className="card-glass p-5 border-t-4 border-jade/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-jade-light font-bold text-lg">{t("almanac.yiLabel")}</span>
                <span className="text-xs text-white/30">{t("almanac.yiPinyin")}</span>
              </div>
              <ul className="space-y-2">
                {data.yi.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-jade-light mt-0.5">✦</span>
                    {isZh ? item : translateYiJi(item)}
                  </li>
                ))}
              </ul>
            </div>

            {/* 忌 */}
            <div className="card-glass p-5 border-t-4 border-rose-400/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-rose-400 font-bold text-lg">{t("almanac.jiLabel")}</span>
                <span className="text-xs text-white/30">{t("almanac.jiPinyin")}</span>
              </div>
              <ul className="space-y-2">
                {data.ji.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-rose-400 mt-0.5">✖</span>
                    {isZh ? item : translateYiJi(item)}
                  </li>
                ))}
              </ul>
            </div>

            {/* 护 — 今日能量守护 */}
            <div className="card-glass p-5 border-t-4 border-gold/40 relative overflow-hidden">
              {/* Ambient glow background */}
              <div className="absolute inset-0 pointer-events-none opacity-30"
                style={{ background: "radial-gradient(ellipse at top right, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />
              <div className="flex items-center gap-2 mb-3 relative">
                <span className="text-gold font-bold text-lg">{t("almanac.huLabel")}</span>
                <span className="text-xs text-white/30">{t("almanac.huDesc")}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-gold/10 border border-gold/20 rounded-full text-gold/60 ml-auto">
                  {t("almanac.huDaily")}
                </span>
              </div>
              {data.hu.length > 0 ? (
                <ul className="space-y-2 relative">
                  {data.hu.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <Shield size={14} className="text-gold mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="text-gold/80">{h.product.name}</span>
                        <br />
                        <span className="text-xs text-white/40">{h.reason}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/30 text-xs relative">{t("almanac.huEmpty")}</p>
              )}
            </div>
          </div>

          {/* Daily Quote */}
          <div className="card-glass p-6 text-center">
            <p className="text-gold/60 text-lg font-serif italic leading-relaxed">
              &ldquo;{data.daily_quote}&rdquo;
            </p>
          </div>

          {/* Zone 3: 每日一物 — Featured product with prominence */}
          {data.hu.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-gold" />
                <h4 className="font-serif text-base font-bold text-gold">{t("almanac.huDaily")} · {t("almanac.huDesc")}</h4>
              </div>
              {/* Featured product (first) — prominent */}
              <div className="mb-4">
                <ProductCard product={data.hu[0].product} />
              </div>
              {/* Rest — compact grid */}
              {data.hu.length > 1 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {data.hu.slice(1).map((h, i) => (
                    <ProductCard key={i} product={h.product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Refresh button */}
          <div className="text-center">
            <button onClick={fetchAlmanac} disabled={loading}
              className="btn-ghost text-xs flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              {t("almanac.refresh")}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
