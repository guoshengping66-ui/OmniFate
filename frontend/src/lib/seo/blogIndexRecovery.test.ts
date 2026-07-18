import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { generateMetadata as generateArticleMetadata } from "@/app/[locale]/blog/[id]/layout"
import { generateMetadata as generateBlogMetadata } from "@/app/[locale]/blog/layout"
import BlogArticlePage from "@/app/[locale]/blog/[id]/page"

test("returns the Next.js 404 signal for an unknown article instead of indexable fallback metadata", async () => {
  await assert.rejects(
    generateArticleMetadata({ params: Promise.resolve({ locale: "en", id: "removed-article" }) }),
    (error: unknown) => (error as { digest?: string }).digest === "NEXT_HTTP_ERROR_FALLBACK;404",
  )
})

test("stops rendering the article route before the client page for an unknown ID", async () => {
  await assert.rejects(
    BlogArticlePage({ params: Promise.resolve({ locale: "en", id: "removed-article" }) }),
    (error: unknown) => (error as { digest?: string }).digest === "NEXT_HTTP_ERROR_FALLBACK;404",
  )
})

test("uses topic-focused English metadata for the public blog collection", async () => {
  const metadata = await generateBlogMetadata({ params: Promise.resolve({ locale: "en" }) })

  assert.match(String(metadata.title), /Bazi, Astrology & Tarot Guides/)
  assert.match(String(metadata.description), /Bazi, astrology, Tarot, and cultural guides/i)
  assert.doesNotMatch(String(metadata.title), /Destiny Knowledge/i)
})

test("uses the article-specific social image in Open Graph and Twitter metadata", async () => {
  const metadata = await generateArticleMetadata({ params: Promise.resolve({ locale: "en", id: "what-is-bazi" }) })
  const expectedImage = "https://www.khanfate.com/en/blog/what-is-bazi/opengraph-image"

  assert.deepEqual(metadata.openGraph?.images, [{
    url: expectedImage,
    width: 1200,
    height: 630,
    alt: "What Is Bazi? A Beginner’s Guide to the Four Pillars of Destiny",
  }])
  assert.deepEqual(metadata.twitter, {
    card: "summary_large_image",
    title: "What Is Bazi? A Beginner’s Guide to the Four Pillars of Destiny",
    description: "Learn what Bazi is, how the Four Pillars are organized, and how to approach this Chinese metaphysical tradition as a tool for reflection.",
    images: [expectedImage],
  })
})

test("keeps blog article navigation on the active locale", () => {
  const source = readFileSync(new URL("../../app/[locale]/blog/[id]/BlogArticleClient.tsx", import.meta.url), "utf8")

  assert.match(source, /href=\{`\/\$\{locale\}\/blog`\}/)
  assert.match(source, /href=\{`\/\$\{locale\}\/blog\/\$\{rel\.id\}`\}/)
  assert.doesNotMatch(source, /href="\/blog"/)
  assert.doesNotMatch(source, /href=\{`\/blog\/\$\{rel\.id\}`\}/)
})

test("renders a guarded image endpoint for each public blog article", () => {
  const source = readFileSync(new URL("../../app/[locale]/blog/[id]/opengraph-image.tsx", import.meta.url), "utf8")

  assert.match(source, /new ImageResponse/)
  assert.match(source, /if \(!article \|\| !isArticleAvailable\(article, locale as "en" \| "zh"\)\) notFound\(\)/)
  assert.match(source, /width: 1200, height: 630/)
})
