# Shop Image Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Reduce initial and repeat-visit product image transfer on the storefront without reducing visible image quality.

**Architecture:** Product images will use Next.js's optimizer at their rendered size instead of bypassing it with original WebP files. The recommendation shelf will mark only its first three images as high priority; all catalog and secondary uses retain lazy loading. Static product assets will be excluded from the no-store HTML policy and receive immutable cache headers.

**Tech Stack:** Next.js 15 Image optimizer, sharp, React/TypeScript, Cloudflare/Nginx static caching.

## Global Constraints

- Keep existing product URLs and product data unchanged.
- Keep product images accessible with meaningful `alt` text.
- Do not make checkout or payment changes.
- Verify both the optimized image endpoint and direct product-asset cache headers after deployment.

---

### Task 1: Define and test rendered image loading policy

**Files:**
- Create: `frontend/src/components/shop/productImagePolicy.test.ts`
- Create: `frontend/src/components/shop/productImagePolicy.ts`
- Modify: `frontend/src/components/shop/ProductImage.tsx`

**Interfaces:**
- Produces `getProductImagePolicy(size, priority)` from a framework-free module, returning the `sizes` and loading strategy used by `ProductImage`.
- Consumes `size: "sm" | "md" | "lg"` and `priority?: boolean` from all current `ProductImage` callers.

- [ ] Write a failing test that expects the 64px card size to request a 64px source and a priority image to be eager.

```ts
assert.deepEqual(getProductImagePolicy("sm", true), { sizes: "64px", loading: "eager" })
```

- [ ] Run `node --experimental-strip-types --test src/components/shop/productImagePolicy.test.ts` and confirm it fails because the helper does not exist.
- [ ] Add the helper, pass its `sizes` value to `next/image`, remove `unoptimized`, and keep non-priority images lazy.
- [ ] Re-run the same test and confirm it passes.

### Task 2: Prioritize the storefront shelf and cache product assets

**Files:**
- Modify: `frontend/src/components/shop/AIRecommendHero.tsx`
- Modify: `frontend/next.config.js`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`

**Interfaces:**
- Consumes `priority?: boolean` from `ProductImage`.
- Uses `sharp` as the production image optimizer implementation.

- [ ] Pass `priority={index < 3}` to the recommendation shelf image component.
- [ ] Add `sharp` as a production dependency.
- [ ] Add a `/products/(.*)` immutable cache rule and exclude `/products/` from the no-store HTML route rule.
- [ ] Run `npx tsc --noEmit`, `npm run lint`, the image-policy test, and `npm run build`.

### Task 3: Deploy and measure the production result

**Files:**
- Modify: none

- [ ] Copy the optimized frontend source and lockfile to the server with a timestamped backup.
- [ ] Run the production frontend build, synchronize `.next/static` into `.next/standalone`, and restart only the frontend PM2 process.
- [ ] Verify a shop page returns 200, an optimized `/_next/image?...&w=64` response is WebP/AVIF, product assets return immutable cache headers, and both PM2 processes are online.
