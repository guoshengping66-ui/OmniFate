import assert from "node:assert/strict"
import test from "node:test"
import { generateMetadata } from "./layout"

test("keeps the AI reference indexable only in English", async () => {
  const en = await generateMetadata({ params: Promise.resolve({ locale: "en" }) })
  const zh = await generateMetadata({ params: Promise.resolve({ locale: "zh" }) })

  assert.equal(en.alternates?.canonical, "https://www.khanfate.com/en/ai-search")
  assert.deepEqual(zh.robots, { index: false, follow: true })
})
