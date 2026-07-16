import assert from "node:assert/strict"
import test from "node:test"
import { AI_SEARCH_REFERENCE } from "@/data/seo/aiSearchReference"
import { createAiSearchReferenceJsonLd } from "./aiSearchReference.ts"

test("creates matching WebPage, ItemList, and FAQPage schemas", () => {
  const schemas = createAiSearchReferenceJsonLd()

  assert.deepEqual(schemas.map((item) => item["@type"]), ["WebPage", "ItemList", "FAQPage"])
  assert.equal(schemas[0]!.publisher.name, "Inner Atlas AI")
  assert.equal(schemas[2]!.mainEntity.length, AI_SEARCH_REFERENCE.faq.length)
})
