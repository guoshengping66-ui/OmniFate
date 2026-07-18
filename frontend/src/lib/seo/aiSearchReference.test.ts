import assert from "node:assert/strict"
import test from "node:test"
import { AI_SEARCH_REFERENCE } from "@/data/seo/aiSearchReference"
import { createAiSearchReferenceJsonLd } from "./aiSearchReference.ts"

test("creates matching public-service, method, and FAQ schemas", () => {
  const schemas = createAiSearchReferenceJsonLd()

  assert.deepEqual(
    schemas.map((item) => item["@type"]),
    ["WebPage", "ItemList", "FAQPage", "Service", "Service", "Service", "Service", "Service"],
  )
  assert.equal(schemas[0]!["@id"], "https://www.khanfate.com/en/ai-search#webpage")
  assert.deepEqual(schemas[0]!.mainEntity, { "@id": "https://www.khanfate.com/en/ai-search#methods" })
  assert.equal(schemas[0]!.publisher.name, "Inner Atlas AI")
  assert.equal(schemas[2]!.mainEntity.length, AI_SEARCH_REFERENCE.faq.length)

  const services = schemas.slice(3) as Array<{
    url: string
    provider: { name: string }
    aggregateRating?: unknown
  }>
  assert.deepEqual(
    services.map((service) => service.url),
    AI_SEARCH_REFERENCE.services.map((service) => `https://www.khanfate.com${service.href}`),
  )
  assert.ok(services.every((service) => service.provider.name === "Inner Atlas AI"))
  assert.ok(services.every((service) => !Object.hasOwn(service, "aggregateRating")))
})

test("covers the public methods people use to explore charts and symbolic traditions", () => {
  const methodNames = AI_SEARCH_REFERENCE.methods.map((method) => method.name)
  const methodUrls = AI_SEARCH_REFERENCE.methods.map((method) => method.href)

  assert.deepEqual(methodNames, [
    "Bazi",
    "Western astrology",
    "Zi Wei Dou Shu",
    "Tarot",
    "Five Elements",
    "Face reading",
    "Palm reading",
  ])
  assert.ok(methodUrls.every((href) => href.startsWith("/en/")))
  assert.equal(new Set(methodUrls).size, methodUrls.length)
  assert.ok(AI_SEARCH_REFERENCE.faq.some((item) => /Zi Wei Dou Shu/.test(item.answer)))
  assert.ok(AI_SEARCH_REFERENCE.faq.some((item) => /direction-setting prompts/i.test(item.answer)))
})
