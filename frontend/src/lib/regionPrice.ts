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
