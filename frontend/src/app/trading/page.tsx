"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Plus, TrendingUp, TrendingDown, BarChart3, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

interface TradeEntry {
  id: string
  event_description: string
  event_datetime: string
  trade_symbol?: string
  trade_direction?: string
  entry_price?: number
  exit_price?: number
  pnl_cny?: number
  emotion_score?: number
}

export default function TradingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    api.get("/api/events?trade_only=true")
      .then(r => setTrades(r.data?.items || []))
      .catch(() => setTrades([]))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  // Calculate stats
  const stats = {
    total: trades.length,
    wins: trades.filter(t => (t.pnl_cny || 0) > 0).length,
    losses: trades.filter(t => (t.pnl_cny || 0) < 0).length,
    totalPnl: trades.reduce((sum, t) => sum + (t.pnl_cny || 0), 0),
  }
  const winRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : "0"

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
        <Breadcrumbs items={[{ label: "交易复盘" }]} />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gold">交易复盘日记</h1>
            <p className="text-white/40 text-sm mt-1">记录交易，结合星象能量分析</p>
          </div>
          <Link href="/trading/new" className="btn-gold flex items-center gap-2">
            <Plus size={16} /> 新建复盘
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-glass p-4 text-center">
            <BarChart3 size={20} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-white/30 text-xs">总交易数</p>
          </div>
          <div className="card-glass p-4 text-center">
            <TrendingUp size={20} className="text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{winRate}%</p>
            <p className="text-white/30 text-xs">胜率</p>
          </div>
          <div className="card-glass p-4 text-center">
            <TrendingDown size={20} className="text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{stats.losses}</p>
            <p className="text-white/30 text-xs">亏损次数</p>
          </div>
          <div className="card-glass p-4 text-center">
            <Calendar size={20} className="text-gold mx-auto mb-2" />
            <p className={`text-2xl font-bold ${stats.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              {stats.totalPnl >= 0 ? "+" : ""}¥{stats.totalPnl.toFixed(2)}
            </p>
            <p className="text-white/30 text-xs">总盈亏</p>
          </div>
        </div>

        {/* Trade List */}
        {trades.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <BarChart3 size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/40 mb-4">还没有交易记录</p>
            <Link href="/trading/new" className="btn-gold inline-flex items-center gap-2">
              <Plus size={16} /> 开始记录第一笔交易
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map(trade => (
              <div key={trade.id} className="card-glass p-4 hover:border-gold/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      trade.trade_direction === "long" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                      {trade.trade_direction === "long" ? (
                        <TrendingUp size={18} className="text-green-400" />
                      ) : (
                        <TrendingDown size={18} className="text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white/80 font-medium">
                        {trade.trade_symbol || "未知币种"}
                        <span className={`ml-2 text-xs ${
                          trade.trade_direction === "long" ? "text-green-400" : "text-red-400"
                        }`}>
                          {trade.trade_direction === "long" ? "做多" : "做空"}
                        </span>
                      </p>
                      <p className="text-white/30 text-xs">
                        {new Date(trade.event_datetime).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {trade.pnl_cny != null && (
                      <p className={`font-bold ${trade.pnl_cny >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {trade.pnl_cny >= 0 ? "+" : ""}¥{trade.pnl_cny.toFixed(2)}
                      </p>
                    )}
                    {trade.emotion_score && (
                      <p className="text-white/20 text-xs">情绪 {trade.emotion_score}/10</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
