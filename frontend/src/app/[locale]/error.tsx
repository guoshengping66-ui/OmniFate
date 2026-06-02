"use client"

import { useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useChunkLoadRecovery } from "@/lib/chunk-load-recovery"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t, locale } = useLanguage()
  const { autoReloading } = useChunkLoadRecovery(error)

  useEffect(() => {
    console.error("[GlobalError]", error)
  }, [error])

  // Auto-reload UI for ChunkLoadError
  if (autoReloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-4">
        <div className="max-w-md w-full card-glass p-8 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <h2 className="font-serif text-xl text-gold mb-3">{t("error.title")}</h2>
          <p className="text-white/50 text-sm mb-2">
            {locale === "zh" ? "页面资源已更新，正在自动刷新..." : "Page resources updated, auto-refreshing..."}
          </p>
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {locale === "zh" ? "正在重新加载" : "Reloading"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="max-w-md w-full card-glass p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-serif text-xl text-gold mb-3">{t("error.title")}</h2>
        <p className="text-white/50 text-sm mb-2">
          {t("error.clientError")}
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 text-left overflow-auto max-h-48">
            <code className="text-red-400 text-xs whitespace-pre-wrap break-all">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
              {error.stack && `\n\n${error.stack}`}
            </code>
          </div>
        )}
        <button
          onClick={reset}
          className="btn-gold text-sm px-6 py-2"
        >
          {t("error.retry")}
        </button>
      </div>
    </div>
  )
}
