# Report and Shop Content Design

## Goal

Make reports clearer, safer, and more actionable while turning the shop into a transparent lifestyle-recommendation experience tied to report context.

## Report Contract

- Separate input facts, system interpretation, and practical action in report output.
- Use conditional language for interpretation; do not present inferred patterns as certain facts or guarantees.
- Put a concise current focus, rationale, action, and caution before long analysis.
- Let users mark a report insight helpful, not helpful, or incomplete and save optional feedback for later refinement.

## Report Reading Experience

- Lead each section with a one-sentence takeaway and action.
- Keep supporting reasoning collapsible.
- Give charts and scores plain-language meaning and a contextual limit.

## Shop Content

- Organize entry points by goal and current context rather than a generic product grid.
- On product details show intended use, material/specification, everyday use guidance, fulfillment/return information, and why a report may have suggested it.
- Never imply health outcomes, financial outcomes, or deterministic life results.

## Acceptance Criteria

1. Report data/components visibly separate fact, interpretation, and action.
2. Feedback is optional and does not block viewing reports.
3. Shop recommendation language explains rationale and limitations.
4. Existing report generation, checkout, product data, routes, and auth remain unchanged.
5. Tests, production build, core report/shop routes, and relevant interaction flows pass before deployment.
