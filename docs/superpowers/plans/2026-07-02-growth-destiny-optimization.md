# Growth Destiny Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the site from a collection of fortune tools into a five-dimension personal growth chart system with clearer conversion, report value, and retention loops.

**Architecture:** Keep the existing Next.js app structure and update the highest-impact client components. The first phase changes product framing and UX copy only, without changing payment, backend calculation contracts, or database schema.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, lucide-react.

## Global Constraints

- Do not rewrite astrology, Bazi, Ziwei, face, palm, tarot, payment, or account logic in this phase.
- Preserve existing routes and API contracts.
- Keep changes scoped to marketing, reading entry, report presentation, dashboard continuity, and post-analysis conversion.
- Run frontend lint/build verification before claiming completion.

---

### Task 1: Five-Dimension Product Framing

**Files:**
- Modify: `frontend/src/components/destiny/CinematicHero.tsx`
- Modify: `frontend/src/components/destiny/FiveDimensionsOverview.tsx`
- Modify: `frontend/src/components/destiny/GrowthLoopSection.tsx`

**Interfaces:**
- Consumes: existing `useLanguage()`, `localeHref()`, component routes.
- Produces: updated positioning copy and visual proof for five-dimension growth chart.

- [ ] Update hero copy from generic AI destiny profile to five-dimension growth chart.
- [ ] Reframe the five dimensions as talent base, life direction, current blockage, timing, and growth prescription.
- [ ] Reframe retention as daily action and weekly reflection.
- [ ] Verify the pages compile.

### Task 2: Reading Entry Intent Upgrade

**Files:**
- Modify: `frontend/src/app/[locale]/reading/new/page.tsx`

**Interfaces:**
- Consumes: existing wizard state and form submission.
- Produces: an intent-first page header and growth promise without changing form schema.

- [ ] Add a top intro panel that asks what the user is trying to solve.
- [ ] Explain the four-step loop: problem, five-dimension scan, growth route, weekly calibration.
- [ ] Keep existing wizard behavior intact.

### Task 3: Report Value and Action Loop

**Files:**
- Modify: `frontend/src/components/reading/StructuredReport.tsx`
- Modify: `frontend/src/components/reading/ActionCommand.tsx`

**Interfaces:**
- Consumes: existing `StructuredReport` data shape.
- Produces: stronger report framing and a visible 7/30/90 day action loop.

- [ ] Add a report header that positions the output as a growth chart.
- [ ] Add static but useful action loop cards after the dynamic report.
- [ ] Keep report rendering resilient when sections are missing.

### Task 4: Dashboard Continuity

**Files:**
- Modify: `frontend/src/components/dashboard/UserDashboard.tsx`
- Modify: `frontend/src/components/dashboard/IntentButtons.tsx`

**Interfaces:**
- Consumes: existing routes and recent readings API.
- Produces: dashboard messaging that encourages return use and reflection.

- [ ] Add a continuity section for today action, weekly reflection, and next route.
- [ ] Rename intent cards visually toward growth flows while preserving click handlers.

### Task 5: Conversion Reframe

**Files:**
- Modify: `frontend/src/components/reading/PostAnalysisModal.tsx`

**Interfaces:**
- Consumes: existing product recommendation props and cart actions.
- Produces: product recommendations framed as optional growth support.

- [ ] Reword post-analysis modal so products are not the main value.
- [ ] Preserve add-to-cart behavior and dismissal behavior.

### Task 6: Verification, Commit, Deploy

**Files:**
- Check: `frontend/package.json`
- Check: deployment scripts and root package scripts.

**Interfaces:**
- Consumes: npm scripts and git.
- Produces: verified commit and deployment attempt or explicit deployment blocker.

- [ ] Run frontend lint or identify script incompatibility.
- [ ] Run frontend build.
- [ ] Review `git diff`.
- [ ] Commit changes.
- [ ] Deploy using the existing project deployment path if credentials/environment allow it.
