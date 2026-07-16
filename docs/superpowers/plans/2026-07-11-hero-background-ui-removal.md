# Hero Background UI Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove copied screenshot UI from the homepage hero background while keeping the approved astrolabe scenery and all real homepage controls.

**Architecture:** Generate a cache-safe decorative PNG exclusively from the approved reference image. Start the source crop below the reference navigation and to the right of its left-side content, then apply a short alpha feather on the crop's left edge for integration with the existing hero gradients. The React component remains unchanged because it already renders the visual as non-interactive decoration.

**Tech Stack:** Next.js 15, React, CSS, Node `node:test`, System.Drawing image processing on Windows.

## Global Constraints

- Use only `8cd1986585bb461278d1a8dc65b23f79.png` as the raster source.
- Preserve existing real navigation, links, CTAs, routes, and business behavior.
- The background must remain `alt=""`, `aria-hidden`, non-draggable, and `pointer-events: none`.
- Do not alter unrelated working-tree changes.

---

### Task 1: Produce and verify a UI-free decorative background

**Files:**
- Create: `frontend/public/assets/reference-style/reference-hero-atlas-background-v2.png`
- Modify: `frontend/public/assets/reference-style/manifest.json`
- Modify: `frontend/scripts/reference-hero.test.mjs`
- Modify: `frontend/src/components/marketing-growth/EasternHomeExperience.tsx`

**Interfaces:**
- Consumes: the approved reference PNG at `C:/Users/23977/xwechat_files/wxid_qtytnbh101il22_f6f5/temp/RWTemp/2026-07/071a80ace0a4b00bbe08a17e1d04133b/8cd1986585bb461278d1a8dc65b23f79.png`.
- Produces: `/assets/reference-style/reference-hero-atlas-background-v2.png`, a decorative 952×660 PNG sourced from `[720, 80, 1672, 740]`.

- [ ] **Step 1: Write the failing regression assertions**

Update `reference-hero.test.mjs` so it requires the new filename, source box, dimensions, and top exclusion:

```js
assert.deepEqual(manifest.assets["hero-visual"].sourceBox, [720, 80, 1672, 740])
assert.deepEqual(dimensions, { width: 952, height: 660 })
assert.equal(
  manifest.assets["hero-visual"].file,
  "/assets/reference-style/reference-hero-atlas-background-v2.png",
)
assert.deepEqual(
  manifest.assets["hero-visual"].excludedSourceBoxes,
  [[720, 0, 1672, 80], [600, 0, 720, 740]],
)
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `node --test scripts/reference-hero.test.mjs` from `frontend/`.

Expected: the existing asset metadata fails the new source box, dimensions, and filename assertions.

- [ ] **Step 3: Generate the cache-safe image and update its manifest/component reference**

Use System.Drawing to crop the specified source rectangle into a 32-bit ARGB PNG. Set alpha from 0 at output x=0 to 255 at x=96, preserving the original image colours; do not copy pixels from outside the source rectangle. Update the manifest source/exclusion boxes and point `EasternHomeExperience.tsx` to the v2 filename with width `952` and height `660`.

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `node --test scripts/reference-hero.test.mjs` from `frontend/`.

Expected: 3 tests pass, 0 fail.

- [ ] **Step 5: Build and visually inspect the homepage**

Run: `npm run build` from `frontend/`. Then capture `/en` at desktop width and inspect it for copied navigation text, a copied language selector, or copied sign-in UI inside the decorative image.

Expected: the build exits 0; the hero still has the actual application navigation and has no rasterized reference UI.

- [ ] **Step 6: Commit and deploy atomically**

Stage only the PNG, manifest, test, and component files; commit with `fix: remove copied UI from hero background`. Build the exact commit in an isolated server release worktree, swap only `.next` and `public/assets/reference-style`, restart `pm2 frontend`, and check both local and public `/en` plus the new asset URL return HTTP 200.
