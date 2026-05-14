"use client"

import { useEffect, useRef, useState, useMemo, Suspense, lazy } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AGENT_LABELS } from "@/lib/api"

// Lazy-load EnergyOrb to avoid adding Three.js to the main bundle
const EnergyOrb = lazy(() => import("./EnergyOrb"))

type AgentStatus = "pending" | "running" | "done" | "error" | "skipped"

const AGENT_ORDER = ["bazi", "astrology", "tarot", "qimen", "ziwei", "face", "palm"] as const

const PHASE_LABELS: Record<string, string> = {
  init: "初始化命盘数据",
  parallel: "多维度并行解析中",
  master: "AI 综合交叉验证",
  done: "分析完成",
}

// Per-agent running status messages
const AGENT_RUNNING_MSG: Record<string, string> = {
  bazi:      "正在排盘推演四柱八字…",
  astrology: "正在计算行星轨道与宫位…",
  tarot:     "正在解读塔罗牌阵能量…",
  qimen:     "正在遁甲时空推演…",
  ziwei:     "正在排布紫微星盘…",
  face:      "正在分析面相特征…",
  palm:      "正在解读掌纹纹路…",
}

// Per-agent done messages
const AGENT_DONE_MSG: Record<string, string> = {
  bazi:      "八字排盘完成",
  astrology: "星盘计算完成",
  tarot:     "塔罗解读完成",
  qimen:     "奇门推演完成",
  ziwei:     "紫微排盘完成",
  face:      "面相分析完成",
  palm:      "手相解读完成",
}

interface AnalysisProgressProps {
  progressPct: number
  progressMessage: string
  agentStatus: Record<string, AgentStatus>
  phase: string
  masterSummary?: string
  startTime: number
}

export default function AnalysisProgress({
  progressPct,
  progressMessage,
  agentStatus,
  phase,
  masterSummary,
  startTime,
}: AnalysisProgressProps) {
  const [displayPct, setDisplayPct] = useState(0)
  const [previewText, setPreviewText] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isStalled, setIsStalled] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Compute completed count
  const completedCount = useMemo(() =>
    Object.values(agentStatus).filter((s) => s === "done" || s === "error").length,
    [agentStatus]
  )

  // Find currently running agent
  const runningAgent = useMemo(() => {
    const entry = Object.entries(agentStatus).find(([, s]) => s === "running")
    return entry ? entry[0] : null
  }, [agentStatus])

  // Smart progress: client-side smoothing when backend pct is behind
  useEffect(() => {
    const elapsed = (Date.now() - startTime) / 1000
    let target = progressPct

    // Front-loaded animation if backend hasn't caught up
    if (progressPct < 5 && elapsed > 2) {
      target = Math.min(5, (elapsed / 5) * 5)
    }
    if (progressPct < 40 && elapsed > 15 && progressPct < elapsed * 0.8) {
      target = Math.min(40, Math.max(progressPct, elapsed * 1.2))
    }

    setDisplayPct((prev) => {
      if (target > prev) return target
      return prev + (target - prev) * 0.3
    })
  }, [progressPct, startTime])

  // Detect stall at 95%+
  useEffect(() => {
    if (displayPct >= 95 && phase !== "done") {
      if (!stallTimerRef.current) {
        stallTimerRef.current = setTimeout(() => setIsStalled(true), 5000)
      }
    } else {
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current)
        stallTimerRef.current = null
      }
      setIsStalled(false)
    }
    return () => {
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current)
    }
  }, [displayPct, phase])

  // Typewriter effect for master summary preview
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

  // Dynamic status message
  const statusMessage = useMemo(() => {
    if (isStalled) return "AI 正在进行最后的高维数据整合…"
    if (phase === "done") return "分析完成"
    if (phase === "master") return "AI 正在进行跨维度交叉验证…"
    if (runningAgent) return AGENT_RUNNING_MSG[runningAgent] || progressMessage
    return progressMessage || "准备中…"
  }, [isStalled, phase, runningAgent, progressMessage])

  // Elapsed time
  const elapsed = useMemo(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000)
    if (secs < 60) return `${secs}s`
    return `${Math.floor(secs / 60)}m ${secs % 60}s`
  }, [progressPct, startTime]) // re-compute when progress changes

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-serif font-semibold text-gold tracking-wide">
          命盘智镜 · 深度解析中
        </h3>
        <p className="text-sm text-white/50">
          {PHASE_LABELS[phase] || "处理中…"} · {completedCount}/{AGENT_ORDER.length} 已完成 · {elapsed}
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
        {/* Overlay status text on the orb */}
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusMessage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-gold/80 font-medium drop-shadow-lg"
            >
              {statusMessage}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Agent Node Grid */}
      <div className="grid grid-cols-4 gap-3">
        {AGENT_ORDER.map((aid, idx) => {
          const info = AGENT_LABELS[aid]
          const status: AgentStatus = agentStatus[aid] || "pending"
          const isSkipped = (aid === "face" || aid === "palm") && status === "pending" && phase === "master"
          const isRunning = status === "running"

          return (
            <motion.div
              key={aid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-500
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
            >
              <span className="text-xl">{info.icon}</span>
              <span className="text-[11px] text-white/70 text-center leading-tight">
                {info.label}
              </span>
              <span
                className={`
                  text-xs font-mono
                  ${status === "done" ? "text-green-400" : ""}
                  ${isRunning ? "text-gold" : ""}
                  ${status === "error" ? "text-red-400" : ""}
                  ${status === "pending" ? "text-white/30" : ""}
                `}
              >
                {status === "done" ? "✓" : isRunning ? "◐" : status === "error" ? "✗" : isSkipped ? "—" : "○"}
              </span>
              {/* Per-agent status text */}
              {(isRunning || status === "done") && (
                <span className="text-[9px] text-white/40 text-center leading-tight mt-0.5">
                  {isRunning ? AGENT_RUNNING_MSG[aid] : status === "done" ? AGENT_DONE_MSG[aid] : ""}
                </span>
              )}
            </motion.div>
          )
        })}
        {/* Master node */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: AGENT_ORDER.length * 0.08 }}
          className={`
            flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-500
            ${phase === "master"
              ? "border-gold/60 bg-gold/10 node-running"
              : phase === "done"
              ? "border-green-500/40 bg-green-500/10 node-done"
              : "border-white/10 bg-white/5 node-pending"
            }
          `}
        >
          <span className="text-xl">{AGENT_LABELS.master.icon}</span>
          <span className="text-[11px] text-white/70 text-center leading-tight">
            {AGENT_LABELS.master.label}
          </span>
          <span
            className={`
              text-xs font-mono
              ${phase === "done" ? "text-green-400" : ""}
              ${phase === "master" ? "text-gold" : ""}
              ${phase !== "master" && phase !== "done" ? "text-white/30" : ""}
            `}
          >
            {phase === "done" ? "✓" : phase === "master" ? "◐" : "○"}
          </span>
        </motion.div>
      </div>

      {/* Smart Progress Bar */}
      <div className="space-y-2">
        <div className={`h-2 bg-white/10 rounded-full overflow-hidden ${isStalled ? "progress-breathing" : ""}`}>
          <div
            className="h-full rounded-full progress-bar-fill"
            style={{
              width: `${Math.min(100, displayPct)}%`,
              background: displayPct >= 100
                ? "linear-gradient(90deg, #22c55e, #4ade80)"
                : "linear-gradient(90deg, #C9A84C, #E8CB7A, #C9A84C)",
              boxShadow: displayPct >= 100
                ? "0 0 12px rgba(34, 197, 94, 0.5)"
                : "0 0 12px rgba(201, 168, 76, 0.4)",
            }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-white/50">
          <AnimatePresence mode="wait">
            <motion.span
              key={progressMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {progressMessage || "准备中…"}
            </motion.span>
          </AnimatePresence>
          <span className="font-mono text-gold/80">{Math.round(displayPct)}%</span>
        </div>
      </div>

      {/* Progressive Preview (typewriter) */}
      <AnimatePresence>
        {showPreview && previewText && (
          <motion.div
            ref={previewRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="card-glass p-4 space-y-2"
          >
            <p className="text-xs text-gold/60 font-medium">已生成分析预览</p>
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line typewriter-cursor">
              {previewText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
