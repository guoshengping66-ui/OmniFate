# Article Social Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each public editorial article a crawlable, truthful social image referenced consistently by metadata and Article JSON-LD.

**Architecture:** A small SEO helper creates the canonical image URL from locale and article ID. The article metadata layout and JSON-LD helper consume that function; a normal Next.js route handler renders the visible title and cover emoji at 1200 × 630 without allowing special file-based metadata to override the public URL.

**Tech Stack:** Next.js 15 App Router, `next/og`, TypeScript, Node test runner.

## Global Constraints

- Use `https://www.khanfate.com` as the sole public origin.
- Never fabricate author credentials, ratings, outcomes, or advice.
- Unavailable article locales remain unavailable and return 404.
- Do not alter canonical URLs, sitemap membership, or crawler policy.

---

### Task 1: Define the canonical article-image URL

**Files:**
- Modify: `frontend/src/lib/seo/editorialArticle.ts`
- Test: `frontend/src/lib/seo/editorialArticle.test.ts`

**Interface:** `getArticleSocialImageUrl(locale: "en" | "zh", id: string): string`.

- [ ] Write a failing assertion for `https://www.khanfate.com/en/blog/what-is-bazi/opengraph-image`.
- [ ] Run `npx tsx --test src/lib/seo/editorialArticle.test.ts` and verify the missing export fails.
- [ ] Implement `getArticleSocialImageUrl` using the public origin, locale, and ID.
- [ ] Re-run the focused test and verify it passes.

### Task 2: Align page metadata and Article JSON-LD

**Files:**
- Modify: `frontend/src/lib/seo/editorialArticle.ts`
- Modify: `frontend/src/app/[locale]/blog/[id]/layout.tsx`
- Test: `frontend/src/lib/seo/blogIndexRecovery.test.ts`

**Interface:** `Article.image`, `openGraph.images`, and `twitter.images` all consume `getArticleSocialImageUrl`.

- [ ] Add failing source-contract tests for the shared image helper in JSON-LD and article metadata.
- [ ] Run focused tests and verify they fail because article-level image markup is absent.
- [ ] Add an `image` URL to Article JSON-LD, Open Graph `images` at 1200 × 630, and `summary_large_image` Twitter metadata.
- [ ] Re-run focused tests and verify they pass.

### Task 3: Render the image endpoint

**Files:**
- Create: `frontend/src/app/[locale]/blog/[id]/social-image/route.tsx`
- Test: `frontend/src/lib/seo/blogIndexRecovery.test.ts`

**Interface:** The route uses `ARTICLES` and `isArticleAvailable`; it returns a 1200 × 630 `ImageResponse` for public articles and `notFound()` otherwise.

- [ ] Add a failing route-source test requiring `ImageResponse` and unavailable-locale protection.
- [ ] Run the test and verify it fails because the route does not exist.
- [ ] Render only article-visible data: localized title, cover emoji, localized label, and `Inner Atlas AI`.
- [ ] Re-run the focused test and verify it passes.

### Task 4: Verify and release

- [ ] Run every `*.test.ts`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
- [ ] Commit the feature and documentation using `feat: add article social image metadata`.
- [ ] Deploy and verify: public article 200, image endpoint `image/png`, matching Open Graph/Twitter/JSON-LD image URL, PM2 online.
