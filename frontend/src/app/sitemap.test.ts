import assert from "node:assert/strict"
import test from "node:test"
import sitemap from "./sitemap"

test("lists the AI reference only at its English canonical URL", () => {
  const urls = sitemap().map((entry) => entry.url)

  assert.ok(urls.includes("https://www.khanfate.com/en/ai-search"))
  assert.ok(!urls.includes("https://www.khanfate.com/zh/ai-search"))
})
