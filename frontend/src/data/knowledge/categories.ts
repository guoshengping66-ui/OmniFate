import { ChineseMetaphysicsItems } from "./chinese-metaphysics"
import { WesternAstrologyItems } from "./western-astrology"
import { DivinationItems } from "./divination"
import { BodyReadingItems } from "./body-reading"

export interface KnowledgeItem {
  id: string
  name_en: string
  name_zh: string
  emoji: string
  summary_en: string
  summary_zh: string
  source_path: string
}

export interface KnowledgeSubcategory {
  id: string
  name_en: string
  name_zh: string
  description_en: string
  description_zh: string
  items: KnowledgeItem[]
  canonical_path: string
}

export interface KnowledgeCategory {
  id: string
  name_en: string
  name_zh: string
  emoji: string
  description_en: string
  description_zh: string
  subcategories: KnowledgeSubcategory[]
  canonical_path: string
}

export const KnowledgeCategories: KnowledgeCategory[] = [
  {
    id: "chinese-metaphysics",
    name_en: "Chinese Metaphysics",
    name_zh: "中国命理学",
    emoji: "🏯",
    description_en: "Explore the ancient wisdom of Bazi (Four Pillars), Five Elements, and Ziwei Doushu (Purple Star Astrology). These time-tested systems reveal your destiny patterns through birth data analysis.",
    description_zh: "探索八字、五行和紫微斗数的古老智慧。这些历经时间考验的系统通过出生数据揭示你的命运格局。",
    subcategories: ChineseMetaphysicsItems,
    canonical_path: "/knowledge/chinese-metaphysics",
  },
  {
    id: "western-astrology",
    name_en: "Western Astrology",
    name_zh: "西方占星学",
    emoji: "🌟",
    description_en: "Discover the power of planetary placements, zodiac signs, and astrological houses. Western astrology maps the cosmic blueprint at the moment of your birth.",
    description_zh: "探索行星配置、星座和宫位的力量。西方占星学描绘你出生时刻的宇宙蓝图。",
    subcategories: WesternAstrologyItems,
    canonical_path: "/knowledge/western-astrology",
  },
  {
    id: "divination",
    name_en: "Divination",
    name_zh: "占卜术",
    emoji: "🔮",
    description_en: "Unlock the mysteries of Tarot cards and various divination methods. These tools provide guidance and insight into your questions about love, career, and life paths.",
    description_zh: "解锁塔罗牌和各种占卜方法的奥秘。这些工具为你关于爱情、事业和人生道路的问题提供指引和洞察。",
    subcategories: DivinationItems,
    canonical_path: "/knowledge/divination",
  },
  {
    id: "body-reading",
    name_en: "Body Reading",
    name_zh: "相术",
    emoji: "👁️",
    description_en: "Learn the ancient arts of face reading (Mian Xiang) and palm reading (Shou Xiang). These practices reveal character traits and fortune through physical features.",
    description_zh: "学习面相和手相的古老艺术。这些实践通过身体特征揭示性格特质和运势。",
    subcategories: BodyReadingItems,
    canonical_path: "/knowledge/body-reading",
  },
]

export const KnowledgeCategoryMap = Object.fromEntries(
  KnowledgeCategories.map((c) => [c.id, c]),
) as Record<string, KnowledgeCategory>
