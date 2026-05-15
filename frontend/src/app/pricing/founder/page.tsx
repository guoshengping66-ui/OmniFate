"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Crown, Check, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { TIER_MAP } from "@/lib/tiers"

interface FounderStatus {
  total_seats: number
  sold_seats: number
  remaining_seats: number
  is_founder: boolean
  seat_no: number | null
}

export default function FounderPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const [status, setStatus] = useState<FounderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)

  const founderTier = TIER_MAP["founder_lifetime"]

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    api.get("/api/payments/founder/status")
      .then(r => setStatus(r.data))
      .catch(() => setStatus({
        total_seats: 100,
        sold_seats: 0,
        remaining_seats: 100,
        is_founder: user.is_founder || false,
        seat_no: user.founder_seat_no || null,
      }))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const handleActivate = async () => {
    setActivating(true)
    try {
      await api.post("/api/payments/founder/activate")
      toast.success("恭喜！您已成功锁定创始席位")
      await refreshUser()
      const newStatus = await api.get("/api/payments/founder/status").then(r => r.data)
      setStatus(newStatus)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "激活失败，请稍后重试")
    } finally {
      setActivating(false)
    }
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
            限量 100 席，锁定永久全功能访问权限，与命盘智镜共同成长
          </p>
        </div>

        {/* Founder status */}
        {isFounder && seatNo && (
          <div className="card-glass p-6 mb-8 border-gold/30">
            <div className="flex items-center justify-center gap-4">
              <Crown size={24} className="text-gold" />
              <div>
                <p className="text-gold font-serif text-lg">您已是创始会员</p>
                <p className="text-white/50 text-sm">席位编号: #{seatNo}</p>
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
              <p className="text-5xl font-bold text-gold mb-2">¥999</p>
              <p className="text-white/40 text-sm">一次性终身</p>
              {status && (
                <div className="mt-4">
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
                  <p className="text-gold text-sm mt-2">
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
    </div>
  )
}
