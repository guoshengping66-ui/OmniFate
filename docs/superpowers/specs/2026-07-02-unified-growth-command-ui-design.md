# Unified Growth Command UI Redesign

Date: 2026-07-02
Status: Proposal, pending approval before implementation

## Product Position

The site should stop feeling like a slide deck or a collection of astrology tools. It should feel like a personal growth operating system that reads destiny signals, synthesizes them with AI, and turns them into next actions.

Core product metaphor:

> Five-dimensional destiny signal field + personal growth command center.

This keeps the product different from traditional fortune-telling sites. The breakthrough is not only "we calculate five dimensions"; the breakthrough is that five dimensions become a repeatable decision workflow:

1. Read signals from Bazi, Zi Wei, astrology, tarot/divination, and daily timing.
2. Cross-check conflicts and resonance across dimensions.
3. Translate abstract metaphysics into growth themes, timing windows, and action prescriptions.
4. Save the user's profile and keep generating a daily/weekly growth dashboard.

## Visual Direction

Do not copy Qingnang's oriental scroll style. The reference is useful because it builds a full brand world, not because it uses ink mountains.

Our brand world should be:

- Cosmic but not generic AI purple.
- Metaphysical but still product-grade and readable.
- Premium, calm, and intelligent.
- A blend of "destiny chart", "signal radar", and "growth command room".

Recommended visual language:

- Base: deep ink green / near-black space.
- Accent: warm gold chart lines, jade signal highlights, soft ivory text surfaces.
- Shapes: orbit paths, meridian lines, radial charts, layered translucent panels.
- Motion: slow signal sweep, orbit drift, report-generation pulse, no noisy cyber effects.
- Texture: subtle grain/star field, not stock backgrounds or decorative blobs.

Forbidden directions:

- PPT-like text blocks stacked vertically.
- Generic SaaS gradient cards.
- Purely oriental scroll imitation.
- Overly neon gaming/cyber UI.
- Dense mystical decoration that hides the actual product value.

## Logged-Out Experience

### Homepage First Screen

Goal: in 3 seconds the visitor understands what the product does and why it is different.

First viewport should contain:

- A full-bleed destiny signal scene, not a text-only hero.
- One strong product promise, meaning: "AI five-dimensional synthesis creates your personal growth chart".
- A visible live product preview: five-dimensional signal map + sample insight + next action.
- Primary CTA for starting a chart.
- Secondary CTA for seeing a sample report.

The first screen should make the product legible without scrolling:

- What we analyze: five dimensions.
- What the user receives: growth chart, timing, actions, report.
- Why it is different: cross-dimensional synthesis instead of one-off fortune text.

### Destiny Page

This page should be the product explanation page, not another homepage.

Required structure:

1. Immersive opening with five-dimensional map.
2. "How the synthesis works" section.
3. Sample report preview with tabs: personality pattern, relationship, career, timing, action plan.
4. Trust/method section explaining AI + classical systems without overclaiming certainty.
5. Service paths: quick reading, deep report, daily dashboard, founder/premium consultation.
6. Final CTA focused on starting the first chart.

## Logged-In Experience

The logged-in user should not land on a marketing page. They should enter a command center.

### Dashboard: Today Growth Command Center

Replace the current small centered dashboard feeling with a full product workspace.

Recommended layout:

- Top band: user's current growth status, date, active profile, credit state.
- Left: Destiny Identity Card.
- Center: Five-Dimension Signal Map.
- Right: Today's Action Prescription.
- Lower band: analysis entry matrix, recent reports, growth timeline.

Core modules:

- Destiny Identity Card: birth data, zodiac/constellation, primary five-element tendency, profile completeness.
- Five-Dimension Signal Map: Bazi, Zi Wei, astrology, divination, daily timing with strength/conflict/resonance.
- Today's Action Prescription: 1-3 concrete actions, best timing window, what to avoid.
- Analysis Entry Matrix: clear service entry points, no overly cyber neon treatment.
- Recent Reports: continue reading and compare changes over time.

### Profile Card

Current issue: some Chinese arrays and fallback labels appear to have mojibake risk. The redesign should also repair the data labels.

New role:

- Make it an identity card for the user's destiny profile.
- Use restrained premium styling.
- Show missing birth data clearly and direct the user to complete it.
- Avoid cute emoji zodiac labels in the main premium UI.

### Intent Buttons

Current issue: visually dramatic but disconnected from the new product-led homepage. It reads more like a sci-fi tool menu than a personal growth product.

New role:

- Rename conceptually to "Analysis Entry Matrix".
- Each entry should explain outcome, time cost, and best use case.
- Use icon + signal status + small preview, not oversized decorative animation.

Primary entries:

- Deep Growth Report.
- Instant Question Insight.
- Daily Timing Dashboard.
- Relationship / Interaction Mirror.
- Event Decision Analyzer.

### Daily Dashboard

Current issue: it has useful data, but the UI reads like separate widgets rather than one coherent daily system.

New role:

- "Today's Signal Board".
- Connect daily fortune, almanac, energy, conflicts, and actions into one ranked interpretation.
- Put the actionable recommendation first, then supporting signals.

Recommended structure:

- Today's main theme.
- Best timing window.
- Energy distribution.
- Auspicious / caution items.
- Recommended action queue.
- Historical trend if data exists.

### Analysis Progress

Current issue: progress UI has mojibake fallback strings and stage labels, which weakens trust during a high-expectation wait state.

New role:

- "Synthesis Chamber".
- Show multiple systems being read and merged.
- Use clear stages: receiving birth data, reading base chart, cross-checking dimensions, generating action plan, composing final report.
- Every waiting message must be clean Chinese/English and confidence-building.

### Report Reading Page

The report should feel like a premium deliverable, not a plain article.

Recommended layout:

- Sticky report navigation.
- Executive summary at top.
- Five-dimension signal map.
- Key conflicts and growth opportunities.
- Timing windows.
- Action prescriptions.
- Saved notes / follow-up CTA.

## Component System

Create a shared visual system before rewriting every surface:

- `SignalShell`: page-level background, texture, spacing.
- `SignalPanel`: premium translucent panel with consistent border, radius, and shadow.
- `DimensionOrbit`: reusable five-dimension chart/visual.
- `ActionPrescriptionCard`: action-first recommendation.
- `SignalMetric`: small metric row for score, trend, confidence.
- `ReportPreviewTabs`: sample report and real report compatible tabs.

This keeps the redesign scalable and prevents each page from inventing a separate style.

## Copy System

The product language should move from "fortune result" to "growth operating guidance".

Preferred Chinese product terms, to be implemented in clean UTF-8 copy:

- destiny chart signals
- five-dimensional synthesis
- growth destiny chart
- today's action prescription
- timing window
- conflict cross-check
- resonance theme
- personal growth command center

Avoid:

- Absolute certainty claims.
- Fear-based fortune copy.
- Vague mystical adjectives without product meaning.
- Long hero paragraphs.

## Implementation Plan

Phase 1: Visual foundation

- Add shared signal UI primitives.
- Add page background and tokenized colors.
- Repair touched mojibake strings in dashboard/reading surfaces.

Phase 2: Logged-in dashboard

- Rebuild `UserDashboard`.
- Rebuild `ProfileCard`.
- Rebuild `IntentButtons` as entry matrix.
- Make responsive desktop/mobile layouts.

Phase 3: Daily and analysis flow

- Recompose `DailyDashboard` into today's signal board.
- Rework `AnalysisProgress` copy and visual flow.
- Audit loading/error/empty states.

Phase 4: Report experience

- Reframe report page as premium reading cockpit.
- Add sticky navigation and dimension/action sections where data allows.

Phase 5: Verification and deployment

- Typecheck.
- Lint.
- Production build.
- Search touched files for mojibake markers.
- Browser screenshot check for logged-out and logged-in reachable states.
- Deploy manually to the server and verify production HTTP pages.

## Quality Gate

Before implementation starts, this proposal needs approval on the direction:

- Brand world: five-dimensional destiny signal field + growth command center.
- Logged-in dashboard becomes the product center, not a simple card list.
- Daily, analysis progress, and reports are redesigned into one coherent system.
- Touched Chinese text must be cleaned while redesigning.
