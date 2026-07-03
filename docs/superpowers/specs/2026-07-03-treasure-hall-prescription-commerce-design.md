# Treasure Hall Prescription Commerce Design

Date: 2026-07-03
Status: Approved direction, pending implementation plan

## Goal

Reposition the Treasure Hall from a generic product grid into a prescription-style commerce experience. The shop should translate a user's destiny report, AI profile, five-dimension state, and recent trend into concrete lifestyle recommendations.

The commercial promise is not "buy this object to guarantee an outcome." The promise is "turn your report insight into a practical, culturally framed action."

## Product Positioning

The Treasure Hall should become a destiny-prescription commerce experience:

- AM16 and free tools create user interest.
- Reading reports identify tags, weak dimensions, trend signals, and current growth tasks.
- Treasure Hall ranks products by those signals.
- Product pages explain why an item fits, how to use it, and what limits or precautions apply.
- Checkout completes the action loop from insight to purchase.

## Information Architecture

The shop should use three layers.

### Layer 1: Personalized Prescription

For users with report tags, show a prominent recommendation module:

- "Your current prescription" heading.
- Top 3 recommended items.
- Match score or match tier.
- Matched signals such as element, profile tag, trend, or growth task.
- One primary CTA to view the full prescription set.

For users without report tags:

- Explain that current products are curated picks.
- Encourage creating an AI profile before shopping.
- Keep the product grid available so the page does not feel blocked.

### Layer 2: Need-Based Paths

Add user-friendly paths above the category filter:

- Wealth stability
- Relationship repair
- Motivation and execution
- Emotional calm
- Communication and expression
- Space cleansing
- Protection and conflict reduction

These should map to existing `keyword_tags`, `wuxing_tags`, and `astro_tags`, not create a separate recommendation system at first.

### Layer 3: Product Categories

Keep the existing categories as secondary filters:

- Crystal
- Jewelry
- Incense
- Talisman / protection
- Book
- Service

The current frontend includes `crystal`, `jewelry`, `incense`, `talisman`, `book`, and `service`. Product data also contains category values such as `accessory`, so implementation must either normalize those values or include them in the category map.

## Shop Page Design

The `/shop` page should be reorganized into:

1. Hero
   - Keep the Treasure Hall brand.
   - Replace purely atmospheric copy with a prescription-commerce value proposition.
   - Use concise trust language: cultural lifestyle recommendations, no guaranteed outcomes.

2. Profile Match Panel
   - If personalized: "Re-ranked for your profile."
   - If not personalized: "Create a profile for sharper matching."
   - Show signals used in ranking.

3. Top Prescription Picks
   - Show top 3 only when matched products exist.
   - Each card should explain the match reason, not just show a product.

4. Need-Based Path Filter
   - Use clear need labels before product categories.
   - Selecting a need filters or re-ranks products by mapped tags.

5. Category Filter
   - Keep horizontal filter.
   - Use it as a secondary browsing mode.

6. Product Grid
   - Show cards with product image, name, price, match tier, short pitch, and quick CTA.

## Product Card Requirements

Each product card should emphasize decision support:

- Product name.
- Price localized by region.
- Short pitch.
- Match badge if personalized.
- Match percent or tier.
- Up to 2 match reasons.
- Up to 2 need tags when not personalized.
- Primary action: Add to cart.
- Secondary action: Open detail page.

Avoid making the card look like a normal commodity tile. The user should understand why the item is being shown.

## Product Detail Page Requirements

The product detail page should be structured around trust and fit:

1. Product summary
   - Image, name, price, category, rating, add-to-cart.

2. Why it fits you
   - Show matched tags, elements, or report signals.
   - If the user has no profile, show a neutral "best for these situations" explanation.

3. Cultural meaning
   - Use current `efficacy` copy, but soften outcome language.
   - Avoid medical, financial, or guaranteed-result claims.

4. Usage guide
   - Use `usage`.
   - Make it practical and easy to scan.

5. Precautions
   - Use `precautions`.
   - Give this section visual weight; it increases trust.

6. Specs and material
   - Use `specifications` and `material`.

7. Related reports
   - Keep the current related readings block.
   - Make the connection explicit: "This item relates to these reports."

8. Reviews
   - Keep reviews after educational content.

## Matching Logic

The first implementation should reuse the existing product matching system:

- `/api/products/match`
- `weakness_tags`
- `boost_elements`
- `astro_weakness_tags`
- `match_score`
- `match_reasons`
- `recommendation_text`

Enhancements:

- Request `include_explain: true` for personalized shop recommendations when performance allows.
- Add a frontend need-path mapping layer for users without a report.
- Keep default curated ordering for users with no tags and no selected need.

The matching system should remain explainable. Do not introduce an opaque "AI recommended" label without visible reasons.

## Data Governance

Before or during implementation, product data needs cleanup:

- Fix mojibake in Chinese product fields where present.
- Remove mixed-language mojibake from English fields.
- Normalize category names.
- Check extreme price values, especially USD fields.
- Ensure active products have image, short pitch, usage, precautions, efficacy, and specifications.
- Keep inactive products out of user-facing grids.

Data cleanup can be incremental, but the UI must not amplify broken text. If a localized field is invalid, fall back to a safer field or hide that subsection.

## Compliance And Trust

The Treasure Hall must avoid promising guaranteed effects.

Required trust copy:

- Products are cultural creative and lifestyle recommendations.
- They are not medical, financial, or psychological treatment.
- Users should choose rationally based on their own needs.
- Precautions should be visible before checkout for relevant products.

This should appear on the shop page and product detail pages.

## Implementation Scope

Recommended first implementation slice:

1. Refactor `/shop` copy and layout into prescription-commerce structure.
2. Add need-based path filters on the frontend.
3. Improve product cards to show match reasons and need tags more clearly.
4. Refine product detail "Why it fits you" and trust sections.
5. Add defensive text rendering for invalid localized fields.
6. Build and verify `/zh/shop`, `/en/shop`, and at least one product detail page.

Out of scope for the first slice:

- New payment methods.
- New backend AI matching engine.
- Inventory management dashboard.
- CJ Dropshipping automation changes.
- Full product catalog rewrite.

## Acceptance Criteria

- `/zh/shop` and `/en/shop` clearly present Treasure Hall as a profile-driven prescription shop.
- Users without a report can still browse by need paths and categories.
- Users with report tags see personalized ranking and clearer match explanations.
- Product cards explain why an item is relevant.
- Product detail pages show fit, usage, precautions, specs, and compliance language.
- No visible UI text claims guaranteed outcomes.
- Build passes with `npm run build` in `frontend`.
- The final diff is limited to shop-related frontend files unless data cleanup is explicitly included.
