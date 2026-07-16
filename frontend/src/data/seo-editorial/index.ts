import { ASTROLOGY_AND_METAPHYSICS_ARTICLES } from "./astrology-and-metaphysics.ts"
import { BAZI_AND_ELEMENT_ARTICLES } from "./bazi-and-elements.ts"
import { TAROT_AND_BODY_READING_ARTICLES } from "./tarot-and-body-reading.ts"

export { type EditorialArticle, type EditorialFaq, type ShopCta, validateEditorialArticles } from "./types.ts"

export const SEO_EDITORIAL_ARTICLES = [
  ...BAZI_AND_ELEMENT_ARTICLES,
  ...ASTROLOGY_AND_METAPHYSICS_ARTICLES,
  ...TAROT_AND_BODY_READING_ARTICLES,
]
