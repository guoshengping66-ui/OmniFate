import assert from "node:assert/strict"
import test from "node:test"
import { createProductMetadata } from "./productMetadata.ts"

test("gives each product detail page its own localized canonical URL", () => {
  const metadata = createProductMetadata(
    {
      id: "p1",
      name: "黄水晶碗",
      name_en: "Citrine Bowl",
      description: "中文描述",
      description_en: "English description",
      short_pitch: "中文短句",
      short_pitch_en: "English pitch",
      category: "crystal",
      price_cny: 399,
    },
    "en",
  )

  assert.equal(metadata.alternates?.canonical, "https://www.khanfate.com/en/shop/p1")
  assert.equal(metadata.title, "Citrine Bowl | Inner Atlas AI")
  assert.equal(metadata.description, "English description")
})
