# Unified Jade Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a persistent day/night theme and one coherent jade-green/gold visual system across the public website.

**Architecture:** A document-level `data-theme` attribute holds the resolved mode. A synchronous root script resolves saved or system preference before hydration; a small client hook owns user toggling, persistence, keyboard semantics, and media-query fallback. CSS variables supply the shared colour and surface system, so targeted public pages can inherit the system without changing business components.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS custom properties, Node `node:test`.

## Global Constraints

- Preserve all existing routes, auth, payment, report-generation, forms, and CTA handlers.
- Default to system preference; persist explicit user choice in `localStorage` key `inner-atlas-theme`.
- Support `day` and `night` modes with `data-theme` on `document.documentElement`.
- Use jade/green, muted gold, ivory, and ink tokens; do not introduce a separate blue product theme.
- Theme UI must use a real button with an accessible label, pressed state, keyboard focus, and non-disruptive motion.
- Do not touch unrelated dirty working-tree files.

---

### Task 1: Theme state, no-flash bootstrap, and accessible navigation control

**Files:**
- Create: `frontend/src/components/ui/ThemeToggle.tsx`
- Modify: `frontend/src/app/[locale]/layout.tsx`
- Modify: `frontend/src/components/ui/Navbar.tsx`
- Create: `frontend/scripts/unified-theme.test.mjs`

**Interfaces:**
- `ThemeToggle` owns the `day | night` user preference and writes it to `inner-atlas-theme`.
- The layout bootstrap reads that same key, falls back to `matchMedia('(prefers-color-scheme: dark)')`, and sets `document.documentElement.dataset.theme`.

- [ ] **Step 1: Write failing tests**

Create `unified-theme.test.mjs` asserting that the layout contains `inner-atlas-theme`, `document.documentElement.dataset.theme`, and `prefers-color-scheme`; the toggle contains a real `button`, `aria-label`, `aria-pressed`, and both `day` and `night` values; and Navbar renders `<ThemeToggle />`.

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test scripts/unified-theme.test.mjs` from `frontend/`.

Expected: failure because the theme toggle module and bootstrap do not exist.

- [ ] **Step 3: Implement the smallest complete theme control**

Create a client component that resolves initial state after mount, updates `document.documentElement.dataset.theme`, stores explicit choices, reflects `aria-pressed` for night mode, and uses `Sun`/`Moon` icons. Add a pre-hydration bootstrap script to the locale layout. Render the toggle in desktop and mobile Navbar control groups.

- [ ] **Step 4: Re-run the targeted test**

Run: `node --test scripts/unified-theme.test.mjs`.

Expected: all theme assertions pass.

- [ ] **Step 5: Commit task one**

Stage only these four files and commit: `feat: add persistent day night theme control`.

### Task 2: Tokenize public-page visuals and migrate the audited screens

**Files:**
- Modify: `frontend/src/app/[locale]/globals.css`
- Modify: `frontend/src/app/[locale]/pricing/page.tsx`
- Modify: `frontend/src/app/[locale]/login/page.tsx`
- Modify: `frontend/src/app/[locale]/reading/new/page.tsx`
- Modify: `frontend/scripts/unified-theme.test.mjs`

**Interfaces:**
- CSS exposes shared `--ia-*` tokens under `:root`, `[data-theme="night"]`, and `[data-theme="day"]`.
- Public route wrappers use the shared token classes rather than page-specific blue hex backgrounds.

- [ ] **Step 1: Extend the test with failing token and route assertions**

Require CSS selectors for `[data-theme="day"]` and `[data-theme="night"]`, jade surface tokens, visible focus treatment, and reduced-motion support. Require pricing, login, and reading-new source to include the public-theme wrapper class.

- [ ] **Step 2: Run theme and existing hero tests; observe expected failure**

Run: `node --test scripts/unified-theme.test.mjs scripts/reference-hero.test.mjs` from `frontend/`.

Expected: theme-token and route-wrapper assertions fail before migration.

- [ ] **Step 3: Apply the unified visual system**

Define the shared tokens and component overrides in `globals.css`; give audited route roots the common `ia-public-page` wrapper; replace full-page blue-only surfaces and low-contrast helper text with tokenized card, notice, form, and step styles. Preserve all existing component props, event handlers, and routes.

- [ ] **Step 4: Verify code-level regressions**

Run: `node --test scripts/unified-theme.test.mjs scripts/reference-hero.test.mjs`.

Expected: all tests pass.

- [ ] **Step 5: Build and visually inspect both themes**

Run: `npm run build` from `frontend/`. Capture desktop and 390px viewport screenshots of `/en`, `/en/pricing`, `/en/login`, and `/en/reading/new` in both modes. Verify toggle state persists after reload and no clipped navigation, CTA, text, or form controls appear.

- [ ] **Step 6: Commit task two**

Stage only the route, CSS, and test files; commit: `style: unify public pages with jade theme`.

### Task 3: Integrate, publish, and validate the exact build

**Files:**
- No source files required.

- [ ] **Step 1: Merge reviewed task commits into `codex/guanwo-reference-hero`**

Use fast-forward integration only; preserve unrelated user changes.

- [ ] **Step 2: Publish the exact commit**

Push the deployment branch when GitHub is reachable. Otherwise upload a verified Git bundle to the server and build it in an isolated release worktree.

- [ ] **Step 3: Verify production**

Confirm PM2 frontend is online; public `/en`, `/en/pricing`, `/en/login`, and `/en/reading/new` each return HTTP 200; theme control is present in public HTML; the released asset/build matches the commit.
