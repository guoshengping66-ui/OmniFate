"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2, ArrowLeft, Package, MapPin, Truck, CheckCircle,
  Clock, XCircle, RotateCcw, AlertTriangle, ExternalLink,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  getOrderDetail, cancelOrder, confirmReceive, requestRefund,
  getTrackingInfo, type OrderDetail, type TrackingInfo,
} from "@/lib/api"

const STATUS_STEPS = [
  { key: "pending", icon: Clock, zh: "待付款", en: "Pending" },
  { key: "paid", icon: Package, zh: "已付款", en: "Paid" },
  { key: "shipped", icon: Truck, zh: "已发货", en: "Shipped" },
  { key: "delivered", icon: CheckCircle, zh: "已收货", en: "Delivered" },
]

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400",
  paid: "text-blue-400",
  shipped: "text-purple-400",
  delivered: "text-green-400",
  cancelled: "text-white/30",
  pending_refund: "text-orange-400",
  refunded: "text-orange-400",
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t, locale, localeHref } = useLanguage()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  // Refund form state
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [refundReason, setRefundReason] = useState("")
  const [refundDetail, setRefundDetail] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push(localeHref("/login")); return }
    loadOrder()
  }, [id, user, authLoading])

  async function loadOrder() {
    try {
      const data = await getOrderDetail(id)
      setOrder(data)
      if (data.status === "shipped" || data.status === "delivered") {
        getTrackingInfo(id).then(setTracking).catch(() => {})
      }
    } catch {
      toast.error(t("order.detail.notFound"))
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirm(t("order.detail.cancelConfirm"))) return
    setActionLoading(true)
    try {
      await cancelOrder(id)
      toast.success(t("order.detail.cancelled"))
      loadOrder()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("order.detail.cancelFail"))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleConfirmReceive() {
    if (!confirm(t("order.detail.confirmReceiveHint"))) return
    setActionLoading(true)
    try {
      await confirmReceive(id)
      toast.success(t("order.detail.received"))
      loadOrder()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("order.detail.receiveFail"))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRefund() {
    if (!refundReason) {
      toast.error(t("order.detail.refundReasonRequired"))
      return
    }
    setActionLoading(true)
    try {
      const fullReason = refundDetail
        ? `${refundReason} — ${refundDetail}`
        : refundReason
      await requestRefund(id, fullReason)
      toast.success(t("order.detail.refundSubmitted"))
      setShowRefundForm(false)
      loadOrder()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("order.detail.refundFail"))
    } finally {
      setActionLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 text-center">
        <p className="text-white/40">{t("order.detail.notFound")}</p>
        <Link href={localeHref("/account")} className="text-gold text-sm mt-2 hover:underline">{t("account.myOrders")}</Link>
      </div>
    )
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status)
  const isCancelled = order.status === "cancelled" || order.status === "refunded"

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/40 hover:text-gold text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> {t("common.back")}
        </button>

        {/* Header */}
        <div className="card-glass p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-serif font-bold text-gold">{t("order.detail.title")}</h1>
              <p className="text-white/40 text-xs font-mono mt-1">{order.order_no}</p>
            </div>
            <span className={`text-sm font-medium ${STATUS_COLORS[order.status] || "text-white/50"}`}>
              {t(`order.status.${order.status}` as any)}
            </span>
          </div>

          {/* Status Timeline */}
          {!isCancelled && (
            <div className="flex items-center justify-between mt-6">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= currentStepIndex
                const Icon = step.icon
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    {/* Connector line */}
                    {i > 0 && (
                      <div className={`absolute top-3 right-1/2 w-full h-[2px] ${
                        i <= currentStepIndex ? "bg-gold/40" : "bg-white/10"
                      }`} />
                    )}
                    <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                      isActive ? "bg-gold/20 border border-gold/40" : "bg-white/5 border border-white/10"
                    }`}>
                      <Icon size={12} className={isActive ? "text-gold" : "text-white/20"} />
                    </div>
                    <span className={`text-[10px] mt-1.5 ${isActive ? "text-gold/80" : "text-white/20"}`}>
                      {locale === "en" ? step.en : step.zh}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {isCancelled && (
            <div className="flex items-center gap-2 mt-4 text-white/40">
              <XCircle size={16} />
              <span className="text-sm">
                {order.status === "cancelled" ? t("order.status.cancelled") : t("order.status.refunded")}
              </span>
            </div>
          )}

          {/* Refund pending indicator */}
          {order.status === "pending_refund" && (
            <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <RotateCcw size={14} className="text-orange-400" />
              <span className="text-orange-400 text-sm">{t("order.detail.refundPending")}</span>
            </div>
          )}

          {/* Refund result indicator */}
          {order.status === "refunded" && order.refund_amount != null && (
            <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} className="text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">{t("order.detail.refundApproved")}</span>
              </div>
              <p className="text-white/60 text-xs ml-5">
                {t("order.detail.refundAmount")}: <span className="text-orange-300 font-bold">¥{order.refund_amount.toFixed(2)}</span>
              </p>
              {order.refund_processed_at && (
                <p className="text-white/40 text-[10px] ml-5 mt-0.5">
                  {t("order.detail.refundProcessedAt")}: {new Date(order.refund_processed_at).toLocaleString()}
                </p>
              )}
              {order.refund_note && (
                <p className="text-white/40 text-[10px] ml-5 mt-0.5">{order.refund_note}</p>
              )}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="card-glass p-6 mb-4">
          <h2 className="text-sm font-medium text-white/60 mb-3">{t("order.detail.items")}</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm truncate">{item.product_name}</p>
                  <p className="text-white/30 text-xs">x{item.quantity} × ¥{item.unit_price_cny}</p>
                </div>
                <span className="text-white/70 text-sm ml-4">¥{item.subtotal_cny}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-white/60 text-sm">{t("checkout.total")}</span>
            <span className="text-gold font-bold">¥{order.total_cny}</span>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="card-glass p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-gold" />
              <h2 className="text-sm font-medium text-white/60">{t("order.detail.shippingAddress")}</h2>
            </div>
            <div className="text-sm text-white/70">
              <p>{order.recipient_name} {order.recipient_phone}</p>
              <p className="text-white/50 mt-1">
                {order.shipping_address.country === "中国"
                  ? `${order.shipping_address.province} ${order.shipping_address.city} ${order.shipping_address.district}`
                  : order.shipping_address.country
                }
                {" "}{order.shipping_address.address_line1}
                {order.shipping_address.address_line2 && ` ${order.shipping_address.address_line2}`}
              </p>
            </div>
          </div>
        )}

        {/* Tracking Info */}
        {tracking && (tracking.tracking_number || tracking.trajectory.length > 0) && (
          <div className="card-glass p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck size={14} className="text-gold" />
              <h2 className="text-sm font-medium text-white/60">{t("order.detail.tracking")}</h2>
            </div>
            {tracking.tracking_number && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white/40 text-xs">{tracking.shipping_carrier}:</span>
                <span className="text-white/70 text-xs font-mono">{tracking.tracking_number}</span>
                <a
                  href={`https://www.kuaidi100.com/?nu=${tracking.tracking_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold/60 hover:text-gold"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
            {tracking.trajectory.length > 0 ? (
              <div className="space-y-2">
                {tracking.trajectory.map((t, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="text-white/30 whitespace-nowrap">{t.time}</span>
                    <span className="text-white/60">{t.description}</span>
                  </div>
                ))}
              </div>
            ) : tracking.tracking_number ? (
              <p className="text-white/30 text-xs">{t("order.detail.trackingPending")}</p>
            ) : null}
          </div>
        )}

        {/* Order Info */}
        <div className="card-glass p-6 mb-4">
          <h2 className="text-sm font-medium text-white/60 mb-3">{t("order.detail.info")}</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/40">{t("order.detail.createTime")}</span>
              <span className="text-white/60">{new Date(order.created_at).toLocaleString("zh-CN")}</span>
            </div>
            {order.paid_at && (
              <div className="flex justify-between">
                <span className="text-white/40">{t("order.detail.payTime")}</span>
                <span className="text-white/60">{new Date(order.paid_at).toLocaleString("zh-CN")}</span>
              </div>
            )}
            {order.shipped_at && (
              <div className="flex justify-between">
                <span className="text-white/40">{t("order.detail.shipTime")}</span>
                <span className="text-white/60">{new Date(order.shipped_at).toLocaleString("zh-CN")}</span>
              </div>
            )}
            {order.payment_method && (
              <div className="flex justify-between">
                <span className="text-white/40">{t("order.detail.payMethod")}</span>
                <span className="text-white/60">{order.payment_method}</span>
              </div>
            )}
            {order.notes && (
              <div className="flex justify-between">
                <span className="text-white/40">{t("order.detail.notes")}</span>
                <span className="text-white/60">{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Refund Form */}
        {showRefundForm && (
          <div className="card-glass p-6 mb-4">
            <h3 className="text-sm font-medium text-orange-400 mb-3 flex items-center gap-2">
              <RotateCcw size={14} /> {t("order.detail.requestRefund")}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">{t("order.detail.refundReason.label")} *</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-orange-400/50"
                >
                  <option value="">{t("order.detail.refundReasonRequired")}</option>
                  <option value={t("order.detail.refundReason.notWant")}>{t("order.detail.refundReason.notWant")}</option>
                  <option value={t("order.detail.refundReason.quality")}>{t("order.detail.refundReason.quality")}</option>
                  <option value={t("order.detail.refundReason.wrongItem")}>{t("order.detail.refundReason.wrongItem")}</option>
                  <option value={t("order.detail.refundReason.other")}>{t("order.detail.refundReason.other")}</option>
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">{t("order.detail.refundDetail")}</label>
                <textarea
                  value={refundDetail}
                  onChange={(e) => setRefundDetail(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-orange-400/50 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowRefundForm(false); setRefundReason(""); setRefundDetail("") }}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/50 text-sm hover:border-white/25 transition-all"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleRefund}
                  disabled={actionLoading || !refundReason}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  {t("order.detail.refundSubmit")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {order.status === "pending" && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="flex-1 py-3 rounded-xl border border-white/15 text-white/50 text-sm hover:border-red-400/40 hover:text-red-400 transition-all flex items-center justify-center gap-2"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              {t("order.detail.cancel")}
            </button>
          )}
          {order.status === "shipped" && (
            <>
              <button
                onClick={handleConfirmReceive}
                disabled={actionLoading}
                className="flex-1 btn-gold py-3 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {t("order.detail.confirmReceive")}
              </button>
              {!showRefundForm && (
                <button
                  onClick={() => setShowRefundForm(true)}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-white/50 text-sm hover:border-orange-400/40 hover:text-orange-400 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} />
                  {t("order.detail.requestRefund")}
                </button>
              )}
            </>
          )}
          {order.status === "paid" && !showRefundForm && (
            <button
              onClick={() => setShowRefundForm(true)}
              disabled={actionLoading}
              className="flex-1 py-3 rounded-xl border border-white/15 text-white/50 text-sm hover:border-orange-400/40 hover:text-orange-400 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} />
              {t("order.detail.requestRefund")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
