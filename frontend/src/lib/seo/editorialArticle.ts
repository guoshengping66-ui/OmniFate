const SITE_URL = "https://www.khanfate.com"
const PUBLISHER = { "@type": "Organization", name: "Inner Atlas AI", url: SITE_URL, logo: `${SITE_URL}/logo.png` }

type Locale = "en" | "zh"
type ArticleLike = {
  id: string
  title_en?: string
  title_zh?: string
  summary_en?: string
  summary_zh?: string
  tags_en?: string[]
  tags_zh?: string[]
  created_at?: string
  targetLocales?: readonly Locale[]
}

export function getArticleLocales(article: object): Locale[] {
  if (!("targetLocales" in article)) return ["en", "zh"]
  const targetLocales = (article as { targetLocales?: readonly Locale[] }).targetLocales
  return targetLocales ? [...targetLocales] : ["en", "zh"]
}

export function isArticleAvailable(article: object, locale: Locale): boolean {
  return getArticleLocales(article).includes(locale)
}

export function getArticleSocialImageUrl(locale: Locale, id: string): string {
  return `${SITE_URL}/${locale}/blog/${id}/social-image`
}

export function createArticleJsonLd(article: ArticleLike & Required<Pick<ArticleLike, "id" | "title_en" | "summary_en" | "tags_en" | "created_at">>, locale: Locale) {
  const isZh = locale === "zh"
  const title = isZh ? article.title_zh ?? article.title_en : article.title_en
  const description = isZh ? article.summary_zh ?? article.summary_en : article.summary_en
  const tags = isZh ? article.tags_zh ?? article.tags_en : article.tags_en
  const url = `${SITE_URL}/${locale}/blog/${article.id}`
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: article.created_at,
    dateModified: article.created_at,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: tags.join(", "),
    image: getArticleSocialImageUrl(locale, article.id),
    author: PUBLISHER,
    publisher: PUBLISHER,
  }
}

export function createFaqJsonLd(faq: Array<{ question: string; answer: string }>) {
  if (faq.length === 0) return null
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  }
}
