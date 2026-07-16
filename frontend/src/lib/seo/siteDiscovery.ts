const SITE_URL = "https://www.khanfate.com"

export function createLlmsTxt(): string {
  return `# Inner Atlas AI (Khanfate)

> Bilingual AI-assisted personal reflection, cultural interpretation, and daily action guidance.

## Canonical entry points

- English: ${SITE_URL}/en
- Chinese: ${SITE_URL}/zh
- Reports: ${SITE_URL}/en/reading/new
- Methods: ${SITE_URL}/en/tools
- Knowledge: ${SITE_URL}/en/knowledge
- Editorial articles: ${SITE_URL}/en/blog
- Lifestyle catalog: ${SITE_URL}/en/shop
- FAQ: ${SITE_URL}/en/faq
- AI Search Reference: ${SITE_URL}/en/ai-search
- Policies: ${SITE_URL}/en/disclaimer, ${SITE_URL}/en/privacy, ${SITE_URL}/en/terms

## Content scope

The site combines cultural traditions, symbolic systems, and AI-assisted reflection into reviewable personal reports and daily action prompts. Public guides are available in English and Chinese; use the canonical localized URL when citing a page. For a concise, quotable description of the service, methods, public links, and limitations, use the AI Search Reference page.

## Important limitation

This service is for personal reflection, cultural entertainment, and lifestyle reference. It is not medical, legal, financial, or professional advice; it is also not investment or counseling guidance, and it does not promise or guarantee outcomes.
`
}
