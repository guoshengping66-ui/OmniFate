"use client"
import { useState, useRef } from "react"
import { Hand, Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useUserStore } from "@/stores/useUserStore"
import { analyzePalmImage } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { TargetSelector } from "@/components/dashboard/TargetSelector"

const PALM_KEY_FEATURES = [
  { key: "hand_shape", label_zh: "手型", label_en: "Hand Shape" },
  { key: "life_line", label_zh: "生命线", label_en: "Life Line" },
  { key: "head_line", label_zh: "智慧线", label_en: "Head Line" },
  { key: "heart_line", label_zh: "感情线", label_en: "Heart Line" },
  { key: "fate_line", label_zh: "命运线", label_en: "Fate Line" },
]

export default function PalmTestPage() {
  const { activeTestTarget } = useUserStore()
  const { locale } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [features, setFeatures] = useState<Record<string, string> | null>(null)
  const [error, setError] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const isEn = locale === "en"

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setFeatures(null)
    setError(false)
    setScanning(true)
    analyzePalmImage(f)
      .then(res => { setFeatures(res.features); setScanning(false) })
      .catch(() => { setError(true); setScanning(false) })
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-white/40 hover:text-white/60 text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> {isEn ? "Back to Home" : "返回首页"}
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gold">{isEn ? "Palm Reading" : "手相解读"}</h1>
            <p className="text-white/40 text-sm mt-1">{isEn ? "Upload a palm photo for AI-powered palmistry analysis" : "上传手掌照片，AI 分析掌纹特征"}</p>
          </div>
          <TargetSelector />
        </div>

        {activeTestTarget && (
          <div className="card-glass p-3 mb-4 text-xs text-white/40">
            {isEn ? "Analyzing for:" : "当前分析对象："}<span className="text-gold">{activeTestTarget.nickname}</span>
          </div>
        )}

        <div
          onClick={() => ref.current?.click()}
          className="border-2 border-dashed border-white/20 hover:border-gold/40 rounded-2xl p-8 text-center cursor-pointer transition-all group"
        >
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} alt="palm" className="w-32 h-32 object-contain rounded-xl mx-auto border-2 border-gold/40" />
              {features && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle size={14} className="text-white" />
                </div>
              )}
            </div>
          ) : (
            <>
              <Hand size={36} className="mx-auto text-white/20 group-hover:text-gold/50 mb-2 transition-colors" />
              <p className="text-white/40 text-sm">{isEn ? "Click to upload a palm photo" : "点击上传手掌照片"}</p>
              <p className="text-white/20 text-xs mt-1">{isEn ? "Ensure palm is flat with clear lines" : "请确保手掌平放、纹路清晰"}</p>
            </>
          )}
        </div>
        <input ref={ref} type="file" accept="image/*" className="sr-only" onChange={handlePick} />

        {scanning && (
          <div className="mt-4 card-glass p-4 text-center">
            <Loader2 size={20} className="text-gold animate-spin mx-auto mb-2" />
            <p className="text-white/50 text-sm">{isEn ? "AI palm recognition in progress..." : "AI 掌纹识别中..."}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 card-glass p-4 text-center">
            <p className="text-amber-400 text-sm">{isEn ? "Recognition failed — please ensure the palm photo is clear" : "识别失败，请确保手掌照片清晰"}</p>
          </div>
        )}

        {features && (
          <div className="mt-6 card-glass p-5 anim-slide-up">
            <h3 className="text-gold text-sm font-medium mb-3">{isEn ? "Palm Analysis Results" : "手相识别结果"}</h3>
            <div className="flex flex-wrap gap-2">
              {PALM_KEY_FEATURES.filter(f => features[f.key]).map(f => (
                <span key={f.key} className="text-xs px-2.5 py-1 bg-white/5 rounded-full text-white/60 border border-white/10">
                  {isEn ? f.label_en : f.label_zh}: {features[f.key]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
