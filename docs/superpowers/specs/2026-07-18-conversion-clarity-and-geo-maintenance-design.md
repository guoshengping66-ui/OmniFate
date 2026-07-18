# Conversion Clarity and GEO Maintenance Design

## Goal

Make the public homepage easier to understand and act on without changing the report, registration, or payment contracts; remove a deprecated lint command; and document the remaining external crawler-control action.

## Evidence and decisions

- The public homepage loads, but its desktop header exposes seven navigation links plus language, theme, login, and a visually dominant registration button. The hero already has the intended primary action: starting a report.
- `https://www.khanfate.com/robots.txt` contains a Cloudflare-managed `ClaudeBot` rule with `Disallow: /`. The application policy allows the crawler, so application code cannot override the edge rule.
- `/en/reading/new` returns HTTP 200 and includes the report form. Payment initiation is handled through the existing authenticated Stripe flow; a production payment must not be created merely to test the UI.

## Chosen approach

1. Preserve registration and login, but change registration from a gold primary button to a quiet text link. The hero report action remains the only dominant unauthenticated conversion action.
2. Keep the five task-oriented navigation links visible, move the two lower-priority trust/content links into an accessible desktop “More” disclosure, and increase desktop navigation contrast and target padding.
3. Add a factual, localized three-step expectation line beneath the homepage actions. It describes choosing a focus, receiving an analysis, and reviewing the next action; it makes no time, price, accuracy, or outcome claim.
4. Change `npm run lint` from deprecated `next lint` to the installed ESLint CLI scoped to application source (`eslint src`), so generated Next declarations and CommonJS build configuration are not treated as application lint failures.
5. Add source-level regression tests for the public conversion hierarchy and lint command. Tests intentionally do not attempt to automate Stripe or Cloudflare because doing so would require external credentials and could create paid orders.

## Boundaries

- No changes to report calculation, identity, registration API, billing API, Stripe configuration, price, or checkout behavior.
- No synthetic citations, ratings, author identities, or update dates.
- Cloudflare must be changed in its dashboard: remove the `ClaudeBot` deny rule only if the operator intends to permit Claude indexing. The site will keep private routes disallowed by its own policy.

## Verification

- Run new Node/TS source contract tests and the existing SEO, payment-return, and middleware tests.
- Run TypeScript, ESLint, and production build.
- Deploy only after the build succeeds; verify public homepage response and source markers, then check PM2 frontend and backend status.
