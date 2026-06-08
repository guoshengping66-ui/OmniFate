"use client"
import { useState } from "react"
import { ShoppingBag, CheckCircle, Sparkles } from "lucide-react"
import type { Product } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice } from "@/lib/regionPrice"

interface PrescriptionCardProps {
  product: Product
  /** 主推 vs 次要（控制视觉权重） */
  variant?: "primary" | "secondary"
}

export function PrescriptionCard({ product, variant = "primary" }: PrescriptionCardProps) {
  const { addItem } = useCart()
  const { t } = useLanguage()
  const { region } = useRegion()
  const [claimed, setClaimed] = useState(false)

  const handleClaim = () => {
    addItem(product, 1)
    setClaimed(true)
    setTimeout(() => setClaimed(false), 2000)
  }

  const isPrimary = variant === "primary"

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all duration-500"
      style={{
        background: "linear-gradient(135deg, #1e1a14 0%, #2a2418 40%, #1f1b13 100%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: isPrimary
            ? "radial-gradient(ellipse at top right, rgba(201,168,76,0.12) 0%, transparent 65%)"
            : "radial-gradient(ellipse at top right, rgba(201,168,76,0.06) 0%, transparent 65%)",
        }}
      />

      {/* Animated border for primary */}
      {isPrimary && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            padding: "1px",
            background:
              "conic-gradient(from var(--angle,0deg), transparent 30%, rgba(201,168,76,0.5) 50%, transparent 70%)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            animation: "prescription-spin 5s linear infinite",
          }}
        />
      )}

      <div className="relative p-5 md:p-6">
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚕</span>
          <h4 className="font-serif text-base md:text-lg font-bold text-gold tracking-wide">
            {t("prescription.title")}
          </h4>
          {isPrimary && (
            <span className="ml-auto text-[10px] px-2 py-0.5 bg-gold/15 border border-gold/25 rounded-full text-gold/70 animate-pulse">
              {t("prescription.primary")}
            </span>
          )}
        </div>

        {/* ── Prescription left border ───────────── */}
        <div className="border-l-4 border-l-gold/50 pl-4 py-1">
          {/* Product name as "方名" */}
          <p className="font-serif text-lg md:text-xl font-bold text-gold leading-snug mb-1">
            {product.name}
          </p>

          {/* Price as "剂量" */}
          <p className="text-xs text-white/40 mb-3">
            {t("prescription.dosage")}
            <span className="text-gold/80 font-semibold ml-1">{getProductPrice(product, region).symbol}{getProductPrice(product, region).price}</span>
          </p>

          {/* Match reasons as "适应症" */}
          {product.match_reasons && product.match_reasons.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] text-white/30 mb-1.5 uppercase tracking-wider">{t("prescription.indication")}</p>
              <ul className="space-y-1">
                {product.match_reasons.slice(0, 3).map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-white/55">
                    <span className="text-gold/60 mt-0.5 flex-shrink-0">✦</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* LLM recommendation text */}
          {product.recommendation_text && (
            <blockquote className="border-l-2 border-gold/20 pl-3 my-3 text-xs text-white/45 italic leading-relaxed">
              {product.recommendation_text}
            </blockquote>
          )}

          {/* Short pitch fallback */}
          {!product.recommendation_text && product.short_pitch && (
            <p className="text-xs text-white/40 leading-relaxed mb-3">
              {product.short_pitch}
            </p>
          )}
        </div>

        {/* ── Match score badge ───────────────────── */}
        {product.match_score && product.match_score > 0 && (
          <div className="flex items-center gap-1.5 mt-3 mb-3">
            <Sparkles size={12} className="text-gold/60" />
            <span className="text-[11px] text-gold/50">
              {t("prescription.matchScore")} {product.match_score.toFixed(1)}
            </span>
          </div>
        )}

        {/* ── Claim CTA ───────────────────────────── */}
        <button
          onClick={handleClaim}
          disabled={claimed}
          className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2
            ${claimed
              ? "bg-green-500/20 border border-green-500/40 text-green-400"
              : isPrimary
                ? "btn-gold"
                : "border border-gold/30 text-gold hover:bg-gold/10"
            }`}
        >
          {claimed ? (
            <>
              <CheckCircle size={15} />
              {t("prescription.claimed")}
            </>
          ) : (
            <>
              <ShoppingBag size={15} />
              {t("prescription.claimBtn")}
            </>
          )}
        </button>

        {/* ── Footer note ─────────────────────────── */}
        <p className="text-[10px] text-white/20 text-center mt-2">
          {t("prescription.footer")}
        </p>
      </div>

      {/* Keyframes for border animation */}
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes prescription-spin {
          to { --angle: 360deg; }
        }
      `}</style>
    </div>
  )
}
