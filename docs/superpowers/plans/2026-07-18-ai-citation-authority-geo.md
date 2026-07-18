# AI Citation Authority GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure Inner Atlas AI’s public AI citation assets use only indexable English pages and publish a truthful organization-to-service-to-method graph.

**Architecture:** `AI_SEARCH_REFERENCE` is the only source for visible service cards and `Service` JSON-LD. The reference page renders that data; `llms.txt` exposes only canonical public routes.

**Tech Stack:** Next.js 15, TypeScript, React, Schema.org JSON-LD, Node test runner via `tsx`.

## Global Constraints

- Use Inner Atlas AI as the sole organization/provider identity.
- Never cite `/en/reading/new`, account, checkout, payment, or other private/noindex pages.
- Match every schema property to visible HTML; no ratings, prices, credentials, availability, reviews, or guarantees.
- Keep `/en/ai-search` indexable and `/zh/ai-search` noindex.

---

### Task 1: Create citation-safe service source data

**Files:**
- Modify: `frontend/src/data/seo/aiSearchReference.ts`
- Modify: `frontend/src/data/seo/aiSearchReference.test.ts`
- Modify: `frontend/src/lib/seo/siteDiscovery.ts`
- Modify: `frontend/src/lib/seo/siteDiscovery.test.ts`

**Produces:** `AI_SEARCH_REFERENCE.services` with `id`, `name`, `description`, `href`, and `category`, plus citation-safe `llms.txt` content.

- [ ] **Step 1: Write failing tests**

```ts
assert.deepEqual(AI_SEARCH_REFERENCE.services.map((service) => service.id), ["reflection", "guides", "methods", "reports", "faq"])
assert.ok(AI_SEARCH_REFERENCE.services.every((service) => service.href.startsWith("/en/")))
assert.ok(!AI_SEARCH_REFERENCE.links.some((link) => link.href === "/en/reading/new"))
assert.match(text, /Report formats: https:\/\/www\.khanfate\.com\/en\/pricing/)
assert.doesNotMatch(text, /\/en\/reading\/new|\/checkout|\/account|\/payment/)
```

- [ ] **Step 2: Verify red**

Run `npx --no-install tsx src/data/seo/aiSearchReference.test.ts` and `npx --no-install tsx src/lib/seo/siteDiscovery.test.ts`; both must fail because `services` and the new `/en/pricing` entry are absent.

- [ ] **Step 3: Implement minimal shared data**

Add `AiSearchService` and the following service records: `reflection` → `/en`; `guides` → `/en/knowledge`; `methods` → `/en/tools`; `reports` → `/en/pricing`; `faq` → `/en/faq`. Their categories are respectively `Personal reflection and lifestyle guidance`, `Cultural and educational guides`, `Cultural interpretation tools`, `Digital lifestyle report information`, and `Service information`. Replace `Start a report` with `Report formats` at `/en/pricing`; replace the `Reports` line in `siteDiscovery.ts` with `Report formats: ${SITE_URL}/en/pricing`.

- [ ] **Step 4: Verify green and commit**

Run both Step 2 commands and require exit 0. Run `git add frontend/src/data/seo/aiSearchReference.ts frontend/src/data/seo/aiSearchReference.test.ts frontend/src/lib/seo/siteDiscovery.ts frontend/src/lib/seo/siteDiscovery.test.ts; git commit -m "feat: add public AI citation services"`.

### Task 2: Render service evidence on the AI reference page

**Files:**
- Modify: `frontend/src/app/[locale]/ai-search/page.tsx`
- Create: `frontend/src/app/[locale]/ai-search/page.test.tsx`

**Consumes:** `AI_SEARCH_REFERENCE.services` from Task 1. **Produces:** visible public-service cards linked to matching canonical routes.

- [ ] **Step 1: Write failing test**

```ts
const source = await readFile(new URL("./page.tsx", import.meta.url), "utf8")
assert.match(source, /aria-labelledby="services-heading"/)
assert.match(source, /Public services/)
assert.match(source, /AI_SEARCH_REFERENCE\.services\.map/)
assert.match(source, /href=\{service\.href\}/)
```

- [ ] **Step 2: Verify red**

Run `npx --no-install tsx src/app/[locale]/ai-search/page.test.tsx`; it must fail because no service section exists.

- [ ] **Step 3: Implement minimal page section**

Insert after the page header a `<section aria-labelledby="services-heading">` with `<h2 id="services-heading">Public services</h2>` and `AI_SEARCH_REFERENCE.services.map((service) => ...)`. Each card uses `<Link href={service.href}>{service.name}</Link>` and displays `service.description`.

- [ ] **Step 4: Verify green and commit**

Run the Step 2 command and require exit 0. Run `git add frontend/src/app/[locale]/ai-search/page.tsx frontend/src/app/[locale]/ai-search/page.test.tsx; git commit -m "feat: show public services on AI reference page"`.

### Task 3: Map visible services to Schema.org

**Files:**
- Modify: `frontend/src/lib/seo/aiSearchReference.ts`
- Modify: `frontend/src/lib/seo/aiSearchReference.test.ts`

**Consumes:** service data and `createPublisherJsonLd()`. **Produces:** `WebPage`, `ItemList`, `FAQPage`, and five `Service` nodes.

- [ ] **Step 1: Write failing schema test**

```ts
assert.deepEqual(schemas.map((item) => item["@type"]), ["WebPage", "ItemList", "FAQPage", "Service", "Service", "Service", "Service", "Service"])
assert.equal(schemas[0]!["@id"], "https://www.khanfate.com/en/ai-search#webpage")
assert.deepEqual(schemas[0]!.mainEntity, { "@id": "https://www.khanfate.com/en/ai-search#methods" })
assert.deepEqual(schemas.slice(3).map((service) => service.url), AI_SEARCH_REFERENCE.services.map((service) => `https://www.khanfate.com${service.href}`))
assert.ok(schemas.slice(3).every((service) => service.provider.name === "Inner Atlas AI"))
```

- [ ] **Step 2: Verify red**

Run `npx --no-install tsx src/lib/seo/aiSearchReference.test.ts`; it must fail because the function currently emits three schema nodes.

- [ ] **Step 3: Implement minimal schema graph**

Define `PAGE_ID = `${PAGE_URL}#webpage`` and `METHODS_ID = `${PAGE_URL}#methods``. Set WebPage `@id` to `PAGE_ID`, `mainEntity` to `{ "@id": METHODS_ID }`, and ItemList `@id` to `METHODS_ID`. Append one `Service` per service data item with `name`, `description`, `serviceType: service.category`, `url: `${SITE_URL}${service.href}``, `provider: createPublisherJsonLd()`, and `inLanguage: "en"`.

- [ ] **Step 4: Verify green and commit**

Run the Step 2 command and require exit 0. Run `git add frontend/src/lib/seo/aiSearchReference.ts frontend/src/lib/seo/aiSearchReference.test.ts; git commit -m "feat: add AI citation service schema"`.

### Task 4: Verify and deploy

**Files:** Verify all Task 1–3 files.

- [ ] **Step 1: Run quality gate**

Run the four targeted tests, `npx --no-install tsc --noEmit`, and `npm run lint`; all must exit 0.

- [ ] **Step 2: Deploy**

Archive the current branch, upload it to the server, extract to `/opt/OmniFate`, build with `NODE_OPTIONS=--max-old-space-size=1024 npm run build`, copy standalone assets, restart only PM2 `frontend` with `--update-env`, and save PM2.

- [ ] **Step 3: Validate production**

Require `/llms.txt` and `/en/ai-search` to return 200; require `/en/pricing` but not `/en/reading/new` in `llms.txt`; require `Public services` in reference HTML; require five `Service` JSON-LD nodes; require PM2 frontend and backend to be online.
