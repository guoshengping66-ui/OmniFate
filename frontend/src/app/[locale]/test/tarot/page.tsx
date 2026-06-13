"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { TargetSelector } from "@/components/dashboard/TargetSelector"

export default function TarotTestPage() {
  const { activeTestTarget } = useUserStore()

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-white/40 hover:text-white/60 text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> 返回首页
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gold">符号解析</h1>
            <p className="text-white/40 text-sm mt-1">选择牌阵，获取当下的能量指引</p>
          </div>
          <TargetSelector />
        </div>

        {activeTestTarget && (
          <div className="card-glass p-3 mb-4 text-xs text-white/40">
            当前分析对象：<span className="text-gold">{activeTestTarget.nickname}</span>
          </div>
        )}

        <div className="card-glass p-8 text-center">
          <span className="text-4xl mb-4 block">🃏</span>
          <p className="text-white/40 text-sm">符号选择器即将上线</p>
          <p className="text-white/20 text-xs mt-1">敬请期待</p>
        </div>
      </div>
    </div>
  )
}
