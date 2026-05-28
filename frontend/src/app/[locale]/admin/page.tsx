"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Users, FileText, ShoppingCart, TrendingUp, RefreshCw } from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalReadings: number
  totalOrders: number
  paidUsers: number
  recentUsers: Array<{ email: string; created_at: string }>
}

export default function AdminPage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminKey, setAdminKey] = useState("")
  const [authenticated, setAuthenticated] = useState(false)

  const fetchStats = async () => {
    if (!adminKey) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/stats?key=${adminKey}`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to fetch stats")
      }
      const data = await res.json()
      setStats(data)
      setAuthenticated(true)
    } catch (err: any) {
      setError(err.message || "Invalid admin key or failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) fetchStats()
  }, [authenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStats()
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-4">
        <div className="w-full max-w-sm p-8 rounded-2xl bg-white/[0.04] border border-white/10">
          <h1 className="text-2xl font-serif font-bold text-white mb-6 text-center">
            {t("admin.title") || "Admin Dashboard"}
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder={t("admin.enterKey") || "Enter admin key"}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gold text-ink font-semibold hover:shadow-[0_0_24px_rgba(201,168,76,0.5)] transition-all"
            >
              {t("admin.login") || "Login"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold text-white">
            {t("admin.title") || "Admin Dashboard"}
          </h1>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-white/70 hover:border-gold/30 transition-all"
          >
            <RefreshCw size={16} />
            {t("admin.refresh") || "Refresh"}
          </button>
        </div>

        {loading && !stats ? (
          <div className="text-center text-white/50 py-20">
            {t("admin.loading") || "Loading..."}
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<Users size={20} />}
                label={t("admin.totalUsers") || "Total Users"}
                value={stats.totalUsers}
              />
              <StatCard
                icon={<TrendingUp size={20} />}
                label={t("admin.paidUsers") || "Paid Users"}
                value={stats.paidUsers}
              />
              <StatCard
                icon={<FileText size={20} />}
                label={t("admin.totalReadings") || "Total Readings"}
                value={stats.totalReadings}
              />
              <StatCard
                icon={<ShoppingCart size={20} />}
                label={t("admin.totalOrders") || "Total Orders"}
                value={stats.totalOrders}
              />
            </div>

            {/* Recent Users */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6">
              <h2 className="text-xl font-serif font-bold text-white mb-4">
                {t("admin.recentUsers") || "Recent Users"}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-3 text-white/50 font-normal text-sm">
                        {t("admin.email") || "Email"}
                      </th>
                      <th className="pb-3 text-white/50 font-normal text-sm">
                        {t("admin.registeredAt") || "Registered At"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((user, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 text-white/70">{user.email}</td>
                        <td className="py-3 text-white/50 text-sm">
                          {new Date(user.created_at).toLocaleDateString("zh-CN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/40 text-sm">{label}</div>
    </div>
  )
}
