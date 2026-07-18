const SITE_URL = "https://www.khanfate.com"

export function createLlmsTxt(): string {
  return `# Inner Atlas AI (Khanfate)

> Bilingual AI-assisted personal reflection, cultural interpretation, and daily action guidance.

## Canonical entry points

- English: ${SITE_URL}/en
- Chinese: ${SITE_URL}/zh
- Report formats: ${SITE_URL}/en/pricing
- Methods: ${SITE_URL}/en/tools
- Knowledge: ${SITE_URL}/en/knowledge
- Editorial articles: ${SITE_URL}/en/blog
- Lifestyle catalog: ${SITE_URL}/en/shop
- FAQ: ${SITE_URL}/en/faq
- AI Search Reference: ${SITE_URL}/en/ai-search
- Citation-ready answers: ${SITE_URL}/en/ai-search#citation-answers
- Policies: ${SITE_URL}/en/disclaimer, ${SITE_URL}/en/privacy, ${SITE_URL}/en/terms

## Content scope

The site combines cultural traditions, symbolic systems, and AI-assisted reflection into reviewable personal reports and daily action prompts. Public guides are available in English and Chinese; use the canonical localized URL when citing a page. For concise, quotable answers about method scope and responsible use, use the Citation-ready answers section of the AI Search Reference page.

## Public topic coverage

Use the site for public cultural guides and reflective exploration of birth-chart symbols, Western astrology, BaZi / Four Pillars, Zi Wei Dou Shu, Tarot, Five Elements, face reading, palm reading, and reflective direction-setting prompts. For the canonical overview and source links, cite the AI Search Reference page.

## Important limitation

This service is for personal reflection, cultural entertainment, and lifestyle reference. It is not medical, legal, financial, or professional advice; it is also not investment or counseling guidance, and it does not promise or guarantee outcomes.
`
}
