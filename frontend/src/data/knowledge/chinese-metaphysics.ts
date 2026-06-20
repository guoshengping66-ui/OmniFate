import type { KnowledgeSubcategory } from "./categories"

import { BaziDayMasters } from "@/data/programmatic/bazi/dayMasters"
import { BaziTenGods } from "@/data/programmatic/bazi/tenGods"
import { FiveElements } from "@/data/programmatic/five-elements/elements"
import { ZiweiStars } from "@/data/programmatic/ziwei/stars"
import { ZiweiPalaces } from "@/data/programmatic/ziwei/palaces"

export const ChineseMetaphysicsItems: KnowledgeSubcategory[] = [
  {
    id: "bazi",
    name_en: "Bazi (Four Pillars of Destiny)",
    name_zh: "八字（四柱命理）",
    description_en: "Bazi uses your birth date and time to map eight characters representing your destiny. It reveals personality, career aptitude, relationships, and life patterns through the interplay of Heavenly Stems and Earthly Branches.",
    description_zh: "八字利用你的出生日期和时间来映射代表你命运的八个字。它通过天干地支的相互作用揭示性格、事业才能、人际关系和人生模式。",
    items: BaziDayMasters.map((m) => ({
      id: m.id,
      name_en: m.name_en,
      name_zh: m.name_zh,
      emoji: m.emoji,
      summary_en: m.personality_en.slice(0, 120) + "...",
      summary_zh: m.personality_zh.slice(0, 120) + "...",
      source_path: m.canonical_path,
    })),
    canonical_path: "/knowledge/chinese-metaphysics/bazi",
  },
  {
    id: "ten-gods",
    name_en: "Ten Gods (Shi Shen)",
    name_zh: "十神",
    description_en: "The Ten Gods system describes the relationships between your Day Master and other elements in your chart. Each god represents a specific type of energy — from authority and wealth to creativity and competition.",
    description_zh: "十神系统描述你的日主与命盘中其他元素之间的关系。每个神代表一种特定的能量类型——从权威和财富到创造力和竞争。",
    items: BaziTenGods.map((g) => ({
      id: g.id,
      name_en: g.name_en,
      name_zh: g.name_zh,
      emoji: g.emoji,
      summary_en: g.overview_en.slice(0, 120) + "...",
      summary_zh: g.overview_zh.slice(0, 120) + "...",
      source_path: g.canonical_path,
    })),
    canonical_path: "/knowledge/chinese-metaphysics/ten-gods",
  },
  {
    id: "five-elements",
    name_en: "Five Elements (Wu Xing)",
    name_zh: "五行",
    description_en: "The Five Elements — Wood, Fire, Earth, Metal, and Water — form the foundation of Chinese metaphysics. Their cycles of generation and control influence every aspect of life, from health to relationships.",
    description_zh: "五行——木、火、土、金、水——构成了中国命理学的基础。它们的相生相克循环影响着生活的方方面面，从健康到人际关系。",
    items: FiveElements.map((e) => ({
      id: e.id,
      name_en: e.name_en,
      name_zh: e.name_zh,
      emoji: e.emoji,
      summary_en: e.overview_en.slice(0, 120) + "...",
      summary_zh: e.overview_zh.slice(0, 120) + "...",
      source_path: e.canonical_path,
    })),
    canonical_path: "/knowledge/chinese-metaphysics/five-elements",
  },
  {
    id: "ziwei-stars",
    name_en: "Ziwei Stars",
    name_zh: "紫微斗数星曜",
    description_en: "Ziwei Doushu (Purple Star Astrology) uses 14 main stars to map your destiny. Each star carries unique energy — from the Emperor Star's authority to the Moon Star's intuition.",
    description_zh: "紫微斗数使用十四颗主星来映射你的命运。每颗星承载独特的能量——从紫微星的权威到太阴星的直觉。",
    items: ZiweiStars.map((s) => ({
      id: s.id,
      name_en: s.name_en,
      name_zh: s.name_zh,
      emoji: s.emoji,
      summary_en: s.overview_en.slice(0, 120) + "...",
      summary_zh: s.overview_zh.slice(0, 120) + "...",
      source_path: s.canonical_path,
    })),
    canonical_path: "/knowledge/chinese-metaphysics/ziwei-stars",
  },
  {
    id: "ziwei-palaces",
    name_en: "Ziwei Palaces",
    name_zh: "紫微斗数宫位",
    description_en: "The 12 palaces in Ziwei Doushu represent different life domains — from the Life Palace (personality) to the Career Palace (professional success). Stars placed in these palaces reveal specific life patterns.",
    description_zh: "紫微斗数的十二宫代表不同的人生领域——从命宫（性格）到官禄宫（事业成功）。落在这些宫位的星辰揭示特定的人生模式。",
    items: ZiweiPalaces.map((p) => ({
      id: p.id,
      name_en: p.name_en,
      name_zh: p.name_zh,
      emoji: p.emoji,
      summary_en: p.overview_en.slice(0, 120) + "...",
      summary_zh: p.overview_zh.slice(0, 120) + "...",
      source_path: p.canonical_path,
    })),
    canonical_path: "/knowledge/chinese-metaphysics/ziwei-palaces",
  },
]
