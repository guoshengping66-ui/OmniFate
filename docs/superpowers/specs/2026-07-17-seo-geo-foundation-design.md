# SEO and GEO Foundation Design

## Goal

Improve organic search discovery and AI-search citation readiness for Khanfate without publishing unsupported claims, blocking account-sensitive pages, or allowing public content to train foundation models.

## Scope

This work covers the public English and Chinese website at `https://www.khanfate.com` and its `khanfate.com` canonical redirects. It does not create bulk keyword pages, change paid-product claims, alter payment behavior, or promise rankings or citations.

## Current Findings

- Public pages already render canonical URLs, `hreflang` alternatives, titles, descriptions, JSON-LD, `robots.txt`, and a sitemap with approximately 510 URLs.
- The sitemap assigns `new Date()` to many programmatic entries, making every page appear changed on every response even when its content has not changed.
- The live Cloudflare-managed `robots.txt` section blocks `GPTBot`, `ClaudeBot`, `Google-Extended`, and other bots. The application-level rules cannot override a more-specific Cloudflare block.
- Product listing and article pages are public, but search-oriented product discovery needs validated Product JSON-LD that matches the displayed price, image, availability, URL, and description.

## Crawler and Rights Policy

The site will allow AI search retrieval while retaining a no-training posture.

| Purpose | Policy |
| --- | --- |
| Traditional search | Allow Googlebot, Bingbot, and other compliant search crawlers on public pages. |
| ChatGPT search | Allow `OAI-SearchBot` for public, indexable content. |
| User-initiated ChatGPT fetches | Do not block `ChatGPT-User` on public pages. |
| Foundation-model training | Keep `GPTBot` disallowed and retain `ai-train=no`. |
| Private or transactional content | Keep `/account`, `/checkout`, `/readings`, and `/api/` disallowed. |

Cloudflare's managed AI-crawler setting must be updated to express this policy. The application `robots.ts` will mirror the same policy so the source-controlled response remains correct if the Cloudflare setting changes later.

## Technical SEO Design

### Robots, indexing, and sitemaps

- Keep a single canonical host: `www.khanfate.com` in metadata and sitemap URLs, with redirects from the apex domain.
- Serve crawler-specific rules from `frontend/src/app/robots.ts` without allowing private routes.
- Replace response-time timestamps in `frontend/src/app/sitemap.ts` with stable source dates: article publication dates, content-data update dates where supplied, and a fixed release date for static programmatic data.
- Include only public canonical pages in the sitemap. Do not add checkout, account, reading history, API, search-filter state, or query URLs.
- Preserve `en` and `zh` reciprocal alternate links for every localized public URL.

### Metadata and structured data

- Centralize JSON-LD construction and use `safeJsonLd` for every inline payload.
- Retain only schemas backed by visible page content: `Organization`, `WebSite`, `WebPage`, `Article`, `FAQPage`, `BreadcrumbList`, and `Product` where relevant.
- Product markup will use the product API data rendered on the detail page. It will not invent ratings, review counts, stock, shipping, health effects, or certifications.
- Article markup will expose headline, description, image when available, canonical URL, locale, and published/modified dates from source data.
- All public pages will use unique titles and descriptions that describe the actual page, not keyword-stuffed variants.

## GEO Discovery and Content Design

- Add `/.well-known/ai.txt` only if an established crawl-client requirement is identified during implementation; do not publish unrecognized crawler files as a substitute for quality content.
- Add `/llms.txt` as a concise, human-readable map of the site: what the service is, language entry points, analysis-method guides, editorial content, shop catalog, policies, and canonical URLs.
- Provide clear descriptions, headings, source-linked explanations, limitations, and navigation paths on high-value public guides. Maintain the existing disclosure that the service is for self-reflection/cultural entertainment and not professional advice.
- Do not generate high-volume derivative pages or write claims that cannot be supported by the current product, editorial, or policy content.

## Validation and Measurement

- Request `robots.txt` and confirm the final response allows `OAI-SearchBot` but disallows `GPTBot` and private routes.
- Confirm the Cloudflare-managed block no longer conflicts with the approved policy.
- Parse `sitemap.xml`; verify only canonical `www` URLs, reciprocal `en`/`zh` alternates, stable modification dates, and no private URLs.
- Render representative home, guide, article, product, and FAQ pages; validate canonical, title, description, `hreflang`, and JSON-LD against visible content.
- Validate JSON-LD with schema-aware checks and inspect the structured-data output in Google Rich Results Test where the schema type is eligible.
- Submit the sitemap to Google Search Console and Bing Webmaster Tools if ownership is already available; this is an operational follow-up, not a ranking guarantee.

## Rollout and Rollback

- Make code changes in source control with focused tests before production deployment.
- Back up server files before deployment and verify the standalone Next.js asset sync, Nginx configuration, PM2 status, and public response headers.
- If public crawling rules or structured data fail validation, restore the previous server backup and Cloudflare crawler policy, then re-test.

