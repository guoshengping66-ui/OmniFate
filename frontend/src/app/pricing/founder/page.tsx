"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Crown, Users, Star, Shield, Zap, Check } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { QRPaymentModal } from "@/components/payment/QRPaymentModal"

const TOTAL_SEATS = 999

interface FounderStatus {
  total_sold: number
  remaining: number
  is_sold_out: boolean
}

const FEATURES = [
  { icon: Crown, title: "永久全功能访问", desc: "所有功能无限使用，永不过期" },
  { icon: Star, title: "无限星尘额度", desc: "AI 分析不限次数，尽情探索" },
  { icon: Users, title: "产品路线图投票权", desc: "参与决定下一个新功能" },
  { icon: Shield, title: "专属黑金 UI", desc: "独特的黑金配色主题" },
  { icon: Zap, title: "新功能优先体验", desc: "比普通用户提前 7 天" },
  { icon: Star, title: "每年水晶定制", desc: "专属能量水晶 1 次/年" },
]

export default function FounderPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [status, setStatus] = useState<FounderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    api.get("/api/payments/founder/status")
      .then(r => setStatus(r.data))
      .catch(() => setStatus({ total_sold: 0, remaining: TOTAL_SEATS, is_sold_out: false }))
      .finally(() => setLoading(false))
  }, [])

  const handleActivate = async () => {
    if (!user) {
      toast.error("请先登录后再购买")
      router.push("/login")
      return
    }
    setShowPayment(true)
  }

  const handlePaymentSuccess = async () => {
    try {
      await api.post("/api/payments/founder/activate")
      toast.success("创始席位激活成功！")
      await refreshUser()
      router.push("/account")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "激活失败，请重试")
    }
    setShowPayment(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "会员方案", href: "/pricing" }, { label: "创始席位" }]} />

        {/* Hero Section - Black Gold Theme */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-3xl" />
          <div className="relative card-glass p-8 md:p-12 border-gold/30">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
                <Crown size={14} className="text-gold" />
                <span className="text-gold text-sm font-medium">限量 {TOTAL_SEATS} 席</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                <span className="text-gold">创始席位</span>
              </h1>
              <p className="text-white/50 text-lg mb-6 max-w-lg mx-auto">
                永久会员 · 解锁全部功能 · 参与产品共建
              </p>

              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-5xl font-bold text-white">¥999</span>
              </div>
              <p className="text-white/30 text-sm mb-8">一次性付费，永久使用</p>

              {/* Seats remaining */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-white/40 text-sm">已售 {status?.total_sold || 0} 席</span>
                  <span className="text-gold font-bold">{status?.remaining || TOTAL_SEATS} 席剩余</span>
                </div>
                <div className="w-full max-w-xs mx-auto h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-500"
                    style={{ width: `${((TOTAL_SEATS - (status?.remaining || TOTAL_SEATS)) / TOTAL_SEATS) * 100}%` }}
                  />
                </div>
              </div>

              {user?.is_founder ? (
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-6 py-3">
                  <Check size={18} className="text-green-400" />
                  <span className="text-green-400 font-medium">
                    你已是创始会员 #{user.founder_seat_no}
                  </span>
                </div>
              ) : status?.is_sold_out ? (
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-6 py-3">
                  <span className="text-white/40 font-medium">已售罄</span>
                </div>
              ) : (
                <button onClick={handleActivate} className="btn-gold text-lg px-12 py-4">
                  锁定席位
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {FEATURES.map((f, i) => (
            <div key={i} className="card-glass p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                <f.icon size={20} className="text-gold" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">{f.title}</h3>
                <p className="text-white/40 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison with other tiers */}
        <div className="card-glass p-6 mb-8">
          <h2 className="font-serif text-xl text-gold text-center mb-6">对比其他方案</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-white/40 font-medium">功能</th>
                  <th className="text-center py-3 text-white/40 font-medium">月度 ¥49</th>
                  <th className="text-center py-3 text-white/40 font-medium">年度 ¥298</th>
                  <th className="text-center py-3 text-gold font-medium">创始 ¥999</th>
                </tr>
              </thead>
              <tbody className="text-white/60">
                <tr className="border-b border-white/5">
                  <td className="py-3">全维报告</td>
                  <td className="text-center py-3">无限次</td>
                  <td className="text-center py-3">无限次</td>
                  <td className="text-center py-3 text-gold">无限次</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">星尘额度</td>
                  <td className="text-center py-3">500/月</td>
                  <td className="text-center py-3">2000/月</td>
                  <td className="text-center py-3 text-gold">无限</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">有效期</td>
                  <td className="text-center py-3">30天</td>
                  <td className="text-center py-3">365天</td>
                  <td className="text-center py-3 text-gold">永久</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">产品投票权</td>
                  <td className="text-center py-3">-</td>
                  <td className="text-center py-3">-</td>
                  <td className="text-center py-3 text-gold">✓</td>
                </tr>
                <tr>
                  <td className="py-3">黑金 UI</td>
                  <td className="text-center py-3">-</td>
                  <td className="text-center py-3">-</td>
                  <td className="text-center py-3 text-gold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="card-glass p-6">
          <h2 className="font-serif text-xl text-gold text-center mb-6">常见问题</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-1">创始席位是什么？</h3>
              <p className="text-white/40 text-sm">
                创始席位是命盘智镜的限量终身会员，前 999 名用户可以 ¥999 的价格获得永久全功能访问权限。
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">与月度/年度会员有什么区别？</h3>
              <p className="text-white/40 text-sm">
                创始席位是一次性付费，永不过期，且拥有无限星尘额度、产品投票权等专属权益。
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">席位卖完后还会开放吗？</h3>
              <p className="text-white/40 text-sm">
                不会。创始席位限量 999 席，售罄后不再开放。后续可能会推出其他终身会员方案，但价格会更高。
              </p>
            </div>
          </div>
        </div>

        {showPayment && (
          <QRPaymentModal
            open={showPayment}
            onClose={() => setShowPayment(false)}
            tier="founder_lifetime"
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  )
}
