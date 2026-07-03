"use client"

import { lazy, Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpenCheck, CalendarDays, ChevronRight, Clock, Crown, HelpCircle, LineChart, MessageCircle, ShieldCheck, Sparkles, UserRoundSearch, Zap } from "lucide-react"
import toast from "react-hot-toast"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { ServiceTerms } from "@/components/ui/ServiceTerms"
import { ComplianceNotice } from "@/components/compliance/ComplianceNotice"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/hooks/useRegion"
import { TIERS } from "@/lib/tiers"

const QRPaymentModal = lazy(() => import("@/components/payment/QRPaymentModal").then(m => ({ default: m.QRPaymentModal })))
const PricingCard = lazy(() => import("@/components/pricing/PricingCard").then(m => ({ default: m.PricingCard })))

export default function PricingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { locale, t, localeHref } = useLanguage()
  const { region, isLoaded } = useRegion()
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [founderSoldPercent, setFounderSoldPercent] = useState(67)
  const [showTerms, setShowTerms] = useState(false)

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
        router.push(localeHref("/reading/new"))
        break
      case "premium_monthly":
      case "premium_yearly":
        if (!user) {
          toast.error(t("pricing.loginRequired"))
          router.push(localeHref("/login"))
          return
        }
        setSelectedTier(tierId)
        break
      case "event_retro":
        router.push(localeHref("/events"))
        break
      case "founder_lifetime":
        if (!user) {
          toast.error(t("pricing.purchaseRequired"))
          router.push(localeHref("/login"))
          return
        }
        router.push(localeHref("/pricing/founder"))
        break
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      await refreshUser()
      toast.success(t("pricing.membershipActivated"), { duration: 6000 })
    } catch {
      toast.success(t("pricing.paymentSuccess"), { duration: 6000 })
    }
    setSelectedTier(null)
  }

  const monthlyTier = TIERS.find(tier => tier.id === "premium_monthly")!
  const yearlyTier = TIERS.find(tier => tier.id === "premium_yearly")!
  const founderTier = TIERS.find(tier => tier.id === "founder_lifetime")!

  if (!isLoaded) return null

  const isZh = locale === "zh"
  const eventPrice = region === "domestic" ? "¥19.9" : "$4.99"

  const valueCards = [
    {
      icon: UserRoundSearch,
      title: isZh ? "完整 AI 命运画像" : "Full AI Destiny Profile",
      desc: isZh ? "建立长期人格、决策方式与人生课题基线。" : "Build a long-term baseline for personality, decisions, and life themes.",
    },
    {
      icon: CalendarDays,
      title: isZh ? "每日趋势与今日签" : "Daily Trend + Oracle",
      desc: isZh ? "每天给出趋势、风险提醒和一条可执行行动。" : "Daily trend, risk signal, and one practical action.",
    },
    {
      icon: LineChart,
      title: isZh ? "人生趋势曲线" : "Life Growth Curve",
      desc: isZh ? "把人生 K 线升级成高能期、调整期、转折期判断。" : "Turn the life K-line into phase and timing guidance.",
    },
    {
      icon: BookOpenCheck,
      title: isZh ? "成长复盘档案" : "Growth Reflection Log",
      desc: isZh ? "记录反馈，让 AI 画像持续贴近你的真实状态。" : "Reflection records keep your AI profile adapting to real behavior.",
    },
  ]

  const comparisonRows = [
    { label: t("pricing.tierCompare.feat1"), yearly: "∞", monthly: "∞" },
    { label: t("pricing.tierCompare.feat2"), yearly: isZh ? "5次/月" : "5/mo", monthly: isZh ? "2次/月" : "2/mo" },
    { label: t("pricing.tierCompare.feat3"), yearly: "✓", monthly: "✓" },
    { label: t("pricing.tierCompare.feat4"), yearly: "∞", monthly: "∞" },
    { label: t("pricing.tierCompare.feat5"), yearly: isZh ? "8.8折" : "12% off", monthly: "—" },
    { label: t("pricing.tierCompare.feat6"), yearly: isZh ? "150/月" : "150/mo", monthly: isZh ? "100/月" : "100/mo" },
    { label: t("pricing.tierCompare.feat7"), yearly: "✓", monthly: "—" },
    { label: t("pricing.tierCompare.feat8"), yearly: "✓", monthly: "—" },
  ]

  valueCards.splice(0, valueCards.length, ...[
    {
      icon: UserRoundSearch,
      title: isZh ? "完整五维合参报告" : "Complete five-source report",
      desc: isZh ? "性格结构、事业财富、关系模式、未来窗口与今日行动一次生成。" : "Personality, career, wealth, relationship, future windows, and daily action in one report.",
    },
    {
      icon: CalendarDays,
      title: isZh ? "每日行动中心" : "Daily action center",
      desc: isZh ? "每天给出状态提示、风险提醒和一条可执行行动建议。" : "Daily state signal, caution, and one executable action.",
    },
    {
      icon: LineChart,
      title: isZh ? "未来十年行动地图" : "Ten-year action map",
      desc: isZh ? "以阶段、窗口和建议呈现长期趋势，不做绝对化承诺。" : "Long-term stages, windows, and guidance without absolute promises.",
    },
    {
      icon: BookOpenCheck,
      title: isZh ? "历史报告与持续校准" : "History and calibration",
      desc: isZh ? "保存报告与快问记录，让档案更贴近你的真实状态。" : "Save reports and focus readings so the dossier adapts to your real state.",
    },
  ])

  comparisonRows.splice(0, comparisonRows.length, ...[
    { label: isZh ? "基础性格提示" : "Basic personality preview", yearly: "✓", monthly: "✓" },
    { label: isZh ? "完整五维合参报告" : "Complete five-source report", yearly: "✓", monthly: "✓" },
    { label: isZh ? "单主题快问额度" : "Focus reading quota", yearly: isZh ? "5 次/月" : "5/mo", monthly: isZh ? "2 次/月" : "2/mo" },
    { label: isZh ? "未来窗口与行动地图" : "Future windows and action map", yearly: "✓", monthly: "✓" },
    { label: isZh ? "关系合参优惠" : "Relationship reading benefit", yearly: isZh ? "8.8 折" : "12% off", monthly: "—" },
    { label: isZh ? "星尘额度" : "Stardust credits", yearly: isZh ? "150/月" : "150/mo", monthly: isZh ? "100/月" : "100/mo" },
    { label: isZh ? "历史报告归档" : "Report archive", yearly: "✓", monthly: "—" },
    { label: isZh ? "优先体验新功能" : "Early feature access", yearly: "✓", monthly: "—" },
  ])

  const stardustCosts = [
    { icon: Sparkles, label: t("pricing.unlockReport"), cost: "100", color: "text-gold", bg: "bg-gold/8 border-gold/15" },
    { icon: Clock, label: t("pricing.eventReview"), cost: "30", color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15" },
    { icon: MessageCircle, label: t("pricing.aiQuestion"), cost: "10", color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/15" },
    { icon: ShieldCheck, label: t("pricing.energyRadar"), cost: "5", color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
  ]

  const faqItems = [
    { q: t("pricing.faq1Q"), a: t("pricing.faq1A") },
    { q: t("pricing.faq2Q"), a: t("pricing.faq2A") },
    { q: t("pricing.faq3Q"), a: t("pricing.faq3A") },
    { q: t("pricing.faq4Q"), a: t("pricing.faq4A") },
    { q: t("pricing.faq5Q"), a: t("pricing.faq5A") },
  ]

  return (
    <div className="min-h-screen px-4 pb-16 pt-24">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs items={[{ label: t("pricing.breadcrumb") }]} />

        <ScrollReveal>
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-gold/50">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/30" />
              {t("pricing.breadcrumb")}
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <Crown className="mx-auto mb-3 text-gold" size={28} />
            <h1 className="mb-2 font-serif text-2xl font-bold text-white md:text-4xl">
              {isZh ? "选择适合你的观我分析方式" : "Choose the Guanwo analysis depth that fits you"}
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-parchment-400">
              {isZh ? "从免费探索到完整档案，你可以按自己的问题深度选择。观我提供自我认知和生活决策参考，不承诺结果。" : "From free exploration to a complete dossier, choose by the depth of your question. Guanwo offers self-knowledge and decision support, not guaranteed outcomes."}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="mb-10 grid gap-4 md:grid-cols-4">
            {valueCards.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.07]">
                    <Icon size={18} className="text-gold/75" />
                  </div>
                  <h2 className="mb-1.5 text-sm font-semibold text-parchment-200">{item.title}</h2>
                  <p className="text-xs leading-relaxed text-parchment-400">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <ComplianceNotice className="mx-auto mb-8 max-w-4xl" />
        </ScrollReveal>

        <Suspense fallback={<div className="mb-10 grid gap-5 lg:grid-cols-2">{[1, 2].map(i => <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/[0.03]" />)}</div>}>
          <div className="mx-auto mb-10 grid max-w-4xl items-stretch gap-5 lg:grid-cols-2">
            <div className="lg:-mt-3 lg:mb-[-12px]">
              <PricingCard tier={yearlyTier} region={region} onSelect={handleSelect} />
            </div>
            <PricingCard tier={monthlyTier} region={region} onSelect={handleSelect} />
          </div>
        </Suspense>

        <ScrollReveal delay={0.1}>
          <div className="mb-12 overflow-x-auto">
            <div className="mb-6 text-center">
              <h2 className="font-serif text-lg font-bold text-parchment-200">{t("pricing.tierCompare.title")}</h2>
              <p className="mt-1 text-xs text-parchment-400">{t("pricing.tierCompare.subtitle")}</p>
            </div>
            <div className="min-w-[600px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3 text-left font-medium text-parchment-400">{t("pricing.tierCompare.feature")}</th>
                    <th className="px-2 py-3 text-center font-medium text-gold">
                      {t("tier.premium_yearly.name")}
                      <span className="mt-0.5 block text-xs font-normal text-gold/50">✓ {isZh ? "推荐" : "Recommended"}</span>
                    </th>
                    <th className="px-2 py-3 text-center font-medium text-parchment-400">{t("tier.premium_monthly.name")}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.label} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                      <td className="px-4 py-2.5 text-parchment-400">{row.label}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-gold">{row.yearly}</td>
                      <td className="px-2 py-2.5 text-center text-parchment-400">{row.monthly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-12">
            <div className="mb-5 flex items-center justify-center gap-3">
              <div className="h-px max-w-[80px] flex-1 bg-gradient-to-r from-transparent to-gold/20" />
              <span className="text-xs font-medium uppercase tracking-widest text-gold/40">Lifetime</span>
              <div className="h-px max-w-[80px] flex-1 bg-gradient-to-l from-gold/20 to-transparent" />
            </div>
            <PricingCard
              tier={founderTier}
              region={region}
              founderSoldPercent={founderSoldPercent}
              isFounderCard
              onSelect={handleSelect}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-12">
            <div className="card-solid mb-5 flex items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/20">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold/8">
                <Zap size={18} className="text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-parchment-200">{t("pricing.eventCallout")}</p>
                <p className="text-xs text-parchment-400">{t("pricing.eventDesc").replace("{price}", eventPrice)}</p>
              </div>
              <button onClick={() => handleSelect("event_retro")} className="flex flex-shrink-0 items-center gap-1 text-sm text-gold/60 transition-colors hover:text-gold">
                {t("pricing.learnMore")}
                <ChevronRight size={14} />
              </button>
            </div>

            <div>
              <div className="mb-5 text-center">
                <h2 className="font-serif text-lg font-bold text-parchment-200">{t("pricing.stardustGuide")}</h2>
                <p className="mt-1 text-xs text-parchment-400">{t("pricing.stardustSubtitle")}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stardustCosts.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${item.bg}`}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04]">
                        <Icon size={16} className={item.color} />
                      </div>
                      <div className="text-center">
                        <p className="mb-0.5 text-xs text-parchment-400">{item.label}</p>
                        <p className={`text-lg font-bold ${item.color}`}>
                          {item.cost}
                          <span className="ml-0.5 text-xs font-normal opacity-60">{isZh ? "点" : "pts"}</span>
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mx-auto mb-12 max-w-3xl">
            <div className="mb-6 flex items-center justify-center gap-3">
              <HelpCircle size={18} className="text-gold/40" />
              <h2 className="font-serif text-lg font-bold text-parchment-200">{t("pricing.faq")}</h2>
            </div>
            <div className="space-y-3">
              {faqItems.map((item) => (
                <AccordionItem key={item.q} question={item.q} answer={item.a} defaultOpen={false} />
              ))}
            </div>
          </div>
        </ScrollReveal>

        <p className="text-center text-xs text-parchment-400">
          {t("pricing.legalText")}{" "}
          <button onClick={() => setShowTerms(true)} className="text-gold/40 underline hover:text-gold">
            {t("pricing.termsOfService")}
          </button>
          {" "}{t("pricing.and")}{" "}
          <a href={localeHref("/refund")} className="text-gold/40 underline hover:text-gold">{t("pricing.refundPolicy")}</a>
          。{t("pricing.legalNote")}
        </p>

        <ServiceTerms open={showTerms} onClose={() => setShowTerms(false)} />
      </div>

      {selectedTier && (
        <Suspense fallback={null}>
          <QRPaymentModal
            open={!!selectedTier}
            onClose={() => setSelectedTier(null)}
            tier={selectedTier as "premium_monthly" | "premium_yearly"}
            region={region}
            onSuccess={handlePaymentSuccess}
          />
        </Suspense>
      )}
    </div>
  )
}
