"use client"

import { useEffect, useMemo } from "react"
import { useChunkLoadRecovery } from "@/lib/chunk-load-recovery"

const TRANSLATIONS: Record<string, { title: string; desc: string; errorMsg: string; reload: string; refreshing: string }> = {
  zh: { title: "系统异常", desc: "档案数据读取失败，可能是量子态发生了不可预测的坍缩...", errorMsg: "未知错误", reload: "重新加载", refreshing: "检测到页面资源已更新，正在自动刷新..." },
  en: { title: "System Error", desc: "Failed to load profile data — an unpredictable quantum collapse may have occurred...", errorMsg: "Unknown error", reload: "Reload", refreshing: "Page resources updated, auto-refreshing..." },
}

export default function ReadingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { autoReloading } = useChunkLoadRecovery(error)

  useEffect(() => {
    console.error("[Reading Error]", error)
  }, [error])

  const lang = useMemo(() => {
    try {
      const stored = localStorage.getItem("profile_mirror_lang")
      if (stored === "en" || stored === "zh") return stored
    } catch {}
    return navigator.language.startsWith("zh") ? "zh" : "en"
  }, [])

  const t = TRANSLATIONS[lang] || TRANSLATIONS.zh

  // Show auto-reload UI while refreshing
  if (autoReloading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl">🔄</div>
          <h1 className="text-2xl font-bold text-gold">{t.title}</h1>
          <p className="text-parchment-400">{t.refreshing}</p>
          <div className="flex items-center justify-center gap-2 text-parchment-400 text-sm">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {lang === "zh" ? "正在重新加载" : "Reloading"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-gold">{t.title}</h1>
        <p className="text-parchment-400">{t.desc}</p>
        <p className="text-parchment-400 text-sm">
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
