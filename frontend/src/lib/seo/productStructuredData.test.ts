import assert from "node:assert/strict"
import test from "node:test"
import { createProductJsonLd } from "./productStructuredData.ts"

test("uses visible product fields without fabricated ratings or availability", () => {
  const jsonLd = createProductJsonLd(
    {
      id: "p1",
      name: "Citrine Bowl",
      description: "Reflective object",
      short_pitch: "A focused lifestyle object",
      category: "crystal",
      price_cny: 399,
      price_usd: 59,
      image_url: "/products/citrine.webp",
    },
    "en",
    "https://www.khanfate.com/en/shop/p1",
  )

  assert.equal(jsonLd["@type"], "Product")
  assert.equal(jsonLd.offers?.price, "59")
  assert.equal(jsonLd.offers?.priceCurrency, "USD")
  assert.equal("aggregateRating" in jsonLd, false)
  assert.equal("availability" in (jsonLd.offers || {}), false)
})

test("uses the Chinese localized content when it is available", () => {
  const jsonLd = createProductJsonLd(
    {
      id: "p1",
      name: "黄水晶碗",
      name_en: "Citrine Bowl",
      description: "中文描述",
      description_en: "English description",
      short_pitch: "中文短句",
      category: "crystal",
      price_cny: 399,
    },
    "zh",
    "https://www.khanfate.com/zh/shop/p1",
  )

  assert.equal(jsonLd.name, "黄水晶碗")
  assert.equal(jsonLd.description, "中文描述")
  assert.equal(jsonLd.offers, undefined)
})
