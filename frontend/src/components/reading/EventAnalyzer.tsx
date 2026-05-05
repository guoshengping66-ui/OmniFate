"use client"
import { useState, useEffect, useCallback } from "react"
import {
  Loader2, Sparkles, AlertCircle, Clock, History,
  TrendingUp, Shield, Eye, ChevronRight, Send,
} from "lucide-react"
import toast from "react-hot-toast"
import {
  analyzeEvent, listEvents, getEventDetail,
  AnalyzeEventResponse, EventListItem, Product,
} from "@/lib/api"
import { ProductCard } from "@/components/reading/ProductCard"

interface Props {
  sessionId: string
}

/** 情绪评分选项 */
const EMOTION_OPTIONS = [
  { value: 1, label: "非常差", emoji: "😢" },
  { value: 2, label: "较差",   emoji: "😔" },
  { value: 3, label: "一般",   emoji: "😐" },
  { value: 4, label: "较好",   emoji: "🙂" },
  { value: 5, label: "很好",   emoji: "😊" },
  { value: 6, label: "非常好", emoji: "🥳" },
  { value: 7, label: "极好",   emoji: "🌟" },
  { value: 8, label: "平静",   emoji: "🧘" },
  { value: 9, label: "焦虑",   emoji: "😰" },
  { value: 10, label: "愤怒",  emoji: "😤" },
]

/** 预置事件场景按钮 */
const QUICK_EVENTS = [
  { label: "工作冲突", desc: "今天和同事/领导发生了冲突" },
  { label: "财运波动", desc: "最近有一笔意外的财务支出/收入" },
  { label: "感情问题", desc: "和伴侣发生了争执或误会" },
  { label: "健康预警", desc: "最近身体出现了不适症状" },
  { label: "重要决策", desc: "面临一个重要的职业/人生选择" },
  { label: "社交事件", desc: "参加了一个重要的社交活动" },
]

export default function EventAnalyzer({ sessionId }: Props) {
  // Form state
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })
  const [emotionScore, setEmotionScore] = useState<number | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  // Results state
  const [result, setResult] = useState<AnalyzeEventResponse | null>(null)
  const [events, setEvents] = useState<EventListItem[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [eventDetail, setEventDetail] = useState<AnalyzeEventResponse | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Load event history on mount
  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true)
    try {
      const list = await listEvents(sessionId)
      setEvents(list)
    } catch {
      // silently fail — history is optional
    } finally {
      setLoadingEvents(false)
    }
  }, [sessionId])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleAnalyze = async () => {
    if (!description.trim()) {
      toast.error("请描述你的事件")
      return
    }
    setAnalyzing(true)
    setResult(null)
    try {
      const eventDatetime = new Date(eventDate).toISOString()
      const res = await analyzeEvent({
        session_id: sessionId,
        event_description: description.trim(),
        event_datetime: eventDatetime,
        emotion_score: emotionScore ?? undefined,
      })
      setResult(res)
      toast.success("复盘分析完成！")
      // Refresh event history
      fetchEvents()
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "分析失败，请稍后重试"
      toast.error(detail)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSelectEvent = async (eventId: string) => {
    setSelectedEvent(eventId)
    setLoadingDetail(true)
    setEventDetail(null)
    try {
      const detail = await getEventDetail(eventId)
      setEventDetail(detail)
    } catch {
      toast.error("加载事件详情失败")
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleQuickEvent = (desc: string) => {
    setDescription(desc)
  }

  const activeResult = result || eventDetail

  return (
    <div className="space-y-6">
      {/* ── Input Form ──────────────────────────────────────── */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-gold" />
          <h3 className="font-serif text-lg font-bold text-gold">事件复盘</h3>
          <span className="text-xs text-white/30">输入近期发生的事件，AI 结合你的命盘进行因果分析</span>
        </div>

        {/* Quick event buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_EVENTS.map(qe => (
            <button key={qe.label} onClick={() => handleQuickEvent(qe.desc)}
 className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all whitespace-nowrap">
              {qe.label}
            </button>
          ))}
        </div>

        {/* Description textarea */}
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="描述一下发生了什么…&#10;例如：今天和领导因为项目方向产生了分歧，对方坚持采用保守方案，而我认为应该尝试新方法。"
 className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80 placeholder-white/20 resize-none h-28 focus:outline-none focus:border-gold/40 focus:bg-white/[0.07]"
        />

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {/* Date/time picker */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5 flex items-center gap-1.5">
              <Clock size={12} /> 事件发生时间
            </label>
            <input type="datetime-local" value={eventDate}
              onChange={e => setEventDate(e.target.value)}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-gold/40"
            />
          </div>

          {/* Emotion score selector */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">情绪状态（可选）</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOTION_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setEmotionScore(emotionScore === opt.value ? null : opt.value)}
                  className={`text-xs px-2 py-1.5 rounded-lg border transition-all
                    ${emotionScore === opt.value
                      ? "bg-gold/20 border-gold/40 text-gold"
                      : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"}`}
                  title={opt.label}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleAnalyze} disabled={analyzing || !description.trim()}
          className="btn-gold flex items-center gap-2 mt-4"
        >
          {analyzing ? (
            <><Loader2 size={16} className="animate-spin" /> AI 分析中…</>
          ) : (
            <><Send size={16} /> 开始复盘分析</>
          )}
        </button>
      </div>

      {/* ── Analysis Result ──────────────────────────────────── */}
      {activeResult && (
        <div className="space-y-4">
          {/* Causal Analysis */}
          {activeResult.causal_analysis && (
            <SectionBlock
              icon={<TrendingUp size={18} />}
              title="因果溯源"
              subtitle="为什么这个事件会发生"
              content={activeResult.causal_analysis}
              color="gold"
            />
          )}

          {/* Current Advice */}
          {activeResult.current_advice && (
            <SectionBlock
              icon={<Eye size={18} />}
              title="当下对策"
              subtitle="基于当前流时的行动建议"
              content={activeResult.current_advice}
              color="jade"
            />
          )}

          {/* Future Prevention */}
          {activeResult.future_prevention && (
            <SectionBlock
              icon={<Shield size={18} />}
              title="未来预防"
              subtitle="如何避免/延续类似情况"
              content={activeResult.future_prevention}
              color="purple"
            />
          )}

          {/* Remedy keywords */}
          {activeResult.remedy_keywords.length > 0 && (
            <div className="card-glass p-4">
              <p className="text-xs text-white/40 mb-2">改运标签</p>
              <div className="flex flex-wrap gap-2">
                {activeResult.remedy_keywords.map(kw => (
                  <span key={kw}
                    className="text-xs px-2.5 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold/80">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Zone 4: 情绪慰藉 — 针对此次事件的能量处方 */}
          {activeResult.recommended_products.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-gold" />
                <h4 className="font-serif text-base font-bold text-gold">针对此次事件的能量处方</h4>
              </div>
              <p className="text-white/40 text-xs mb-4 leading-relaxed">
                每一次事件都是能量的流动与转化。以下商品根据你的命盘与此事件的能量共振匹配，帮助你安抚情绪、重聚能量。
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {activeResult.recommended_products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Loading detail ────────────────────────────────────── */}
      {loadingDetail && (
        <div className="card-glass p-10 text-center">
          <Loader2 size={24} className="animate-spin text-gold mx-auto mb-3" />
          <p className="text-white/40 text-sm">加载事件详情…</p>
        </div>
      )}

      {/* ── Event History ──────────────────────────────────────── */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-white/40" />
          <h3 className="text-sm font-medium text-white/60">复盘历史</h3>
        </div>

        {loadingEvents ? (
          <div className="flex items-center gap-2 text-white/30 text-sm py-4">
            <Loader2 size={14} className="animate-spin" /> 加载中…
          </div>
        ) : events.length === 0 ? (
          <p className="text-white/20 text-sm py-4 text-center">
            暂无复盘记录，开始第一次分析吧
          </p>
        ) : (
          <div className="space-y-2">
            {events.map(evt => (
              <button key={evt.id} onClick={() => handleSelectEvent(evt.id)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all
                  ${selectedEvent === evt.id
                    ? "bg-gold/10 border-gold/30"
                    : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/20"}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 truncate">{evt.event_description}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {new Date(evt.event_datetime).toLocaleDateString("zh-CN")}
                    {evt.emotion_score && ` · 情绪 ${evt.emotion_score}/10`}
                  </p>
                </div>
                <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Section Block Component ───────────────────────────────────────────────────

function SectionBlock({
  icon, title, subtitle, content, color,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  content: string
  color: "gold" | "jade" | "purple"
}) {
  const borderMap = {
    gold:   "border-gold/30",
    jade:   "border-jade/30",
    purple: "border-purple-500/30",
  }
  const bgMap = {
    gold:   "bg-gold/5",
    jade:   "bg-jade/5",
    purple: "bg-purple-500/5",
  }
  const textMap = {
    gold:   "text-gold",
    jade:   "text-jade-light",
    purple: "text-purple-400",
  }

  return (
    <div className={`card-glass p-6 border-l-4 ${borderMap[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={textMap[color]}>{icon}</span>
        <h3 className={`font-serif font-bold ${textMap[color]}`}>{title}</h3>
        <span className="text-xs text-white/30 ml-1">{subtitle}</span>
      </div>
      <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line mt-3">
        {content}
      </div>
    </div>
  )
}
