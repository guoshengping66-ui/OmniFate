import assert from "node:assert/strict"
import test from "node:test"
import { createOrganizationJsonLd, createPublisherJsonLd, createWebApplicationJsonLd, createWebSiteJsonLd } from "./structuredData.ts"

test("does not invent organization claims", () => {
  const jsonLd = createOrganizationJsonLd()

  assert.equal(jsonLd["@type"], "Organization")
  assert.equal(jsonLd.url, "https://www.khanfate.com")
  assert.equal("aggregateRating" in jsonLd, false)
})

test("uses KhanFate as the one public organization identity", () => {
  assert.equal(createOrganizationJsonLd().name, "KhanFate")
  assert.equal(createPublisherJsonLd().name, "KhanFate")
  assert.equal(createWebApplicationJsonLd("en").author.name, "KhanFate")
})

test("uses a localized canonical URL for website schema", () => {
  const jsonLd = createWebSiteJsonLd("zh")

  assert.equal(jsonLd.url, "https://www.khanfate.com/zh")
  assert.equal(jsonLd.inLanguage, "zh-CN")
})
