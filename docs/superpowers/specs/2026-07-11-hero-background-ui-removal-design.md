# Hero Background UI Removal Design

## Goal

Keep the homepage hero's decorative astrolabe, stars, nebula, and mountains from the approved reference while removing every copied reference-UI fragment from the raster asset. Existing navigation, CTAs, cards, links, and page behavior remain real application UI.

## Scope

- Target route: `/en` homepage hero.
- Source visual: the user-provided `8cd1986585bb461278d1a8dc65b23f79.png` reference only.
- Modify only the decorative PNG, its manifest metadata, and its regression test.
- Do not change React interaction code, routes, navigation structure, button handlers, or backend behavior.

## Chosen Approach

Create a new cache-safe transparent PNG from the existing approved reference. Its alpha mask removes the entire top reference-navigation band across the asset, plus the remaining left-side screenshot content. The visible pixels begin at the astrolabe and retain only visual scenery. The current `<Image>` remains decorative (`alt=""`, `aria-hidden`, `pointer-events: none`), so the real navbar stays the only actionable header.

## Acceptance Criteria

1. The served background has no copied reference navigation text, language selector, globe, or sign-in control.
2. No copied hero title, CTA, or feature-label fragments remain in the left side of the decorative image.
3. The astrolabe, nebula, and mountain area remain visible and visually continuous.
4. Existing homepage navigation and CTA elements remain functional DOM controls.
5. The manifest documents the source crop and excluded UI regions; an automated test checks the new asset, exclusion metadata, dimensions, and decorative usage.
6. The production build, targeted test, server health check, public `/en`, and public asset URL all succeed before deployment is reported complete.
