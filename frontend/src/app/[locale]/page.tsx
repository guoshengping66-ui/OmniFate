"use client"

import dynamic from "next/dynamic"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

const EasternHomeExperience = dynamic(() => import("@/components/marketing-growth/EasternHomeExperience").then(m => m.EasternHomeExperience), { ssr: true })

export default function HomePage() {
  return (
    <ErrorBoundary sectionName="Guanwo Home Experience">
      <EasternHomeExperience />
    </ErrorBoundary>
  )
}
