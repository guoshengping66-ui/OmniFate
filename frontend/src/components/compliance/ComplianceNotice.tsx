"use client"

import { ShieldCheck } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface ComplianceNoticeProps {
  compact?: boolean
  className?: string
}

export function ComplianceNotice({ compact = false, className = "" }: ComplianceNoticeProps) {
  const { locale, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const title = isZh ? "服务用途说明" : "Service use notice"
  const body = isZh
    ? "本平台提供 AI 辅助的个人成长、自我探索与文化娱乐参考报告。内容不构成医疗、法律、财务、投资、心理咨询或其他专业建议，也不承诺、保证或预测任何确定结果。请基于自身判断使用报告内容。"
    : "This platform provides AI-assisted personal growth, self-reflection, and cultural entertainment reports. Content is not medical, legal, financial, investment, counseling, or other professional advice, and does not promise, guarantee, or predict any certain outcome. Please use your own judgment."

  return (
    <div className={`border border-gold/18 bg-gold/[0.055] ${compact ? "p-3" : "p-4"} ${className}`}>
      <div className="flex items-start gap-3">
        <ShieldCheck size={compact ? 15 : 18} className="mt-0.5 flex-shrink-0 text-gold/75" />
        <div>
          <p className={`${compact ? "text-xs" : "text-sm"} font-medium text-gold/85`}>{title}</p>
          <p className={`${compact ? "mt-1 text-[11px] leading-5" : "mt-2 text-xs leading-6"} text-white/48`}>
            {body}
          </p>
          {!compact && (
            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-gold/65">
              <a href={localeHref("/terms")} className="hover:text-gold">{isZh ? "服务条款" : "Terms"}</a>
              <a href={localeHref("/disclaimer")} className="hover:text-gold">{isZh ? "免责声明" : "Disclaimer"}</a>
              <a href={localeHref("/refund")} className="hover:text-gold">{isZh ? "退款政策" : "Refund policy"}</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
