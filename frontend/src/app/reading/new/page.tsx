"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import {
  Upload, Camera, Hand, ChevronRight, ChevronLeft,
  Loader2, Sparkles, Star, CheckCircle, AlertCircle,
} from "lucide-react"
import { runAnalysis, AnalysisRequest, analyzeFaceImage, analyzePalmImage } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { motion } from "framer-motion"
import { TarotPicker } from "@/components/reading/TarotPicker"
import { FaceScanAnimation } from "@/components/reading/FaceScanAnimation"
import { ShichenSelector } from "@/components/reading/ShichenSelector"
import { LocationSelector } from "@/components/reading/LocationSelector"
import { DateSelector } from "@/components/reading/DateSelector"
import { HotQuestions } from "@/components/reading/HotQuestions"
import { FortuneGuide } from "@/components/reading/FortuneGuide"

const PALM_SCAN_TEXT = "🔍 掌纹特征扫描中…"

const schema = z.object({
  gender: z.enum(["male", "female", "other"]),
  birth_year:   z.coerce.number().min(1920).max(2025),
  birth_month:  z.coerce.number().min(1).max(12),
  birth_day:    z.coerce.number().min(1).max(31),
  birth_hour:   z.coerce.number().min(0).max(23),
  birth_minute: z.coerce.number().min(0).max(59).default(0),
  birth_city:   z.string().min(1, "请填写出生城市"),
  latitude:     z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
  longitude:    z.coerce.number().min(-180).max(180).optional().or(z.literal("")),
  user_question: z.string().min(2, "请至少输入2个字").max(200),
})
type FormValues = z.infer<typeof schema>

const STEPS = ["出生信息", "塔罗 & 提问", "面相 & 手相", "确认推命"]

const PALM_FIELDS = [
  { key: "life_line",       label: "生命线", placeholder: "例如：较长弧形，无断裂" },
  { key: "head_line",       label: "智慧线", placeholder: "例如：笔直延伸至手掌中部" },
  { key: "heart_line",      label: "感情线", placeholder: "例如：弯曲上扬，起点在食指下方" },
  { key: "fate_line",       label: "命运线", placeholder: "例如：清晰从掌底延伸至中指" },
  { key: "sun_line",        label: "太阳线", placeholder: "例如：浅而短，在无名指下方" },
  { key: "marriage_lines",  label: "婚姻线", placeholder: "例如：两条，一条较深" },
]

export default function NewReadingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep]           = useState(0)
  const [loading, setLoading]     = useState(false)
  // Face state
  const [faceFile, setFaceFile]   = useState<File | null>(null)
  const [facePreview, setFacePreview] = useState<string | null>(null)
  const [isFaceScanning, setIsFaceScanning] = useState(false)
  const [faceScanDone, setFaceScanDone] = useState(false)
  const [faceText, setFaceText]   = useState<string>("")
  const [faceV2TError, setFaceV2TError] = useState(false)
  const [faceFeatures, setFaceFeatures] = useState<Record<string, string> | null>(null)
  // Palm state
  const [palmFile, setPalmFile]   = useState<File | null>(null)
  const [palmPreview, setPalmPreview] = useState<string | null>(null)
  const [isPalmScanning, setIsPalmScanning] = useState(false)
  const [palmScanDone, setPalmScanDone] = useState(false)
  const [palmText, setPalmText]   = useState<string>("")
  const [palmV2TError, setPalmV2TError] = useState(false)
  const [palmFeatures, setPalmFeatures] = useState<Record<string, string> | null>(null)
  // Other state
  const [tarotCards, setTarotCards]   = useState<{ position: string; card: string; reversed: boolean }[]>([])
  const [palmData, setPalmData]       = useState<Record<string, string>>({})
  const [showFaceGuide, setShowFaceGuide] = useState(false)
  const [showPalmGuide, setShowPalmGuide] = useState(false)
  const faceRef = useRef<HTMLInputElement>(null)
  const palmRef = useRef<HTMLInputElement>(null)

  // Revoke blob URLs on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (facePreview) URL.revokeObjectURL(facePreview)
      if (palmPreview) URL.revokeObjectURL(palmPreview)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { birth_minute: 0, gender: "female", user_question: "请给我一份全维度命理分析" },
  })

  const watchedQuestion = watch("user_question")
  const watchedHour = watch("birth_hour")

  // ── Exit guard ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (step > 0 && !loading) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [step, loading])

  // ── Face guide timing ──────────────────────────────────────
  useEffect(() => {
    if (facePreview && !faceScanDone) {
      setShowFaceGuide(true)
      const t = setTimeout(() => setShowFaceGuide(false), 3000)
      return () => clearTimeout(t)
    }
  }, [facePreview, faceScanDone])

  useEffect(() => {
    if (palmPreview && !palmScanDone) {
      setShowPalmGuide(true)
      const t = setTimeout(() => setShowPalmGuide(false), 3000)
      return () => clearTimeout(t)
    }
  }, [palmPreview, palmScanDone])

  const handleFacePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (facePreview) URL.revokeObjectURL(facePreview)
    setFaceFile(f)
    const url = URL.createObjectURL(f)
    setFacePreview(url)
    setIsFaceScanning(true)
    setFaceScanDone(false)
    setFaceV2TError(false)
    setFaceFeatures(null)
  }

  const handleFaceScanComplete = () => {
    setFaceScanDone(true)
    setIsFaceScanning(false)
    if (faceFile) {
      analyzeFaceImage(faceFile)
        .then(res => {
          setFaceText(res.face_text)
          setFaceFeatures(res.features)
          toast.success("面相识别完成")
        })
        .catch(() => {
          setFaceV2TError(true)
          toast.error("面相识别失败，可稍后重试")
        })
    }
  }

  const handlePalmPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (palmPreview) URL.revokeObjectURL(palmPreview)
    setPalmFile(f)
    const url = URL.createObjectURL(f)
    setPalmPreview(url)
    setIsPalmScanning(true)
    setPalmScanDone(false)
    setPalmV2TError(false)
    setPalmFeatures(null)
  }

  const handlePalmScanComplete = () => {
    setPalmScanDone(true)
    setIsPalmScanning(false)
    if (palmFile) {
      analyzePalmImage(palmFile)
        .then(res => {
          setPalmText(res.palm_text)
          setPalmFeatures(res.features)
          toast.success("掌纹识别完成")
        })
        .catch(() => {
          setPalmV2TError(true)
          toast.error("掌纹识别失败，可填写下方手相字段作为补充")
        })
    }
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const finalFaceText = faceText || Object.entries(palmData)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ")

      const manualPalmText = Object.entries(palmData)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ")

      const finalPalmText = palmText
        ? palmText + (manualPalmText ? "\n手动补充:\n" + manualPalmText : "")
        : manualPalmText

      const lat = typeof values.latitude === "number" ? values.latitude : undefined
      const lng = typeof values.longitude === "number" ? values.longitude : undefined

      const payload: AnalysisRequest = {
        ...values,
        latitude: lat,
        longitude: lng,
        is_premium: false,
        tarot_cards: tarotCards,
        palm_raw_text: finalPalmText,
        face_raw_text: finalFaceText,
      }

      const result = await runAnalysis(payload)
      toast.success("推命完成！正在跳转报告…")
      router.push(`/reading/${result.session_id}`)
    } catch (err: any) {
      console.error("[Reading submit] Full error:", err)
      let msg: string
      const status = err?.response?.status
      if (err?.code === "ECONNABORTED" || err?.message?.includes("timeout")) {
        msg = "分析超时，服务器响应过慢，请稍后重试"
      } else if (status === 422) {
        const details = err?.response?.data?.detail
        msg = Array.isArray(details)
          ? details.map((d: any) => d.msg).join("; ")
          : "输入数据有误，请检查填写信息"
      } else if (status === 400) {
        msg = "服务器无法解析请求，请重试"
      } else if (status === 502 || status === 503) {
        msg = "服务器暂时不可用，请稍后重试"
      } else if (status === 429) {
        msg = "请求过于频繁，请稍后再试"
      } else if (!err?.response) {
        // Network error - show more specific info
        const code = err?.code || "UNKNOWN"
        const detail = err?.message || "未知错误"
        msg = `网络连接失败 (${code}: ${detail})，请检查网络后重试`
      } else {
        msg = err?.response?.data?.detail ?? `提交失败 (HTTP ${status})，请重试`
      }
      toast.error(msg, { duration: 6000 })
      setLoading(false)
    }
  }

  // Key face features for summary display
  const FACE_KEY_FEATURES: { key: string; label: string }[] = [
    { key: "face_shape", label: "脸型" },
    { key: "three_zones_ratio", label: "三庭" },
    { key: "zhun_tou", label: "准头" },
    { key: "shan_gen", label: "山根" },
    { key: "di_ge", label: "地阁" },
    { key: "e_tou", label: "额头" },
    { key: "liang_quan", label: "两颧" },
    { key: "yan_shen", label: "眼神" },
  ]

  // Key palm features for summary display
  const PALM_KEY_FEATURES: { key: string; label: string }[] = [
    { key: "hand_shape", label: "手型" },
    { key: "life_line", label: "生命线" },
    { key: "head_line", label: "智慧线" },
    { key: "heart_line", label: "感情线" },
    { key: "fate_line", label: "命运线" },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 z-30 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold-light transition-all duration-500 ease-out shadow-[0_0_12px_rgba(201,168,76,0.4)]"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto">

        {/* Disclaimer banner */}
        <div className="mb-6 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
          <p className="text-amber-200/70 text-xs leading-relaxed">
            命理分析仅供参考和娱乐，不构成专业建议。请理性看待分析结果。
            <a href="/disclaimer" className="text-gold/60 hover:text-gold ml-1 underline">查看详情</a>
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <Sparkles className="text-gold mx-auto mb-3" size={32} />
          <h1 className="text-3xl font-serif font-bold text-gold mb-2">开始推命</h1>
          <p className="text-white/50 text-sm">八字 · 星盘 · 塔罗 · 面相 · 手相 · 五维联合分析</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-10 px-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="flex items-center w-full">
                <div className="flex-1 flex justify-end">
                  {i > 0 && (
                    <div className={`h-px flex-1 mr-2 transition-all duration-500
                      ${i <= step ? "bg-gold/60" : "bg-white/10"}`} />
                  )}
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-300 flex-shrink-0
                  ${i < step
                    ? "bg-gold text-ink shadow-[0_0_12px_rgba(201,168,76,0.5)]"
                    : i === step
                      ? "bg-gold text-ink shadow-[0_0_16px_rgba(201,168,76,0.6)] ring-2 ring-gold/30"
                      : "bg-white/10 text-white/30"
                  }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <div className="flex-1 flex justify-start">
                  {i < STEPS.length - 1 && (
                    <div className={`h-px flex-1 ml-2 transition-all duration-500
                      ${i < step ? "bg-gold/60" : "bg-white/10"}`} />
                  )}
                </div>
              </div>
              <span className={`text-[10px] sm:text-xs transition-colors duration-200 whitespace-nowrap
                ${i <= step ? "text-gold/80" : "text-white/25"}`}>
                {s}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* All steps rendered simultaneously — hidden ones stay in DOM so
              react-hook-form register() references survive step transitions */}
          <div className="relative">
            {/* ── Step 0: 出生信息 ─────────────────────────── */}
            <div className={step !== 0 ? 'hidden' : ''}>
              <FortuneGuide step={0} />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="card-glass p-6 md:p-8 space-y-6">
                  <h2 className="font-serif text-xl text-gold">出生信息</h2>

              <div>
                <label className="label">性别</label>
                <div className="flex gap-3">
                  {([["female","女"],["male","男"],["other","其他"]] as [string,string][]).map(([v,l]) => (
                    <label key={v} className="flex-1 cursor-pointer">
                      <input type="radio" value={v} {...register("gender")} className="sr-only peer" />
 <div className="text-center py-2.5 rounded-xl border border-white/20 text-white/60 peer-checked:border-gold peer-checked:text-gold peer-checked:bg-gold/10 hover:border-white/40 transition-all text-sm">{l}</div>
                    </label>
                  ))}
                </div>
              </div>

              <DateSelector
                year={watch("birth_year") || 0}
                month={watch("birth_month") || 0}
                day={watch("birth_day") || 0}
                onYearChange={v => setValue("birth_year", v)}
                onMonthChange={v => setValue("birth_month", v)}
                onDayChange={v => setValue("birth_day", v)}
              />

              {/* Shichen selector replaces hour input */}
              <ShichenSelector
                value={watchedHour ?? 0}
                onChange={(h) => setValue("birth_hour", h)}
              />

              <LocationSelector
                value={watch("birth_city") || ""}
                onChange={(v) => setValue("birth_city", v)}
                placeholder="请输入国家或城市名称"
              />
              {errors.birth_city && <p className="text-red-400 text-xs mt-1">{errors.birth_city.message}</p>}

              {/* Advanced: coordinates */}
              <details className="group">
                <summary className="text-xs text-white/30 cursor-pointer hover:text-white/50 transition-colors select-none">
                  高级设置：经纬度（可选）
                </summary>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="label text-xs">经度</label>
                    <input {...register("longitude")} type="number" step="any" placeholder="116.4" className="input-field text-sm" />
                    <p className="text-white/20 text-[10px] mt-1">东经为正，西经为负</p>
                  </div>
                  <div>
                    <label className="label text-xs">纬度</label>
                    <input {...register("latitude")} type="number" step="any" placeholder="39.9" className="input-field text-sm" />
                    <p className="text-white/20 text-[10px] mt-1">北纬为正，南纬为负</p>
                  </div>
                </div>
              </details>
            </div> {/* end card-glass */}
              </motion.div>
            </div>

          {/* ── Step 1: 塔罗 & 提问 ─────────────────────── */}
          <div className={step !== 1 ? 'hidden' : ''}>
            <FortuneGuide step={1} />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <FortuneGuide step={1} />
              <div className="card-glass p-6 md:p-8 space-y-6">
                <h2 className="font-serif text-xl text-gold">塔罗提问</h2>

              {/* Hot question templates */}
              <HotQuestions
                value={watchedQuestion}
                onChange={(q) => setValue("user_question", q)}
              />

              <div>
                <label className="label">输入你的问题</label>
                <textarea {...register("user_question")} rows={3}
                  placeholder="例如：我的事业方向如何？近期感情运势？是否适合创业？"
                  className="input-field resize-none" />
                {errors.user_question && <p className="text-red-400 text-xs mt-1">{errors.user_question.message}</p>}
              </div>

              {/* Divider */}
              <div className="star-divider">
                <span className="text-gold/40 text-xs tracking-widest">塔罗牌阵</span>
              </div>

              <TarotPicker onSelect={setTarotCards} />
            </div> {/* end card-glass */}
              </motion.div>
            </div>

          {/* ── Step 2: 面相 & 手相 ──────────────────────── */}
          <div className={step !== 2 ? 'hidden' : ''}>
            <FortuneGuide step={2} />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <FortuneGuide step={2} />
              <div className="card-glass p-6 md:p-8 space-y-8">
                {/* ── Face Photo ───────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Camera size={18} className="text-gold" />
                  <h2 className="font-serif text-xl text-gold">上传面部照片</h2>
                  <span className="text-white/30 text-sm font-sans">（推荐）</span>
                </div>
                <p className="text-white/40 text-xs mb-4">AI 将通过 MediaPipe 468 点特征识别，自动分析准头、山根、地阁等宫位</p>

                {/* Pre-scan guide overlay */}
                {showFaceGuide && facePreview && !isFaceScanning && !faceScanDone && (
                  <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 mb-4 text-sm text-gold/80 flex items-center gap-2 animate-pulse-slow">
                    <AlertCircle size={14} />
                    正在准备面相识别，请确保面部正对镜头、光线充足…
                  </div>
                )}

                {isFaceScanning && facePreview ? (
                  <FaceScanAnimation
                    imageUrl={facePreview}
                    isScanning={true}
                    onComplete={handleFaceScanComplete}
                  />
                ) : (
                  <div onClick={() => faceRef.current?.click()}
 className="border-2 border-dashed border-white/20 hover:border-gold/40 rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all group">
                    {facePreview ? (
                      <div className="relative inline-block">
                        <img src={facePreview} alt="preview"
                          className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-full mx-auto border-2 border-gold/40" />
                        {faceText && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                        )}
                        {faceV2TError && (
                          <p className="text-amber-400 text-xs mt-2">识别失败，点击重试</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Camera size={36} className="mx-auto text-white/20 group-hover:text-gold/50 mb-2 transition-colors" />
                        <p className="text-white/40 text-sm">点击上传正面照</p>
                        <p className="text-white/20 text-xs mt-1">上传后自动进行 AI 面相识别</p>
                      </div>
                    )}
                  </div>
                )}
                <input ref={faceRef} type="file" accept="image/*" className="sr-only" onChange={handleFacePick} />

                {/* Face feature summary after successful scan */}
                {faceFeatures && !isFaceScanning && (
                  <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-gold text-xs font-medium mb-2 flex items-center gap-1.5">
                      <CheckCircle size={12} /> 面相识别结果概要
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {FACE_KEY_FEATURES.filter(f => faceFeatures[f.key]).map(f => (
                        <span key={f.key}
                          className="text-[11px] px-2 py-0.5 bg-white/10 rounded-full text-white/60">
                          {f.label}: {faceFeatures[f.key]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Palm Photo ───────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Hand size={18} className="text-gold" />
                  <h2 className="font-serif text-xl text-gold">上传手部照片</h2>
                  <span className="text-white/30 text-sm font-sans">（推荐）</span>
                </div>
                <p className="text-white/40 text-xs mb-4">AI 将分析手型分类、三大主线及特殊纹路</p>

                {/* Pre-scan guide overlay */}
                {showPalmGuide && palmPreview && !isPalmScanning && !palmScanDone && (
                  <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 mb-4 text-sm text-gold/80 flex items-center gap-2 animate-pulse-slow">
                    <AlertCircle size={14} />
                    正在准备掌纹识别，请确保手掌平放、纹路清晰…
                  </div>
                )}

                {isPalmScanning && palmPreview ? (
                  <FaceScanAnimation
                    imageUrl={palmPreview}
                    isScanning={true}
                    onComplete={handlePalmScanComplete}
                  />
                ) : (
                  <div onClick={() => palmRef.current?.click()}
 className="border-2 border-dashed border-white/20 hover:border-gold/40 rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all group">
                    {palmPreview ? (
                      <div className="relative inline-block">
                        <img src={palmPreview} alt="palm preview"
                          className="w-32 h-32 md:w-36 md:h-36 object-contain rounded-xl mx-auto border-2 border-gold/40" />
                        {palmText && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                        )}
                        {palmV2TError && (
                          <p className="text-amber-400 text-xs mt-2">识别失败，点击重试或填写下方文本字段</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Hand size={36} className="mx-auto text-white/20 group-hover:text-gold/50 mb-2 transition-colors" />
                        <p className="text-white/40 text-sm">点击上传手掌照片</p>
                        <p className="text-white/20 text-xs mt-1">上传后自动进行 AI 掌纹识别</p>
                      </div>
                    )}
                  </div>
                )}
                <input ref={palmRef} type="file" accept="image/*" className="sr-only" onChange={handlePalmPick} />

                {/* Palm feature summary after successful scan */}
                {palmFeatures && !isPalmScanning && (
                  <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-gold text-xs font-medium mb-2 flex items-center gap-1.5">
                      <CheckCircle size={12} /> 手相识别结果概要
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PALM_KEY_FEATURES.filter(f => palmFeatures[f.key]).map(f => (
                        <span key={f.key}
                          className="text-[11px] px-2 py-0.5 bg-white/10 rounded-full text-white/60">
                          {f.label}: {palmFeatures[f.key]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Manual palm text fallback ────────────── */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-white/50 text-sm mb-3">
                  手相文本补充 <span className="text-white/20 text-xs">（若拍照识别失败，可手动填写你观察到的特征）</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PALM_FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input type="text" placeholder={placeholder}
                        value={palmData[key] ?? ""}
                        onChange={e => setPalmData(d => ({ ...d, [key]: e.target.value }))}
                        className="input-field text-sm" />
                    </div>
                  ))}
                </div>
              </div> {/* end manual palm */}
            </div> {/* end card-glass */}
              </motion.div>
            </div>

          {/* ── Step 3: 确认 ─────────────────────────────── */}
          <div className={step !== 3 ? 'hidden' : ''}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="card-glass p-6 md:p-8 text-center space-y-6">
              <div className="text-6xl animate-float">🔮</div>
              <h2 className="font-serif text-2xl text-gold">五维推命即将开始</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                五大 AI 命师将同步并行分析，<br />
                预计 <span className="text-gold font-semibold">15-40 秒</span> 生成你的专属报告。
              </p>
              <div className="card-glass p-4 text-left space-y-2">
                {[
                  ["☯", "周易八字 — 四柱格局 · 五行得分 · 流年研判"],
                  ["✦", "西方星盘 — 行星落宫 · 相位角度 · 灵魂使命"],
                  ["🃏", "塔罗疗愈 — 牌阵解读 · 当下能量 · 行动指引"],
                  ["👁", `AI 面相 — ${faceText ? "V2T 自动识别已就绪" : "未提供面部照片"}`],
                  ["🤚", `手相解读 — ${palmText ? "V2T 自动识别已就绪" : Object.values(palmData).some(v => v) ? "手动填写已就绪" : "未提供手相数据"}`],
                  ["🌟", "Master 汇总 — 跨维度融合 · 改运商品精准匹配"],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="flex-shrink-0">{icon}</span> {text}
                  </div>
                ))}
              </div>

              {/* ── Tier Selection ───────────────────────── */}
              <div className="border-t border-white/10 pt-5">
                <p className="text-white/50 text-xs mb-4">选择报告深度</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Free tier */}
                  <div className="bg-white/5 border border-white/20 rounded-xl p-4 text-left hover:border-white/40 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🔍</span>
                      <span className="text-white/80 font-medium text-sm">免费体验</span>
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed mb-3">
                      命盘总览摘要 + 各维度预览
                    </p>
                    <button type="submit" disabled={loading}
                      className="w-full py-2 rounded-full border border-gold/30 text-gold text-sm hover:bg-gold/10 transition-all">
                      {loading
                        ? <span className="flex items-center justify-center gap-1"><Loader2 size={14} className="animate-spin" /> 推命中…</span>
                        : "免费开始"}
                    </button>
                  </div>

                  {/* Paid tier */}
                  <div className="relative bg-gold/5 border border-gold/40 rounded-xl p-4 text-left ring-1 ring-gold/20">
                    <div className="absolute -top-2.5 right-3 bg-gold text-ink text-[10px] font-bold px-2 py-0.5 rounded-full">
                      首单 ¥29.9
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">👑</span>
                      <span className="text-gold font-medium text-sm">全维报告</span>
                      <span className="text-gold/60 text-xs ml-auto">¥69</span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mb-3">
                      完整年度规划 + AI 商品匹配 + ¥60 代金券
                    </p>
                    <button type="submit" disabled={loading}
                      className="w-full py-2 btn-gold text-sm">
                      {loading
                        ? <span className="flex items-center justify-center gap-1"><Loader2 size={14} className="animate-spin" /> 推命中…</span>
                        : "解锁完整报告"}
                    </button>
                  </div>
                </div>
                <p className="text-white/25 text-[10px] mt-3">
                  无论选择哪种，均可先查看命盘总览摘要；完整报告可稍后在报告页解锁
                </p>
              </div>
            </div> {/* end card-glass */}
              </motion.div>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(s => s - 1)}
 className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 text-white/60 hover:border-white/40 transition-all">
                <ChevronLeft size={16} /> 上一步
              </button>
            ) : <div />}

            {step < STEPS.length - 1 && (
              <button type="button" onClick={() => setStep(s => s + 1)}
                className="btn-gold flex items-center gap-2">
                下一步 <ChevronRight size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
