# Cloudflare AI Search Crawler Runbook

## Approved policy

- Allow public search retrieval by `OAI-SearchBot`.
- Keep `GPTBot` blocked so public pages are not offered for OpenAI foundation-model training.
- Keep the site-wide Cloudflare content signal `ai-train=no`.
- Keep private paths blocked: `/account`, `/checkout`, `/readings`, and `/api/`.

## Apply in Cloudflare

1. Sign in to the Cloudflare account that owns `khanfate.com` and select the zone.
2. Open the managed AI-crawler or content-signals setting that currently injects the `Cloudflare Managed Content` block into `/robots.txt`.
3. Replace the blanket block for `OAI-SearchBot` with an allow rule for public search retrieval. Do not change DNS, WAF, cache, or unrelated bot settings.
4. Keep `GPTBot` blocked. Do not turn `ai-train` on.
5. Purge the single URL `https://khanfate.com/robots.txt` from Cloudflare cache.
6. Verify the public response contains an allowed `OAI-SearchBot` group, a blocked `GPTBot` group, and the application-level private path exclusions.

## Verification

```bash
curl -sS https://khanfate.com/robots.txt
```

The final response must not contain `User-agent: OAI-SearchBot` followed by `Disallow: /`. It must contain `User-agent: GPTBot` followed by `Disallow: /`.
