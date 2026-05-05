"use client"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

/** Strip markdown asterisks from LLM-generated text */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
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