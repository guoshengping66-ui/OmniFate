import { AI_SEARCH_REFERENCE } from "@/data/seo/aiSearchReference"
import { createPublisherJsonLd } from "./structuredData"

const SITE_URL = "https://www.khanfate.com"
const PAGE_URL = `${SITE_URL}/en/ai-search`

export function createAiSearchReferenceJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: AI_SEARCH_REFERENCE.title,
      description: AI_SEARCH_REFERENCE.description,
      url: PAGE_URL,
      inLanguage: "en",
      publisher: createPublisherJsonLd(),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Inner Atlas AI public methods",
      itemListElement: AI_SEARCH_REFERENCE.methods.map((method, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: method.name,
        url: `${SITE_URL}${method.href}`,
        description: method.description,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: AI_SEARCH_REFERENCE.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ] as const
}
