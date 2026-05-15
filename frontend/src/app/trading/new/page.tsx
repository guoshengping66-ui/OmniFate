"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

const SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "DOT", "AVAX", "MATIC", "OTHER"]
const EMOTIONS = [
  { score: 1, label: "极度恐惧", color: "text-red-400" },
  { score: 2, label: "恐惧", color: "text-orange-400" },
  { score: 3, label: "中性", color: "text-white/50" },
  { score: 4, label: "贪婪", color: "text-yellow-400" },
  { score: 5, label: "极度贪婪", color: "text-green-400" },
]

export default function NewTradePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [symbol, setSymbol] = useState("BTC")
  const [direction, setDirection] = useState<"long" | "short">("long")
  const [entryPrice, setEntryPrice] = useState("")
  const [exitPrice, setExitPrice] = useState("")
  const [emotionScore, setEmotionScore] = useState(3)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) router.push("/login")
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entryPrice) {
      toast.error("请输入入场价格")
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        trade_symbol: symbol,
        trade_direction: direction,
        entry_price: parseFloat(entryPrice),
        emotion_score: emotionScore,
        notes: notes || null,
      }
      if (exitPrice) {
        payload.exit_price = parseFloat(exitPrice)
      }

      const res = await api.post("/api/trading/entries", payload)
      toast.success("交易记录已保存")
      router.push(`/trading/${res.data.id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "保存失败")
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Breadcrumbs items={[{ label: "交易复盘", href: "/trading" }, { label: "新建复盘" }]} />

        <div className="mb-8">
          <Link href="/trading" className="text-white/40 hover:text-gold text-sm inline-flex items-center gap-1 mb-4">
            <ArrowLeft size={14} />
            返回交易列表
          </Link>
          <h1 className="text-3xl font-serif font-bold text-gold">新建交易复盘</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symbol */}
          <div className="card-glass p-6">
            <label className="label">币种</label>
            <div className="flex flex-wrap gap-2">
              {SYMBOLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSymbol(s)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    symbol === s
                      ? "bg-gold text-ink font-medium"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div className="card-glass p-6">
            <label className="label">方向</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDirection("long")}
                className={`p-4 rounded-xl border transition-all ${
                  direction === "long"
                    ? "border-green-400 bg-green-400/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <p className={`text-lg font-bold ${direction === "long" ? "text-green-400" : "text-white/50"}`}>
                  做多
                </p>
                <p className="text-white/30 text-xs mt-1">LONG</p>
              </button>
              <button
                type="button"
                onClick={() => setDirection("short")}
                className={`p-4 rounded-xl border transition-all ${
                  direction === "short"
                    ? "border-red-400 bg-red-400/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <p className={`text-lg font-bold ${direction === "short" ? "text-red-400" : "text-white/50"}`}>
                  做空
                </p>
                <p className="text-white/30 text-xs mt-1">SHORT</p>
              </button>
            </div>
          </div>

          {/* Prices */}
          <div className="card-glass p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">入场价格 (CNY)</label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">出场价格 (CNY，可选)</label>
                <input
                  type="number"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Emotion */}
          <div className="card-glass p-6">
            <label className="label">入场时情绪</label>
            <div className="flex justify-between gap-2">
              {EMOTIONS.map((e) => (
                <button
                  key={e.score}
                  type="button"
                  onClick={() => setEmotionScore(e.score)}
                  className={`flex-1 p-3 rounded-xl border transition-all ${
                    emotionScore === e.score
                      ? "border-gold bg-gold/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <p className={`text-sm font-medium ${emotionScore === e.score ? e.color : "text-white/30"}`}>
                    {e.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card-glass p-6">
            <label className="label">交易笔记（可选）</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录你的交易思路、市场观察..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-gold flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                保存并分析
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
