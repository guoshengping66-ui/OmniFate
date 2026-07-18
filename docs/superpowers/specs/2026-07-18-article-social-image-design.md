# Article Social Image SEO Design

## Goal

Give every public blog article a crawlable, topic-specific social image and make the same image discoverable through Open Graph, Twitter metadata, and Article JSON-LD.

## Evidence

The live article page contains Article JSON-LD and date fields but no `og:image`. Google recommends a representative, crawlable image for Article markup and recommends high-resolution images with common social aspect ratios. The existing locale-level Open Graph image route already provides a tested rendering pattern.

## Design

1. Add a dynamic `social-image` route below each article route. It renders a 1200 × 630 PNG using the article's visible title, cover emoji, locale, and Inner Atlas AI name. It is a normal route rather than a special file-based metadata route, so the explicit public image URL cannot be replaced with the server's localhost hostname. Unknown or unavailable locale/article combinations return 404.
2. Centralize the deterministic image URL in the editorial SEO helper. Article metadata, Twitter metadata, and Article JSON-LD consume the same URL so they cannot diverge.
3. Preserve truthful content: no generated portraits, author identities, ratings, testimonials, predictions, or claims are added. The image only represents the article users can read.
4. Add regression tests for the URL helper and metadata source contract. Build verification confirms the image route compiles.

## Non-goals

- No mass publication of thin articles.
- No changes to article copy, canonical URLs, sitemap frequency, or crawler policy.
- No claim that rich-result display is guaranteed; search engines decide presentation after recrawl.

## Validation

- Focused tests fail before the helper and metadata references exist, then pass.
- Full test suite, lint, type-check, and production build pass.
- After deployment, a public article returns 200, its generated image returns a PNG response, and page HTML exposes matching `og:image`, Twitter image, and JSON-LD `image` URLs.
