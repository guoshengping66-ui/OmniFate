// ═══════════════════════════════════════════════════════════════════════════
// AM16 计算引擎 — 答案 → 分数 → 人格编码
// ═══════════════════════════════════════════════════════════════════════════

import {
  AM16_QUESTIONS,
  PERSONALITIES,
  DIMENSIONS,
  type AM16Personality,
} from "./constants"

/** 每个维度两极的原始分数 */
export interface DimensionScores {
  F: number
  D: number
  X: number
  S: number
  G: number
  I: number
  P: number
  E: number
}

export interface AM16Result {
  /** 4维分数（雷达图用） */
  radarScores: Record<string, number>
  /** 8极原始分数 */
  rawScores: DimensionScores
  /** 4字母人格编码 */
  code: string
  /** 人格定义 */
  personality: AM16Personality
}

/**
 * 从 12 个答案计算 AM16 人格
 * @param answers 每题的选择索引（0 = A, 1 = B）
 * @returns 完整的 AM16 结果
 */
export function calculateAM16(answers: number[]): AM16Result {
  // 1. 初始化分数
  const raw: DimensionScores = { F: 0, D: 0, X: 0, S: 0, G: 0, I: 0, P: 0, E: 0 }

  // 2. 累加每题的分数
  answers.forEach((choice, i) => {
    const q = AM16_QUESTIONS[i]
    if (!q) return
    const option = choice === 0 ? q.optionA : q.optionB
    const dim = option.dimension as keyof DimensionScores
    raw[dim] += option.points
  })

  // 3. 每个维度取高分极 → 拼接编码
  const code = DIMENSIONS.map(d => {
    const aScore = raw[d.letterA as keyof DimensionScores]
    const bScore = raw[d.letterB as keyof DimensionScores]
    // 平局时默认 B 极（更有主见）
    return aScore > bScore ? d.letterA : d.letterB
  }).join("")

  // 4. 雷达图分数（0-100 标准化，每维度最高 3 分）
  const radarScores: Record<string, number> = {}
  DIMENSIONS.forEach(d => {
    const aScore = raw[d.letterA as keyof DimensionScores]
    const bScore = raw[d.letterB as keyof DimensionScores]
    const total = aScore + bScore
    // 0 = 完全 A 极, 50 = 均衡, 100 = 完全 B 极
    radarScores[d.code] = total > 0 ? Math.round((bScore / total) * 100) : 50
  })

  // 5. 查表获取人格
  const personality = PERSONALITIES[code] ?? PERSONALITIES["DXIE"] // fallback

  return {
    radarScores,
    rawScores: raw,
    code,
    personality,
  }
}
