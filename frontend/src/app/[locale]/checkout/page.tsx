"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, CheckCircle, Loader2, ArrowLeft, Ticket, Crown, CreditCard, MapPin } from "lucide-react"
import toast from "react-hot-toast"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { formatCouponBalance } from "@/lib/regionPrice"
import { createOrder, createShopStripeCheckout, type Address } from "@/lib/api"
import { AddressForm } from "@/components/shop/AddressForm"
import { ComplianceNotice } from "@/components/compliance/ComplianceNotice"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalCny, totalWithDiscount, isMember, clearCart, getItemPrice, symbol } = useCart()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const { t, localeHref, locale } = useLanguage()
  const { region } = useRegion()
  const isOverseas = region === "overseas"
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [useCoupon, setUseCoupon] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const isSubmitting = useRef(false)

  // Auth guard — redirect unauthenticated users to login instead of
  // letting them reach checkout (which would trigger a 401 cascade in
  // AddressForm → AuthContext → re-render storm → removeChild crash)
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(localeHref("/login"))
    }
  }, [user, authLoading, router, localeHref])

  const CNY_TO_USD = 7.2
  const couponBalanceCny = user?.shop_coupon_balance ?? 0
  const couponEligible = true
  const couponBalanceUsd = couponEligible ? couponBalanceCny / CNY_TO_USD : 0
  const couponDiscount = useCoupon ? Math.min(couponBalanceUsd, totalWithDiscount) : 0
  // Shipping: free for domestic, free worldwide over $79, otherwise $8
  const FREE_SHIPPING_THRESHOLD = 79
  const SHIPPING_FEE = 8
  const shippingFee = !isOverseas ? 0 : (totalWithDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE)
  const finalTotal = Math.max(0, totalWithDiscount - couponDiscount + shippingFee)
  const couponDisplay = formatCouponBalance(couponBalanceCny, region)
  const couponDiscountDisplay = formatCouponBalance(couponDiscount, region)

  const handleCheckout = async () => {
    if (isSubmitting.current) return
    if (!selectedAddress) {
      toast.error(t("checkout.selectAddress"))
      return
    }
    isSubmitting.current = true
    setLoading(true)
    try {
      const result = await createOrder({
        items: items.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price_cny: i.product.price_cny,
        })),
        total_cny: items.reduce((sum, i) => sum + i.product.price_cny * i.quantity, 0),
        region,
        use_coupon: couponEligible && useCoupon,
        address_id: selectedAddress.id,
        payment_method: "stripe",
      })
      const checkout = await createShopStripeCheckout(result.order_no, region)
      window.location.href = checkout.checkout_url
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t("checkout.orderFail"))
    } finally {
      setLoading(false)
      isSubmitting.current = false
    }
  }

  // Auth guard: show nothing while loading or redirecting to login
  if (authLoading || !user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center items-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (items.length === 0 && !done) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 text-center">
        <ShoppingBag size={48} className="text-white/10 mx-auto mb-4" />
        <p className="text-white/40">{t("checkout.empty")}</p>
        <button onClick={() => router.push(localeHref("/shop"))} className="text-gold text-sm mt-2 hover:underline">
          {t("checkout.goShop")}
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="card-glass p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="font-serif text-xl text-gold mb-2">{t("checkout.orderSuccessTitle")}</h2>
          <p className="text-white/50 text-sm mb-4">{t("checkout.thankYou")}</p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 text-left">
            <p className="text-white/60 text-xs mb-2">{t("checkout.nextSteps")}:</p>
            <ul className="text-white/40 text-xs space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">1.</span>
                {t("checkout.step1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">2.</span>
                {t("checkout.step2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">3.</span>
                {t("checkout.step3")}
              </li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push(localeHref("/account") + "?tab=orders")} className="btn-gold flex-1 text-sm">
              {t("checkout.viewOrders")}
            </button>
            <button onClick={() => router.push(localeHref("/shop"))} className="btn-gold flex-1 text-sm">
              {t("checkout.continueShop")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/40 hover:text-gold text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> {t("common.back")}
        </button>

        <h1 className="text-2xl font-serif font-bold text-gold mb-8">{t("checkout.title")}</h1>

        <ComplianceNotice className="mb-4" />

        {/* Order items */}
        <div className="card-glass p-6 mb-4 space-y-3">
          {items.map(item => (
            <div key={item.product.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                  🎁
                </div>
                <div>
                  <p className="text-white/80 text-sm">{locale === "en" ? (item.product.name_en || item.product.name) : item.product.name}</p>
                  <p className="text-white/30 text-xs">x{item.quantity}</p>
                </div>
              </div>
              <span className="text-white/70 text-sm">{symbol}{(getItemPrice(item.product) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Coupon section */}
        {couponEligible && couponBalanceCny > 0 && (
          <div className="card-glass p-4 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useCoupon}
                onChange={e => setUseCoupon(e.target.checked)}
                className="accent-gold w-4 h-4"
              />
              <Ticket size={18} className="text-gold" />
              <div className="flex-1">
                <span className="text-white/80 text-sm">{t("checkout.coupon")}</span>
                <span className="text-white/40 text-xs ml-2">
                  {t("checkout.couponBalance")} {couponDisplay}，{t("checkout.couponDeduct")} {formatCouponBalance(
                    couponDiscount || Math.min(couponBalanceLocal, totalWithDiscount),
                    region
                  )}
                </span>
              </div>
            </label>
          </div>
        )}

        {/* Totals */}
        <div className="card-glass p-6 mb-6 space-y-3">
          <div className="flex justify-between text-sm text-white/60">
            <span>{t("checkout.subtotal")}</span>
            <span>{symbol}{totalCny.toFixed(2)}</span>
          </div>
          {isMember && totalCny !== totalWithDiscount && (
            <div className="flex justify-between text-sm text-green-400/80">
              <span className="flex items-center gap-1"><Crown size={12} /> {t("checkout.memberDiscount")}</span>
              <span>-{symbol}{(totalCny - totalWithDiscount).toFixed(2)}</span>
            </div>
          )}
          {useCoupon && couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-gold/80">
              <span className="flex items-center gap-1"><Ticket size={12} /> {t("checkout.couponDeduction")}</span>
              <span>-{couponDiscountDisplay}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-white/60">
            <span>{t("checkout.shipping")}</span>
            {shippingFee > 0 ? (
              <span>{symbol}{shippingFee.toFixed(2)}</span>
            ) : (
              <span className="text-green-400">{t("checkout.free")}</span>
            )}
          </div>
          {isOverseas && shippingFee > 0 && (
            <p className="text-white/30 text-[11px] text-right -mt-1">
              {t("checkout.freeShippingHint")}
            </p>
          )}
          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="text-white/80 font-medium">{t("checkout.total")}</span>
            <span className="text-gold text-xl font-bold">{symbol}{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="card-glass p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-gold" />
            <span className="text-white/70 text-sm font-medium">{t("checkout.shippingAddress")}</span>
          </div>
          <AddressForm
            onSelect={setSelectedAddress}
            selectedId={selectedAddress?.id}
          />
        </div>

        {/* Stripe payment */}
        <div className="card-glass p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-gold" />
            <span className="text-white/70 text-sm font-medium">Stripe</span>
          </div>
          <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
            <p className="text-gold text-sm font-medium">Credit or debit card</p>
            <p className="text-white/40 text-xs mt-1">Secure checkout powered by Stripe.</p>
          </div>
        </div>

        {/* Processing time disclaimer */}
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-4">
          <p className="text-white/50 text-xs leading-relaxed">
            {t("checkout.processingNote")}
          </p>
        </div>

        {/* Terms acceptance — mandatory custom agreement */}
        <label className="flex items-start gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/40 shrink-0"
          />
          <div className="text-white/50 text-xs leading-relaxed">
            <p className="font-medium text-gold/80 mb-1.5">⚠️ {t("checkout.customAgreementTitle")}</p>
            <p className="mb-2">{t("checkout.customAgreementDesc")}</p>
            <ul className="space-y-1 mb-2 pl-0">
              <li className="flex items-start gap-1.5">
                <span className="text-gold shrink-0">•</span>
                <span><strong>{t("checkout.customAgreementWorkTime")}</strong>{t("checkout.customAgreementWorkTimeDesc")}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-gold shrink-0">•</span>
                <span><strong>{t("checkout.customAgreementRefund")}</strong>{t("checkout.customAgreementRefundDesc")}</span>
              </li>
            </ul>
            <p className="text-orange-400/80 font-medium">🛑 {t("checkout.customAgreementConfirm")}</p>
          </div>
        </label>

        {/* Trust / Disclaimer Banner */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 mb-4">
          <p className="text-white/30 text-[11px] leading-relaxed text-center">
            {t("checkout.trustNotice")}
          </p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading || !termsAccepted}
          className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> {t("checkout.processing")}</>
            : <><ShoppingBag size={16} /> {t("checkout.pay")} {symbol}{finalTotal.toFixed(2)}</>}
        </button>

        <p className="text-white/20 text-[11px] text-center mt-4">
          {t("checkout.mockNote")}
        </p>
      </div>

    </div>
  )
}
