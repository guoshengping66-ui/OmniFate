"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"
import { Loader2 } from "lucide-react"
import { useWizardStore, type Intent } from "@/stores/useWizardStore"
import { useUserStore } from "@/stores/useUserStore"
import { useLanguage } from "@/contexts/LanguageContext"

// intent 映射: quick→GENERAL_DAILY, full→FULL_MULTIMODAL, friend→null(全步骤)
const INTENT_MAP: Record<string, Intent> = {
  quick: "GENERAL_DAILY",
  full: "FULL_MULTIMODAL",
}

function PredictRedirect() {
  const searchParams = useSearchParams()
  const intent = searchParams.get("intent")
  const router = useRouter()
  const { t, localeHref } = useLanguage()
  const { setIntent, prefillFromProfile, reset } = useWizardStore()
  const { userProfile } = useUserStore()

  useEffect(() => {
    reset()
    const mapped = intent ? INTENT_MAP[intent] : undefined
    if (mapped) {
      setIntent(mapped)
      if (userProfile) {
        prefillFromProfile(userProfile)
      }
    }
    // intent=friend 或 null → 不设 intent, 全步骤空白向导
    router.replace(localeHref("/reading/new"))
  }, [intent]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={24} className="animate-spin text-gold" />
        <p className="text-parchment-400 text-sm">{t("predict.preparing")}</p>
      </div>
    </div>
  )
}

export default function PredictPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    }>
      <PredictRedirect />
    </Suspense>
  )
}
