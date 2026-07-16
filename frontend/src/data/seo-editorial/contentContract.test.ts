import test from "node:test"
import assert from "node:assert/strict"
import { SEO_EDITORIAL_ARTICLES } from "./index.ts"
import { validateEditorialArticles } from "./types.ts"

test("the English editorial cluster has complete, unique, linked content", () => {
  const ids = SEO_EDITORIAL_ARTICLES.map((article) => article.id)
  const issues = validateEditorialArticles(SEO_EDITORIAL_ARTICLES, new Set(ids))

  assert.equal(SEO_EDITORIAL_ARTICLES.length, 12)
  assert.deepEqual(issues, [])
})
