# English SEO Editorial Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish twelve high-quality English editorial pages with honest conversion paths and crawler-visible SEO metadata.

**Architecture:** New SEO articles live in focused data modules and are combined with the existing blog catalog through its current `ARTICLES` export. The article route retains its interactive client UI, while the server layout emits Article and FAQPage JSON-LD from trusted static data. Content-specific internal links and CTAs are rendered from article metadata rather than inferred from keywords.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, static TypeScript content data, Node built-in test runner.

## Global Constraints

- Write English educational and self-reflection content only; no guaranteed predictions or medical, legal, financial, or professional advice.
- Use real, visible product fields only; do not invent ratings, availability, benefits, authorship, testimonials, or statistics.
- Every new article must have a report CTA, exactly two or three internal links, and a concise FAQ.
- Shop CTAs are optional and only appear on relevant Five Elements, Tarot, face-reading, or palm-reading articles.
- Preserve `Article` consumers in `src/app/[locale]/blog`, `src/app/[locale]/blog/[id]`, and `src/app/sitemap.ts`.
- All JSON-LD must be server-rendered with `safeJsonLd` and use canonical `https://www.khanfate.com` URLs.

---

### Task 1: Add editorial types and an executable content contract

**Files:**
- Create: `frontend/src/data/seo-editorial/types.ts`
- Create: `frontend/src/data/seo-editorial/contentContract.test.ts`
- Modify: `frontend/src/data/articles.ts`

**Interfaces:**
- Produces `EditorialArticle`, extending the existing `Article` shape with `faq`, `relatedIds`, and optional `shopCta`.
- Produces `validateEditorialArticles(articles, allArticleIds)` for tests and later article modules.
- `ARTICLES` remains `Article[]`; an article is compatible when it has the existing title, summary, category, tags, read time, cover, date, and bilingual content fields.

- [ ] **Step 1: Write the failing contract test**

```ts
import test from "node:test"
import assert from "node:assert/strict"
import { SEO_EDITORIAL_ARTICLES } from "./index"
import { validateEditorialArticles } from "./types"

test("the English editorial cluster has complete, unique, linked content", () => {
  const ids = SEO_EDITORIAL_ARTICLES.map((article) => article.id)
  const issues = validateEditorialArticles(SEO_EDITORIAL_ARTICLES, new Set(ids))

  assert.equal(SEO_EDITORIAL_ARTICLES.length, 12)
  assert.deepEqual(issues, [])
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend; node --experimental-strip-types --test src/data/seo-editorial/contentContract.test.ts`

Expected: module-not-found failure because the editorial module does not exist.

- [ ] **Step 3: Implement the types and validation**

```ts
import type { Article } from "@/data/articles"

export type EditorialFaq = { question: string; answer: string }
export type EditorialLink = { id: string; label: string }
export type ShopCta = { href: string; label: string; reason: string }

export type EditorialArticle = Article & {
  faq: EditorialFaq[]
  relatedIds: string[]
  shopCta?: ShopCta
}

export function validateEditorialArticles(
  articles: EditorialArticle[],
  allArticleIds: Set<string>,
): string[] {
  const issues: string[] = []
  const ids = new Set<string>()
  for (const article of articles) {
    if (ids.has(article.id)) issues.push(`duplicate id: ${article.id}`)
    ids.add(article.id)
    if (article.title_en.length < 35 || article.title_en.length > 90) issues.push(`title length: ${article.id}`)
    if (article.summary_en.length < 110 || article.summary_en.length > 180) issues.push(`summary length: ${article.id}`)
    if (article.content_en.length < 3200) issues.push(`thin content: ${article.id}`)
    if (article.faq.length < 2 || article.faq.length > 4) issues.push(`faq count: ${article.id}`)
    if (article.relatedIds.length < 2 || article.relatedIds.length > 3) issues.push(`related count: ${article.id}`)
    if (article.relatedIds.some((id) => id === article.id || !allArticleIds.has(id))) issues.push(`invalid related id: ${article.id}`)
    if (!article.content_en.includes("##")) issues.push(`missing sections: ${article.id}`)
    if (!article.content_en.includes("/reading/new")) issues.push(`missing report CTA: ${article.id}`)
  }
  return issues
}
```

- [ ] **Step 4: Export a combined article catalog without changing callers**

```ts
import { SEO_EDITORIAL_ARTICLES } from "./seo-editorial"

export const ARTICLES: Article[] = [
  // existing catalog entries
  ...SEO_EDITORIAL_ARTICLES,
]
```

Keep the existing interface declaration and all current entries intact. Place the import at the top and the spread immediately before the final array close.

- [ ] **Step 5: Re-run the focused test**

Run: `cd frontend; node --experimental-strip-types --test src/data/seo-editorial/contentContract.test.ts`

Expected: the test fails only until Task 2 exports the twelve entries; do not weaken the contract.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/data/articles.ts frontend/src/data/seo-editorial/types.ts frontend/src/data/seo-editorial/contentContract.test.ts
git commit -m "feat: add SEO editorial content contract"
```

### Task 2: Write the twelve English cluster articles in focused modules

**Files:**
- Create: `frontend/src/data/seo-editorial/bazi-and-elements.ts`
- Create: `frontend/src/data/seo-editorial/astrology-and-metaphysics.ts`
- Create: `frontend/src/data/seo-editorial/tarot-and-body-reading.ts`
- Create: `frontend/src/data/seo-editorial/index.ts`
- Test: `frontend/src/data/seo-editorial/contentContract.test.ts`

**Interfaces:**
- Consumes `EditorialArticle` from `types.ts`.
- Produces `SEO_EDITORIAL_ARTICLES: EditorialArticle[]` from `index.ts`.
- Each article uses `category` values already accepted by the blog UI: `four-pillar`, `wuxing`, `chart analysis`, `symbol`, or `face`.

- [ ] **Step 1: Create the Bazi and Five Elements module**

Use four complete entries with IDs `what-is-bazi`, `read-bazi-chart`, `five-elements-chinese-astrology`, and `missing-element-bazi`. Each body must be 3,200–5,500 English characters, use at least four `##` sections, name one common misconception, include a short reflection exercise, and end with this visible report link:

```md
## Explore your own chart thoughtfully

If you would like a structured starting point, [generate a personal AI report](/reading/new). Treat the result as a prompt for reflection, not a fixed prediction.
```

Use `relatedIds` to create this ring: `what-is-bazi → read-bazi-chart, five-elements-chinese-astrology`; `read-bazi-chart → what-is-bazi, missing-element-bazi`; `five-elements-chinese-astrology → missing-element-bazi, what-is-bazi`; `missing-element-bazi → five-elements-chinese-astrology, read-bazi-chart`.

- [ ] **Step 2: Create the astrology and Chinese metaphysics module**

Use four complete entries with IDs `birth-chart-self-reflection`, `bazi-vs-western-astrology`, `chinese-metaphysics-beginners`, and `iching-bazi-fengshui`. Explain that systems are interpretive frameworks, distinguish symbolic reflection from fact claims, include two FAQ pairs per entry, and use links between these four articles plus `what-is-bazi` where relevant.

- [ ] **Step 3: Create the Tarot and body-reading module**

Use four complete entries with IDs `tarot-self-reflection-guide`, `tarot-card-meanings-beginners`, `face-reading-cultural-tradition`, and `palm-reading-beginners`. Include a clear cultural/reflective boundary near the opening. Attach a `shopCta` only if the route and product label are already visible in the current shop catalog; otherwise omit it. Every entry still includes the report CTA in its Markdown body.

- [ ] **Step 4: Export the fixed catalog**

```ts
import { BAZI_AND_ELEMENT_ARTICLES } from "./bazi-and-elements"
import { ASTROLOGY_AND_METAPHYSICS_ARTICLES } from "./astrology-and-metaphysics"
import { TAROT_AND_BODY_READING_ARTICLES } from "./tarot-and-body-reading"

export const SEO_EDITORIAL_ARTICLES = [
  ...BAZI_AND_ELEMENT_ARTICLES,
  ...ASTROLOGY_AND_METAPHYSICS_ARTICLES,
  ...TAROT_AND_BODY_READING_ARTICLES,
]
```

- [ ] **Step 5: Run the content contract**

Run: `cd frontend; node --experimental-strip-types --test src/data/seo-editorial/contentContract.test.ts`

Expected: `1` passing test, `0` failures. Fix content rather than loosening length, FAQ, CTA, or internal-link requirements.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/data/seo-editorial
git commit -m "feat: publish English SEO editorial cluster"
```

### Task 3: Render editorial links and honest conversion CTAs

**Files:**
- Create: `frontend/src/components/blog/EditorialArticleLinks.tsx`
- Create: `frontend/src/components/blog/EditorialArticleLinks.test.ts`
- Modify: `frontend/src/app/[locale]/blog/[id]/page.tsx`

**Interfaces:**
- Consumes `EditorialArticle | Article`, `locale`, and `ARTICLES`.
- Produces an optional related-reading section from explicit `relatedIds` and an optional `shopCta` panel.
- Existing generic related-article fallback remains for legacy articles.

- [ ] **Step 1: Write the failing component policy test**

```ts
import test from "node:test"
import assert from "node:assert/strict"
import { getEditorialLinks } from "./EditorialArticleLinks"

test("uses explicit editorial links and never invents a shop CTA", () => {
  const links = getEditorialLinks({ relatedIds: ["a", "b"] }, new Map([["a", { id: "a" }], ["b", { id: "b" }]]))
  assert.deepEqual(links.map((article) => article.id), ["a", "b"])
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend; node --experimental-strip-types --test src/components/blog/EditorialArticleLinks.test.ts`

Expected: module-not-found failure.

- [ ] **Step 3: Implement the resolver and presentational component**

```tsx
export function getEditorialLinks(
  article: { relatedIds?: string[] },
  byId: Map<string, { id: string }>,
) {
  return (article.relatedIds ?? []).flatMap((id) => {
    const target = byId.get(id)
    return target ? [target] : []
  })
}
```

Render locale-aware article links with `/${locale}/blog/${target.id}`. Render an optional shop CTA only from `article.shopCta`, with its supplied `reason` visible to the reader. Do not add a shop CTA for legacy articles.

- [ ] **Step 4: Integrate it into the article page**

Build an `articlesById` map once from `ARTICLES`. If the current article has `relatedIds`, render `EditorialArticleLinks`; otherwise retain the current category-based related list. Keep the existing report CTA and change its `href` to `/${locale}/reading/new`.

- [ ] **Step 5: Run focused tests**

Run: `cd frontend; node --experimental-strip-types --test src/components/blog/EditorialArticleLinks.test.ts src/data/seo-editorial/contentContract.test.ts`

Expected: `2` passing tests, `0` failures.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/blog frontend/src/app/[locale]/blog/[id]/page.tsx
git commit -m "feat: add editorial links and conversion CTAs"
```

### Task 4: Emit Article and FAQ schema from the server layout

**Files:**
- Create: `frontend/src/lib/seo/editorialStructuredData.ts`
- Create: `frontend/src/lib/seo/editorialStructuredData.test.ts`
- Modify: `frontend/src/app/[locale]/blog/[id]/layout.tsx`
- Modify: `frontend/src/app/[locale]/blog/[id]/page.tsx`

**Interfaces:**
- Consumes `Article`, optional `faq`, `locale`, and `id`.
- Produces `createArticleJsonLd(article, locale)` and `createFaqJsonLd(faq)`.
- Server layout renders schema before the client page hydrates; client page removes its duplicate Article JSON-LD.

- [ ] **Step 1: Write failing structured-data tests**

```ts
import test from "node:test"
import assert from "node:assert/strict"
import { createArticleJsonLd, createFaqJsonLd } from "./editorialStructuredData"

test("creates truthful canonical Article schema", () => {
  const data = createArticleJsonLd({ id: "what-is-bazi", title_en: "What Is Bazi? A Beginner's Guide to the Four Pillars of Destiny", summary_en: "A clear introduction to Bazi as a cultural and reflective framework.", created_at: "2026-07-17", tags_en: ["Bazi"] }, "en")
  assert.equal(data["@type"], "Article")
  assert.equal(data.url, "https://www.khanfate.com/en/blog/what-is-bazi")
})

test("creates FAQPage only from supplied FAQ pairs", () => {
  const data = createFaqJsonLd([{ question: "What is Bazi?", answer: "A traditional chart framework." }])
  assert.equal(data["@type"], "FAQPage")
  assert.equal(data.mainEntity.length, 1)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend; node --experimental-strip-types --test src/lib/seo/editorialStructuredData.test.ts`

Expected: module-not-found failure.

- [ ] **Step 3: Implement schema helpers**

```ts
const SITE_URL = "https://www.khanfate.com"

export function createArticleJsonLd(article: Pick<Article, "id" | "title_en" | "summary_en" | "created_at" | "tags_en">, locale: "en" | "zh") {
  const title = locale === "zh" ? article.title_zh : article.title_en
  const description = locale === "zh" ? article.summary_zh : article.summary_en
  return { "@context": "https://schema.org", "@type": "Article", headline: title, description, datePublished: article.created_at, dateModified: article.created_at, url: `${SITE_URL}/${locale}/blog/${article.id}`, mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/${locale}/blog/${article.id}` }, keywords: (locale === "zh" ? article.tags_zh : article.tags_en).join(", "), author: { "@type": "Organization", name: "Inner Atlas AI" }, publisher: { "@type": "Organization", name: "Inner Atlas AI", url: SITE_URL } }
}
```

`createFaqJsonLd` maps each supplied pair to `Question` and `Answer`; it returns `null` for an empty list.

- [ ] **Step 4: Render schemas in the server layout**

Find the article by ID in `generateMetadata`. For an existing article, import `safeJsonLd`, render the Article script, and when the entry has `faq`, render a second FAQPage script. Use `safeJsonLd` for both. Keep the existing metadata canonical and hreflang values. Delete the client-side `safeJsonLd` import and Article script from the page to prevent duplicate schema.

- [ ] **Step 5: Run focused tests**

Run: `cd frontend; node --experimental-strip-types --test src/lib/seo/editorialStructuredData.test.ts src/data/seo-editorial/contentContract.test.ts`

Expected: `3` passing tests, `0` failures.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/seo/editorialStructuredData.ts frontend/src/lib/seo/editorialStructuredData.test.ts frontend/src/app/[locale]/blog/[id]/layout.tsx frontend/src/app/[locale]/blog/[id]/page.tsx
git commit -m "feat: render editorial schema on the server"
```

### Task 5: Verify discovery, build, and production output

**Files:**
- Modify: `frontend/src/app/sitemap.ts` only if a test proves new article dates are not emitted.
- Test: `frontend/src/data/seo-editorial/contentContract.test.ts`

**Interfaces:**
- Consumes the final `ARTICLES` catalog through the existing sitemap route.
- Produces 24 bilingual sitemap entries for the twelve new slugs without an additional route implementation.

- [ ] **Step 1: Add sitemap coverage to the content contract**

Add a test asserting that all twelve IDs are present in `ARTICLES` and each has a non-future `created_at` date. This verifies the existing sitemap loop will produce bilingual URLs without duplicating sitemap logic.

- [ ] **Step 2: Run the complete frontend verification**

Run:

```powershell
cd frontend
$tests = Get-ChildItem src -Recurse -Filter '*.test.ts' | ForEach-Object { $_.FullName }
node --experimental-strip-types --test $tests
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all Node tests pass, TypeScript exits `0`, lint reports no errors, and `next build` exits `0`.

- [ ] **Step 3: Commit final verification changes**

```bash
git add frontend/src/data/seo-editorial/contentContract.test.ts frontend/src/app/sitemap.ts
git commit -m "test: verify SEO editorial discovery"
```

- [ ] **Step 4: Deploy and verify representative public pages**

Deploy with the established low-memory server build and standalone-static sync process. Validate all of the following with external requests:

```text
https://khanfate.com/en/blog/what-is-bazi
https://khanfate.com/en/blog/tarot-self-reflection-guide
https://khanfate.com/en/blog/palm-reading-beginners
https://khanfate.com/sitemap.xml
```

Expected: each article returns `200`, has a self canonical, includes Article JSON-LD and FAQPage JSON-LD, links to `/en/reading/new`, and appears in the sitemap. Confirm any shop CTA is visible only where the article data explicitly declares it.

## Plan self-review

- Spec coverage: Tasks 1–2 publish the twelve defined entries; Task 3 handles deliberate internal links and dual conversion paths; Task 4 moves crawler-visible Article/FAQ schema to the server; Task 5 validates sitemap, build, and production output.
- Placeholder scan: no deferred requirements or unspecified content titles remain. Product CTAs are deliberately constrained to current visible catalog data, preventing invented recommendations.
- Type consistency: all editorial modules use `EditorialArticle`; existing route consumers continue to receive the compatible `Article` base shape; server schema helpers accept the same article fields.
