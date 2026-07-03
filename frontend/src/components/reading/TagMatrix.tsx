"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import type { TagMatrixProps } from "@/types/report"

export function TagMatrix({ negativeTags, positiveTags }: TagMatrixProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-2.5">
      {/* Negative tags */}
      {negativeTags.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-parchment-400">
            <span className="w-1 h-1 rounded-full bg-red-400/60" />
            <span>{t("report.tagMatrix.negative")}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {negativeTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-500/8 text-red-400/70 border border-red-500/15"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Positive tags */}
      {positiveTags.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-parchment-400">
            <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
            <span>{t("report.tagMatrix.positive")}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {positiveTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-emerald-500/8 text-emerald-400/70 border border-emerald-500/15"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
