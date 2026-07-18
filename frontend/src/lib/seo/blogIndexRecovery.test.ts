import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { generateMetadata as generateArticleMetadata } from "@/app/[locale]/blog/[id]/layout"
import { generateMetadata as generateBlogMetadata } from "@/app/[locale]/blog/layout"

test("returns the Next.js 404 signal for an unknown article instead of indexable fallback metadata", async () => {
  await assert.rejects(
    generateArticleMetadata({ params: Promise.resolve({ locale: "en", id: "removed-article" }) }),
    (error: unknown) => (error as { digest?: string }).digest === "NEXT_HTTP_ERROR_FALLBACK;404",
  )
})

test("uses topic-focused English metadata for the public blog collection", async () => {
  const metadata = await generateBlogMetadata({ params: Promise.resolve({ locale: "en" }) })

  assert.match(String(metadata.title), /Bazi, Astrology & Tarot Guides/)
  assert.match(String(metadata.description), /Bazi, astrology, Tarot, and cultural guides/i)
  assert.doesNotMatch(String(metadata.title), /Destiny Knowledge/i)
})

test("keeps blog article navigation on the active locale", () => {
  const source = readFileSync(new URL("../../app/[locale]/blog/[id]/page.tsx", import.meta.url), "utf8")

  assert.match(source, /href=\{`\/\$\{locale\}\/blog`\}/)
  assert.match(source, /href=\{`\/\$\{locale\}\/blog\/\$\{rel\.id\}`\}/)
  assert.doesNotMatch(source, /href="\/blog"/)
  assert.doesNotMatch(source, /href=\{`\/blog\/\$\{rel\.id\}`\}/)
})
