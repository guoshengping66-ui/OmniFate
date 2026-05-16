"use client"
import { useState } from "react"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { AM16Quiz } from "@/components/am16/AM16Quiz"
import { AM16ResultCard } from "@/components/am16/AM16Result"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AM16Page() {
  const { t } = useLanguage()
  const [answers, setAnswers] = useState<number[] | null>(null)

  const handleComplete = (result: number[]) => {
    setAnswers(result)
  }

  const handleRestart = () => {
    setAnswers(null)
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
