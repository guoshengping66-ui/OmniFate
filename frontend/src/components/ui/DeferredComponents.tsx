"use client"

import dynamic from "next/dynamic"

const MonthlyGrantToast = dynamic(
  () => import("@/components/ui/MonthlyGrantToast").then(m => ({ default: m.MonthlyGrantToast })),
  { ssr: false }
)
const OnboardingGuide = dynamic(
  () => import("@/components/ui/OnboardingGuide").then(m => ({ default: m.OnboardingGuide })),
  { ssr: false }
)

export function DeferredComponents() {
  return (
    <>
      <MonthlyGrantToast />
      <OnboardingGuide />
    </>
  )
}
