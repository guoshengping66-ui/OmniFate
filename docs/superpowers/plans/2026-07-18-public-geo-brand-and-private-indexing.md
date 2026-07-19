# Public GEO Brand and Private Indexing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public search and AI-citation signal identify the site as Inner Atlas AI, while preventing personal and transactional routes from being indexed.

**Architecture:** Reuse the existing SEO branding helper as the single source of truth for Organization and Publisher JSON-LD. Replace legacy brands only in rendered public metadata, structured data, and copy; private route layouts receive explicit Next.js robots metadata and the shared crawler policy adds both locale prefixes to its disallow rules.

**Tech Stack:** Next.js 15 App Router, TypeScript, Node built-in test runner via `tsx`, schema.org JSON-LD.

## Global Constraints

- Public canonical brand is exactly `Inner Atlas AI` in English and Chinese metadata/schema.
- Do not claim predictive certainty or financial, medical, legal, or other professional outcomes.
- Preserve existing English public canonical URLs and localized Open Graph image paths.
- Private account, authentication, checkout, credits, referral and individual reading routes must return `noindex, nofollow` metadata.
- Do not add dependencies.

---

### Task 1: Add regressions for brand and crawl privacy

**Files:**
- Modify: `frontend/src/lib/seo/publicBranding.test.ts`
- Create: `frontend/src/lib/seo/crawlerPolicy.test.ts`

**Interfaces:**
- Consumes: `createRobotsRules()` and `PRIVATE_DISALLOW_PATHS` from `frontend/src/lib/seo/crawlerPolicy.ts`.
- Produces: static source regressions that fail when rendered public SEO sources contain `Destiny Engine`, `Profile Mirror`, `Guanwo`, or `观我`, and policy assertions for localized private paths.

- [ ] **Step 1: Write the failing tests**

```ts
const legacyBrand = /Destiny Engine|Profile Mirror|Guanwo|观我/
const renderedSeoRoots = [
  "../../app/[locale]",
  "../../components/templates",
]

test("keeps legacy brands out of rendered public SEO sources", () => {
  for (const root of renderedSeoRoots) {
    for (const file of sourceFiles(fileURLToPath(new URL(root, import.meta.url)))) {
      assert.doesNotMatch(readFileSync(file, "utf8"), legacyBrand, file)
    }
  }
})
```

```ts
test("blocks localized private routes for every crawler policy", () => {
  for (const path of ["/en/account", "/zh/account", "/en/checkout", "/zh/readings"]) {
    assert.ok(PRIVATE_DISALLOW_PATHS.includes(path))
  }
  for (const rule of createRobotsRules().filter((rule) => rule.userAgent !== "GPTBot")) {
    assert.ok(Array.isArray(rule.disallow) && rule.disallow.includes("/en/account"))
  }
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx tsx --test src/lib/seo/publicBranding.test.ts src/lib/seo/crawlerPolicy.test.ts` from `frontend`.

Expected: the brand test reports existing legacy metadata/schema and the crawler test reports missing locale-prefixed disallow paths.

- [ ] **Step 3: Commit the test-only change**

Run: `git add frontend/src/lib/seo/publicBranding.test.ts frontend/src/lib/seo/crawlerPolicy.test.ts && git commit -m "test: cover GEO brand and private indexing"`.

### Task 2: Unify public metadata and structured-data identity

**Files:**
- Modify: public `layout.tsx` files beneath `frontend/src/app/[locale]/`
- Modify: programmatic public metadata pages beneath `frontend/src/app/[locale]/`
- Modify: `frontend/src/app/[locale]/blog/page.tsx`
- Modify: 12 legacy schema templates in `frontend/src/components/templates/`

**Interfaces:**
- Consumes: `createPublisherJsonLd()` from `frontend/src/lib/seo/structuredData.ts`.
- Produces: titles, Open Graph names, descriptions, JSON-LD authors, and JSON-LD publishers all identifying the public product as `Inner Atlas AI`.

- [ ] **Step 1: Replace public metadata values**

Change title suffixes and public descriptive copy from legacy brand terms to `Inner Atlas AI`. Use the existing language for all non-brand content. For example, use `"FAQ - Inner Atlas AI"` and `"Inner Atlas AI privacy policy..."`, rather than changing the page topic.

- [ ] **Step 2: Replace programmatic title suffixes**

For astrology, Bazi, face, palm, five-elements, tarot, zodiac, Zi Wei, comparison, and knowledge pages, replace `| Guanwo` and `| 观我` with `| Inner Atlas AI`.

- [ ] **Step 3: Use the publisher helper in schema-producing components**

In the blog collection schema and the twelve legacy template schemas, import `createPublisherJsonLd` and set both `author` and `publisher` to its return value. Do not duplicate organization name, URL, or logo literals.

- [ ] **Step 4: Run the brand regression**

Run: `npx tsx --test src/lib/seo/publicBranding.test.ts` from `frontend`.

Expected: PASS.

- [ ] **Step 5: Commit the public identity change**

Run: `git add frontend/src/app/[locale] frontend/src/components/templates frontend/src/lib/seo/publicBranding.test.ts && git commit -m "feat: unify public GEO brand signals"`.

### Task 3: Mark private routes and localized crawler paths as non-indexable

**Files:**
- Modify: `frontend/src/lib/seo/crawlerPolicy.ts`
- Modify: layouts under `frontend/src/app/[locale]/` for `account`, `checkout`, `credits`, `login`, `register`, `readings`, `reading`, and `referral`

**Interfaces:**
- Consumes: Next.js `Metadata` `robots` object and `PRIVATE_DISALLOW_PATHS`.
- Produces: `robots: { index: false, follow: false }` on private layouts and both `/en/...` plus `/zh/...` variants in crawler disallow arrays.

- [ ] **Step 1: Expand policy paths**

Define the base private paths as `account`, `checkout`, `credits`, `login`, `register`, `readings`, `reading`, and `referral`; derive `/en/<path>` and `/zh/<path>` entries together with the existing root-route forms and `/api/`.

- [ ] **Step 2: Add explicit route metadata**

Each private route layout must include:

```ts
robots: { index: false, follow: false },
```

Retain existing title and description only after renaming any old brand words to `Inner Atlas AI`.

- [ ] **Step 3: Run privacy and type checks**

Run: `npx tsx --test src/lib/seo/crawlerPolicy.test.ts && npx tsc --noEmit` from `frontend`.

Expected: both commands exit 0.

- [ ] **Step 4: Commit the indexing isolation change**

Run: `git add frontend/src/lib/seo/crawlerPolicy.ts frontend/src/app/[locale] && git commit -m "fix: prevent indexing of localized private routes"`.

### Task 4: Verify production behavior and deploy

**Files:**
- No new source files.

**Interfaces:**
- Consumes: production `https://www.khanfate.com` and deployment routine.
- Produces: evidence that public brand metadata is consistent and private pages emit noindex after deployment.

- [ ] **Step 1: Run complete local verification**

Run from `frontend`:

```powershell
npx tsx --test src/lib/seo/*.test.ts src/app/[locale]/blog/[id]/geo.test.ts
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Deploy the built frontend**

Upload the changed source archive to `/opt/OmniFate`, run the existing standalone build packaging command, restart only the `frontend` PM2 process, and save PM2 state.

- [ ] **Step 3: Verify production headers and rendered metadata**

Confirm:

```text
https://www.khanfate.com/en/blog/wuxing-basics contains Inner Atlas AI and one Article JSON-LD publisher.
https://www.khanfate.com/en/checkout contains a robots meta tag with noindex,nofollow.
https://www.khanfate.com/robots.txt contains /en/account and /zh/account disallows.
pm2 status reports frontend and backend online.
```

- [ ] **Step 4: Commit the deployment-ready state**

Run: `git status --short` and confirm no uncommitted source changes remain.
