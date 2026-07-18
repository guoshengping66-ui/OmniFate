# Knowledge Hub GEO Repair Design

**Date:** 2026-07-18  
**Status:** Approved direction; ready for user review  
**Primary brand:** Inner Atlas AI

## Goal

Make the public English and Chinese knowledge hub independently understandable and citable by giving each localized hub URL its own canonical metadata, visible primary heading, and schema that matches the rendered page.

## Problem

`/en/knowledge` currently inherits the locale home canonical (`/en`) because its route has no metadata generator. The page also renders its primary title through a styled section rather than an H1. This makes the public page promoted by the AI citation reference weaker as an independent knowledge source.

## Scope

- Add locale-aware metadata to `frontend/src/app/[locale]/knowledge/layout.tsx`.
- Canonicalize `/en/knowledge` to itself and `/zh/knowledge` to itself.
- Add `en`, `zh`, and `x-default` alternates.
- Provide factual English and Chinese title, description, and Open Graph values that describe the visible knowledge hub.
- Render exactly one H1 for the existing knowledge-hub title.
- Give the existing `CollectionPage` JSON-LD a stable `@id`, localized `inLanguage`, and a publisher identity; its title, description, and URL continue to match visible page content.
- Add regression tests for canonical/hreflang metadata, the visible H1, and collection schema properties.

## Non-goals

- No changes to category or subcategory route metadata in this phase.
- No new articles, claims, reviews, ratings, expert credentials, or guarantee language.
- No behavior change to private pages, report flows, pricing, crawler policy, or AI reference links.

## Content rules

The English H1 remains the existing visible phrase, “A clearer way to read pattern, personality, and action.” The metadata identifies the page as the “Inner Atlas AI Knowledge Library” and describes it as public educational content about Bazi, astrology, tarot, face reading, palm reading, and AI-assisted reflection. Chinese values use the existing localized concept without inventing credentials or outcomes.

The CollectionPage schema includes only the visible title/description, localized URL, `inLanguage`, and `publisher: createPublisherJsonLd()`. It does not state scholarly authority, medical expertise, or outcome certainty.

## Validation

Tests must prove that both locales return self-canonical URLs and the three language alternates, the page source contains one semantic H1 using the title, and the collection schema retains its localized URL while adding `@id`, language, and Inner Atlas AI publisher.

Production validation must require HTTP 200 for both hub URLs, correct rendered canonical/hreflang tags, an H1 in the English HTML, a `CollectionPage` schema with the English knowledge URL, and online frontend/backend PM2 processes.
