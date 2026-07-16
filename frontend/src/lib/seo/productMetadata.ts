import type { Metadata } from "next"
import type { Product } from "@/lib/api"

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

export function createProductMetadata(product: Product, locale: "en" | "zh"): Metadata {
  const localized = localizeProduct(product, locale)
  const canonical = `${SITE_URL}/${locale}/shop/${product.id}`
  const image = product.image_url
    ? product.image_url.startsWith("http")
      ? product.image_url
      : `${SITE_URL}${product.image_url}`
    : undefined

  return {
    title: `${localized.name} | Inner Atlas AI`,
    description: localized.description,
    openGraph: {
      title: `${localized.name} | Inner Atlas AI`,
      description: localized.description,
      url: canonical,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en/shop/${product.id}`,
        zh: `${SITE_URL}/zh/shop/${product.id}`,
        "x-default": `${SITE_URL}/en/shop/${product.id}`,
      },
    },
  }
}
