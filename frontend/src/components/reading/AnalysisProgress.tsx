"use client"

import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  Sparkles,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const EnergyOrb = lazy(() => import("./EnergyOrb"))

type AgentStatus = "pending" | "running" | "done" | "error" | "skipped"

interface AnalysisProgressProps {
  progressPct: number
  progressMessage: string
  agentStatus: Record<string, AgentStatus>
  phase: string
  masterSummary?: string
  startTime: number
}

const AGENT_ORDER_BASE = ["bazi", "astrology", "tarot", "qimen", "ziwei", "face", "palm"] as const

const AGENT_I18N: Record<string, { label: string; running: string; done: string }> = {
  bazi: { label: "analysis.bazi.label", running: "analysis.bazi.running", done: "analysis.bazi.done" },
  astrology: { label: "analysis.astrology.label", running: "analysis.astrology.running", done: "analysis.astrology.done" },
  tarot: { label: "analysis.tarot.label", running: "analysis.tarot.running", done: "analysis.tarot.done" },
  qimen: { label: "analysis.qimen.label", running: "analysis.qimen.running", done: "analysis.qimen.done" },
  ziwei: { label: "analysis.ziwei.label", running: "analysis.ziwei.running", done: "analysis.ziwei.done" },
  face: { label: "analysis.face.label", running: "analysis.face.running", done: "analysis.face.done" },
  palm: { label: "analysis.palm.label", running: "analysis.palm.running", done: "analysis.palm.done" },
  partner_face: { label: "analysis.partnerFace.label", running: "analysis.partnerFace.running", done: "analysis.partnerFace.done" },
  partner_palm: { label: "analysis.partnerPalm.label", running: "analysis.partnerPalm.running", done: "analysis.partnerPalm.done" },
}

const FALLBACK_AGENT_LABELS: Record<string, { zh: string; en: string }> = {
  bazi: { zh: "八字结构", en: "Bazi structure" },
  astrology: { zh: "西方星盘", en: "Birth chart" },
  tarot: { zh: "象征牌阵", en: "Symbol spread" },
  qimen: { zh: "策略推演", en: "Strategy model" },
  ziwei: { zh: "行为格局", en: "Pattern model" },
  face: { zh: "面相识别", en: "Face reading" },
  palm: { zh: "手相识别", en: "Palm reading" },
  partner_face: { zh: "伴侣面相", en: "Partner face" },
  partner_palm: { zh: "伴侣手相", en: "Partner palm" },
  master: { zh: "综合报告", en: "Final synthesis" },
}

const STAGE_COPY = [
  {
    min: 0,
    zh: { title: "初始化资料", detail: "正在校验出生信息、问题方向和输入素材。" },
    en: { title: "Preparing inputs", detail: "Checking birth data, focus question, and uploaded material." },
  },
  {
    min: 10,
    zh: { title: "建立基础画像", detail: "正在生成基础命盘、行为底色和维度坐标。" },
    en: { title: "Building profile", detail: "Creating the base chart, behavior profile, and dimension map." },
  },
  {
    min: 35,
    zh: { title: "专家单项分析", detail: "多个分析模块正在并行返回关键证据。" },
    en: { title: "Specialist analysis", detail: "Specialist modules are returning evidence in parallel." },
  },
  {
    min: 65,
    zh: { title: "交叉校验", detail: "正在比对不同维度，过滤重复和矛盾结论。" },
    en: { title: "Cross-checking", detail: "Comparing dimensions and removing duplicate or conflicting signals." },
  },
  {
    min: 85,
    zh: { title: "生成报告结构", detail: "正在整理摘要、行动建议和可读报告段落。" },
    en: { title: "Writing report", detail: "Organizing the summary, actions, and readable report sections." },
  },
  {
    min: 98,
    zh: { title: "即将完成", detail: "正在保存报告，完成后会自动展示。" },
    en: { title: "Almost ready", detail: "Saving the report. It will open automatically when complete." },
  },
]

const STATUS_COPY = {
  zh: {
    complete: "报告已完成",
    stalled: "最终整合通常会稍久，请保持页面打开。",
    waiting: "正在等待专家模型返回结果。",
    dimensions: "个维度完成",
    elapsed: "已用时",
    savedHint: "生成完成后会保存到我的报告。",
    currentStage: "当前阶段",
    progressLabel: "报告生成进度",
    preview: "报告预览",
    pending: "等待",
    running: "进行中",
    done: "完成",
    error: "需复核",
    skipped: "跳过",
  },
  en: {
    complete: "Report complete",
    stalled: "Final synthesis can take a little longer. Keep this page open.",
    waiting: "Waiting for specialist model results.",
    dimensions: "dimensions complete",
    elapsed: "Elapsed",
    savedHint: "The finished report will be saved to My Reports.",
    currentStage: "Current stage",
    progressLabel: "Report generation progress",
    preview: "Report preview",
    pending: "Queued",
    running: "Running",
    done: "Done",
    error: "Review",
    skipped: "Skipped",
  },
}

function getStage(progressPct: number, phase: string, isZh: boolean) {
  if (phase === "done") {
    return isZh
      ? { title: "分析完成", detail: "报告已生成，正在进入完整结果。" }
      : { title: "Analysis complete", detail: "The report is ready and opening now." }
  }
  const stage = [...STAGE_COPY].reverse().find(item => progressPct >= item.min) || STAGE_COPY[0]
  return isZh ? stage.zh : stage.en
}

function getSafeTranslation(t: (key: string) => string, key: string, fallback: string): string {
  const value = t(key)
  if (!value || value === key) return fallback
  const hasBrokenChar = Array.from(value).some(char => {
    const code = char.charCodeAt(0)
    return code === 0xfffd || (code >= 0xe000 && code <= 0xf8ff) || code === 0x9205 || code === 0x9365
  })
  return hasBrokenChar ? fallback : value
}

function getAgentLabel(agentId: string, isZh: boolean, t: (key: string) => string): string {
  const fallback = FALLBACK_AGENT_LABELS[agentId]?.[isZh ? "zh" : "en"] || agentId
  const key = AGENT_I18N[agentId]?.label
  return key ? getSafeTranslation(t, key, fallback) : fallback
}

function getElapsed(startTime: number): string {
  const secs = Math.max(0, Math.floor((Date.now() - startTime) / 1000))
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

function StatusIcon({ status, running }: { status: AgentStatus; running: boolean }) {
  if (status === "done") return <CheckCircle2 size={15} className="text-emerald-300" />
  if (status === "error") return <AlertCircle size={15} className="text-rose-300" />
  if (running) return <Loader2 size={15} className="text-gold animate-spin" />
  if (status === "skipped") return <Circle size={15} className="text-parchment-400" />
  return <Clock3 size={15} className="text-parchment-400" />
}

function AnalysisProgressInner({
  progressPct,
  progressMessage,
  agentStatus,
  phase,
  masterSummary,
  startTime,
}: AnalysisProgressProps) {
  const { locale, t } = useLanguage()
  const isZh = locale === "zh"
  const copy = isZh ? STATUS_COPY.zh : STATUS_COPY.en
  const displayPct = Math.max(0, Math.min(100, progressPct || 0))
  const isComplete = phase === "done"
  const [elapsedTick, setElapsedTick] = useState(0)
  const [isStalled, setIsStalled] = useState(false)
  const [previewText, setPreviewText] = useState("")
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null)

  const agentOrder = useMemo(() => {
    const base: string[] = [...AGENT_ORDER_BASE]
    if (agentStatus.partner_face) base.push("partner_face")
    if (agentStatus.partner_palm) base.push("partner_palm")
    return base
  }, [agentStatus])

  const completedCount = useMemo(
    () => Object.values(agentStatus).filter(status => status === "done" || status === "error" || status === "skipped").length,
    [agentStatus],
  )

  const runningAgent = useMemo(() => {
    const entry = Object.entries(agentStatus).find(([, status]) => status === "running")
    return entry ? entry[0] : null
  }, [agentStatus])

  const stage = useMemo(() => getStage(displayPct, phase, isZh), [displayPct, phase, isZh])

  useEffect(() => {
    if (isComplete) return
    const timer = setInterval(() => setElapsedTick(value => value + 1), 5000)
    return () => clearInterval(timer)
  }, [isComplete])

  useEffect(() => {
    if (displayPct >= 95 && !isComplete) {
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
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current)
        stallTimerRef.current = null
      }
    }
  }, [displayPct, isComplete])

  useEffect(() => {
    if (!masterSummary || masterSummary.length < 20) return
    const excerpt = masterSummary.replace(/\s+/g, " ").trim().slice(0, 220)
    let idx = 0
    const timer = setInterval(() => {
      idx += 3
      setPreviewText(excerpt.slice(0, idx))
      if (idx >= excerpt.length) clearInterval(timer)
    }, 24)
    return () => clearInterval(timer)
  }, [masterSummary])

  const elapsed = useMemo(() => getElapsed(startTime), [elapsedTick, startTime])

  const statusMessage = useMemo(() => {
    if (isComplete) return copy.complete
    if (isStalled) return copy.stalled
    if (runningAgent) {
      const label = getAgentLabel(runningAgent, isZh, t)
      return isZh ? `${label}正在分析中` : `${label} is running`
    }
    return progressMessage || copy.waiting
  }, [copy.complete, copy.stalled, copy.waiting, isComplete, isStalled, runningAgent, isZh, progressMessage, t])

  const visibleAgents = useMemo(() => {
    return agentOrder.map(agentId => {
      const status = agentStatus[agentId] || "pending"
      const skipped = (agentId === "face" || agentId === "palm") && status === "pending" && (phase === "master" || isComplete)
      return {
        id: agentId,
        label: getAgentLabel(agentId, isZh, t),
        status: skipped ? "skipped" as AgentStatus : status,
      }
    })
  }, [agentOrder, agentStatus, phase, isComplete, isZh, t])

  const masterStatus: AgentStatus = isComplete ? "done" : phase === "master" ? "running" : "pending"

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5" aria-live="polite">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-serif font-semibold text-gold">{t("analysis.title")}</h3>
        <p className="text-sm text-parchment-400">
          {completedCount}/{agentOrder.length} {copy.dimensions} · {copy.elapsed} {elapsed}
        </p>
        <p className="text-xs text-parchment-400">{copy.savedHint}</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-5 items-center">
        <div className="relative min-h-[220px]">
          <Suspense fallback={<div className="h-[220px] rounded-full bg-gold/10 animate-pulse" />}>
            <EnergyOrb
              progressPct={displayPct}
              agentStatus={agentStatus}
              phase={phase}
              completedCount={completedCount}
              totalAgents={agentOrder.length}
            />
          </Suspense>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4 sm:p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-9 w-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
              {isComplete ? <CheckCircle2 size={18} className="text-emerald-300" /> : <Sparkles size={18} className="text-gold" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.14em] text-parchment-400">{copy.currentStage}</p>
              <h4 className="text-base font-semibold text-parchment-200 mt-1">{stage.title}</h4>
              <p className="text-sm text-parchment-400 leading-relaxed mt-1">{stage.detail}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs text-parchment-400">{copy.progressLabel}</span>
              <span className="font-mono text-sm font-semibold text-gold">{Math.round(displayPct)}%</span>
            </div>
            <div
              className={`relative h-2.5 bg-white/[0.07] rounded-full overflow-hidden ${isStalled ? "progress-breathing" : ""}`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(displayPct)}
              aria-label={copy.progressLabel}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${displayPct}%`,
                  background: isComplete
                    ? "linear-gradient(90deg, #10b981, #6ee7b7)"
                    : "linear-gradient(90deg, #8B6914, #C9A84C, #E8D5A0)",
                  boxShadow: isComplete
                    ? "0 0 18px rgba(16, 185, 129, 0.45)"
                    : "0 0 18px rgba(201, 168, 76, 0.35)",
                  transition: "width 0.8s ease-out",
                }}
              />
            </div>
          </div>

          <div className={`rounded-xl border px-3 py-2 text-sm ${
            isStalled
              ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-100/80"
              : "border-white/[0.06] bg-black/15 text-parchment-300"
          }`}>
            {statusMessage}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {visibleAgents.map(agent => {
          const running = agent.status === "running"
          return (
            <div
              key={agent.id}
              className={`min-h-[58px] rounded-xl border px-3 py-2 flex items-center gap-2 transition-colors ${
                running
                  ? "border-gold/35 bg-gold/[0.08]"
                  : agent.status === "done"
                    ? "border-emerald-300/20 bg-emerald-300/[0.055]"
                    : agent.status === "error"
                      ? "border-rose-300/20 bg-rose-300/[0.055]"
                      : "border-white/[0.07] bg-white/[0.025]"
              }`}
            >
              <StatusIcon status={agent.status} running={running} />
              <div className="min-w-0">
                <p className="text-xs text-parchment-200 truncate">{agent.label}</p>
                <p className="text-xs text-parchment-400">
                  {agent.status === "done"
                    ? copy.done
                    : running
                      ? copy.running
                      : agent.status === "error"
                        ? copy.error
                        : agent.status === "skipped"
                          ? copy.skipped
                          : copy.pending}
                </p>
              </div>
            </div>
          )
        })}
        <div className={`min-h-[58px] rounded-xl border px-3 py-2 flex items-center gap-2 ${
          masterStatus === "running"
            ? "border-gold/35 bg-gold/[0.08]"
            : masterStatus === "done"
              ? "border-emerald-300/20 bg-emerald-300/[0.055]"
              : "border-white/[0.07] bg-white/[0.025]"
        }`}>
          <StatusIcon status={masterStatus} running={masterStatus === "running"} />
          <div className="min-w-0">
            <p className="text-xs text-parchment-200 truncate">{FALLBACK_AGENT_LABELS.master[isZh ? "zh" : "en"]}</p>
            <p className="text-xs text-parchment-400">
              {masterStatus === "done" ? copy.done : masterStatus === "running" ? copy.running : copy.pending}
            </p>
          </div>
        </div>
      </div>

      {previewText && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4">
          <p className="text-xs text-gold/70 font-medium mb-2">{copy.preview}</p>
          <p className="text-sm text-parchment-300 leading-relaxed">{previewText}</p>
        </div>
      )}
    </div>
  )
}

export default React.memo(AnalysisProgressInner, (prev, next) => {
  if (prev.progressPct !== next.progressPct) return false
  if (prev.progressMessage !== next.progressMessage) return false
  if (prev.phase !== next.phase) return false
  if (prev.startTime !== next.startTime) return false
  if (prev.masterSummary !== next.masterSummary) return false

  const prevKeys = Object.keys(prev.agentStatus)
  const nextKeys = Object.keys(next.agentStatus)
  if (prevKeys.length !== nextKeys.length) return false
  for (const key of prevKeys) {
    if (prev.agentStatus[key] !== next.agentStatus[key]) return false
  }
  return true
})
