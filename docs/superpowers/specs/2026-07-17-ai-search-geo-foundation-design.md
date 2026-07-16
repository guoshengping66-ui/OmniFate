# AI Search GEO Foundation Design

**Date:** 2026-07-17
**Status:** Approved for planning
**Primary brand:** Inner Atlas AI

## Goal

Make the public Inner Atlas AI website easy for AI search and answer engines to crawl, understand, cite, and link when it is relevant to a user's query. This work improves discoverability and factual clarity; it does not promise placement, ranking, or recommendation by any third-party AI product.

## Scope

This phase covers the public English and Chinese website, with English as the primary market-facing source for the new reference material.

- Use **Inner Atlas AI** as the only public organization and publisher name in new and shared SEO metadata.
- Allow search and answer crawlers for public content while keeping model-training crawlers blocked.
- Provide a concise, machine-readable discovery document with canonical public entry points, factual service descriptions, and safety boundaries.
- Add an English reference page that gives AI systems and people a stable source for what the service is, how its methods are framed, and what it does not claim.
- Align JSON-LD across the homepage, reference page, articles, products, and method pages to one organization entity.

This phase does not create city-scale landing pages, add fabricated review or social proof data, publish new social accounts, or change private/report/payment behavior.

## Crawler policy

Public content remains crawlable; private and transactional paths remain unavailable.

| Class | Policy | User agents |
| --- | --- | --- |
| Search and citation | Allow public content | Googlebot, Bingbot, OAI-SearchBot, OAI-AdsBot, PerplexityBot, ClaudeBot |
| Model training | Disallow all content | GPTBot and other explicitly configured training agents |
| Private or transactional paths | Disallow | `/account`, `/checkout`, `/readings`, `/api/` |

The policy is source controlled and represented by `robots.ts`. It must not grant access to private pages merely because an AI crawler is allowed generally.

## Reference information architecture

### Discovery document

`/llms.txt` becomes a concise AI-facing index with:

- the official name, canonical homepages, and supported languages;
- direct links to methods, the public report flow, knowledge base, editorial library, shop, FAQ, privacy, terms, and disclaimer;
- a factual description of the service as AI-assisted personal reflection and cultural interpretation;
- explicit boundaries: no medical, legal, financial, investment, counselling, or guaranteed-prediction claims;
- an instruction to cite canonical localized URLs.

### Reference page

Add one crawlable English page at `/en/ai-search` with an English canonical URL and a noindex Chinese counterpart until a genuine Chinese translation exists. The page contains:

1. A short description of Inner Atlas AI and its public service categories.
2. Method cards for Bazi, Western astrology, Tarot, face reading, and palm reading, each linked to its authoritative public entry point.
3. A factual "how to use this site" section linking to public guides, the report flow, and the catalog.
4. A compact FAQ that answers the questions most likely to be surfaced by answer engines.
5. A clearly visible limitations section.

This is a source-of-truth page, not a keyword-stuffed landing page. Each statement must be visible in the HTML, supported by an on-site canonical link, and phrased without outcome guarantees.

## Structured data

Create one shared `Organization` entity for Inner Atlas AI and use it as the publisher/author identity where appropriate.

- The localized homepages publish `Organization`, `WebSite`, and `WebApplication` JSON-LD with truthful fields only.
- `/en/ai-search` publishes `WebPage`, `ItemList`, and `FAQPage` JSON-LD matching visible page content.
- Article metadata publishes Inner Atlas AI as author and publisher.
- Product and existing method metadata use Inner Atlas AI as publisher where a publisher/organization is expressed.
- Existing legacy names are replaced only in public structured data and metadata touched by this phase; product labels and account-facing legacy copy are outside scope.

No ratings, reviews, physical address, social profile, audience size, or affiliation is included unless it is verifiably present and maintained by the site owner.

## Rendering and indexing behavior

- The reference page is server-rendered enough for title, description, canonical, JSON-LD, headings, links, FAQ answers, and limitations to be available without user interaction.
- The English page has English and `x-default` alternates only.
- `/zh/ai-search` is canonicalized to the English page and marked `noindex, follow` until Chinese content is authored.
- The sitemap includes only the English reference URL during this phase.

## Validation

Automated tests will verify:

- each crawler category has the intended allow/disallow policy;
- discovery text contains accurate canonical entry points and boundaries;
- the shared organization schema contains only approved identity fields;
- the reference page exposes matching visible FAQ and JSON-LD data;
- sitemap and hreflang exclude the unavailable Chinese reference page.

After deployment, validate public 200 responses for `/robots.txt`, `/llms.txt`, `/en/ai-search`, and `/sitemap.xml`; inspect rendered HTML for one organization name, correct canonical links, and JSON-LD; confirm both PM2 processes remain online.

## Success criteria

- Public AI search crawlers may access public content without being blocked by `robots.txt`.
- Training crawlers remain blocked.
- Inner Atlas AI is the only organization/publisher identity in new shared GEO assets and relevant metadata.
- AI and human readers have a public, authoritative, quotable description of the service, methods, links, and boundaries.
- The implementation does not expose personal data, report results, account data, checkout pages, or internal APIs.
