"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"
import { Sparkles, Star, Compass, ShoppingBag, X, ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"

const ONBOARDING_KEY = "alpha_mirror_onboarding_done"

interface Step {
  icon: React.ReactNode
  titleKey: string
  titleEn: string
  descKey: string
  descEn: string
  link?: string
  linkLabelKey?: string
  linkLabelEn?: string
}

export function OnboardingGuide() {
  const { t, locale, localeHref } = useLanguage()
  const { user } = useAuth()
  const { birthProfiles } = useUserStore()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [show, setShow] = useState(false)

  const isZh = locale === "zh"

  const steps: Step[] = [
    {
      icon: <Sparkles size={28} />,
      titleKey: "onboarding.step1Title",
      titleEn: "Welcome to Profile Mirror",
      descKey: "onboarding.step1Desc",
      descEn: "AI-powered multi-dimension behavioral analysis. You've received 100 Stardust — enough to unlock your first full report!",
    },
    {
      icon: <Star size={28} />,
      titleKey: "onboarding.step2Title",
      titleEn: "Fill in Your Birth Info",
      descKey: "onboarding.step2Desc",
      descEn: "Enter your birth date, time, and location. This is the foundation for all behavioral calculations.",
      link: "/reading/new",
      linkLabelKey: "onboarding.step2Link",
      linkLabelEn: "Start Now",
    },
    {
      icon: <Compass size={28} />,
      titleKey: "onboarding.step3Title",
      titleEn: "5 AI Analysis Dimensions",
      descKey: "onboarding.step3Desc",
      descEn: "Four-Pillar Analysis, Stellar Profile, Symbolic, Facial Feature, and Hand Feature — all powered by AI for comprehensive insights.",
    },
    {
      icon: <ShoppingBag size={28} />,
      titleKey: "onboarding.step4Title",
      titleEn: "Discover Status Products",
      descKey: "onboarding.step4Desc",
      descEn: "Based on your reading, we recommend crystals, talismans, and services tailored to your behavioral blueprint.",
      link: "/shop",
      linkLabelKey: "onboarding.step4Link",
      linkLabelEn: "Explore Shop",
    },
  ]

  useEffect(() => {
    if (!user) return
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done && birthProfiles.length === 0) {
      setShow(true)
    }
  }, [user, birthProfiles])

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, "1")
    setShow(false)
  }

  if (!show) return null

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1a0f2e] to-[#0d0820] border border-gold/20 p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 text-parchment-400 hover:text-parchment-400 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? "w-8 bg-gold" : i < currentStep ? "w-4 bg-gold/50" : "w-4 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto mb-6">
          {step.icon}
        </div>

        {/* Content */}
        <h2 className="text-xl font-serif font-bold text-white text-center mb-3">
          {isZh ? t(step.titleKey) : step.titleEn}
        </h2>
        <p className="text-parchment-400 text-sm text-center leading-relaxed mb-8">
          {isZh ? t(step.descKey) : step.descEn}
        </p>

        {/* Link button if available */}
        {step.link && (
          <Link
            href={localeHref(step.link!)}
            onClick={finish}
            className="block w-full py-3 rounded-xl bg-gold/10 border border-gold/30 text-gold text-center text-sm font-medium mb-4 hover:bg-gold/20 transition-colors"
          >
            {isZh ? t(step.linkLabelKey || "") : step.linkLabelEn}
          </Link>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => isFirst ? finish() : setCurrentStep(s => s - 1)}
            className="flex items-center gap-1 text-parchment-400 hover:text-parchment-300 text-sm transition-colors"
          >
            {isFirst ? (isZh ? "跳过" : "Skip") : (
              <>
                <ChevronLeft size={16} />
                {isZh ? "上一步" : "Back"}
              </>
            )}
          </button>

          <button
            onClick={() => isLast ? finish() : setCurrentStep(s => s + 1)}
            className="flex items-center gap-1 px-6 py-2.5 rounded-full bg-gold text-cosmos-950 font-semibold text-sm hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all"
          >
            {isLast ? (isZh ? "开始探索" : "Start Exploring") : (isZh ? "下一步" : "Next")}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
