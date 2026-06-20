import type { KnowledgeSubcategory } from "./categories"

import { PalmLines } from "@/data/programmatic/palm/lines"
import { PalmMounts } from "@/data/programmatic/palm/mounts"
import { FaceFeatures } from "@/data/programmatic/face/features"
import { FaceShapes } from "@/data/programmatic/face/shapes"

export const BodyReadingItems: KnowledgeSubcategory[] = [
  {
    id: "palm-lines",
    name_en: "Palm Lines",
    name_zh: "手纹",
    description_en: "The major lines on your palm — Heart Line, Head Line, Life Line, and Fate Line — reveal key aspects of your emotional life, intellect, vitality, and destiny.",
    description_zh: "手掌上的主要纹路——感情线、智慧线、生命线和事业线——揭示你情感生活、智力、活力和命运的关键方面。",
    items: PalmLines.map((l) => ({
      id: l.id,
      name_en: l.name_en,
      name_zh: l.name_zh,
      emoji: l.emoji,
      summary_en: l.overview_en.slice(0, 120) + "...",
      summary_zh: l.overview_zh.slice(0, 120) + "...",
      source_path: l.canonical_path,
    })),
    canonical_path: "/knowledge/body-reading/palm-lines",
  },
  {
    id: "palm-mounts",
    name_en: "Palm Mounts",
    name_zh: "掌丘",
    description_en: "The raised areas on your palm, called mounts, are named after planets and reveal different life energies. The Mount of Jupiter shows ambition, Saturn reveals discipline, and Apollo indicates creativity.",
    description_zh: "手掌上的隆起区域称为掌丘，以行星命名，揭示不同的生命能量。木星丘显示抱负，土星丘揭示纪律，太阳丘表示创造力。",
    items: PalmMounts.map((m) => ({
      id: m.id,
      name_en: m.name_en,
      name_zh: m.name_zh,
      emoji: m.emoji,
      summary_en: m.overview_en.slice(0, 120) + "...",
      summary_zh: m.overview_zh.slice(0, 120) + "...",
      source_path: m.canonical_path,
    })),
    canonical_path: "/knowledge/body-reading/palm-mounts",
  },
  {
    id: "face-features",
    name_en: "Facial Features",
    name_zh: "五官",
    description_en: "In Chinese face reading (Mian Xiang), each facial feature reveals character traits. Eyes show intelligence and emotion, the nose indicates wealth potential, and the mouth reveals communication style.",
    description_zh: "在中华面相学中，每个面部特征揭示性格特质。眼睛显示智慧和情感，鼻子表示财富潜力，嘴巴揭示沟通风格。",
    items: FaceFeatures.map((f) => ({
      id: f.id,
      name_en: f.name_en,
      name_zh: f.name_zh,
      emoji: f.emoji,
      summary_en: f.overview_en.slice(0, 120) + "...",
      summary_zh: f.overview_zh.slice(0, 120) + "...",
      source_path: f.canonical_path,
    })),
    canonical_path: "/knowledge/body-reading/face-features",
  },
  {
    id: "face-shapes",
    name_en: "Face Shapes",
    name_zh: "脸型",
    description_en: "Face shape is one of the first things assessed in Chinese face reading. Each shape — oval, round, square, heart, oblong, and diamond — corresponds to specific personality traits and fortune patterns.",
    description_zh: "脸型是中华面相学中首先评估的特征之一。每种形状——鹅蛋脸、圆脸、方脸、心形脸、长脸和菱形脸——对应特定的性格特质和运势模式。",
    items: FaceShapes.map((s) => ({
      id: s.id,
      name_en: s.name_en,
      name_zh: s.name_zh,
      emoji: s.emoji,
      summary_en: s.overview_en.slice(0, 120) + "...",
      summary_zh: s.overview_zh.slice(0, 120) + "...",
      source_path: s.canonical_path,
    })),
    canonical_path: "/knowledge/body-reading/face-shapes",
  },
]
