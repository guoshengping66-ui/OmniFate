"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

const SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX", "DOT", "MATIC", "LINK", "UNI", "其他"]
const EMOTIONS = [
  { score: 1, label: "极度恐惧", emoji: "😱" },
  { score: 2, label: "恐惧", emoji: "😰" },
  { score: 3, label: "焦虑", emoji: "😟" },
  { score: 4, label: "犹豫", emoji: "🤔" },
  { score: 5, label: "平静", emoji: "😐" },
  { score: 6, label: "自信", emoji: "😊" },
  { score: 7, label: "乐观", emoji: "😄" },
  { score: 8, label: "兴奋", emoji: "🤩" },
  { score: 9, label: "贪婪", emoji: "🤑" },
  { score: 10, label: "极度贪婪", emoji: "🚀" },
]

export default function NewTradePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const [symbol, setSymbol] = useState("")
  const [direction, setDirection] = useState<"long" | "short">("long")
  const [entryPrice, setEntryPrice] = useState("")
  const [exitPrice, setExitPrice] = useState("")
  const [emotion, setEmotion] = useState(5)
  const [description, setDescription] = useState("")

  const handleSubmit = async () => {
    if (!symbol) {
      toast.error("请选择币种")
      return
    }
    if (!description.trim()) {
      toast.error("请输入交易描述")
      return
    }

    setLoading(true)
    try {
      const pnl = entryPrice && exitPrice
        ? direction === "long"
          ? (parseFloat(exitPrice) - parseFloat(entryPrice)) * 1
          : (parseFloat(entryPrice) - parseFloat(exitPrice)) * 1
        : null

      await api.post("/api/events", {
        event_description: `${symbol} ${direction === "long" ? "做多" : "做空"}: ${description}`,
        event_datetime: new Date().toISOString(),
        emotion_score: emotion,
        trade_symbol: symbol,
        trade_direction: direction,
        entry_price: entryPrice ? parseFloat(entryPrice) : null,
        exit_price: exitPrice ? parseFloat(exitPrice) : null,
        pnl_cny: pnl,
      })

      toast.success("交易记录已保存")
      router.push("/trading")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "保存失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Breadcrumbs items={[{ label: "交易复盘", href: "/trading" }, { label: "新建复盘" }]} />

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-white/60 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> 返回
        </button>

        <h1 className="text-2xl font-serif font-bold text-gold mb-8">新建交易复盘</h1>

        <div className="space-y-6">
          {/* Symbol */}
          <div>
            <label className="label">币种</label>
            <div className="flex flex-wrap gap-2">
              {SYMBOLS.map(s => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    symbol === s
                      ? "bg-gold text-ink font-medium"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div>
            <label className="label">方向</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDirection("long")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                  direction === "long"
                    ? "bg-green-500/20 border border-green-500/40 text-green-400"
                    : "bg-white/5 border border-white/10 text-white/40"
                }`}
              >
                <ArrowRight size={18} /> 做多 (Long)
              </button>
              <button
                onClick={() => setDirection("short")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                  direction === "short"
                    ? "bg-red-500/20 border border-red-500/40 text-red-400"
                    : "bg-white/5 border border-white/10 text-white/40"
                }`}
              >
                <ArrowLeft size={18} /> 做空 (Short)
              </button>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">入场价格</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">出场价格</label>
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

          {/* PnL preview */}
          {entryPrice && exitPrice && (
            <div className={`card-glass p-3 text-center ${
              (direction === "long" ? parseFloat(exitPrice) - parseFloat(entryPrice) : parseFloat(entryPrice) - parseFloat(exitPrice)) >= 0
                ? "border-green-500/30"
                : "border-red-500/30"
            }`}>
              <p className="text-white/40 text-xs">预估盈亏</p>
              <p className={`text-xl font-bold ${
                (direction === "long" ? parseFloat(exitPrice) - parseFloat(entryPrice) : parseFloat(entryPrice) - parseFloat(exitPrice)) >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}>
                {direction === "long" ? parseFloat(exitPrice) - parseFloat(entryPrice) >= 0 ? "+" : "" : parseFloat(entryPrice) - parseFloat(exitPrice) >= 0 ? "+" : ""}
                ¥{(direction === "long" ? parseFloat(exitPrice) - parseFloat(entryPrice) : parseFloat(entryPrice) - parseFloat(exitPrice)).toFixed(2)}
              </p>
            </div>
          )}

          {/* Emotion */}
          <div>
            <label className="label">交易时情绪</label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(e => (
                <button
                  key={e.score}
                  onClick={() => setEmotion(e.score)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    emotion === e.score
                      ? "bg-gold/20 border border-gold/40 text-gold"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <span>{e.emoji}</span>
                  <span className="hidden sm:inline">{e.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">交易描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="记录你的交易思路、入场逻辑、止损止盈计划..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full btn-gold flex items-center justify-center gap-2 py-4"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> 保存中...</>
            ) : (
              <><Check size={18} /> 保存交易记录</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
