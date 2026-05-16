"use client"
import { useState, useEffect } from "react"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { AM16Quiz } from "@/components/am16/AM16Quiz"
import { AM16ResultCard } from "@/components/am16/AM16Result"
import { useLanguage } from "@/contexts/LanguageContext"

const STORAGE_KEY = "am16_last_result"

export default function AM16Page() {
  const { t } = useLanguage()
  const [answers, setAnswers] = useState<number[] | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === 12) {
          setAnswers(parsed)
        }
      }
    } catch {}
  }, [])

  const handleComplete = (result: number[]) => {
    setAnswers(result)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
    } catch {}
  }

  const handleRestart = () => {
    setAnswers(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <Breadcrumbs items={[{ label: t("nav.am16"), href: "/am16" }]} />

        {answers === null ? (
          <AM16Quiz onComplete={handleComplete} />
        ) : (
          <AM16ResultCard answers={answers} onRestart={handleRestart} />
        )}
      </div>
    </div>
  )
}
