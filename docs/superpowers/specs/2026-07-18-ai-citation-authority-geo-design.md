# AI Citation Authority GEO Design

**Date:** 2026-07-18  
**Status:** Approved direction; ready for user review  
**Primary brand:** Inner Atlas AI

## Goal

Make the English public site a factual, coherent source that answer engines can crawl, understand, and cite when relevant. This phase improves clarity and connected entity signals; it does not promise inclusion, ranking, or recommendation by any search or AI product.

## Problem

The current AI-facing assets already establish a public English reference page and a machine-readable `llms.txt`. However, both assets link to `/en/reading/new`, a deliberately `noindex` report-creation flow. That gives AI systems an unsuitable citation target and contradicts the indexing policy.

The current reference page describes methods and limitations, but it does not make the service categories explicit in visible page content or its structured data. Answer engines have less direct evidence connecting the Inner Atlas AI organization, public services, method guides, and responsible-use boundaries.

## Scope

This phase is limited to public English AI-citation assets. It will:

1. Replace the noindex report-creation link in `llms.txt` and the reference page with the crawlable English pricing page, described as report formats and access information.
2. Add a visible public-service section to `/en/ai-search` that names the supported categories: AI-assisted reflection, cultural interpretation guides, public educational resources, daily action prompts, and report-format information.
3. Extend the reference page JSON-LD with a truthful `Service` graph. Each service will identify Inner Atlas AI as provider, state its public service category, point to a crawlable canonical URL, and repeat the visible limitation boundary where relevant.
4. Keep method guides in the existing `ItemList` and connect them to the `WebPage` entity through a stable `mainEntity` reference.
5. Add regression tests that reject noindex/private URLs in AI citation assets and require the visible service definitions to match the structured-data service graph.

## Non-goals

- No fabricated reviews, ratings, awards, social profiles, publication dates, expert credentials, or guarantees.
- No changes to report generation, accounts, payments, checkout, or private data.
- No new city, country, or keyword-targeted landing pages.
- No external crawler policy changes. The Cloudflare-managed ClaudeBot setting remains a separate operational configuration.
- No Chinese `/zh/ai-search` indexable page until a genuine Chinese reference translation exists.

## Content model

The shared `AI_SEARCH_REFERENCE` data object becomes the single source of truth for visible service cards and JSON-LD.

Each service record contains:

- `id`: stable identifier;
- `name`: visible, factual service name;
- `description`: short public-scope description without outcome claims;
- `href`: crawlable `/en/...` canonical URL;
- `category`: Schema.org service category text;
- `limitations`: an optional factual safety boundary when the service can be mistaken for professional advice.

The five service records are:

| ID | Public page | Purpose |
| --- | --- | --- |
| `reflection` | `/en` | AI-assisted personal reflection and daily action prompts |
| `guides` | `/en/knowledge` | Cultural interpretation and educational guides |
| `methods` | `/en/tools` | Public entry point for supported symbolic methods |
| `reports` | `/en/pricing` | Public report-format and access information |
| `faq` | `/en/faq` | Public service boundaries and common questions |

`/en/reading/new` remains a conversion flow and is never listed as an AI citation entry point.

## Page and schema design

`/en/ai-search` keeps its current method cards, resource links, FAQ, and limitations section. A new “Public services” section appears after the header and before methods. Every visible service card links to its matching canonical public URL.

The JSON-LD output becomes a four-node array:

1. `WebPage` with a stable `@id`, English URL, published publisher identity, and a `mainEntity` reference to the `ItemList`.
2. `ItemList` with a stable `@id` and the existing method entries.
3. `FAQPage` matching only the visible FAQ questions and answers.
4. One `Service` node per visible public service. Each has `provider` set to the shared Inner Atlas AI organization identity, `url` set to the public canonical URL, `serviceType` set to the visible category, and no price, rating, availability, or claim of professional advice.

The page HTML, `llms.txt`, and JSON-LD will all state that Inner Atlas AI is for personal reflection, cultural interpretation, lifestyle reference, and not professional, medical, legal, financial, investment, counselling, or guaranteed-prediction guidance.

## Validation

Automated tests must prove:

- `llms.txt` does not contain `/reading/new`, `/checkout`, `/account`, or other private/noindex targets and includes `/en/pricing`.
- The AI reference links use only public English URLs and do not include `/reading/new`.
- Each declared public service has a unique ID, a public URL, and visible name/description.
- The service JSON-LD count and URLs exactly match the service data.
- `WebPage.mainEntity` points to the method `ItemList`, and all `Service` nodes identify Inner Atlas AI as their provider.

Deployment validation must confirm the production `llms.txt` and `/en/ai-search` return 200, rendered HTML includes the public-service section, the schema contains the five services, sitemap remains free of noindex pages, and PM2 frontend/backend remain online.

## Success criteria

- AI-facing discovery assets link only to crawlable public English source pages.
- Inner Atlas AI’s organization, public services, methods, and limitations form one truthful, visible, machine-readable graph.
- No private route, report-creation flow, or transactional route is promoted as a citation source.
- All new structured data maps directly to visible page content and automated regressions prevent reintroduction of the conflict.
