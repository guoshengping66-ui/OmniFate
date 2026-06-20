import type { KnowledgeSubcategory } from "./categories"

import { ZodiacSigns } from "@/data/programmatic/zodiac/signs"
import { AstrologyPlanets } from "@/data/programmatic/astrology/planets"
import { AstrologyHouses } from "@/data/programmatic/astrology/houses"

export const WesternAstrologyItems: KnowledgeSubcategory[] = [
  {
    id: "zodiac",
    name_en: "Zodiac Signs",
    name_zh: "十二星座",
    description_en: "The 12 zodiac signs define your Sun sign personality — from Aries' fiery leadership to Pisces' intuitive compassion. Each sign has unique traits, compatible matches, and career inclinations.",
    description_zh: "十二星座定义你的太阳星座性格——从白羊座的火热领导力到双鱼座的直觉同理心。每个星座都有独特的特质、配对和职业倾向。",
    items: ZodiacSigns.map((s) => ({
      id: s.id,
      name_en: s.name_en,
      name_zh: s.name_zh,
      emoji: s.symbol,
      summary_en: s.personality_overview_en.slice(0, 120) + "...",
      summary_zh: s.personality_overview_zh.slice(0, 120) + "...",
      source_path: s.canonical_path,
    })),
    canonical_path: "/knowledge/western-astrology/zodiac",
  },
  {
    id: "planets",
    name_en: "Planets",
    name_zh: "十大行星",
    description_en: "Each planet in astrology governs different aspects of life. The Sun represents core identity, the Moon governs emotions, Mercury rules communication, and Venus influences love and beauty.",
    description_zh: "占星学中的每颗行星掌管生活的不同方面。太阳代表核心身份，月亮掌管情绪，水星掌管沟通，金星影响爱情和美丽。",
    items: AstrologyPlanets.map((p) => ({
      id: p.id,
      name_en: p.name_en,
      name_zh: p.name_zh,
      emoji: p.emoji,
      summary_en: p.overview_en.slice(0, 120) + "...",
      summary_zh: p.overview_zh.slice(0, 120) + "...",
      source_path: p.canonical_path,
    })),
    canonical_path: "/knowledge/western-astrology/planets",
  },
  {
    id: "houses",
    name_en: "Astrological Houses",
    name_zh: "占星宫位",
    description_en: "The 12 astrological houses represent different life areas — from the First House (self) to the Twelfth House (subconscious). Planets in houses reveal where energy flows in your life.",
    description_zh: "十二占星宫位代表不同的生活领域——从第一宫（自我）到第十二宫（潜意识）。宫位中的行星揭示你生活中能量流动的方向。",
    items: AstrologyHouses.map((h) => ({
      id: h.id,
      name_en: h.name_en,
      name_zh: h.name_zh,
      emoji: "🏠",
      summary_en: h.overview_en.slice(0, 120) + "...",
      summary_zh: h.overview_zh.slice(0, 120) + "...",
      source_path: h.canonical_path,
    })),
    canonical_path: "/knowledge/western-astrology/houses",
  },
]
