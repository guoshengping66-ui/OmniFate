"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { CreativeFilterProps } from "@/types/report"

export function CreativeFilter({ data }: CreativeFilterProps) {
  const { mechanism } = data
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-[11px] text-white/40">
        <span className="w-1 h-1 rounded-full bg-violet-400/60" />
        <span>创造力审查阻尼</span>
      </div>

      {/* Expandable mechanism */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[11px] text-violet-400/50 hover:text-violet-400/70 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          <span>审查机制详情</span>
        </button>
        <div className={`transition-all duration-200 overflow-hidden ${expanded ? "max-h-60 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
          <div className="px-3 py-2.5 rounded-lg bg-violet-500/[0.04] border border-violet-500/10">
            <p className="text-white/50 text-xs leading-relaxed">
              {mechanism}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
