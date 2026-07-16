import type { Product } from "@/lib/api"

type ProductSchema = {
  "@context": "https://schema.org"
  "@type": "Product"
  name: string
  description: string
  url: string
  image?: string
  offers?: {
    "@type": "Offer"
    price: string
    priceCurrency: "USD"
    url: string
  }
}

const SITE_URL = "https://www.khanfate.com"

function localizeProduct(product: Product, locale: "en" | "zh") {
  if (locale === "en") {
    return {
      name: product.name_en || product.name,
      description: product.description_en || product.description,
    }
  }

  return { name: product.name, description: product.description }
}

function toAbsoluteUrl(value?: string): string | undefined {
  if (!value) return undefined
  return value.startsWith("http") ? value : `${SITE_URL}${value}`
}

export function createProductJsonLd(
  product: Product,
  locale: "en" | "zh",
  canonicalUrl: string,
): ProductSchema {
  const localized = localizeProduct(product, locale)
  const image = toAbsoluteUrl(product.image_url)

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localized.name,
    description: localized.description,
    url: canonicalUrl,
    ...(image ? { image } : {}),
    ...(product.price_usd === undefined
      ? {}
      : {
          offers: {
            "@type": "Offer" as const,
            price: String(product.price_usd),
            priceCurrency: "USD" as const,
            url: canonicalUrl,
          },
        }),
  }
}
