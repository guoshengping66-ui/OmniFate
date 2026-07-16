# AI Search GEO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Inner Atlas AI public content discoverable, accurately attributable, and safely citable by AI search engines.

**Architecture:** Small SEO modules declare crawler access, discovery text, and shared entities. A typed English reference source drives both server-rendered page content and Schema.org JSON-LD.

**Tech Stack:** Next.js 15, TypeScript, node:test, Schema.org JSON-LD, next-intl.

## Global Constraints

- Use `Inner Atlas AI` as the only organization and publisher name in touched public metadata.
- Keep `/account`, `/checkout`, `/readings`, and `/api/` uncrawlable.
- Allow search/citation crawlers, block GPTBot, and never fabricate ratings, affiliations, social profiles, addresses, or guarantees.
- Index only `/en/ai-search`; `/zh/ai-search` uses the English canonical and `noindex, follow`.

## File Structure

- `frontend/src/lib/seo/crawlerPolicy.ts`, `siteDiscovery.ts`: crawler and llms policy.
- `frontend/src/lib/seo/structuredData.ts`: shared Inner Atlas AI entity helpers.
- `frontend/src/data/seo/aiSearchReference.ts`: visible methods, links, FAQ, and boundaries.
- `frontend/src/lib/seo/aiSearchReference.ts`: matching `WebPage`, `ItemList`, FAQ JSON-LD builders.
- `frontend/src/app/[locale]/ai-search/{layout,page}.tsx`: reference route.
- `frontend/src/app/sitemap.ts`: English-only reference route.

### Task 1: Search crawler policy and discovery document

**Files:** modify `crawlerPolicy.ts`, `crawlerPolicy.test.ts`, `siteDiscovery.ts`, `siteDiscovery.test.ts`.

- [ ] Write a failing test that expects `AI_SEARCH_CRAWLERS` to equal `["OAI-SearchBot", "OAI-AdsBot", "PerplexityBot", "ClaudeBot"]`, `GPTBot` to be in training crawlers, and the Perplexity search rule to retain `PRIVATE_DISALLOW_PATHS`.
- [ ] Run `npx tsx src/lib/seo/crawlerPolicy.test.ts`; expect failure because the new user agents are absent.
- [ ] Add the four search crawlers to `AI_SEARCH_CRAWLERS`; preserve the existing Google/Bing/Yandex public allow list and private disallow list.
- [ ] Write a failing `siteDiscovery.test.ts` assertion for `AI Search Reference: https://www.khanfate.com/en/ai-search`, the brand name, and the no-guarantees boundary.
- [ ] Run `npx tsx src/lib/seo/siteDiscovery.test.ts`; expect failure because the reference URL is absent.
- [ ] Add the English reference URL, canonical citation instruction, real public links, and safety boundary to `createLlmsTxt()`.
- [ ] Run `npx tsx src/lib/seo/crawlerPolicy.test.ts src/lib/seo/siteDiscovery.test.ts`; expect all tests pass.
- [ ] Commit with `git add frontend/src/lib/seo/crawlerPolicy.ts frontend/src/lib/seo/crawlerPolicy.test.ts frontend/src/lib/seo/siteDiscovery.ts frontend/src/lib/seo/siteDiscovery.test.ts; git commit -m "feat: allow AI search discovery crawlers"`.

### Task 2: Shared Inner Atlas AI schema

**Files:** modify `structuredData.ts`, `structuredData.test.ts`, `[locale]/layout.tsx`, `[locale]/about/page.tsx`, and `editorialArticle.ts`.

**Interfaces:** add `createPublisherJsonLd()` and `createWebApplicationJsonLd(locale: SeoLocale)`.

- [ ] Write a failing test verifying `createOrganizationJsonLd().name`, `createPublisherJsonLd().name`, and `createWebApplicationJsonLd("en").author.name` are all `Inner Atlas AI`.
- [ ] Run `npx tsx src/lib/seo/structuredData.test.ts`; expect missing helper failure.
- [ ] Implement `createPublisherJsonLd()` returning only `@type`, name, URL, and logo; implement `createWebApplicationJsonLd()` with a truthful description and that author object.
- [ ] Replace duplicated WebApplication and Organization literals in the locale layout and About page; remove the legacy About `sameAs` link; use the publisher helper in article schemas.
- [ ] Run `npx tsx src/lib/seo/structuredData.test.ts src/lib/seo/editorialArticle.test.ts`; expect all tests pass.
- [ ] Commit with `git add frontend/src/lib/seo/structuredData.ts frontend/src/lib/seo/structuredData.test.ts frontend/src/lib/seo/editorialArticle.ts frontend/src/app/[locale]/layout.tsx frontend/src/app/[locale]/about/page.tsx; git commit -m "feat: unify public GEO organization schema"`.

### Task 3: Reference data and JSON-LD

**Files:** create `data/seo/aiSearchReference.ts`, `data/seo/aiSearchReference.test.ts`, `lib/seo/aiSearchReference.ts`, and `lib/seo/aiSearchReference.test.ts`.

**Interfaces:** `AI_SEARCH_REFERENCE` contains five methods, canonical public links, 3–5 FAQ answers, and limitations. `createAiSearchReferenceJsonLd()` returns `[WebPage, ItemList, FAQPage]`.

- [ ] Write a failing content test requiring method ids `bazi`, `astrology`, `tarot`, `face-reading`, `palm-reading`; English `/en/` links; at least three FAQ entries; and the exact non-medical/legal/financial/no-guarantee boundary.
- [ ] Run `npx tsx src/data/seo/aiSearchReference.test.ts`; expect module-not-found failure.
- [ ] Add concise, non-predictive method explanations, only real public links, the FAQ, and the visible limitations text.
- [ ] Write a failing schema test requiring types `WebPage`, `ItemList`, `FAQPage`, Inner Atlas AI as publisher, and a FAQ schema count matching visible FAQ data.
- [ ] Implement the JSON-LD builder with `/en/ai-search`, `createPublisherJsonLd()`, method links as `ItemList`, and the same FAQ collection as `FAQPage`.
- [ ] Run both new test files; expect all pass, then commit with message `feat: add AI-search reference data`.

### Task 4: English reference route and sitemap

**Files:** create `[locale]/ai-search/layout.tsx`, `[locale]/ai-search/page.tsx`, `[locale]/ai-search/route.test.ts`, and `app/sitemap.test.ts`; modify `app/sitemap.ts`.

- [ ] Write a failing route test: English canonical must be `https://www.khanfate.com/en/ai-search`; Chinese robots must equal `{ index: false, follow: true }`.
- [ ] Run `npx tsx src/app/[locale]/ai-search/route.test.ts`; expect module-not-found failure.
- [ ] Create a server layout that emits English title/description, English plus x-default alternates, and the three JSON-LD objects; for Chinese, emit English canonical plus `noindex, follow`.
- [ ] Create a semantic page that visibly renders every typed method, public link, FAQ answer, and limitation; no content may exist only in JSON-LD.
- [ ] Write a failing sitemap test that requires `/en/ai-search` and forbids `/zh/ai-search`.
- [ ] Add exactly one `progEntry("/en/ai-search", 0.8, "monthly")` outside locale-mapped sitemap lists.
- [ ] Run route and sitemap tests; expect all pass, then commit with message `feat: publish AI-search GEO reference page`.

### Task 5: Verification and deployment

- [ ] Run `$tests = rg --files -g "*.test.ts" src; npx tsx --test $tests; npx tsc --noEmit; npm run lint; npm run build` from `frontend`; expect zero failures and a successful build.
- [ ] Upload only changed GEO source files, build on the server, sync standalone static/public/manifest assets, then run `pm2 startOrRestart /opt/OmniFate/ecosystem.config.js --only frontend --update-env; pm2 save`.
- [ ] Verify public 200 responses for `/robots.txt`, `/llms.txt`, `/en/ai-search`, and `/sitemap.xml`; verify search crawlers are allowed, GPTBot is blocked, the page contains Organization/WebPage/ItemList/FAQPage schemas, Chinese is noindex, and both PM2 processes are online.

## Plan Self-Review

- Tasks 1–4 cover crawler policy, discovery, entity identity, reference content, JSON-LD, locale indexing, and sitemap requirements; Task 5 verifies local and production behavior.
- Each behavior change starts with a failing test and uses source data shared between visible content and JSON-LD.
