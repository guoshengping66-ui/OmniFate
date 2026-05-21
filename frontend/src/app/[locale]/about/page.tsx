"use client"
import { Sparkles, Globe, Bot, Gift, Shield, BookOpen } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AboutPage() {
  const { t } = useLanguage()

  const values = [
    { icon: Globe, title: t("about.value1Title"), desc: t("about.value1Desc") },
    { icon: Bot, title: t("about.value2Title"), desc: t("about.value2Desc") },
    { icon: Gift, title: t("about.value3Title"), desc: t("about.value3Desc") },
    { icon: Shield, title: t("about.value4Title"), desc: t("about.value4Desc") },
  ]

  const team = [
    { name: t("about.teamMetaphysics"), desc: t("about.teamMetaphysicsDesc") },
    { name: t("about.teamAI"), desc: t("about.teamAIDesc") },
    { name: t("about.teamUX"), desc: t("about.teamUXDesc") },
  ]

  const layers = [
    { title: t("about.architecture.layer1"), desc: t("about.architecture.layer1Desc") },
    { title: t("about.architecture.layer2"), desc: t("about.architecture.layer2Desc") },
    { title: t("about.architecture.layer3"), desc: t("about.architecture.layer3Desc") },
    { title: t("about.architecture.layer4"), desc: t("about.architecture.layer4Desc") },
    { title: t("about.architecture.layer5"), desc: t("about.architecture.layer5Desc") },
  ]

  const milestones = [
    { year: "2024 Q3", event: t("about.milestone1") },
    { year: "2024 Q4", event: t("about.milestone2") },
    { year: "2025 Q1", event: t("about.milestone3") },
    { year: "2025 Q2", event: t("about.milestone4") },
    { year: "2026 Q1", event: t("about.milestone5") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("nav.about") }]} />

        {/* Hero */}
        <div className="text-center mb-16">
          <Sparkles size={36} className="text-gold mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold text-gold mb-4">{t("about.title")}</h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            {t("about.heroDesc")}
          </p>
        </div>

        {/* Mission */}
        <div className="card-glass p-8 md:p-12 mb-12">
          <h2 className="font-serif text-2xl text-gold mb-4">{t("about.mission")}</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            {t("about.missionDesc1")}
          </p>
          <p className="text-white/70 leading-relaxed">
            {t("about.missionDesc2")}
          </p>
        </div>

        {/* Values */}
        <h2 className="section-title mb-10">{t("about.values")}</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {values.map((v) => (
            <div key={v.title} className="card-glow p-6">
              <v.icon size={24} className="text-gold mb-3" />
              <h3 className="font-serif font-bold text-gold mb-2">{v.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* 5-Layer Architecture */}
        <div className="card-glass p-8 md:p-12 mb-12">
          <BookOpen size={24} className="text-gold mb-4" />
          <h2 className="font-serif text-2xl text-gold mb-6">{t("about.architecture")}</h2>
          <div className="space-y-5">
            {layers.map((item, i) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-gold font-medium mb-1">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <h2 className="section-title mb-10">{t("about.team")}</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {team.map((m) => (
            <div key={m.name} className="card-glow p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-gold/20 mx-auto mb-4 flex items-center justify-center">
                <Sparkles size={22} className="text-gold" />
              </div>
              <h3 className="font-serif font-bold text-gold mb-2">{m.name}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <h2 className="section-title mb-10">{t("about.milestones")}</h2>
        <div className="card-glass p-8 mb-12">
          {milestones.map((item, i) => (
            <div key={item.year} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-gold flex-shrink-0" />
                {i < milestones.length - 1 && <div className="w-px flex-1 bg-gold/20 my-1" />}
              </div>
              <div className="pb-8">
                <span className="text-gold text-sm font-mono">{item.year}</span>
                <p className="text-white/60 text-sm mt-1">{item.event}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center card-glass p-10">
          <h2 className="font-serif text-2xl text-gold mb-4">{t("about.ctaTitle")}</h2>
          <p className="text-white/50 mb-6">{t("about.ctaDesc")}</p>
          <Link href="/reading/new" className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4">
            {t("about.ctaButton")}
            <Sparkles size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
