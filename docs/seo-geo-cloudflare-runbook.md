# Cloudflare AI Search Crawler Runbook

## Approved policy

- Allow public search retrieval by `OAI-SearchBot`, `OAI-AdsBot`, `PerplexityBot`, and `ClaudeBot` when the business chooses to make its public guides available to those answer engines.
- Keep `GPTBot` blocked so public pages are not offered for OpenAI foundation-model training.
- Keep the site-wide Cloudflare content signal `ai-train=no`.
- Keep private paths blocked: `/account`, `/checkout`, `/readings`, and `/api/`.

## Apply in Cloudflare

1. Sign in to the Cloudflare account that owns `khanfate.com` and select the zone.
2. Open the managed AI-crawler or content-signals setting that currently injects the `Cloudflare Managed Content` block into `/robots.txt`.
3. Replace blanket blocks for the approved retrieval crawlers with allow rules for public search retrieval. Do not allow `GPTBot`, and do not change DNS, cache, or unrelated bot settings.
4. If a WAF or bot-fight rule denies these crawlers, add narrowly scoped allow rules that require both the crawler user agent and the provider's current published IP ranges. Do not allow a crawler based on its user-agent string alone.
5. Keep `GPTBot` blocked. Do not turn `ai-train` on.
6. Purge the single URL `https://khanfate.com/robots.txt` from Cloudflare cache after changing managed content signals.
7. Verify the public response contains allowed retrieval groups, a blocked `GPTBot` group, and the application-level private path exclusions. Then inspect Cloudflare security events to confirm verified crawler requests reach `/en/ai-search`, `/llms.txt`, and `/sitemap.xml` without a 403.

## Verification

```bash
curl -sS https://khanfate.com/robots.txt
```

The final response must not contain `User-agent: OAI-SearchBot` followed by `Disallow: /`. It must contain `User-agent: GPTBot` followed by `Disallow: /`. A July 18, 2026 external check returned HTTP 403 for requests labelled `OAI-SearchBot`, `PerplexityBot`, and `ClaudeBot`; that is evidence of edge handling to review, not proof that an arbitrary user-agent header is a verified crawler.
