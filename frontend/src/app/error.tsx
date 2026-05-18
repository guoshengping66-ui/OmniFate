"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the actual error to console for debugging
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="max-w-md w-full card-glass p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-serif text-xl text-gold mb-3">出了点问题</h2>
        <p className="text-white/50 text-sm mb-2">
          客户端渲染时发生异常，以下是错误详情：
        </p>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 text-left overflow-auto max-h-48">
          <code className="text-red-400 text-xs whitespace-pre-wrap break-all">
            {error.message}
            {error.digest && `\n\nDigest: ${error.digest}`}
            {error.stack && `\n\n${error.stack}`}
          </code>
        </div>
        <button
          onClick={reset}
          className="btn-gold text-sm px-6 py-2"
        >
          重试
        </button>
      </div>
    </div>
  )
}
