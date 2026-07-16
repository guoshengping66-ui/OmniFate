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
  assert.match(
    AI_SEARCH_REFERENCE.limitations,
    /does not provide medical, legal, financial, or guaranteed predictive advice/i,
  )
})
