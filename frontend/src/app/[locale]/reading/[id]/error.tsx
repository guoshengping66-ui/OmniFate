"use client"

import { useEffect, useMemo } from "react"

const TRANSLATIONS: Record<string, { title: string; desc: string; errorMsg: string; reload: string }> = {
  zh: { title: "系统异常", desc: "命盘数据读取失败，可能是量子态发生了不可预测的坍缩...", errorMsg: "未知错误", reload: "重新加载" },
  en: { title: "System Error", desc: "Failed to load destiny data — an unpredictable quantum collapse may have occurred...", errorMsg: "Unknown error", reload: "Reload" },
}

export default function ReadingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Reading Error]", error)
  }, [error])

  const lang = useMemo(() => {
    try {
      const stored = localStorage.getItem("destiny-lang")
      if (stored === "en" || stored === "zh") return stored
    } catch {}
    return navigator.language.startsWith("zh") ? "zh" : "en"
  }, [])

  const t = TRANSLATIONS[lang] || TRANSLATIONS.zh

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-gold">{t.title}</h1>
        <p className="text-white/60">
          {t.desc}
        </p>
        <p className="text-white/40 text-sm">
          Error: {error.message || t.errorMsg}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gold/20 border border-gold/40 rounded-xl text-gold hover:bg-gold/30 transition-colors"
        >
          {t.reload}
        </button>
      </div>
    </div>
  )
}
