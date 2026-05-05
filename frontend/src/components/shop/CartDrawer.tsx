"use client"
import { X, ShoppingBag, Minus, Plus, Trash2, Crown } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRouter } from "next/navigation"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalCny, totalWithDiscount, itemCount, isMember } = useCart()
  const { t } = useLanguage()
  const router = useRouter()

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-ink border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-gold" />
            <h2 className="font-serif text-lg text-gold">{t("cart.title")}</h2>
            {itemCount > 0 && (
              <span className="text-xs text-white/40">({itemCount} {t("cart.items")})</span>
            )}
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-sm">{t("cart.empty")}</p>
              <button onClick={() => { onClose(); router.push("/shop") }}
                className="text-gold text-sm mt-2 hover:underline">
                {t("cart.goShop")}
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="flex gap-3 card-glass p-3">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center text-white/20 text-2xl">
                  🎁
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-gold text-sm">¥{item.product.price_cny}</p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-white/80 text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-auto text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-4 space-y-3">
            {/* Member discount notice */}
            {isMember && totalCny !== totalWithDiscount && (
              <div className="flex items-center gap-1.5 text-xs text-green-400/80">
                <Crown size={12} />
                <span>{t("cart.memberDiscount").replace("{amount}", (totalCny - totalWithDiscount).toFixed(2))}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">{t("cart.total")}</span>
              <div className="text-right">
                {isMember && totalCny !== totalWithDiscount && (
                  <span className="text-white/30 text-xs line-through mr-1">¥{totalCny.toFixed(2)}</span>
                )}
                <span className="text-gold text-xl font-bold">¥{totalWithDiscount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => { onClose(); router.push("/checkout") }}
              className="btn-gold w-full py-3"
            >
              {t("cart.checkout")}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
