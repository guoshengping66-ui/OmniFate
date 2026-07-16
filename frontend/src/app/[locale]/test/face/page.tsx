"use client"
export const dynamic = "force-dynamic"
import { useState, useRef } from "react"
import Image from "next/image"
import { Camera, Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useUserStore } from "@/stores/useUserStore"
import { analyzeFaceImage } from "@/lib/api"
import { compressImage } from "@/lib/imageUtils"
import { TargetSelector } from "@/components/dashboard/TargetSelector"

const FACE_KEY_FEATURES = [
  { key: "face_shape", label: "脸型" },
  { key: "three_zones_ratio", label: "三庭" },
  { key: "zhun_tou", label: "准头" },
  { key: "shan_gen", label: "山根" },
  { key: "di_ge", label: "地阁" },
  { key: "e_tou", label: "额头" },
  { key: "liang_quan", label: "两颧" },
  { key: "yan_shen", label: "眼神" },
]

export default function FaceTestPage() {
  const { activeTestTarget } = useUserStore()
  const [, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [features, setFeatures] = useState<Record<string, string> | null>(null)
  const [error, setError] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setFeatures(null)
    setError(false)
    setScanning(true)
    try {
      const compressed = await compressImage(f)
      const res = await analyzeFaceImage(compressed)
      setFeatures(res.features)
    } catch {
      setError(true)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-white/40 hover:text-white/60 text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> 返回首页
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gold">AI 面相分析</h1>
            <p className="text-white/40 text-sm mt-1">上传正面照片，AI 将自动识别面相</p>
          </div>
          <TargetSelector />
        </div>

        {activeTestTarget && (
          <div className="card-glass p-3 mb-4 text-xs text-white/40">
            当前分析对象：<span className="text-gold">{activeTestTarget.nickname}</span>
          </div>
        )}

        <div
          onClick={() => ref.current?.click()}
          className="border-2 border-dashed border-white/20 hover:border-gold/40 rounded-2xl p-8 text-center cursor-pointer transition-all group"
        >
          {preview ? (
            <div className="relative inline-block">
              <Image src={preview} alt="face" width={128} height={128} unoptimized className="w-32 h-32 object-cover rounded-full mx-auto border-2 border-gold/40" />
              {features && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle size={14} className="text-white" />
                </div>
              )}
            </div>
          ) : (
            <>
              <Camera size={36} className="mx-auto text-white/20 group-hover:text-gold/50 mb-2 transition-colors" />
              <p className="text-white/40 text-sm">点击上传正面照</p>
              <p className="text-white/20 text-xs mt-1">支持 JPG/PNG，建议光线充足</p>
            </>
          )}
        </div>
        <input ref={ref} type="file" accept="image/*" className="sr-only" onChange={handlePick} />

        {scanning && (
          <div className="mt-4 card-glass p-4 text-center">
            <Loader2 size={20} className="text-gold animate-spin mx-auto mb-2" />
            <p className="text-white/50 text-sm">AI 面相识别中...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 card-glass p-4 text-center">
            <p className="text-amber-400 text-sm">识别失败，请确保照片清晰且正对镜头</p>
          </div>
        )}

        {features && (
          <div className="mt-6 card-glass p-5 anim-slide-up">
            <h3 className="text-gold text-sm font-medium mb-3">面相识别结果</h3>
            <div className="flex flex-wrap gap-2">
              {FACE_KEY_FEATURES.filter(f => features[f.key]).map(f => (
                <span key={f.key} className="text-xs px-2.5 py-1 bg-white/5 rounded-full text-white/60 border border-white/10">
                  {f.label}: {features[f.key]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
