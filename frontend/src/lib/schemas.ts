/**
 * lib/schemas.ts — AI 输出 Zod 校验与 Fallback
 * =================================================
 * 当 AI (DeepSeek) 返回格式异常的 JSON 时，用 Zod 强制校验并回退到安全默认值，
 * 防止前端因字段缺失或类型错误而白屏崩溃。
 *
 * 设计原则：
 * - .catch() 提供安全默认值，不会抛异常
 * - 维度分数钳制在 [0, 100]
 * - 字符串字段永远有值（不会是 undefined / null）
 */

import { z } from "zod"

// ─── 维度分数默认值 ──────────────────────────────────────────────────────────
const DEFAULT_DIMENSION_SCORES: Record<string, number> = {
  wealth: 50,
  career: 50,
  love: 50,
  health: 50,
  knowledge: 50,
}

const DIMENSION_KEYS = Object.keys(DEFAULT_DIMENSION_SCORES)

/** 把任意值钳制到 [0, 100] 的整数 */
function clampScore(val: unknown): number {
  const n = Number(val)
  if (!Number.isFinite(n)) return 50
  return Math.max(0, Math.min(100, Math.round(n)))
}

// ─── WorkerReport Schema ─────────────────────────────────────────────────────
const WorkerReportSchema = z
  .object({
    agent_id: z.string().catch("unknown"),
    report: z.string().catch(""),
    tags: z.array(z.string()).catch([]),
    error: z.string().optional(),
    duration_ms: z.number().optional(),
  })
  .catch({
    agent_id: "unknown",
    report: "",
    tags: [],
  })

// ─── Dimension Scores Schema ─────────────────────────────────────────────────
const DimensionScoresSchema = z
  .record(z.string(), z.number())
  .catch(DEFAULT_DIMENSION_SCORES)
  .transform((raw) => {
    // 确保所有 5 个核心维度都有值，缺失的用 50 填充
    const result = { ...DEFAULT_DIMENSION_SCORES }
    for (const key of DIMENSION_KEYS) {
      result[key] = clampScore(raw[key])
    }
    // 保留 AI 返回的额外维度（如 travel, network）
    for (const [key, val] of Object.entries(raw)) {
      if (!DIMENSION_KEYS.includes(key)) {
        result[key] = clampScore(val)
      }
    }
    return result
  })

// ─── AnalysisResponse Schema ─────────────────────────────────────────────────
export const AnalysisResponseSchema = z
  .object({
    session_id: z.string().catch(""),
    status: z.string().catch("error"),
    master_summary: z.string().catch("分析结果暂时不可用，请稍后重试。"),
    master_detail: z.string().catch(""),
    is_detail_unlocked: z.boolean().catch(false),
    astrology: WorkerReportSchema,
    tarot: WorkerReportSchema,
    bazi: WorkerReportSchema,
    qimen: WorkerReportSchema,
    ziwei: WorkerReportSchema,
    face: WorkerReportSchema,
    palm: WorkerReportSchema,
    recommended_product_ids: z.array(z.string()).catch([]),
    recommended_products: z.array(z.any()).optional(),
    computed_tags: z.array(z.string()).catch([]),
    dimension_scores: DimensionScoresSchema,
    errors: z.array(z.string()).catch([]),
    intent: z
      .enum(["GENERAL_DAILY", "FULL_MULTIMODAL", "SPECIFIC_EVENT"])
      .optional(),
  })
  .passthrough() // 保留 AI 返回的额外字段

export type SafeAnalysisResponse = z.infer<typeof AnalysisResponseSchema>

// ─── DailyFortuneResponse Schema ─────────────────────────────────────────────
export const DailyFortuneResponseSchema = z
  .object({
    date: z.string().catch(() => new Date().toISOString().slice(0, 10)),
    greeting: z.string().catch("愿今日的能量与你同在"),
    overall_score: z.number().transform(clampScore).catch(50),
    wealth_fortune: z.number().transform(clampScore).catch(50),
    career_fortune: z.number().transform(clampScore).catch(50),
    love_fortune: z.number().transform(clampScore).catch(50),
    health_fortune: z.number().transform(clampScore).catch(50),
    lucky_color: z.string().catch("金色"),
    lucky_number: z.number().int().min(0).max(99).catch(7),
    advice: z.string().catch("保持平衡，稳步前行"),
    warning: z.string().catch("避免冲动决策"),
    yi: z.array(z.string()).catch(["宜沟通", "宜学习"]),
    ji: z.array(z.string()).catch(["忌冲动", "忌冒进"]),
    hourly_energy: z
      .array(
        z.object({
          hour: z.string(),
          score: z.number().transform(clampScore),
          label: z.string().optional(),
        })
      )
      .optional(),
    wuxing_today: z
      .object({
        element: z.string(),
        emoji: z.string(),
        interaction: z.string(),
      })
      .optional(),
    daily_summary: z.string().optional(),
  })
  .passthrough()

export type SafeDailyFortune = z.infer<typeof DailyFortuneResponseSchema>

// ─── PersonalizedFortune Schema ──────────────────────────────────────────────
export const PersonalizedFortuneSchema = z
  .object({
    overall_score: z.number().transform(clampScore).catch(50),
    wealth_fortune: z.number().transform(clampScore).catch(50),
    career_fortune: z.number().transform(clampScore).catch(50),
    love_fortune: z.number().transform(clampScore).catch(50),
    health_fortune: z.number().transform(clampScore).catch(50),
    lucky_color: z.string().catch("金色"),
    lucky_number: z.number().int().min(0).max(99).catch(7),
    advice: z.string().catch("保持平衡，稳步前行"),
    warning: z.string().catch("避免冲动决策"),
    personalized: z.boolean().catch(false),
  })
  .passthrough()

export type SafePersonalizedFortune = z.infer<typeof PersonalizedFortuneSchema>

// ─── Safe Parse Helpers ──────────────────────────────────────────────────────

/**
 * 安全解析 AI 分析响应 — 失败时返回带默认值的完整对象，永不抛异常
 */
export function safeParseAnalysis(data: unknown): SafeAnalysisResponse {
  try {
    return AnalysisResponseSchema.parse(data)
  } catch (e) {
    console.warn("[Zod] safeParseAnalysis fallback:", e)
    return AnalysisResponseSchema.parse({})
  }
}

/**
 * 安全解析每日运势 — 失败时返回带默认值的完整对象
 */
export function safeParseDailyFortune(data: unknown): SafeDailyFortune {
  try {
    return DailyFortuneResponseSchema.parse(data)
  } catch (e) {
    console.warn("[Zod] safeParseDailyFortune fallback:", e)
    return DailyFortuneResponseSchema.parse({})
  }
}

/**
 * 安全解析个性化运势 — 失败时返回带默认值的完整对象
 */
export function safeParsePersonalizedFortune(
  data: unknown
): SafePersonalizedFortune {
  try {
    return PersonalizedFortuneSchema.parse(data)
  } catch (e) {
    console.warn("[Zod] safeParsePersonalizedFortune fallback:", e)
    return PersonalizedFortuneSchema.parse({})
  }
}

/**
 * 安全解析维度分数 — 用于列表项等只需要 scores 的场景
 */
export function safeParseDimensionScores(
  data: unknown
): Record<string, number> {
  try {
    return DimensionScoresSchema.parse(data)
  } catch (e) {
    console.warn("[Zod] safeParseDimensionScores fallback:", e)
    return DimensionScoresSchema.parse({})
  }
}
