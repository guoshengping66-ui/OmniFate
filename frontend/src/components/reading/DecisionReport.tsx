"use client"

import { AlertTriangle, CheckCircle, Clock, Compass, ShieldCheck, Target, TrendingUp } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import type { DecisionReport as DecisionReportData } from "@/types/report"

interface DecisionReportProps {
  data: DecisionReportData
}

function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(10, score))
  return (
    <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
      <div className="h-full rounded-full bg-gold/70" style={{ width: `${clamped * 10}%` }} />
    </div>
  )
}

export function DecisionReport({ data }: DecisionReportProps) {
  const { locale } = useLanguage()
  const isEn = locale === "en" || data.language === "en"
  const executive = data.executive_summary
  const copy = isEn ? {
    opportunity: "Biggest opportunity",
    risk: "Biggest risk",
    nextAction: "Next best action",
    evidence: "Evidence chain",
    dimensions: "Five-dimension diagnosis",
    timeline: "Timeline",
    actionPlan: "Action plan",
    avoidList: "Avoid list",
  } : {
    opportunity: "最大机会",
    risk: "最大风险",
    nextAction: "下一步行动",
    evidence: "证据链",
    dimensions: "五维深度诊断",
    timeline: "时间线",
    actionPlan: "行动方案",
    avoidList: "避坑清单",
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { icon: TrendingUp, title: copy.opportunity, body: executive.opportunity, tone: "gold" },
          { icon: AlertTriangle, title: copy.risk, body: executive.risk, tone: "rose" },
          { icon: Target, title: copy.nextAction, body: executive.next_best_action, tone: "cyan" },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 mb-2">
              <item.icon size={15} className={item.tone === "rose" ? "text-rose-200/70" : item.tone === "cyan" ? "text-cyan-200/70" : "text-gold/70"} />
              <p className="text-xs font-medium text-gold/70">{item.title}</p>
            </div>
            <p className="text-white/58 text-xs leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-gold/70" />
          <h3 className="text-sm font-semibold text-white/75">{copy.evidence}</h3>
        </div>
        <div className="space-y-2.5">
          {data.evidence_chain.map((item, index) => (
            <div key={`${item.claim}-${index}`} className="rounded-xl bg-black/10 border border-white/[0.04] p-3">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold/70 border border-gold/15">
                  {item.confidence}
                </span>
                {item.sources.map(source => (
                  <span key={source} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/35">
                    {source}
                  </span>
                ))}
              </div>
              <p className="text-white/58 text-xs leading-relaxed">{item.claim}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Compass size={16} className="text-gold/70" />
          <h3 className="text-sm font-semibold text-white/75">{copy.dimensions}</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {data.five_dimensions.map((dim) => (
            <div key={dim.key} className="rounded-xl bg-black/10 border border-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs font-medium text-white/70">{dim.label}</p>
                <span className="text-xs text-gold/70">{dim.score.toFixed(1)}/10</span>
              </div>
              <ScoreBar score={dim.score} />
              <p className="mt-2 text-[11px] text-white/42">{dim.status}</p>
              <p className="mt-1.5 text-white/55 text-xs leading-relaxed">{dim.finding}</p>
              <p className="mt-2 text-gold/55 text-xs leading-relaxed">{dim.action}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-gold/70" />
            <h3 className="text-sm font-semibold text-white/75">{copy.timeline}</h3>
          </div>
          <div className="space-y-3">
            {data.timeline.map((item) => (
              <div key={item.period} className="border-l border-gold/20 pl-3">
                <p className="text-xs text-gold/65 font-medium">{item.period}</p>
                <p className="text-white/55 text-xs leading-relaxed mt-1">{item.focus}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-gold/70" />
            <h3 className="text-sm font-semibold text-white/75">{copy.actionPlan}</h3>
          </div>
          <div className="space-y-2.5">
            {data.action_plan.map((item) => (
              <div key={item.period} className="rounded-xl bg-white/[0.025] border border-white/[0.04] p-3">
                <p className="text-xs text-gold/65 font-medium">{item.period}</p>
                <p className="text-white/55 text-xs leading-relaxed mt-1">{item.action}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.03] p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-300/70" />
          <h3 className="text-sm font-semibold text-white/75">{copy.avoidList}</h3>
        </div>
        <div className="space-y-2.5">
          {data.avoid_list.map((item, index) => (
            <div key={`${item.item}-${index}`} className="rounded-xl bg-black/10 border border-amber-400/10 p-3">
              <p className="text-amber-100/70 text-xs font-medium">{item.item}</p>
              <p className="text-white/45 text-xs leading-relaxed mt-1">{item.reason}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
