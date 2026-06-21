"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Users, FileText, ShoppingCart, TrendingUp, RefreshCw, Search, DollarSign, Activity, ExternalLink, Clock, CheckCircle, Truck, XCircle } from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalReadings: number
  totalOrders: number
  paidUsers: number
  recentUsers: Array<{ email: string; created_at: string }>
  totalRevenue?: number
  recentOrders?: Array<{
    id: string
    user_id: string
    total_cny: number
    status: string
    created_at: string
  }>
}

type Tab = "overview" | "users" | "orders" | "revenue"

export default function AdminPage() {
  const { t, localeHref } = useLanguage()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminKey, setAdminKey] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [userSearch, setUserSearch] = useState("")

  const fetchStats = async () => {
    if (!adminKey) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/proxy/api/payments/admin/stats", {
        headers: { "x-admin-key": adminKey },
      })
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

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("admin.tabOverview") || "Overview", icon: <Activity size={16} /> },
    { key: "users", label: t("admin.tabUsers") || "Users", icon: <Users size={16} /> },
    { key: "orders", label: t("admin.tabOrders") || "Orders", icon: <ShoppingCart size={16} /> },
    { key: "revenue", label: t("admin.tabRevenue") || "Revenue", icon: <DollarSign size={16} /> },
  ]

  const filteredUsers = stats?.recentUsers?.filter(u =>
    !userSearch || u.email.toLowerCase().includes(userSearch.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen bg-ink px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif font-bold text-white">
            {t("admin.title") || "Admin Dashboard"}
          </h1>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-white/70 hover:border-gold/30 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {t("admin.refresh") || "Refresh"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "bg-white/[0.04] text-white/50 border border-white/10 hover:text-white/70"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {loading && !stats ? (
          <div className="text-center text-white/50 py-20">
            {t("admin.loading") || "Loading..."}
          </div>
        ) : stats ? (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
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
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder={t("admin.searchUsers") || "Search by email..."}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/40 text-sm"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-3 text-white/50 font-normal text-sm">#</th>
                        <th className="pb-3 text-white/50 font-normal text-sm">
                          {t("admin.email") || "Email"}
                        </th>
                        <th className="pb-3 text-white/50 font-normal text-sm">
                          {t("admin.registeredAt") || "Registered At"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-3 text-white/40 text-sm">{i + 1}</td>
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
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-serif font-bold text-white">
                    {t("admin.recentOrders") || "Recent Orders"}
                  </h2>
                  <a
                    href={localeHref("/admin/orders")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-medium hover:bg-gold/20 transition-colors"
                  >
                    {t("admin.viewAllOrders") || "Manage Orders"} <ExternalLink size={12} />
                  </a>
                </div>
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="pb-3 text-white/50 font-normal text-sm">ID</th>
                          <th className="pb-3 text-white/50 font-normal text-sm">
                            {t("admin.amount") || "Amount"}
                          </th>
                          <th className="pb-3 text-white/50 font-normal text-sm">
                            {t("admin.status") || "Status"}
                          </th>
                          <th className="pb-3 text-white/50 font-normal text-sm">
                            {t("admin.createdAt") || "Created At"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders.map((order, i) => {
                          const statusStyles: Record<string, string> = {
                            pending: "bg-amber-500/20 text-amber-400",
                            processing: "bg-blue-500/20 text-blue-400",
                            paid: "bg-green-500/20 text-green-400",
                            shipped: "bg-purple-500/20 text-purple-400",
                            delivered: "bg-green-300/20 text-green-300",
                            cancelled: "bg-red-500/20 text-red-400",
                            pending_refund: "bg-orange-500/20 text-orange-400",
                            refunded: "bg-gray-500/20 text-gray-400",
                          }
                          const statusLabels: Record<string, string> = {
                            pending: t("adminOrders.status.pending") || "Pending",
                            processing: t("adminOrders.status.processing") || "Processing",
                            paid: t("adminOrders.status.paid") || "Paid",
                            shipped: t("adminOrders.status.shipped") || "Shipped",
                            delivered: t("adminOrders.status.delivered") || "Delivered",
                            cancelled: t("adminOrders.status.cancelled") || "Cancelled",
                            pending_refund: t("adminOrders.status.pending_refund") || "Refund Pending",
                            refunded: t("adminOrders.status.refunded") || "Refunded",
                          }
                          return (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="py-3 text-white/50 text-sm font-mono">{order.id.slice(0, 8)}...</td>
                              <td className="py-3 text-white/70">¥{order.total_cny}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[order.status] || "bg-white/10 text-white/50"}`}>
                                  {statusLabels[order.status] || order.status}
                                </span>
                              </td>
                              <td className="py-3 text-white/50 text-sm">
                                {new Date(order.created_at).toLocaleDateString("zh-CN")}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">{t("admin.noOrders") || "No orders yet"}</p>
                )}
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === "revenue" && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6">
                <h2 className="text-xl font-serif font-bold text-white mb-4">
                  {t("admin.revenueStats") || "Revenue Statistics"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <p className="text-white/40 text-sm mb-1">{t("admin.totalRevenue") || "Total Revenue"}</p>
                    <p className="text-2xl font-bold text-gold">¥{stats.totalRevenue || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <p className="text-white/40 text-sm mb-1">{t("admin.conversionRate") || "Conversion Rate"}</p>
                    <p className="text-2xl font-bold text-gold">
                      {stats.totalUsers > 0 ? Math.round((stats.paidUsers / stats.totalUsers) * 100) : 0}%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <p className="text-white/40 text-sm mb-1">{t("admin.avgOrderValue") || "Avg Order Value"}</p>
                    <p className="text-2xl font-bold text-gold">
                      ¥{stats.totalOrders > 0 ? Math.round((stats.totalRevenue || 0) / stats.totalOrders) : 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
