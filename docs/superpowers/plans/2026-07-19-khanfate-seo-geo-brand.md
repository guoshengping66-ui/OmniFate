# KhanFate SEO and GEO Brand Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Make KhanFate the only public SEO and GEO brand across metadata, schemas, AI discovery material, manifest, public assets, and indexable content.

**Architecture:** Add one typed SEO brand contract in the existing SEO library. Rewire all shared schemas and AI reference data to that contract, then apply a bounded mechanical migration to search-facing route metadata and copy. A source scan test prevents the retired name from reappearing in public discovery surfaces while preserving the separate legal operator name.

**Tech Stack:** Next.js 15 App Router, TypeScript, JSON-LD, Node test runner, ESLint.

## Global Constraints

- Public brand name is KhanFate; canonical URL remains https://www.khanfate.com.
- Khan Fate Team remains the legal operator name.
- Do not change URLs, data, APIs, reports, checkout, payment, inventory, or account behavior.
- Do not keep formerly Inner Atlas AI in public SEO/GEO wording.
- Do not add prediction, medical, legal, financial, or guaranteed-outcome claims.

---

### Task 1: Establish failing public-brand regression tests

**Files:**
- Create: frontend/src/lib/seo/publicBrandMigration.test.ts
- Test: frontend/src/lib/seo/publicBrandMigration.test.ts

**Interfaces:**
- Consumes: the existing public SEO source files and the expected exported brand contract.
- Produces: a test that fails until the public search and AI discovery surfaces expose KhanFate and omit the retired name.

- [ ] **Step 1: Write the failing test**

Create a Node source test that reads the central schema, AI reference data, root metadata, public manifest, and all indexable public route source files. It must assert:

```ts
assert.equal(SEO_BRAND_NAME, "KhanFate")
assert.equal(createOrganizationJsonLd().name, "KhanFate")
assert.equal(createWebSiteJsonLd("en").name, "KhanFate")
assert.doesNotMatch(discoverySource, /Inner Atlas AI|Inner Atlas/)
assert.doesNotMatch(manifestSource, /Inner Atlas AI|Inner Atlas/)
```

Exclude only noindex authentication/account routes and test files. Do not exclude public legal pages because their platform reference is public.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: node --test src/lib/seo/publicBrandMigration.test.ts

Expected: FAIL because the central schema and public discovery sources currently include Inner Atlas AI.

- [ ] **Step 3: Commit the red test**

```bash
git add frontend/src/lib/seo/publicBrandMigration.test.ts
git commit -m "test: guard KhanFate public brand migration"
```

### Task 2: Create the central SEO brand contract and migrate shared GEO data

**Files:**
- Create: frontend/src/lib/seo/brand.ts
- Modify: frontend/src/lib/seo/structuredData.ts
- Modify: frontend/src/lib/seo/editorialArticle.ts
- Modify: frontend/src/lib/seo/productMetadata.ts
- Modify: frontend/src/lib/seo/siteDiscovery.ts
- Modify: frontend/src/lib/seo/aiSearchReference.ts
- Modify: frontend/src/data/seo/aiSearchReference.ts
- Test: frontend/src/lib/seo/publicBrandMigration.test.ts

**Interfaces:**
- Produces: SEO_BRAND_NAME, SEO_BRAND_TAGLINE, SEO_BRAND_DESCRIPTION, and SEO_SITE_URL exported from the central brand module.
- Consumes: existing schema and AI discovery creators.

- [ ] **Step 1: Implement the brand module**

```ts
export const SEO_BRAND_NAME = "KhanFate"
export const SEO_SITE_URL = "https://www.khanfate.com"
export const SEO_BRAND_TAGLINE = "See Your Patterns. Choose Your Path."
export const SEO_BRAND_DESCRIPTION =
  "KhanFate is a bilingual AI-guided personal insight platform for cultural interpretation, self-reflection, and daily action prompts."
```

- [ ] **Step 2: Replace shared hard-coded publisher names**

Import SEO_BRAND_NAME and SEO_SITE_URL into the structured-data, editorial, product, discovery, and AI-reference modules. Keep only factual cultural-reference and responsible-use claims.

- [ ] **Step 3: Run the focused test**

Run: node --test src/lib/seo/publicBrandMigration.test.ts

Expected: central schema assertions pass; the public-source scan remains red until route and asset migrations are complete.

### Task 3: Migrate public metadata, indexable copy, and assets

**Files:**
- Modify: frontend/src/app/layout.tsx
- Modify: frontend/src/app/[locale]/layout.tsx
- Modify: indexable files under frontend/src/app/[locale]
- Modify: frontend/public/manifest.json
- Modify: frontend/public/og-image.svg
- Test: frontend/src/lib/seo/publicBrandMigration.test.ts

**Interfaces:**
- Consumes: the public brand contract from Task 2 where a shared value is possible.
- Produces: titles, descriptions, Open Graph site names, page-level article schema, and public visual metadata that consistently use KhanFate.

- [ ] **Step 1: Apply the bounded mechanical replacement**

Across public route source and public assets, replace the exact public brand strings in this order:

```text
Inner Atlas AI -> KhanFate
Inner Atlas -> KhanFate
```

Do not modify the exact legal operator string Khan Fate Team, domain URLs, API identifiers, or non-public test fixtures. For an adjacent noun phrase, revise it to grammatical KhanFate wording rather than leaving doubled names.

- [ ] **Step 2: Correct root metadata and visual asset wording**

Ensure the root layout uses:

```ts
title: { default: "KhanFate | AI-Guided Personal Insight", template: "%s | KhanFate" }
openGraph: { siteName: "KhanFate" }
```

Set manifest name to KhanFate and short_name to KhanFate. Update visible OG SVG text to KhanFate.

- [ ] **Step 3: Run the focused test to verify it passes**

Run: node --test src/lib/seo/publicBrandMigration.test.ts

Expected: PASS with zero instances of the retired public brand in the declared discovery set.

- [ ] **Step 4: Commit the feature**

```bash
git add frontend/src/app frontend/src/lib/seo frontend/src/data/seo frontend/public
git commit -m "feat: migrate public SEO and GEO brand to KhanFate"
```

### Task 4: Verify, release, and inspect public discovery surfaces

**Files:**
- Verify: frontend/src/lib/seo/publicBrandMigration.test.ts
- Verify: frontend/src/lib/seo/structuredData.test.ts
- Verify: frontend/src/lib/seo/siteDiscovery.test.ts
- Verify: frontend/src/lib/seo/aiSearchReference.test.ts

**Interfaces:**
- Consumes: completed source and deployed frontend.
- Produces: build and public HTTP evidence for the KhanFate migration.

- [ ] **Step 1: Run related tests**

```bash
node --test src/lib/seo/publicBrandMigration.test.ts src/lib/seo/structuredData.test.ts src/lib/seo/siteDiscovery.test.ts src/lib/seo/aiSearchReference.test.ts
```

Expected: zero failures.

- [ ] **Step 2: Run static and production checks**

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Expected: every command exits 0.

- [ ] **Step 3: Deploy only after a successful server build**

Upload the changed SEO/GEO source and public assets to /opt/OmniFate/frontend, run npm run build on the server, and restart PM2 frontend only after the build exits 0.

- [ ] **Step 4: Verify compressed public responses**

Use a Python subprocess with curl.exe -sS --compressed to fetch:

```text
https://www.khanfate.com/en
https://www.khanfate.com/zh
https://www.khanfate.com/en/ai-search
https://www.khanfate.com/en/shop
https://www.khanfate.com/llms.txt
https://www.khanfate.com/manifest.json
```

Assert every response contains KhanFate and no retired public brand. Check PM2 frontend/backend status and free disk space.

## Self-review

- Spec coverage: Tasks 1-3 cover source tests, central schema, metadata, AI/GEO content, and public assets; Task 4 covers local and production verification.
- Placeholder scan: each task contains explicit files, commands, expected results, and replacement rules.
- Type consistency: every shared schema imports the same SEO_BRAND_NAME contract, while legal operator wording remains an independent literal.
