"use client"
export const dynamic = "force-dynamic"

import dynamic from "next/dynamic"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

const GrowthCommandHero = dynamic(() => import("@/components/marketing-growth/GrowthCommandHero").then(m => m.GrowthCommandHero), { ssr: true })
const FiveDimensionCommandCenter = dynamic(() => import("@/components/marketing-growth/FiveDimensionCommandCenter").then(m => m.FiveDimensionCommandCenter), { ssr: false })
const SignalToActionWorkflow = dynamic(() => import("@/components/marketing-growth/SignalToActionWorkflow").then(m => m.SignalToActionWorkflow), { ssr: false })
const SampleGrowthReport = dynamic(() => import("@/components/marketing-growth/SampleGrowthReport").then(m => m.SampleGrowthReport), { ssr: false })
const MethodTrustSection = dynamic(() => import("@/components/marketing-growth/MethodTrustSection").then(m => m.MethodTrustSection), { ssr: false })
const GrowthServicePaths = dynamic(() => import("@/components/marketing-growth/GrowthServicePaths").then(m => m.GrowthServicePaths), { ssr: false })
const FinalGrowthCTA = dynamic(() => import("@/components/marketing-growth/FinalGrowthCTA").then(m => m.FinalGrowthCTA), { ssr: false })

export default function DestinyPage() {
  return (
    <div className="relative z-10 min-h-screen bg-[#020617]">
      <GrowthCommandHero variant="destiny" />
      <ErrorBoundary sectionName="Five Dimension Command Center">
        <FiveDimensionCommandCenter />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Signal To Action Workflow">
        <SignalToActionWorkflow />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Sample Growth Report">
        <SampleGrowthReport />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Method Trust">
        <MethodTrustSection />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Growth Service Paths">
        <GrowthServicePaths />
      </ErrorBoundary>
      <ErrorBoundary sectionName="Final Growth CTA">
        <FinalGrowthCTA />
      </ErrorBoundary>
    </div>
  )
}
