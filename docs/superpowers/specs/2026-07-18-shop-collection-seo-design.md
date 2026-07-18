# Shop Collection SEO Design

## Goal

Make the public English and Chinese shop collection pages understandable to search engines before client-side product loading, without changing personalized matching, checkout, prices, or product availability.

## Problem

`/[locale]/shop` is a client-only page behind a `Suspense` fallback. Its initial server HTML is a loading state, so the public English page exposes no H1 or collection explanation to crawlers. The current browser title, “The Vault,” also does not express a marketplace or lifestyle-shopping intent.

## Chosen design

The route becomes a small server wrapper around the existing interactive shop client.

1. The server wrapper resolves locale and defines a visible, factual collection header: a category label, one H1, a concise collection description, and the real categories already supported by the interface: crystals, jewelry, incense, and talismans.
2. The wrapper passes that header into the client component, which renders it in the current hero position. The client keeps loading products, profile ranking, filtering, cart registration, and conversion actions unchanged.
3. The server wrapper emits a `CollectionPage` JSON-LD graph with an `ItemList` of the four category names. It does not claim inventory count, price, availability, ratings, efficacy, guarantees, or personalized outcomes.
4. Shop metadata names the public shopping intent in English while retaining its existing canonical and locale alternates.

## Boundaries

- No product data is fetched server-side; that data is dynamic and may be personalized.
- No new keyword landing pages, category routes, reviews, ratings, stock claims, medical claims, or promised outcomes.
- The responsible-use copy remains clear: products are cultural and lifestyle recommendations, not guaranteed outcomes.
- The existing localized product detail schema remains unchanged.

## Validation

- A source-level route test verifies that the server route has a collection H1, category links/labels, canonical CollectionPage URL, and four category list entries.
- A client-source test verifies the server-provided header is rendered in the hero rather than hidden or discarded.
- Existing source tests, lint, type checking, production build, and post-deployment HTML inspection must pass.

## Self-review

The design does not require new inventory assumptions, APIs, or backend changes. The server/client boundary is explicit: public collection context is server-rendered, while personalized data remains client-only. The scope is limited to the shop collection route and its metadata.
