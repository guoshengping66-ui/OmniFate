import assert from "node:assert/strict"
import test from "node:test"
import { AI_SEARCH_REFERENCE } from "./aiSearchReference.ts"

test("keeps AI-reference methods, links, and boundaries complete", () => {
  assert.deepEqual(
    AI_SEARCH_REFERENCE.methods.map((item) => item.id),
    ["bazi", "astrology", "tarot", "face-reading", "palm-reading"],
  )
  assert.ok(AI_SEARCH_REFERENCE.faq.length >= 3)
  assert.ok(AI_SEARCH_REFERENCE.links.every((item) => item.href.startsWith("/en/")))
  assert.deepEqual(
    AI_SEARCH_REFERENCE.services.map((service) => service.id),
    ["reflection", "guides", "methods", "reports", "faq"],
  )
  assert.ok(AI_SEARCH_REFERENCE.services.every((service) => service.href === "/en" || service.href.startsWith("/en/")))
  assert.ok(!AI_SEARCH_REFERENCE.services.some((service) => service.href === "/en/reading/new"))
  assert.ok(!AI_SEARCH_REFERENCE.links.some((link) => link.href === "/en/reading/new"))
  assert.match(
    AI_SEARCH_REFERENCE.limitations,
    /does not provide medical, legal, financial, or guaranteed predictive advice/i,
  )
})
