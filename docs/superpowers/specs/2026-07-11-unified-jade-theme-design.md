# Unified Jade Theme Design

## Goal

Unify the public product experience around a jade-green and muted-gold visual system, then add an accessible day/night switch that preserves the same brand language across homepage, pricing, login, report creation, and shared navigation.

## Visual System

- Night: obsidian background, deep jade surfaces, teal atmospheric accents, muted-gold actions, ivory text.
- Day: jade-white canvas, pale green surfaces, forest-green text, muted-gold actions, reduced decorative contrast.
- Typography: serif is reserved for editorial/display headings; sans-serif is used for navigation, forms, cards, and data.
- Components: one border treatment, radius scale, shadow scale, primary button, secondary button, input, notice, and card treatment.

## Theme Behavior

- A client-side toggle in the shared navigation offers day and night modes with clear labels and pressed state.
- Without a saved choice, the theme follows `prefers-color-scheme`.
- Explicit choices persist in local storage and are applied to the document root before paint where practical to avoid visible flashing.
- The switch respects keyboard navigation, focus visibility, reduced-motion preferences, and sufficient visible contrast.

## Scope

- Apply token-based styles to the public shared shell, homepage, pricing, login, and report-creation flow.
- Preserve existing URLs, auth, payment, report-generation, form fields, and CTA behavior.
- Do not change backend logic, API contracts, database models, or private dashboard behavior beyond shared theme inheritance.

## Acceptance Criteria

1. Public pages use the same jade/gold token family in both day and night mode.
2. The navigation contains a functional, keyboard-accessible theme switch and remembers the selected preference.
3. Pricing, login, and report creation no longer use visually disconnected full-page blue treatments.
4. Text, inactive steps, breadcrumbs, helper text, and notices retain readable contrast in both modes.
5. Existing CTA and navigation destinations continue to work.
6. Targeted theme tests, the existing homepage asset test, production build, and desktop/mobile screenshots pass before deployment.
