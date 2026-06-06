"use client"
import { useEffect, useRef, Component, type ReactNode, type ErrorInfo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"

// ── Error boundary to catch React error #310 and display useful info ────
class PageErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[PageErrorBoundary] Caught:", error.message, errorInfo.componentStack)
    this.setState({ errorInfo })
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
            <div className="card-glass p-8 max-w-lg text-center space-y-4">
              <p className="text-red-400 text-lg font-serif">页面加载出错</p>
              <p className="text-white/50 text-sm">{this.state.error?.message}</p>
              <p className="text-white/30 text-xs break-all">{this.state.errorInfo?.componentStack?.slice(0, 500)}</p>
              <button onClick={() => window.location.reload()} className="btn-gold text-sm px-6 py-2 mt-4">
                刷新页面
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}

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

export default function HomePage() {
  const renderCount = useRef(0)
  renderCount.current++
  if (renderCount.current <= 10 || renderCount.current % 50 === 0) {
    console.log(`[HomePage] render #${renderCount.current}`)
  }

  const { t, localeHref } = useLanguage()
  const { user, loading: authLoading } = useAuth()
  const { userProfile, loading: profileLoading, fetchBirthProfiles } = useUserStore()

  // DEBUG: uncomment next line to test with minimal rendering
  // return <PageErrorBoundary><div className="text-white p-20">Hello - minimal test</div></PageErrorBoundary>

  useEffect(() => {
    if (user) {
      // Stagger initial API calls to avoid 429 burst from multiple components
      const t = setTimeout(() => fetchBirthProfiles(), 200)
      return () => clearTimeout(t)
    }
  }, [user])

  const hasProfile = !!user && !!userProfile
  const profileStillLoading = !!user && profileLoading && !userProfile

  if (renderCount.current <= 5) {
    console.log(`[HomePage] state: user=${!!user} authLoading=${authLoading} userProfile=${!!userProfile} profileLoading=${profileLoading} hasProfile=${hasProfile} profileStillLoading=${profileStillLoading}`)
  }

  if (profileStillLoading) {
    return (
      <PageErrorBoundary>
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
      </PageErrorBoundary>
    )
  }

  if (hasProfile) {
    return (
      <PageErrorBoundary>
        <div className="min-h-screen">
          {/* ── Hero Fold: Profile ────────────────────────────── */}
          <section className="pt-24 pb-10 px-4">
            <UserDashboard />
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
      </PageErrorBoundary>
    )
  }

  return (
    <PageErrorBoundary>
      <MarketingPage />
    </PageErrorBoundary>
  )
}
