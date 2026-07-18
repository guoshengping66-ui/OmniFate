import assert from "node:assert/strict"
import test from "node:test"
import { generateMetadata } from "./layout"

test("uses localized canonical and language alternates for the knowledge hub", async () => {
  const [english, chinese] = await Promise.all([
    generateMetadata({ params: Promise.resolve({ locale: "en" }) }),
    generateMetadata({ params: Promise.resolve({ locale: "zh" }) }),
  ])

  assert.equal(english.alternates?.canonical, "https://www.khanfate.com/en/knowledge")
  assert.equal(chinese.alternates?.canonical, "https://www.khanfate.com/zh/knowledge")
  assert.deepEqual(english.alternates?.languages, {
    en: "https://www.khanfate.com/en/knowledge",
    zh: "https://www.khanfate.com/zh/knowledge",
    "x-default": "https://www.khanfate.com/en/knowledge",
  })
  assert.equal(english.openGraph?.url, "https://www.khanfate.com/en/knowledge")
  assert.equal(chinese.openGraph?.url, "https://www.khanfate.com/zh/knowledge")
})
