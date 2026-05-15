"use client"
import { CelestialOracle } from "@/components/divination/CelestialOracle"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

export default function DivinationPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <Breadcrumbs items={[{ label: "星际抽签" }]} />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gold mb-2">星际抽签</h1>
          <p className="text-white/40 text-sm">
            每日首次免费，感受星辰之力为你指引方向
          </p>
        </div>

        <CelestialOracle />

        <div className="mt-8 text-center">
          <p className="text-white/20 text-xs leading-relaxed max-w-md mx-auto">
            抽签结果基于王阳明心学智慧与星象能量随机生成，仅供娱乐和自我反思。
            每日首次免费，后续每次消耗 1 颗星尘。
          </p>
        </div>
      </div>
    </div>
  )
}
