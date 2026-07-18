# SEO Index Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove known blog soft-404 and legacy-URL SEO failures without creating speculative content.

**Architecture:** Middleware owns permanent redirects before locale routing. The server blog-article layout owns real not-found behavior and metadata. The blog-index layout owns collection metadata.

**Tech Stack:** Next.js 15, TypeScript, Node test runner, next-intl.

## Global Constraints

- Preserve locale when a legacy URL already includes one; default unprefixed legacy articles to English.
- Return 301 only for known historical equivalents.
- Unknown content must return a real 404, never a generic indexable page.
- Do not add claims of prediction, credentials, outcomes, or professional advice.

---

### Task 1: Test and add legacy article redirects

**Files:**
- Modify: `frontend/src/middleware.test.ts`
- Modify: `frontend/src/middleware.ts`

- [ ] Write a failing test that requests `/en/blog/tarot-major` and `/blog/tarot-major` and asserts a 301 location ending in the retained article URL.
- [ ] Run `npx tsx --test src/middleware.test.ts` and confirm the redirects are absent.
- [ ] Add the single verified redirect mapping and preserve private-route behavior.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Test and restore real article not-found responses

**Files:**
- Modify: `frontend/src/lib/seo/blogIndexRecovery.test.ts`
- Modify: `frontend/src/app/[locale]/blog/[id]/page.tsx`
- Rename: `frontend/src/app/[locale]/blog/[id]/page.tsx` to `frontend/src/app/[locale]/blog/[id]/BlogArticleClient.tsx`

- [ ] Write a failing test requiring `generateMetadata` for an unknown article to reject with the Next.js 404 signal.
- [ ] Run the focused test and confirm the current generic metadata fails the contract.
- [ ] Call `notFound()` for unknown article IDs in the server route before the client article component renders.
- [ ] Re-run the focused test and confirm it passes.

### Task 3: Make collection metadata describe actual public topics

**Files:**
- Create: `frontend/src/app/[locale]/blog/layout.test.ts`
- Modify: `frontend/src/app/[locale]/blog/layout.tsx`

- [ ] Write a failing metadata test for an English title and description that name Bazi, astrology, Tarot, and cultural guides.
- [ ] Run the focused test and confirm it fails.
- [ ] Replace generic legacy wording with truthful topic-focused copy.
- [ ] Run the focused test, then the full suite, lint, type check, and production build.
