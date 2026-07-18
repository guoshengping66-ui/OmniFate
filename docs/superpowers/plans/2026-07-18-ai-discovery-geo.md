# AI Discovery GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public AI reference and machine-readable discovery files accurately expose Inner Atlas AI's supported English topic areas and safe use boundaries.

**Architecture:** Extend the existing `AI_SEARCH_REFERENCE` data model, then derive rendered page content, JSON-LD, `llms.txt`, and sitemap entries from that single canonical source. Keep robots logic as a separate policy module so public accessibility and private-route exclusions remain testable.

**Tech Stack:** Next.js 15, TypeScript, Node test runner, next-intl, JSON-LD.

## Global Constraints

- Public copy must use `Inner Atlas AI` as the sole product identity.
- Do not claim clinical, legal, financial, predictive, ranking, or endorsement outcomes.
- English AI reference remains the canonical public AI-discovery page; Chinese variant remains noindex.
- Private routes remain disallowed for all crawler policies.

---

### Task 1: Define and test the canonical discovery catalog

**Files:**
- Modify: `frontend/src/data/seo/aiSearchReference.ts`
- Test: `frontend/src/lib/seo/aiSearchReference.test.ts`

**Interfaces:**
- Consumes: existing `AI_SEARCH_REFERENCE.methods` array.
- Produces: a unique, canonical method catalog for rendered content and JSON-LD.

- [ ] **Step 1: Write the failing test**

Require seven unique methods with canonical English paths and explicit coverage of astrology, BaZi, Zi Wei Dou Shu, Tarot, Five Elements, face reading, and palm reading.

- [ ] **Step 2: Run the focused test and confirm expected failure**

Run: `npx tsx --test src/lib/seo/aiSearchReference.test.ts`

Expected: failure because the existing catalog omits Zi Wei Dou Shu and Five Elements.

- [ ] **Step 3: Implement the minimum catalog extension**

Add the missing public methods with real first-party URLs and amend FAQ copy to tell users that direction prompts are reflective, not decision-making advice.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npx tsx --test src/lib/seo/aiSearchReference.test.ts`

Expected: pass with no test failures.

### Task 2: Expose canonical discovery information consistently

**Files:**
- Modify: `frontend/src/lib/seo/siteDiscovery.ts`
- Test: `frontend/src/lib/seo/siteDiscovery.test.ts`

**Interfaces:**
- Consumes: canonical URL `/en/ai-search` and supported-method links from Task 1.
- Produces: `llms.txt` that points AI systems to the same reference.

- [ ] **Step 1: Write a failing test**

Require `llms.txt` to name the key content areas while retaining canonical links only.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npx tsx --test src/lib/seo/siteDiscovery.test.ts`

Expected: failure because the discovery file does not enumerate subject areas.

- [ ] **Step 3: Implement the minimum textual addition**

Add a concise “Public topic coverage” section to `llms.txt`; keep all URLs public and canonical.

- [ ] **Step 4: Run the focused test and confirm pass**

Run: `npx tsx --test src/lib/seo/siteDiscovery.test.ts`

Expected: all focused tests pass.

### Task 3: Preserve crawler safety and deploy the effective policy

**Files:**
- Verify: `frontend/src/lib/seo/crawlerPolicy.ts`
- Verify: `frontend/src/lib/seo/crawlerPolicy.test.ts`
- Deploy: current frontend source and build output.

**Interfaces:**
- Consumes: `AI_SEARCH_CRAWLERS`, `PRIVATE_DISALLOW_PATHS`.
- Produces: public crawler access only to public information pages.

- [ ] **Step 1: Verify crawler-policy contract**

Run: `npx tsx --test src/lib/seo/crawlerPolicy.test.ts`

Expected: every configured AI search crawler can access `/en/`, `/zh/`, `/sitemap.xml`, and `/llms.txt`, while localized private pages remain disallowed.

- [ ] **Step 2: Build and deploy**

Run production build, synchronize the current frontend source and standalone artifacts, then restart only the frontend process.

- [ ] **Step 3: Verify production response**

Check HTTP 200 and required strings on `/en/ai-search`, `/llms.txt`, `/sitemap.xml`, and `/robots.txt`; check PM2 and disk space. Report Cloudflare-only crawler blocks separately rather than claiming they were changed.
