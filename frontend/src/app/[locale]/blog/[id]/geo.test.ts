import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { ARTICLES } from "@/data/articles"
import { generateMetadata } from "./layout"

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8")
const articleId = ARTICLES[0]!.id

test("publishes the Inner Atlas AI article title from server metadata", async () => {
  const metadata = await generateMetadata({ params: Promise.resolve({ locale: "en", id: articleId }) })

  assert.match(String(metadata.title), /Inner Atlas AI/)
})

test("does not duplicate server SEO with client-side head mutations", () => {
  assert.doesNotMatch(pageSource, /document\.title|article-jsonld|document\.head\.appendChild/)
})
