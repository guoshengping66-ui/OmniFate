"use client"

import type { Product } from "@/lib/api"
import { createProductJsonLd } from "@/lib/seo/productStructuredData"
import { safeJsonLd } from "@/utils/safeJsonLd"

const SITE_URL = "https://www.khanfate.com"

export function ProductJsonLd({ product, locale }: { product: Product; locale: "en" | "zh" }) {
  const canonicalUrl = `${SITE_URL}/${locale}/shop/${product.id}`

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLd(createProductJsonLd(product, locale, canonicalUrl)),
      }}
    />
  )
}
