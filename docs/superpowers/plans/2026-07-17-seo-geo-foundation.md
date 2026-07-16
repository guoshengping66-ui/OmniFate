# SEO and GEO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Khanfate's public bilingual content consistently crawlable, accurately structured, and available to AI search retrieval without permitting foundation-model training.

**Architecture:** Keep crawler policy as a small source-controlled module used by `robots.ts`, with the same policy applied in Cloudflare's managed AI-crawler setting. Add deterministic sitemap timestamps and reusable server-safe structured-data builders. Publish a concise text discovery index for AI clients and validate the generated public responses after deployment.

**Tech Stack:** Next.js 15 App Router, TypeScript, next-intl, Schema.org JSON-LD, Nginx, Cloudflare, PM2.

## Global Constraints

- Canonical URLs use `https://www.khanfate.com`; the apex domain only redirects.
- Public content may be retrieved for search/citation; `GPTBot` remains disallowed and `ai-train=no` remains in effect.
- Never add rating, inventory, shipping, certification, medical, financial, or outcome claims without a matching visible source of truth.
- Keep `/account`, `/checkout`, `/readings`, and `/api/` blocked from crawl and excluded from the sitemap.
- All inline JSON-LD must be serialized with `safeJsonLd`.
- Do not create bulk derivative pages or keyword-only copy.

---

### Task 1: Encode crawler policy and align the CDN setting

**Files:**
- Create: `frontend/src/lib/seo/crawlerPolicy.ts`
- Create: `frontend/src/lib/seo/crawlerPolicy.test.ts`
- Modify: `frontend/src/app/robots.ts`
- Modify: `docs/seo-geo-cloudflare-runbook.md`

**Interfaces:**
- Produces `AI_SEARCH_CRAWLERS`, `TRAINING_CRAWLERS`, `PUBLIC_ALLOW_PATHS`, `PRIVATE_DISALLOW_PATHS`, and `createRobotsRules()`.
- `robots.ts` consumes `createRobotsRules()` and returns `MetadataRoute.Robots`.

- [ ] **Step 1: Write the failing policy test**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { AI_SEARCH_CRAWLERS, TRAINING_CRAWLERS, createRobotsRules } from "./crawlerPolicy.ts"

test("allows ChatGPT search while retaining the no-training policy", () => {
  assert.ok(AI_SEARCH_CRAWLERS.includes("OAI-SearchBot"))
  assert.ok(TRAINING_CRAWLERS.includes("GPTBot"))
  const gptRule = createRobotsRules().find((rule) => rule.userAgent === "GPTBot")
  assert.deepEqual(gptRule?.disallow, ["/"])
})

test("keeps private and transactional routes disallowed for public crawlers", () => {
  const publicRule = createRobotsRules().find((rule) => rule.userAgent === "*")
  assert.deepEqual(publicRule?.disallow, ["/account", "/checkout", "/readings", "/api/"])
})
```

- [ ] **Step 2: Run the test to verify RED**

Run: `node --experimental-strip-types --test src/lib/seo/crawlerPolicy.test.ts` from `frontend/`.

Expected: failure because `crawlerPolicy.ts` does not exist.

- [ ] **Step 3: Implement the policy module and robots route**

```ts
import type { MetadataRoute } from "next"

export const PRIVATE_DISALLOW_PATHS = ["/account", "/checkout", "/readings", "/api/"]
export const AI_SEARCH_CRAWLERS = ["OAI-SearchBot"]
export const TRAINING_CRAWLERS = ["GPTBot"]

export function createRobotsRules(): MetadataRoute.Robots["rules"] {
  return [
    { userAgent: "*", allow: "/", disallow: PRIVATE_DISALLOW_PATHS },
    { userAgent: ["Googlebot", "Bingbot", "Yandex", ...AI_SEARCH_CRAWLERS], allow: ["/en/", "/zh/", "/sitemap.xml"], disallow: PRIVATE_DISALLOW_PATHS },
    ...TRAINING_CRAWLERS.map((userAgent) => ({ userAgent, disallow: ["/"] })),
  ]
}
```

Make `robots.ts` use `createRobotsRules()` and retain `https://www.khanfate.com/sitemap.xml`.

Write `docs/seo-geo-cloudflare-runbook.md` with the exact Cloudflare Dashboard action: change the managed AI crawler setting from blocking all named bots to allowing `OAI-SearchBot` for search retrieval, keep `GPTBot` blocked, preserve `ai-train=no`, then purge only `/robots.txt`.

- [ ] **Step 4: Run the policy test to verify GREEN**

Run: `node --experimental-strip-types --test src/lib/seo/crawlerPolicy.test.ts`.

Expected: two passing tests.

- [ ] **Step 5: Commit policy and runbook**

```bash
git add frontend/src/lib/seo/crawlerPolicy.ts frontend/src/lib/seo/crawlerPolicy.test.ts frontend/src/app/robots.ts docs/seo-geo-cloudflare-runbook.md
git commit -m "feat: define search-safe crawler policy"
```

### Task 2: Make sitemap dates deterministic and sitemap entries crawl-focused

**Files:**
- Create: `frontend/src/lib/seo/sitemapDates.ts`
- Create: `frontend/src/lib/seo/sitemapDates.test.ts`
- Modify: `frontend/src/app/sitemap.ts`

**Interfaces:**
- Produces `STATIC_CONTENT_LAST_MODIFIED` and `getProgrammaticLastModified()`.
- `sitemap.ts` consumes the helper instead of constructing `new Date()` for static/programmatic records.

- [ ] **Step 1: Write the failing date test**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { getProgrammaticLastModified } from "./sitemapDates.ts"

test("uses a stable release date for unchanged programmatic pages", () => {
  assert.equal(getProgrammaticLastModified().toISOString(), "2026-07-17T00:00:00.000Z")
})

test("does not replace a known article source date", () => {
  const published = new Date("2026-06-01T12:00:00.000Z")
  assert.equal(getProgrammaticLastModified(published).toISOString(), published.toISOString())
})
```

- [ ] **Step 2: Run the date test to verify RED**

Run: `node --experimental-strip-types --test src/lib/seo/sitemapDates.test.ts` from `frontend/`.

Expected: failure because `sitemapDates.ts` does not exist.

- [ ] **Step 3: Implement stable dates and wire them into sitemap entries**

```ts
export const STATIC_CONTENT_LAST_MODIFIED = new Date("2026-07-17T00:00:00.000Z")

export function getProgrammaticLastModified(sourceDate?: Date): Date {
  return sourceDate ?? STATIC_CONTENT_LAST_MODIFIED
}
```

Replace `const now = new Date()` and `new Date()` calls used for static/programmatic sitemap records with `STATIC_CONTENT_LAST_MODIFIED`; keep `new Date(article.created_at)` for articles. Do not include query URLs or private paths.

- [ ] **Step 4: Run test and sitemap smoke check**

Run:

```bash
node --experimental-strip-types --test src/lib/seo/sitemapDates.test.ts
npm run build
```

Expected: tests pass and Next.js generates `sitemap.xml` without type errors.

- [ ] **Step 5: Commit sitemap hygiene**

```bash
git add frontend/src/lib/seo/sitemapDates.ts frontend/src/lib/seo/sitemapDates.test.ts frontend/src/app/sitemap.ts
git commit -m "fix: stabilize sitemap modification dates"
```

### Task 3: Publish a concise GEO discovery index and reusable schema builders

**Files:**
- Create: `frontend/src/lib/seo/siteDiscovery.ts`
- Create: `frontend/src/lib/seo/siteDiscovery.test.ts`
- Create: `frontend/src/app/llms.txt/route.ts`
- Create: `frontend/src/lib/seo/structuredData.ts`
- Create: `frontend/src/lib/seo/structuredData.test.ts`
- Modify: `frontend/src/app/[locale]/layout.tsx`

**Interfaces:**
- `createLlmsTxt(): string` returns deterministic UTF-8 plain text.
- `createOrganizationJsonLd()` and `createWebSiteJsonLd(locale)` return serializable objects with canonical URLs.
- The locale layout renders the organization and website JSON-LD through `safeJsonLd`.

- [ ] **Step 1: Write failing text and schema tests**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { createLlmsTxt } from "./siteDiscovery.ts"
import { createOrganizationJsonLd } from "./structuredData.ts"

test("lists canonical bilingual entry points in llms.txt", () => {
  const text = createLlmsTxt()
  assert.match(text, /https:\/\/www\.khanfate\.com\/en/)
  assert.match(text, /https:\/\/www\.khanfate\.com\/zh/)
  assert.match(text, /not medical, legal, financial, or professional advice/i)
})

test("does not invent organization claims", () => {
  const jsonLd = createOrganizationJsonLd()
  assert.equal(jsonLd["@type"], "Organization")
  assert.equal(jsonLd.url, "https://www.khanfate.com")
  assert.equal("aggregateRating" in jsonLd, false)
})
```

- [ ] **Step 2: Run tests to verify RED**

Run: `node --experimental-strip-types --test src/lib/seo/siteDiscovery.test.ts src/lib/seo/structuredData.test.ts` from `frontend/`.

Expected: failure because the modules do not exist.

- [ ] **Step 3: Implement the discovery route and schema builders**

`createLlmsTxt()` must contain a short site purpose, the English and Chinese home URLs, canonical hub URLs for reports, methods, knowledge, blog, shop, FAQ, policies, and an explicit service-use limitation. It must not claim ranking, prediction, diagnosis, investment advice, or product efficacy.

`route.ts` must return:

```ts
return new Response(createLlmsTxt(), {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
  },
})
```

`createOrganizationJsonLd()` must include only `@context`, `@type`, `name`, `url`, and `logo`. `createWebSiteJsonLd(locale)` must include `@context`, `@type`, `name`, localized `url`, localized `description`, and `inLanguage`. Replace duplicate inline layout objects with these helpers and retain `safeJsonLd`.

- [ ] **Step 4: Run tests and inspect generated response**

Run:

```bash
node --experimental-strip-types --test src/lib/seo/siteDiscovery.test.ts src/lib/seo/structuredData.test.ts
npm run build
```

Expected: all tests pass, build passes, and `/llms.txt` is emitted as text/plain.

- [ ] **Step 5: Commit GEO discovery and base schema**

```bash
git add frontend/src/lib/seo/siteDiscovery.ts frontend/src/lib/seo/siteDiscovery.test.ts frontend/src/app/llms.txt/route.ts frontend/src/lib/seo/structuredData.ts frontend/src/lib/seo/structuredData.test.ts frontend/src/app/[locale]/layout.tsx
git commit -m "feat: add geo discovery index and base schema"
```

### Task 4: Add truthful product structured data to the rendered product detail page

**Files:**
- Create: `frontend/src/components/shop/ProductJsonLd.tsx`
- Create: `frontend/src/components/shop/ProductJsonLd.test.ts`
- Modify: `frontend/src/app/[locale]/shop/[id]/page.tsx`

**Interfaces:**
- `createProductJsonLd(product, locale, canonicalUrl)` returns a schema object based exclusively on `Product` fields already displayed to the visitor.
- `ProductJsonLd` serializes that object through `safeJsonLd`.

- [ ] **Step 1: Write the failing product-schema test**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { createProductJsonLd } from "./ProductJsonLd.tsx"

test("uses visible product fields without fabricated ratings or availability", () => {
  const jsonLd = createProductJsonLd({ id: "p1", name: "Citrine Bowl", image_url: "/products/citrine.webp", description: "Reflective object", price_usd: 59 } as never, "en", "https://www.khanfate.com/en/shop/p1")
  assert.equal(jsonLd["@type"], "Product")
  assert.equal(jsonLd.offers.price, "59")
  assert.equal("aggregateRating" in jsonLd, false)
  assert.equal("availability" in jsonLd.offers, false)
})
```

- [ ] **Step 2: Run the test to verify RED**

Run: `node --experimental-strip-types --test src/components/shop/ProductJsonLd.test.ts` from `frontend/`.

Expected: failure because `ProductJsonLd.tsx` does not exist.

- [ ] **Step 3: Implement the component and render it after product loading**

The builder must create a `Product` object with `name`, `description` only when the visible localized description exists, absolute `image`, canonical `url`, and an `Offer` with `price`, `priceCurrency: "USD"`, and `url` only when `price_usd` is present. Do not emit rating, review, availability, shipping, return, or efficacy fields.

Render `<ProductJsonLd product={product} locale={locale} />` only after `product` is non-null. The component must use `safeJsonLd`.

- [ ] **Step 4: Run test, type check, and build**

Run:

```bash
node --experimental-strip-types --test src/components/shop/ProductJsonLd.test.ts
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all tests pass, lint has no errors, and build passes.

- [ ] **Step 5: Commit product schema**

```bash
git add frontend/src/components/shop/ProductJsonLd.tsx frontend/src/components/shop/ProductJsonLd.test.ts frontend/src/app/[locale]/shop/[id]/page.tsx
git commit -m "feat: add truthful product structured data"
```

### Task 5: Deploy and validate public SEO/GEO responses

**Files:**
- Modify: `scripts/deploy-all.sh` only if the new route requires a missing standalone asset sync; otherwise no source-file change.
- Read: `docs/seo-geo-cloudflare-runbook.md`

**Interfaces:**
- Consumes compiled frontend build, Cloudflare crawler policy, sitemap, robots response, and public URLs.
- Produces an evidence record of live crawl policy and schema response.

- [ ] **Step 1: Apply the Cloudflare managed crawler policy**

Use the documented Cloudflare account setting or a scoped API token. Allow `OAI-SearchBot` for public retrieval, keep `GPTBot` blocked, leave `ai-train=no`, then purge the `/robots.txt` cache entry. Do not change unrelated WAF, DNS, cache, or training controls.

- [ ] **Step 2: Deploy with an on-server backup**

Upload the changed files atomically, back up the existing files in `/opt/OmniFate/.deploy-backups/seo-geo-<timestamp>/`, install no new runtime dependency, run `npm run build`, sync `.next/standalone/.next/static` and `public`, then restart only PM2 `frontend`.

- [ ] **Step 3: Verify crawler policy and index endpoints**

Run:

```bash
curl -sS https://khanfate.com/robots.txt
curl -sS https://khanfate.com/sitemap.xml
curl -sSI https://khanfate.com/llms.txt
```

Expected: `OAI-SearchBot` is allowed, `GPTBot` is disallowed, private paths remain disallowed, sitemap uses `www` canonical URLs with `en`/`zh` alternates, and `llms.txt` returns `text/plain`.

- [ ] **Step 4: Verify representative rendered pages**

Open `/en`, `/zh`, `/en/blog/<known-id>`, `/en/shop/p1`, and `/en/faq` in a browser. Confirm status 200, one canonical URL, correct language alternates, visible content matching JSON-LD, and no failed static assets.

- [ ] **Step 5: Record Search Console/Bing follow-up**

If verified ownership is available, submit `https://www.khanfate.com/sitemap.xml` to Google Search Console and Bing Webmaster Tools. Record the submission date; do not report a ranking or citation guarantee.

## Plan Self-Review

- Spec coverage: crawler rights (Task 1 and Task 5), sitemap correctness (Task 2), discovery content and base data (Task 3), product data integrity (Task 4), and deployment validation (Task 5).
- Scope: this plan improves the current public corpus without generating new mass pages or changing payment, reports, or product claims.
- Consistency: all schema helpers use `safeJsonLd`; all crawler rules preserve the same private-route block list; public URL references use the `www` canonical host.
