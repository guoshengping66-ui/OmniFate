"use client"
export const dynamic = "force-dynamic"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Sparkles, Clock, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import { EventInput, type EventFormData } from "@/components/monetization/EventInput"
import { PaymentModal } from "@/components/monetization/PaymentModal"
import { payEvent, analyzeEvent } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { STARDUST_COST } from "@/lib/pricing.config"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

export default function EventsPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { t, localeHref } = useLanguage()
  const [loading, setLoading] = useState(false)

  // Payment modal state
  const [showPayment, setShowPayment] = useState(false)
  const [pendingEventId, setPendingEventId] = useState<string | null>(null)

  const freeQuota = user?.free_event_quota ?? 0
  const isPremium = !!user?.is_premium
  const stardustBalance = user?.stardust_balance ?? 0
  const canUseStardust = stardustBalance >= STARDUST_COST.EVENT_RETRO

  const handleSubmit = async (form: EventFormData) => {
    setLoading(true)
    try {
      const res = await analyzeEvent({
        event_description: form.description,
        event_datetime: `${form.eventDate}T${form.eventTime}:00`,
        emotion_score: form.emotionScore,
      })
      const eventId = res.event_id
      if (!eventId) {
        toast.error(t("events.createFail"))
        return
      }

      // If user has free quota or is premium, pay automatically with free quota
      if (freeQuota > 0 && user) {
        try {
          const payResult = await payEvent(eventId, true)
          toast.success(payResult.message)
          refreshUser()
          router.push(`/events/${eventId}`)
        } catch {
          toast.error(t("events.payFail"))
        }
      } else {
        // Non-premium user — show payment modal
        setPendingEventId(eventId)
        setShowPayment(true)
      }
    } catch (error: unknown) {
      const detail = axios.isAxiosError<{ detail?: string }>(error)
        ? error.response?.data?.detail ?? t("events.analysisFail")
        : t("events.analysisFail")
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleEventPayment = async () => {
    if (!pendingEventId) return
    try {
      const result = await payEvent(pendingEventId, false)
      toast.success(result.message)
      setShowPayment(false)
      router.push(localeHref(`/events/${pendingEventId}`))
    } catch (error: unknown) {
      toast.error(axios.isAxiosError<{ detail?: string }>(error) ? error.response?.data?.detail ?? t("events.payError") : t("events.payError"))
      throw error // re-throw so PaymentModal resets
    }
  }

  const handleStardustPayment = async () => {
    if (!pendingEventId) return
    try {
      const result = await payEvent(pendingEventId, false, "stardust")
      toast.success(result.message || t("events.paySuccess"))
      refreshUser()
      setShowPayment(false)
      router.push(localeHref(`/events/${pendingEventId}`))
    } catch (error: unknown) {
      toast.error(axios.isAxiosError<{ detail?: string }>(error) ? error.response?.data?.detail ?? t("events.payError") : t("events.payError"))
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Breadcrumbs items={[{ label: t("nav.events") || t("events.title") }]} />

        {/* Disclaimer banner */}
        <ScrollReveal>
          <div className="mb-6 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
            <p className="text-amber-200/70 text-xs leading-relaxed">
              {t("events.disclaimer")}
              <a href={localeHref("/disclaimer")} className="text-gold/60 hover:text-gold ml-1 underline">{t("events.disclaimerDetail")}</a>
            </p>
          </div>
        </ScrollReveal>

        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("events.title")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <Sparkles className="text-gold mx-auto mb-3" size={28} />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{t("events.title")}</h1>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              {t("events.desc")}
            </p>
          </div>
        </ScrollReveal>

        {/* Event Input Form */}
        <ScrollReveal delay={0.08}>
          <EventInput
            onSubmit={handleSubmit}
            loading={loading}
            freeQuota={freeQuota}
          />
        </ScrollReveal>

        {/* Info card */}
        <ScrollReveal delay={0.12}>
          <div className="card-glass p-5 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-gold/50" />
              <p className="text-white/60 text-xs font-medium">{t("events.whatIs")}</p>
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-3">
              {t("events.explanation")}
            </p>
            <div className="border-t border-white/[0.06] pt-3">
              {isPremium ? (
                <div className="flex items-center gap-2 text-green-400/60 text-xs">
                  <Clock size={12} />
                  <span>
                    {t("events.memberQuota").replace("{count}", String(freeQuota))}
                    {user?.subscription_tier === "premium_yearly" ? t("events.yearlyMember") : t("events.monthlyMember")}
                  </span>
                </div>
              ) : (
                <p className="text-gold/50 text-xs">
                  {t("events.freeUserNote")}
                </p>
              )}
              <p className="text-white/25 text-[11px] mt-2">
                {t("events.afterComplete")}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Payment Modal for non-subscribers */}
      <PaymentModal
        open={showPayment}
        onClose={() => { setShowPayment(false); setPendingEventId(null) }}
        onConfirm={handleEventPayment}
        title={t("events.payTitle")}
        priceDisplay="¥19.9"
        description={t("events.payDesc")}
        perks={[
          t("events.perk1"),
          t("events.perk2"),
          t("events.perk3"),
          t("events.perk4"),
        ]}
        showStardustOption={canUseStardust}
        stardustCost={STARDUST_COST.EVENT_RETRO}
        onStardustPayment={handleStardustPayment}
      />
    </div>
  )
}
