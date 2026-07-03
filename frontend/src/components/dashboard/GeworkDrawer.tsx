"use client"
import { useState, useEffect, useRef } from "react"
import { X, Send, Sparkles, ChevronDown, Calendar, Smile, Clock, RotateCcw } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { useLanguage } from "@/contexts/LanguageContext"
import { analyzeEvent } from "@/lib/api"

interface Props {
  open: boolean
  onClose: () => void
}

const EMOTION_KEYS: Record<number, string> = {
  1: "gework.emotion1",
  2: "gework.emotion2",
  3: "gework.emotion3",
  4: "gework.emotion4",
  5: "gework.emotion5",
}

const LOADING_KEYS = [
  "gework.loading1",
  "gework.loading2",
  "gework.loading3",
  "gework.loading4",
  "gework.loading5",
  "gework.loading6",
]

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function GeworkDrawer({ open, onClose }: Props) {
  const { t } = useLanguage()
  const [eventText, setEventText] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [eventDate, setEventDate] = useState(todayString)
  const [eventTime, setEventTime] = useState("")
  const [emotionScore, setEmotionScore] = useState(3)

  const [phase, setPhase] = useState<"input" | "loading" | "result">("input")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [tipIndex, setTipIndex] = useState(0)

  const { activeTestTarget, userProfile } = useUserStore()
  const resultRef = useRef<HTMLDivElement>(null)

  const EMOTION_LABELS: Record<number, string> = {
    1: t("dash.gework.emotion1"),
    2: t("dash.gework.emotion2"),
    3: t("dash.gework.emotion3"),
    4: t("dash.gework.emotion4"),
    5: t("dash.gework.emotion5"),
  }

  useEffect(() => {
    if (open) {
      setEventDate(todayString())
      setPhase("input")
      setResult("")
      setError("")
    }
  }, [open])

  useEffect(() => {
    if (phase !== "loading") return
    const timer = setInterval(() => {
      setTipIndex(i => (i + 1) % LOADING_KEYS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [phase])

  const handleSubmit = async () => {
    if (!eventText.trim()) return
    setPhase("loading")
    setError("")
    setTipIndex(0)

    const profile = activeTestTarget || userProfile

    const parts = [eventText.trim()]
    if (showAdvanced) {
      if (eventDate) parts.push(`${t("gework.eventDate")}: ${eventDate}`)
      if (eventTime) parts.push(`${t("gework.eventTime")}: ${eventTime}`)
      if (emotionScore !== 3) parts.push(`${t("gework.emotion")}: ${emotionScore} (${EMOTION_LABELS[emotionScore]})`)
    }
    const enrichedQuestion = parts.join("\n")

    try {
      const res = await analyzeEvent({
        session_id: profile?.id || "guest",
        event_description: enrichedQuestion,
        event_datetime: eventDate + (eventTime ? `T${eventTime}` : "T00:00:00"),
        emotion_score: emotionScore,
      })

      const sections = [
        res.causal_analysis && `### ${t("gework.section.cause")}\n${res.causal_analysis}`,
        res.current_advice && `### ${t("gework.section.advice")}\n${res.current_advice}`,
        res.future_prevention && `### ${t("gework.section.prevent")}\n${res.future_prevention}`,
        res.remedy_keywords?.length && `### ${t("gework.section.keywords")}\n${res.remedy_keywords.join(" · ")}`,
      ].filter(Boolean)

      setResult(sections.join("\n\n"))
      setPhase("result")
    } catch (err: any) {
      console.error("[GeworkDrawer] analyze error:", err)
      setError(err?.response?.data?.detail || err?.message || t("gework.failMsg"))
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

  const renderResult = (md: string) => {
    return md.split("\n\n").map((block, i) => {
      if (block.startsWith("### ")) {
        return <h3 key={i} className="text-gold text-sm font-serif font-bold mt-4 mb-2">{block.slice(4)}</h3>
      }
      return <p key={i} className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{block}</p>
    })
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60  z-40 anim-fade-in"
        onClick={handleClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-ink-light/95  border-l border-white/10 z-50 shadow-2xl anim-slide-in-right">
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Sparkles size={20} className="text-gold" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-gold">{t("gework.title")}</h2>
                <p className="text-white/30 text-xs">{t("gework.subtitle")}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* INPUT PHASE */}
            {phase === "input" && (
              <div className="flex-1 flex flex-col min-h-0 anim-fade-in">
                <div className="bg-[#030918] border border-white/10 rounded-xl p-4 mb-4">
                  <p className="text-white/50 text-sm leading-relaxed">{t("gework.desc")}</p>
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
                  placeholder={t("gework.placeholder")}
                  className="w-full bg-[#030918] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 resize-none transition-all flex-1 min-h-[120px]"
                />
                <p className="text-white/20 text-xs mt-2 text-right">{eventText.length}/500</p>

                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors mt-3 select-none"
                >
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
                  🛠️ {t("gework.expandAdvanced")}
                </button>

                {showAdvanced && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 mt-3 space-y-4 anim-slide-up">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-white/40 mb-1.5">
                        <Calendar size={12} /> {t("gework.eventDate")}
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-[#030918] border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm focus:border-gold/40 focus:outline-none transition-all"
                      />
                      <p className="text-white/20 text-[10px] mt-1">{t("gework.eventDateHint")}</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-white/40 mb-1.5">
                        <Clock size={12} /> {t("gework.eventTime")}
                      </label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full bg-[#030918] border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm focus:border-gold/40 focus:outline-none transition-all"
                      />
                      <p className="text-white/20 text-[10px] mt-1">{t("gework.eventTimeHint")}</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-white/40 mb-1.5">
                        <Smile size={12} /> {t("gework.emotion")}
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
                )}
              </div>
            )}

            {/* LOADING PHASE */}
            {phase === "loading" && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 anim-fade-in">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-2 border-gold/20 rounded-full" />
                  <div className="absolute inset-0 border-2 border-transparent border-t-gold rounded-full animate-spin" />
                  <div className="absolute inset-2 border border-gold/10 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "3s" }} />
                  <Sparkles size={20} className="absolute inset-0 m-auto text-gold animate-pulse" />
                </div>

                <p key={tipIndex} className="text-gold/70 text-sm text-center anim-fade-in">
                  {t(LOADING_KEYS[tipIndex])}
                </p>

                <p className="text-white/20 text-xs">{t("gework.eta")}</p>
              </div>
            )}

            {/* RESULT PHASE */}
            {phase === "result" && (
              <div className="flex-1 flex flex-col min-h-0 anim-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-gold text-sm flex items-center gap-2">
                    <Sparkles size={14} /> {t("gework.resultTitle")}
                  </h3>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors"
                  >
                    <RotateCcw size={12} /> {t("gework.retry")}
                  </button>
                </div>

                <div ref={resultRef} className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                  {renderResult(result)}
                </div>
              </div>
            )}
          </div>

          {phase === "input" && (
            <>
              <button
                onClick={handleSubmit}
                disabled={!eventText.trim() || eventText.length > 500}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-4 disabled:opacity-40"
              >
                <Send size={16} />
                {t("gework.submitBtn")}
              </button>
              <p className="text-white/20 text-[10px] text-center mt-3">
                {t("gework.submitHint")}
              </p>
            </>
          )}

          {phase === "result" && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-full border border-white/20 text-white/60 text-sm hover:border-white/40 transition-all"
              >
                {t("gework.retryBtn")}
              </button>
              <button
                onClick={handleClose}
                className="flex-1 btn-gold py-3 text-sm"
              >
                {t("gework.close")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
