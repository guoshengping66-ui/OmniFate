# AI Discovery GEO Design

## Goal

Increase the likelihood that search-led AI systems can discover, understand, and accurately cite Inner Atlas AI for English-language questions about birth-chart symbols, astrology, BaZi, Zi Wei Dou Shu, Tarot, Five Elements, face reading, palm reading, and reflective direction-setting.

## Constraints

- Do not claim a ranking, recommendation, prediction, credential, outcome, or endorsement that cannot be verified.
- Keep medical, legal, financial, and guaranteed-prediction boundaries explicit.
- Keep private and transactional pages unavailable to crawlers.
- Treat Cloudflare-managed crawler blocks as external configuration; application code cannot override them.

## Chosen approach

Extend the existing English-only AI Search Reference rather than create thin keyword landing pages. It will become the canonical, quotable index of the site's supported traditions, meaningful user intents, and first-party source URLs. The same authoritative URLs will be added to `llms.txt` and the sitemap.

The page will list direct, truthful entry points for natal-chart and zodiac-symbol exploration; BaZi / Four Pillars, Zi Wei Dou Shu, and Five Elements cultural guides; Tarot, face-reading, and palm-reading reflective tools; and direction-setting prompts framed as reflection rather than professional or predictive advice.

The discovery contract will explicitly allow search-oriented user agents in source-controlled robots rules, while retaining the no-training policy for GPTBot and all private-path exclusions. Production validation will separately inspect the effective Cloudflare-served `robots.txt`, because it may prepend stronger rules.

## Verification

- Unit tests require all public methods to have canonical English URLs, unique names, and bounded copy.
- Tests require `llms.txt`, sitemap, and JSON-LD to include the canonical AI reference and all disclosed methods.
- Tests require private paths to remain disallowed for all AI-search user agents.
- Production verification checks the rendered reference page, `llms.txt`, sitemap, robots response, HTTP status, and process health.

## External follow-up

Cloudflare currently denies `ClaudeBot`, `GPTBot`, and `Google-Extended` before the application rules are read. The zone's AI bot/content-signal controls must be changed by an account holder if those specific agents should be allowed. Allowing Google-Extended affects Gemini grounding/training permissions, not ordinary Google Search inclusion.
