# Conversion Clarity and GEO Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clarify the homepage conversion hierarchy, make navigation easier to scan, migrate linting to ESLint CLI, and record the external ClaudeBot blocker.

**Architecture:** The homepage keeps its existing report route and uses localized copy for a small expectation line. The shared navbar owns the desktop disclosure and visual hierarchy. Regression tests inspect the public component contracts and package script without exercising external payment providers.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Node test runner, ESLint 9.

## Global Constraints

- Keep report, account, registration, payment, and Stripe API contracts unchanged.
- Do not create a real Stripe transaction during production validation.
- Preserve application-level private-route crawler exclusions.
- Do not edit Cloudflare credentials or settings from source code.

---

### Task 1: Lock the public conversion hierarchy with a failing test

**Files:**
- Create: `frontend/src/components/marketing-growth/homeConversionContract.test.ts`
- Modify: `frontend/src/components/marketing-growth/EasternHomeExperience.tsx`

**Interfaces:**
- Consumes: public localized copy from `EasternHomeExperience.tsx`.
- Produces: a testable `journeyCue` copy field rendered below `ia-hero-actions`.

- [ ] **Step 1: Write the failing test**

```ts
assert.match(home, /journeyCue:/)
assert.match(home, /className="ia-journey-cue"/)
assert.match(home, /Choose your focus\. Receive your analysis\. Review your next move\./)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/components/marketing-growth/homeConversionContract.test.ts`

Expected: FAIL because `journeyCue` and its rendered element do not exist.

- [ ] **Step 3: Write minimal implementation**

Add `journeyCue` to both locale copy objects and render it immediately after the hero action group with `className="ia-journey-cue"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test src/components/marketing-growth/homeConversionContract.test.ts`

Expected: PASS.

### Task 2: Make the shared navigation hierarchy explicit

**Files:**
- Create: `frontend/src/components/ui/navbarConversionContract.test.ts`
- Modify: `frontend/src/components/ui/Navbar.tsx`

**Interfaces:**
- Consumes: existing `coreLinks`, `extraLinks`, and localization helper `t`.
- Produces: an accessible desktop More disclosure and no unauthenticated `btn-gold` registration link.

- [ ] **Step 1: Write the failing test**

```ts
assert.match(navbar, /More/)
assert.match(navbar, /aria-expanded=\{exploreOpen\}/)
assert.doesNotMatch(navbar, /href=\{localeHref\("\\/register"\)\} className="btn-gold text-sm py-2 px-6"/)
assert.match(navbar, /text-white\/80/)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/components/ui/navbarConversionContract.test.ts`

Expected: FAIL because no desktop More disclosure exists and registration is still gold.

- [ ] **Step 3: Write minimal implementation**

Add `exploreOpen` state, make the desktop disclosure accessible with `aria-expanded`, render `extraLinks` in its menu, increase navigation contrast, and replace the desktop registration button with a quiet text link.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test src/components/ui/navbarConversionContract.test.ts`

Expected: PASS.

### Task 3: Add responsive and trust-copy styling

**Files:**
- Modify: `frontend/src/app/[locale]/globals.css`

**Interfaces:**
- Consumes: `.ia-journey-cue` emitted by Task 1.
- Produces: an expectation line that is readable at desktop and mobile widths without affecting CTA targets.

- [ ] **Step 1: Add the smallest CSS rule set**

```css
.ia-journey-cue { color: rgba(255,255,255,.72); font-size: .78rem; }
```

Include a mobile rule that permits wrapping and preserves the existing hero action layout.

- [ ] **Step 2: Run the homepage contract test**

Run: `npx tsx --test src/components/marketing-growth/homeConversionContract.test.ts`

Expected: PASS.

### Task 4: Migrate lint command with a failing package contract

**Files:**
- Create: `frontend/packageScripts.test.ts`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: installed `eslint` and `eslint.config.mjs`.
- Produces: `npm run lint` invoking `eslint src`.

- [ ] **Step 1: Write the failing test**

```ts
assert.equal(pkg.scripts.lint, "eslint src")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test packageScripts.test.ts`

Expected: FAIL because the script is `next lint`.

- [ ] **Step 3: Write minimal implementation**

Replace only the `lint` script with `eslint src`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test packageScripts.test.ts && npm run lint`

Expected: both commands exit 0.

### Task 5: Verify and deploy

**Files:**
- No source changes.

- [ ] **Step 1: Run targeted regression tests**

Run: `npx tsx --test src/components/marketing-growth/homeConversionContract.test.ts src/components/ui/navbarConversionContract.test.ts packageScripts.test.ts src/lib/checkoutReturn.test.ts src/lib/seo/crawlerPolicy.test.ts src/middleware.test.ts`

Expected: all tests pass.

- [ ] **Step 2: Run type, lint, and build verification**

Run: `npx tsc --noEmit && npm run lint && npm run build`

Expected: exit 0.

- [ ] **Step 3: Deploy the built frontend and verify production**

Deploy using the established standalone Next.js + PM2 procedure. Check `https://www.khanfate.com/en`, verify the expected cue and navigation markers in the response, and verify frontend and backend are online in PM2.

- [ ] **Step 4: Record external action**

Keep Cloudflare’s `ClaudeBot` restriction unchanged without dashboard credentials. Report that allowing Claude requires removing the Cloudflare `User-agent: ClaudeBot / Disallow: /` edge rule.
