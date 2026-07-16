import assert from "node:assert/strict"
import test from "node:test"
import { createLlmsTxt } from "./siteDiscovery.ts"

test("lists canonical bilingual entry points in llms.txt", () => {
  const text = createLlmsTxt()

  assert.match(text, /https:\/\/www\.khanfate\.com\/en/)
  assert.match(text, /https:\/\/www\.khanfate\.com\/zh/)
  assert.match(text, /not medical, legal, financial, or professional advice/i)
})
