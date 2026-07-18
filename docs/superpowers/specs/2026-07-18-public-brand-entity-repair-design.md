# Public Brand Entity Repair Design

## Goal

Ensure every active public translation, visible sharing label, legal copy, and public configuration names one organization: Inner Atlas AI at khanfate.com.

## Root cause

Next-intl loads `src/i18n/{locale}.json` at runtime. Those JSON files still contain old product names across FAQ, legal, sharing, login, referral, and SEO copy. Search indexes therefore receive mixed brand signals even though newer page metadata uses Inner Atlas AI.

## Approach

- Replace legacy brand names and legacy domain references in active `en.json` and `zh.json` with Inner Atlas AI and khanfate.com.
- Apply the same mechanical replacement to inactive translation sources and user-visible configuration strings so future imports cannot reintroduce the old entity.
- Add one source-contract test covering every public-copy source. It allows historical references in test assertions only; it blocks legacy names from product copy.

## Boundaries

- Do not change user records, domains, payment providers, prices, checkout contracts, or legal obligations beyond the displayed product/operator brand.
- Do not claim Cloudflare crawler access has changed; ClaudeBot remains an external setting.
