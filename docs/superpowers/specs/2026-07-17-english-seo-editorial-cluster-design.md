# English SEO Editorial Cluster Design

## Goal

Publish a focused English editorial cluster that attracts people researching Bazi, astrology, Chinese metaphysics, Tarot, face reading, and palm reading; help them understand the topic; and offer a natural next step to generate an AI report or explore a genuinely related shop product.

## Audience and boundaries

- Primary audience: English-speaking beginners looking for plain-language explanations and reflective tools.
- Primary conversion: start a personal AI report at `/en/reading/new`.
- Secondary conversion: related shop products only where they genuinely fit the article topic.
- Editorial boundary: cultural education and self-reflection only. Articles must not promise outcomes or provide medical, legal, financial, or professional advice.
- No invented testimonials, expertise claims, ratings, statistics, or product benefits.

## First release: twelve English articles

| Cluster | Article | Intent |
| --- | --- | --- |
| Bazi | What Is Bazi? A Beginner's Guide to the Four Pillars of Destiny | Definition / beginner |
| Bazi | How to Read Your Bazi Chart: Day Master, Elements, and Balance | How-to |
| Five Elements | The Five Elements in Chinese Astrology: What They Mean in Your Birth Chart | Definition / interpretation |
| Five Elements | What Is a Missing Element in Bazi? Common Myths and a Better Way to Read It | Myth correction |
| Astrology | How to Read a Birth Chart for Self-Reflection: Sun, Moon, Rising, and Context | How-to |
| Astrology | Bazi vs. Western Astrology: What Each System Can—and Cannot—Tell You | Comparison |
| Chinese metaphysics | Chinese Metaphysics for Beginners: Bazi, Feng Shui, I Ching, and Their Different Roles | Overview |
| Chinese metaphysics | I Ching vs. Bazi vs. Feng Shui: Choosing a Reflective Tool for Your Question | Comparison |
| Tarot | How to Read Tarot for Self-Reflection: Questions, Spreads, and Boundaries | How-to |
| Tarot | Tarot Card Meanings for Beginners: A Practical Way to Read Symbols in Context | Beginner guide |
| Body reading | Face Reading as a Cultural Tradition: How to Approach It Thoughtfully | Cultural explainer |
| Body reading | Palm Reading for Beginners: Lines, Symbols, and Responsible Self-Reflection | Beginner guide |

## Article contract

Every entry supplies localized metadata and page content through a dedicated editorial module rather than expanding the already large generic article file.

- Stable lowercase slug and publication date.
- English title, summary, tags, estimated read time, descriptive cover treatment, and article body.
- A concise FAQ with direct, non-promissory answers.
- Two or three intentionally chosen internal links to adjacent cluster articles.
- A report CTA for every article.
- An optional shop CTA only when the relationship is explicit and non-diagnostic.

The body follows the same order: direct answer, clear explanation, common misconception or limitation, short self-reflection exercise, related reading, and CTA.

## Technical design

1. Create a focused SEO editorial data module plus small types/helpers for FAQ, internal links, and optional shop CTAs.
2. Combine the new entries with existing `ARTICLES` without changing the existing blog route contract.
3. Move Article and FAQ JSON-LD generation to the server article layout. The current client page remains responsible only for interactive reading UI.
4. Reuse the existing canonical and hreflang conventions, sitemap discovery, Markdown renderer, and safe JSON-LD serializer.
5. Keep all structured data truthful: `Article` and `FAQPage` only, with no ratings, authorship claims, or unsupported image metadata.
6. Link to report and shop destinations with locale-aware paths; do not use a shop CTA where no matching product can be demonstrated.

## Validation

- Content contract tests verify unique IDs, required English fields, useful metadata lengths, FAQ/CTA presence, and valid internal targets.
- SEO rendering tests verify article and FAQ JSON-LD are emitted from the server layout for a new article.
- Run the full frontend TypeScript test suite, type check, lint, and production build.
- After deployment, check representative new pages for HTTP 200, canonical, Article/FAQ JSON-LD, sitemap inclusion, internal links, and CTAs.

## Non-goals

- Automated keyword-rank guarantees, bulk AI-generated near-duplicate pages, external backlink purchasing, and claims of professional or predictive accuracy.
- Rewriting the existing Chinese editorial corpus during this English release.
