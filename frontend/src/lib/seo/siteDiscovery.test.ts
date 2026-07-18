import assert from "node:assert/strict"
import test from "node:test"
import { createLlmsTxt } from "./siteDiscovery.ts"

test("lists canonical bilingual entry points in llms.txt", () => {
  const text = createLlmsTxt()

  assert.match(text, /https:\/\/www\.khanfate\.com\/en/)
  assert.match(text, /https:\/\/www\.khanfate\.com\/zh/)
  assert.match(text, /AI Search Reference: https:\/\/www\.khanfate\.com\/en\/ai-search/)
  assert.match(text, /Report formats: https:\/\/www\.khanfate\.com\/en\/pricing/)
  assert.doesNotMatch(text, /\/en\/reading\/new|\/checkout|\/account|\/payment/)
  assert.match(text, /Inner Atlas AI/i)
  assert.match(text, /not medical, legal, financial, or professional advice/i)
  assert.match(text, /does not promise or guarantee outcomes/i)
})
