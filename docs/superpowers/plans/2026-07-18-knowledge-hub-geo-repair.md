# Knowledge Hub GEO Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each localized knowledge hub URL accurate canonical metadata, a semantic H1, and truthful localized CollectionPage schema.

**Architecture:** The route layout generates metadata from `locale`; the client page continues rendering existing knowledge data but gives its title H1 semantics and enriches the existing CollectionPage JSON-LD. Tests inspect the metadata function and page source before implementation.

**Tech Stack:** Next.js 15, TypeScript, React, Schema.org JSON-LD, Node test runner via `tsx`.

## Global Constraints

- Canonical URLs are `https://www.khanfate.com/en/knowledge` and `https://www.khanfate.com/zh/knowledge`.
- Alternates contain `en`, `zh`, and English `x-default`.
- Schema must match visible copy and use `createPublisherJsonLd()`; no credentials, outcomes, ratings, or reviews.
- Do not change category/subcategory pages or private flows.

---

### Task 1: Add localized knowledge-hub metadata

**Files:**
- Modify: `frontend/src/app/[locale]/knowledge/layout.tsx`
- Create: `frontend/src/app/[locale]/knowledge/layout.test.ts`

**Produces:** `generateMetadata({ params })` returning self-canonical, hreflang, localized title/description, and Open Graph URL.

- [ ] **Step 1: Write the failing metadata test**

```ts
const en = await generateMetadata({ params: Promise.resolve({ locale: "en" }) })
const zh = await generateMetadata({ params: Promise.resolve({ locale: "zh" }) })
assert.equal(en.alternates?.canonical, "https://www.khanfate.com/en/knowledge")
assert.equal(zh.alternates?.canonical, "https://www.khanfate.com/zh/knowledge")
assert.deepEqual(en.alternates?.languages, { en: "https://www.khanfate.com/en/knowledge", zh: "https://www.khanfate.com/zh/knowledge", "x-default": "https://www.khanfate.com/en/knowledge" })
assert.equal(en.openGraph?.url, "https://www.khanfate.com/en/knowledge")
```

- [ ] **Step 2: Verify red**

Run `npx --no-install tsx src/app/[locale]/knowledge/layout.test.ts`; it must fail because `generateMetadata` does not exist.

- [ ] **Step 3: Implement metadata**

Use the tools layout pattern. Set `base` to `https://www.khanfate.com`, `path` to `/${locale}/knowledge`, English title to `Inner Atlas AI Knowledge Library | Cultural Interpretation Guides`, English description to `Public educational guides to Bazi, astrology, tarot, face reading, palm reading, and AI-assisted reflection.`, and equivalent factual Chinese values. Set Open Graph URL and alternates to the localized paths.

- [ ] **Step 4: Verify green and commit**

Run the Step 2 command and `npx --no-install tsc --noEmit`. Then run `git add frontend/src/app/[locale]/knowledge/layout.tsx frontend/src/app/[locale]/knowledge/layout.test.ts; git commit -m "fix: localize knowledge hub metadata"`.

### Task 2: Make visible and structured hub evidence agree

**Files:**
- Modify: `frontend/src/app/[locale]/knowledge/page.tsx`
- Create: `frontend/src/app/[locale]/knowledge/page.test.tsx`

**Consumes:** `createPublisherJsonLd()` and existing `locale`/knowledge data. **Produces:** one H1 plus localized CollectionPage schema with `@id`, `inLanguage`, and publisher.

- [ ] **Step 1: Write the failing page-source test**

```ts
assert.match(source, /<h1[^>]*>\{isZh \?/) 
assert.match(source, /createPublisherJsonLd/)
assert.match(source, /"@id": `https:\/\/www\.khanfate\.com\/\$\{locale\}\/knowledge#collection`/)
assert.match(source, /"inLanguage": isZh \? "zh-CN" : "en"/)
assert.match(source, /"publisher": createPublisherJsonLd\(\)/)
```

- [ ] **Step 2: Verify red**

Run `npx --no-install tsx src/app/[locale]/knowledge/page.test.tsx`; it must fail because no H1 or publisher schema exists.

- [ ] **Step 3: Implement minimal semantic and schema changes**

Import `createPublisherJsonLd` from `@/lib/seo/structuredData`. Add `"@id": `https://www.khanfate.com/${locale}/knowledge#collection``, `"inLanguage": isZh ? "zh-CN" : "en"`, and `"publisher": createPublisherJsonLd()` to `jsonLd`. Change the existing `EasternSection` title rendering so it supplies an `<h1>` containing the same localized title text; retain lower headings as H2.

- [ ] **Step 4: Verify green and commit**

Run the Step 2 command, `npx --no-install tsc --noEmit`, and `npm run lint`. Then run `git add frontend/src/app/[locale]/knowledge/page.tsx frontend/src/app/[locale]/knowledge/page.test.tsx; git commit -m "fix: strengthen knowledge hub citation evidence"`.

### Task 3: Full verification and deployment

**Files:** Verify all Task 1–2 files.

- [ ] **Step 1: Run quality gate**

Run both new tests, the existing frontend test suite, `npx --no-install tsc --noEmit`, and `npm run lint`; all commands must exit 0.

- [ ] **Step 2: Deploy production build**

Archive the branch, upload it to `/tmp`, extract it in `/opt/OmniFate`, build with `NODE_OPTIONS=--max-old-space-size=1024 npm run build`, copy standalone static/public assets, restart only PM2 frontend with `--update-env`, and save PM2.

- [ ] **Step 3: Verify live output**

Require 200 for `/en/knowledge` and `/zh/knowledge`; extract self-canonical and all hreflang links; require an English H1 and a CollectionPage schema with English URL, `inLanguage: en`, and `publisher.name: Inner Atlas AI`; require PM2 frontend/backend online.
