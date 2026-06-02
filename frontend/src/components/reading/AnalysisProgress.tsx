"use client"

import React, { useEffect, useRef, useState, useMemo, Suspense, lazy } from "react"
import { AGENT_LABELS } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

const EnergyOrb = lazy(() => import("./EnergyOrb"))

type AgentStatus = "pending" | "running" | "done" | "error" | "skipped"

const AGENT_ORDER_BASE = ["bazi", "astrology", "tarot", "qimen", "ziwei", "face", "palm"] as const

const AGENT_I18N: Record<string, { running: string; done: string }> = {
  bazi:      { running: "analysis.bazi.running", done: "analysis.bazi.done" },
  astrology: { running: "analysis.astrology.running", done: "analysis.astrology.done" },
  tarot:     { running: "analysis.tarot.running", done: "analysis.tarot.done" },
  qimen:     { running: "analysis.qimen.running", done: "analysis.qimen.done" },
  ziwei:     { running: "analysis.ziwei.running", done: "analysis.ziwei.done" },
  face:      { running: "analysis.face.running", done: "analysis.face.done" },
  palm:      { running: "analysis.palm.running", done: "analysis.palm.done" },
  partner_face: { running: "analysis.partnerFace.running", done: "analysis.partnerFace.done" },
  partner_palm: { running: "analysis.partnerPalm.running", done: "analysis.partnerPalm.done" },
}

// ── Wisdom quotes shown during analysis ────────────────────────────────────
const WISDOM_QUOTES_ZH = [
  "80% 的爆仓发生在枭神夺食日 — 了解你的命盘，远离冲动交易。",
  "命由天定，运由己生 — 每一次复盘都是在改写命运的代码。",
  "知己知彼，百战不殆 — 了解自己的五行格局，才能驾驭市场的波动。",
  "财为养命之源 — 但只有理解自己的财运周期，才能真正守住财富。",
  "官杀混杂者，决策易乱 — 清晰的认知是行动的前提。",
  "食神制杀，以柔克刚 — 最好的交易策略往往是等待。",
]
const WISDOM_QUOTES_EN = [
  "80% of liquidations happen on days of Clash energy — know your chart, avoid impulsive trades.",
  "Destiny sets the path, but wisdom lights the way — every review rewrites your code.",
  "Know yourself before the market — understand your elemental balance to master volatility.",
  "Wealth sustains life — but only understanding your fortune cycles truly preserves it.",
  "When conflicting stars clash, decisions scatter — clarity is the prerequisite for action.",
  "Softness overcomes hardness — the best trading strategy is often patience.",
]

/**
 * Return the target progress value directly.
 * Visual smoothness is handled by CSS `transition: width 0.8s ease-out`
 * on the progress bar element — no React state animation needed.
 */
function useSmoothProgress(target: number, _startTime: number): number {
  return target
}

interface AnalysisProgressProps {
  progressPct: number
  progressMessage: string
  agentStatus: Record<string, AgentStatus>
  phase: string
  masterSummary?: string
  startTime: number
}

// ── Data Stream Console Animation ──────────────────────────────────────────

const STREAM_LINES_ZH = [
  ">> 星盘数据库连接中...",
  ">> 加载天干地支映射表...",
  ">> 读取二十八星宿坐标...",
  ">> 八字排盘引擎初始化...",
  ">> 五行生克关系矩阵构建...",
  ">> 紫微斗数星曜排列...",
  ">> 奇门遁甲八门推演...",
  ">> 占星宫位计算中...",
  ">> 塔罗牌能量场检测...",
  ">> AI 宗师模型加载...",
  ">> 心魔识别算法启动...",
  ">> 命运雷达图渲染引擎...",
  ">> 五维运势能量捕捉...",
  ">> 流年大运数据同步...",
  ">> 交叉验证矩阵运算...",
  ">> 高维数据整合中...",
]
const STREAM_LINES_EN = [
  ">> Connecting to star chart database...",
  ">> Loading Heavenly Stems & Earthly Branches map...",
  ">> Reading 28 Lunar Mansions coordinates...",
  ">> BaZi pillar calculation engine init...",
  ">> Wu Xing generation/overcome matrix building...",
  ">> Ziwei Doushu star arrangement...",
  ">> Qimen Dunjia Eight Gates derivation...",
  ">> Astrology house calculation...",
  ">> Tarot energy field detection...",
  ">> AI Master model loading...",
  ">> Inner demon recognition algorithm starting...",
  ">> Destiny radar chart rendering engine...",
  ">> Five-dimension fortune energy capture...",
  ">> Transit & major cycle data sync...",
  ">> Cross-validation matrix computation...",
  ">> High-dimension data integration...",
]

const DataStream = React.memo(function DataStream({ isComplete, locale }: { isComplete: boolean; locale: string }) {
  const [lines, setLines] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const poolRef = useRef<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const pool = locale === "zh" ? STREAM_LINES_ZH : STREAM_LINES_EN
    poolRef.current = [...pool].sort(() => Math.random() - 0.5)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [locale])

  useEffect(() => {
    if (isComplete) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    let idx = 0
    intervalRef.current = setInterval(() => {
      const pool = poolRef.current
      const line = pool[idx % pool.length]
      const ts = new Date().toLocaleTimeString(locale === "zh" ? "zh-CN" : "en-US", { hour12: false })
      setLines(prev => {
        const next = [...prev, `[${ts}] ${line}`]
        return next.slice(-12) // keep last 12 lines
      })
      idx++
    }, 800 + Math.random() * 600)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isComplete, locale])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines])

  if (isComplete && lines.length === 0) return null

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
        </div>
        <span className="text-[10px] text-white/30 font-mono ml-1">
          {locale === "zh" ? "命盘智镜 · 计算终端" : "Destiny Mirror · Compute Terminal"}
        </span>
        {!isComplete && (
          <span className="ml-auto text-[10px] text-gold/50 font-mono animate-pulse">
            {locale === "zh" ? "● LIVE" : "● LIVE"}
          </span>
        )}
      </div>
      {/* Scrollable lines */}
      <div
        ref={containerRef}
        className="h-28 overflow-y-auto p-3 bg-black/40 font-mono text-[11px] leading-relaxed"
        style={{ scrollBehavior: "smooth" }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className="text-green-400/60"
            style={{ opacity: 0.4 + (i / lines.length) * 0.6 }}
          >
            {line}
          </div>
        ))}
        {!isComplete && (
          <span className="inline-block w-2 h-3.5 bg-gold/60 animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  )
})

// ── Wisdom Quote ───────────────────────────────────────────────────────────

const WisdomQuote = React.memo(function WisdomQuote({ locale }: { locale: string }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * WISDOM_QUOTES_ZH.length))
  const quotes = locale === "zh" ? WISDOM_QUOTES_ZH : WISDOM_QUOTES_EN

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx(prev => (prev + 1) % quotes.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [quotes.length])

  return (
    <div key={idx} className="text-center px-4 anim-fade-in">
      <p className="text-xs text-white/30 italic leading-relaxed">
        &ldquo;{quotes[idx]}&rdquo;
      </p>
    </div>
  )
})

// ── Completion Burst Animation ─────────────────────────────────────────────

function CompletionBurst() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center anim-fade-in">
      {/* Central burst */}
      <div
        className="w-40 h-40 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)",
          boxShadow: "0 0 80px rgba(201,168,76,0.3)",
          animation: "burstExpand 1.2s ease-out forwards",
        }}
      />
      {/* Expanding rings */}
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className="absolute w-32 h-32 rounded-full border border-gold/40"
          style={{
            animation: `ringExpand 1.5s ease-out ${delay}s forwards`,
          }}
        />
      ))}
      {/* Flash */}
      <div
        className="absolute inset-0 bg-gold/10"
        style={{ animation: "flashPulse 0.6s ease-out 0.3s forwards" }}
      />
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

function AnalysisProgressInner({
  progressPct,
  progressMessage,
  agentStatus,
  phase,
  masterSummary,
  startTime,
}: AnalysisProgressProps) {
  const { locale, t } = useLanguage()
  // Stabilize `t` via ref — prevents useMemo hooks below from recalculating
  // when parent re-renders but the locale/translations haven't changed.
  const tRef = useRef(t)
  tRef.current = t
  const stableT = useCallback((key: string) => tRef.current(key), [])
  const isZh = locale === "zh"
  const displayPct = useSmoothProgress(progressPct, startTime)
  const [previewText, setPreviewText] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isStalled, setIsStalled] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null)
  const burstShownRef = useRef(false)

  const isComplete = phase === "done"

  // Dynamic agent order — include partner_face/partner_palm when they appear in agentStatus
  const AGENT_ORDER: string[] = useMemo(() => {
    const base: string[] = [...AGENT_ORDER_BASE]
    if (agentStatus.partner_face) base.push("partner_face")
    if (agentStatus.partner_palm) base.push("partner_palm")
    return base
  }, [agentStatus])

  const completedCount = useMemo(() =>
    Object.values(agentStatus).filter((s) => s === "done" || s === "error").length,
    [agentStatus]
  )

  const runningAgent = useMemo(() => {
    const entry = Object.entries(agentStatus).find(([, s]) => s === "running")
    return entry ? entry[0] : null
  }, [agentStatus])

  // Stall detection — uses phase-only dependency to avoid re-running on every displayPct change
  const displayPctRef = useRef(displayPct)
  displayPctRef.current = displayPct

  useEffect(() => {
    // Check stall condition using ref (avoids effect restart on displayPct change)
    const checkStall = () => {
      if (displayPctRef.current >= 95 && phase !== "done") {
        if (!stallTimerRef.current) stallTimerRef.current = setTimeout(() => setIsStalled(true), 5000)
      } else {
        if (stallTimerRef.current) { clearTimeout(stallTimerRef.current); stallTimerRef.current = null }
        setIsStalled(false)
      }
    }
    checkStall()
    // Also check periodically in case displayPct crosses 95 between phase changes
    const pollTimer = setInterval(checkStall, 2000)
    return () => {
      if (stallTimerRef.current) { clearTimeout(stallTimerRef.current); stallTimerRef.current = null }
      clearInterval(pollTimer)
    }
  }, [phase])

  // Completion burst
  useEffect(() => {
    if (isComplete && !burstShownRef.current) {
      burstShownRef.current = true
      setShowBurst(true)
      setTimeout(() => setShowBurst(false), 2000)
    }
  }, [isComplete])

  // Typewriter for master summary
  useEffect(() => {
    if (!masterSummary || masterSummary.length < 20) return
    setShowPreview(true)
    const excerpt = masterSummary.slice(0, 200)
    let idx = 0
    const timer = setInterval(() => {
      idx += 2
      setPreviewText(excerpt.slice(0, idx))
      if (idx >= excerpt.length) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [masterSummary])

  const statusMessage = useMemo(() => {
    if (isStalled) return stableT("analysis.stalled")
    if (phase === "done") return stableT("analysis.done")
    if (phase === "master") return stableT("analysis.crossValidate")
    if (runningAgent) return AGENT_I18N[runningAgent] ? stableT(AGENT_I18N[runningAgent].running) : progressMessage
    return progressMessage || stableT("analysis.preparing")
  }, [isStalled, phase, runningAgent, progressMessage, stableT])

  // Update elapsed time display periodically (every 5s)
  const [elapsedTick, setElapsedTick] = useState(0)
  useEffect(() => {
    if (isComplete) return
    const timer = setInterval(() => setElapsedTick(t => t + 1), 5000)
    return () => clearInterval(timer)
  }, [isComplete])
  const elapsed = useMemo(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000)
    if (secs < 60) return `${secs}s`
    return `${Math.floor(secs / 60)}m ${secs % 60}s`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedTick, startTime])

  // Stage labels for dramatic display
  const stageLabel = useMemo(() => {
    if (isComplete) return isZh ? "分析完成" : "Analysis Complete"
    if (phase === "master") return isZh ? "✦ AI 宗师交叉验证" : "✦ AI Master Cross-Validation"
    if (runningAgent) {
      const icons: Record<string, string> = { bazi: "☯", astrology: "🌌", tarot: "🃏", qimen: "🔮", ziwei: "⭐", face: "👤", palm: "✋", partner_face: "👥", partner_palm: "🤲" }
      return `${icons[runningAgent] || "◆"} ${AGENT_I18N[runningAgent] ? stableT(AGENT_I18N[runningAgent].running) : ""}`
    }
    return isZh ? "◆ 系统初始化中..." : "◆ Initializing systems..."
  }, [isComplete, phase, runningAgent, stableT, isZh])

  return (
    <>
      {showBurst && <CompletionBurst />}
      <div className="w-full max-w-lg mx-auto space-y-5">
        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-serif font-semibold text-gold tracking-wide">
            {t("analysis.title")}
          </h3>
          <p className="text-sm text-white/50">
            {completedCount}/{AGENT_ORDER.length} {isZh ? "维度完成" : "dimensions"} · {elapsed}
          </p>
        </div>

        {/* 3D Energy Orb */}
        <div className="relative">
          <Suspense fallback={
            <div className="w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gold/20 animate-pulse" />
            </div>
          }>
            <EnergyOrb
              progressPct={displayPct}
              agentStatus={agentStatus}
              phase={phase}
              completedCount={completedCount}
              totalAgents={AGENT_ORDER.length}
            />
          </Suspense>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <p
              className="text-sm text-gold/80 font-medium drop-shadow-lg anim-fade-in"
            >
              {statusMessage}
            </p>
          </div>
        </div>

        {/* Data Stream Console */}
        <DataStream isComplete={isComplete} locale={locale} />

        {/* Agent Node Grid */}
        <div className="grid grid-cols-4 gap-3">
          {AGENT_ORDER.map((aid, idx) => {
            const info = AGENT_LABELS[aid]
            const status: AgentStatus = agentStatus[aid] || "pending"
            const isSkipped = (aid === "face" || aid === "palm") && status === "pending" && phase === "master"
            const isRunning = status === "running"

            return (
              <div
                key={aid}
                className={`
                  flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-500 anim-slide-up
                  ${isRunning
                    ? "border-gold/60 bg-gold/10 node-running"
                    : status === "done"
                    ? "border-green-500/40 bg-green-500/10 node-done"
                    : status === "error"
                    ? "border-red-400/40 bg-red-400/10"
                    : isSkipped
                    ? "border-white/10 bg-white/5 opacity-40"
                    : "border-white/10 bg-white/5 node-pending"
                  }
                `}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <span className="text-xl">{info.icon}</span>
                <span className="text-[11px] text-white/70 text-center leading-tight">
                  {info.label}
                </span>
                <span className={`
                  text-xs font-mono
                  ${status === "done" ? "text-green-400" : ""}
                  ${isRunning ? "text-gold" : ""}
                  ${status === "error" ? "text-red-400" : ""}
                  ${status === "pending" ? "text-white/30" : ""}
                `}>
                  {status === "done" ? "✓" : isRunning ? "◐" : status === "error" ? "✗" : isSkipped ? "—" : "○"}
                </span>
                {(isRunning || status === "done") && (
                  <span className="text-[9px] text-white/40 text-center leading-tight mt-0.5">
                    {isRunning ? (AGENT_I18N[aid] ? t(AGENT_I18N[aid].running) : "") : status === "done" ? (AGENT_I18N[aid] ? t(AGENT_I18N[aid].done) : "") : ""}
                  </span>
                )}
              </div>
            )
          })}
          {/* Master node */}
          <div
            className={`
              flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-500 anim-slide-up
              ${phase === "master"
                ? "border-gold/60 bg-gold/10 node-running"
                : phase === "done"
                ? "border-green-500/40 bg-green-500/10 node-done"
                : "border-white/10 bg-white/5 node-pending"
              }
            `}
            style={{ animationDelay: `${AGENT_ORDER.length * 0.08}s` }}
          >
            <span className="text-xl">{AGENT_LABELS.master.icon}</span>
            <span className="text-[11px] text-white/70 text-center leading-tight">
              {AGENT_LABELS.master.label}
            </span>
            <span className={`
              text-xs font-mono
              ${phase === "done" ? "text-green-400" : ""}
              ${phase === "master" ? "text-gold" : ""}
              ${phase !== "master" && phase !== "done" ? "text-white/30" : ""}
            `}>
              {phase === "done" ? "✓" : phase === "master" ? "◐" : "○"}
            </span>
          </div>
        </div>

        {/* Energy-Flow Progress Bar */}
        <div className="space-y-2">
          {/* Stage label */}
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-medium text-gold/70 anim-fade-in"
            >
              {stageLabel}
            </span>
            <span className="font-mono text-sm text-gold font-bold">{Math.round(displayPct)}%</span>
          </div>

          {/* Bar */}
          <div className={`relative h-2.5 bg-white/[0.06] rounded-full overflow-hidden ${isStalled ? "progress-breathing" : ""}`}>
            <div
              className="h-full rounded-full energy-flow-bar"
              style={{
                width: `${Math.min(100, displayPct)}%`,
                background: isComplete
                  ? "linear-gradient(90deg, #22c55e, #4ade80)"
                  : "linear-gradient(90deg, #8B6914, #C9A84C, #E8D5A0, #C9A84C, #8B6914)",
                boxShadow: isComplete
                  ? "0 0 16px rgba(34, 197, 94, 0.5)"
                  : "0 0 16px rgba(201, 168, 76, 0.4), 0 0 4px rgba(201, 168, 76, 0.6)",
                transition: "width 0.8s ease-out",
              }}
            />
            {/* Glow pulse overlay */}
            {!isComplete && (
              <div
                className="absolute inset-0 rounded-full animate-pulse-slow"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.15) 50%, transparent 100%)",
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              />
            )}
          </div>

          {/* Progress message */}
          <div className="flex justify-between items-center text-xs text-white/50">
            <span className="anim-fade-in">
              {progressMessage || t("analysis.preparing")}
            </span>
          </div>
        </div>

        {/* Wisdom Quote */}
        {!isComplete && <WisdomQuote locale={locale} />}

        {/* Preview */}
        {showPreview && previewText && (
          <div
            ref={previewRef}
            className="card-glass p-4 space-y-2 anim-slide-up"
          >
            <p className="text-xs text-gold/60 font-medium">{t("analysis.preview")}</p>
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line typewriter-cursor">
              {previewText}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

/**
 * Wrap in React.memo — props are already memoized by parent useMemo hooks,
 * so this prevents re-renders when parent re-renders but props haven't changed.
 * This breaks the re-render cascade that causes React error #310.
 */
export default React.memo(AnalysisProgressInner)
