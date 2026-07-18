# AI Citation Answers GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give answer engines stable, truthful, public English answers they can cite for Inner Atlas AI's core methods and use boundaries.

**Architecture:** Extend the shared AI-reference catalog with a small set of anchored citation answers. Render that data visibly on the canonical English reference page and derive an `ItemList` graph plus `llms.txt` anchors from the same source, so page text and machine-readable discovery never diverge.

**Tech Stack:** Next.js 15 App Router, TypeScript, Node test runner, Schema.org JSON-LD.

## Global Constraints

- Public copy names `Inner Atlas AI` as the sole product identity.
- Do not promise prediction, professional advice, rankings, endorsements, or AI recommendations.
- Every promoted URL must be public, canonical, English, and indexable.
- GPTBot stays disallowed; Cloudflare edge crawler configuration is external to this code change.

---

### Task 1: Create the shared citation-answer contract

**Files:**
- Modify: `frontend/src/data/seo/aiSearchReference.ts`
- Test: `frontend/src/data/seo/aiSearchReference.test.ts`

**Interfaces:**
- Produces: `AI_SEARCH_REFERENCE.citationAnswers`, with `id`, `question`, `answer`, and a canonical public `href`.

- [ ] **Step 1: Write the failing test**

Require exactly the Bazi, Tarot, Five Elements, and responsible-use answer IDs; require unique public English links and an explicit non-professional-advice boundary.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npx tsx --test src/data/seo/aiSearchReference.test.ts`

Expected: FAIL because `citationAnswers` does not exist.

- [ ] **Step 3: Implement the minimal shared catalog**

Add four concise answers with stable lowercase IDs, visible question wording, factual scope, and first-party canonical links.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npx tsx --test src/data/seo/aiSearchReference.test.ts`

Expected: PASS.

### Task 2: Render and describe the citation answers

**Files:**
- Modify: `frontend/src/app/[locale]/ai-search/page.tsx`
- Modify: `frontend/src/lib/seo/aiSearchReference.ts`
- Test: `frontend/src/app/[locale]/ai-search/page.test.tsx`
- Test: `frontend/src/lib/seo/aiSearchReference.test.ts`

**Interfaces:**
- Consumes: `AI_SEARCH_REFERENCE.citationAnswers`.
- Produces: visible `#citation-answers` entries and a matching JSON-LD `ItemList`.

- [ ] **Step 1: Write failing tests**

Require the page to map `citationAnswers` beneath a named citation-answer section and require JSON-LD item URLs to end in the same `#answer-id` anchors.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx tsx --test src/app/[locale]/ai-search/page.test.tsx src/lib/seo/aiSearchReference.test.ts`

Expected: FAIL because no citation section or answer `ItemList` exists.

- [ ] **Step 3: Implement the minimal visible section and matching graph**

Render each answer as an `h3` with its stable `id`, answer text, and labelled public source link. Add one `ItemList` to the JSON-LD output whose entries use the matching canonical anchors.

- [ ] **Step 4: Run focused tests and confirm pass**

Run: `npx tsx --test src/app/[locale]/ai-search/page.test.tsx src/lib/seo/aiSearchReference.test.ts`

Expected: PASS.

### Task 3: Make the machine-readable discovery file point to stable answers

**Files:**
- Modify: `frontend/src/lib/seo/siteDiscovery.ts`
- Test: `frontend/src/lib/seo/siteDiscovery.test.ts`

**Interfaces:**
- Consumes: canonical `/en/ai-search#citation-answers` URL.
- Produces: `llms.txt` discovery text that points to answer anchors without exposing private or transactional paths.

- [ ] **Step 1: Write the failing test**

Require `llms.txt` to link to `/en/ai-search#citation-answers` and retain the important non-professional-advice boundary.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npx tsx --test src/lib/seo/siteDiscovery.test.ts`

Expected: FAIL because the stable citation section is absent.

- [ ] **Step 3: Implement the minimal discovery addition**

Add the canonical citation-answer URL to the entry points and say it is the preferred source for concise service and method scope.

- [ ] **Step 4: Run the focused test and confirm pass**

Run: `npx tsx --test src/lib/seo/siteDiscovery.test.ts`

Expected: PASS.

### Task 4: Verify, deploy, and validate production

**Files:**
- Verify: all files above.

- [ ] **Step 1: Run all source tests, lint, type-check, and production build**

Run: `npx tsx --test $(Get-ChildItem -Recurse -Filter '*.test.ts*' src | ForEach-Object FullName)`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` from `frontend`.

- [ ] **Step 2: Deploy the verified build to `/opt/OmniFate/frontend`**

Synchronize standalone artifacts, static files, and public files, then restart only PM2 `frontend`.

- [ ] **Step 3: Validate the public contract**

Confirm HTTP 200 for `/en/ai-search` and `/llms.txt`, the four answer anchors and JSON-LD `ItemList` in rendered HTML, public sitemap inclusion, online PM2 health, and available disk space. Test AI crawler user agents separately and report Cloudflare's external 403 truthfully.

## Self-Review

- Spec coverage: Tasks 1-3 keep one shared answer source across visible text, structured data, and `llms.txt`; Task 4 validates source and production.
- Placeholder scan: No implementation placeholder remains; every planned behavior and command is named.
- Type consistency: `citationAnswers` is introduced once in Task 1 and consumed unchanged in Tasks 2-3.
