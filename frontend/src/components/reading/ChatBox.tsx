"use client"
import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react"
import { sendChat, AGENT_LABELS } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import toast from "react-hot-toast"

interface Message {
  role: "user" | "assistant"
  content: string
  routed_to?: string
}

interface Props {
  sessionId: string
  availableAgents?: string[]
}

export function ChatBox({ sessionId, availableAgents = [] }: Props) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t("reading.chat.welcome"),
      routed_to: "master",
    },
  ])
  const [input, setInput]       = useState("")
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput("")
    setMessages(m => [...m, { role: "user", content: q }])
    setLoading(true)
    try {
      const res = await sendChat({ session_id: sessionId, question: q })
      setMessages(m => [...m, {
        role: "assistant",
        content: res.answer,
        routed_to: res.routed_to,
      }])
    } catch {
      toast.error(t("chat.sendFail"))
      setMessages(m => [...m, {
        role: "assistant",
        content: t("chat.defaultError"),
        routed_to: "master",
      }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() }
  }

  // Dynamic quick questions based on available agents
  const ALL_QUICK: Record<string, string[]> = {
    bazi: [t("chat.quick.bazi1"), t("chat.quick.bazi2"), t("chat.quick.bazi3")],
    astrology: [t("chat.quick.astro1"), t("chat.quick.astro2"), t("chat.quick.astro3")],
    tarot: [t("chat.quick.tarot1"), t("chat.quick.tarot2"), t("chat.quick.tarot3")],
    face: [t("chat.quick.face1"), t("chat.quick.face2"), t("chat.quick.face3")],
    palm: [t("chat.quick.palm1"), t("chat.quick.palm2"), t("chat.quick.palm3")],
    qimen: [t("chat.quick.qimen1"), t("chat.quick.qimen2")],
    ziwei: [t("chat.quick.ziwei1"), t("chat.quick.ziwei2")],
  }

  const quickQuestions = availableAgents.length > 0
    ? availableAgents
        .flatMap(a => ALL_QUICK[a] || [])
        .slice(0, 5)
    : [
        t("chat.fallback1"),
        t("chat.fallback2"),
        t("chat.fallback3"),
        t("chat.fallback4"),
        t("chat.fallback5"),
      ]

  return (
    <div className="card-glass flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/10">
        <Bot size={18} className="text-gold" />
        <span className="font-medium text-white text-sm">{t("chat.experts")}</span>
        <span className="text-xs text-white/30 ml-1">{t("chat.autoRoute")}</span>
        {availableAgents.length > 0 && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-gold/50">
            <Sparkles size={8} /> {availableAgents.length} {t("chat.expertsOnline")}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
              ${m.role === "user" ? "bg-gold/20 text-gold" : "bg-white/10 text-white/60"}`}>
              {m.role === "user"
                ? <User size={14} />
                : <span>{AGENT_LABELS[m.routed_to ?? "master"]?.icon ?? "🌟"}</span>}
            </div>

            {/* Bubble */}
            <div className={`max-w-[82%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              {m.routed_to && m.role === "assistant" && (
                <span className={`text-xs ${AGENT_LABELS[m.routed_to]?.color ?? "text-white/40"}`}>
                  {AGENT_LABELS[m.routed_to]?.label ?? m.routed_to} {t("chat.expert")}
                </span>
              )}
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line
                ${m.role === "user"
                  ? "bg-gold/20 text-white rounded-tr-sm"
                  : "bg-white/5 text-white/80 rounded-tl-sm border border-white/10"}`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
              <Loader2 size={14} className="text-gold animate-spin" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {quickQuestions.map(q => (
            <button key={q} onClick={() => { setInput(q); }}
              className="text-xs px-3 py-1 rounded-full border border-white/15 text-white/50
                         hover:border-gold/40 hover:text-gold transition-all">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/10 flex gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          placeholder={t("chat.placeholder2")}
          className="flex-1 input-field text-sm py-2.5 resize-none min-h-[42px] max-h-[120px]"
        />
        <button onClick={send} disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/30 text-gold
                     hover:bg-gold/30 disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center justify-center transition-all flex-shrink-0 self-end">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
