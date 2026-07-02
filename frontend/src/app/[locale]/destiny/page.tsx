"use client"
import dynamic from "next/dynamic"

const CinematicHero = dynamic(() => import("@/components/destiny/CinematicHero"), { ssr: false })
const Archetypes = dynamic(() => import("@/components/destiny/Archetypes"), { ssr: false })
const SkillTree = dynamic(() => import("@/components/destiny/SkillTree"), { ssr: false })
const Timeline = dynamic(() => import("@/components/destiny/Timeline"), { ssr: false })
const DestinyEngines = dynamic(() => import("@/components/destiny/DestinyEngines"), { ssr: false })
const ReportPreview = dynamic(() => import("@/components/destiny/ReportPreview"), { ssr: false })
const CaseStudy = dynamic(() => import("@/components/destiny/CaseStudy"), { ssr: false })
const FinalCTA = dynamic(() => import("@/components/destiny/FinalCTA"), { ssr: false })

export default function DestinyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      {/* SCREEN 1: The Mirror of Destiny */}
      <CinematicHero />

      {/* SCREEN 2: The 12 Archetypes */}
      <Archetypes />

      {/* SCREEN 3: Map of Destiny (Skill Tree) */}
      <SkillTree />

      {/* SCREEN 4: Timeline of Destiny */}
      <Timeline />

      {/* SCREEN 5: The Five Destiny Engines */}
      <DestinyEngines />

      {/* SCREEN 6: System Report Preview */}
      <ReportPreview />

      {/* SCREEN 7: Discovery Verification */}
      <CaseStudy />

      {/* SCREEN 8: The Secured Quantum Gateway */}
      <FinalCTA />
    </div>
  )
}
