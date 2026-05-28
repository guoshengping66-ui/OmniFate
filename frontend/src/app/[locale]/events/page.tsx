"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, CreditCard } from "lucide-react"
import toast from "react-hot-toast"
import { EventInput, type EventFormData } from "@/components/monetization/EventInput"
import { PaymentModal } from "@/components/monetization/PaymentModal"
import { api, payEvent } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

export default function EventsPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { t, localeHref } = useLanguage()
  const [loading, setLoading] = useState(false)

  // Payment modal state
  const [showPayment, setShowPayment] = useState(false)
  const [pendingEventId, setPendingEventId] = useState<string | null>(null)
  const [payLoading, setPayLoading] = useState(false)

  const freeQuota = user?.free_event_quota ?? 0
  const isPremium = !!user?.is_premium

  const handleSubmit = async (form: EventFormData) => {
    setLoading(true)
    try {
      const res = await api.post("/api/readings/analyze-event", {
        event_description: form.description,
        event_datetime: `${form.eventDate}T${form.eventTime}:00`,
        emotion_score: form.emotionScore,
      })
      const eventId = res.data?.event_id || res.data?.id
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
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("events.analysisFail")
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleEventPayment = async (paymentMethod: string = "card") => {
    if (!pendingEventId) return
    setPayLoading(true)
    try {
      const result = await payEvent(pendingEventId, false)
      toast.success(result.message)
      setShowPayment(false)
      router.push(`/events/${pendingEventId}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t("events.payError"))
      throw err // re-throw so PaymentModal resets
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Disclaimer banner */}
        <div className="mb-6 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
          <p className="text-amber-200/70 text-xs leading-relaxed">
            {t("events.disclaimer")}
            <a href={localeHref("/disclaimer")} className="text-gold/60 hover:text-gold ml-1 underline">{t("events.disclaimerDetail")}</a>
          </p>
        </div>

        <div className="text-center mb-10">
          <Sparkles className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold">{t("events.title")}</h1>
          <p className="text-white/40 text-sm mt-1">
            {t("events.desc")}
          </p>
        </div>

        <EventInput
          onSubmit={handleSubmit}
          loading={loading}
          freeQuota={freeQuota}
        />

        {/* Info card */}
        <div className="card-glass p-5 mt-6 text-sm text-white/40 space-y-2">
          <p><strong className="text-white/60">{t("events.whatIs")}</strong></p>
          <p>
            {t("events.explanation")}
          </p>
          <div className="border-t border-white/10 pt-2 mt-2">
            {isPremium ? (
              <p className="text-green-400/60 text-xs">
                {t("events.memberQuota").replace("{count}", String(freeQuota))}
                {user?.subscription_tier === "premium_yearly" ? t("events.yearlyMember") : t("events.monthlyMember")}
              </p>
            ) : (
              <p className="text-gold/60 text-xs">
                {t("events.freeUserNote")}
              </p>
            )}
            <p className="text-white/30 text-xs mt-1">
              {t("events.afterComplete")}
            </p>
          </div>
        </div>
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
      />
    </div>
  )
}
