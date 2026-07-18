# Shop Collection SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the localized shop collection page expose factual, crawlable collection context and structured data before client-side product loading.

**Architecture:** Keep the existing interactive shop implementation as a client component so filtering, personalized ranking, cart registration, and dynamic product data remain unchanged. Replace the route file with a server component that creates localized metadata, a visible collection header passed into the hero, and a bounded `CollectionPage` / `ItemList` JSON-LD graph containing only the four real collection categories.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, JSON-LD, Node test runner, ESLint.

## Global Constraints

- Do not server-fetch product inventory or alter personalized matching, checkout, prices, or availability.
- Use only the categories already presented by the shop: crystals, jewelry, incense, and talismans.
- Do not add ratings, reviews, inventory counts, efficacy, medical claims, or guaranteed outcomes.
- Keep canonical and Chinese/English alternate URLs exactly as the existing route generates them.
- Keep responsible-use wording: items are cultural and lifestyle recommendations, not guaranteed outcomes.

---

### Task 1: Add regression tests for crawlable shop context

**Files:**
- Create: `frontend/src/lib/seo/shopCollectionPage.test.ts`
- Test: `frontend/src/lib/seo/shopCollectionPage.test.ts`

**Interfaces:**
- Consumes: the source of `frontend/src/app/[locale]/shop/page.tsx`, `frontend/src/app/[locale]/shop/ShopClient.tsx`, and `frontend/src/app/[locale]/shop/layout.tsx`.
- Produces: assertions that keep the server route and interactive hero boundary crawlable.

- [ ] **Step 1: Write the failing test**

```ts
test('shop route declares a factual collection page and category list', () => {
  assert.match(routeSource, /CollectionPage/);
  assert.match(routeSource, /Lifestyle objects matched to your current state/);
  for (const category of ['Crystals', 'Jewelry', 'Incense', 'Talismans']) {
    assert.match(routeSource, new RegExp(category));
  }
});

test('interactive shop renders the server supplied heading in its hero', () => {
  assert.match(clientSource, /seoHero/);
  assert.match(clientSource, /\{seoHero\}/);
});

test('shop metadata keeps localized canonical alternates and public shopping intent', () => {
  assert.match(layoutSource, /Lifestyle Shop: Crystals, Jewelry & Incense/);
  assert.match(layoutSource, /\$\{base\}\/en\/shop/);
  assert.match(layoutSource, /\$\{base\}\/zh\/shop/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/seo/shopCollectionPage.test.ts`

Expected: FAIL because the server route does not yet provide `CollectionPage` data and the interactive route has no `seoHero` interface.

- [ ] **Step 3: Commit the red test**

```bash
git add frontend/src/lib/seo/shopCollectionPage.test.ts
git commit -m "test: cover crawlable shop collection context"
```

### Task 2: Separate the interactive shop client from the server route

**Files:**
- Create: `frontend/src/app/[locale]/shop/ShopClient.tsx`
- Modify: `frontend/src/app/[locale]/shop/page.tsx`
- Test: `frontend/src/lib/seo/shopCollectionPage.test.ts`

**Interfaces:**
- Consumes: `ShopClient({ seoHero }: { seoHero: React.ReactNode })` from the server route.
- Produces: an interactive client component that renders `{seoHero}` in the existing hero heading position and retains all existing product behavior.

- [ ] **Step 1: Move the current client implementation**

Move the current `page.tsx` implementation to `ShopClient.tsx`, preserve its `'use client'` directive and exports, rename its default component to `ShopClient`, and accept this prop:

```ts
type ShopClientProps = {
  seoHero: React.ReactNode;
};
```

- [ ] **Step 2: Render the supplied heading inside the existing animated heading wrapper**

Replace the client-created H1 with the supplied server node while preserving the existing hero styles:

```tsx
<div className={cn('mb-5 text-4xl font-bold tracking-tight md:text-6xl', visible && 'animate-in fade-in slide-in-from-bottom-3 duration-700')}>
  {seoHero}
</div>
```

- [ ] **Step 3: Run the focused test to verify it remains red for the missing server route**

Run: `node --test src/lib/seo/shopCollectionPage.test.ts`

Expected: first test still fails because the server wrapper has not been implemented; second test passes.

### Task 3: Add server-rendered collection context, metadata, and JSON-LD

**Files:**
- Modify: `frontend/src/app/[locale]/shop/page.tsx`
- Modify: `frontend/src/app/[locale]/shop/layout.tsx`
- Test: `frontend/src/lib/seo/shopCollectionPage.test.ts`

**Interfaces:**
- Consumes: `ShopClient` from `./ShopClient`, `safeJsonLd` from `@/utils/safeJsonLd`, route locale parameters.
- Produces: a server route with a localized hero heading, category labels, and one `CollectionPage` schema graph with four `ListItem` values; the sibling layout retains `generateMetadata`.

- [ ] **Step 1: Implement the minimal server wrapper**

Use a server route which resolves `params.locale`, builds the localized shop URL, and passes this visible heading to `ShopClient`:

```tsx
<h1>
  {locale === 'zh'
    ? '与当前状态相匹配的生活方式物件'
    : 'Lifestyle objects matched to your current state'}
</h1>
```

Place the localized category labels `Crystals`, `Jewelry`, `Incense`, and `Talismans` in the header and in the JSON-LD `ItemList`. Emit the JSON with:

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }} />
```

- [ ] **Step 2: Update metadata without changing URL alternates**

For English, set the title to `Lifestyle Shop: Crystals, Jewelry & Incense | Inner Atlas AI` and give the page a factual description of browsing lifestyle objects and using an Inner Atlas profile for personalized ordering. Keep the existing locale canonical and alternate URL pattern.

- [ ] **Step 3: Run the focused test to verify it passes**

Run: `node --test src/lib/seo/shopCollectionPage.test.ts`

Expected: PASS with two tests, proving the server source declares collection context and the client consumes it.

- [ ] **Step 4: Commit the feature**

```bash
git add frontend/src/app/[locale]/shop/page.tsx frontend/src/app/[locale]/shop/ShopClient.tsx frontend/src/lib/seo/shopCollectionPage.test.ts
git commit -m "feat: add crawlable shop collection context"
```

### Task 4: Verify the localized route and release safely

**Files:**
- Verify: `frontend/src/app/[locale]/shop/page.tsx`
- Verify: `frontend/src/app/[locale]/shop/ShopClient.tsx`
- Verify: `frontend/src/lib/seo/shopCollectionPage.test.ts`

**Interfaces:**
- Consumes: the completed route, client component, and source tests.
- Produces: evidence that static checks, production build, and live server HTML expose the expected crawlable content.

- [ ] **Step 1: Run the focused and related SEO tests**

Run:

```bash
node --test src/lib/seo/shopCollectionPage.test.ts src/lib/seo/aiSearchPageContent.test.ts
```

Expected: PASS with zero failures.

- [ ] **Step 2: Run static and production checks**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: each command exits 0.

- [ ] **Step 3: Deploy using the established server release procedure**

Upload the changed source, build `/opt/OmniFate/frontend` with its production environment, and restart only the PM2 `frontend` process after a successful build.

- [ ] **Step 4: Verify public HTML without a browser gzip decoding artifact**

Run a Python subprocess with `curl.exe -sS --compressed https://www.khanfate.com/en/shop`, decode stdout as UTF-8, and assert the body includes the English H1, `CollectionPage`, `Crystals`, `Jewelry`, `Incense`, and `Talismans`. Also check `/zh/shop`, PM2 frontend/backend status, and free disk space.

## Self-review

- Spec coverage: Task 1 adds regression protection; Tasks 2-3 introduce the server/client boundary, factual copy, metadata, and bounded schema; Task 4 verifies source, build, deployment, and public HTML.
- Placeholder scan: no TODO or deferred implementation instructions remain; each command and expected behavior is explicit.
- Type consistency: `ShopClientProps` uses `seoHero: React.ReactNode` in both the client and the server invocation; all category names are the same four values used by tests and schema.
