"use client"
import { useState, useMemo, lazy, Suspense } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import type { StructuredReport } from "@/types/report"

// Lazy load structured report component
const StructuredReportComponent = lazy(() =>
  import("./StructuredReport").then(m => ({ default: m.StructuredReport }))
)

/** Strip Markdown formatting and garbled symbols from LLM-generated text */
function stripMarkdown(text: string): string {
  return text
    .replace(/```json\s*[\s\S]*?```/g, "")
    .replace(/```\w*\s*[\s\S]*?```/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/#-+/g, "")
    .replace(/^#+\s*$/gm, "")
    .replace(/^\s*[-*+]\s+(?=[#-])/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/**
 * 检测内容是否为结构化JSON格式
 * 并解析为 StructuredReport 对象
 */
function parseStructuredContent(content: string): StructuredReport | null {
  if (!content) return null

  // 尝试提取JSON（可能被```json包裹）
  let jsonStr = content
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  try {
    const parsed = JSON.parse(jsonStr)

    // 验证是否为结构化报告格式
    if (
      parsed.summary &&
      parsed.dimensions &&
      typeof parsed.dimensions === "object" &&
      (parsed.dimensions.wealth || parsed.dimensions.relationship || parsed.dimensions.health)
    ) {
      return parsed as StructuredReport
    }
  } catch {
    // 非JSON格式，返回null使用传统渲染
  }

  return null
}

// ── Line type detection ──────────────────────────────────────────────────────

type LineType = "heading" | "bullet" | "highlight" | "empty" | "text"

interface ParsedLine {
  type: LineType
  content: string
  /** For highlight lines: the highlighted text inside 【】 */
  highlightText?: string
}

const HEADING_PATTERNS = [
  /^[一二三四五六七八九十]+[、．.]\s*/,        // 一、 二、
  /^[（(]\s*[一二三四五六七八九十\d]+\s*[)）]\s*/, // （一） (1)
  /^\d+[、．.]\s+/,                             // 1. 2.
  /^[①②③④⑤⑥⑦⑧⑨⑩]\s*/,                     // ① ②
  /^【[^】]+】\s*/,                              // 【标题】
  /^「[^」]+」\s*/,                              // 「标题」
]

const BULLET_PATTERNS = /^[•·●○◆◇▪▸➤✓✔✅❌⚠️☆★]\s*/

function classifyLine(line: string): LineType {
  const trimmed = line.trim()
  if (!trimmed) return "empty"
  if (HEADING_PATTERNS.some(p => p.test(trimmed))) return "heading"
  if (BULLET_PATTERNS.test(trimmed)) return "bullet"
  if (/^[【「]/.test(trimmed) && /[】」]/.test(trimmed)) return "highlight"
  return "text"
}

function parseLines(text: string): ParsedLine[] {
  const clean = stripMarkdown(text)
  const rawLines = clean.split("\n")
  const result: ParsedLine[] = []

  for (const raw of rawLines) {
    const trimmed = raw.trim()
    if (!trimmed) {
      // Collapse consecutive empty lines
      if (result.length > 0 && result[result.length - 1].type === "empty") continue
      result.push({ type: "empty", content: "" })
      continue
    }

    const type = classifyLine(trimmed)
    let content = trimmed
    let highlightText: string | undefined

    // Strip heading markers for display
    if (type === "heading") {
      content = trimmed
        .replace(/^[一二三四五六七八九十]+[、．.]\s*/, "")
        .replace(/^[（(]\s*[一二三四五六七八九十\d]+\s*[)）]\s*/, "")
        .replace(/^\d+[、．.]\s+/, "")
        .replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "")
        .replace(/^【([^】]+)】\s*/, "")
        .replace(/^「([^」]+)」\s*/, "")
    }

    // Extract highlight text
    if (type === "highlight" || type === "text") {
      const m = trimmed.match(/【([^】]+)】|「([^」]+)」/)
      if (m) {
        highlightText = m[1] || m[2]
      }
    }

    // Strip bullet markers for display
    if (type === "bullet") {
      content = trimmed.replace(BULLET_PATTERNS, "")
    }

    result.push({ type, content, highlightText })
  }

  return result
}

// ── Inline highlight renderer ────────────────────────────────────────────────

function HighlightedText({ text }: { text: string }) {
  // Split on 【...】 and 「...」 patterns
  const parts = text.split(/(【[^】]+】|「[^」]+」)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (/^[【「]/.test(part) && /[】」]/.test(part)) {
          return (
            <span key={i} className="inline-block px-1.5 py-0.5 mx-0.5 bg-gold/10 border border-gold/20 rounded text-gold/80 text-[11px] font-medium">
              {part.slice(1, -1)}
            </span>
          )
        }
        // Also highlight percentages and scores
        const scoreParts = part.split(/(\d+\.?\d*%|\d+\.?\d*分)/g)
        return scoreParts.map((sp, j) => {
          if (/^\d+\.?\d*%$|^\d+\.?\d*分$/.test(sp)) {
            return <span key={`${i}-${j}`} className="text-gold font-semibold">{sp}</span>
          }
          return <span key={`${i}-${j}`}>{sp}</span>
        })
      })}
    </>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

interface Props {
  icon: string
  title: string
  color: string
  content: string
}

const PREVIEW_LINES = 12

export function ReportSection({ icon, title, color, content }: Props) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)

  // 检测是否为结构化JSON格式
  const structuredData = useMemo(() => parseStructuredContent(content), [content])
  const isStructured = structuredData !== null

  // 传统文本模式
  const parsedLines = useMemo(() => isStructured ? [] : parseLines(content), [content, isStructured])
  const visibleLines = expanded ? parsedLines : parsedLines.slice(0, PREVIEW_LINES)
  const hasMore = parsedLines.length > PREVIEW_LINES

  // 如果是结构化数据，使用新组件渲染
  if (isStructured && structuredData) {
    return (
      <div className="card-glass p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">{icon}</span>
          <h2 className={`font-serif text-xl font-bold ${color}`}>{title}</h2>
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400">
            结构化分析
          </span>
        </div>

        {/* 结构化报告内容 */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        }>
          <StructuredReportComponent data={structuredData} />
        </Suspense>
      </div>
    )
  }

  // 传统文本渲染模式（向下兼容）
  return (
    <div className="card-glass p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{icon}</span>
        <h2 className={`font-serif text-xl font-bold ${color}`}>{title}</h2>
      </div>

      {/* Structured content */}
      <div className="space-y-1">
        {visibleLines.map((line, i) => {
          if (line.type === "empty") {
            return <div key={i} className="h-3" />
          }

          if (line.type === "heading") {
            return (
              <div key={i} className="flex items-start gap-2.5 mt-4 mb-2 first:mt-0">
                <div className="w-1 h-5 rounded-full bg-gold/40 mt-1 flex-shrink-0" />
                <h3 className="text-white/90 text-sm font-semibold leading-snug">
                  {line.content}
                </h3>
              </div>
            )
          }

          if (line.type === "bullet") {
            return (
              <div key={i} className="flex items-start gap-2.5 py-1">
                <span className="text-gold/50 text-xs mt-1.5 flex-shrink-0">◆</span>
                <p className="text-white/70 text-sm leading-relaxed">
                  <HighlightedText text={line.content} />
                </p>
              </div>
            )
          }

          if (line.type === "highlight") {
            return (
              <div key={i} className="py-1.5">
                <p className="text-white/70 text-sm leading-relaxed">
                  <HighlightedText text={line.content} />
                </p>
              </div>
            )
          }

          // Regular text
          return (
            <p key={i} className="text-white/65 text-sm leading-relaxed py-0.5">
              <HighlightedText text={line.content} />
            </p>
          )
        })}
      </div>

      {/* Expand/collapse */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-gold/70 hover:text-gold text-sm transition-colors group"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
              {t("report.collapse")}
            </>
          ) : (
            <>
              <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
              {t("report.expand")}
              <span className="text-white/20 text-xs ml-1">
                ({parsedLines.length - PREVIEW_LINES} {t("report.moreLines") || "more"})
              </span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
