# KhanFate SEO and GEO Brand Migration Design

## Goal

Make every public search-engine, social-preview, structured-data, and AI-readable brand reference identify the website as **KhanFate**, while keeping its canonical domain, legal operator, product routes, accounts, reports, and payment behavior unchanged.

## Brand contract

- Public brand name: KhanFate
- Canonical website: https://www.khanfate.com
- Public positioning: AI-guided personal insight, cultural interpretation, and daily action prompts.
- Legal operator: Khan Fate Team; this remains unchanged wherever a legal notice identifies the operator.
- Retired public SEO/GEO brand: Inner Atlas AI and Inner Atlas.

## Chosen approach

Use a bounded search-facing migration rather than a global string replacement.

1. Create one source-of-truth SEO brand module exporting the public name, description, tagline, and canonical site URL.
2. Point Organization, WebSite, WebApplication, Publisher, article, and product JSON-LD at KhanFate.
3. Replace public metadata and Open Graph/manifest wording on indexable routes with KhanFate, using the existing page topic as the remainder of each title.
4. Rewrite the public AI reference and llms.txt content so AI retrieval cites KhanFate and its factual responsible-use boundaries.
5. Update public OG assets whose visible text says Inner Atlas AI.
6. Add one source-level regression test that scans the explicitly search-facing source set and rejects the retired brand while allowing it only in scoped compatibility/legal files if needed.

## Explicitly out of scope

- Do not change the legal operator name Khan Fate Team.
- Do not change URLs, domain, account IDs, reports, checkout, payment, product inventory, or APIs.
- Do not alter historical user content or private, noindex account/reading pages merely because it contains the prior brand.
- Do not make fate, medical, legal, financial, or guaranteed-outcome claims.
- Do not use formerly Inner Atlas AI in public SEO/GEO copy; the migration is a clean public identity switch.

## Search-facing file groups

- Global public metadata and schemas: frontend/src/app/layout.tsx, frontend/src/app/[locale]/layout.tsx, frontend/src/lib/seo/structuredData.ts, frontend/src/lib/seo/editorialArticle.ts, frontend/src/lib/seo/productMetadata.ts.
- AI/GEO content: frontend/src/data/seo/aiSearchReference.ts, frontend/src/lib/seo/aiSearchReference.ts, and the routes that render the shared data.
- Indexable page metadata and page-level schemas beneath frontend/src/app/[locale], excluding explicit noindex account and authentication routes.
- Public assets: frontend/public/manifest.json and frontend/public/og-image.svg.

## Validation

- A focused source test verifies the central SEO brand contract, schemas, and AI reference data use KhanFate.
- A bounded public-source scan test confirms no Inner Atlas AI or Inner Atlas remains in declared SEO/GEO files.
- Existing SEO source tests, linting, type checks, and production builds pass.
- After deployment, compressed public HTML for /en, /zh, /en/ai-search, /en/shop, /llms.txt, manifest.json, and key JSON-LD contains KhanFate and has no retired public brand text.

## Self-review

The migration has one public identity, retains legal identity where required, and limits edits to discoverability surfaces. The source scan is bounded so translations, legal records, and user-facing account history cannot create false failures. No URL, product, payment, or service claim changes are included.
