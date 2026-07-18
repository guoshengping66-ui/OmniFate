import assert from "node:assert/strict"
import test from "node:test"
import * as am16Layout from "./layout"

type LocaleMetadataFactory = (context: {
  params: Promise<{ locale: string }>
}) => Promise<{
  alternates?: {
    canonical?: string
    languages?: Record<string, string>
  }
  openGraph?: { url?: string }
}>

test("uses locale-specific canonical and language alternates for AM16", async () => {
  const generateMetadata = (am16Layout as unknown as {
    generateMetadata?: LocaleMetadataFactory
  }).generateMetadata

  assert.equal(typeof generateMetadata, "function")
  if (!generateMetadata) return

  const [english, chinese] = await Promise.all([
    generateMetadata({ params: Promise.resolve({ locale: "en" }) }),
    generateMetadata({ params: Promise.resolve({ locale: "zh" }) }),
  ])

  assert.equal(english.alternates?.canonical, "https://www.khanfate.com/en/am16")
  assert.equal(chinese.alternates?.canonical, "https://www.khanfate.com/zh/am16")
  assert.deepEqual(english.alternates?.languages, {
    en: "https://www.khanfate.com/en/am16",
    zh: "https://www.khanfate.com/zh/am16",
    "x-default": "https://www.khanfate.com/en/am16",
  })
  assert.equal(english.openGraph?.url, "https://www.khanfate.com/en/am16")
  assert.equal(chinese.openGraph?.url, "https://www.khanfate.com/zh/am16")
})
