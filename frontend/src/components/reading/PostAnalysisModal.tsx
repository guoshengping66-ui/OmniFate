"use client"
import { useState, useEffect, useCallback } from "react"
import { X, ShoppingBag, Sparkles, ArrowRight, Check } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { ProductImage } from "@/components/shop/ProductImage"
import type { Product } from "@/lib/api"

interface PostAnalysisModalProps {
  products: Product[]
  onViewPrescription?: () => void
}

/**
 * PostAnalysisModal — Appears automatically after analysis completes.
 * Shows top 3 recommended products with a prompt to view the full prescription.
 * Auto-dismisses after 6 seconds to avoid blocking the user.
 */
export function PostAnalysisModal({ products, onViewPrescription }: PostAnalysisModalProps) {
  const { t } = useLanguage()
  const { addItem } = useCart()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (products.length === 0 || dismissed) return
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [products, dismissed])

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      setVisible(false)
      setDismissed(true)
    }, 6000)
    return () => clearTimeout(timer)
  }, [visible])

  const dismiss = useCallback(() => {
    setVisible(false)
    setDismissed(true)
  }, [])

  const handleAdd = useCallback((product: Product) => {
    addItem(product)
    setAddedIds(prev => new Set(prev).add(product.id))
    setTimeout(() => setAddedIds(prev => {
      const next = new Set(prev)
      next.delete(product.id)
      return next
    }), 2000)
  }, [addItem])

  if (products.length === 0 || dismissed) return null

  const displayProducts = products.slice(0, 3)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
        onClick={dismiss}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}
      >
        <div
          className="relative max-w-sm w-full pointer-events-auto"
          style={{
            transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
            transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Animated border glow */}
          <div
            className="absolute -inset-[1px] rounded-2xl pointer-events-none"
            style={{
              background: "conic-gradient(from var(--modal-angle,0deg), transparent 30%, rgba(201,168,76,0.5) 50%, transparent 70%)",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
              animation: "modal-border-spin 4s linear infinite",
            }}
          />

          <div className="relative bg-gradient-to-br from-[#1a1430] via-[#1e1835] to-[#140f24] rounded-2xl p-5 overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gold/10 blur-[60px]" />
            </div>

            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all z-10"
            >
              <X size={12} />
            </button>

            {/* Header */}
            <div className="relative flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                <Sparkles size={18} className="text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-gold">
                  {t("prescription.modal.title") || "你的改运处方已生成"}
                </h3>
                <p className="text-white/30 text-[11px]">
                  {t("prescription.modal.subtitle") || "AI 根据你的命盘精准匹配"}
                </p>
              </div>
            </div>

            {/* Product list */}
            <div className="relative space-y-2.5 mb-4">
              {displayProducts.map(product => {
                const isAdded = addedIds.has(product.id)
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] transition-all"
                  >
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      category={product.category}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-xs font-medium truncate">{product.name}</p>
                      <p className="text-gold text-xs font-bold">¥{product.price_cny.toFixed(0)}</p>
                    </div>
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={isAdded}
                      className={`flex-shrink-0 flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full transition-all ${
                        isAdded
                          ? "bg-green-500/20 border border-green-500/40 text-green-400"
                          : "bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25"
                      }`}
                    >
                      {isAdded ? (
                        <><Check size={10} /></>
                      ) : (
                        <><ShoppingBag size={10} /></>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                dismiss()
                onViewPrescription?.()
              }}
              className="relative w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold/15 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/25 transition-all group"
            >
              {t("prescription.modal.cta") || "查看完整处方"}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Auto-close indicator */}
            <div className="mt-2 flex justify-center">
              <div className="w-16 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold/40 rounded-full"
                  style={{
                    animation: "modal-progress 6s linear forwards",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Keyframes */}
          <style jsx>{`
            @property --modal-angle {
              syntax: "<angle>";
              initial-value: 0deg;
              inherits: false;
            }
            @keyframes modal-border-spin {
              to { --modal-angle: 360deg; }
            }
            @keyframes modal-progress {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      </div>
    </>
  )
}
