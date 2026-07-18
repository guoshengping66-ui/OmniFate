import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { fileURLToPath } from "node:url"

const publicCopySources = [
  "./en.json",
  "./zh.json",
  "./en.ts",
  "./zh.ts",
  "../lib/am16/questions.ts",
  "../lib/pricing.config.ts",
]

test("keeps legacy brand names and legacy domain out of public copy sources", () => {
  for (const source of publicCopySources) {
    const content = readFileSync(fileURLToPath(new URL(source, import.meta.url)), "utf8")
    assert.doesNotMatch(content, /Behavioral Mirror/i, source)
    assert.doesNotMatch(content, /AlphaMirror/i, source)
    assert.doesNotMatch(content, /Guanwo Fate/i, source)
    assert.doesNotMatch(content, /khanpattern\.com/i, source)
  }
})
