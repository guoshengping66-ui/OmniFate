import type { KnowledgeSubcategory } from "./categories"

import { TarotCards } from "@/data/programmatic/tarot/cards"

export const DivinationItems: KnowledgeSubcategory[] = [
  {
    id: "tarot",
    name_en: "Tarot Cards",
    name_zh: "塔罗牌",
    description_en: "The 78-card Tarot deck is a powerful divination tool. The 22 Major Arcana represent life's grand themes, while the 56 Minor Arcana reveal day-to-day influences. Each card carries deep symbolic meaning.",
    description_zh: "78张塔罗牌是强大的占卜工具。22张大阿卡纳代表人生的重大主题，56张小阿卡纳揭示日常影响。每张牌都承载深刻的象征意义。",
    items: TarotCards.map((c) => ({
      id: c.id,
      name_en: c.name_en,
      name_zh: c.name_zh,
      emoji: c.emoji,
      summary_en: c.upright_meaning_en.slice(0, 120) + "...",
      summary_zh: c.upright_meaning_zh.slice(0, 120) + "...",
      source_path: c.canonical_path,
    })),
    canonical_path: "/knowledge/divination/tarot",
  },
]
