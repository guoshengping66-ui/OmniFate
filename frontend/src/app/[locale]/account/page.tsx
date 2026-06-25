"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Loader2, User, Crown, ScrollText, ShoppingBag, Heart,
  Ticket, Settings, LogOut, ChevronRight, Package, Clock,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice, formatCouponBalance } from "@/lib/regionPrice"
import MembershipBadge, { getUserTier } from "@/components/ui/MembershipBadge"
import { listMyReadings, listMyOrders, getFavorites, deleteReading, type ReadingListItem, type OrderListItem, type Product } from "@/lib/api"
import { getReadingHistory, clearReadingHistory, removeReadingFromHistory, type ReadingHistoryItem } from "@/lib/readingHistory"
import SettingsTab from "./SettingsTab"

type Tab = "overview" | "readings" | "orders" | "favorites" | "subscription" | "settings"

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, logout, refreshUser } = useAuth()
  const { t, localeHref } = useLanguage()
  const { region } = useRegion()
  const initialTab = (searchParams.get("tab") as Tab) || "overview"
  const [tab, setTab] = useState<Tab>(initialTab)
  const [readings, setReadings] = useState<ReadingListItem[]>([])
  const [anonymousReadings, setAnonymousReadings] = useState<ReadingHistoryItem[]>([])
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: t("checkout.processing"), color: "text-yellow-400" },
    paid: { label: t("payment.success"), color: "text-green-400" },
    shipped: { label: t("checkout.processing"), color: "text-blue-400" },
    delivered: { label: t("checkout.success"), color: "text-green-400" },
    cancelled: { label: t("common.cancel"), color: "text-white/30" },
    refunded: { label: t("checkout.processing"), color: "text-orange-400" },
  }

  // Combine logged-in and anonymous readings for total count
  const totalReadings = readings.length + anonymousReadings.length

  const tabs: { id: Tab; icon: React.ReactNode; label: string; count?: number }[] = [
    { id: "overview", icon: <User size={16} />, label: t("account.overview") },
    { id: "readings", icon: <ScrollText size={16} />, label: t("account.myReports"), count: totalReadings },
    { id: "orders", icon: <Package size={16} />, label: t("account.myOrders"), count: orders.length },
    { id: "favorites", icon: <Heart size={16} />, label: t("account.myFavorites"), count: favorites.length },
    { id: "subscription", icon: <Crown size={16} />, label: t("account.subscription") },
    { id: "settings", icon: <Settings size={16} />, label: t("account.settings") },
  ]

  useEffect(() => {
    if (authLoading) return

    // Always load anonymous readings from localStorage
    const anonReadings = getReadingHistory()
    setAnonymousReadings(anonReadings)

    if (!user) {
      // For anonymous users, just show localStorage readings
      setLoading(false)
      return
    }

    // For logged-in users, also load server-side readings
    Promise.all([
      listMyReadings().catch(() => []),
      listMyOrders().catch(() => []),
      getFavorites().catch(() => []),
    ]).then(([r, o, f]) => {
      setReadings(r)
      setOrders(o)
      setFavorites(f)
    }).finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  // Allow anonymous users to view their reading history
  // Only redirect if no anonymous readings exist
  if (!user && anonymousReadings.length === 0) {
    router.push(localeHref("/login"))
    return null
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile header — only show if user is logged in */}
        {user && (
        <div className="card-glass p-6 md:p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center">
              <span className="text-gold text-2xl font-serif font-bold">
                {(user.display_name || user.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-serif font-bold text-gold">{user.display_name || user.email}</h1>
              <p className="text-white/40 text-sm">{user.email}</p>
              <div className="mt-2">
                <MembershipBadge tier={getUserTier(user)} size="md" showLabel />
              </div>
            </div>
            <button
              onClick={() => { logout(); router.push(localeHref("/")); }}
              className="flex items-center gap-1.5 text-white/30 hover:text-red-400 text-xs transition-colors"
            >
              <LogOut size={14} /> {t("account.logout")}
            </button>
          </div>
        </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar tabs */}
          <div className="hidden md:flex flex-col gap-1 w-48 flex-shrink-0">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm transition-all
                  ${tab === t.id
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                  }`}
              >
                {t.icon}
                <span className="flex-1 text-left">{t.label}</span>
                {t.count != null && t.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded-full">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile tab bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink/95 border-t border-white/10 flex overflow-x-auto scrollbar-none">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-1 px-4 py-3 text-[10px] min-w-[60px] transition-all
                  ${tab === t.id ? "text-gold" : "text-white/30"}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-4">
                <h2 className="font-serif text-lg text-gold mb-4">{t("account.overviewTitle")}</h2>

                {/* Recent readings */}
                {readings.length > 0 && (
                  <div className="card-glass p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white/60">{t("account.recentReports")}</h3>
                      <Link href="/readings" className="text-gold/60 text-xs hover:text-gold">
                        {t("account.viewAll")} <ChevronRight size={10} className="inline" />
                      </Link>
                    </div>
                    {readings.slice(0, 3).map(r => (
                      <Link key={r.id} href={`/reading/${r.id}`}
                        className="flex items-center gap-3 py-2 hover:bg-white/[0.03] rounded-lg px-2 -mx-2 transition-colors">
                        <span className="text-lg">🔮</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/60 text-sm truncate">{t("account.analysis")}</p>
                          <p className="text-white/20 text-[10px]">{new Date(r.created_at).toLocaleDateString("zh-CN")}</p>
                        </div>
                        <ChevronRight size={12} className="text-white/20" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Recent orders */}
                {orders.length > 0 && (
                  <div className="card-glass p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white/60">{t("account.recentOrders")}</h3>
                      <button onClick={() => setTab("orders")} className="text-gold/60 text-xs hover:text-gold">
                        {t("account.viewAll")} <ChevronRight size={10} className="inline" />
                      </button>
                    </div>
                    {orders.slice(0, 3).map(o => {
                      const status = ORDER_STATUS_LABELS[o.status] || { label: o.status, color: "text-white/40" }
                      return (
                        <div key={o.id} className="flex items-center gap-3 py-2">
                          <span className="text-lg">📦</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/60 text-sm">{t("account.orderLabel")} {o.order_no}</p>
                            <p className="text-white/20 text-[10px]">¥{o.total_cny} · {new Date(o.created_at).toLocaleDateString("zh-CN")}</p>
                          </div>
                          <span className={`text-[10px] ${status.color}`}>{status.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Subscription info */}
                {user && (
                <div className="card-glass p-5">
                  <h3 className="text-sm font-medium text-white/60 mb-3">{t("account.subStatus")}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown size={16} className={user.is_premium ? "text-gold" : "text-white/20"} />
                      <span className="text-sm text-white/60">
                        {user.is_premium
                          ? `${user.subscription_tier === "premium_yearly" ? t("membership.yearly") : t("membership.monthly")}`
                          : t("membership.free")}
                      </span>
                    </div>
                    <Link href="/pricing" className="text-gold text-xs hover:underline">
                      {user.is_premium ? t("account.manageSub") : t("account.upgrade")}
                    </Link>
                  </div>
                </div>
                )}
              </div>
            )}

            {/* Readings */}
            {tab === "readings" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-lg text-gold">{t("account.myReports")}</h2>
                  <Link href="/reading/new" className="btn-gold text-xs py-1.5 px-4">{t("account.newReading")}</Link>
                </div>

                {/* Logged-in readings */}
                {readings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white/50 text-xs mb-3 uppercase tracking-wider">{user ? t("account.accountReadings") : ""}</h3>
                    <div className="space-y-3">
                      {readings.map(r => (
                        <div key={r.id}
                          className="block card-glass p-4 hover:border-gold/30 transition-all group">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🔮</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/70 text-sm">{t("readings.reportTitle")}</p>
                              <p className="text-white/20 text-[10px] mt-0.5">
                                {new Date(r.created_at).toLocaleString("zh-CN")}
                              </p>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                try {
                                  await deleteReading(r.id)
                                  setReadings(prev => prev.filter(x => x.id !== r.id))
                                  toast.success(t("common.deleted"))
                                } catch {
                                  toast.error(t("common.deleteFailed"))
                                }
                              }}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white/15 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
                            >
                              ✕
                            </button>
                            <Link href={`/reading/${r.id}`} className="flex-shrink-0">
                              <ChevronRight size={14} className="text-white/20 group-hover:text-gold" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Anonymous readings from localStorage */}
                {anonymousReadings.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white/50 text-xs uppercase tracking-wider">{t("account.localReadings")}</h3>
                      <button
                        onClick={() => {
                          clearReadingHistory()
                          setAnonymousReadings([])
                          toast.success(t("account.clearHistory") || "已清除本地历史记录")
                        }}
                        className="text-white/20 text-[10px] hover:text-red-400 transition-colors"
                      >
                        {t("account.clearHistory") || "清除"}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {anonymousReadings.map(r => (
                        <div key={r.sessionId}
                          className="block card-glass p-4 hover:border-gold/30 transition-all group">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">📋</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/70 text-sm truncate">
                                {r.userQuestion || t("readings.reportTitle")}
                              </p>
                              <p className="text-white/20 text-[10px] mt-0.5">
                                {new Date(r.createdAt).toLocaleString("zh-CN")}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeReadingFromHistory(r.sessionId)
                                setAnonymousReadings(prev => prev.filter(x => x.sessionId !== r.sessionId))
                                toast.success(t("common.deleted"))
                              }}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white/15 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
                            >
                              ✕
                            </button>
                            <Link href={`/reading/${r.sessionId}`} className="flex-shrink-0">
                              <ChevronRight size={14} className="text-white/20 group-hover:text-gold" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {readings.length === 0 && anonymousReadings.length === 0 && (
                  <div className="card-glass p-12 text-center">
                    <ScrollText size={36} className="mx-auto mb-3 text-white/10" />
                    <p className="text-white/30 text-sm">{t("account.noReports")}</p>
                  </div>
                )}
              </div>
            )}

            {/* Orders */}
            {tab === "orders" && (
              <div>
                <h2 className="font-serif text-lg text-gold mb-4">{t("account.myOrders")}</h2>
                {orders.length === 0 ? (
                  <div className="card-glass p-12 text-center">
                    <ShoppingBag size={36} className="mx-auto mb-3 text-white/10" />
                    <p className="text-white/30 text-sm">{t("account.noOrders")}</p>
                    <Link href="/shop" className="text-gold text-xs mt-2 hover:underline">{t("account.browseShop")}</Link>
                  </div>
                ) : (
                  <OrderList orders={orders} statusLabels={ORDER_STATUS_LABELS} t={t as unknown as (key: string) => string} />
                )}
              </div>
            )}

            {/* Favorites */}
            {tab === "favorites" && (
              <div>
                <h2 className="font-serif text-lg text-gold mb-4">{t("account.myFavorites")}</h2>
                {favorites.length === 0 ? (
                  <div className="card-glass p-12 text-center">
                    <Heart size={36} className="mx-auto mb-3 text-white/10" />
                    <p className="text-white/30 text-sm">{t("account.noFavorites")}</p>
                    <Link href="/shop" className="text-gold text-xs mt-2 hover:underline">{t("account.browseShopAlt")}</Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {favorites.map(p => (
                      <Link key={p.id} href={`/shop/${p.id}`}
                        className="card-glass p-4 hover:border-gold/30 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center text-xl flex-shrink-0">
                            🔮
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-sm truncate">{p.name}</p>
                            <p className="text-gold text-sm font-bold">{getProductPrice(p, region).symbol}{getProductPrice(p, region).price}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subscription */}
            {tab === "subscription" && user && (() => {
              const tier = user.subscription_tier
              const isPremium = user.is_premium
              const expiresAt = user.premium_expires_at ? new Date(user.premium_expires_at) : null
              const now = new Date()
              const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
              const isExpired = daysLeft !== null && daysLeft <= 0
              const isFounder = tier === "founder_lifetime"

              const TIER_LABELS: Record<string, { label: string; color: string; bg: string }> = {
                founder_lifetime: { label: t("membership.founder") || "创始人终身", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
                premium_yearly:   { label: t("membership.yearly"), color: "text-gold", bg: "bg-gold/10 border-gold/30" },
                premium_monthly:  { label: t("membership.monthly"), color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
                trial:            { label: t("membership.trial"), color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30" },
                free:             { label: t("membership.free"), color: "text-white/40", bg: "bg-white/5 border-white/10" },
              }
              const tierInfo = TIER_LABELS[tier || "free"] || TIER_LABELS.free

              return (
                <div>
                  <h2 className="font-serif text-lg text-gold mb-4">{t("account.subManagement")}</h2>

                  {/* Current plan card */}
                  <div className="card-glass p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Crown size={24} className={isPremium ? "text-gold" : "text-white/20"} />
                        <div>
                          <p className="text-white/80 font-medium">{t("account.fateOSMember")}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${tierInfo.bg} ${tierInfo.color}`}>
                        {tierInfo.label}
                      </span>
                    </div>

                    {/* Expiry info */}
                    {isFounder ? (
                      <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-3 mb-4">
                        <p className="text-amber-400 text-sm font-medium">{t("account.permanent")}</p>
                        <p className="text-white/30 text-xs mt-1">{t("account.founderLifetime")}</p>
                      </div>
                    ) : expiresAt ? (
                      <div className={`rounded-xl p-3 mb-4 ${
                        isExpired
                          ? "bg-red-500/5 border border-red-500/20"
                          : (daysLeft !== null && daysLeft <= 7)
                            ? "bg-orange-500/5 border border-orange-500/20"
                            : "bg-white/5 border border-white/10"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-xs">{t("account.expiresAt")}</p>
                            <p className="text-white/80 text-sm mt-0.5">{expiresAt.toLocaleDateString("zh-CN")}</p>
                          </div>
                          <div className="text-right">
                            {isExpired ? (
                              <p className="text-red-400 text-sm font-medium">{t("account.expired")}</p>
                            ) : (
                              <>
                                <p className={`text-2xl font-bold ${daysLeft !== null && daysLeft <= 7 ? "text-orange-400" : "text-gold"}`}>
                                  {daysLeft}
                                </p>
                                <p className="text-white/40 text-[10px]">{t("account.daysLeft")}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                        <p className="text-white/40 text-sm">{t("account.upgradeDesc")}</p>
                      </div>
                    )}

                    {/* Benefits */}
                    <div className="space-y-2 text-sm text-white/50 mb-6">
                      <p className="flex items-center gap-2"><span className="text-gold">✓</span> {t("account.unlimited")}</p>
                      <p className="flex items-center gap-2"><span className="text-gold">✓</span> {t("account.annualPlan")}</p>
                      <p className="flex items-center gap-2"><span className="text-gold">✓</span> {t("account.memberDiscount2")}</p>
                      <p className="flex items-center gap-2"><span className="text-gold">✓</span> {t("account.fortunePlan")}</p>
                      <p className="flex items-center gap-2"><span className="text-gold">✓</span> {t("account.multiProfile")}</p>
                    </div>

                    <Link href="/pricing" className="btn-gold inline-flex items-center gap-2 text-sm">
                      {isPremium ? t("account.manageSub") : t("account.upgrade")}
                    </Link>
                  </div>

                  {/* Coupon balance */}
                  {user.shop_coupon_balance > 0 && (
                    <div className="card-glass p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket size={16} className="text-gold" />
                        <span className="text-white/60 text-sm">{t("account.couponBalance2")}</span>
                      </div>
                      <p className="text-gold text-2xl font-bold">{formatCouponBalance(user.shop_coupon_balance, region)}</p>
                      <p className="text-white/20 text-xs mt-1">{t("account.couponUseHint")}</p>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Settings */}
            {tab === "settings" && user && <SettingsTab user={user} refreshUser={refreshUser} t={t as unknown as (key: string) => string} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Order List with Filtering ────────────────────────────────────────────

import { useState as useStateLocal } from "react"

function OrderList({ orders, statusLabels, t }: {
  orders: OrderListItem[]
  statusLabels: Record<string, { label: string; color: string }>
  t: (key: string) => string
}) {
  const [filter, setFilter] = useStateLocal<string>("all")

  const FILTERS = [
    { key: "all", label: t("order.filter.all") },
    { key: "pending", label: t("order.filter.pending") },
    { key: "paid", label: t("order.filter.paid") },
    { key: "shipped", label: t("order.filter.shipped") },
    { key: "delivered", label: t("order.filter.delivered") },
  ]

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none mb-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? "bg-gold/15 text-gold border border-gold/30"
                : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="card-glass p-8 text-center">
          <p className="text-white/30 text-sm">{t("account.noOrders")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const status = statusLabels[o.status] || { label: o.status, color: "text-white/40" }
            return (
              <Link
                key={o.id}
                href={`/account/orders/${o.id}`}
                className="block card-glass p-4 hover:border-gold/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-xs font-mono">{o.order_no}</span>
                  <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">
                    {o.item_count} {t("account.itemsUnit")} · {new Date(o.created_at).toLocaleDateString("zh-CN")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gold font-bold">¥{o.total_cny}</span>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-gold transition-colors" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
