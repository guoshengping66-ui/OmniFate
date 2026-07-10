# Reference-matched homepage hero

## Goal

Rebuild the localized homepage hero at `/en` and `/zh` to match the supplied 1920 x 957 desktop reference. The result must preserve all current navigation, authentication, shopping-cart, routing, reporting, and accessibility behavior. The same hero must remain usable at desktop, tablet, and mobile widths.

## Scope and boundaries

- Modify only the homepage presentation layer: `EasternHomeExperience`, its localized copy where necessary, localized homepage CSS, and new static assets derived from the supplied reference image.
- Keep `Navbar`, `Footer`, route destinations, link query strings, providers, auth redirects, APIs, stores, and backend code behavior unchanged.
- The supplied screenshot is the sole source of new visual material. No external image, icon, template, or generated illustration will be used.
- The screenshot only specifies the first viewport. Homepage sections below the hero remain present and functional; they receive no invented replacement layout.

## Reference layout blueprint

Reference canvas: 1920 x 957 px. Desktop implementation targets 1920 px first, while retaining fluid constraints for other widths.

| Region | Reference bounds | Implementation rule |
| --- | --- | --- |
| Header | x 0-1920, y 0-64 | 64 px dark translucent bar; existing links and controls remain real DOM elements. |
| Hero | x 0-1920, y 64-957 | Minimum height 893 px at 1920 px; near-black green background and a left-to-right vignette. |
| Copy column | x 96-655, y 127-750 | Brand lockup, eyebrow, two-line serif heading, two CTAs, and descriptive copy preserve their current semantic content and routes. |
| Primary visual | x about 700-1900, y 64-957 | Static image crop derived from the right side of the reference; rendered at or below native pixel dimensions and behind interactive content. |
| Report links | x 96-1136, y 799-925 | Three real report links in a single bordered row on desktop; each retains its current destination. |

## Visual system

- Sample colors from the reference: deep navy header (`#030718`-like), hero black-green (`#010806`-like), parchment text, muted gray text, and antique gold emphasis.
- Use a high-contrast serif stack for the hero title and a clean sans-serif stack for navigation and UI. All text stays as DOM rather than baked into an image.
- Create a tracked manifest and a right-side hero image crop under `frontend/public/assets/reference-style/`. The crop is decorative (`alt=""`, `aria-hidden`) and never blocks controls.
- Remove or suppress the prior homepage-only star/cosmic decorations where they would duplicate the reference crop. The crop sits beneath all links, popovers, menus, toasts, and drawers.

## Responsive behavior

- Desktop (>= 1200 px): retain the measured two-column composition, 96 px left gutter, 64 px header, and three-column report row.
- Tablet (768-1199 px): preserve both columns but reduce the crop opacity and size before text begins to collide; the report links become an equal three-column row or a two-plus-one grid as needed.
- Mobile (< 768 px): keep the navigation entry point, stack the content in source order, position the decorative crop above/right of copy with a stronger gradient, and stack report links without clipping. CTAs remain at least touch-friendly height and continue to navigate to the same targets.
- Respect `prefers-reduced-motion`; decorative movement is disabled and no new attention-grabbing animation is introduced.

## Clarity constraint

The supplied artwork is the maximum available source resolution. To make the result clearer without inventing a new asset, it will be used at native or smaller display size, cropped cleanly, and overlaid only with CSS gradients. Text, button labels, borders, and icons remain vector/DOM UI so they are sharper than image text at all device pixel ratios.

## Verification

1. Build/type-check the frontend using available project commands.
2. Capture the homepage at 1920 px and compare header, hero proportions, text wrapping, CTA placement, primary visual bounds, and report-link row against the reference.
3. Check 1200 px, 1024 px, 768 px, and 390 px layouts for clipping, overlap, horizontal scrolling, and obscured controls.
4. Verify both localized routes, hero CTAs, a primary navigation link, and the mobile navigation control.
5. Confirm the served asset URL returns an image content type, not an HTML fallback, and inspect browser console errors.

## Non-goals

- No backend, auth, payment, state, or routing change.
- No full-page visual redesign beyond what the supplied first-viewport reference defines.
- No upscaling, external sourcing, or AI generation of replacement artwork.
