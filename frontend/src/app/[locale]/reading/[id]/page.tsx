"use client"
import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Loader2, Sparkles, ShoppingBag, AlertCircle,
  CheckCircle, MessageSquare, Tags, Gift, Lock,
  Crown, ArrowRight, ArrowLeft, TrendingUp, Zap, Star, Shield,
  ChevronDown, Eye, Clock, Compass, ScrollText,
} from "lucide-react"
import toast from "react-hot-toast"
import { getSession, matchProducts, AnalysisResponse, Product, AGENT_LABELS } from "@/lib/api"

const AGENT_I18N: Record<string, string> = {
  astrology: "agent.astrology._label", tarot: "agent.tarot._label", bazi: "agent.bazi._label",
  qimen: "agent.qimen._label", ziwei: "agent.ziwei._label", face: "agent.face._label",
  palm: "agent.palm._label", partner_face: "agent.partner_face._label",
  partner_palm: "agent.partner_palm._label", master: "agent.master",
}
// Core imports (always needed)
import AnalysisSession from "@/components/reading/AnalysisSession"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { STARDUST_COST } from "@/lib/pricing.config"
import MembershipBadge, { getUserTier } from "@/components/ui/MembershipBadge"
import { ReportSection } from "@/components/reading/ReportSection"
import { ReadingSkeleton } from "@/components/reading/ReadingSkeleton"
import { TagBadge } from "@/components/ui/TagBadge"
import { useRegion } from "@/hooks/useRegion"

// Lazy-loaded heavy/conditional components (reduces initial bundle ~150KB)
const ProductCard = lazy(() => import("@/components/reading/ProductCard").then(m => ({ default: m.ProductCard })))
const ChatBox = lazy(() => import("@/components/reading/ChatBox").then(m => ({ default: m.ChatBox })))
const EventAnalyzer = lazy(() => import("@/components/reading/EventAnalyzer"))
const DailyAlmanac = lazy(() => import("@/components/reading/DailyAlmanac"))
const DestinyRadar = lazy(() => import("@/components/reading/DestinyRadar").then(m => ({ default: m.DestinyRadar })))
const ShareSheet = lazy(() => import("@/components/reading/ShareSheet").then(m => ({ default: m.ShareSheet })))
const PaywallGate = lazy(() => import("@/components/monetization/PaywallGate").then(m => ({ default: m.PaywallGate })))
const QRPaymentModal = lazy(() => import("@/components/payment/QRPaymentModal").then(m => ({ default: m.QRPaymentModal })))
const PrescriptionCard = lazy(() => import("@/components/reading/PrescriptionCard").then(m => ({ default: m.PrescriptionCard })))
const EnergyIDCard = lazy(() => import("@/components/reading/EnergyIDCard").then(m => ({ default: m.EnergyIDCard })))
const FortunePrescription = lazy(() => import("@/components/reading/FortunePrescription").then(m => ({ default: m.FortunePrescription })))
const PostAnalysisModal = lazy(() => import("@/components/reading/PostAnalysisModal").then(m => ({ default: m.PostAnalysisModal })))

const WORKER_ORDER = ["bazi", "qimen", "ziwei", "astrology", "tarot", "face", "palm"] as const

function stripMarkdown(text: string): string {
  return text
    // Remove JSON code blocks that may have leaked into report text
    .replace(/```json\s*[\s\S]*?```/g, "")
    .replace(/```\w*\s*[\s\S]*?```/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/#-+/g, "")
    .replace(/^#+\s*$/gm, "")
    .replace(/^\s*[-*+]\s+(?=[#-])/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

const DIM_LABELS: Record<string, string> = {
  wealth: "财富", career: "事业", relationship: "感情",
  health: "健康", spiritual: "精神",
}

const DIM_EMOJI: Record<string, string> = {
  wealth: "💰", career: "💼", relationship: "💕", health: "🏥", spiritual: "🧘",
}

const DIM_DESCRIPTIONS: Record<string, string> = {
  wealth: "财运能量场",
  career: "事业腾飞力",
  relationship: "情感和谐度",
  health: "身心平衡值",
  spiritual: "灵性觉醒度",
}

const I18N_DIM_KEYS: Record<string, { label: string; desc: string }> = {
  wealth: { label: "reading.dim.wealth", desc: "reading.dimDesc.wealth" },
  career: { label: "reading.dim.career", desc: "reading.dimDesc.career" },
  relationship: { label: "reading.dim.relationship", desc: "reading.dimDesc.relationship" },
  health: { label: "reading.dim.health", desc: "reading.dimDesc.health" },
  spiritual: { label: "reading.dim.spiritual", desc: "reading.dimDesc.spiritual" },
}

const I18N_NAV_CORE = [
  { id: "master",    icon: "🌟", labelKey: "reading.nav.overview",     descKey: "reading.nav.overviewDesc" },
  { id: "shop",      icon: "🎁", labelKey: "reading.nav.shop",        descKey: "reading.nav.shopDesc" },
  { id: "chat",      icon: "💬", labelKey: "reading.nav.chat",        descKey: "reading.nav.chatDesc" },
]

const I18N_NAV_DIMENSIONS = [
  { id: "bazi",      icon: "☯",  labelKey: "reading.nav.bazi",        descKey: "reading.nav.baziDesc" },
  { id: "qimen",     icon: "🎯", labelKey: "reading.nav.qimen",       descKey: "reading.nav.qimenDesc" },
  { id: "ziwei",     icon: "⭐", labelKey: "reading.nav.ziwei",       descKey: "reading.nav.ziweiDesc" },
  { id: "astrology", icon: "✦",  labelKey: "reading.nav.astrology",   descKey: "reading.nav.astrologyDesc" },
  { id: "tarot",     icon: "🃏", labelKey: "reading.nav.tarot",       descKey: "reading.nav.tarotDesc" },
  { id: "face",      icon: "👁",  labelKey: "reading.nav.face",        descKey: "reading.nav.faceDesc" },
  { id: "palm",      icon: "🤚", labelKey: "reading.nav.palm",        descKey: "reading.nav.palmDesc" },
]

const I18N_NAV_ITEMS = [...I18N_NAV_CORE, ...I18N_NAV_DIMENSIONS]

/** Parse free report sections from master_summary */
function parseFreeReportSections(summary: string): {
  sectionA: string; sectionB: string; painPoints: string[]; sectionD: string;
} {
  if (!summary) return { sectionA: "", sectionB: "", painPoints: [], sectionD: "" }
  const result = { sectionA: "", sectionB: "", painPoints: [] as string[], sectionD: "" }

  // Try to find Section A (核心性格底色)
  const markersA = ["【A·核心性格底色】", "[A·核心性格底色]", "A·核心性格底色"]
  const markersB = ["【B·痛点诊断】", "[B·痛点诊断]", "B·痛点诊断"]
  const markersC = ["【C·五维速览】", "[C·五维速览]", "C·五维速览"]
  const markersD = ["【D·近期关键提醒】", "[D·近期关键提醒]", "D·近期关键提醒"]

  function findMarker(text: string, markers: string[]): number {
    for (const m of markers) {
      const idx = text.indexOf(m)
      if (idx !== -1) return idx + m.length
    }
    return -1
  }

  const startA = findMarker(summary, markersA)
  const startB = findMarker(summary, markersB)
  const startC = findMarker(summary, markersC)
  const startD = findMarker(summary, markersD)

  // Extract Section A (everything before B, C, or D markers, or before first marker)
  if (startA > 0) {
    const endA = [startB, startC, startD].filter(x => x > startA).sort((a, b) => a - b)[0] || summary.length
    result.sectionA = summary.slice(startA, endA).trim()
  } else if (startB === -1 && startC === -1 && startD === -1) {
    // No markers found — treat entire text as Section A (legacy format)
    result.sectionA = summary
  }

  // Extract Section B (pain points)
  if (startB > 0) {
    const endB = [startC, startD].filter(x => x > startB).sort((a, b) => a - b)[0] || summary.length
    result.sectionB = summary.slice(startB, endB).trim()
    // Extract individual pain point lines (🔴🟡🟢)
    result.painPoints = result.sectionB
      .split("\n")
      .filter(line => /^[🔴🟡🟢]/.test(line.trim()))
      .map(line => line.trim())
  }

  // Extract Section D (key reminder)
  if (startD > 0) {
    const endD = summary.length
    result.sectionD = summary.slice(startD, endD).trim()
  }

  return result
}

function getWeakestDimension(scores: Record<string, number>): string {
  return Object.entries(scores).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "wealth"
}

function getWeakestLabel(scores: Record<string, number>, t: (key: string) => string): string {
  const dim = getWeakestDimension(scores)
  return I18N_DIM_KEYS[dim] ? t(I18N_DIM_KEYS[dim].label) : (DIM_LABELS[dim] ?? dim)
}

function getStrongestDimension(scores: Record<string, number>): string {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "career"
}

function getStrongestLabel(scores: Record<string, number>, t: (key: string) => string): string {
  const dim = getStrongestDimension(scores)
  return I18N_DIM_KEYS[dim] ? t(I18N_DIM_KEYS[dim].label) : (DIM_LABELS[dim] ?? dim)
}

function getI18nDimLabel(key: string, t: (k: string) => string): string {
  const i18n = I18N_DIM_KEYS[key]
  return i18n ? t(i18n.label) : DIM_LABELS[key] ?? key
}

/** Get a time-of-day greeting */
function getGreeting(t: (key: string) => string): string {
  const h = new Date().getHours()
  if (h < 6) return t("reading.greeting.lateNight")
  if (h < 9) return t("reading.greeting.earlyMorning")
  if (h < 12) return t("reading.greeting.morning")
  if (h < 14) return t("reading.greeting.afternoon")
  if (h < 18) return t("reading.greeting.evening")
  if (h < 21) return t("reading.greeting.night")
  return t("reading.greeting.night")
}

export default function ReadingPage() {
  const { id } = useParams<{ id: string }>()
  const { user, refreshUser } = useAuth()
  const { locale, t, localeHref } = useLanguage()
  const { region } = useRegion()
  const router = useRouter()
  const [data, setData]         = useState<AnalysisResponse | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [shopLoading, setShopLoading] = useState(false)
  const [shopFetched, setShopFetched] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("master")

  const [showPayment, setShowPayment] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isDetailedUnlocked, setIsDetailedUnlocked] = useState(false)

  // Scroll-driven progressive reveal
  const [heroVisible, setHeroVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const navScrollRef = useRef<HTMLDivElement>(null)

  // Stable callback for AnalysisSession — prevents new reference on every render
  const handleAnalysisComplete = useCallback((fresh: AnalysisResponse) => {
    setData(fresh)
    setIsUnlocked(fresh.is_detail_unlocked)
    setIsDetailedUnlocked(fresh.is_detailed_unlocked)
  }, [])

  // Fetch initial data — AnalysisSession handles all SSE/polling/streaming
  useEffect(() => {
    if (!id) return
    let cancelled = false

    setLoading(true)
    setProducts([])
    setShopFetched(false)
    setActiveTab("master")

    const LOAD_TIMEOUT_MS = 15_000
    const loadTimeout = setTimeout(() => {
      if (cancelled) return
      setLoading(false)
      toast.error(t("reading.error.loadTimeout") || "加载超时，请刷新重试")
    }, LOAD_TIMEOUT_MS)

    getSession(id).then(d => {
      if (cancelled) return
      clearTimeout(loadTimeout)
      setData(d)
      setIsUnlocked(d.is_detail_unlocked)
      setIsDetailedUnlocked(d.is_detailed_unlocked)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) {
        clearTimeout(loadTimeout)
        toast.error(t("reading.error.loadFailed"))
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      clearTimeout(loadTimeout)
    }
  }, [id])

  // Trigger hero animation
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 150)
    return () => clearTimeout(t)
  }, [])

  // Auto-fetch product recommendations when analysis completes
  useEffect(() => {
    if (!data || data.status !== "done" && data.status !== "completed" && data.status !== "chat") return
    if (shopFetched || shopLoading) return
    if (!data.computed_tags || data.computed_tags.length === 0) return

    setShopLoading(true)
    matchProducts({
      weakness_tags: data.computed_tags,
      master_summary: data.master_summary,
      top_k: 6,
      include_explain: true,
    }, locale)
      .then(result => {
        setProducts(result)
        setShopFetched(true)
      })
      .catch(() => {})
      .finally(() => setShopLoading(false))
  }, [data?.status, shopFetched, shopLoading])

  const handleUnlock = useCallback(async (paymentMethod: string = "card") => {
    if (!id) return
    // 跳转到定价页面，用户选择会员方案
    router.push(`/${locale}/pricing`)
  }, [id, router, locale])

  const handlePaymentSuccess = useCallback(async () => {
    setIsUnlocked(true)
    setShowPayment(false)
    toast.success(t("reading.error.unlocked"))
    refreshUser()
  }, [refreshUser])

  const handleStardustUnlock = useCallback(async () => {
    if (!id) return
    try {
      const { unlockReport } = await import("@/lib/api")
      const result = await unlockReport(id, "stardust", "full")
      // Only update state after API success
      if (result.unlocked) {
        setIsUnlocked(true)
        setIsDetailedUnlocked(true)
      }
      toast.success(t("reading.unlockedSuccess"))
      refreshUser()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("reading.unlockedFailed"))
    }
  }, [id, refreshUser])

  const handleDetailedUnlock = useCallback(async () => {
    if (!id) return
    try {
      const { unlockReport } = await import("@/lib/api")
      const result = await unlockReport(id, "stardust", "detailed")
      // Only update state after API success
      if (result.unlocked) {
        setIsDetailedUnlocked(true)
      }
      toast.success(t("reading.detailedUnlocked") || "精读报告已解锁")
      refreshUser()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("reading.unlockedFailed"))
    }
  }, [id, refreshUser])

  if (loading) return <ReadingSkeleton phase="loading" />
  if (!data) return <ReadingSkeleton phase="error" />

  // Show AnalysisSession when analysis is still running — all SSE/polling state is
  // isolated inside AnalysisSession so ReadingPage re-renders only on completion.
  if (!data || data.status !== "done" && data.status !== "completed" && data.status !== "chat") {
    return data ? (
      <AnalysisSession
        sessionId={id}
        initialData={data}
        onComplete={handleAnalysisComplete}
      />
    ) : (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-glass p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
          </div>
          <p className="text-white/40 text-sm">{t("reading.loading") || "加载中..."}</p>
        </div>
      </div>
    )
  }

  // Dynamic worker order — include partner_face/palm only when data exists
  // NOTE: No useMemo here — the computation is trivial and memo deps
  // (data.partner_face, data.partner_palm) can change on every setData(fresh)
  // call, defeating the purpose of memoization.
  const WORKER_ORDER_ALL: readonly string[] = (() => {
    const base = ["bazi", "qimen", "ziwei", "astrology", "tarot", "face", "palm"]
    if (data.partner_face) base.push("partner_face")
    if (data.partner_palm) base.push("partner_palm")
    return base as readonly string[]
  })()

  // Dynamic navigation items — include partner tabs when available
  const NAV_ITEMS_DIMENSIONS = (() => {
    const items = [...I18N_NAV_DIMENSIONS]
    if (data.partner_face) {
      items.splice(items.findIndex(i => i.id === "face") + 1, 0,
        { id: "partner_face", icon: "👁", labelKey: "reading.nav.partnerFace", descKey: "reading.nav.partnerFaceDesc" })
    }
    if (data.partner_palm) {
      const palmIdx = items.findIndex(i => i.id === "palm")
      items.splice(palmIdx + 1, 0,
        { id: "partner_palm", icon: "🤚", labelKey: "reading.nav.partnerPalm", descKey: "reading.nav.partnerPalmDesc" })
    }
    return items
  })()

  const NAV_ITEMS_ALL = [...I18N_NAV_CORE, ...NAV_ITEMS_DIMENSIONS]

  const workerMap: Record<string, typeof data.bazi> = {
    astrology: data.astrology,
    tarot:     data.tarot,
    bazi:      data.bazi,
    qimen:     data.qimen,
    ziwei:     data.ziwei,
    face:      data.face,
    palm:      data.palm,
    ...(data.partner_face ? { partner_face: data.partner_face } : {}),
    ...(data.partner_palm ? { partner_palm: data.partner_palm } : {}),
  }

  const strongestDim = data.dimension_scores ? getStrongestDimension(data.dimension_scores) : "career"
  const strongestLabel = data.dimension_scores ? getI18nDimLabel(getStrongestDimension(data.dimension_scores), t) : t("reading.dim.career")
  const weakestDim = data.dimension_scores ? getWeakestDimension(data.dimension_scores) : "wealth"
  const weakestLabel = data.dimension_scores ? getI18nDimLabel(getWeakestDimension(data.dimension_scores), t) : t("reading.dim.wealth")

  return (
    <div className="min-h-screen pb-24">
      {/* ════════════════════════════════════════════════════════════
          HERO SECTION — Immersive above-the-fold experience
          ════════════════════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative pt-8 pb-12 px-4 overflow-hidden">

        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(201,168,76,0.3) 0%, rgba(157,100,180,0.15) 40%, transparent 70%)",
              transition: "opacity 1.5s ease-out",
              opacity: heroVisible ? 0.2 : 0,
            }}
          />
          <div
            className="absolute top-20 right-[10%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-10"
            style={{
              background: "radial-gradient(circle, rgba(82,183,136,0.25) 0%, transparent 70%)",
              animation: "float 8s ease-in-out infinite",
            }}
          />
          {/* Floating star particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gold/30"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                left: `${5 + Math.random() * 90}%`,
                top: `${5 + Math.random() * 80}%`,
                animation: `twinkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto relative" data-report-content>
          {/* ── Top bar: badge + share ── */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 mb-8"
            style={{
              transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-4 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gold/80 text-xs font-medium tracking-wide">
                {t("reading.hero.badge")}
              </span>
            </div>
            {/* Intent channel badge */}
            {data?.intent && (
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium
                ${data.intent === "FULL_MULTIMODAL"
                  ? "bg-gold/10 border border-gold/25 text-gold/80"
                  : data.intent === "GENERAL_DAILY"
                    ? "bg-purple-500/10 border border-purple-500/25 text-purple-400"
                    : "bg-blue-500/10 border border-blue-500/25 text-blue-400"
                }`}
              >
                {data.intent === "FULL_MULTIMODAL"
                  ? t("reading.channel.full")
                  : data.intent === "GENERAL_DAILY"
                    ? t("reading.channel.quick")
                    : t("reading.channel.event")
                }
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <span className="text-white/30 text-[10px]">
                {t("reading.disclaimer")}
              </span>
            </div>
            <Suspense fallback={<div className="w-20 h-8" />}>
              <ShareSheet sessionId={id} />
            </Suspense>
          </div>

          {/* ── Main Hero Card ── */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.15s",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {/* Animated border */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                padding: "1px",
                background: "conic-gradient(from var(--angle,0deg), transparent 25%, rgba(201,168,76,0.4) 50%, transparent 75%)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                animation: "hero-border-spin 8s linear infinite",
              }}
            />
            <div className="relative bg-gradient-to-br from-[#1a1430]/90 via-[#1e1835]/90 to-[#140f24]/90 backdrop-blur-xl p-6 md:p-10">
              {/* Greeting */}
              <p
                className="text-gold/60 text-xs md:text-sm tracking-widest uppercase mb-4"
                style={{
                  transition: "all 0.6s ease-out 0.3s",
                  opacity: heroVisible ? 1 : 0,
                }}
              >
                {getGreeting(t)} · {t("reading.greeting.ready")}
              </p>

              {/* Main headline */}
              <h1
                className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-3"
                style={{
                  background: "linear-gradient(135deg, #E8CB7A 0%, #C9A84C 40%, #F0D68A 70%, #C9A84C 100%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  transition: "all 0.6s ease-out 0.45s",
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(8px)",
                }}
              >
                {t("reading.title")}
              </h1>

              {/* Subtitle */}
              <p
                className="text-white/50 text-sm md:text-base max-w-2xl leading-relaxed mb-8"
                style={{
                  transition: "all 0.6s ease-out 0.6s",
                  opacity: heroVisible ? 1 : 0,
                }}
              >
                {t("reading.subtitle")}
              </p>

              {/* ── Dimension Score Compact Row (hidden for RELATIONSHIP) ── */}
              {data.dimension_scores && data.intent !== "RELATIONSHIP" && (
                <div
                  className="grid grid-cols-5 gap-2 md:gap-3 mb-8"
                  style={{
                    transition: "all 0.8s ease-out 0.75s",
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  {Object.entries(DIM_LABELS).map(([key, label]) => {
                    const score = data.dimension_scores![key] ?? 5
                    const isStrongest = key === strongestDim
                    const isWeakest = key === weakestDim
                    const i18nKey = I18N_DIM_KEYS[key]
                    return (
                      <div
                        key={key}
                        className={`relative rounded-xl p-2.5 md:p-3.5 text-center border transition-all duration-500
                          ${isStrongest
                            ? "bg-gold/10 border-gold/30"
                            : isWeakest
                              ? "bg-rose-500/5 border-rose-400/20"
                              : "bg-white/[0.03] border-white/10 hover:border-white/20"
                          }`}
                      >
                        <span className="text-sm md:text-lg">{DIM_EMOJI[key]}</span>
                        <p
                          className={`text-lg md:text-2xl font-bold font-serif mt-1
                            ${isStrongest ? "text-gold" : isWeakest ? "text-rose-400" : "text-white/60"}`}
                        >
                          {score.toFixed(1)}
                        </p>
                        <p className="text-[10px] md:text-xs text-white/30 mt-0.5">{i18nKey ? t(i18nKey.label) : label}</p>
                        {isWeakest && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Insight Blurb (hidden for RELATIONSHIP) ── */}
              {data.intent !== "RELATIONSHIP" && (<div
                className="flex items-start gap-3 p-4 rounded-2xl bg-gold/[0.04] border border-gold/10"
                style={{
                  transition: "all 0.6s ease-out 0.9s",
                  opacity: heroVisible ? 1 : 0,
                }}
              >
                <Sparkles size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {t("reading.strongest")}：<span className="text-gold font-semibold">{strongestLabel}</span>，
                    {t("reading.weakest")}：<span className="text-rose-400/80 font-semibold">{weakestLabel}</span>。
                    {isUnlocked
                      ? t("reading.insight.unlocked")
                      : t("reading.insight.locked")}
                  </p>
                </div>
              </div>)}

              {/* CTA if not unlocked */}
              {!isUnlocked && (
                <div
                  className="mt-6 flex flex-wrap items-center gap-3"
                  style={{
                    transition: "all 0.6s ease-out 1.05s",
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  <button
                    onClick={() => setShowPayment(true)}
                    className="btn-gold flex items-center gap-2 text-sm md:text-base"
                  >
                    <Crown size={16} />
                    {t("reading.cta.unlockBtn")}
                  </button>
                  <span className="text-white/20 text-xs">
                    {t("reading.cta.perks")}
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          NAVIGATION — Side-oriented nav system
          ════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 mb-8 sticky top-16 z-30">
        <div className="bg-[#1a1430]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 relative overflow-hidden">
          {/* Row 1: Core navigation */}
          <div className="flex justify-center gap-1 px-3 pt-2.5 pb-1.5">
            {I18N_NAV_CORE.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium
                            whitespace-nowrap transition-all duration-300 group
                  ${activeTab === item.id
                    ? "bg-gold/15 text-gold shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                    : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"}`}
              >
                <span className="text-sm sm:text-base transition-transform group-hover:scale-110 duration-200">{item.icon}</span>
                <span>{t(item.labelKey)}</span>
                {activeTab === item.id && (
                  <span className="hidden lg:inline text-[10px] text-gold/50 ml-0.5">{t(item.descKey)}</span>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-white/[0.06]" />

          {/* Row 2: Dimension tabs (scrollable) */}
          <div className="relative">
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1a1430]/90 to-transparent pointer-events-none z-10 md:hidden" />
            <div ref={navScrollRef} className="flex gap-0.5 px-2 py-2 overflow-x-auto scrollbar-none scroll-smooth">
              {NAV_ITEMS_DIMENSIONS.map((item) => {
                const isWorkerTab = WORKER_ORDER_ALL.includes(item.id)
                const isLocked = !isUnlocked && isWorkerTab
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-medium
                                whitespace-nowrap transition-all duration-300 flex-shrink-0 group
                      ${activeTab === item.id
                        ? "bg-gold/15 text-gold shadow-[0_0_12px_rgba(201,168,76,0.12)]"
                        : isLocked
                          ? "text-white/20 hover:text-white/40 hover:bg-white/[0.03]"
                          : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"}`}
                  >
                    <span className="text-xs sm:text-sm transition-transform group-hover:scale-110 duration-200">{item.icon}</span>
                    <span className="hidden sm:inline">{t(item.labelKey)}</span>
                    {isLocked && <Lock size={9} className="text-white/15 -ml-0.5" />}
                    {activeTab === item.id && (
                      <span className="hidden lg:inline text-[10px] text-gold/50 ml-0.5">{t(item.descKey)}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          CONTENT AREA
          ════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4">
        <FadeInSection key={activeTab}>

        {/* ── Master Summary ──────────────────────────────────── */}
        {activeTab === "master" && (() => {
          // Parse master_summary into sections for free users
          const summary = data.master_summary || ""
          const parsed = parseFreeReportSections(summary)

          return (
          <div className="space-y-6">
            {/* ── 1. Core Summary (Section A) ── */}
            {(parsed.sectionA || summary) && (
            <div className="card-glass p-6 md:p-8 group hover:border-white/[0.15] transition-all duration-500">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-gold" />
                </div>
                <div>
                  <h2 className="font-serif text-lg md:text-xl font-bold text-gold">{t("reading.master.title")}</h2>
                  <p className="text-white/20 text-xs">{t("reading.master.subtitle")}</p>
                </div>
                <span className="ml-auto text-[10px] px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">
                  {t("reading.master.free")}
                </span>
              </div>
              <div className="text-white/75 text-sm leading-relaxed whitespace-pre-line">
                {stripMarkdown(parsed.sectionA || summary || t("reading.progress.masterAgent"))}
              </div>
              <p className="mt-4 pt-3 border-t border-white/[0.06] text-white/25 text-[11px] leading-relaxed">
                {t("reading.master.disclaimer")}
              </p>
            </div>
            )}

            {/* ── 2. Radar Chart (hidden for RELATIONSHIP) ── */}
            {data.dimension_scores && data.intent !== "RELATIONSHIP" && (
              <div className="flex justify-center">
                <Suspense fallback={<div className="h-64" />}>
                  <DestinyRadar
                    scores={data.dimension_scores}
                    labels={["wealth", "relationship", "career", "health", "spiritual"].map(k => t(I18N_DIM_KEYS[k]?.label || `reading.dim.${k}`))}
                  />
                </Suspense>
              </div>
            )}

            {/* ── 3. Pain Points (Section B) ── */}
            {parsed.sectionB && !isUnlocked && (
            <div className="card-glass p-6 md:p-8 border-l-2 border-l-amber-400/40 hover:border-l-amber-400/60 transition-all duration-500">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-amber-300">{t("reading.painPoints.title") || "痛点诊断"}</h2>
                  <p className="text-white/20 text-xs">{t("reading.painPoints.subtitle") || "当前最需要关注的3个问题"}</p>
                </div>
              </div>
              <div className="space-y-3">
                {parsed.painPoints.map((point, i) => {
                  const isRed = point.startsWith("🔴")
                  const isGreen = point.startsWith("🟢")
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300
                      ${isRed ? "bg-red-500/[0.06] border border-red-400/15" :
                        isGreen ? "bg-green-500/[0.06] border border-green-400/15" :
                        "bg-amber-500/[0.06] border border-amber-400/15"}`}>
                      <span className="text-sm mt-0.5 flex-shrink-0">{point.slice(0, 2)}</span>
                      <span className="text-white/70 text-sm leading-relaxed">{stripMarkdown(point.slice(2).trim())}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            )}

            {/* ── 4. Key Reminders (Section D) ── */}
            {parsed.sectionD && !isUnlocked && (
            <div className="card-glass p-5 md:p-6 border-l-2 border-l-cyan-400/40 bg-gradient-to-r from-cyan-500/[0.04] to-transparent">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">⏰</span>
                <div>
                  <h3 className="text-cyan-300 font-semibold text-sm mb-1">{t("reading.reminder.title") || "近期关键提醒"}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{stripMarkdown(parsed.sectionD)}</p>
                </div>
              </div>
            </div>
            )}

            {/* ── 5. Tags ── */}
            {data.computed_tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {data.computed_tags.slice(0, 10).map((tag, i) => (
                  <span key={tag} style={{ transitionDelay: `${i * 30}ms` }}>
                    <TagBadge tag={tag} size="md" />
                  </span>
                ))}
              </div>
            )}

            {/* ── 6. Energy ID Card (hidden for RELATIONSHIP) ── */}
            {data.dimension_scores && data.intent !== "RELATIONSHIP" && (
              <Suspense fallback={<div className="h-32" />}>
                <EnergyIDCard
                  sessionId={id}
                  userId={user?.id}
                  dimensionScores={data.dimension_scores}
                />
              </Suspense>
            )}

            {/* ── 7. Detailed Report (PaywallGate) ── */}
            <Suspense fallback={<div className="card-glass p-6 h-48" />}>
              <PaywallGate
                isUnlocked={isUnlocked || isDetailedUnlocked}
                title={t("reading.master.detailTitle")}
                description={t("reading.insight.locked")}
                onUnlock={() => router.push(`/${locale}/pricing`)}
                loading={false}
                previewLines={8}
                stardustBalance={user?.stardust_balance || 0}
                onDetailedUnlock={handleDetailedUnlock}
                onStardustUnlock={handleStardustUnlock}
                showDualTier={!isUnlocked && !isDetailedUnlocked}
              >
                <div className="card-glass p-6 md:p-8 border-gold/20 bg-gradient-to-br from-gold/[0.03] to-transparent">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                      <Crown size={20} className="text-gold" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg md:text-xl font-bold text-gold">{t("reading.master.detailTitle")}</h2>
                      <p className="text-white/20 text-xs">{t("reading.master.detailSubtitle")}</p>
                    </div>
                    <span className="ml-auto text-[10px] px-2 py-0.5 bg-gold/10 border border-gold/20 rounded-full text-gold/70">
                      {t("reading.master.unlocked")}
                    </span>
                  </div>
                  <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                    {stripMarkdown(data.master_detail || t("reading.master.loading"))}
                  </div>
                </div>
              </PaywallGate>
            </Suspense>

            {/* ── 8. Fortune Prescription ── */}
            {data.recommended_products && data.recommended_products.length > 0 && (
              <Suspense fallback={<div className="card-glass p-4 h-32 animate-pulse" />}>
                <FortunePrescription
                  products={data.recommended_products}
                  weakestLabel={data.dimension_scores ? getWeakestLabel(data.dimension_scores, t) : undefined}
                  strongestLabel={data.dimension_scores ? getStrongestLabel(data.dimension_scores, t) : undefined}
                />
              </Suspense>
            )}

            {/* ── 9. AI Matched Products ── */}
            {!isUnlocked && products.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🎁</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gold">{t("reading.shop.title")}</h3>
                    <p className="text-white/25 text-[11px]">{t("reading.shop.desc")}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {products.slice(0, 2).map(p => (
                    <Suspense key={p.id} fallback={<div className="card-glass h-32 animate-pulse" />}>
                      <ProductCard product={p} />
                    </Suspense>
                  ))}
                </div>
                {products.length > 2 && (
                  <button
                    onClick={() => setActiveTab("shop")}
                    className="mt-3 text-gold/60 text-xs hover:text-gold transition-colors"
                  >
                    {t("curated.viewAll")} →
                  </button>
                )}
              </div>
            )}

            {/* ── 10. Worker Dimension Previews ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Compass size={16} className="text-white/30" />
                <h3 className="text-sm font-medium text-white/40">{t("reading.summary")}</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {WORKER_ORDER_ALL.map((k: string) => {
                  const w = workerMap[k]
                  const meta = AGENT_LABELS[k]
                  const hasReport = !!w.report
                  return (
                    <button
                      key={k}
                      onClick={() => setActiveTab(k)}
                      className={`p-4 text-left group cursor-pointer transition-all duration-300 ${
                        hasReport
                          ? "card-glow hover:border-white/[0.15]"
                          : "card-glass border-dashed border-white/[0.08] hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{meta.icon}</span>
                        <span className={`font-medium text-sm ${meta.color}`}>{t(AGENT_I18N[k] || `agent.${k}`)}</span>
                        {!isUnlocked && !hasReport && (
                          <Lock size={11} className="text-white/20 ml-auto" />
                        )}
                        {hasReport && w.tags.length > 0 && (
                          <Tags size={11} className="text-white/20 ml-auto" />
                        )}
                      </div>
                      {hasReport ? (
                        <>
                          <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                            {stripMarkdown(w.report.slice(0, 100))}…
                          </p>
                          <p className="text-gold/40 text-[11px] mt-2 group-hover:text-gold/80 transition-colors">
                            {t("reading.clickToView")} →
                          </p>
                        </>
                      ) : (
                        <p className="text-white/25 text-xs leading-relaxed">
                          {t("reading.worker.lockedPreview")}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )})()}

        {/* ── Individual Worker Reports ───────────────────── */}
        {WORKER_ORDER_ALL.map((k: string) => activeTab === k && (
          <div key={k}>
            {/* Back to overview button */}
            <button
              onClick={() => setActiveTab("master")}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs mb-4 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              {t("reading.nav.overview")}
            </button>

            {workerMap[k].error ? (
              <div className="card-glass p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-400/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={28} className="text-red-400" />
                </div>
                <p className="text-white/50 text-sm">{t(AGENT_I18N[k] || `agent.${k}`)} {t("reading.error.analysis")}</p>
                <p className="text-white/25 text-xs mt-2 font-mono">{workerMap[k].error}</p>
              </div>
            ) : workerMap[k].report ? (
              <div className="space-y-4">
                <Suspense fallback={<div className="card-glass p-6 h-48" />}>
                  <PaywallGate
                    isUnlocked={isUnlocked}
                    title={`${t(AGENT_I18N[k] || `agent.${k}`)} ${t("reading.worker.unlockTitle")}`}
                    description={t("reading.worker.unlockDesc")}
                    onUnlock={() => router.push(`/${locale}/pricing`)}
                    loading={false}
                    previewLines={5}
                    stardustBalance={user?.stardust_balance || 0}
                    onStardustUnlock={handleStardustUnlock}
                  >
                    <ReportSection
                      icon={AGENT_LABELS[k].icon}
                      title={`${t(AGENT_I18N[k] || `agent.${k}`)} ${t("reading.worker.unlockTitle")}`}
                      color={AGENT_LABELS[k].color}
                      content={workerMap[k].report}
                    />
                  </PaywallGate>
                </Suspense>
                {workerMap[k].tags.length > 0 && (
                  <div className="card-glass p-5">
                    <p className="text-white/30 text-xs mb-3">{t("reading.tags.title")}</p>
                    <div className="flex flex-wrap gap-2">
                      {workerMap[k].tags.map(tag => (
                        <span key={tag} className="text-xs px-2.5 py-1 bg-white/[0.06] rounded-full text-white/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline product recommendations for this worker */}
                {products.length > 0 && (
                  <div className="card-glass p-4 border-gold/10">
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingBag size={12} className="text-gold/50" />
                      <p className="text-gold/60 text-xs font-medium">{t("reading.worker.relatedGoods")}</p>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-none">
                      {products.slice(0, 2).map(p => (
                        <a
                          key={p.id}
                          href={localeHref(`/shop/${p.id}`)}
                          className="flex items-center gap-3 min-w-[200px] p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-gold/20 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag size={14} className="text-gold/40" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white/70 text-[11px] font-medium truncate group-hover:text-gold transition-colors">{p.name}</p>
                            <p className="text-gold text-xs font-bold">¥{p.price_cny.toFixed(0)}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : !isUnlocked ? (
              /* ── Locked worker: show upgrade prompt ── */
              <div className="card-glass p-10 md:p-14 text-center">
                <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/15 flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-4xl">{AGENT_LABELS[k].icon}</span>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ink border border-white/10 flex items-center justify-center">
                    <Lock size={12} className="text-white/40" />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-gold mb-2">
                  {t(AGENT_I18N[k] || `agent.${k}`)}
                </h3>
                <p className="text-white/40 text-sm mb-2">
                  {t("reading.worker.lockedTitle")}
                </p>
                <p className="text-white/25 text-xs mb-6 max-w-sm mx-auto leading-relaxed">
                  {t("reading.worker.lockedDesc")}
                </p>
                {(user?.stardust_balance || 0) >= STARDUST_COST.FULL_REPORT ? (
                  <button
                    onClick={handleStardustUnlock}
                    className="flex items-center gap-2 mx-auto text-sm px-8 py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-violet-400/30 hover:border-violet-400/50 text-violet-300 hover:text-violet-200 transition-all"
                  >
                    <Sparkles size={16} />
                    {t("paywall.useStardust")}（{STARDUST_COST.FULL_REPORT} ✦）
                    <span className="text-violet-400/60 ml-1">· {user?.stardust_balance || 0} ✦</span>
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/${locale}/pricing`)}
                    className="btn-gold flex items-center gap-2 mx-auto text-sm px-8 py-3"
                  >
                    <Crown size={16} />
                    {t("reading.worker.unlockFull")}
                  </button>
                )}
              </div>
            ) : (
              <div className="card-glass p-12 text-center">
                <Eye size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm">{t("reading.error.noData")}</p>
              </div>
            )}
          </div>
        ))}

        {/* ── Product Shop ──────────────────────────────── */}
        {activeTab === "shop" && (
          <div>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-4">
                <ShoppingBag size={24} className="text-gold" />
              </div>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-gold mb-2">{t("reading.shop.title")}</h2>
              <p className="text-white/35 text-sm max-w-md">
                {t("reading.shop.desc")}
              </p>
            </div>

            {shopLoading ? (
              <div className="flex justify-center py-12">
                <div className="flex items-center gap-3 text-gold/60">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">{t("reading.shop.matching")}</span>
                </div>
              </div>
            ) : products.length > 0 ? (
              <Suspense fallback={<div className="grid sm:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card-glass h-48 animate-pulse" />
                ))}
              </div>}>
                <div className="grid sm:grid-cols-2 gap-5">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </Suspense>
            ) : (
              <div className="card-glass p-12 text-center">
                <ShoppingBag size={36} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm">{t("reading.shop.noMatch")}</p>
                <p className="text-white/15 text-xs mt-1">{t("reading.shop.tryLater")}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Event Analyzer ─────────────────────────────── */}
        {activeTab === "event" && (
          <Suspense fallback={<div className="card-glass p-10 text-center"><Loader2 size={24} className="animate-spin text-gold/40 mx-auto" /></div>}>
            <EventAnalyzer sessionId={id} />
          </Suspense>
        )}

        {/* ── Daily Almanac ──────────────────────────────── */}
        {activeTab === "almanac" && (
          <Suspense fallback={<div className="card-glass p-10 text-center"><Loader2 size={24} className="animate-spin text-gold/40 mx-auto" /></div>}>
            <DailyAlmanac sessionId={id} />
          </Suspense>
        )}

        {/* ── Chat Loop ──────────────────────────────────── */}
        {activeTab === "chat" && (
          <div>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-gold" />
              </div>
              <h2 className="font-serif text-xl font-bold text-gold mb-1">{t("reading.chat.title")}</h2>
              <p className="text-white/30 text-xs">{t("reading.chat.desc")}</p>
            </div>
            <Suspense fallback={<div className="card-glass p-10 text-center"><Loader2 size={24} className="animate-spin text-gold/40 mx-auto" /></div>}>
              <ChatBox
                sessionId={id}
                availableAgents={WORKER_ORDER_ALL.filter((k: string) => workerMap[k]?.report && !workerMap[k]?.error)}
              />
            </Suspense>
          </div>
        )}

        </FadeInSection>
      </div>

      {/* ── QR Payment Modal (Report Unlock) ──────────────────── */}
      {id && (
        <Suspense fallback={null}>
          <QRPaymentModal
            open={showPayment}
            onClose={() => setShowPayment(false)}
            readingId={id}
            postAction="unlock"
            region={region}
            onSuccess={handlePaymentSuccess}
          />
        </Suspense>
      )}

      {/* ── Post-Analysis Modal (auto-shows with products) ──────── */}
      {products.length > 0 && (
        <Suspense fallback={null}>
          <PostAnalysisModal
            products={products}
            onViewPrescription={() => {
              setActiveTab("master")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          />
        </Suspense>
      )}

      {/* ════════════════════════════════════════════════════════════
          KEYFRAMES (injected via style tag)
          ════════════════════════════════════════════════════════════ */}
      <style jsx global>{`
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes hero-border-spin {
          to { --angle: 360deg; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

/** Simple fade-in wrapper for tab transitions — pure CSS, no state */
function FadeInSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="animate-[fadeInUp_0.35s_ease-out_both]"
      style={{
        opacity: 1,
        transform: "translateY(0)",
      }}
    >
      {children}
    </div>
  )
}
