"use client"
import { useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Sparkles, Calendar, ShoppingBag, MessageCircle, Compass } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"

// ── Lazy-loaded marketing page ─────────────────────────────────────────────
const MarketingPage = dynamic(() => import("@/components/MarketingPage"), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-gold/50 text-sm font-serif tracking-wider">DESTINY MIRROR</p>
      </div>
    </div>
  ),
})

// ── Lazy-loaded below-the-fold sections ──────────────────────────
const UserDashboard = dynamic(() => import("@/components/dashboard/UserDashboard").then(m => m.UserDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})
const DailyDashboard = dynamic(() => import("@/components/DailyDashboard").then(m => m.DailyDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})

const FloatingFortuneSubscribe = dynamic(() => import("@/components/ui/FloatingFortuneSubscribe").then(m => m.FloatingFortuneSubscribe), { ssr: false })

const QUICK_ACTIONS = [
  { key: "reading", icon: Sparkles, href: "/reading/new", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-400/20" },
  { key: "am16", icon: Compass, href: "/am16", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-400/20" },
  { key: "almanac", icon: Calendar, href: "/almanac", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/20" },
  { key: "shop", icon: ShoppingBag, href: "/shop", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-400/20" },
  { key: "chat", icon: MessageCircle, href: "/divination", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-400/20" },
]

export default function HomePage() {
  const { t, localeHref } = useLanguage()
  const { user, loading: authLoading } = useAuth()
  const { userProfile, loading: profileLoading, fetchBirthProfiles } = useUserStore()

  useEffect(() => {
    if (user) fetchBirthProfiles()
  }, [user])

  const hasProfile = !!user && !!userProfile
  const profileStillLoading = !!user && profileLoading && !userProfile

  if (profileStillLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="card-glass p-8 space-y-4">
            <div className="h-6 bg-white/5 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
            <div className="flex gap-4 mt-6">
              <div className="h-10 bg-white/5 rounded-full w-32 animate-pulse" />
              <div className="h-10 bg-white/5 rounded-full w-32 animate-pulse" />
            </div>
          </div>
          <div className="card-glass p-8 space-y-4">
            <div className="h-5 bg-white/5 rounded w-1/4 animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (hasProfile) {
    return (
      <div className="min-h-screen">
        {/* ── Hero Fold: Profile + Quick Actions ────────────── */}
        <section className="pt-24 pb-10 px-4">
          <UserDashboard />
        </section>

        {/* ── Quick Actions ─────────────────────────────────── */}
        <section className="pb-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-5 gap-3">
              {QUICK_ACTIONS.map(action => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.key}
                    href={localeHref(action.href)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border ${action.bg} ${action.border} hover:scale-[1.03] transition-all duration-200`}
                  >
                    <Icon size={20} className={action.color} />
                    <span className="text-white/50 text-[11px] font-medium">{t(`home.quick.${action.key}`)}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Daily Focus Fold ──────────────────────────────── */}
        <section className="py-12 px-4 bg-white/[0.015]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("home.dailyBadge")}</span>
              <h2 className="font-serif text-2xl font-bold text-gold mt-2">{t("home.dailyTitle")}</h2>
            </div>
            <DailyDashboard />
          </div>
        </section>

        {/* ── Enhanced CTA Fold ─────────────────────────────── */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="card-glass p-8 text-center">
              <div className="text-3xl mb-4">🛍️</div>
              <h3 className="font-serif text-lg text-gold mb-2">{t("home.shopCta")}</h3>
              <p className="text-white/40 text-sm mb-5">{t("home.shopDesc")}</p>
              <div className="flex justify-center gap-4">
                <Link href={localeHref("/shop")} className="btn-gold text-sm px-6 py-2">{t("home.shopButton")}</Link>
                <Link href={localeHref("/blog")} className="border border-white/20 text-white/60 hover:text-gold hover:border-gold/30 rounded-full text-sm px-6 py-2 transition-all">{t("home.knowledgeButton")}</Link>
              </div>
            </div>
          </div>
        </section>

        <FloatingFortuneSubscribe />
      </div>
    )
  }

  return <MarketingPage />
}
