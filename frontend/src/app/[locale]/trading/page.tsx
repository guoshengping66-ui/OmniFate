"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, TrendingUp, TrendingDown, BarChart3, Calendar } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

interface TradeEntry {
  id: string
  trade_symbol: string
  trade_direction: "long" | "short"
  entry_price: number
  exit_price: number | null
  pnl_cny: number | null
  emotion_score: number | null
  notes: string | null
  created_at: string
}

interface TradeStats {
  total_trades: number
  win_rate: number
  total_pnl: number
  avg_pnl: number
}

export default function TradingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [stats, setStats] = useState<TradeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "win" | "loss">("all")

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    Promise.all([
      api.get("/api/trading/entries").then(r => r.data?.items || []).catch(() => []),
      api.get("/api/trading/stats").then(r => r.data).catch(() => null),
    ]).then(([entriesData, statsData]) => {
      setTrades(entriesData)
      setStats(statsData)
    }).finally(() => setLoading(false))
  }, [user, authLoading, router])

  const filteredTrades = trades.filter(tr => {
    if (filter === "win") return tr.pnl_cny !== null && tr.pnl_cny > 0
    if (filter === "loss") return tr.pnl_cny !== null && tr.pnl_cny < 0
    return true
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("trading.breadcrumb") }]} />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gold mb-2">{t("trading.title")}</h1>
            <p className="text-white/50 text-sm">{t("trading.desc")}</p>
          </div>
          <Link
            href="/trading/new"
            className="btn-gold flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            {t("trading.newBtn")}
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card-glass p-4 text-center">
              <BarChart3 size={18} className="text-gold mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total_trades}</p>
              <p className="text-white/30 text-xs">{t("trading.stats.total")}</p>
            </div>
            <div className="card-glass p-4 text-center">
              <TrendingUp size={18} className="text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{stats.win_rate}%</p>
              <p className="text-white/30 text-xs">{t("trading.stats.winRate")}</p>
            </div>
            <div className="card-glass p-4 text-center">
              <p className={`text-2xl font-bold ${stats.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.total_pnl >= 0 ? '+' : ''}{stats.total_pnl.toFixed(0)}
              </p>
              <p className="text-white/30 text-xs">{t("trading.stats.totalPnl")}</p>
            </div>
            <div className="card-glass p-4 text-center">
              <p className={`text-2xl font-bold ${stats.avg_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.avg_pnl >= 0 ? '+' : ''}{stats.avg_pnl.toFixed(0)}
              </p>
              <p className="text-white/30 text-xs">{t("trading.stats.avgPnl")}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(["all", "win", "loss"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                filter === f
                  ? "bg-gold text-ink"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {f === "all" ? t("trading.filter.all") : f === "win" ? t("trading.filter.win") : t("trading.filter.loss")}
            </button>
          ))}
        </div>

        {/* Trade entries */}
        {filteredTrades.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <Calendar size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 mb-4">{t("trading.empty")}</p>
            <Link href="/trading/new" className="btn-gold-outline inline-flex items-center gap-2">
              <Plus size={16} />
              {t("trading.emptyBtn")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrades.map((trade) => (
              <Link
                key={trade.id}
                href={`/trading/${trade.id}`}
                className="card-glass p-4 flex items-center justify-between hover:border-gold/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    trade.trade_direction === "long" ? "bg-green-500/20" : "bg-red-500/20"
                  }`}>
                    {trade.trade_direction === "long" ? (
                      <TrendingUp size={18} className="text-green-400" />
                    ) : (
                      <TrendingDown size={18} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{trade.trade_symbol}</p>
                    <p className="text-white/40 text-xs">
                      {trade.trade_direction === "long" ? t("trading.long") : t("trading.short")} · {trade.entry_price}
                      {trade.exit_price && ` → ${trade.exit_price}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {trade.pnl_cny !== null && (
                    <p className={`font-bold ${trade.pnl_cny >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.pnl_cny >= 0 ? '+' : ''}{trade.pnl_cny.toFixed(0)} CNY
                    </p>
                  )}
                  <p className="text-white/30 text-xs">
                    {new Date(trade.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
