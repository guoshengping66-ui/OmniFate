"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Crown, Globe, Zap, ArrowRight, Info } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { subscribe } from "@/lib/api"
import { QRPaymentModal } from "@/components/payment/QRPaymentModal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { PricingCard } from "@/components/pricing/PricingCard"
import { TIERS, type Region } from "@/lib/tiers"
import { useRegion } from "@/hooks/useRegion"
import toast from "react-hot-toast"

export default function PricingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { region, switchRegion, isLoaded } = useRegion()
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [founderSoldPercent, setFounderSoldPercent] = useState(67)

  // Fetch founder seat status
  useEffect(() => {
    if (!user) return
    import("@/lib/api").then(({ api }) => {
      api.get("/api/payments/founder/status")
        .then(r => {
          const { sold_seats, total_seats } = r.data
          setFounderSoldPercent(Math.round((sold_seats / total_seats) * 100))
        })
        .catch(() => {})
    })
  }, [user])

  const handleSelect = async (tierId: string) => {
    switch (tierId) {
      case "free":
        router.push("/reading/new")
        break
      case "full_report":
        router.push("/reading/new")
        break
      case "premium_monthly":
      case "premium_yearly":
        if (!user) {
          toast.error("请先登录后再订阅")
          router.push("/login")
          return
        }
        setSelectedTier(tierId)
        break
      case "event_retro":
        router.push("/events")
        break
      case "founder_lifetime":
        if (!user) {
          toast.error("请先登录后再购买")
          router.push("/login")
          return
        }
        router.push("/pricing/founder")
        break
    }
  }

  const handlePaymentSuccess = async () => {
    if (!selectedTier) return
    try {
      const subResult = await subscribe(selectedTier)
      toast.success(subResult.message)
      await refreshUser()
    } catch {
      toast.success("支付已提交，会员将在确认后激活")
    }
    setSelectedTier(null)
  }

  // Filter tiers for display
  const displayTiers = TIERS.filter(t => t.id !== "event_retro")
  const eventRetroTier = TIERS.find(t => t.id === "event_retro")

  if (!isLoaded) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: "会员方案" }]} />

        {/* Region tip */}
        <div className="flex items-center justify-center gap-2 mb-6 py-2 px-4 rounded-full bg-white/5 border border-white/10 w-fit mx-auto">
          <Info size={14} className="text-gold/60" />
          <span className="text-white/40 text-xs">
            已根据您的地区为您推荐最佳支付通道
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <Crown className="text-gold mx-auto mb-3" size={32} />
          <h2 className="section-title text-2xl md:text-3xl">选择适合你的命理方案</h2>
          <p className="text-white/40 text-sm mt-2">
            星尘是窥探天机的能量储备，会员每月可自动获得能量注入
          </p>
        </div>

        {/* Region Switcher */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => switchRegion("domestic")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
              ${region === "domestic"
                ? "bg-gold text-ink"
                : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
          >
            <Globe size={14} />
            国内 (CNY)
          </button>
          <button
            onClick={() => switchRegion("overseas")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
              ${region === "overseas"
                ? "bg-gold text-ink"
                : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
          >
            <Globe size={14} />
            海外 (USD)
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch mb-8">
          {displayTiers.map(tier => (
            <PricingCard
              key={tier.id}
              tier={tier}
              region={region}
              founderSoldPercent={tier.id === "founder_lifetime" ? founderSoldPercent : undefined}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Event Retro Callout */}
        {eventRetroTier && (
          <div className="card-glass p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left
                         hover:border-gold/20 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-white/80 font-medium">{eventRetroTier.name} · 按次计费</p>
              <p className="text-white/40 text-sm">
                {region === "domestic" ? "¥19.9/次" : "$4.99/次"} — 针对特定事件的流时溯源诊断，含 AI 因果链分析和能量处方
              </p>
            </div>
            <button
              onClick={() => handleSelect("event_retro")}
              className="btn-gold-outline text-sm whitespace-nowrap flex items-center gap-2"
            >
              了解事件复盘
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Stardust explanation */}
        <div className="mt-10 card-glass p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Zap size={18} className="text-gold" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">什么是星尘 (Stardust)?</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                星尘是窥探天机的能量储备。每次推命报告消耗 100 星尘，事件复盘消耗 50 星尘。
                订阅会员每月自动获得能量注入：月度会员 100 星尘/月，年度会员 1200 星尘/年。
                创始席位享受无限星尘额度，永无能量枯竭之忧。
              </p>
            </div>
          </div>
        </div>

        {/* Payment modal */}
        {selectedTier && (
          <QRPaymentModal
            open={!!selectedTier}
            onClose={() => setSelectedTier(null)}
            tier={selectedTier as "premium_monthly" | "premium_yearly"}
            onSuccess={handlePaymentSuccess}
          />
        )}

        <p className="text-center text-white/25 text-[11px] mt-8">
          订阅即表示您同意我们的{" "}
          <a href="/terms" className="text-gold/50 hover:text-gold underline">服务条款</a>
          {" "}和{" "}
          <a href="/refund" className="text-gold/50 hover:text-gold underline">退款政策</a>
          。订阅可随时取消，详见退款政策。
        </p>
      </div>
    </div>
  )
}
