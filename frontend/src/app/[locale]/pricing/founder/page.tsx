"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Crown, Check, Users, ArrowLeft, MapPin, Star } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { TIER_MAP } from "@/lib/tiers"
import { QRPaymentModal } from "@/components/payment/QRPaymentModal"

interface FounderStatus {
  total_seats: number
  sold_seats: number
  remaining_seats: number
  domestic_total: number
  domestic_sold: number
  overseas_total: number
  overseas_sold: number
  is_founder: boolean
  seat_no: number | null
  seat_region: string | null
}

interface SeatInfo {
  seat_no: number
  region: string
  name: string
  activated_at: string | null
}

export default function FounderPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const { t, localeHref } = useLanguage()
  const [status, setStatus] = useState<FounderStatus | null>(null)
  const [seats, setSeats] = useState<SeatInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)

  const founderTier = TIER_MAP["founder_lifetime"]

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push(localeHref("/login"))
      return
    }

    Promise.all([
      api.get("/api/payments/founder/status").then(r => r.data).catch(() => null),
      api.get("/api/payments/founder/seats").then(r => r.data?.seats || []).catch(() => []),
    ])
      .then(([statusData, seatData]) => {
        if (statusData) {
          setStatus(statusData)
        } else {
          setStatus({
            total_seats: 200,
            sold_seats: 0,
            remaining_seats: 200,
            domestic_total: 100,
            domestic_sold: 0,
            overseas_total: 100,
            overseas_sold: 0,
            is_founder: user.is_founder || false,
            seat_no: user.founder_seat_no || null,
            seat_region: null,
          })
        }
        setSeats(seatData)
      })
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const [founderOrderNo, setFounderOrderNo] = useState<string | null>(null)

  const handleActivate = async () => {
    setActivating(true)
    try {
      const orderRes = await api.post("/api/payments/founder/purchase?method=personal")
      const orderNo = orderRes.data.order_no
      setFounderOrderNo(orderNo)
      setShowPayment(true)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("founder.pricing.createOrderFail"))
    } finally {
      setActivating(false)
    }
  }

  const handlePaymentSuccess = async () => {
    setShowPayment(false)
    setFounderOrderNo(null)
    toast.success(t("founder.pricing.orderSuccess"))
    await refreshUser()
    const [newStatus, newSeats] = await Promise.all([
      api.get("/api/payments/founder/status").then(r => r.data),
      api.get("/api/payments/founder/seats").then(r => r.data?.seats || []),
    ])
    setStatus(newStatus)
    setSeats(newSeats)
  }

  const handleVote = async (featureId: string) => {
    setVoting(true)
    setSelectedFeature(featureId)
    try {
      await api.post("/api/payments/founder/vote", { feature_id: featureId })
      toast.success(t("founder.pricing.voteSuccess"))
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("founder.pricing.voteFail"))
    } finally {
      setVoting(false)
      setSelectedFeature(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const isFounder = user.is_founder
  const seatNo = user.founder_seat_no

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("pricing.breadcrumb"), href: localeHref("/pricing") }, { label: t("founder.pricing.title") }]} />

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-4">
            <Crown size={32} className="text-gold" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-3">
            <span className="text-gold">{t("founder.pricing.title")}</span>
            <span className="text-white/80 ml-2">{t("founder.pricing.subtitle")}</span>
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            {t("founder.pricing.desc")}
          </p>
        </div>

        {/* Founder status */}
        {isFounder && seatNo && (
          <div className="card-glass p-6 mb-8 border-gold/30">
            <div className="flex items-center justify-center gap-4">
              <Crown size={24} className="text-gold" />
              <div>
                <p className="text-gold font-serif text-lg">{t("founder.pricing.yourSeat")}</p>
                <p className="text-white/50 text-sm">
                  {t("founder.pricing.seatNo")}<span className="text-gold font-mono font-bold">#{String(seatNo).padStart(3, "0")}</span>
                  {status?.seat_region && (
                    <span className="ml-2 text-white/30">
                      ({status.seat_region === "domestic" ? t("founder.pricing.domestic") : t("founder.pricing.overseas")})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing card */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Benefits */}
          <div className="card-glass p-6">
            <h2 className="font-serif text-xl text-gold mb-6">{t("founder.pricing.benefits")}</h2>
            <div className="space-y-4">
              {founderTier?.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={18} className="text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-white/70 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase */}
          <div className="card-glass p-6 border-gold/20">
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-gold mb-2">¥1,288</p>
              <p className="text-white/40 text-sm">{t("founder.pricing.oneTime")}</p>
              {status && (
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users size={16} className="text-white/50" />
                    <span className="text-white/50 text-sm">
                      {t("founder.pricing.sold").replace("{sold}", String(status.sold_seats)).replace("{total}", String(status.total_seats))}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full transition-all"
                      style={{ width: `${(status.sold_seats / status.total_seats) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-3 text-[11px]">
                    <span className="text-white/30">
                      <MapPin size={10} className="inline mr-0.5" />
                      {t("founder.pricing.domestic")} {status.domestic_sold}/{status.domestic_total}
                    </span>
                    <span className="text-white/30">
                      <MapPin size={10} className="inline mr-0.5" />
                      {t("founder.pricing.overseas")} {status.overseas_sold}/{status.overseas_total}
                    </span>
                  </div>

                  <p className="text-gold text-sm mt-2 font-semibold">
                    {t("founder.pricing.remaining").replace("{count}", String(status.remaining_seats))}
                  </p>
                </div>
              )}
            </div>

            {isFounder ? (
              <div className="text-center py-4">
                <p className="text-white/50 text-sm">{t("founder.pricing.youOwn")}</p>
              </div>
            ) : (
              <button
                onClick={handleActivate}
                disabled={activating || (status?.remaining_seats ?? 0) <= 0}
                className="w-full btn-gold flex items-center justify-center gap-2"
              >
                {activating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  t("founder.pricing.lockSeat")
                )}
              </button>
            )}
          </div>
        </div>

        {/* Seat Wall */}
        {seats.length > 0 && (
          <div className="card-glass p-6 mt-8">
            <h2 className="font-serif text-xl text-gold mb-2">{t("founder.pricing.seatWall")}</h2>
            <p className="text-white/40 text-sm mb-6">
              {t("founder.pricing.seatWallDesc")}
            </p>

            {/* Domestic seats */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-gold/60" />
                <span className="text-white/50 text-xs tracking-wider uppercase">{t("founder.pricing.domesticSeats")}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 100 }, (_, i) => i + 1).map(no => {
                  const seat = seats.find(s => s.seat_no === no)
                  const isOccupied = !!seat
                  const isUserSeat = seatNo === no
                  return (
                    <div
                      key={no}
                      className={`
                        relative flex items-center justify-center rounded-lg py-2 text-xs font-mono
                        transition-all duration-200
                        ${isUserSeat
                          ? "bg-gold/20 border-2 border-gold text-gold font-bold shadow-[0_0_12px_rgba(201,168,76,0.3)]"
                          : isOccupied
                            ? "bg-white/5 border border-white/10 text-white/40"
                            : "bg-transparent border border-white/[0.03] text-white/10"
                        }
                      `}
                      title={seat ? `${seat.name} · #${String(seat.seat_no).padStart(3, "0")}` : `#${String(no).padStart(3, "0")}`}
                    >
                      <span className="font-mono">{String(no).padStart(3, "0")}</span>
                      {isOccupied && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold/60" />
                      )}
                      {isUserSeat && (
                        <Star size={8} className="absolute -top-1 -left-1 text-gold fill-gold" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Overseas seats */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-gold/60" />
                <span className="text-white/50 text-xs tracking-wider uppercase">{t("founder.pricing.overseasSeats")}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 100 }, (_, i) => i + 101).map(no => {
                  const seat = seats.find(s => s.seat_no === no)
                  const isOccupied = !!seat
                  const isUserSeat = seatNo === no
                  return (
                    <div
                      key={no}
                      className={`
                        relative flex items-center justify-center rounded-lg py-2 text-xs font-mono
                        transition-all duration-200
                        ${isUserSeat
                          ? "bg-gold/20 border-2 border-gold text-gold font-bold shadow-[0_0_12px_rgba(201,168,76,0.3)]"
                          : isOccupied
                            ? "bg-white/5 border border-white/10 text-white/40"
                            : "bg-transparent border border-white/[0.03] text-white/10"
                        }
                      `}
                      title={seat ? `${seat.name} · #${String(seat.seat_no).padStart(3, "0")}` : `#${String(no).padStart(3, "0")}`}
                    >
                      <span className="font-mono">{String(no).padStart(3, "0")}</span>
                      {isOccupied && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold/60" />
                      )}
                      {isUserSeat && (
                        <Star size={8} className="absolute -top-1 -left-1 text-gold fill-gold" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-[10px] text-white/30">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gold/60" /> {t("founder.pricing.occupied")}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white/10 border border-white/20" /> {t("founder.pricing.vacant")}
              </span>
              {isFounder && (
                <span className="flex items-center gap-1">
                  <Star size={8} className="text-gold fill-gold" /> {t("founder.pricing.yourSeatLabel")}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Founder voting */}
        {isFounder && (
          <div className="card-glass p-6 mt-8">
            <h2 className="font-serif text-xl text-gold mb-4">{t("founder.pricing.roadmapVote")}</h2>
            <p className="text-white/40 text-sm mb-6">
              {t("founder.pricing.roadmapVoteDesc")}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { id: "astro_trading", labelKey: "founder.vote.astro_trading", descKey: "founder.vote.astro_trading_desc" },
                { id: "feng_shui_scan", labelKey: "founder.vote.feng_shui_scan", descKey: "founder.vote.feng_shui_scan_desc" },
                { id: "bazi_compatibility", labelKey: "founder.vote.bazi_compatibility", descKey: "founder.vote.bazi_compatibility_desc" },
                { id: "mobile_app", labelKey: "founder.vote.mobile_app", descKey: "founder.vote.mobile_app_desc" },
              ].map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => handleVote(feature.id)}
                  disabled={voting && selectedFeature === feature.id}
                  className="text-left p-4 rounded-xl border border-white/10 hover:border-gold/40 transition-all hover:bg-white/5"
                >
                  <p className="text-white font-medium text-sm">{t(feature.labelKey)}</p>
                  <p className="text-white/40 text-xs mt-1">{t(feature.descKey)}</p>
                  {voting && selectedFeature === feature.id && (
                    <Loader2 size={14} className="text-gold animate-spin mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href={localeHref("/pricing")} className="text-white/40 hover:text-gold text-sm inline-flex items-center gap-1">
            <ArrowLeft size={14} />
            {t("founder.pricing.backToPricing")}
          </Link>
        </div>
      </div>

      {/* Founder QR Payment Modal */}
      {showPayment && founderOrderNo && (
        <QRPaymentModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          orderNo={founderOrderNo}
          amount={1288}
          label={t("founder.pricing.founderSeat")}
          postAction="founder"
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
