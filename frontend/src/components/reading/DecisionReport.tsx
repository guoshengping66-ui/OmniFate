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
  const isEn = locale === "en"
  const executive = data.executive_summary
  const narrative = {
    question: data.focus_question || (isEn ? "What is the most reliable next step in your current situation?" : "当前最值得优先处理的下一步是什么？"),
    conclusion: data.core_conclusion || executive.opportunity,
    opportunity: data.key_opportunity || executive.opportunity,
    watchFor: data.watch_for || executive.risk,
    nextAction: data.next_action || executive.next_best_action,
    scenarios: data.observable_scenarios || [],
    followUp: data.follow_up_prompt || (isEn ? "Ask about one real decision or deadline to make the next action more specific." : "你可以围绕一个真实决策或明确期限继续追问，让下一步更具体。"),
  }
  const headlineCards = [
    { icon: TrendingUp, title: isEn ? "Key Opportunity" : "最值得放大", body: narrative.opportunity, tone: "gold" },
    { icon: AlertTriangle, title: isEn ? "What to Watch" : "需要注意", body: narrative.watchFor, tone: "rose" },
    { icon: Target, title: isEn ? "Next Best Action" : "下一步行动", body: narrative.nextAction, tone: "cyan" },
  ].filter(item => Boolean(item.body))
  const visibleDimensions = data.five_dimensions.filter(
    (dim): dim is typeof dim & { score: number } => dim.score !== null && Boolean(dim.finding),
  )
  const copy = isEn ? {
    question: "Your question",
    conclusion: "Core conclusion",
    opportunity: "Key Opportunity",
    risk: "What to Watch",
    nextAction: "Next Best Action",
    scenarios: "Observable scenarios",
    followUp: "Continue the conversation",
    evidence: "Evidence Chain",
    dimensions: "Five-Dimension Diagnosis",
    timeline: "Key Timing",
    actionPlan: "Action Plan",
    avoidList: "Avoid List",
  } : {
    question: "\u4f60\u60f3\u89e3\u51b3\u7684\u95ee\u9898",
    conclusion: "\u6838\u5fc3\u7ed3\u8bba",
    opportunity: "\u6700\u503c\u5f97\u653e\u5927",
    risk: "\u9700\u8981\u6ce8\u610f",
    nextAction: "\u4e0b\u4e00\u6b65\u884c\u52a8",
    scenarios: "\u53ef\u89c2\u5bdf\u573a\u666f",
    followUp: "\u7ee7\u7eed\u8ffd\u95ee",
    evidence: "\u5206\u6790\u4f9d\u636e",
    dimensions: "\u4e94\u7ef4\u89c2\u5bdf",
    timeline: "\u63a8\u8fdb\u8282\u594f",
    actionPlan: "\u884c\u52a8\u8def\u5f84",
    avoidList: "\u907f\u514d\u4e8b\u9879",
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Compass size={15} className="text-cyan-200/75" />
            <p className="text-xs font-medium text-cyan-100/75">{copy.question}</p>
          </div>
          <p className="text-white/62 text-xs leading-relaxed">{narrative.question}</p>
        </div>
        <div className="rounded-2xl border border-gold/20 bg-gold/[0.055] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={15} className="text-gold/80" />
            <p className="text-xs font-medium text-gold/80">{copy.conclusion}</p>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">{narrative.conclusion}</p>
        </div>
      </section>
      {headlineCards.length > 0 && <div className="grid md:grid-cols-3 gap-3">
        {headlineCards.map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/[0.06] bg-[#030918] p-4">
            <div className="flex items-center gap-2 mb-2">
              <item.icon size={15} className={item.tone === "rose" ? "text-rose-200/70" : item.tone === "cyan" ? "text-cyan-200/70" : "text-gold/70"} />
              <p className="text-xs font-medium text-gold/70">{item.title}</p>
            </div>
            <p className="text-white/58 text-xs leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>}

      {narrative.scenarios.length > 0 && (
        <section className="rounded-2xl border border-white/[0.06] bg-[#030918] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Compass size={16} className="text-cyan-200/75" />
            <h3 className="text-sm font-semibold text-white/75">{copy.scenarios}</h3>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {narrative.scenarios.slice(0, 3).map((scenario, index) => (
              <p key={`${scenario}-${index}`} className="rounded-xl border border-white/[0.05] bg-black/10 p-3 text-xs leading-relaxed text-white/55">{scenario}</p>
            ))}
          </div>
        </section>
      )}

      {data.evidence_chain.length > 0 && <section className="rounded-2xl border border-white/[0.06] bg-[#030918] p-4">
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
      </section>}

      {visibleDimensions.length > 0 && <section className="rounded-2xl border border-white/[0.06] bg-[#030918] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Compass size={16} className="text-gold/70" />
          <h3 className="text-sm font-semibold text-white/75">{copy.dimensions}</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {visibleDimensions.map((dim) => (
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
      </section>}

      {(data.timeline.length > 0 || data.action_plan.length > 0) && <div className="grid md:grid-cols-2 gap-4">
        {data.timeline.length > 0 && <section className="rounded-2xl border border-white/[0.06] bg-[#030918] p-4">
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
        </section>}

        {data.action_plan.length > 0 && <section className="rounded-2xl border border-white/[0.06] bg-[#030918] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-gold/70" />
            <h3 className="text-sm font-semibold text-white/75">{copy.actionPlan}</h3>
          </div>
          <div className="space-y-2.5">
            {data.action_plan.map((item) => (
              <div key={item.period} className="rounded-xl bg-[#030918] border border-white/[0.04] p-3">
                <p className="text-xs text-gold/65 font-medium">{item.period}</p>
                <p className="text-white/55 text-xs leading-relaxed mt-1">{item.action}</p>
                {item.done_when && <p className="mt-2 text-[11px] leading-relaxed text-cyan-100/55">{isEn ? "Done when: " : "\u5b8c\u6210\u6807\u51c6\uff1a"}{item.done_when}</p>}
                {item.review_at && <p className="mt-1 text-[11px] leading-relaxed text-white/38">{isEn ? "Review: " : "\u590d\u76d8\u65f6\u95f4\uff1a"}{item.review_at}</p>}
                {item.evidence_refs && item.evidence_refs.length > 0 && <p className="mt-1 text-[10px] text-gold/50">{isEn ? "Evidence: " : "\u4f9d\u636e\uff1a"}{item.evidence_refs.join(" · ")}</p>}
              </div>
            ))}
          </div>
        </section>}
      </div>}

      {data.avoid_list.length > 0 && <section className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.03] p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-300/70" />
          <h3 className="text-sm font-semibold text-white/75">{copy.avoidList}</h3>
        </div>
        <div className="space-y-2.5">
          {data.avoid_list.map((item, index) => (
            <div key={`${item.item}-${index}`} className="rounded-xl bg-black/10 border border-amber-400/10 p-3">
              <p className="text-amber-100/70 text-xs font-medium">{item.item}</p>
              <p className="text-white/45 text-xs leading-relaxed mt-1">{item.reason}</p>
              {item.replacement && <p className="mt-2 text-[11px] leading-relaxed text-cyan-100/55">{isEn ? "Instead: " : "\u66ff\u4ee3\u505a\u6cd5\uff1a"}{item.replacement}</p>}
              {item.sources && item.sources.length > 0 && <p className="mt-1 text-[10px] text-gold/50">{isEn ? "Evidence: " : "\u4f9d\u636e\uff1a"}{item.sources.join(" · ")}</p>}
            </div>
          ))}
        </div>
      </section>}

      <section className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.035] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Compass size={15} className="text-cyan-200/75" />
          <h3 className="text-sm font-semibold text-white/75">{copy.followUp}</h3>
        </div>
        <p className="text-xs leading-relaxed text-white/55">{narrative.followUp}</p>
      </section>
    </div>
  )
}
