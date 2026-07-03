"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import type { InteractionMirrorProps } from "@/types/report"

export function InteractionMirror({ data }: InteractionMirrorProps) {
  const { t } = useLanguage()
  const { behaviorPattern, painReflection } = data

  return (
    <div className="space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-xs text-parchment-400">
        <span className="w-1 h-1 rounded-full bg-indigo-400/60" />
        <span>{t("report.interactionMirror.header")}</span>
      </div>

      {/* Mirror card */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {/* Behavior pattern */}
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1 h-1 rounded-full bg-indigo-400/50" />
            <span className="text-xs text-indigo-400/60 font-medium">{t("report.interactionMirror.behavior")}</span>
          </div>
          <p className="text-parchment-300 text-xs leading-relaxed pl-2.5 border-l border-indigo-500/15">
            {behaviorPattern}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.04]" />

        {/* Pain reflection */}
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1 h-1 rounded-full bg-rose-400/50" />
            <span className="text-xs text-rose-400/60 font-medium">{t("report.interactionMirror.pain")}</span>
          </div>
          <p className="text-parchment-300 text-xs leading-relaxed pl-2.5 border-l border-rose-500/15">
            {painReflection}
          </p>
        </div>
      </div>
    </div>
  )
}
