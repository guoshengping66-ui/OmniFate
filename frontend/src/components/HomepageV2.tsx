"use client"

import dynamic from "next/dynamic"

const HeroSection = dynamic(() => import("@/components/homepage/HeroSection"), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})

const ResultPreview = dynamic(() => import("@/components/homepage/ResultPreview"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

const AM16Showcase = dynamic(() => import("@/components/homepage/AM16Showcase"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

const FiveSystems = dynamic(() => import("@/components/homepage/FiveSystems"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

const ReportContent = dynamic(() => import("@/components/homepage/ReportContent"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

const DailyFortune = dynamic(() => import("@/components/homepage/DailyFortune"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

const Testimonials = dynamic(() => import("@/components/homepage/Testimonials"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

const DeepReportPreview = dynamic(() => import("@/components/homepage/DeepReportPreview"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

const MembershipSection = dynamic(() => import("@/components/homepage/MembershipSection"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

const ShopSection = dynamic(() => import("@/components/homepage/ShopSection"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

const FAQAndCTA = dynamic(() => import("@/components/homepage/FAQAndCTA"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

const FloatingCTA = dynamic(() => import("@/components/ui/FloatingCTA").then(m => m.FloatingCTA), { ssr: false })

export default function HomepageV2() {
  return (
    <div className="min-h-screen">
      <FloatingCTA />
      <HeroSection />
      <ResultPreview />
      <AM16Showcase />
      <FiveSystems />
      <ReportContent />
      <DailyFortune />
      <Testimonials />
      <DeepReportPreview />
      <MembershipSection />
      <ShopSection />
      <FAQAndCTA />
    </div>
  )
}
