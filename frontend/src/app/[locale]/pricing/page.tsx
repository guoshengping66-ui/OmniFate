"use client"
import { useState, useEffect, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Crown, Zap, ArrowRight, Sparkles, HelpCircle, ShieldCheck, Clock, MessageCircle, ChevronRight, MapPin, Globe } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { TIERS, type Region } from "@/lib/tiers"
import { useRegion } from "@/hooks/useRegion"
import { ServiceTerms } from "@/components/ui/ServiceTerms"
import toast from "react-hot-toast"

const QRPaymentModal = lazy(() => import("@/components/payment/QRPaymentModal").then(m => ({ default: m.QRPaymentModal })))
const PricingCard = lazy(() => import("@/components/pricing/PricingCard").then(m => ({ default: m.PricingCard })))


export default function PricingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { locale, t, localeHref } = useLanguage()
  const { region, switchRegion, isLoaded } = useRegion()
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [founderSoldPercent, setFounderSoldPercent] = useState(67)
  const [showTerms, setShowTerms] = useState(false)

  // ── Stardust Legend 2x2 Grid (uses t()) ──
  const STARDUST_COSTS = [
    { icon: Sparkles, label: t("pricing.unlockReport"), cost: "100", color: "text-gold", bg: "bg-gold/8 border-gold/15" },
    { icon: Clock,     label: t("pricing.eventReview"), cost: "30",  color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15" },
    { icon: MessageCircle, label: t("pricing.aiQuestion"), cost: "10",  color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/15" },
    { icon: ShieldCheck,  label: t("pricing.energyRadar"), cost: "5",   color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
  ]

  // ── FAQ Data (uses t()) ──
  const FAQ_ITEMS = [
    { q: t("pricing.faq1Q"), a: t("pricing.faq1A") },
    { q: t("pricing.faq2Q"), a: t("pricing.faq2A") },
    { q: t("pricing.faq3Q"), a: t("pricing.faq3A") },
    { q: t("pricing.faq4Q"), a: t("pricing.faq4A") },
    { q: t("pricing.faq5Q"), a: t("pricing.faq5A") },
  ]

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
      // Show WeChat group invite after a short delay
      setTimeout(() => {
        toast(
          (t: any) => (
            <div className="text-sm">
              <p className="font-medium text-gold mb-1">{t("pricing.wechatGroupTitle")}</p>
              <p className="text-white/70 text-xs">{t("pricing.wechatGroupDesc")}</p>
              <p className="text-gold text-xs mt-1 font-mono">khan18553325258</p>
            </div>
          ),
          { duration: 10000 }
        )
      }, 1500)
    } catch {
      toast.success(t("pricing.paymentSuccess"), { duration: 6000 })
    }
    setSelectedTier(null)
  }

  // ── Filter tiers for grid (Monthly, Yearly, Founder) ──
  const monthlyTier = TIERS.find(t => t.id === "premium_monthly")!
  const yearlyTier = TIERS.find(t => t.id === "premium_yearly")!
  const founderTier = TIERS.find(t => t.id === "founder_lifetime")!

  if (!isLoaded) return null

  const eventPrice = region === "domestic" ? "¥19.9" : "$4.99"

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: t("pricing.breadcrumb") }]} />

        {/* ══════════ Header ══════════ */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("pricing.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <Crown className="text-gold mx-auto mb-3" size={28} />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{t("pricing.title")}</h2>
            <p className="text-white/35 text-sm max-w-lg mx-auto">
              {t("pricing.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        {/* ══════════ Region Toggle ══════════ */}
        <div className="flex items-center justify-center mb-10">
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-1">
            <div
              className="absolute top-1 bottom-1 rounded-full bg-gold/15 border border-gold/25 transition-all duration-300"
              style={{
                left: region === "domestic" ? "4px" : "50%",
                width: "calc(50% - 4px)",
              }}
            />
            <button
              onClick={() => switchRegion("domestic")}
              className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1.5
                ${region === "domestic" ? "text-gold" : "text-white/40 hover:text-white/60"}`}
            >
              <MapPin size={14} />
              {locale === "zh" ? "国内" : "Domestic"}
            </button>
            <button
              onClick={() => switchRegion("overseas")}
              className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1.5
                ${region === "overseas" ? "text-gold" : "text-white/40 hover:text-white/60"}`}
            >
              <Globe size={14} />
              {locale === "zh" ? "海外" : "Overseas"}
            </button>
          </div>
        </div>

        {/* ══════════ Main Pricing Grid (2-Column) ══════════ */}
        <Suspense fallback={<div className="grid lg:grid-cols-2 gap-5 mb-10">{[1,2].map(i => <div key={i} className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />)}</div>}>
          <div className="grid lg:grid-cols-2 gap-5 items-stretch mb-10 max-w-4xl mx-auto">
            {/* Left: Yearly (Recommended) — taller card */}
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
        </Suspense>

        {/* ══════════ Feature Comparison Table ══════════ */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12 overflow-x-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-serif font-bold text-white/80">{t("pricing.tierCompare.title")}</h3>
              <p className="text-white/30 text-xs mt-1">{t("pricing.tierCompare.subtitle")}</p>
            </div>
            <div className="min-w-[600px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/40 font-medium">{t("pricing.tierCompare.feature")}</th>
                    <th className="text-center py-3 px-2 text-gold font-medium">
                      {t("tier.premium_yearly.name")}
                      <span className="block text-[10px] text-gold/50 font-normal mt-0.5">✓ {locale === "zh" ? "推荐" : "Recommended"}</span>
                    </th>
                    <th className="text-center py-3 px-2 text-white/50 font-medium">{t("tier.premium_monthly.name")}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: t("pricing.tierCompare.feat1"), yearly: "∞", monthly: "∞" },
                    { label: t("pricing.tierCompare.feat2"), yearly: locale === "zh" ? "5次/月" : "5/mo", monthly: locale === "zh" ? "2次/月" : "2/mo" },
                    { label: t("pricing.tierCompare.feat3"), yearly: "✓", monthly: "✓" },
                    { label: t("pricing.tierCompare.feat4"), yearly: "∞", monthly: "∞" },
                    { label: t("pricing.tierCompare.feat5"), yearly: locale === "zh" ? "8.8折" : "12% off", monthly: "—" },
                    { label: t("pricing.tierCompare.feat6"), yearly: locale === "zh" ? "150/月" : "150/mo", monthly: locale === "zh" ? "100/月" : "100/mo" },
                    { label: t("pricing.tierCompare.feat7"), yearly: "✓", monthly: "—" },
                    { label: t("pricing.tierCompare.feat8"), yearly: "✓", monthly: "—" },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                      <td className="py-2.5 px-4 text-white/50">{row.label}</td>
                      <td className="py-2.5 px-2 text-center text-gold font-medium">{row.yearly}</td>
                      <td className="py-2.5 px-2 text-center text-white/40">{row.monthly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════ Channel Comparison (一键分析 vs 完整分析) ══════════ */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12">
            <div className="text-center mb-6">
              <h3 className="text-lg font-serif font-bold text-white/80">{t("pricing.channel.title")}</h3>
              <p className="text-white/30 text-xs mt-1">{t("pricing.channel.subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* ⚡ 一键分析 */}
              <div className="relative card-glass p-5 border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-blue-500/40 to-purple-500/40" />
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                      {t("pricing.channel.quick.badge")}
                    </span>
                    <h4 className="text-white/90 font-serif font-bold text-base mt-1">{t("pricing.channel.quick.name")}</h4>
                  </div>
                </div>
                <p className="text-blue-400/80 text-sm font-medium mb-2">{t("pricing.channel.quick.tagline")}</p>
                <p className="text-white/40 text-xs mb-3 leading-relaxed">{t("pricing.channel.quick.audience")}</p>
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                  <p className="text-white/50 text-[11px] leading-relaxed">{t("pricing.channel.quick.tech")}</p>
                </div>
              </div>

              {/* 🔱 完整分析 */}
              <div className="relative card-glass p-5 border-gold/20 hover:border-gold/30 transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-gold/40 to-amber-500/40" />
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">🔱</span>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/25">
                      {t("pricing.channel.full.badge")}
                    </span>
                    <h4 className="text-white/90 font-serif font-bold text-base mt-1">{t("pricing.channel.full.name")}</h4>
                  </div>
                </div>
                <p className="text-gold/80 text-sm font-medium mb-2">{t("pricing.channel.full.tagline")}</p>
                <p className="text-white/40 text-xs mb-3 leading-relaxed">{t("pricing.channel.full.audience")}</p>
                <div className="bg-gold/5 border border-gold/15 rounded-xl p-3">
                  <p className="text-white/50 text-[11px] leading-relaxed">{t("pricing.channel.full.tech")}</p>
                </div>
              </div>
            </div>

            {/* Shared price tag */}
            <div className="text-center mt-4">
              <span className="text-white/30 text-xs">{t("pricing.channel.price")}：</span>
              <span className="text-gold text-sm font-medium">{t("pricing.channel.priceValue")}</span>
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════ Founder Section (Full-Width Premium) ══════════ */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12">
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
          </div>
        </ScrollReveal>

        {/* ══════════ Event Retro + Stardust (merged compact section) ══════════ */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12">
            {/* Event Retro — compact inline link */}
            <div className="card-glass p-4 flex items-center gap-4 mb-5 hover:border-gold/20 transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-full bg-gold/8 flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 font-medium text-sm">{t("pricing.eventCallout")}</p>
                <p className="text-white/35 text-xs">
                  {t("pricing.eventDesc").replace("{price}", eventPrice)}
                </p>
              </div>
              <button
                onClick={() => handleSelect("event_retro")}
                className="flex items-center gap-1 text-gold/60 text-sm hover:text-gold transition-colors flex-shrink-0"
              >
                {t("pricing.learnMore")}
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Stardust Legend */}
            <div>
              <div className="text-center mb-5">
                <h3 className="text-lg font-serif font-bold text-white/80">{t("pricing.stardustGuide")}</h3>
                <p className="text-white/30 text-xs mt-1">{t("pricing.stardustSubtitle")}</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STARDUST_COSTS.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${item.bg}
                                 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.03] transition-all duration-300 cursor-default`}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5">
                        <Icon size={16} className={item.color} />
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 text-[11px] mb-0.5">{item.label}</p>
                        <p className={`text-lg font-bold ${item.color}`}>
                          {item.cost}
                          <span className="text-xs font-normal ml-0.5 opacity-60">✨</span>
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════ FAQ Section ══════════ */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <HelpCircle size={18} className="text-gold/40" />
              <h3 className="text-lg font-serif font-bold text-white/80">{t("pricing.faq")}</h3>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem
                  key={i}
                  question={item.q}
                  answer={item.a}
                  defaultOpen={false}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════ Footer Legal ══════════ */}
        <p className="text-center text-white/20 text-[11px]">
          {t("pricing.legalText")}{" "}
          <button onClick={() => setShowTerms(true)} className="text-gold/40 hover:text-gold underline">
            {t("pricing.termsOfService")}
          </button>
          {" "}{t("pricing.and")}{" "}
          <a href={localeHref("/refund")} className="text-gold/40 hover:text-gold underline">{t("pricing.refundPolicy")}</a>
          。{t("pricing.legalNote")}
        </p>

        <ServiceTerms open={showTerms} onClose={() => setShowTerms(false)} />
      </div>

      {/* Payment modal */}
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
