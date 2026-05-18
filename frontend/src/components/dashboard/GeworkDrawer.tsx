"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Send, Loader2, Sparkles, ChevronDown, Calendar, Smile } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWizardStore } from "@/stores/useWizardStore"
import { useUserStore } from "@/stores/useUserStore"

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

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function GeworkDrawer({ open, onClose }: Props) {
  const [eventText, setEventText] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [eventDate, setEventDate] = useState(todayString)
  const [emotionScore, setEmotionScore] = useState(3) // 1-5, default neutral

  const { setIntent, prefillFromProfile, updateField } = useWizardStore()
  const { activeTestTarget, userProfile } = useUserStore()
  const router = useRouter()

  // Reset date to today when drawer opens
  useEffect(() => {
    if (open) setEventDate(todayString())
  }, [open])

  const handleSubmit = () => {
    if (!eventText.trim()) return
    setLoading(true)

    const profile = activeTestTarget || userProfile

    // Set intent and question
    setIntent("SPECIFIC_EVENT")

    // Build enriched question with optional spatiotemporal params
    let enrichedQuestion = eventText.trim()
    if (showAdvanced) {
      const parts = [eventText.trim()]
      if (eventDate) parts.push(`事件日期：${eventDate}`)
      if (emotionScore !== 3) parts.push(`当时情绪：${emotionScore}分（${EMOTION_LABELS[emotionScore]}）`)
      enrichedQuestion = parts.join("\n")
    }
    updateField("user_question", enrichedQuestion)

    // Prefill from profile if available
    if (profile) {
      prefillFromProfile(profile)
    }

    // Navigate to wizard (will start at confirm step for SPECIFIC_EVENT)
    router.push("/reading/new")
    onClose()
    setLoading(false)
    setEventText("")
    setShowAdvanced(false)
  }

  const handleClose = () => {
    onClose()
    setEventText("")
    setShowAdvanced(false)
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

              {/* Description */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6">
                <p className="text-white/50 text-sm leading-relaxed">
                  写下你当下的困惑、或是近期准备发生的重大事件。
                  AI 将结合你的命理底座，为你进行心学命理复盘分析。
                </p>
              </div>

              {/* Main input — flex-1 to fill remaining space */}
              <div className="flex-1 flex flex-col min-h-0">
                <textarea
                  value={eventText}
                  onChange={(e) => setEventText(e.target.value)}
                  rows={6}
                  placeholder={"例：\n· 我最近收到了两个工作 offer，一个在大城市但薪资更高，一个在老家但离家人近\n· 我准备和朋友合伙创业，但担心时机不对\n· 和另一半的感情遇到了瓶颈，不知道该不该继续"}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 resize-none transition-all flex-1 min-h-[120px]"
                />
                <p className="text-white/20 text-xs mt-2 text-right">
                  {eventText.length}/500
                </p>

                {/* ── Advanced fields (collapsible) ──────────── */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors mt-3 select-none"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
                  />
                  🛠️ 展开高级时空参数
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

                        {/* Emotion slider */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs text-white/40 mb-1.5">
                            <Smile size={12} /> 当时情绪感受
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={1}
                              max={5}
                              step={1}
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
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!eventText.trim() || loading || eventText.length > 500}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-4 disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    正在启动分析...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    开始格物分析
                  </>
                )}
              </button>

              <p className="text-white/20 text-[10px] text-center mt-3">
                将跳过塔罗与面相，直接基于命理底座生成事件复盘报告
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
