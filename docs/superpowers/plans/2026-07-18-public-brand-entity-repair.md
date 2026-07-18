# Public Brand Entity Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove mixed legacy brand and domain references from public copy so crawlers identify Inner Atlas AI consistently.

**Architecture:** Next-intl runtime JSON is the production source of truth. A Node source-contract test checks the JSON, legacy fallback translations, and public configuration copy for banned legacy values.

**Tech Stack:** Next.js, next-intl JSON messages, TypeScript, Node test runner.

## Global Constraints

- Public product identity is exactly `Inner Atlas AI`.
- Public domain references use `khanfate.com`.
- Do not change payment, account, or report behavior.

---

### Task 1: Add a failing public-brand contract

**Files:**
- Create: `frontend/src/i18n/publicBrandingContract.test.ts`

- [ ] **Step 1: Assert each public-copy source excludes `Behavioral Mirror`, `AlphaMirror`, `Guanwo Fate`, and `khanpattern.com`.**
- [ ] **Step 2: Run `npx tsx --test src/i18n/publicBrandingContract.test.ts`; expect failure from active JSON messages.**

### Task 2: Canonicalize visible public copy

**Files:**
- Modify: `frontend/src/i18n/en.json`
- Modify: `frontend/src/i18n/zh.json`
- Modify: `frontend/src/i18n/en.ts`
- Modify: `frontend/src/i18n/zh.ts`
- Modify: `frontend/src/lib/am16/questions.ts`
- Modify: `frontend/src/lib/pricing.config.ts`

- [ ] **Step 1: Replace each legacy product name with `Inner Atlas AI` and each old domain with `khanfate.com`.**
- [ ] **Step 2: Run the new contract test; expect pass.**

### Task 3: Verify and deploy

- [ ] **Step 1: Run all `*.test.ts`, TypeScript, ESLint, and production build.**
- [ ] **Step 2: Deploy with the established standalone + PM2 procedure.**
- [ ] **Step 3: Verify FAQ and disclaimer responses name Inner Atlas AI and no longer contain legacy brands.**
