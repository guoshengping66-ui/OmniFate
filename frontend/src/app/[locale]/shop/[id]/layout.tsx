import type { Metadata } from "next"
import type { Product } from "@/lib/api"
import { createProductMetadata } from "@/lib/seo/productMetadata"
import { createProductJsonLd } from "@/lib/seo/productStructuredData"
import { safeJsonLd } from "@/utils/safeJsonLd"

const PRODUCT_API_URL = "https://api.khanfate.com/api/products"

async function fetchProduct(productId: string, locale: "en" | "zh"): Promise<Product | null> {
  try {
    const response = await fetch(`${PRODUCT_API_URL}/${encodeURIComponent(productId)}?lang=${locale}`, {
      next: { revalidate: 300 },
    })
    if (!response.ok) return null
    return response.json() as Promise<Product>
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale: requestedLocale, id } = await params
  const locale = requestedLocale === "zh" ? "zh" : "en"
  const product = await fetchProduct(id, locale)

  return product ? createProductMetadata(product, locale) : {}
}

export default async function ProductDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale: requestedLocale, id } = await params
  const locale = requestedLocale === "zh" ? "zh" : "en"
  const product = await fetchProduct(id, locale)

  return (
    <>
      {product ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(createProductJsonLd(product, locale, `https://www.khanfate.com/${locale}/shop/${product.id}`)),
          }}
        />
      ) : null}
      {children}
    </>
  )
}
