"use client"

import { AlertCircle, BarChart3, CheckCircle2, FileText, Loader2, RotateCcw } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  phase: "loading" | "error" | "timeout"
}

const COPY = {
  zh: {
    loadingTitle: "正在读取报告",
    loadingDesc: "如果报告仍在生成，页面会自动切换到实时进度。",
    retry: "重新分析",
    errorTitle: "报告加载失败",
    errorDesc: "报告可能尚未生成完成，或该会话已经过期。",
    timeoutTitle: "加载时间较长",
    timeoutDesc: "服务仍可能在处理报告，你可以稍后从我的报告重新打开。",
    steps: ["读取会话", "同步进度", "整理报告"],
    master: "等待综合报告返回",
  },
  en: {
    loadingTitle: "Loading report",
    loadingDesc: "If generation is still running, this page will switch to live progress.",
    retry: "Start new reading",
    errorTitle: "Report loading failed",
    errorDesc: "The report may still be generating, or the session may have expired.",
    timeoutTitle: "Loading is taking longer",
    timeoutDesc: "The service may still be processing. You can reopen it from My Reports later.",
    steps: ["Read session", "Sync progress", "Prepare report"],
    master: "Waiting for final synthesis",
  },
}

export function ReadingSkeleton({ phase }: Props) {
  const { locale } = useLanguage()
  const copy = locale === "zh" ? COPY.zh : COPY.en

  if (phase === "error" || phase === "timeout") {
    const isTimeout = phase === "timeout"
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-white/[0.035] p-6 text-center">
          <div className="mx-auto mb-5 h-12 w-12 rounded-xl border border-amber-300/20 bg-amber-300/[0.08] flex items-center justify-center">
            {isTimeout ? <Loader2 size={22} className="text-gold animate-spin" /> : <AlertCircle size={22} className="text-amber-200" />}
          </div>
          <h2 className="font-serif text-2xl text-parchment-200 mb-2">
            {isTimeout ? copy.timeoutTitle : copy.errorTitle}
          </h2>
          <p className="text-parchment-400 text-sm leading-relaxed mb-6">
            {isTimeout ? copy.timeoutDesc : copy.errorDesc}
          </p>
          <Link href="/reading/new" className="btn-primary inline-flex items-center justify-center gap-2">
            <RotateCcw size={15} />
            {copy.retry}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-10 w-10 rounded-xl border border-gold/20 bg-gold/10 flex items-center justify-center">
            <Loader2 size={19} className="text-gold animate-spin" />
          </div>
          <h1 className="text-xl font-serif font-semibold text-gold">{copy.loadingTitle}</h1>
          <p className="text-sm text-parchment-400">{copy.loadingDesc}</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4 sm:p-5">
          <div className="grid sm:grid-cols-3 gap-3">
            {copy.steps.map((step, index) => (
              <div key={step} className="rounded-xl border border-white/[0.06] bg-black/15 p-3 min-h-[84px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-parchment-300">{step}</span>
                  {index === 0 ? <CheckCircle2 size={15} className="text-emerald-300" /> : <Loader2 size={15} className="text-gold animate-spin" />}
                </div>
                <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full progress-animate"
                    style={{
                      width: index === 0 ? "100%" : index === 1 ? "72%" : "48%",
                      background: index === 0
                        ? "linear-gradient(90deg, #10b981, #6ee7b7)"
                        : "linear-gradient(90deg, #8B6914, #C9A84C)",
                      animationDelay: `${index * 0.25}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/15 p-4">
            <div className="flex items-center gap-2 text-gold/75 text-sm mb-3">
              <FileText size={15} />
              <span>{copy.master}</span>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-white/[0.08] shimmer-skeleton" />
              <div className="h-3 w-10/12 rounded bg-white/[0.06] shimmer-skeleton" />
              <div className="h-3 w-7/12 rounded bg-white/[0.05] shimmer-skeleton" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 min-h-[150px]">
            <div className="flex items-center gap-2 mb-4 text-parchment-300 text-sm">
              <BarChart3 size={15} />
              <span>{locale === "zh" ? "维度摘要" : "Dimension summary"}</span>
            </div>
            <div className="space-y-3">
              {[86, 68, 74].map((width, index) => (
                <div key={width} className="space-y-1.5">
                  <div className="h-2 w-24 rounded bg-white/[0.08]" />
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold/50 shimmer-skeleton"
                      style={{ width: `${width}%`, animationDelay: `${index * 0.2}s` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 min-h-[150px]">
            <div className="h-4 w-32 rounded bg-white/[0.08] mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-white/[0.08] shimmer-skeleton" />
              <div className="h-3 w-11/12 rounded bg-white/[0.06] shimmer-skeleton" />
              <div className="h-3 w-8/12 rounded bg-white/[0.05] shimmer-skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
