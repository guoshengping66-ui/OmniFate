import assert from "node:assert/strict"
import test from "node:test"
import { createArticleJsonLd, createFaqJsonLd, getArticleLocales, getArticleSocialImageUrl, isArticleAvailable } from "./editorialArticle.ts"

test("creates a stable canonical social image URL for each article locale", () => {
  assert.equal(
    getArticleSocialImageUrl("en", "what-is-bazi"),
    "https://www.khanfate.com/en/blog/what-is-bazi/social-image",
  )
})

test("keeps English-only editorial articles out of Chinese SEO routes", () => {
  const article = { id: "what-is-bazi", targetLocales: ["en"] as const }
  assert.deepEqual(getArticleLocales(article), ["en"])
  assert.equal(isArticleAvailable(article, "en"), true)
  assert.equal(isArticleAvailable(article, "zh"), false)
})

test("creates truthful article and FAQ structured data", () => {
  const article = {
    id: "what-is-bazi",
    title_en: "What Is Bazi? A Beginner’s Guide to the Four Pillars of Destiny",
    summary_en: "A clear introduction to Bazi as a cultural and reflective framework for beginners.",
    tags_en: ["Bazi"],
    created_at: "2026-07-17",
  }
  const schema = createArticleJsonLd(article, "en")
  const faq = createFaqJsonLd([{ question: "What is Bazi?", answer: "A traditional chart framework." }])
  assert.equal(schema["@type"], "Article")
  assert.equal(schema.url, "https://www.khanfate.com/en/blog/what-is-bazi")
  assert.equal(schema.image, "https://www.khanfate.com/en/blog/what-is-bazi/social-image")
  assert.equal(faq?.["@type"], "FAQPage")
})
