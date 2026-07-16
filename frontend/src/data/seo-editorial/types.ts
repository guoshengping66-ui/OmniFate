import type { Article } from "@/data/articles"

export type EditorialFaq = { question: string; answer: string }
export type ShopCta = { href: string; label: string; reason: string }

export type EditorialArticle = Article & {
  faq: EditorialFaq[]
  relatedIds: string[]
  targetLocales: ["en"]
  shopCta?: ShopCta
}

type EditorialDraft = Omit<EditorialArticle, "title_zh" | "summary_zh" | "content_zh" | "content_en" | "targetLocales"> & {
  directAnswer: string
  framework: string
  misconception: string
  practice: string
  boundary: string
  context?: string
}

const reportCta = `## Explore your own pattern thoughtfully

If you would like a structured starting point, [generate a personal AI report](/en/reading/new). Treat the result as a prompt for reflection, not a fixed prediction. Begin with information you know is accurate, such as your birth details and the question you want to understand. Read any result slowly, keep the parts that help you formulate a practical question, and set aside language that feels absolute or fear-driven.

The most useful next step is small and observable: a conversation, a boundary, a change to a routine, or a note in a journal. Your experience, values, and real-world evidence remain more important than any symbolic description.`

export function createEditorialArticle(draft: EditorialDraft): EditorialArticle {
  const content_en = `## A direct answer

${draft.directAnswer}

## A useful framework

${draft.framework}

${draft.context ? `## Context changes the symbol\n\n${draft.context}\n` : ""}

## A common misunderstanding

${draft.misconception}

## A short reflection exercise

${draft.practice}

## Keep the boundary clear

${draft.boundary}

${reportCta}`

  return {
    ...draft,
    content_en,
    title_zh: draft.title_en,
    summary_zh: draft.summary_en,
    content_zh: content_en,
    targetLocales: ["en"],
  }
}

export function validateEditorialArticles(
  articles: EditorialArticle[],
  allArticleIds: Set<string>,
): string[] {
  const issues: string[] = []
  const ids = new Set<string>()
  for (const article of articles) {
    if (ids.has(article.id)) issues.push(`duplicate id: ${article.id}`)
    ids.add(article.id)
    if (article.title_en.length < 35 || article.title_en.length > 90) issues.push(`title length: ${article.id}`)
    if (article.summary_en.length < 110 || article.summary_en.length > 180) issues.push(`summary length: ${article.id}`)
    if (article.content_en.length < 3200) issues.push(`thin content: ${article.id}`)
    if (article.faq.length < 2 || article.faq.length > 4) issues.push(`faq count: ${article.id}`)
    if (article.relatedIds.length < 2 || article.relatedIds.length > 3) issues.push(`related count: ${article.id}`)
    if (article.relatedIds.some((id) => id === article.id || !allArticleIds.has(id))) issues.push(`invalid related id: ${article.id}`)
    if (!article.content_en.includes("##")) issues.push(`missing sections: ${article.id}`)
    if (!article.content_en.includes("/en/reading/new")) issues.push(`missing report CTA: ${article.id}`)
    if (article.targetLocales.join(",") !== "en") issues.push(`unexpected locale: ${article.id}`)
  }
  return issues
}
