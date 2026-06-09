"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Package, Search, RefreshCw, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from "lucide-react"

interface OrderItem {
  product_name: string
  quantity: number
  unit_price_cny: number
  subtotal_cny: number
}

interface ShopOrder {
  order_no: string
  status: string
  total_cny: number
  payment_method: string
  recipient_name: string
  recipient_phone: string
  shipping_address: Record<string, string> | null
  tracking_number: string | null
  notes: string | null
  created_at: string
  paid_at: string | null
  user: { id: string; nickname: string; email: string } | null
  items: OrderItem[]
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "待支付", color: "text-amber-400 bg-amber-500/10", icon: <Clock size={14} /> },
  processing: { label: "处理中", color: "text-blue-400 bg-blue-500/10", icon: <RefreshCw size={14} /> },
  paid: { label: "已支付", color: "text-green-400 bg-green-500/10", icon: <CheckCircle size={14} /> },
  shipped: { label: "已发货", color: "text-purple-400 bg-purple-500/10", icon: <Truck size={14} /> },
  delivered: { label: "已完成", color: "text-green-300 bg-green-500/10", icon: <CheckCircle size={14} /> },
  cancelled: { label: "已取消", color: "text-red-400 bg-red-500/10", icon: <XCircle size={14} /> },
}

const STATUS_OPTIONS = ["pending", "processing", "paid", "shipped", "delivered", "cancelled"]

export default function AdminOrdersPage() {
  const { t } = useLanguage()
  const [adminKey, setAdminKey] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({})

  const fetchOrders = async () => {
    if (!adminKey) return
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: String(page), page_size: "20" })
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/proxy/api/payments/admin/shop-orders?${params}`, {
        headers: { "x-admin-key": adminKey },
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to fetch orders")
      }
      const data = await res.json()
      setOrders(data.orders)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) fetchOrders()
  }, [authenticated, page, statusFilter])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthenticated(true)
  }

  const updateOrderStatus = async (orderNo: string, newStatus: string) => {
    setUpdatingOrder(orderNo)
    try {
      const body: Record<string, string> = { status: newStatus }
      if (trackingInput[orderNo]) body.tracking_number = trackingInput[orderNo]
      const res = await fetch(`/api/proxy/api/payments/admin/shop-orders/${orderNo}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Update failed")
      }
      fetchOrders()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingOrder(null)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-4">
        <div className="w-full max-w-sm p-8 rounded-2xl bg-white/[0.04] border border-white/10">
          <h1 className="text-2xl font-serif font-bold text-white mb-6 text-center">
            订单管理
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="输入管理员密钥"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gold text-ink font-semibold hover:shadow-[0_0_24px_rgba(201,168,76,0.5)] transition-all"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-serif font-bold text-gold flex items-center gap-2">
            <Package size={24} /> 订单管理
          </h1>
          <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> 刷新
          </button>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => { setStatusFilter(""); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${!statusFilter ? "bg-gold/20 text-gold border border-gold/30" : "bg-white/5 text-white/50 border border-white/10 hover:border-white/20"}`}
          >
            全部 ({total})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${statusFilter === s ? "bg-gold/20 text-gold border border-gold/30" : "bg-white/5 text-white/50 border border-white/10 hover:border-white/20"}`}
            >
              {STATUS_MAP[s]?.label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="text-center py-12 text-white/40">加载中...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-white/40">暂无订单</div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
              const isExpanded = expandedOrder === order.order_no
              return (
                <div key={order.order_no} className="card-glass overflow-hidden">
                  {/* Order header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.order_no)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                        <span className="text-white/80 text-sm font-mono">{order.order_no}</span>
                        <span className="text-white/40 text-xs">
                          {order.created_at ? new Date(order.created_at).toLocaleString("zh-CN") : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gold font-bold">¥{order.total_cny.toFixed(2)}</span>
                        {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-white/5 p-4 space-y-4">
                      {/* Items */}
                      <div>
                        <p className="text-white/50 text-xs mb-2">商品明细</p>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm py-1">
                            <span className="text-white/70">{item.product_name} x{item.quantity}</span>
                            <span className="text-white/50">¥{item.subtotal_cny.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* User info */}
                      {order.user && (
                        <div>
                          <p className="text-white/50 text-xs mb-1">用户信息</p>
                          <p className="text-white/70 text-sm">{order.user.nickname || order.user.email}</p>
                        </div>
                      )}

                      {/* Shipping address */}
                      {order.shipping_address && (
                        <div>
                          <p className="text-white/50 text-xs mb-1">收货地址</p>
                          <p className="text-white/70 text-sm">
                            {order.recipient_name} {order.recipient_phone}<br />
                            {order.shipping_address.province} {order.shipping_address.city} {order.shipping_address.district}<br />
                            {order.shipping_address.address_line1}
                            {order.shipping_address.address_line2 && <>, {order.shipping_address.address_line2}</>}
                            {order.shipping_address.postal_code && <> {order.shipping_address.postal_code}</>}
                          </p>
                        </div>
                      )}

                      {/* Tracking number */}
                      {order.tracking_number && (
                        <div>
                          <p className="text-white/50 text-xs mb-1">物流单号</p>
                          <p className="text-white/70 text-sm font-mono">{order.tracking_number}</p>
                        </div>
                      )}

                      {/* Status update */}
                      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.order_no, e.target.value)}
                          disabled={updatingOrder === order.order_no}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{STATUS_MAP[s]?.label}</option>
                          ))}
                        </select>
                        {order.status === "paid" && (
                          <input
                            type="text"
                            placeholder="物流单号"
                            value={trackingInput[order.order_no] || ""}
                            onChange={(e) => setTrackingInput(prev => ({ ...prev, [order.order_no]: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/50"
                          />
                        )}
                        {updatingOrder === order.order_no && (
                          <span className="text-white/40 text-xs">更新中...</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary px-3 py-1 text-sm disabled:opacity-30"
            >
              上一页
            </button>
            <span className="text-white/40 text-sm py-1">第 {page} 页 / 共 {Math.ceil(total / 20)} 页</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 20 >= total}
              className="btn-secondary px-3 py-1 text-sm disabled:opacity-30"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
