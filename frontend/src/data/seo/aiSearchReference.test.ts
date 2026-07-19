import assert from "node:assert/strict"
import test from "node:test"
import { AI_SEARCH_REFERENCE } from "./aiSearchReference.ts"

test("keeps AI-reference methods, links, and boundaries complete", () => {
  assert.deepEqual(
    AI_SEARCH_REFERENCE.methods.map((item) => item.id),
    ["bazi", "astrology", "ziwei", "tarot", "five-elements", "face-reading", "palm-reading"],
  )
  assert.ok(AI_SEARCH_REFERENCE.faq.length >= 3)
  assert.ok(AI_SEARCH_REFERENCE.links.every((item) => item.href.startsWith("/en/")))
  assert.deepEqual(
    AI_SEARCH_REFERENCE.services.map((service) => service.id),
    ["reflection", "guides", "methods", "reports", "faq"],
  )
  assert.ok(AI_SEARCH_REFERENCE.services.every((service) => service.href === "/en" || service.href.startsWith("/en/")))
  assert.ok(!AI_SEARCH_REFERENCE.services.some((service) => service.href === "/en/reading/new"))
  assert.ok(AI_SEARCH_REFERENCE.links.every((link) => link.href !== ("/en/reading/new" as string)))
  assert.match(
    AI_SEARCH_REFERENCE.limitations,
    /does not provide medical, legal, financial, or guaranteed predictive advice/i,
  )
})

test("provides stable, public citation answers for core questions", () => {
  assert.deepEqual(
    AI_SEARCH_REFERENCE.citationAnswers.map((item) => item.id),
    ["what-is-bazi", "what-is-tarot", "what-are-five-elements", "how-to-use-khanfate", "what-is-ziwei", "what-is-astrology", "what-is-face-reading", "what-is-palm-reading"],
  )
  assert.equal(new Set(AI_SEARCH_REFERENCE.citationAnswers.map((item) => item.href)).size, 8)
  assert.ok(AI_SEARCH_REFERENCE.citationAnswers.every((item) => item.href.startsWith("/en/")))
  assert.ok(AI_SEARCH_REFERENCE.citationAnswers.every((item) => item.question.length > 15 && item.answer.length > 60))
  assert.match(
    AI_SEARCH_REFERENCE.citationAnswers.find((item) => item.id === "how-to-use-khanfate")!.answer,
    /not professional advice|does not replace qualified professional support/i,
  )
})
