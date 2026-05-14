"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import {
  Loader2, Sparkles, ShoppingBag, AlertCircle,
  CheckCircle, MessageSquare, Tags, Gift, Lock,
  Crown, ArrowRight, TrendingUp, Zap, Star, Shield,
  ChevronDown, Eye, Clock, Compass, ScrollText,
} from "lucide-react"
import toast from "react-hot-toast"
import { getSession, matchProducts, unlockReport, streamSession, AnalysisResponse, Product, AGENT_LABELS, SSEEvent, AgentStatusValue } from "@/lib/api"
import AnalysisProgress from "@/components/reading/AnalysisProgress"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { ReportSection } from "@/components/reading/ReportSection"
import { ReadingSkeleton } from "@/components/reading/ReadingSkeleton"
import { ProductCard } from "@/components/reading/ProductCard"
import { ChatBox } from "@/components/reading/ChatBox"
import EventAnalyzer from "@/components/reading/EventAnalyzer"
import DailyAlmanac from "@/components/reading/DailyAlmanac"
import { DestinyRadar } from "@/components/reading/DestinyRadar"
import { ShareSheet } from "@/components/reading/ShareSheet"
import { PaywallGate } from "@/components/monetization/PaywallGate"
import { PaymentModal } from "@/components/monetization/PaymentModal"
import { PrescriptionCard } from "@/components/reading/PrescriptionCard"
import { FreeReportBanner } from "@/components/reading/FreeReportBanner"
import { EnergyIDCard } from "@/components/reading/EnergyIDCard"

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

function getWeakestDimension(scores: Record<string, number>): string {
  return Object.entries(scores).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "wealth"
}

function getWeakestLabel(scores: Record<string, number>): string {
  return DIM_LABELS[getWeakestDimension(scores)] ?? "财富"
}

function getStrongestDimension(scores: Record<string, number>): string {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "career"
}

function getStrongestLabel(scores: Record<string, number>): string {
  return DIM_LABELS[getStrongestDimension(scores)] ?? "事业"
}

/** Get a time-of-day greeting */
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return "夜深人静"
  if (h < 9) return "晨曦初照"
  if (h < 12) return "上午好"
  if (h < 14) return "午安"
  if (h < 18) return "下午好"
  if (h < 21) return "傍晚好"
  return "夜色安宁"
}

const NAV_ITEMS = [
  { id: "master",    icon: "🌟", label: "总览",     desc: "全维度命盘" },
  { id: "bazi",      icon: "☯",  label: "八字",     desc: "周易命理" },
  { id: "qimen",     icon: "🎯", label: "奇门",     desc: "遁甲时空" },
  { id: "ziwei",     icon: "⭐", label: "紫微",     desc: "斗数星君" },
  { id: "astrology", icon: "✦",  label: "星盘",     desc: "西方占星" },
  { id: "tarot",     icon: "🃏", label: "塔罗",     desc: "灵性疗愈" },
  { id: "face",      icon: "👁",  label: "面相",     desc: "AI 观相" },
  { id: "palm",      icon: "🤚", label: "手相",     desc: "掌中乾坤" },
  { id: "event",     icon: "🔍", label: "复盘",     desc: "事件溯源" },
  { id: "almanac",   icon: "📅", label: "黄历",     desc: "今日宜忌" },
  { id: "shop",      icon: "🎁", label: "改运",     desc: "专属好物" },
  { id: "chat",      icon: "💬", label: "追问",     desc: "AI 解惑" },
]

export default function ReadingPage() {
  const { id } = useParams<{ id: string }>()
  const { user, refreshUser } = useAuth()
  const { locale } = useLanguage()
  const [data, setData]         = useState<AnalysisResponse | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [shopLoading, setShopLoading] = useState(false)
  const [shopFetched, setShopFetched] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("master")

  const [showPayment, setShowPayment] = useState(false)
  const [unlockLoading, setUnlockLoading] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)

  // SSE streaming progress
  const [ssePhase, setSsePhase] = useState<string>("")
  const [completedWorkers, setCompletedWorkers] = useState<Set<string>>(new Set())
  const [completedSubtasks, setCompletedSubtasks] = useState<Set<string>>(new Set())
  const [progressPct, setProgressPct] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")
  const [agentStatus, setAgentStatus] = useState<Record<string, AgentStatusValue>>({})
  const sseStartTime = useRef(Date.now())

  // Scroll-driven progressive reveal
  const [heroVisible, setHeroVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    getSession(id).then(d => {
      if (cancelled) return
      setData(d)
      setIsUnlocked(d.is_detail_unlocked)
      setLoading(false)

      // If already done, no need for SSE
      if (d.status === "done" || d.status === "chat") return

      // Connect to SSE stream for progressive updates
      streamSession(id, (event: SSEEvent) => {
        if (cancelled) return
        if (event.type === "phase" && event.phase) {
          setSsePhase(event.phase)
        }
        if (event.type === "progress" && event.pct !== undefined) {
          setProgressPct(event.pct)
          if (event.message) setProgressMessage(event.message)
        }
        if (event.type === "agent_status" && event.status) {
          setAgentStatus(event.status)
        }
        if (event.type === "worker_done" && event.agent_id) {
          setCompletedWorkers(prev => new Set(prev).add(event.agent_id!))
        }
        if (event.type === "subtask_done" && event.subtask) {
          setCompletedSubtasks(prev => new Set(prev).add(event.subtask!))
        }
        if (event.type === "complete") {
          setData(prev => prev ? {
            ...prev,
            master_summary: event.master_summary || prev.master_summary,
            master_detail: event.master_detail || prev.master_detail,
            status: "done",
          } : prev)
        }
      }).catch(() => {
        // SSE failed — data already loaded via getSession, polling handled by runAnalysis
      })
    }).catch(() => {
      if (!cancelled) {
        toast.error("无法加载报告")
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [id])

  // Trigger hero animation
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 150)
    return () => clearTimeout(t)
  }, [])

  const handleUnlock = useCallback(async (paymentMethod: string = "card") => {
    if (!id) return
    setUnlockLoading(true)
    try {
      const result = await unlockReport(id)
      setIsUnlocked(true)
      setShowPayment(false)
      if (result.shop_coupon_issued > 0) {
        toast.success(`报告已解锁！¥${result.shop_coupon_issued} 代金券已发放`)
      } else {
        toast.success("报告已解锁！")
      }
      refreshUser()
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "解锁失败，请稍后重试"
      toast.error(detail)
      throw err
    } finally {
      setUnlockLoading(false)
    }
  }, [id, refreshUser])

  if (loading) return <ReadingSkeleton phase="loading" />
  if (!data) return <ReadingSkeleton phase="error" />

  // Show AnalysisProgress when analysis is still running via SSE
  if (data.status !== "done" && data.status !== "chat") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AnalysisProgress
          progressPct={progressPct}
          progressMessage={progressMessage}
          agentStatus={agentStatus}
          phase={ssePhase || data.status}
          masterSummary={data.master_summary}
          startTime={sseStartTime.current}
        />
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
  const strongestLabel = data.dimension_scores ? getStrongestLabel(data.dimension_scores) : "事业"
  const weakestDim = data.dimension_scores ? getWeakestDimension(data.dimension_scores) : "wealth"
  const weakestLabel = data.dimension_scores ? getWeakestLabel(data.dimension_scores) : "财富"

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
                五维命理分析报告 · AI 精算
              </span>
            </div>
            <ShareSheet sessionId={id} />
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
                {getGreeting()} · 你的专属命盘已就绪
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
                命盘智镜 · 全维度解读
              </h1>

              {/* Subtitle */}
              <p
                className="text-white/50 text-sm md:text-base max-w-2xl leading-relaxed mb-8"
                style={{
                  transition: "all 0.6s ease-out 0.6s",
                  opacity: heroVisible ? 1 : 0,
                }}
              >
                八字命理 · 紫微斗数 · 奇门遁甲 · 西方星盘 · 塔罗疗愈 · AI面相 · 手相解读
                <br className="hidden sm:block" />
                七大命理系统融会贯通，AI 深度解析你的命运密码
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
                        <p className="text-[10px] md:text-xs text-white/30 mt-0.5">{label}</p>
                        {isWeakest && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Energy Digital ID Card ── */}
              {data.dimension_scores && (
                <div
                  style={{
                    transition: "all 0.8s ease-out 0.85s",
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  <EnergyIDCard
                    sessionId={id}
                    userId={user?.id}
                    dimensionScores={data.dimension_scores}
                  />
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
                    你的<span className="text-gold font-semibold">{strongestLabel}</span>能量最为充盈，
                    <span className="text-rose-400/80 font-semibold">{weakestLabel}</span>领域蕴含成长空间。
                    {isUnlocked
                      ? "深度报告已解锁，向下滑动探索你的完整命运图景。"
                      : "解锁完整报告，获取专属于你的年度命盘规划与改运策略。"}
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
                    解锁完整报告 · ¥69
                  </button>
                  <span className="text-white/20 text-xs">
                    解锁赠送 ¥60 代金券 + 3 天会员
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
                        {meta.label}
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
        <div className="bg-[#1a1430]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-1.5 shadow-2xl shadow-black/40">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
                            whitespace-nowrap transition-all duration-300 flex-shrink-0 group
                  ${activeTab === item.id
                    ? "bg-gold/15 text-gold shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"}`}
              >
                <span className="text-base transition-transform group-hover:scale-110 duration-200">
                  {item.icon}
                </span>
                <span className="hidden sm:inline">{item.label}</span>
                {activeTab === item.id && (
                  <span className="hidden md:inline text-[10px] text-gold/50 ml-0.5">{item.desc}</span>
                )}
              </button>
            ))}
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
                  <h2 className="font-serif text-lg md:text-xl font-bold text-gold">全维度命盘总览</h2>
                  <p className="text-white/20 text-xs">AI 综合分析你的命运蓝本</p>
                </div>
                <span className="ml-auto text-[10px] px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">
                  免费
                </span>
              </div>
              <div className="text-white/75 text-sm leading-relaxed whitespace-pre-line">
                {data.master_summary
                  ? stripMarkdown(data.master_summary)
                  : ssePhase
                    ? (
                      <span className="flex items-center gap-2 text-white/40">
                        <Loader2 size={14} className="animate-spin" />
                        {ssePhase === "parallel" && `专家分析中… (${completedWorkers.size}/7 完成)`}
                        {ssePhase === "master" && `综合 synthesis 中… (${completedSubtasks.size}/3 子任务)`}
                        {!["parallel", "master"].includes(ssePhase) && "分析准备中…"}
                      </span>
                    )
                    : "Master Agent 分析中…"
                }
              </div>
            </div>

            {/* ── Radar Chart ── */}
            {data.dimension_scores && (
              <div className="flex justify-center">
                <DestinyRadar scores={data.dimension_scores} />
              </div>
            )}

            {/* ── Tags ── */}
            {data.computed_tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {data.computed_tags.slice(0, 10).map((tag, i) => (
                  <span key={tag}
                    className="text-xs px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-white/50 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-300 cursor-default"
                    style={{ transitionDelay: `${i * 30}ms` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Zone 2: Free Report Banner */}
            {!isUnlocked && data.dimension_scores && (
              <FreeReportBanner
                weakestLabel={getWeakestLabel(data.dimension_scores)}
                onCtaClick={() => setActiveTab("shop")}
              />
            )}

            {/* Paid: Master Detail */}
            <PaywallGate
              isUnlocked={isUnlocked}
              title="年度命盘深度规划"
              description="解锁后获取针对你问题的详细分析、12个月运势详解、五行补救方案及专属商品推荐"
              priceDisplay="¥69"
              onUnlock={() => setShowPayment(true)}
              loading={unlockLoading}
              previewLines={5}
            >
              <div className="card-glass p-6 md:p-8 border-gold/20 bg-gradient-to-br from-gold/[0.03] to-transparent">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                    <Crown size={20} className="text-gold" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg md:text-xl font-bold text-gold">深度命盘分析 · 专属解答</h2>
                    <p className="text-white/20 text-xs">基于你的出生时辰精准推算</p>
                  </div>
                  <span className="ml-auto text-[10px] px-2 py-0.5 bg-gold/10 border border-gold/20 rounded-full text-gold/70">
                    已解锁
                  </span>
                </div>
                <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                  {stripMarkdown(data.master_detail || "深度报告加载中…")}
                </div>
              </div>
            </PaywallGate>

            {/* Zone 1: 专属处方单 */}
            {isUnlocked && data.recommended_products && data.recommended_products.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚕</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gold">专属处方单</h3>
                    <p className="text-white/25 text-[11px]">基于你的命盘弱点精准匹配</p>
                  </div>
                </div>
                {data.recommended_products.slice(0, 2).map((p, i) => (
                  <PrescriptionCard
                    key={p.id}
                    product={p}
                    variant={i === 0 ? "primary" : "secondary"}
                  />
                ))}
              </div>
            )}

            {/* Mini previews of each worker */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Compass size={16} className="text-white/30" />
                <h3 className="text-sm font-medium text-white/40">各命理系统摘要</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {WORKER_ORDER.map(k => {
                  const w = workerMap[k]
                  const meta = AGENT_LABELS[k]
                  if (!w.report) return null
                  return (
                    <button
                      key={k}
                      onClick={() => setActiveTab(k)}
                      className="card-glow p-4 text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{meta.icon}</span>
                        <span className={`font-medium text-sm ${meta.color}`}>{meta.label}分析</span>
                        {w.tags.length > 0 && (
                          <Tags size={11} className="text-white/20 ml-auto" />
                        )}
                      </div>
                      <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                        {stripMarkdown(w.report.slice(0, 100))}…
                      </p>
                      <p className="text-gold/40 text-[11px] mt-2 group-hover:text-gold/80 transition-colors">
                        点击查看完整分析 →
                      </p>
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
                <p className="text-white/50 text-sm">{AGENT_LABELS[k].label}分析遇到错误</p>
                <p className="text-white/25 text-xs mt-2 font-mono">{workerMap[k].error}</p>
              </div>
            ) : workerMap[k].report ? (
              <div className="space-y-4">
                <PaywallGate
                  isUnlocked={isUnlocked}
                  title={`${AGENT_LABELS[k].label}完整分析`}
                  description="解锁完整报告后查看每个命理体系的详细分析"
                  priceDisplay="¥69"
                  onUnlock={() => setShowPayment(true)}
                  loading={unlockLoading}
                  previewLines={3}
                >
                  <ReportSection
                    icon={AGENT_LABELS[k].icon}
                    title={`${AGENT_LABELS[k].label}完整分析`}
                    color={AGENT_LABELS[k].color}
                    content={workerMap[k].report}
                  />
                </PaywallGate>
                {workerMap[k].tags.length > 0 && (
                  <div className="card-glass p-5">
                    <p className="text-white/30 text-xs mb-3">分析标签</p>
                    <div className="flex flex-wrap gap-2">
                      {workerMap[k].tags.map(t => (
                        <span key={t} className="text-xs px-2.5 py-1 bg-white/[0.06] rounded-full text-white/50">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-glass p-12 text-center">
                <Eye size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm">未提供该项数据，分析已跳过</p>
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
              <h2 className="font-serif text-xl md:text-2xl font-bold text-gold mb-2">专属改运方案</h2>
              <p className="text-white/35 text-sm max-w-md">
                AI 深度分析你的命盘能量缺口，从数百件开运物中精准匹配
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
                <p className="text-white/50 text-sm mb-2">AI 将根据你的命盘分析结果</p>
                <p className="text-white/25 text-xs mb-8">为你精准匹配最适合的改运商品</p>
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
                      toast.error("商品匹配失败，请稍后重试")
                    } finally {
                      setShopLoading(false)
                    }
                  }}
                  disabled={shopLoading}
                  className="btn-gold flex items-center gap-2 mx-auto text-sm md:text-base"
                >
                  {shopLoading
                    ? <><Loader2 size={16} className="animate-spin" /> AI 匹配中…</>
                    : <><Sparkles size={16} /> 根据我的命盘推荐改运商品</>}
                </button>
              </div>
            ) : products.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-5">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="card-glass p-12 text-center">
                <ShoppingBag size={36} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm">暂未匹配到合适的改运商品</p>
                <p className="text-white/15 text-xs mt-1">请稍后再试</p>
              </div>
            )}
          </div>
        )}

        {/* ── Event Analyzer ─────────────────────────────── */}
        {activeTab === "event" && (
          <EventAnalyzer sessionId={id} />
        )}

        {/* ── Daily Almanac ──────────────────────────────── */}
        {activeTab === "almanac" && (
          <DailyAlmanac sessionId={id} />
        )}

        {/* ── Chat Loop ──────────────────────────────────── */}
        {activeTab === "chat" && (
          <div>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-gold" />
              </div>
              <h2 className="font-serif text-xl font-bold text-gold mb-1">继续追问</h2>
              <p className="text-white/30 text-xs">AI 自动路由到对应命理专家为你解答</p>
            </div>
            <ChatBox
              sessionId={id}
              availableAgents={WORKER_ORDER.filter(k => workerMap[k]?.report && !workerMap[k]?.error)}
            />
          </div>
        )}

        </FadeInSection>
      </div>

      {/* ── Payment Modal ────────────────────────────────── */}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onConfirm={handleUnlock}
        title="解锁完整报告"
        priceDisplay="¥69"
        description="解锁后获取年度命盘深度规划、12 个月运势详解及个性化改运策略"
        perks={[
          "解锁完整年度命盘规划",
          "赠送 ¥60 商城代金券（可购买任意改运商品）",
          "自动激活 3 天 Fate OS 会员试用",
          "解锁追问功能（10 次/报告）",
        ]}
      />

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
