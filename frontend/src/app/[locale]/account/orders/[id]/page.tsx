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
  refunded: "text-orange-400",
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t, locale } = useLanguage()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
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
    if (!confirm(t("order.detail.refundConfirm"))) return
    setActionLoading(true)
    try {
      await requestRefund(id)
      toast.success(t("order.detail.refundSubmitted"))
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
        <Link href="/account" className="text-gold text-sm mt-2 hover:underline">{t("account.myOrders")}</Link>
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
              <button
                onClick={handleRefund}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl border border-white/15 text-white/50 text-sm hover:border-orange-400/40 hover:text-orange-400 transition-all flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                {t("order.detail.requestRefund")}
              </button>
            </>
          )}
          {order.status === "paid" && (
            <button
              onClick={handleRefund}
              disabled={actionLoading}
              className="flex-1 py-3 rounded-xl border border-white/15 text-white/50 text-sm hover:border-orange-400/40 hover:text-orange-400 transition-all flex items-center justify-center gap-2"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
              {t("order.detail.requestRefund")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
