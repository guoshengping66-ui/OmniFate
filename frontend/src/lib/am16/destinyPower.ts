// ═══════════════════════════════════════════════════════════════════════════
// AM16 — 命运战力系统 (Destiny Power)
// ═══════════════════════════════════════════════════════════════════════════

import type { DimensionScores } from "./calculator"

// ── 战力维度定义 ──

export interface PowerDimension {
  key: string
  labelCn: string
  labelEn: string
  icon: string
}

export const POWER_DIMENSIONS: PowerDimension[] = [
  { key: "wealth", labelCn: "财富", labelEn: "Wealth", icon: "💰" },
  { key: "career", labelCn: "事业", labelEn: "Career", icon: "📈" },
  { key: "romance", labelCn: "感情", labelEn: "Romance", icon: "💜" },
  { key: "health", labelCn: "健康", labelEn: "Health", icon: "💚" },
  { key: "spirit", labelCn: "精神", labelEn: "Spirit", icon: "🔮" },
]

// ── 战力等级映射 ──

export interface PowerRank {
  rank: string
  minScore: number
}

const POWER_RANKS: PowerRank[] = [
  { rank: "S+", minScore: 900 },
  { rank: "S", minScore: 800 },
  { rank: "A+", minScore: 700 },
  { rank: "A", minScore: 600 },
  { rank: "B+", minScore: 500 },
  { rank: "B", minScore: 400 },
  { rank: "C+", minScore: 300 },
  { rank: "C", minScore: 200 },
  { rank: "D", minScore: 100 },
  { rank: "F", minScore: 0 },
]

export function getPowerRank(score: number): string {
  for (const r of POWER_RANKS) {
    if (score >= r.minScore) return r.rank
  }
  return "F"
}

// ── 每个 AM16 编码的基础战力（满分 1000）──
// 基于人格特质的经验评估

const BASE_POWER: Record<string, { wealth: number; career: number; romance: number; health: number; spirit: number }> = {
  DXIE: { wealth: 850, career: 920, romance: 550, health: 700, spirit: 880 },
  DSIE: { wealth: 800, career: 900, romance: 600, health: 750, spirit: 820 },
  DXIP: { wealth: 650, career: 780, romance: 400, health: 680, spirit: 900 },
  DSGE: { wealth: 780, career: 850, romance: 650, health: 720, spirit: 750 },
  FXIE: { wealth: 600, career: 550, romance: 720, health: 600, spirit: 850 },
  DSIP: { wealth: 700, career: 800, romance: 350, health: 700, spirit: 880 },
  DXGE: { wealth: 620, career: 750, romance: 700, health: 650, spirit: 700 },
  DSGP: { wealth: 680, career: 720, romance: 500, health: 650, spirit: 700 },
  DXGP: { wealth: 450, career: 500, romance: 550, health: 600, spirit: 650 },
  FSIE: { wealth: 720, career: 780, romance: 450, health: 680, spirit: 820 },
  FXGE: { wealth: 500, career: 480, romance: 750, health: 550, spirit: 700 },
  FSGE: { wealth: 550, career: 580, romance: 600, health: 580, spirit: 600 },
  FSGP: { wealth: 500, career: 520, romance: 500, health: 620, spirit: 650 },
  FSIP: { wealth: 580, career: 600, romance: 350, health: 600, spirit: 750 },
  FXGP: { wealth: 350, career: 380, romance: 450, health: 550, spirit: 600 },
  FXIP: { wealth: 300, career: 350, romance: 300, health: 500, spirit: 800 },
}

// ── 类型定义 ──

export interface DimensionPower {
  score: number
  rank: string
}

export interface DestinyPower {
  total: number
  wealth: DimensionPower
  career: DimensionPower
  romance: DimensionPower
  health: DimensionPower
  spirit: DimensionPower
  strongest: { labelCn: string; labelEn: string; rank: string }
  weakest: { labelCn: string; labelEn: string; rank: string }
}

/**
 * 计算命运战力
 * @param code AM16 四字母编码
 * @param radarScores 四维雷达分数（FD/XS/GI/PE，0-100）
 */
export function calculateDestinyPower(
  code: string,
  radarScores: Record<string, number>,
): DestinyPower {
  const base = BASE_POWER[code] ?? BASE_POWER["FXGP"]

  // ── 雷达分数调整因子（-10% ~ +10%）──
  // FD 维度影响健康和精神
  // XS 维度影响精神和事业
  // GI 维度影响感情和精神
  // PE 维度影响事业和财富
  const fd = (radarScores["FD"] ?? 50) / 100  // 0-1, >0.5 偏逆天
  const xs = (radarScores["XS"] ?? 50) / 100  // >0.5 偏硬核
  const gi = (radarScores["GI"] ?? 50) / 100  // >0.5 偏闭门
  const pe = (radarScores["PE"] ?? 50) / 100  // >0.5 偏行动

  const clamp = (v: number) => Math.max(100, Math.min(1000, Math.round(v)))

  const wealth = clamp(base.wealth * (0.9 + pe * 0.2))
  const career = clamp(base.career * (0.9 + xs * 0.1 + pe * 0.1))
  const romance = clamp(base.romance * (0.9 + (1 - gi) * 0.2))
  const health = clamp(base.health * (0.9 + fd * 0.1 + (1 - fd) * 0.1))
  const spirit = clamp(base.spirit * (0.9 + xs * 0.05 + gi * 0.1 + fd * 0.05))

  const total = Math.round((wealth + career + romance + health + spirit) / 5 * 10)

  const dims: Record<string, DimensionPower> = {
    wealth: { score: wealth, rank: getPowerRank(wealth) },
    career: { score: career, rank: getPowerRank(career) },
    romance: { score: romance, rank: getPowerRank(romance) },
    health: { score: health, rank: getPowerRank(health) },
    spirit: { score: spirit, rank: getPowerRank(spirit) },
  }

  let strongest = { key: "wealth", score: 0 }
  let weakest = { key: "wealth", score: 9999 }
  for (const [k, v] of Object.entries(dims)) {
    if (v.score > strongest.score) strongest = { key: k, score: v.score }
    if (v.score < weakest.score) weakest = { key: k, score: v.score }
  }

  const dimMap = Object.fromEntries(POWER_DIMENSIONS.map(d => [d.key, d]))

  return {
    total,
    wealth: dims.wealth,
    career: dims.career,
    romance: dims.romance,
    health: dims.health,
    spirit: dims.spirit,
    strongest: {
      labelCn: dimMap[strongest.key].labelCn,
      labelEn: dimMap[strongest.key].labelEn,
      rank: dims[strongest.key].rank,
    },
    weakest: {
      labelCn: dimMap[weakest.key].labelCn,
      labelEn: dimMap[weakest.key].labelEn,
      rank: dims[weakest.key].rank,
    },
  }
}
