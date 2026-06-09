import { type Region } from "@/contexts/RegionContext"
import type { Product } from "@/lib/api"

export function getProductPrice(product: Product, region: Region) {
  if (region === "overseas" && product.price_usd) {
    return { price: product.price_usd, symbol: "$", currency: "USD" as const }
  }
  return { price: product.price_cny, symbol: "¥", currency: "CNY" as const }
}

export function formatPrice(price: number, symbol: string) {
  return `${symbol}${price.toFixed(2)}`
}

// ── Coupon display helpers ─────────────────────────────────────────────────────
// Coupon balance is stored as CNY in the backend. For overseas display,
// we convert to USD using the fixed exchange rate.

export const CNY_TO_USD_RATE = 7.2 // 1 USD ≈ 7.2 CNY

/**
 * Format coupon balance for display based on region.
 * Domestic: ¥60.00
 * Overseas: $8.33 (60 / 7.2)
 */
export function formatCouponBalance(balanceCny: number, region: Region): string {
  if (region === "overseas") {
    const usd = balanceCny / CNY_TO_USD_RATE
    return `$${usd.toFixed(2)}`
  }
  return `¥${balanceCny.toFixed(2)}`
}
