"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Crown, Check, Users, ArrowLeft, MapPin, Star } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
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
      router.push("/login")
      return
    }

    // Fetch real founder status and seat list
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
      // Step 1: Create founder purchase order
      const orderRes = await api.post("/api/payments/founder/purchase?method=personal")
      const orderNo = orderRes.data.order_no
      setFounderOrderNo(orderNo)
      setShowPayment(true)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "创建订单失败，请稍后重试")
    } finally {
      setActivating(false)
    }
  }

  const handlePaymentSuccess = async () => {
    setShowPayment(false)
    setFounderOrderNo(null)
    toast.success("恭喜！您已成功锁定创始席位")
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
      toast.success("投票成功！感谢您的反馈")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "投票失败")
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
        <Breadcrumbs items={[{ label: "定价", href: "/pricing" }, { label: "创始席位" }]} />

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-4">
            <Crown size={32} className="text-gold" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-3">
            <span className="text-gold">创始席位</span>
            <span className="text-white/80 ml-2">终身会员</span>
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            限量 200 席（国内 100 + 海外 100），锁定永久全功能访问权限，与命盘智镜共同成长
          </p>
        </div>

        {/* Founder status — shows user's own seat */}
        {isFounder && seatNo && (
          <div className="card-glass p-6 mb-8 border-gold/30">
            <div className="flex items-center justify-center gap-4">
              <Crown size={24} className="text-gold" />
              <div>
                <p className="text-gold font-serif text-lg">您已是创始会员</p>
                <p className="text-white/50 text-sm">
                  席位编号: <span className="text-gold font-mono font-bold">#{String(seatNo).padStart(3, "0")}</span>
                  {status?.seat_region && (
                    <span className="ml-2 text-white/30">
                      ({status.seat_region === "domestic" ? "国内" : "海外"})
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
            <h2 className="font-serif text-xl text-gold mb-6">创始席位权益</h2>
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
              <p className="text-white/40 text-sm">一次性终身</p>
              {status && (
                <div className="mt-4">
                  {/* Total progress */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users size={16} className="text-white/50" />
                    <span className="text-white/50 text-sm">
                      已售 {status.sold_seats} / {status.total_seats} 席
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full transition-all"
                      style={{ width: `${(status.sold_seats / status.total_seats) * 100}%` }}
                    />
                  </div>

                  {/* Regional breakdown */}
                  <div className="flex justify-between mt-3 text-[11px]">
                    <span className="text-white/30">
                      <MapPin size={10} className="inline mr-0.5" />
                      国内 {status.domestic_sold}/{status.domestic_total}
                    </span>
                    <span className="text-white/30">
                      <MapPin size={10} className="inline mr-0.5" />
                      海外 {status.overseas_sold}/{status.overseas_total}
                    </span>
                  </div>

                  <p className="text-gold text-sm mt-2 font-semibold">
                    仅剩 {status.remaining_seats} 席
                  </p>
                </div>
              )}
            </div>

            {isFounder ? (
              <div className="text-center py-4">
                <p className="text-white/50 text-sm">您已拥有创始席位</p>
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
                  "锁定席位"
                )}
              </button>
            )}
          </div>
        </div>

        {/* ─── Seat Wall — All occupied seats with numbers ─── */}
        {seats.length > 0 && (
          <div className="card-glass p-6 mt-8">
            <h2 className="font-serif text-xl text-gold mb-2">席位墙</h2>
            <p className="text-white/40 text-sm mb-6">
              每一个席位都是独一无二的编号，象征着与命盘智镜共同成长的承诺
            </p>

            {/* Domestic seats */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-gold/60" />
                <span className="text-white/50 text-xs tracking-wider uppercase">国内席位</span>
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
                      title={seat ? `${seat.name} · #${String(seat.seat_no).padStart(3, "0")}` : `#${String(no).padStart(3, "0")} — 空席`}
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
                <span className="text-white/50 text-xs tracking-wider uppercase">海外席位</span>
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
                      title={seat ? `${seat.name} · #${String(seat.seat_no).padStart(3, "0")}` : `#${String(no).padStart(3, "0")} — 空席`}
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
                <span className="w-2 h-2 rounded-full bg-gold/60" /> 已占
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white/10 border border-white/20" /> 空席
              </span>
              {isFounder && (
                <span className="flex items-center gap-1">
                  <Star size={8} className="text-gold fill-gold" /> 您的席位
                </span>
              )}
            </div>
          </div>
        )}

        {/* Founder voting (only for founders) */}
        {isFounder && (
          <div className="card-glass p-6 mt-8">
            <h2 className="font-serif text-xl text-gold mb-4">产品路线图投票</h2>
            <p className="text-white/40 text-sm mb-6">
              投票选择您最期待的下一个功能，您的声音决定产品方向
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { id: "astro_trading", label: "星座交易信号", desc: "基于星象能量的交易时机建议" },
                { id: "feng_shui_scan", label: "AI 风水扫描", desc: "上传户型图，AI 分析风水格局" },
                { id: "bazi_compatibility", label: "八字合婚", desc: "两人八字深度匹配分析" },
                { id: "mobile_app", label: "原生 App", desc: "iOS/Android 原生应用" },
              ].map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => handleVote(feature.id)}
                  disabled={voting && selectedFeature === feature.id}
                  className="text-left p-4 rounded-xl border border-white/10 hover:border-gold/40 transition-all hover:bg-white/5"
                >
                  <p className="text-white font-medium text-sm">{feature.label}</p>
                  <p className="text-white/40 text-xs mt-1">{feature.desc}</p>
                  {voting && selectedFeature === feature.id && (
                    <Loader2 size={14} className="text-gold animate-spin mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/pricing" className="text-white/40 hover:text-gold text-sm inline-flex items-center gap-1">
            <ArrowLeft size={14} />
            返回定价页
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
          label="创始席位 · 终身会员"
          postAction="founder"
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
