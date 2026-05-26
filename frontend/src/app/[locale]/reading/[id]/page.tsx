"use client"
import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Loader2, Sparkles, ShoppingBag, AlertCircle,
  CheckCircle, MessageSquare, Tags, Gift, Lock,
  Crown, ArrowRight, TrendingUp, Zap, Star, Shield,
  ChevronDown, Eye, Clock, Compass, ScrollText, RefreshCw,
} from "lucide-react"
import toast from "react-hot-toast"
import { getSession, matchProducts, streamSession, AnalysisResponse, Product, AGENT_LABELS, SSEEvent, AgentStatusValue } from "@/lib/api"

const AGENT_I18N: Record<string, string> = {
  astrology: "agent.astrology", tarot: "agent.tarot", bazi: "agent.bazi",
  qimen: "agent.qimen", ziwei: "agent.ziwei", face: "agent.face",
  palm: "agent.palm", master: "agent.master",
}
// Core imports (always needed)
import AnalysisProgress from "@/components/reading/AnalysisProgress"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
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
const FreeReportBanner = lazy(() => import("@/components/reading/FreeReportBanner").then(m => ({ default: m.FreeReportBanner })))
const EnergyIDCard = lazy(() => import("@/components/reading/EnergyIDCard").then(m => ({ default: m.EnergyIDCard })))

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

const I18N_NAV_ITEMS = [
  { id: "master",    icon: "🌟", labelKey: "reading.nav.overview",     descKey: "reading.nav.overviewDesc" },
  { id: "bazi",      icon: "☯",  labelKey: "reading.nav.bazi",        descKey: "reading.nav.baziDesc" },
  { id: "qimen",     icon: "🎯", labelKey: "reading.nav.qimen",       descKey: "reading.nav.qimenDesc" },
  { id: "ziwei",     icon: "⭐", labelKey: "reading.nav.ziwei",       descKey: "reading.nav.ziweiDesc" },
  { id: "astrology", icon: "✦",  labelKey: "reading.nav.astrology",   descKey: "reading.nav.astrologyDesc" },
  { id: "tarot",     icon: "🃏", labelKey: "reading.nav.tarot",       descKey: "reading.nav.tarotDesc" },
  { id: "face",      icon: "👁",  labelKey: "reading.nav.face",        descKey: "reading.nav.faceDesc" },
  { id: "palm",      icon: "🤚", labelKey: "reading.nav.palm",        descKey: "reading.nav.palmDesc" },
  { id: "event",     icon: "🔍", labelKey: "reading.nav.event",       descKey: "reading.nav.eventDesc" },
  { id: "almanac",   icon: "📅", labelKey: "reading.nav.almanac",     descKey: "reading.nav.almanacDesc" },
  { id: "shop",      icon: "🎁", labelKey: "reading.nav.shop",        descKey: "reading.nav.shopDesc" },
  { id: "chat",      icon: "💬", labelKey: "reading.nav.chat",        descKey: "reading.nav.chatDesc" },
]

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
  const { locale, t } = useLanguage()
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

  // SSE streaming progress
  const [ssePhase, setSsePhase] = useState<string>("")
  const [completedWorkers, setCompletedWorkers] = useState<Set<string>>(new Set())
  const [completedSubtasks, setCompletedSubtasks] = useState<Set<string>>(new Set())
  const [progressPct, setProgressPct] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")
  const [agentStatus, setAgentStatus] = useState<Record<string, AgentStatusValue>>({})
  const sseStartTime = useRef(Date.now())

  // Stuck detection — if analysis stays in init/processing for >90s with no REAL progress, show retry
  const [isStuck, setIsStuck] = useState(false)
  const stuckTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastProgressPct = useRef(0)
  const lastSsePhase = useRef("")

  // Scroll-driven progressive reveal
  const [heroVisible, setHeroVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const navScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    // Start stuck timer: if status stays "init"/"processing" for 180s with no progress, show retry.
    // 180s because workers take ~65s + master phase ~30s = ~95s total; allow 2x headroom.
    const STUCK_TIMEOUT = 180_000
    const startStuckTimer = () => {
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current)
      stuckTimerRef.current = setTimeout(() => {
        if (!cancelled) setIsStuck(true)
      }, STUCK_TIMEOUT)
    }

    getSession(id).then(d => {
      if (cancelled) return
      setData(d)
      setIsUnlocked(d.is_detail_unlocked)
      setLoading(false)

      // If already done, no need for SSE
      if (d.status === "done" || d.status === "chat") return

      // Analysis is pending — start stuck timer
      startStuckTimer()

      // Connect to SSE stream for progressive updates
      let sseConnected = false
      streamSession(id, (event: SSEEvent) => {
        sseConnected = true
        if (cancelled) return
        if (event.type === "phase" && event.phase) {
          // Phase changed — reset stuck timer (real progress)
          if (event.phase !== lastSsePhase.current) {
            lastSsePhase.current = event.phase
            startStuckTimer()
          }
          setSsePhase(event.phase)
        }
        if (event.type === "progress" && event.pct !== undefined) {
          // Progress increased — reset stuck timer (real progress)
          if (event.pct > lastProgressPct.current) {
            lastProgressPct.current = event.pct
            startStuckTimer()
          }
          setProgressPct(event.pct)
          if (event.message) setProgressMessage(event.message)
        }
        if (event.type === "agent_status" && event.status) {
          setAgentStatus(event.status)
          // Agent status change means backend is alive — reset stuck timer
          startStuckTimer()
        }
        if (event.type === "worker_done" && event.agent_id) {
          setCompletedWorkers(prev => new Set(prev).add(event.agent_id!))
          startStuckTimer()  // Worker completed — analysis is progressing
        }
        if (event.type === "subtask_done" && event.subtask) {
          setCompletedSubtasks(prev => new Set(prev).add(event.subtask!))
          startStuckTimer()  // Subtask completed — analysis is progressing
        }
        if (event.type === "complete") {
          // Re-fetch full data from API to get correct dimension_scores
          // (SSE complete event doesn't include dimension_scores)
          // Pass lang param to bypass browser cache and get fresh data
          getSession(id, locale).then(fresh => {
            if (!cancelled) setData(fresh)
          }).catch(() => {
            // Fallback: update with SSE data only
            setData(prev => prev ? {
              ...prev,
              master_summary: event.master_summary || prev.master_summary,
              master_detail: event.master_detail || prev.master_detail,
              status: "done",
            } : prev)
          })
        }
      }).catch(() => {
        // SSE failed — fall back to polling
      }).then(() => {
        // If SSE didn't connect or failed, start polling as fallback
        if (!sseConnected && !cancelled) {
          const pollInterval = setInterval(async () => {
            if (cancelled) { clearInterval(pollInterval); return }
            try {
              const fresh = await getSession(id)
              if (fresh.status === "done" || fresh.status === "chat") {
                setData(fresh)
                setIsUnlocked(fresh.is_detail_unlocked)
                clearInterval(pollInterval)
              } else {
                // Update partial data
                setData(prev => prev ? { ...prev, ...fresh } : fresh)
              }
            } catch { /* ignore */ }
          }, 3000)
        }
      })
    }).catch(() => {
      if (!cancelled) {
        toast.error(t("reading.error.loadFailed"))
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current)
    }
  }, [id, locale])

  // Trigger hero animation
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 150)
    return () => clearTimeout(t)
  }, [])

  const handleUnlock = useCallback(async (paymentMethod: string = "card") => {
    if (!id) return
    // 打开 QR 支付弹窗，由用户扫码支付后自动解锁
    setShowPayment(true)
  }, [id])

  const handlePaymentSuccess = useCallback(async () => {
    setIsUnlocked(true)
    setShowPayment(false)
    toast.success(t("reading.error.unlocked"))
    refreshUser()
  }, [refreshUser])

  const handleStardustUnlock = useCallback(async () => {
    if (!id) return
    try {
      const { deductStardust } = await import("@/lib/api")
      const result = await deductStardust("report_unlock", id)
      if (result) {
        // Confirm the deduction
        const { api } = await import("@/lib/api")
        await api.post(`/api/credits/confirm?transaction_id=${result.transaction_id}`)
        // Unlock the report
        const { unlockReport } = await import("@/lib/api")
        await unlockReport(id)
        setIsUnlocked(true)
        toast.success(t("reading.unlockedSuccess"))
        refreshUser()
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("reading.unlockedFailed"))
    }
  }, [id, refreshUser])

  if (loading) return <ReadingSkeleton phase="loading" />
  if (!data) return <ReadingSkeleton phase="error" />

  // Show AnalysisProgress when analysis is still running via SSE
  if (data.status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-glass p-8 max-w-md text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400/80" />
          <h2 className="text-lg font-serif font-bold text-white mb-2">
            {t("analysis.stuckTitle") || "分析未能完成"}
          </h2>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            {t("analysis.stuckMessage") || "后台分析任务异常中断，请重新发起分析。"}
          </p>
          <button
            onClick={() => router.push("/reading/new")}
            className="btn-gold inline-flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} />
            {t("analysis.stuckRetry") || "重新分析"}
          </button>
        </div>
      </div>
    )
  }

  if (data.status !== "done" && data.status !== "chat") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        {isStuck ? (
          /* Stuck state — analysis hung, show retry button */
          <div className="card-glass p-8 max-w-md text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-amber-400/80" />
            <h2 className="text-lg font-serif font-bold text-white mb-2">
              {t("analysis.stuckTitle") || "分析似乎遇到了问题"}
            </h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              {t("analysis.stuckMessage") || "后台分析任务可能意外中断了。您可以重新发起分析。"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsStuck(false)}
                className="btn-gold-outline flex items-center gap-2 text-sm"
              >
                {t("analysis.stuckContinue") || "继续等待"}
              </button>
              <button
                onClick={() => router.push("/reading/new")}
                className="btn-gold flex items-center gap-2 text-sm"
              >
                <RefreshCw size={14} />
                {t("analysis.stuckRetry") || "重新分析"}
              </button>
            </div>
          </div>
        ) : (
          <AnalysisProgress
            progressPct={progressPct}
            progressMessage={progressMessage}
            agentStatus={agentStatus}
            phase={ssePhase || data.status}
            masterSummary={data.master_summary}
            startTime={sseStartTime.current}
          />
        )}
      </div>
    )
  }

  const workerMap: Record<string, typeof data.bazi> = {
    astrology: data.astrology,
    tarot:     data.tarot,
    bazi:      data.bazi,
    qimen:     data.qimen,
    ziwei:     data.ziwei,
    face:      data.face,
    palm:      data.palm,
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

        <div className="max-w-5xl mx-auto relative">
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
            <div className="relative bg-gradient-to-br from-[#1a1430]/90 via-[#1e1835]/90 to-[#140f24]/90 backdrop-blur-xl p-8 md:p-12">
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

              {/* ── Dimension Score Mini-Cards ── */}
              {data.dimension_scores && (
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

              {/* ── Energy Digital ID Card (hidden for RELATIONSHIP) ── */}
              {data.dimension_scores && data.intent !== "RELATIONSHIP" && (
                <div
                  style={{
                    transition: "all 0.8s ease-out 0.85s",
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  <Suspense fallback={<div className="h-32" />}>
                    <EnergyIDCard
                      sessionId={id}
                      userId={user?.id}
                      dimensionScores={data.dimension_scores}
                    />
                  </Suspense>
                </div>
              )}

              {/* ── Insight Blurb ── */}
              <div
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
              </div>

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

              {/* Worker badges */}
              <div
                className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/[0.06]"
                style={{
                  transition: "all 0.6s ease-out 1.05s",
                  opacity: heroVisible ? 1 : 0,
                }}
              >
                {WORKER_ORDER.map(k => {
                  const w = workerMap[k]
                  const meta = AGENT_LABELS[k]
                  return (
                    <div key={k} className="flex items-center gap-1.5">
                      <span className="text-sm">{meta.icon}</span>
                      <span className={`text-[11px] ${w.error ? "text-red-400/60" : "text-green-400/40"}`}>
                        {t(AGENT_I18N[k] || `agent.${k}`)}
                      </span>
                      {w.duration_ms && (
                        <span className="text-[10px] text-white/15 font-mono">
                          {(w.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          NAVIGATION — Side-oriented nav system
          ════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 mb-8 sticky top-16 z-30">
        <div className="bg-[#1a1430]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-1.5 shadow-2xl shadow-black/40 relative">
          {/* Scroll fade indicator on right edge */}
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#1a1430]/90 to-transparent rounded-r-2xl pointer-events-none z-10 md:hidden" />
          <div ref={navScrollRef} className="flex gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none scroll-smooth">
            {I18N_NAV_ITEMS.map(item => {
              const isWorkerTab = WORKER_ORDER.includes(item.id as typeof WORKER_ORDER[number])
              const isLocked = !isUnlocked && isWorkerTab
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1 px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium
                              whitespace-nowrap transition-all duration-300 flex-shrink-0 group
                    ${activeTab === item.id
                      ? "bg-gold/15 text-gold shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                      : isLocked
                        ? "text-white/25 hover:text-white/50 hover:bg-white/[0.04]"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"}`}
                >
                  <span className="text-sm sm:text-base transition-transform group-hover:scale-110 duration-200">
                    {item.icon}
                  </span>
                  <span className="hidden sm:inline">{t(item.labelKey)}</span>
                  {isLocked && (
                    <Lock size={10} className="text-white/20 -ml-0.5" />
                  )}
                  {activeTab === item.id && (
                    <span className="hidden lg:inline text-[10px] text-gold/50 ml-0.5">{t(item.descKey)}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          CONTENT AREA
          ════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4">
        <FadeInSection key={activeTab}>

        {/* ── Master Summary ──────────────────────────────────── */}
        {activeTab === "master" && (
          <div className="space-y-6">
            {/* Free: Master Summary */}
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
                {data.master_summary
                  ? stripMarkdown(data.master_summary)
                  : ssePhase
                    ? (
                      <span className="flex items-center gap-2 text-white/40">
                        <Loader2 size={14} className="animate-spin" />
                        {ssePhase === "parallel" && `${t("reading.progress.analyzing")} (${completedWorkers.size}/7)`}
                        {ssePhase === "master" && `${t("reading.progress.synthesizing")} (${completedSubtasks.size}/3)`}
                        {!["parallel", "master"].includes(ssePhase) && t("reading.progress.preparing")}
                      </span>
                    )
                    : t("reading.progress.masterAgent")
                }
              </div>
              {/* AI-generated content disclaimer — required by 《生成式人工智能服务管理暂行办法》 */}
              {data.master_summary && (
                <p className="mt-4 pt-3 border-t border-white/[0.06] text-white/25 text-[11px] leading-relaxed">
                  {t("reading.master.disclaimer")}
                </p>
              )}
            </div>

            {/* ── Radar Chart ── */}
            {data.dimension_scores && (
              <div className="flex justify-center">
                <Suspense fallback={<div className="h-64" />}>
                  <DestinyRadar
                    scores={data.dimension_scores}
                    labels={["wealth", "relationship", "career", "health", "spiritual"].map(k => t(I18N_DIM_KEYS[k]?.label || `reading.dim.${k}`))}
                  />
                </Suspense>
              </div>
            )}

            {/* ── Tags ── */}
            {data.computed_tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {data.computed_tags.slice(0, 10).map((tag, i) => (
                  <span key={tag} style={{ transitionDelay: `${i * 30}ms` }}>
                    <TagBadge tag={tag} size="md" />
                  </span>
                ))}
              </div>
            )}

            {/* Zone 2: Free Report Banner */}
            {!isUnlocked && data.dimension_scores && (
              <Suspense fallback={null}>
                <FreeReportBanner
                  weakestLabel={getWeakestLabel(data.dimension_scores, t)}
                  onCtaClick={() => setActiveTab("shop")}
                />
              </Suspense>
            )}

            {/* Paid: Master Detail */}
            <Suspense fallback={<div className="card-glass p-6 h-48" />}>
              <PaywallGate
                isUnlocked={isUnlocked}
                title={t("reading.master.detailTitle")}
                description={t("reading.insight.locked")}
                priceDisplay="¥69"
                onUnlock={() => setShowPayment(true)}
                loading={false}
                previewLines={5}
                stardustBalance={user?.stardust_balance || 0}
                onStardustUnlock={handleStardustUnlock}
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

            {/* Zone 1: 专属处方单 */}
            {isUnlocked && data.recommended_products && data.recommended_products.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚕</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gold">{t("reading.master.prescription")}</h3>
                    <p className="text-white/25 text-[11px]">{t("reading.master.prescriptionDesc")}</p>
                  </div>
                </div>
                <Suspense fallback={<div className="card-glass p-4 h-24" />}>
                  {data.recommended_products.slice(0, 2).map((p, i) => (
                    <PrescriptionCard
                      key={p.id}
                      product={p}
                      variant={i === 0 ? "primary" : "secondary"}
                    />
                  ))}
                </Suspense>
              </div>
            )}

            {/* Mini previews of each worker */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Compass size={16} className="text-white/30" />
                <h3 className="text-sm font-medium text-white/40">{t("reading.summary")}</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {WORKER_ORDER.map(k => {
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
        )}

        {/* ── Individual Worker Reports ───────────────────── */}
        {WORKER_ORDER.map(k => activeTab === k && (
          <div key={k}>
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
                    priceDisplay="¥69"
                    onUnlock={() => setShowPayment(true)}
                    loading={false}
                    previewLines={3}
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
                <p className="text-white/25 text-xs mb-8 max-w-sm mx-auto leading-relaxed">
                  {t("reading.worker.lockedDesc")}
                </p>
                <button
                  onClick={() => setShowPayment(true)}
                  className="btn-gold flex items-center gap-2 mx-auto text-sm px-8 py-3"
                >
                  <Crown size={16} />
                  {t("reading.worker.unlockFull")}
                  <span className="text-gold/60 ml-1">¥69</span>
                </button>
                <p className="text-white/20 text-[11px] mt-4">
                  {t("reading.worker.orUseStardust")} · {user?.stardust_balance || 0} ✦
                </p>
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

            {!shopFetched ? (
              <div className="card-glass p-10 md:p-16 text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center">
                    <Gift size={36} className="text-gold/40" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center animate-pulse">
                    <Sparkles size={10} className="text-gold" />
                  </div>
                </div>
                <p className="text-white/50 text-sm mb-2">{t("reading.shop.aiWill")}</p>
                <p className="text-white/25 text-xs mb-8">{t("reading.shop.matchForYou")}</p>
                <button
                  onClick={async () => {
                    setShopLoading(true)
                    try {
                      const result = await matchProducts({
                        weakness_tags: data.computed_tags,
                        master_summary: data.master_summary,
                        top_k: 6,
                        include_explain: true,
                      }, locale)
                      setProducts(result)
                      setShopFetched(true)
                    } catch {
                      toast.error(t("reading.shop.matchFailed"))
                    } finally {
                      setShopLoading(false)
                    }
                  }}
                  disabled={shopLoading}
                  className="btn-gold flex items-center gap-2 mx-auto text-sm md:text-base"
                >
                  {shopLoading
                    ? <><Loader2 size={16} className="animate-spin" /> {t("reading.shop.matching")}</>
                    : <><Sparkles size={16} /> {t("reading.shop.recommendBtn")}</>}
                </button>
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
                availableAgents={WORKER_ORDER.filter(k => workerMap[k]?.report && !workerMap[k]?.error)}
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

/** Simple fade-in wrapper for tab transitions */
function FadeInSection({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.35s ease-out, transform 0.35s ease-out",
      }}
    >
      {children}
    </div>
  )
}
