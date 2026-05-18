"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Crown, Zap, ArrowRight, Sparkles, HelpCircle, ShieldCheck, Clock, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { QRPaymentModal } from "@/components/payment/QRPaymentModal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { PricingCard } from "@/components/pricing/PricingCard"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { TIERS, type Region } from "@/lib/tiers"
import { useRegion } from "@/hooks/useRegion"
import { ServiceTerms } from "@/components/ui/ServiceTerms"
import toast from "react-hot-toast"


export default function PricingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { locale, t } = useLanguage()
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
      case "full_report":
        router.push("/reading/new")
        break
      case "premium_monthly":
      case "premium_yearly":
        if (!user) {
          toast.error(t("pricing.loginRequired"))
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
          toast.error(t("pricing.purchaseRequired"))
          router.push("/login")
          return
        }
        router.push("/pricing/founder")
        break
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      await refreshUser()
      toast.success(t("pricing.membershipActivated"))
    } catch {
      toast.success(t("pricing.paymentSuccess"))
    }
    setSelectedTier(null)
  }

  // ── Filter tiers for 3-column grid (Single, Monthly, Yearly) ──
  const singleTier = TIERS.find(t => t.id === "full_report")!
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
        <div className="text-center mb-10">
          <Crown className="text-gold mx-auto mb-3" size={32} />
          <h2 className="section-title text-2xl md:text-3xl">{t("pricing.title")}</h2>
          <p className="text-white/35 text-sm mt-2">
            {t("pricing.subtitle")}
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
              {t("pricing.regionDomestic")}
            </button>
            <button
              onClick={() => switchRegion("overseas")}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${region === "overseas" ? "text-gold" : "text-white/40 hover:text-white/60"}`}
            >
              {t("pricing.regionOverseas")}
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

        {/* ══════════ Channel Comparison (一键推命 vs 完整推命) ══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="mb-14"
        >
          <div className="text-center mb-8">
            <h3 className="text-lg font-serif font-bold text-white/80">{t("pricing.channel.title")}</h3>
            <p className="text-white/30 text-xs mt-1">{t("pricing.channel.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* ⚡ 一键推命 */}
            <div className="relative card-glass p-6 border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-500/40 to-purple-500/40" />
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚡</span>
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                    {t("pricing.channel.quick.badge")}
                  </span>
                  <h4 className="text-white/90 font-serif font-bold text-lg mt-1">{t("pricing.channel.quick.name")}</h4>
                </div>
              </div>
              <p className="text-blue-400/80 text-sm font-medium mb-3">{t("pricing.channel.quick.tagline")}</p>
              <p className="text-white/40 text-xs mb-4 leading-relaxed">{t("pricing.channel.quick.audience")}</p>
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 mb-3">
                <p className="text-white/50 text-[11px] leading-relaxed">{t("pricing.channel.quick.tech")}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400/60 text-xs mt-0.5">▸</span>
                <p className="text-white/35 text-[11px] leading-relaxed">{t("pricing.channel.quick.output")}</p>
              </div>
            </div>

            {/* 🔱 完整推命 */}
            <div className="relative card-glass p-6 border-gold/20 hover:border-gold/30 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-gold/40 to-amber-500/40" />
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔱</span>
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/25">
                    {t("pricing.channel.full.badge")}
                  </span>
                  <h4 className="text-white/90 font-serif font-bold text-lg mt-1">{t("pricing.channel.full.name")}</h4>
                </div>
              </div>
              <p className="text-gold/80 text-sm font-medium mb-3">{t("pricing.channel.full.tagline")}</p>
              <p className="text-white/40 text-xs mb-4 leading-relaxed">{t("pricing.channel.full.audience")}</p>
              <div className="bg-gold/5 border border-gold/15 rounded-xl p-3 mb-3">
                <p className="text-white/50 text-[11px] leading-relaxed">{t("pricing.channel.full.tech")}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gold/60 text-xs mt-0.5">▸</span>
                <p className="text-white/35 text-[11px] leading-relaxed">{t("pricing.channel.full.output")}</p>
              </div>
            </div>
          </div>

          {/* Shared price tag */}
          <div className="text-center mt-5">
            <span className="text-white/30 text-xs">{t("pricing.channel.price")}：</span>
            <span className="text-gold text-sm font-medium">{t("pricing.channel.priceValue")}</span>
          </div>
        </motion.div>

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
            <p className="text-white/80 font-medium">{t("pricing.eventCallout")}</p>
            <p className="text-white/35 text-sm">
              {t("pricing.eventDesc").replace("{price}", eventPrice)}
            </p>
          </div>
          <button
            onClick={() => handleSelect("event_retro")}
            className="btn-gold-outline text-sm whitespace-nowrap flex items-center gap-2"
          >
            {t("pricing.learnMore")}
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
            <h3 className="text-lg font-serif font-bold text-white/80">{t("pricing.stardustGuide")}</h3>
            <p className="text-white/30 text-xs mt-1">{t("pricing.stardustSubtitle")}</p>
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
            <h3 className="text-lg font-serif font-bold text-white/80">{t("pricing.faq")}</h3>
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
              {t("pricing.founderDesc")}
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
              {t("pricing.learnFounder")}
              <ArrowRight size={12} />
            </Link>
          </div>
        </motion.div>

        {/* ══════════ Footer Legal ══════════ */}
        <p className="text-center text-white/20 text-[11px]">
          {t("pricing.legalText")}{" "}
          <button onClick={() => setShowTerms(true)} className="text-gold/40 hover:text-gold underline">
            {t("pricing.termsOfService")}
          </button>
          {" "}{t("pricing.and")}{" "}
          <a href="/refund" className="text-gold/40 hover:text-gold underline">{t("pricing.refundPolicy")}</a>
          。{t("pricing.legalNote")}
        </p>

        <ServiceTerms open={showTerms} onClose={() => setShowTerms(false)} />
      </div>

      {/* Payment modal */}
      {selectedTier && (
        <QRPaymentModal
          open={!!selectedTier}
          onClose={() => setSelectedTier(null)}
          tier={selectedTier as "premium_monthly" | "premium_yearly"}
          region={region}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
