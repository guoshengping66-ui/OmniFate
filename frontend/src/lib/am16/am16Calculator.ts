// ═══════════════════════════════════════════════════════════════════════════
// AM16 核心计分与平局容灾算法
// ═══════════════════════════════════════════════════════════════════════════

import { QUESTIONS, DIMENSIONS, type QuestionOption } from "./questions"

// ── 维度分数结构 ──

interface DimensionScore {
  A: number
  B: number
}

type DimensionKey = "FD" | "XS" | "GI" | "PE"

interface Scores {
  FD: DimensionScore
  XS: DimensionScore
  GI: DimensionScore
  PE: DimensionScore
}

// ── 题目 → 维度映射 ──

const QUESTION_DIMENSION_MAP: Record<number, DimensionKey> = {
  1: "FD", 2: "FD", 3: "FD",
  4: "XS", 5: "XS", 6: "XS",
  7: "GI", 8: "GI", 9: "GI",
  10: "PE", 11: "PE", 12: "PE",
}

// ── 极字母 → 维度极映射 ──

const LETTER_TO_POLARITY: Record<string, "A" | "B"> = {
  F: "A", D: "B",
  X: "A", S: "B",
  G: "A", I: "B",
  P: "A", E: "B",
}

/**
 * 核心计分函数
 * @param answers 答案记录 { 题号: 'A' | 'B' | 'C' }
 * @returns 4 位字母编码（如 "DXIE"、"FXGP"）
 */
export function calculateArchetype(answers: Record<number, "A" | "B" | "C">): string {
  // 1. 初始化四个维度的分数
  const scores: Scores = {
    FD: { A: 0, B: 0 },
    XS: { A: 0, B: 0 },
    GI: { A: 0, B: 0 },
    PE: { A: 0, B: 0 },
  }

  // 2. 遍历每道题，累加分数
  for (const question of QUESTIONS) {
    const answer = answers[question.id]
    if (!answer) continue

    const dimKey = QUESTION_DIMENSION_MAP[question.id]
    if (!dimKey) continue

    // 根据答案选择对应选项
    const optionIndex = answer === "A" ? 0 : answer === "B" ? 1 : 2
    const option: QuestionOption = question.options[optionIndex]

    // 累加主维度分数
    const polarity = LETTER_TO_POLARITY[option.dimension]
    if (polarity) {
      scores[dimKey][polarity] += option.points
    }

    // 中间选项：同时给另一极加分
    if (option.altDimension) {
      const altPolarity = LETTER_TO_POLARITY[option.altDimension]
      if (altPolarity) {
        scores[dimKey][altPolarity] += option.points
      }
    }
  }

  // 3. 每个维度取高分极，拼接编码
  const code = DIMENSIONS.map((dim) => {
    const dimScore = scores[dim.code as DimensionKey]
    const aScore = dimScore.A
    const bScore = dimScore.B

    // ── 平局容灾规则 ──
    if (aScore === bScore) {
      // 绝对平局：默认返回 A 极（F/X/G/P）
      // 这些极更偏向「顺天/心觉/渡人/稳如」，符合 AM16 的佛系基调
      return dim.letterA
    }

    return aScore > bScore ? dim.letterA : dim.letterB
  }).join("")

  return code
}

/**
 * 计算雷达图分数（0-100 标准化）
 * 0 = 完全 A 极, 50 = 均衡, 100 = 完全 B 极
 */
export function calculateRadarScores(answers: Record<number, "A" | "B" | "C">): Record<string, number> {
  const scores: Scores = {
    FD: { A: 0, B: 0 },
    XS: { A: 0, B: 0 },
    GI: { A: 0, B: 0 },
    PE: { A: 0, B: 0 },
  }

  for (const question of QUESTIONS) {
    const answer = answers[question.id]
    if (!answer) continue

    const dimKey = QUESTION_DIMENSION_MAP[question.id]
    if (!dimKey) continue

    const optionIndex = answer === "A" ? 0 : answer === "B" ? 1 : 2
    const option: QuestionOption = question.options[optionIndex]

    const polarity = LETTER_TO_POLARITY[option.dimension]
    if (polarity) {
      scores[dimKey][polarity] += option.points
    }

    if (option.altDimension) {
      const altPolarity = LETTER_TO_POLARITY[option.altDimension]
      if (altPolarity) {
        scores[dimKey][altPolarity] += option.points
      }
    }
  }

  const radarScores: Record<string, number> = {}

  DIMENSIONS.forEach((dim) => {
    const dimScore = scores[dim.code as DimensionKey]
    const total = dimScore.A + dimScore.B

    if (total === 0) {
      radarScores[dim.code] = 50 // 默认均衡
    } else {
      radarScores[dim.code] = Math.round((dimScore.B / total) * 100)
    }
  })

  return radarScores
}
