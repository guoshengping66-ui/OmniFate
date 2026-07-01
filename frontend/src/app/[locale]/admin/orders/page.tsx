"use client"

import { useEffect, useState, useCallback } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Package, Search, RefreshCw, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, RotateCcw, Send } from "lucide-react"

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
  shipping_carrier: string | null
  notes: string | null
  created_at: string
  paid_at: string | null
  refund_reason: string | null
  refund_amount: number | null
  refund_note: string | null
  refund_requested_at: string | null
  refund_processed_at: string | null
  cj_order_number: string | null
  cj_order_status: string | null
  cj_shipping_cost: number | null
  fulfilled_via: string | null
  user: { id: string; nickname: string; email: string } | null
  items: OrderItem[]
}

const STATUS_OPTIONS = ["pending", "processing", "paid", "shipped", "delivered", "cancelled", "pending_refund", "refunded"]

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
  const [carrierInput, setCarrierInput] = useState<Record<string, string>>({})
  // Refund operation state
  const [refundAmounts, setRefundAmounts] = useState<Record<string, string>>({})
  const [refundNotes, setRefundNotes] = useState<Record<string, string>>({})
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({})
  const [processingRefund, setProcessingRefund] = useState<string | null>(null)
  // CJ Dropshipping state
  const [fulfillingCJ, setFulfillingCJ] = useState<string | null>(null)
  const [syncingCJ, setSyncingCJ] = useState<string | null>(null)

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: t("adminOrders.status.pending"), color: "text-amber-400 bg-amber-500/10", icon: <Clock size={14} /> },
      processing: { label: t("adminOrders.status.processing"), color: "text-blue-400 bg-blue-500/10", icon: <RefreshCw size={14} /> },
      paid: { label: t("adminOrders.status.paid"), color: "text-green-400 bg-green-500/10", icon: <CheckCircle size={14} /> },
      shipped: { label: t("adminOrders.status.shipped"), color: "text-purple-400 bg-purple-500/10", icon: <Truck size={14} /> },
      delivered: { label: t("adminOrders.status.delivered"), color: "text-green-300 bg-green-500/10", icon: <CheckCircle size={14} /> },
      cancelled: { label: t("adminOrders.status.cancelled"), color: "text-red-400 bg-red-500/10", icon: <XCircle size={14} /> },
      pending_refund: { label: t("adminOrders.status.pending_refund"), color: "text-orange-400 bg-orange-500/10", icon: <RotateCcw size={14} /> },
      refunded: { label: t("adminOrders.status.refunded"), color: "text-gray-400 bg-gray-500/10", icon: <CheckCircle size={14} /> },
    }
    return map[status] || map.pending
  }

  const fetchOrders = useCallback(async () => {
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
  }, [adminKey, page, statusFilter])

  useEffect(() => {
    if (authenticated) fetchOrders()
  }, [authenticated, fetchOrders])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/api/proxy/api/payments/admin/shop-orders?page=1&page_size=1", {
        headers: { "x-admin-key": adminKey },
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || t("adminOrders.authFailed"))
      }
      setAuthenticated(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const updateOrderStatus = async (orderNo: string, newStatus: string) => {
    setUpdatingOrder(orderNo)
    try {
      const body: Record<string, string> = { status: newStatus }
      if (trackingInput[orderNo]) body.tracking_number = trackingInput[orderNo]
      if (carrierInput[orderNo]) body.shipping_carrier = carrierInput[orderNo]
      const res = await fetch(`/api/proxy/api/payments/admin/shop-orders/${orderNo}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || t("adminOrders.updateFailed"))
      }
      fetchOrders()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const markManualShipped = async (order: ShopOrder) => {
    const trackingNumber = (trackingInput[order.order_no] || order.tracking_number || "").trim()
    const carrier = (carrierInput[order.order_no] || order.shipping_carrier || "").trim()
    if (!carrier || !trackingNumber) {
      setError("请先填写物流公司和物流单号")
      return
    }
    setUpdatingOrder(order.order_no)
    try {
      const res = await fetch(`/api/proxy/api/payments/admin/shop-orders/${order.order_no}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          status: "shipped",
          shipping_carrier: carrier,
          tracking_number: trackingNumber,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || t("adminOrders.updateFailed"))
      }
      setTrackingInput(prev => ({ ...prev, [order.order_no]: "" }))
      setCarrierInput(prev => ({ ...prev, [order.order_no]: "" }))
      fetchOrders()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleApproveRefund = async (orderNo: string, totalCny: number) => {
    setProcessingRefund(orderNo)
    try {
      const body: Record<string, any> = {}
      const amt = refundAmounts[orderNo]
      if (amt && parseFloat(amt) > 0) body.refund_amount = parseFloat(amt)
      if (refundNotes[orderNo]) body.refund_note = refundNotes[orderNo]
      const res = await fetch(`/api/proxy/api/payments/admin/shop-orders/${orderNo}/approve-refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || t("adminOrders.refundFailed"))
      }
      fetchOrders()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessingRefund(null)
    }
  }

  const handleRejectRefund = async (orderNo: string) => {
    const reason = rejectReasons[orderNo]
    if (!reason || !reason.trim()) {
      setError(t("adminOrders.rejectReason"))
      return
    }
    setProcessingRefund(orderNo)
    try {
      const res = await fetch(`/api/proxy/api/payments/admin/shop-orders/${orderNo}/reject-refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ reason: reason.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || t("adminOrders.refundFailed"))
      }
      fetchOrders()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessingRefund(null)
    }
  }

  const handleFulfillCJ = async (orderNo: string) => {
    if (!confirm(t("adminOrders.fulfillCJConfirm"))) return
    setFulfillingCJ(orderNo)
    try {
      const res = await fetch(`/api/proxy/api/payments/admin/shop-orders/${orderNo}/fulfill-cj`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || t("adminOrders.cjPushFailed"))
      }
      fetchOrders()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFulfillingCJ(null)
    }
  }

  const handleSyncCJ = async (orderNo: string) => {
    setSyncingCJ(orderNo)
    try {
      const res = await fetch(`/api/proxy/api/payments/admin/shop-orders/${orderNo}/sync-cj-tracking`, {
        method: "POST",
        headers: { "x-admin-key": adminKey },
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || t("adminOrders.cjSyncFailed"))
      }
      fetchOrders()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSyncingCJ(null)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-4">
        <div className="w-full max-w-sm p-8 rounded-2xl bg-white/[0.04] border border-white/10">
          <h1 className="text-2xl font-serif font-bold text-white mb-6 text-center">
            {t("adminOrders.title")}
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder={t("adminOrders.enterKey")}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gold text-ink font-semibold hover:shadow-[0_0_24px_rgba(201,168,76,0.5)] transition-all"
            >
              {t("adminOrders.login")}
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
            <Package size={24} /> {t("adminOrders.title")}
          </h1>
          <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> {t("adminOrders.refresh")}
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-3 mb-6">
          {[
            ["待发货", orders.filter(o => o.status === "paid").length, "text-green-300"],
            ["已发货", orders.filter(o => o.status === "shipped").length, "text-purple-300"],
            ["退款中", orders.filter(o => o.status === "pending_refund").length, "text-orange-300"],
            ["本页订单", orders.length, "text-gold"],
          ].map(([label, count, color]) => (
            <div key={label as string} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
              <p className="text-white/35 text-xs">{label}</p>
              <p className={`text-xl font-semibold mt-1 ${color}`}>{count}</p>
            </div>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => { setStatusFilter(""); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${!statusFilter ? "bg-gold/20 text-gold border border-gold/30" : "bg-white/5 text-white/50 border border-white/10 hover:border-white/20"}`}
          >
            {t("adminOrders.all")} ({total})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${statusFilter === s ? "bg-gold/20 text-gold border border-gold/30" : "bg-white/5 text-white/50 border border-white/10 hover:border-white/20"}`}
            >
              {getStatusInfo(s).label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="text-center py-12 text-white/40">{t("adminOrders.loading")}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-white/40">{t("adminOrders.noOrders")}</div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const statusInfo = getStatusInfo(order.status)
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
                        {order.status === "paid" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                            待发货
                          </span>
                        )}
                        <span className="text-white/40 text-xs">
                          {order.created_at ? new Date(order.created_at).toLocaleString() : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gold font-bold">¥{(order.total_cny ?? 0).toFixed(2)}</span>
                        {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-white/5 p-4 space-y-4">
                      {/* Items */}
                      <div>
                        <p className="text-white/50 text-xs mb-2">{t("adminOrders.items")}</p>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm py-1">
                            <span className="text-white/70">{item.product_name} x{item.quantity}</span>
                            <span className="text-white/50">¥{(item.subtotal_cny ?? 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* User info */}
                      {order.user && (
                        <div>
                          <p className="text-white/50 text-xs mb-1">{t("adminOrders.userInfo")}</p>
                          <p className="text-white/70 text-sm">{order.user.nickname || order.user.email}</p>
                          <p className="text-white/40 text-xs">{order.user.email}</p>
                        </div>
                      )}

                      {/* Shipping address */}
                      {order.shipping_address && (
                        <div>
                          <p className="text-white/50 text-xs mb-1">{t("adminOrders.shippingAddress")}</p>
                          <p className="text-white/70 text-sm">
                            {order.recipient_name} {order.recipient_phone}<br />
                            {order.shipping_address.country && <>{order.shipping_address.country}<br /></>}
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
                          <p className="text-white/50 text-xs mb-1">{t("adminOrders.trackingNumber")}</p>
                          <p className="text-white/70 text-sm font-mono">
                            {order.shipping_carrier && <span className="mr-2 text-white/45">{order.shipping_carrier}</span>}
                            {order.tracking_number}
                          </p>
                        </div>
                      )}

                      {order.status === "paid" && (
                        <div className="rounded-xl border border-gold/20 bg-gold/[0.05] p-3 space-y-3">
                          <div className="flex items-center gap-2 text-gold text-sm font-medium">
                            <Truck size={14} /> 手动发货
                          </div>
                          <div className="grid md:grid-cols-[1fr_1fr_auto] gap-2">
                            <input
                              type="text"
                              placeholder="物流公司，例如 SF / YTO / USPS"
                              value={carrierInput[order.order_no] ?? order.shipping_carrier ?? ""}
                              onChange={(e) => setCarrierInput(prev => ({ ...prev, [order.order_no]: e.target.value }))}
                              className="px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/50"
                            />
                            <input
                              type="text"
                              placeholder="物流单号"
                              value={trackingInput[order.order_no] ?? order.tracking_number ?? ""}
                              onChange={(e) => setTrackingInput(prev => ({ ...prev, [order.order_no]: e.target.value }))}
                              className="px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/50"
                            />
                            <button
                              type="button"
                              onClick={() => markManualShipped(order)}
                              disabled={updatingOrder === order.order_no}
                              className="px-4 py-2 rounded-lg bg-gold text-ink text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <Truck size={14} />
                              {updatingOrder === order.order_no ? "更新中" : "标记已发货"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CJ Dropshipping section */}
                      {order.fulfilled_via === "cj" && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <p className="text-blue-400 text-xs font-medium mb-2 flex items-center gap-1">
                            <Truck size={12} /> {t("adminOrders.cjFulfilled")}
                          </p>
                          {order.cj_order_number && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white/40 text-[10px]">{t("adminOrders.cjOrderNo")}:</span>
                              <span className="text-white/70 text-xs font-mono">{order.cj_order_number}</span>
                            </div>
                          )}
                          {order.cj_order_status && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white/40 text-[10px]">{t("adminOrders.cjStatus")}:</span>
                              <span className="text-blue-300 text-xs">{order.cj_order_status}</span>
                            </div>
                          )}
                          {order.cj_shipping_cost != null && (
                            <p className="text-white/40 text-[10px]">
                              {t("adminOrders.cjShippingCost")}: ${order.cj_shipping_cost.toFixed(2)}
                            </p>
                          )}
                          <button
                            onClick={() => handleSyncCJ(order.order_no)}
                            disabled={syncingCJ === order.order_no}
                            className="mt-2 px-3 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white text-[11px] font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <RefreshCw size={10} className={syncingCJ === order.order_no ? "animate-spin" : ""} />
                            {t("adminOrders.syncCJTracking")}
                          </button>
                        </div>
                      )}
                      {order.status === "paid" && order.fulfilled_via !== "cj" && (
                        <button
                          onClick={() => handleFulfillCJ(order.order_no)}
                          disabled={fulfillingCJ === order.order_no}
                          className="px-4 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Send size={14} />
                          {fulfillingCJ === order.order_no ? t("adminOrders.cjPushing") : t("adminOrders.fulfillCJ")}
                        </button>
                      )}

                      {/* Refund info — pending */}
                      {order.status === "pending_refund" && (
                        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                          <p className="text-orange-400 text-xs font-medium mb-2 flex items-center gap-1">
                            <RotateCcw size={12} /> {t("adminOrders.refundSection")}
                          </p>
                          {order.refund_reason && (
                            <div className="mb-2">
                              <p className="text-white/40 text-[10px] mb-0.5">{t("adminOrders.refundReason")}</p>
                              <p className="text-white/70 text-sm">{order.refund_reason}</p>
                            </div>
                          )}
                          {order.refund_requested_at && (
                            <p className="text-white/30 text-[10px]">
                              {new Date(order.refund_requested_at).toLocaleString()}
                            </p>
                          )}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="text-white/40 text-xs whitespace-nowrap">{t("adminOrders.refundAmount")}</label>
                              <input
                                type="number"
                                step="0.01"
                                max={order.total_cny}
                                placeholder={`¥${order.total_cny.toFixed(2)}`}
                                value={refundAmounts[order.order_no] || ""}
                                onChange={(e) => setRefundAmounts(prev => ({ ...prev, [order.order_no]: e.target.value }))}
                                className="flex-1 px-2 py-1 rounded bg-white/[0.06] border border-white/10 text-white text-xs focus:outline-none focus:border-gold/50"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder={t("adminOrders.refundNote")}
                              value={refundNotes[order.order_no] || ""}
                              onChange={(e) => setRefundNotes(prev => ({ ...prev, [order.order_no]: e.target.value }))}
                              className="w-full px-2 py-1 rounded bg-white/[0.06] border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-gold/50"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveRefund(order.order_no, order.total_cny)}
                                disabled={processingRefund === order.order_no}
                                className="flex-1 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                {t("adminOrders.approveRefund")}
                              </button>
                              <button
                                onClick={() => {
                                  if (!showRejectInput[order.order_no]) {
                                    setShowRejectInput(prev => ({ ...prev, [order.order_no]: true }))
                                    return
                                  }
                                  handleRejectRefund(order.order_no)
                                }}
                                disabled={processingRefund === order.order_no}
                                className="flex-1 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                {t("adminOrders.rejectRefund")}
                              </button>
                            </div>
                            {showRejectInput[order.order_no] && (
                              <input
                                type="text"
                                placeholder={t("adminOrders.rejectReason")}
                                autoFocus
                                value={rejectReasons[order.order_no] || ""}
                                onChange={(e) => setRejectReasons(prev => ({ ...prev, [order.order_no]: e.target.value }))}
                                className="w-full px-2 py-1 rounded bg-white/[0.06] border border-red-500/30 text-white text-xs placeholder-white/30 focus:outline-none focus:border-red-500/50"
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Refund info — processed */}
                      {order.status === "refunded" && (
                        <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                          <p className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1">
                            <CheckCircle size={12} /> {t("adminOrders.status.refunded")}
                          </p>
                          {order.refund_amount != null && (
                            <p className="text-white/70 text-sm">{t("adminOrders.refundAmount")}: ¥{order.refund_amount.toFixed(2)}</p>
                          )}
                          {order.refund_processed_at && (
                            <p className="text-white/30 text-[10px] mt-1">
                              {t("adminOrders.refundNote")}: {order.refund_note || "—"}
                            </p>
                          )}
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
                            <option key={s} value={s}>{getStatusInfo(s).label}</option>
                          ))}
                        </select>
                        {order.status === "paid" && (
                          <input
                            type="text"
                            placeholder={t("adminOrders.trackingNumber")}
                            value={trackingInput[order.order_no] || ""}
                            onChange={(e) => setTrackingInput(prev => ({ ...prev, [order.order_no]: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/50"
                          />
                        )}
                        {updatingOrder === order.order_no && (
                          <span className="text-white/40 text-xs">{t("adminOrders.updating")}</span>
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
              {t("adminOrders.prevPage")}
            </button>
            <span className="text-white/40 text-sm py-1">{t("adminOrders.page")} {page} / {Math.ceil(total / 20)}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 20 >= total}
              className="btn-secondary px-3 py-1 text-sm disabled:opacity-30"
            >
              {t("adminOrders.nextPage")}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
