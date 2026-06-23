"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

const SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "DOT", "AVAX", "MATIC", "OTHER"]

export default function NewTradePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t, localeHref } = useLanguage()
  const [symbol, setSymbol] = useState("BTC")
  const [direction, setDirection] = useState<"long" | "short">("long")
  const [entryPrice, setEntryPrice] = useState("")
  const [exitPrice, setExitPrice] = useState("")
  const [emotionScore, setEmotionScore] = useState(3)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const EMOTIONS = [
    { score: 1, label: t("trading.new.e1"), color: "text-red-400" },
    { score: 2, label: t("trading.new.e2"), color: "text-orange-400" },
    { score: 3, label: t("trading.new.e3"), color: "text-white/50" },
    { score: 4, label: t("trading.new.e4"), color: "text-yellow-400" },
    { score: 5, label: t("trading.new.e5"), color: "text-green-400" },
  ]

  useEffect(() => {
    if (authLoading) return
    if (!user) router.push(localeHref("/login"))
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entryPrice) {
      toast.error(t("trading.new.enterPriceError"))
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
      toast.success(t("trading.new.saved"))
      router.push(localeHref(`/trading/${res.data.id}`))
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("trading.new.saveFailed"))
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
        <Breadcrumbs items={[{ label: t("trading.breadcrumb"), href: "/trading" }, { label: t("trading.new.breadcrumb") }]} />

        <div className="mb-8">
          <Link href="/trading" className="text-white/40 hover:text-gold text-sm inline-flex items-center gap-1 mb-4">
            <ArrowLeft size={14} />
            {t("trading.new.back")}
          </Link>
          <h1 className="text-3xl font-serif font-bold text-gold">{t("trading.new.title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symbol */}
          <div className="card-glass p-6">
            <label className="label">{t("trading.new.symbol")}</label>
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
            <label className="label">{t("trading.new.direction")}</label>
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
                  {t("trading.new.long")}
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
                  {t("trading.new.short")}
                </p>
                <p className="text-white/30 text-xs mt-1">SHORT</p>
              </button>
            </div>
          </div>

          {/* Prices */}
          <div className="card-glass p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t("trading.new.entryPrice")}</label>
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
                <label className="label">{t("trading.new.exitPrice")}</label>
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
            <label className="label">{t("trading.new.emotion")}</label>
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
            <label className="label">{t("trading.new.notes")}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("trading.new.notesPlaceholder")}
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
                {t("trading.new.saveBtn")}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
