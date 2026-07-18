# SEO Index Recovery Design

## Goal

Protect existing organic visibility by turning known legacy blog URLs into permanent redirects, returning a real 404 for unknown articles, and making blog metadata match the site's actual English topic coverage.

## Evidence

- Search results exposed `/en/blog/tarot-major`, an older Major Arcana article URL, while the current equivalent is `/en/blog/tarot-card-meanings-complete`.
- The current client-only article route renders a generic page for an unknown ID instead of returning a server-side 404, creating soft-404 risk.
- The blog index currently advertises generic “Destiny Knowledge” copy rather than its visible Bazi, astrology, Tarot, and cultural-guide subjects.

## Design

1. Add one explicit legacy content redirect map in middleware. It must preserve an existing locale and use English for the unprefixed legacy URL.
2. Make the server article route call `notFound()` before rendering its client article component, and serve `noindex` plus the canonical English URL when an article is unavailable in a requested locale.
3. Update only English blog-index metadata to describe Bazi, astrology, Tarot, and cultural guides accurately. Do not fabricate authority, ratings, outcomes, or professional advice.
4. Keep `tarot-card-meanings-complete` canonical and included in the sitemap. Existing search snippets may remain stale until recrawl.

## Verification

- Middleware tests prove 301 redirects for locale-prefixed and unprefixed legacy URLs.
- Article metadata tests prove unknown IDs raise the Next.js 404 signal.
- Blog metadata tests prove the English title and description use accurate topic language.
- Full test suite, lint, TypeScript, production build, and live HTTP checks pass before deployment.
