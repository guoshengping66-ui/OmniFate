"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import { getSession, streamSession, AnalysisResponse, SSEEvent, AgentStatusValue, type WorkerReport } from "@/lib/api"
import AnalysisProgress from "@/components/reading/AnalysisProgress"
import { useLanguage } from "@/contexts/LanguageContext"
import { AlertCircle, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useRegion } from "@/hooks/useRegion"

// Pure comparison — no closures, safe at module level
const WORKER_KEYS = ["bazi", "tarot", "qimen", "ziwei", "astrology", "face", "palm",
  "partner_face", "partner_palm"] as const

/**
 * Derive agent_status from worker data in an AnalysisResponse.
 *
 * SSE `agent_status` events are the primary source, but when the SSE connection
 * is lost or the backend doesn't emit them reliably, the polling fallback must
 * still drive agent node status changes.  Without this, the progress bar
 * advances (time-based + polling) while the 8 agent grid nodes stay stuck in
 * "pending" — they never turn green.
 */
const WORKER_FIELD_IDS: [string, string][] = [
  ["bazi", "bazi"], ["astrology", "astrology"], ["tarot", "tarot"],
  ["qimen", "qimen"], ["ziwei", "ziwei"], ["face", "face"], ["palm", "palm"],
  ["partner_face", "partner_face"], ["partner_palm", "partner_palm"],
]

function deriveAgentStatus(data: AnalysisResponse): Record<string, AgentStatusValue> {
  const out: Record<string, AgentStatusValue> = {}
  for (const [field, agentId] of WORKER_FIELD_IDS) {
    const worker = (data as any)[field] as WorkerReport | undefined
    if (!worker) continue
    if (worker.duration_ms !== undefined && worker.duration_ms !== null) {
      out[agentId] = worker.error ? "error" : "done"
    } else if (worker.report) {
      // Has a report but no duration_ms — treat as done (edge case: server
      // persisted the report but lost the timing metadata)
      out[agentId] = "done"
    }
    // else: worker hasn't produced output yet → leave as pending/running
    // (SSE agent_status events handle the running→done transition)
  }
  return out
}

function dataChanged(fresh: AnalysisResponse, prev: AnalysisResponse) {
  if (fresh.status !== prev.status) return true
  if (fresh.progress_pct !== prev.progress_pct) return true
  if (fresh.progress_message !== prev.progress_message) return true
  if (fresh.is_detail_unlocked !== prev.is_detail_unlocked) return true
  if (fresh.master_summary !== prev.master_summary) return true
  if (JSON.stringify(fresh.computed_tags) !== JSON.stringify(prev.computed_tags)) return true
  if (JSON.stringify(fresh.dimension_scores) !== JSON.stringify(prev.dimension_scores)) return true
  for (const key of WORKER_KEYS) {
    const f = fresh[key]; const p = prev[key]
    if (!f && !p) continue
    if (!f || !p) return true
    if (f.report !== p.report) return true
    if (JSON.stringify(f.tags) !== JSON.stringify(p.tags)) return true
  }
  return false
}

/**
 * Stricter comparison for done/failed handlers — only checks fields that matter
 * for the final result. Prevents re-render cascades when the backend returns
 * slightly different data on each poll (e.g. updated timestamps, minor field changes).
 */
function hasMeaningfulChange(fresh: AnalysisResponse, prev: AnalysisResponse) {
  if (fresh.status !== prev.status) return true
  if (fresh.master_summary !== prev.master_summary) return true
  if (fresh.is_detail_unlocked !== prev.is_detail_unlocked) return true
  if (fresh.is_detailed_unlocked !== prev.is_detailed_unlocked) return true
  if (JSON.stringify(fresh.dimension_scores) !== JSON.stringify(prev.dimension_scores)) return true
  if (JSON.stringify(fresh.computed_tags) !== JSON.stringify(prev.computed_tags)) return true
  for (const key of WORKER_KEYS) {
    const f = fresh[key]; const p = prev[key]
    if (!f && !p) continue
    if (!f || !p) return true
    if (f.report !== p.report) return true
    if (JSON.stringify(f.tags) !== JSON.stringify(p.tags)) return true
  }
  return false
}

interface Props {
  sessionId: string
  initialData: AnalysisResponse
  onComplete: (data: AnalysisResponse) => void
}

export default function AnalysisSession({ sessionId, initialData, onComplete }: Props) {
  const { locale, t, localeHref } = useLanguage()
  const router = useRouter()
  const { region } = useRegion()

  const [data, setData] = useState(initialData)
  const [ssePhase, setSsePhase] = useState("")
  const [completedWorkers, setCompletedWorkers] = useState<Set<string>>(new Set())
  const [completedSubtasks, setCompletedSubtasks] = useState<Set<string>>(new Set())
  const [progressPct, setProgressPct] = useState(() => {
    if (initialData.progress_pct && initialData.progress_pct > 0) return initialData.progress_pct
    if (initialData.status !== "done" && initialData.status !== "completed" &&
        initialData.status !== "chat" && initialData.status !== "failed") return 2
    return 0
  })
  const [progressMessage, setProgressMessage] = useState(() => {
    if (initialData.progress_message) return initialData.progress_message
    if (initialData.status !== "done" && initialData.status !== "completed" &&
        initialData.status !== "chat" && initialData.status !== "failed")
      return t("analysis.preparing")
    return ""
  })
  const [agentStatus, setAgentStatus] = useState<Record<string, AgentStatusValue>>(() =>
    deriveAgentStatus(initialData)
  )
  const [isStuck, setIsStuck] = useState(false)

  const lastDataRef = useRef(initialData)
  const lastProgressPctRef = useRef(progressPct)
  const lastProgressMsgRef = useRef(progressMessage)
  const lastProgressUpdateRef = useRef(0)
  const lastAgentStatusRef = useRef<Record<string, AgentStatusValue>>({})
  const sseStartTime = useRef(Date.now())
  const stuckTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastProgressPct = useRef(progressPct)
  const lastSsePhase = useRef("")
  const stalePollCountRef = useRef(0)
  const stuckShownRef = useRef(false)
  // Prevents multiple onComplete calls when polling and SSE race.
  // Once onComplete fires with terminal data, no further calls are made.
  const completionCalledRef = useRef(false)

  // ── Time-based progress fallback ────────────────────────────────────────
  // Ensures the progress bar advances even if SSE/polling events are delayed.
  // The backend typically reaches 5% within 5s, 65% by ~120s, and 100% by ~180s.
  // This fallback guarantees minimum progress based on elapsed time.
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    const timer = setInterval(() => {
      if (cancelled) return
      const elapsed = (Date.now() - sseStartTime.current) / 1000
      // Minimum progress based on elapsed time (conservative curve)
      let minPct = 2  // baseline
      if (elapsed > 5)  minPct = 5
      if (elapsed > 15) minPct = 10
      if (elapsed > 30) minPct = 20
      if (elapsed > 60) minPct = 35
      if (elapsed > 90) minPct = 50
      if (elapsed > 120) minPct = 65
      if (elapsed > 150) minPct = 75
      if (elapsed > 180) minPct = 85
      if (elapsed > 210) minPct = 90
      if (elapsed > 240) minPct = 95
      setProgressPct(prev => {
        if (prev < minPct) return minPct
        return prev
      })
    }, 3000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [sessionId])

  useEffect(() => {
    let cancelled = false
    let pollDone = false
    let pollInterval: ReturnType<typeof setInterval> | null = null
    let lastPollStatus = initialData.status

    const STALE_POLL_THRESHOLD = 30
    const STUCK_TIMEOUT = 120_000
    stalePollCountRef.current = 0
    stuckShownRef.current = false
    completionCalledRef.current = false

    const startStuckTimer = () => {
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current)
      stuckTimerRef.current = setTimeout(() => {
        if (cancelled) setIsStuck(true)
      }, STUCK_TIMEOUT)
    }

    // If already done, just report back
    if (initialData.status === "done" || initialData.status === "completed" || initialData.status === "chat") {
      completionCalledRef.current = true
      onComplete(initialData)
      return () => { cancelled = true }
    }

    startStuckTimer()

    // Polling fallback
    pollInterval = setInterval(async () => {
      if (cancelled || pollDone) { if (pollInterval) clearInterval(pollInterval); return }
      try {
        const fresh = await getSession(sessionId, locale)
        if (cancelled) return
        if (fresh.status === "done" || fresh.status === "completed" || fresh.status === "chat") {
          pollDone = true
          if (pollInterval) clearInterval(pollInterval)
          if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current)
          if (!completionCalledRef.current) {
            completionCalledRef.current = true
            lastDataRef.current = fresh
            onComplete(fresh)
          }
        } else if (fresh.status === "failed") {
          pollDone = true
          if (pollInterval) clearInterval(pollInterval)
          if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current)
          if (!completionCalledRef.current) {
            completionCalledRef.current = true
            lastDataRef.current = fresh
            onComplete(fresh)
          }
        } else {
          const prevData = lastDataRef.current
          if (!prevData || dataChanged(fresh, prevData)) {
            setData(fresh)
            lastDataRef.current = fresh
            // Derive agent status from worker data so the 8 agent grid nodes
            // update even when SSE agent_status events are not arriving.
            const derived = deriveAgentStatus(fresh)
            setAgentStatus(prev => {
              const merged = { ...prev }
              for (const [k, v] of Object.entries(derived)) {
                // "done"/"error" are terminal — always accept.  For other
                // values only fill in keys that SSE hasn't covered yet.
                if (v === "done" || v === "error" || !(k in merged) || merged[k] === "pending") {
                  merged[k] = v
                }
              }
              return merged
            })
          }
          const now = Date.now()
          if (fresh.progress_pct !== undefined && fresh.progress_pct > 0 &&
              fresh.progress_pct > lastProgressPctRef.current &&
              now - lastProgressUpdateRef.current >= 300) {
            lastProgressUpdateRef.current = now
            lastProgressPctRef.current = fresh.progress_pct
            setProgressPct(fresh.progress_pct)
          }
          const hasProgress = fresh.progress_pct !== undefined && fresh.progress_pct > 0
          const statusChanged = fresh.status !== lastPollStatus
          if (hasProgress || statusChanged) {
            stalePollCountRef.current = 0
            lastPollStatus = fresh.status
            startStuckTimer()
          } else {
            stalePollCountRef.current++
            if (stalePollCountRef.current >= STALE_POLL_THRESHOLD && !pollDone && !stuckShownRef.current) {
              stuckShownRef.current = true
              setIsStuck(true)
              if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current)
            }
          }
        }
      } catch { /* ignore */ }
    }, 3000)

    // SSE stream
    streamSession(sessionId, (event: SSEEvent) => {
      if (cancelled) return
      if (event.type === "phase" && event.phase) {
        if (event.phase !== lastSsePhase.current) {
          lastSsePhase.current = event.phase
          stalePollCountRef.current = 0
          startStuckTimer()
          setSsePhase(event.phase)
        }
      }
      if (event.type === "progress" && event.pct !== undefined) {
        if (event.pct > lastProgressPct.current) {
          lastProgressPct.current = event.pct
          stalePollCountRef.current = 0
          startStuckTimer()
          const now = Date.now()
          if (now - lastProgressUpdateRef.current >= 300 && event.pct! > lastProgressPctRef.current) {
            lastProgressUpdateRef.current = now
            lastProgressPctRef.current = event.pct!
            setProgressPct(event.pct!)
          }
          if (event.message && event.message !== lastProgressMsgRef.current) {
            lastProgressMsgRef.current = event.message
            setProgressMessage(event.message)
          }
        }
      }
      if (event.type === "agent_status" && event.status) {
        const prev = lastAgentStatusRef.current
        const next = event.status
        const changed = Object.keys(next).length !== Object.keys(prev).length ||
          Object.entries(next).some(([k, v]) => prev[k] !== v)
        if (changed) {
          lastAgentStatusRef.current = { ...next }
          setAgentStatus(next)
        }
        stalePollCountRef.current = 0
        startStuckTimer()
      }
      if (event.type === "worker_done" && event.agent_id) {
        setCompletedWorkers(prev => {
          if (prev.has(event.agent_id!)) return prev
          return new Set(prev).add(event.agent_id!)
        })
        stalePollCountRef.current = 0
        startStuckTimer()
      }
      if (event.type === "subtask_done" && event.subtask) {
        setCompletedSubtasks(prev => {
          if (prev.has(event.subtask!)) return prev
          return new Set(prev).add(event.subtask!)
        })
        stalePollCountRef.current = 0
        startStuckTimer()
      }
      if (event.type === "complete") {
        pollDone = true
        if (pollInterval) clearInterval(pollInterval)
        if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current)
        if (completionCalledRef.current) return
        completionCalledRef.current = true
        // Use lastDataRef (from latest poll) instead of re-fetching.
        // Re-fetching races with ReadingPage's initial fetch and causes
        // duplicate onComplete calls with slightly different data → React #310.
        const prev = lastDataRef.current
        if (prev) {
          const merged = {
            ...prev,
            status: "done" as const,
            master_summary: event.master_summary || prev.master_summary,
            master_detail: event.master_detail || prev.master_detail,
          }
          lastDataRef.current = merged
          if (!cancelled) onComplete(merged)
        }
      }
    }).catch(() => {})

    return () => {
      cancelled = true
      if (stuckTimerRef.current) { clearTimeout(stuckTimerRef.current); stuckTimerRef.current = null }
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [sessionId])

  const handleStardustUnlock = useCallback(async () => {
    if (!sessionId) return
    try {
      const { unlockReport } = await import("@/lib/api")
      await unlockReport(sessionId, "stardust")
      toast.success(t("reading.unlockedSuccess"))
      // Refresh data after unlock
      const fresh = await getSession(sessionId, locale)
      if (fresh) {
        setData(fresh)
        lastDataRef.current = fresh
        onComplete(fresh)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("reading.unlockedFailed"))
    }
  }, [sessionId, locale, t, onComplete])

  const analysisPhase = ssePhase || data?.status || ""

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {data.status === "failed" ? (
        <div className="card-glass p-8 max-w-md text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400/80" />
          <h2 className="text-lg font-serif font-bold text-white mb-2">
            {t("analysis.stuckTitle") || "分析未能完成"}
          </h2>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            {t("analysis.stuckMessage") || "后台分析任务异常中断，请重新发起分析。"}
          </p>
          <button
            onClick={() => router.push(localeHref("/reading/new"))}
            className="btn-gold inline-flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} />
            {t("analysis.stuckRetry") || "重新分析"}
          </button>
        </div>
      ) : isStuck ? (
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
              onClick={() => {
                setIsStuck(false)
                stuckShownRef.current = false
                stalePollCountRef.current = 0
              }}
              className="btn-gold-outline flex items-center gap-2 text-sm"
            >
              {t("analysis.stuckContinue") || "继续等待"}
            </button>
            <button
              onClick={() => router.push(localeHref("/reading/new"))}
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
          phase={analysisPhase}
          masterSummary={data?.master_summary}
          startTime={sseStartTime.current}
        />
      )}
    </div>
  )
}


