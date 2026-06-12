// ═══════════════════════════════════════════════════════════════════════════
// AM16 — 命格等级系统 (Fate Level)
// ═══════════════════════════════════════════════════════════════════════════

export interface FateLevel {
  id: string
  name: string
  nameEn: string
  emoji: string
  /** 百分比击败率（显示为 "击败了XX%的命格"） */
  beatPercent: number
  /** 分布比例 */
  distribution: number
  color: string
  glowColor: string
}

export const FATE_LEVELS: FateLevel[] = [
  {
    id: "mortal",
    name: "凡尘",
    nameEn: "Mortal",
    emoji: "🌿",
    beatPercent: 15,
    distribution: 35,
    color: "text-white/60",
    glowColor: "from-white/5 to-white/0",
  },
  {
    id: "awakened",
    name: "觉醒",
    nameEn: "Awakened",
    emoji: "✨",
    beatPercent: 50,
    distribution: 30,
    color: "text-blue-400",
    glowColor: "from-blue-500/10 to-blue-500/0",
  },
  {
    id: "seer",
    name: "观命",
    nameEn: "Seer",
    emoji: "👁️",
    beatPercent: 72,
    distribution: 20,
    color: "text-purple-400",
    glowColor: "from-purple-500/10 to-purple-500/0",
  },
  {
    id: "rebel",
    name: "逆命",
    nameEn: "Rebel",
    emoji: "⚔️",
    beatPercent: 88,
    distribution: 12,
    color: "text-red-400",
    glowColor: "from-red-500/10 to-red-500/0",
  },
  {
    id: "chosen",
    name: "天选",
    nameEn: "Chosen",
    emoji: "👑",
    beatPercent: 97,
    distribution: 3,
    color: "text-amber-400",
    glowColor: "from-amber-500/15 to-yellow-500/0",
  },
]

// ── 每个 AM16 编码的固定命格等级映射 ──
// 确保同一编码总是得到相同等级（无随机性）
const CODE_TO_LEVEL: Record<string, string> = {
  DXIE: "chosen",    // 凌晨三点与天对线狂人 — 最强反骨
  DSIE: "chosen",    // 格物派逆天执行狂魔 — 全能战士
  DXIP: "rebel",     // 孤独的直觉反骨战士
  DSGE: "rebel",     // 全栈型改命运维工程师
  FXIE: "seer",      // 躺平界的灵感型社交达人
  DSIP: "seer",      // 冷酷格物修仙独狼
  DXGE: "seer",      // 红尘蹦迪的改运队长
  DSGP: "awakened",  // 数据型反骨拖延症
  DXGP: "awakened",  // 嘴炮逆天实际躺平侠
  FSIE: "awakened",  // 孤独的科学改命极客
  FXGE: "awakened",  // 玄学界佛系社交蝴蝶
  FSGE: "mortal",    // 格物派人肉客服
  FSGP: "mortal",    // 数据型佛系躺平家
  FSIP: "mortal",    // Excel 表格算命隐士
  FXGP: "mortal",    // 心学派顶级躺平咸鱼
  FXIP: "mortal",    // 高维冥想隐世咸鱼
}

/**
 * 根据 AM16 编码获取命格等级
 */
export function getFateLevel(code: string): FateLevel {
  const levelId = CODE_TO_LEVEL[code] ?? "mortal"
  return FATE_LEVELS.find(l => l.id === levelId) ?? FATE_LEVELS[0]
}
