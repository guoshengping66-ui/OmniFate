"use client"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

/** Strip Markdown formatting and garbled symbols from LLM-generated text */
function stripMarkdown(text: string): string {
  return text
    // Remove JSON code blocks that may have leaked into report text
    .replace(/```json\s*[\s\S]*?```/g, "")
    .replace(/```\w*\s*[\s\S]*?```/g, "")
    // Bold / italic markers
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    // Headings (###, ##, #)
    .replace(/^#{1,6}\s+/gm, "")
    // Horizontal rules (---, ***, ___)
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    // Blockquotes
    .replace(/^>\s*/gm, "")
    // Inline code backticks
    .replace(/`([^`]+)`/g, "$1")
    // Links [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Images ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    // Stray hash symbols (#--) patterns
    .replace(/#-+/g, "")
    .replace(/^#+\s*$/gm, "")
    // List markers that look garbled
    .replace(/^\s*[-*+]\s+(?=[#-])/gm, "")
    // Clean up excessive blank lines (3+ → 2)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

interface Props {
  icon: string
  title: string
  color: string
  content: string
}

export function ReportSection({ icon, title, color, content }: Props) {
  const [expanded, setExpanded] = useState(false)
  const cleanContent = stripMarkdown(content)
  const preview = cleanContent.slice(0, 400)
  const hasMore = cleanContent.length > 400

  return (
    <div className="card-glass p-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{icon}</span>
        <h2 className={`font-serif text-xl font-bold ${color}`}>{title}</h2>
      </div>
      <div className="text-white/75 text-sm leading-relaxed whitespace-pre-line">
        {expanded || !hasMore ? cleanContent : preview + "…"}
      </div>
      {hasMore && (
        <button onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1 text-gold/70 hover:text-gold text-sm transition-colors">
          {expanded ? <><ChevronUp size={16} /> 收起</> : <><ChevronDown size={16} /> 查看完整分析</>}
        </button>
      )}
    </div>
  )
}