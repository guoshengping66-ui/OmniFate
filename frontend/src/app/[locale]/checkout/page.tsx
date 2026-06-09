"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, CheckCircle, Loader2, ArrowLeft, Ticket, Crown, CreditCard, MapPin } from "lucide-react"
import toast from "react-hot-toast"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice, formatCouponBalance } from "@/lib/regionPrice"
import { createOrder, type Address } from "@/lib/api"
import { PaymentMethodSelector } from "@/components/monetization/PaymentMethodSelector"
import { AddressForm } from "@/components/shop/AddressForm"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalCny, totalWithDiscount, isMember, clearCart, getItemPrice, symbol } = useCart()
  const { user, refreshUser } = useAuth()
  const { t, localeHref } = useLanguage()
  const { region } = useRegion()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [useCoupon, setUseCoupon] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  const couponBalance = user?.shop_coupon_balance ?? 0
  const couponDiscount = useCoupon ? Math.min(couponBalance, totalWithDiscount) : 0
  const finalTotal = Math.max(0, totalWithDiscount - couponDiscount)
  // Display amounts in local currency (convert from CNY for overseas)
  const couponDisplay = formatCouponBalance(couponBalance, region)
  const couponDiscountDisplay = formatCouponBalance(couponDiscount, region)

  const handleCheckout = async () => {
    if (!user) {
      toast.error(t("checkout.loginFirst"))
      router.push(localeHref("/login"))
      return
    }
    if (!selectedAddress) {
      toast.error(t("checkout.selectAddress"))
      return
    }
    setLoading(true)
    try {
      const result = await createOrder({
        items: items.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price_cny: i.product.price_cny,
        })),
        total_cny: totalWithDiscount,
        use_coupon: useCoupon,
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
      })
      toast.success(
        result.coupon_used > 0
          ? t("checkout.successCoupon").replace("{amount}", String(result.coupon_used)).replace("{paid}", String(result.final_total))
          : t("checkout.successMock")
      )
      clearCart()
      refreshUser()
      setDone(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t("checkout.orderFail"))
    } finally {
      setLoading(false)
    }
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
          <p className="text-white/50 text-sm mb-4">
            {couponDiscount > 0
              ? t("checkout.couponApplied").replace("{amount}", couponDiscountDisplay)
              : t("checkout.thankYou")}
          </p>
          {couponDiscount > 0 && (
            <p className="text-white/30 text-xs mb-4">
              {t("coupon.remaining")}: {formatCouponBalance(Math.max(0, couponBalance - couponDiscount), region)}
            </p>
          )}
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
            <button onClick={() => router.push(localeHref("/account/orders"))} className="btn-gold flex-1 text-sm">
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

        {/* Order items */}
        <div className="card-glass p-6 mb-4 space-y-3">
          {items.map(item => (
            <div key={item.product.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                  🎁
                </div>
                <div>
                  <p className="text-white/80 text-sm">{item.product.name}</p>
                  <p className="text-white/30 text-xs">x{item.quantity}</p>
                </div>
              </div>
              <span className="text-white/70 text-sm">{symbol}{(getItemPrice(item.product) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Coupon section */}
        {couponBalance > 0 && (
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
                  {t("checkout.couponBalance")} {couponDisplay}，{t("checkout.couponDeduct")} {formatCouponBalance(couponDiscount || Math.min(couponBalance, totalWithDiscount), region)}
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
            <span className="text-green-400">{t("checkout.free")}</span>
          </div>
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

        {/* Payment Method Selector */}
        <div className="card-glass p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-gold" />
            <span className="text-white/70 text-sm font-medium">{t("checkout.selectPayment")}</span>
          </div>
          <PaymentMethodSelector
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />
        </div>

        {/* Terms acceptance */}
        <label className="flex items-start gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/40"
          />
          <span className="text-white/50 text-xs leading-relaxed">
            {t("checkout.terms")}
            <a href={localeHref("/terms")} target="_blank" className="text-gold hover:underline">{t("checkout.termsOfService")}</a>
            {t("checkout.and")}
            <a href={localeHref("/refund")} target="_blank" className="text-gold hover:underline">{t("checkout.refundPolicy")}</a>
          </span>
        </label>
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
