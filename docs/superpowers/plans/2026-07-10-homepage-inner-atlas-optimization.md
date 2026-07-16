# Homepage Inner Atlas Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the homepage into an overseas-ready AI life report landing page with a clean Inner Atlas AI brand, cinematic eastern-cosmic hero, clearer conversion path, and responsive mobile behavior.

**Architecture:** Keep the current Next.js marketing entry component and restyle it rather than rebuilding routing. Use a clean WebP hero visual asset for the complex starfield/mountain/astrolabe image, then layer real DOM copy, buttons, navigation, and motion overlays over it. Keep report preview, answers, method, daily action, growth map, and lifestyle modules in one focused homepage component for now.

**Tech Stack:** Next.js App Router, React, CSS in `frontend/src/app/[locale]/globals.css`, static assets in `frontend/public/brand`, Lucide icons.

## Global Constraints

- English homepage primary brand is `Inner Atlas AI`; `Guanwo` appears only as a secondary origin marker.
- Chinese homepage keeps `观我`, positioned as an `AI 人生报告系统`.
- Hero buttons and entry CTAs must route to `/reading/new?intent=full`, `/reading/new?intent=relationship`, `/divination`, and `/shop` without 404s.
- Hero visual asset must not contain baked-in left-side text or buttons.
- Mobile must show readable real text and CTA before oversized visual detail.
- Avoid high-risk wording: guaranteed results, fortune promises, change fate, luck claims, 招财, 改运, 转运, 灵验.
- Keep first-screen media lightweight; use WebP and avoid video.

---

### Task 1: Clean Hero Visual Asset

**Files:**
- Create: `frontend/public/brand/inner-atlas-hero-visual.webp`

**Interfaces:**
- Produces: a 1600x1000 WebP visual used by `.gw-atlas-hero-visual-img`.

- [ ] Generate a clean right-side starfield, mountain, and astrolabe visual from the approved image reference.
- [ ] Remove or mask all baked-in text, nav, and buttons from the asset.
- [ ] Compress to WebP and keep the asset suitable for the first viewport.
- [ ] Visually inspect the final asset.

### Task 2: Rebuild Homepage Content Structure

**Files:**
- Modify: `frontend/src/components/marketing-growth/EasternHomeExperience.tsx`

**Interfaces:**
- Consumes: `useLanguage().localeHref`.
- Produces: a homepage with sections `#sample-report`, `#answers`, `#how-it-works`, `#daily-action`, `#growth-map`, `#vault`.

- [ ] Replace old Guanwo-first hero copy with Inner Atlas AI / Guanwo localized copy.
- [ ] Keep all visible copy as real DOM text, not baked into images.
- [ ] Put report preview immediately after hero.
- [ ] Add concise answer cards, method steps, daily action, growth map, and lifestyle vault sections.
- [ ] Ensure all CTAs use valid localized routes.

### Task 3: Redesign Homepage CSS And Motion

**Files:**
- Modify: `frontend/src/app/[locale]/globals.css`

**Interfaces:**
- Consumes classes rendered by `EasternHomeExperience.tsx`.
- Produces responsive layout, cinematic hero, real motion overlays, and mobile-specific stacking.

- [ ] Add the Inner Atlas hero shell, visual image placement, starfield, orbit, and glow animations.
- [ ] Remove or supersede old image-to-code hero styles for this component.
- [ ] Style report preview, answer grid, method steps, daily action, growth map, and vault modules without dashboard card clutter.
- [ ] Add mobile breakpoints so text and CTA stay readable and visual crops correctly.
- [ ] Respect `prefers-reduced-motion`.

### Task 4: Verify, Commit, And Report

**Files:**
- Test: production build
- Test: local HTTP route checks
- Test: browser visual checks

- [ ] Run `npm run build` in `frontend`.
- [ ] Start local production preview and check `/zh`, `/en`, `/zh/reading/new?intent=full`, and `/zh/reading/new?intent=relationship`.
- [ ] Check homepage links for 404s.
- [ ] Capture desktop and mobile screenshots.
- [ ] Commit and push the branch.
