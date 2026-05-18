"use client"
import { useState, useEffect, useRef } from "react"
import { X, Send, Loader2, Sparkles, ChevronDown, Calendar, Smile, Clock, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useUserStore } from "@/stores/useUserStore"
import { analyzeEvent } from "@/lib/api"

interface Props {
  open: boolean
  onClose: () => void
}

const EMOTION_LABELS: Record<number, string> = {
  1: "极度负面",
  2: "比较负面",
  3: "中性",
  4: "比较正面",
  5: "极度正面",
}

const LOADING_TIPS = [
  "正在合参时空盘口…",
  "正在格物因果链条…",
  "正在推演五行生克…",
  "正在解析心学密码…",
  "正在对齐天干地支…",
  "正在感应气场共振…",
]

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function GeworkDrawer({ open, onClose }: Props) {
  const [eventText, setEventText] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [eventDate, setEventDate] = useState(todayString)
  const [eventTime, setEventTime] = useState("")
  const [emotionScore, setEmotionScore] = useState(3)

  // Result state
  const [phase, setPhase] = useState<"input" | "loading" | "result">("input")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [tipIndex, setTipIndex] = useState(0)

  const { activeTestTarget, userProfile } = useUserStore()
  const resultRef = useRef<HTMLDivElement>(null)

  // Reset date to today when drawer opens
  useEffect(() => {
    if (open) {
      setEventDate(todayString())
      setPhase("input")
      setResult("")
      setError("")
    }
  }, [open])

  // Loading tip rotation
  useEffect(() => {
    if (phase !== "loading") return
    const timer = setInterval(() => {
      setTipIndex(i => (i + 1) % LOADING_TIPS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [phase])

  const handleSubmit = async () => {
    if (!eventText.trim()) return
    setPhase("loading")
    setError("")
    setTipIndex(0)

    const profile = activeTestTarget || userProfile

    // Build enriched question
    const parts = [eventText.trim()]
    if (showAdvanced) {
      if (eventDate) parts.push(`事件日期：${eventDate}`)
      if (eventTime) parts.push(`事件时间：${eventTime}`)
      if (emotionScore !== 3) parts.push(`当时情绪：${emotionScore}分（${EMOTION_LABELS[emotionScore]}）`)
    }
    const enrichedQuestion = parts.join("\n")

    try {
      const res = await analyzeEvent({
        session_id: profile?.id || "guest",
        event_description: enrichedQuestion,
        event_datetime: eventDate + (eventTime ? `T${eventTime}` : "T00:00:00"),
        emotion_score: emotionScore,
      })

      // Format result
      const sections = [
        res.causal_analysis && `### 因果分析\n${res.causal_analysis}`,
        res.current_advice && `### 当下建议\n${res.current_advice}`,
        res.future_prevention && `### 未来预防\n${res.future_prevention}`,
        res.remedy_keywords?.length && `### 化解关键词\n${res.remedy_keywords.join(" · ")}`,
      ].filter(Boolean)

      setResult(sections.join("\n\n"))
      setPhase("result")
    } catch (err: any) {
      console.error("[GeworkDrawer] analyze error:", err)
      setError(err?.response?.data?.detail || err?.message || "分析失败，请稍后重试")
      setPhase("input")
    }
  }

  const handleClose = () => {
    onClose()
    setEventText("")
    setShowAdvanced(false)
    setEmotionScore(3)
    setEventTime("")
    setPhase("input")
    setResult("")
    setError("")
  }

  const handleReset = () => {
    setPhase("input")
    setResult("")
    setError("")
  }

  // Simple markdown → JSX for result
  const renderResult = (md: string) => {
    return md.split("\n\n").map((block, i) => {
      if (block.startsWith("### ")) {
        return <h3 key={i} className="text-gold text-sm font-serif font-bold mt-4 mb-2">{block.slice(4)}</h3>
      }
      return <p key={i} className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{block}</p>
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-ink-light/95 backdrop-blur-xl border-l border-white/10 z-50 shadow-2xl"
          >
            <div className="h-full flex flex-col p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Sparkles size={20} className="text-gold" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-gold">格物致知</h2>
                    <p className="text-white/30 text-xs">特定事件 · AI 心学复盘</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content area — fills remaining space */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  {/* ── INPUT PHASE ──────────────────────────── */}
                  {phase === "input" && (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col min-h-0"
                    >
                      {/* Description */}
                      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-4">
                        <p className="text-white/50 text-sm leading-relaxed">
                          写下你当下的困惑、或是近期准备发生的重大事件。
                          AI 将结合你的命理底座，为你进行心学命理复盘分析。
                        </p>
                      </div>

                      {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-xs">
                          {error}
                        </div>
                      )}

                      <textarea
                        value={eventText}
                        onChange={(e) => setEventText(e.target.value)}
                        rows={6}
                        maxLength={500}
                        placeholder={"例：\n· 我最近收到了两个工作 offer，一个在大城市但薪资更高，一个在老家但离家人近\n· 我准备和朋友合伙创业，但担心时机不对\n· 和另一半的感情遇到了瓶颈，不知道该不该继续"}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 resize-none transition-all flex-1 min-h-[120px]"
                      />
                      <p className="text-white/20 text-xs mt-2 text-right">{eventText.length}/500</p>

                      {/* Advanced fields */}
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors mt-3 select-none"
                      >
                        <ChevronDown size={14} className={`transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
                        🛠️ 展开高级格物参数
                      </button>

                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 mt-3 space-y-4">
                              {/* Event date */}
                              <div>
                                <label className="flex items-center gap-1.5 text-xs text-white/40 mb-1.5">
                                  <Calendar size={12} /> 事件发生日期
                                </label>
                                <input
                                  type="date"
                                  value={eventDate}
                                  onChange={(e) => setEventDate(e.target.value)}
                                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm focus:border-gold/40 focus:outline-none transition-all"
                                />
                                <p className="text-white/20 text-[10px] mt-1">默认今天，可回溯历史事件</p>
                              </div>

                              {/* Event time */}
                              <div>
                                <label className="flex items-center gap-1.5 text-xs text-white/40 mb-1.5">
                                  <Clock size={12} /> 事件发生时间
                                </label>
                                <input
                                  type="time"
                                  value={eventTime}
                                  onChange={(e) => setEventTime(e.target.value)}
                                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm focus:border-gold/40 focus:outline-none transition-all"
                                />
                                <p className="text-white/20 text-[10px] mt-1">可选，精确到时辰更佳</p>
                              </div>

                              {/* Emotion slider */}
                              <div>
                                <label className="flex items-center gap-1.5 text-xs text-white/40 mb-1.5">
                                  <Smile size={12} /> 当时情绪感受
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min={1} max={5} step={1}
                                    value={emotionScore}
                                    onChange={(e) => setEmotionScore(Number(e.target.value))}
                                    className="flex-1 accent-gold h-1"
                                  />
                                  <span className="text-xs text-white/50 min-w-[90px] text-right">
                                    {emotionScore} · {EMOTION_LABELS[emotionScore]}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* ── LOADING PHASE ───────────────────────── */}
                  {phase === "loading" && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center gap-6"
                    >
                      {/* Animated ring */}
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-2 border-gold/20 rounded-full" />
                        <div className="absolute inset-0 border-2 border-transparent border-t-gold rounded-full animate-spin" />
                        <div className="absolute inset-2 border border-gold/10 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "3s" }} />
                        <Sparkles size={20} className="absolute inset-0 m-auto text-gold animate-pulse" />
                      </div>

                      {/* Rotating tips */}
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={tipIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-gold/70 text-sm text-center"
                        >
                          {LOADING_TIPS[tipIndex]}
                        </motion.p>
                      </AnimatePresence>

                      <p className="text-white/20 text-xs">预计 15-30 秒完成</p>
                    </motion.div>
                  )}

                  {/* ── RESULT PHASE ────────────────────────── */}
                  {phase === "result" && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col min-h-0"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-serif text-gold text-sm flex items-center gap-2">
                          <Sparkles size={14} /> 格物分析结果
                        </h3>
                        <button
                          onClick={handleReset}
                          className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors"
                        >
                          <RotateCcw size={12} /> 重新分析
                        </button>
                      </div>

                      <div ref={resultRef} className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                        {renderResult(result)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit button — only in input phase */}
              {phase === "input" && (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={!eventText.trim() || eventText.length > 500}
                    className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-4 disabled:opacity-40"
                  >
                    <Send size={16} />
                    开始格物分析
                  </button>
                  <p className="text-white/20 text-[10px] text-center mt-3">
                    将跳过塔罗与面相，直接基于命理底座生成事件复盘报告
                  </p>
                </>
              )}

              {/* Result phase: action buttons */}
              {phase === "result" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-full border border-white/20 text-white/60 text-sm hover:border-white/40 transition-all"
                  >
                    再次分析
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 btn-gold py-3 text-sm"
                  >
                    完成
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
