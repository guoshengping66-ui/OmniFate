"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import type { ResetActionProps } from "@/types/report"

export function ResetAction({ actions }: ResetActionProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-[11px] text-white/40">
        <span className="w-1 h-1 rounded-full bg-teal-400/60" />
        <span>{t("report.resetAction.header")}</span>
      </div>

      {/* Action list */}
      <div className="space-y-1.5">
        {actions.map((action, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 py-2 px-3 rounded-md bg-white/[0.02] border border-teal-500/8 hover:border-teal-500/15 transition-colors"
          >
            <span className="text-teal-400/50 text-[11px] font-mono mt-0.5 flex-shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-white/55 text-xs leading-relaxed">
              {action}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
