"use client"

import { useEffect } from "react"

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

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-gold">系统异常</h1>
        <p className="text-white/60">
          命盘数据读取失败，可能是量子态发生了不可预测的坍缩...
        </p>
        <p className="text-white/40 text-sm">
          Error: {error.message || "未知错误"}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gold/20 border border-gold/40 rounded-xl text-gold hover:bg-gold/30 transition-colors"
        >
          重新加载
        </button>
      </div>
    </div>
  )
}
