"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect, lazy, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"
import { PERSONALITIES } from "@/lib/am16/constants"

// Lazy-load heavy components to reduce initial bundle
const AM16Quiz = lazy(() => import("@/components/am16/AM16Quiz").then(m => ({ default: m.AM16Quiz })))
const AM16ResultCard = lazy(() => import("@/components/am16/AM16Result").then(m => ({ default: m.AM16ResultCard })))

const RESULT_KEY = "am16_last_result"
const PROGRESS_KEY = "am16_progress"

function AM16PageInner() {
  const { t, localeHref } = useLanguage()
  const searchParams = useSearchParams()
  const [answers, setAnswers] = useState<number[] | null>(null)

  // 恢复上次结果 或 从分享链接读取编码
  useEffect(() => {
    // 分享链接：?code=DXIE
    const sharedCode = searchParams.get("code")
    if (sharedCode && PERSONALITIES[sharedCode]) {
      // 用默认答案生成对应编码的结果
      const fallbackAnswers = Array(12).fill(1)
      setAnswers(fallbackAnswers)
      return
    }

    // 本地缓存
    try {
      const saved = localStorage.getItem(RESULT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === 12) {
          setAnswers(parsed)
        }
      }
    } catch {}
  }, [searchParams])

  const handleComplete = (result: number[]) => {
    setAnswers(result)
    try {
      localStorage.setItem(RESULT_KEY, JSON.stringify(result))
      localStorage.removeItem(PROGRESS_KEY)
    } catch {}
  }

  const handleRestart = () => {
    setAnswers(null)
    try {
      localStorage.removeItem(RESULT_KEY)
      localStorage.removeItem(PROGRESS_KEY)
      window.history.replaceState({}, "", localeHref("/am16"))
    } catch {}
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <Breadcrumbs items={[{ label: t("nav.am16"), href: "/am16" }]} />

        <Suspense fallback={<div className="text-center text-white/30 text-sm py-8">Loading...</div>}>
          {answers === null ? (
            <AM16Quiz onComplete={handleComplete} />
          ) : (
            <AM16ResultCard answers={answers} onRestart={handleRestart} />
          )}
        </Suspense>
      </div>
    </div>
  )
}

export default function AM16Page() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-lg mx-auto text-center text-white/30 text-sm">Loading...</div></div>}>
      <AM16PageInner />
    </Suspense>
  )
}
