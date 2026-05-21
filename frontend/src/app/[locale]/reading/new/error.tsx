"use client"

import { useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ReadingNewError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLanguage()
  useEffect(() => {
    console.error("[ReadingNewError]", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="max-w-md w-full card-glass p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-serif text-xl text-gold mb-3">{t("error.title")}</h2>
        <p className="text-white/50 text-sm mb-2">{t("error.readingError")}</p>
        {process.env.NODE_ENV === "development" && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 text-left overflow-auto max-h-48">
            <code className="text-red-400 text-xs whitespace-pre-wrap break-all">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </code>
          </div>
        )}
        <button onClick={reset} className="btn-gold text-sm px-6 py-2">
          {t("error.retry")}
        </button>
      </div>
    </div>
  )
}
