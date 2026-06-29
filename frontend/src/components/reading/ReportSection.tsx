"use client"
import { useState, useMemo, lazy, Suspense } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import type { StructuredReport } from "@/types/report"

const StructuredReportComponent = lazy(() =>
  import("./StructuredReport").then(m => ({ default: m.StructuredReport }))
)

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

function parseStructuredContent(content: string): StructuredReport | null {
  if (!content) return null

  let jsonStr = content
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  try {
    const parsed = JSON.parse(jsonStr)
    if (
      parsed.summary &&
      parsed.dimensions &&
      typeof parsed.dimensions === "object" &&
      (parsed.dimensions.wealth || parsed.dimensions.relationship || parsed.dimensions.health)
    ) {
      return parsed as StructuredReport
    }
  } catch {
    // Not JSON format, use legacy rendering
  }

  return null
}

type LineType = "heading" | "bullet" | "highlight" | "empty" | "text"

interface ParsedLine {
  type: LineType
  content: string
  highlightText?: string
}

const HEADING_PATTERNS = [
  /^[一二三四五六七八九十]+[、．.]\s*/,
  /^[（(]\s*[一二三四五六七八九十\d]+\s*[)）]\s*/,
  /^\d+[、．.]\s+/,
  /^[①②③④⑤⑥⑦⑧⑨⑩]\s*/,
  /^【[^】]+】\s*/,
  /^「[^」]+」\s*/,
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
      if (result.length > 0 && result[result.length - 1].type === "empty") continue
      result.push({ type: "empty", content: "" })
      continue
    }

    const type = classifyLine(trimmed)
    let content = trimmed
    let highlightText: string | undefined

    if (type === "heading") {
      content = trimmed
        .replace(/^[一二三四五六七八九十]+[、．.]\s*/, "")
        .replace(/^[（(]\s*[一二三四五六七八九十\d]+\s*[)）]\s*/, "")
        .replace(/^\d+[、．.]\s+/, "")
        .replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "")
        .replace(/^【([^】]+)】\s*/, "")
        .replace(/^「([^」]+)」\s*/, "")
    }

    if (type === "highlight" || type === "text") {
      const m = trimmed.match(/【([^】]+)】|「([^」]+)」/)
      if (m) {
        highlightText = m[1] || m[2]
      }
    }

    if (type === "bullet") {
      content = trimmed.replace(BULLET_PATTERNS, "")
    }

    result.push({ type, content, highlightText })
  }

  return result
}

function HighlightedText({ text }: { text: string }) {
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

interface Props {
  icon: string
  title: string
  color: string
  content: string
}

const PREVIEW_LINES = 12

function buildKeyTakeaways(lines: ParsedLine[]): string[] {
  return lines
    .filter(line => line.type !== "empty" && line.content.length > 18)
    .map(line => line.content.replace(/^[\-•\d.、\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3)
}

function buildReadableSections(lines: ParsedLine[]): Array<{ title: string; body: string }> {
  const sections: Array<{ title: string; body: string }> = []
  let currentTitle = "核心解析"
  let currentBody: string[] = []

  const flush = () => {
    if (currentBody.length > 0) {
      sections.push({ title: currentTitle, body: currentBody.join("\n") })
      currentBody = []
    }
  }

  lines.forEach((line) => {
    if (line.type === "empty") return
    if (line.type === "heading") {
      flush()
      currentTitle = line.content
      return
    }
    currentBody.push(line.content)
  })

  flush()

  return sections.filter(section => section.body.length > 20).slice(0, 4)
}

export function ReportSection({ icon, title, color, content }: Props) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)

  const structuredData = useMemo(() => parseStructuredContent(content), [content])
  const isStructured = structuredData !== null

  const parsedLines = useMemo(() => isStructured ? [] : parseLines(content), [content, isStructured])
  const keyTakeaways = useMemo(() => buildKeyTakeaways(parsedLines), [parsedLines])
  const readableSections = useMemo(() => buildReadableSections(parsedLines), [parsedLines])
  const visibleLines = expanded ? parsedLines : parsedLines.slice(0, PREVIEW_LINES)
  const hasMore = parsedLines.length > PREVIEW_LINES

  if (isStructured && structuredData) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 md:p-5">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-1 h-5 rounded-full bg-gold/50" />
          <span className="text-lg">{icon}</span>
          <h2 className={`font-serif text-base font-bold ${color}`}>{title}</h2>
          <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/15 rounded text-violet-400/60">
            结构化
          </span>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-gold/20 border-t-gold/60 rounded-full animate-spin" />
          </div>
        }>
          <StructuredReportComponent data={structuredData} />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 md:p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-1 h-5 rounded-full bg-gold/50" />
        <span className="text-lg">{icon}</span>
        <h2 className={`font-serif text-base font-bold ${color}`}>{title}</h2>
      </div>

      {keyTakeaways.length > 0 && (
        <div className="mb-4 grid sm:grid-cols-3 gap-2.5">
          {keyTakeaways.map((item, index) => (
            <div key={`${item}-${index}`} className="rounded-xl border border-gold/10 bg-gold/[0.035] p-3">
              <span className="text-[9px] tracking-[0.14em] text-gold/45">KEY {index + 1}</span>
              <p className="mt-1 text-white/64 text-xs leading-relaxed line-clamp-3">
                <HighlightedText text={item} />
              </p>
            </div>
          ))}
        </div>
      )}

      {!expanded && readableSections.length > 1 && (
        <div className="mb-4 rounded-2xl border border-white/[0.06] bg-black/10 p-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/28 mb-2">Reading Map</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {readableSections.map((section, index) => (
              <div key={`${section.title}-${index}`} className="rounded-xl bg-white/[0.025] border border-white/[0.05] p-3">
                <p className="text-white/72 text-xs font-semibold mb-1">{section.title}</p>
                <p className="text-white/42 text-[11px] leading-relaxed line-clamp-2">
                  <HighlightedText text={section.body.split("\n")[0] || section.body} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-0.5">
        {visibleLines.map((line, i) => {
          if (line.type === "empty") {
            return <div key={i} className="h-2" />
          }

          if (line.type === "heading") {
            return (
              <div key={i} className="flex items-start gap-2 mt-3 mb-1.5 first:mt-0">
                <span className="w-1 h-4 rounded-full bg-gold/30 mt-1 flex-shrink-0" />
                <h3 className="text-white/80 text-xs font-semibold leading-snug">
                  {line.content}
                </h3>
              </div>
            )
          }

          if (line.type === "bullet") {
            return (
              <div key={i} className="flex items-start gap-2 py-0.5">
                <span className="text-gold/40 text-[10px] mt-1 flex-shrink-0">◆</span>
                <p className="text-white/60 text-xs leading-relaxed">
                  <HighlightedText text={line.content} />
                </p>
              </div>
            )
          }

          if (line.type === "highlight") {
            return (
              <div key={i} className="py-0.5">
                <p className="text-white/60 text-xs leading-relaxed">
                  <HighlightedText text={line.content} />
                </p>
              </div>
            )
          }

          return (
            <p key={i} className="text-white/50 text-xs leading-relaxed py-0.5">
              <HighlightedText text={line.content} />
            </p>
          )
        })}
      </div>

      {/* Expand/collapse */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-gold/60 hover:text-gold text-xs transition-colors group"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
              {t("report.collapse")}
            </>
          ) : (
            <>
              <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
              {t("report.expand")}
              <span className="text-white/20 text-[10px] ml-1">
                ({parsedLines.length - PREVIEW_LINES} {t("report.moreLines") || "more"})
              </span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
