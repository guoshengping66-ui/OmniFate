"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Crown, Zap, ArrowRight, Sparkles, HelpCircle, ShieldCheck, Clock, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { subscribe } from "@/lib/api"
import { QRPaymentModal } from "@/components/payment/QRPaymentModal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { PricingCard } from "@/components/pricing/PricingCard"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { TIERS, type Region } from "@/lib/tiers"
import { useRegion } from "@/hooks/useRegion"
import { ServiceTerms } from "@/components/ui/ServiceTerms"
import toast from "react-hot-toast"

// ── Stardust Legend 2x2 Grid ─────────────────────────────────────────────────
const STARDUST_COSTS = [
  { icon: Sparkles, label: "解锁报告", cost: "100", color: "text-gold", bg: "bg-gold/8 border-gold/15" },
  { icon: Clock,     label: "事件复盘", cost: "30",  color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15" },
  { icon: MessageCircle, label: "AI 追问", cost: "10",  color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/15" },
  { icon: ShieldCheck,  label: "能量雷达", cost: "5",   color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
]

// ── FAQ Data ────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "星尘 (Stardust) 是什么？有有效期吗？",
    a: "星尘是命盘智镜的虚拟能量货币，用于解锁各类命理服务。购买的星尘永不过期，但会员每月自动注入的星尘在会员到期后不再续发（已获得的不会收回）。",
  },
  {
    q: "订阅可以随时取消吗？退款政策是怎样的？",
    a: "月度订阅可随时取消，取消后当月权益继续有效至到期。年度订阅在订阅后 7 天内可申请全额退款（需未使用超过 1 次报告）。创始席位为一次性终身购买，不支持退款。",
  },
  {
    q: "创始席位的限量是什么意思？",
    a: "全球限量 100 个创始席位，先到先得。席位售罄后将不再开放购买，现有创始会员享有永久权益，包括每月 500 星尘注入、产品路线图投票权和专属黑金 UI。",
  },
  {
    q: "全维全景报告和免费报告有什么区别？",
    a: "免费报告仅提供基础命盘概览（含部分预览限制）。全维全景报告解锁完整的八字四柱、星盘落宫、十神体系、流年规划等深度分析，并附赠 10 次追问和 3 天会员试用。",
  },
  {
    q: "星尘消耗 8.8 折是什么意思？",
    a: "年度会员在使用星尘时享受 88 折优惠。例如解锁一份报告原价消耗 100 星尘，年度会员仅需 88 星尘。这一优惠自动生效，无需手动操作。",
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { region, switchRegion, isLoaded } = useRegion()
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [founderSoldPercent, setFounderSoldPercent] = useState(67)
  const [showTerms, setShowTerms] = useState(false)

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

  // ── Filter tiers for 3-column grid (Single, Monthly, Yearly) ──
  const singleTier = TIERS.find(t => t.id === "full_report")!
  const monthlyTier = TIERS.find(t => t.id === "premium_monthly")!
  const yearlyTier = TIERS.find(t => t.id === "premium_yearly")!
  const founderTier = TIERS.find(t => t.id === "founder_lifetime")!

  if (!isLoaded) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: "会员方案" }]} />

        {/* ══════════ Header ══════════ */}
        <div className="text-center mb-10">
          <Crown className="text-gold mx-auto mb-3" size={32} />
          <h2 className="section-title text-2xl md:text-3xl">选择适合你的命理方案</h2>
          <p className="text-white/35 text-sm mt-2">
            星尘是窥探天机的能量储备，会员每月可自动获得能量注入
          </p>
        </div>

        {/* ══════════ Region Toggle ══════════ */}
        <div className="flex items-center justify-center mb-10">
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-1">
            {/* Sliding indicator */}
            <motion.div
              className="absolute top-1 bottom-1 rounded-full bg-gold/15 border border-gold/25"
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                left: region === "domestic" ? "4px" : "50%",
                width: "calc(50% - 4px)",
              }}
            />
            <button
              onClick={() => switchRegion("domestic")}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${region === "domestic" ? "text-gold" : "text-white/40 hover:text-white/60"}`}
            >
              国内 (CNY)
            </button>
            <button
              onClick={() => switchRegion("overseas")}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${region === "overseas" ? "text-gold" : "text-white/40 hover:text-white/60"}`}
            >
              海外 (USD)
            </button>
          </div>
        </div>

        {/* ══════════ Main Pricing Grid (3-Column) ══════════ */}
        <div className="grid lg:grid-cols-3 gap-5 items-stretch mb-12">
          {/* Left: Single Report */}
          <PricingCard
            tier={singleTier}
            region={region}
            isNewUser={true}
            onSelect={handleSelect}
          />

          {/* Center: Yearly (Recommended) — taller card */}
          <div className="lg:-mt-3 lg:mb-[-12px]">
            <PricingCard
              tier={yearlyTier}
              region={region}
              onSelect={handleSelect}
            />
          </div>

          {/* Right: Monthly */}
          <PricingCard
            tier={monthlyTier}
            region={region}
            onSelect={handleSelect}
          />
        </div>

        {/* ══════════ Founder Section (Full-Width Premium) ══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-gold/20" />
            <span className="text-gold/40 text-xs tracking-widest uppercase font-medium">Premium</span>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-gold/20" />
          </div>

          <PricingCard
            tier={founderTier}
            region={region}
            founderSoldPercent={founderSoldPercent}
            isFounderCard={true}
            onSelect={handleSelect}
          />
        </motion.div>

        {/* ══════════ Event Retro Callout ══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-glass p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left
                     hover:border-gold/20 transition-all duration-300 hover:-translate-y-1 mb-14"
        >
          <div className="w-12 h-12 rounded-full bg-gold/8 flex items-center justify-center flex-shrink-0">
            <Zap size={20} className="text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-white/80 font-medium">事件复盘 · 按次计费</p>
            <p className="text-white/35 text-sm">
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
        </motion.div>

        {/* ══════════ Stardust Legend (2x2 Grid) ══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-serif font-bold text-white/80">星尘消耗指南</h3>
            <p className="text-white/30 text-xs mt-1">每项服务对应不同的能量消耗</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STARDUST_COSTS.map((item) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border ${item.bg}
                             hover:shadow-lg transition-all duration-300 cursor-default`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5`}>
                    <Icon size={18} className={item.color} />
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-xs mb-1">{item.label}</p>
                    <p className={`text-xl font-bold ${item.color}`}>
                      {item.cost}
                      <span className="text-xs font-normal ml-0.5 opacity-60">✨</span>
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ══════════ FAQ Section ══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <HelpCircle size={18} className="text-gold/40" />
            <h3 className="text-lg font-serif font-bold text-white/80">常见问题</h3>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                question={item.q}
                answer={item.a}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </motion.div>

        {/* ══════════ Founder Community Preview ══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="card-glass p-6 max-w-md mx-auto border-gold/15">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown size={14} className="text-gold/60" />
              <span className="text-gold/60 text-xs tracking-wider uppercase">Founder Community</span>
            </div>
            <p className="text-white/40 text-sm mb-4">
              创始社群专属通道，与志同道合的星使共同探索命运的奥秘
            </p>
            <div className="flex items-center justify-center -space-x-2 mb-3">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-ink bg-gradient-to-br from-gold/40 to-gold/20"
                  style={{ zIndex: 5 - i }}
                />
              ))}
              <div className="w-7 h-7 rounded-full border-2 border-ink bg-white/10 flex items-center justify-center text-[9px] text-white/40 font-bold z-0">
                +{Math.max(0, Math.ceil(founderSoldPercent * 100 / 100) - 5)}
              </div>
            </div>
            <Link
              href="/pricing/founder"
              className="inline-flex items-center gap-2 text-gold/60 text-xs hover:text-gold transition-colors"
            >
              了解创始席位
              <ArrowRight size={12} />
            </Link>
          </div>
        </motion.div>

        {/* ══════════ Footer Legal ══════════ */}
        <p className="text-center text-white/20 text-[11px]">
          订阅即表示您同意我们的{" "}
          <button onClick={() => setShowTerms(true)} className="text-gold/40 hover:text-gold underline">
            服务条款
          </button>
          {" "}和{" "}
          <a href="/refund" className="text-gold/40 hover:text-gold underline">退款政策</a>
          。订阅可随时取消，详见退款政策。
        </p>

        <ServiceTerms open={showTerms} onClose={() => setShowTerms(false)} />
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
    </div>
  )
}
