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

test("states the supported public topic coverage for AI discovery", () => {
  const text = createLlmsTxt()

  assert.match(text, /birth-chart symbols/i)
  assert.match(text, /Western astrology/i)
  assert.match(text, /BaZi/i)
  assert.match(text, /Zi Wei Dou Shu/i)
  assert.match(text, /Tarot/i)
  assert.match(text, /Five Elements/i)
  assert.match(text, /face reading/i)
  assert.match(text, /palm reading/i)
  assert.match(text, /reflective direction-setting/i)
})
