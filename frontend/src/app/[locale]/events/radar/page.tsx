"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle, Zap, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

interface RadarEvent {
  id: string
  date: string
  event_type: string
  title: string
  description: string
  energy_level: number
  trading_advice: string
  is_dangerous: boolean
}

export default function EventsRadarPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t, localeHref } = useLanguage()
  const [events, setEvents] = useState<RadarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<RadarEvent | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push(localeHref("/login"))
      return
    }

    api.get("/api/events/radar")
      .then(r => setEvents(r.data?.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const getEnergyColor = (level: number) => {
    if (level <= 1) return "text-blue-400"
    if (level <= 2) return "text-green-400"
    if (level <= 3) return "text-yellow-400"
    if (level <= 4) return "text-orange-400"
    return "text-red-400"
  }

  const getEnergyLabel = (level: number) => {
    if (level <= 1) return t("radar.lowEnergy")
    if (level <= 2) return t("radar.stable")
    if (level <= 3) return t("radar.moderate")
    if (level <= 4) return t("radar.highEnergy")
    return t("radar.extreme")
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("radar.breadcrumb") }]} />

        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-gold mb-3">{t("radar.title")}</h1>
          <p className="text-white/50 max-w-md mx-auto">
            {t("radar.desc")}
          </p>
        </div>

        {/* Energy Legend */}
        <div className="card-glass p-4 mb-8">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-white/50">{t("radar.lowEnergy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-white/50">{t("radar.stable")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-white/50">{t("radar.moderate")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-white/50">{t("radar.highEnergy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-white/50">{t("radar.extreme")}</span>
            </div>
          </div>
        </div>

        {/* Events timeline */}
        {events.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <Calendar size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40">{t("radar.noData")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                className={`card-glass p-5 cursor-pointer transition-all hover:border-gold/30 ${
                  selectedEvent?.id === event.id ? "border-gold/40" : ""
                } ${event.is_dangerous ? "border-red-500/30" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      event.is_dangerous ? "bg-red-500/20" : "bg-white/5"
                    }`}>
                      {event.is_dangerous ? (
                        <AlertTriangle size={20} className="text-red-400" />
                      ) : (
                        <Zap size={20} className={getEnergyColor(event.energy_level)} />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-white/40 text-sm mt-1">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                        })}
                        <span className={`ml-2 ${getEnergyColor(event.energy_level)}`}>
                          {getEnergyLabel(event.energy_level)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className={`text-white/30 transition-transform ${
                      selectedEvent?.id === event.id ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {selectedEvent?.id === event.id && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/60 text-sm mb-3">{event.description}</p>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gold text-sm font-medium mb-1">{t("radar.tradingAdvice")}</p>
                      <p className="text-white/50 text-sm">{event.trading_advice}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA for non-premium */}
        {!user.is_premium && (
          <div className="card-glass p-6 mt-8 text-center border-gold/20">
            <p className="text-white/60 mb-4">
              {t("radar.upgradePrompt")}
            </p>
            <Link href="/pricing" className="btn-gold-outline inline-flex items-center gap-2">
              {t("radar.viewBenefits")}
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
