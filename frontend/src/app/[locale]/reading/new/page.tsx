"use client"
import { useState, useRef, useEffect, useMemo, Suspense, lazy } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import {
  Upload, Camera, Hand, ChevronRight, ChevronLeft,
  Loader2, Sparkles, Star, CheckCircle, AlertCircle, Trash2,
} from "lucide-react"
import { runAnalysisStream, AnalysisRequest, analyzeFaceImage, analyzePalmImage } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { addReadingToHistory } from "@/lib/readingHistory"
import { useWizardStore } from "@/stores/useWizardStore"
import { useUserStore } from "@/stores/useUserStore"

const TarotPicker = lazy(() => import("@/components/reading/TarotPicker").then(m => ({ default: m.TarotPicker })))
const FaceScanAnimation = lazy(() => import("@/components/reading/FaceScanAnimation").then(m => ({ default: m.FaceScanAnimation })))
const ShichenSelector = lazy(() => import("@/components/reading/ShichenSelector").then(m => ({ default: m.ShichenSelector })))
const LocationSelector = lazy(() => import("@/components/reading/LocationSelector").then(m => ({ default: m.LocationSelector })))
const DateSelector = lazy(() => import("@/components/reading/DateSelector").then(m => ({ default: m.DateSelector })))
const HotQuestions = lazy(() => import("@/components/reading/HotQuestions").then(m => ({ default: m.HotQuestions })))
const FortuneGuide = lazy(() => import("@/components/reading/FortuneGuide").then(m => ({ default: m.FortuneGuide })))

const STORAGE_KEY = "destiny_reading_progress"

interface SavedProgress {
  step: number
  formValues: Record<string, unknown>
  tarotCards: { position: string; card: string; reversed: boolean }[]
  palmData: Record<string, string>
  savedAt: string
}

function loadSavedProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SavedProgress
    // Expire after 24 hours
    if (Date.now() - new Date(data.savedAt).getTime() > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

function saveProgress(data: SavedProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

function clearSavedProgress() {
  localStorage.removeItem(STORAGE_KEY)
}

export default function NewReadingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { locale, t, localeHref } = useLanguage()
  const isEn = locale === "en"
  const { userProfile, activeTestTarget, fetchBirthProfiles } = useUserStore()

  // ── Wizard store: intent & prefill ──────────────────────────
  const { currentIntent, formData: wizardData, startStep: wizardStartStep, reset: resetWizard } = useWizardStore()

  // ── Read intent from URL search params (direct navigation) ──
  useEffect(() => {
    const intentParam = searchParams.get("intent")
    if (intentParam && !currentIntent) {
      const INTENT_MAP: Record<string, string> = {
        quick: "GENERAL_DAILY",
        full: "FULL_MULTIMODAL",
        relationship: "RELATIONSHIP",
      }
      const mapped = INTENT_MAP[intentParam]
      if (mapped) {
        resetWizard()
        useWizardStore.getState().setIntent(mapped as any)
        // Pre-fill is handled by the userProfile effect below
      }
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pre-fill from active birth profile when available ──────
  // Uses activeTestTarget (friend profile if selected) or userProfile (own).
  // When it becomes available, pre-fill the wizard store.
  const activeProfile = activeTestTarget || userProfile
  useEffect(() => {
    if (prefilledFromProfile.current) return
    if (!currentIntent) return // Only pre-fill for intent flows
    // Ensure profiles are fetched (handles direct navigation to wizard)
    if (user && !activeProfile) {
      fetchBirthProfiles()
      return
    }
    if (!activeProfile) return
    prefilledFromProfile.current = true
    useWizardStore.getState().prefillFromProfile(activeProfile)
  }, [user, activeProfile, currentIntent]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Validation schema (uses t() for messages) ──
  // birth_city is only required when birth info step is shown (FULL_MULTIMODAL / no intent)
  const schema = useMemo(() => z.object({
    gender: z.enum(["male", "female", "other"]),
    birth_year:   z.coerce.number().min(1920).max(2026),
    birth_month:  z.coerce.number().min(1).max(12),
    birth_day:    z.coerce.number().min(1).max(31),
    birth_hour:   z.coerce.number().min(0).max(23),
    birth_minute: z.coerce.number().min(0).max(59).default(0),
    birth_city:   currentIntent
      ? z.string().optional().default("") // Intent flows skip birth step
      : z.string().min(1, t("new.cityRequired")), // No intent = full flow, require city
    latitude:     z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
    longitude:    z.coerce.number().min(-180).max(180).optional().or(z.literal("")),
    user_question: z.string().min(2, t("new.questionMinChars")).max(200),
    // Partner fields for RELATIONSHIP intent
    partner_name: z.string().optional().default(""),
    partner_gender: z.enum(["male", "female", "other"]).optional().default("female"),
    partner_birth_year: z.coerce.number().min(1920).max(2026).optional().default(0),
    partner_birth_month: z.coerce.number().min(1).max(12).optional().default(1),
    partner_birth_day: z.coerce.number().min(1).max(31).optional().default(1),
    partner_birth_hour: z.coerce.number().min(0).max(23).optional().default(0),
    partner_birth_minute: z.coerce.number().min(0).max(59).optional().default(0),
    partner_birth_city: z.string().optional().default(""),
    partner_latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
    partner_longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal("")),
    relationship_type: z.string().optional().default(""),
  }), [t, currentIntent])
  type FormValues = z.infer<typeof schema>

  // ── Step labels ── (defined above via useMemo based on intent)

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
  // Partner face state
  const [partnerFaceFile, setPartnerFaceFile] = useState<File | null>(null)
  const [partnerFacePreview, setPartnerFacePreview] = useState<string | null>(null)
  const [partnerIsFaceScanning, setPartnerIsFaceScanning] = useState(false)
  const [partnerFaceScanDone, setPartnerFaceScanDone] = useState(false)
  const [partnerFaceText, setPartnerFaceText] = useState<string>("")
  const [partnerFaceV2TError, setPartnerFaceV2TError] = useState(false)
  const [partnerFaceFeatures, setPartnerFaceFeatures] = useState<Record<string, string> | null>(null)
  // Partner palm state
  const [partnerPalmFile, setPartnerPalmFile] = useState<File | null>(null)
  const [partnerPalmPreview, setPartnerPalmPreview] = useState<string | null>(null)
  const [partnerIsPalmScanning, setPartnerIsPalmScanning] = useState(false)
  const [partnerPalmScanDone, setPartnerPalmScanDone] = useState(false)
  const [partnerPalmText, setPartnerPalmText] = useState<string>("")
  const [partnerPalmV2TError, setPartnerPalmV2TError] = useState(false)
  const [partnerPalmFeatures, setPartnerPalmFeatures] = useState<Record<string, string> | null>(null)
  // Other state
  const [tarotCards, setTarotCards]   = useState<{ position: string; card: string; reversed: boolean }[]>([])
  const [palmData, setPalmData]       = useState<Record<string, string>>({})
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar")
  const [partnerCalendarType, setPartnerCalendarType] = useState<"solar" | "lunar">("solar")
  const [showFaceGuide, setShowFaceGuide] = useState(false)
  const [showPalmGuide, setShowPalmGuide] = useState(false)
  const faceRef = useRef<HTMLInputElement>(null)
  const palmRef = useRef<HTMLInputElement>(null)
  const partnerFaceRef = useRef<HTMLInputElement>(null)
  const partnerPalmRef = useRef<HTMLInputElement>(null)
  const prevIntentRef = useRef<string | null>(null)
  const isFirstRenderRef = useRef(true)
  const prefilledFromProfile = useRef(false)

  // Revoke blob URLs on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (facePreview) URL.revokeObjectURL(facePreview)
      if (palmPreview) URL.revokeObjectURL(palmPreview)
      if (partnerFacePreview) URL.revokeObjectURL(partnerFacePreview)
      if (partnerPalmPreview) URL.revokeObjectURL(partnerPalmPreview)
      // Reset wizard store when leaving
      resetWizard()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { birth_minute: 0, gender: "female", birth_year: 1990, birth_month: 1, birth_day: 1, birth_hour: 12, user_question: t("new.defaultQuestion") },
  })

  const watchedQuestion = watch("user_question")
  const watchedHour = watch("birth_hour")

  // Dynamic steps based on intent
  const STEPS = useMemo(() => {
    if (currentIntent === "SPECIFIC_EVENT") {
      return [t("new.step4")] // Only confirm
    }
    if (currentIntent === "GENERAL_DAILY") {
      return [t("new.step2"), t("new.step4")] // Tarot + confirm
    }
    if (currentIntent === "RELATIONSHIP") {
      return [t("new.step1"), t("new.stepPartner"), t("new.step2"), t("new.step4")] // Birth info + Partner + Tarot + confirm
    }
    // FULL_MULTIMODAL or no intent — all 4 steps
    return [t("new.step1"), t("new.step2"), t("new.step3"), t("new.step4")]
  }, [currentIntent, t])

  // All possible step labels (for mapping logical index → DOM index)
  const ALL_STEP_LABELS = useMemo(
    () => [t("new.step1"), t("new.step2"), t("new.step3"), t("new.step4")],
    [t]
  )

  // Prefill form from wizard store — re-runs when wizardData changes (e.g. after prefillFromProfile)
  useEffect(() => {
    if (wizardData.birth_year > 0) {
      setValue("gender", wizardData.gender)
      setValue("birth_year", wizardData.birth_year)
      setValue("birth_month", wizardData.birth_month)
      setValue("birth_day", wizardData.birth_day)
      setValue("birth_hour", wizardData.birth_hour)
      setValue("birth_minute", wizardData.birth_minute)
      setValue("birth_city", wizardData.birth_city)
    }
    if (wizardData.user_question) {
      setValue("user_question", wizardData.user_question)
    }
  }, [wizardData.birth_year]) // eslint-disable-line react-hooks/exhaustive-deps

  // Skip to appropriate step on mount
  useEffect(() => {
    if (wizardStartStep > 0) {
      const maxStep = STEPS.length - 1
      setStep(Math.min(wizardStartStep, maxStep))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Restore saved progress ──────────────────────────────────
  // Skip when wizard has explicitly set a startStep (intent flow)
  useEffect(() => {
    if (wizardStartStep > 0) return // Wizard controls the step — don't override from localStorage
    const saved = loadSavedProgress()
    if (saved) {
      // Handle backward compatibility: old saves used DOM step indices
      // New format uses logical step indices directly
      const label = ALL_STEP_LABELS[saved.step]
      const logicalFromDom = label ? STEPS.indexOf(label) : -1
      if (logicalFromDom >= 0) {
        // Old DOM format: convert to logical index
        setStep(logicalFromDom)
      } else if (saved.step >= 0 && saved.step < STEPS.length) {
        // Already a logical index
        setStep(saved.step)
      } else {
        setStep(0) // Fallback to first step
      }
      setTarotCards(saved.tarotCards || [])
      setPalmData(saved.palmData || {})
      // Restore form values
      if (saved.formValues) {
        Object.entries(saved.formValues).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            setValue(key as keyof FormValues, value as any)
          }
        })
      }
      toast.success(t("new.restoredMsg"), { duration: 3000 })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync step with intent changes ─────────────────────────
  // On first render or when intent changes, ensure step maps to a valid logical step.
  // IMPORTANT: The wizard's startStep takes priority — don't override it.
  //
  // BUG FIX: Previously used `prevIntentRef.current === null` to detect first render,
  // but when currentIntent is also null (direct navigation without wizard), this
  // condition was perpetually true, causing step to reset to 0 on every re-render.
  // Fixed by using a separate isFirstRenderRef boolean that only fires once.
  useEffect(() => {
    // Skip entirely if wizard has set a starting step — it controls the flow
    if (wizardStartStep > 0) return

    const intentChanged = prevIntentRef.current !== currentIntent
    prevIntentRef.current = currentIntent

    if (isFirstRenderRef.current || intentChanged) {
      isFirstRenderRef.current = false
      // Only reset if step is somehow invalid for the current intent
      if (step !== 0) setStep(0)
    }
  }, [currentIntent, wizardStartStep, step]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save progress ──────────────────────────────────────
  useEffect(() => {
    if (currentIntent === "SPECIFIC_EVENT") return // Event analysis is single-step, no need to save
    if (step === 0 && !watch("birth_year")) return // Don't save empty initial state
    const timeout = setTimeout(() => {
      saveProgress({
        step,
        formValues: watch(),
        tarotCards,
        palmData,
        savedAt: new Date().toISOString(),
      })
    }, 500)
    return () => clearTimeout(timeout)
  }, [step, tarotCards, palmData, watch, currentIntent])

  const handleClearProgress = () => {
    clearSavedProgress()
    setStep(0) // Reset to first logical step (e.g. tarot for GENERAL_DAILY)
    setTarotCards([])
    setPalmData({})
    setValue("gender", "female")
    setValue("birth_year", 0)
    setValue("birth_month", 0)
    setValue("birth_day", 0)
    setValue("birth_hour", 0)
    setValue("birth_minute", 0)
    setValue("birth_city", "")
    setValue("user_question", t("new.defaultQuestion"))
    toast.success(t("new.clearedMsg"))
  }

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
      const timeout = setTimeout(() => setShowFaceGuide(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [facePreview, faceScanDone])

  useEffect(() => {
    if (palmPreview && !palmScanDone) {
      setShowPalmGuide(true)
      const timeout = setTimeout(() => setShowPalmGuide(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [palmPreview, palmScanDone])

  const handleFacePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(f.type)) {
      toast.error(t('reading.invalidImageType') || 'Please upload a JPG, PNG, or WebP image')
      return
    }
    if (f.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error(t('reading.imageTooLarge') || 'Image must be under 10MB')
      return
    }
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
          toast.success(t("new.faceDoneToast"))
        })
        .catch(() => {
          setFaceV2TError(true)
          toast.error(t("new.faceErrorToast"))
        })
    }
  }

  const handlePalmPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(f.type)) {
      toast.error(t('reading.invalidImageType') || 'Please upload a JPG, PNG, or WebP image')
      return
    }
    if (f.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error(t('reading.imageTooLarge') || 'Image must be under 10MB')
      return
    }
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
          toast.success(t("new.palmDoneToast"))
        })
        .catch(() => {
          setPalmV2TError(true)
          toast.error(t("new.palmErrorToast"))
        })
    }
  }

  // ── Partner face/palm handlers ──────────────────────────────
  const handlePartnerFacePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(f.type)) {
      toast.error(t('reading.invalidImageType') || 'Please upload a JPG, PNG, or WebP image')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error(t('reading.imageTooLarge') || 'Image must be under 10MB')
      return
    }
    if (partnerFacePreview) URL.revokeObjectURL(partnerFacePreview)
    setPartnerFaceFile(f)
    const url = URL.createObjectURL(f)
    setPartnerFacePreview(url)
    setPartnerIsFaceScanning(true)
    setPartnerFaceScanDone(false)
    setPartnerFaceV2TError(false)
    setPartnerFaceFeatures(null)
  }

  const handlePartnerFaceScanComplete = () => {
    setPartnerFaceScanDone(true)
    setPartnerIsFaceScanning(false)
    if (partnerFaceFile) {
      analyzeFaceImage(partnerFaceFile)
        .then(res => {
          setPartnerFaceText(res.face_text)
          setPartnerFaceFeatures(res.features)
          toast.success(t("new.partnerFaceDoneToast"))
        })
        .catch(() => {
          setPartnerFaceV2TError(true)
          toast.error(t("new.partnerFaceErrorToast"))
        })
    }
  }

  const handlePartnerPalmPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(f.type)) {
      toast.error(t('reading.invalidImageType') || 'Please upload a JPG, PNG, or WebP image')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error(t('reading.imageTooLarge') || 'Image must be under 10MB')
      return
    }
    if (partnerPalmPreview) URL.revokeObjectURL(partnerPalmPreview)
    setPartnerPalmFile(f)
    const url = URL.createObjectURL(f)
    setPartnerPalmPreview(url)
    setPartnerIsPalmScanning(true)
    setPartnerPalmScanDone(false)
    setPartnerPalmV2TError(false)
    setPartnerPalmFeatures(null)
  }

  const handlePartnerPalmScanComplete = () => {
    setPartnerPalmScanDone(true)
    setPartnerIsPalmScanning(false)
    if (partnerPalmFile) {
      analyzePalmImage(partnerPalmFile)
        .then(res => {
          setPartnerPalmText(res.palm_text)
          setPartnerPalmFeatures(res.features)
          toast.success(t("new.partnerPalmDoneToast"))
        })
        .catch(() => {
          setPartnerPalmV2TError(true)
          toast.error(t("new.partnerPalmErrorToast"))
        })
    }
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const finalFaceText = faceText

      const finalPalmText = palmText

      const lat = typeof values.latitude === "number" ? values.latitude : undefined
      const lng = typeof values.longitude === "number" ? values.longitude : undefined

      const payload: AnalysisRequest = {
        ...values,
        latitude: lat,
        longitude: lng,
        is_premium: false,
        language: locale === "en" ? "en" : "zh",
        tarot_cards: tarotCards,
        palm_raw_text: finalPalmText,
        face_raw_text: finalFaceText,
        intent: currentIntent || undefined,
        // Partner fields for RELATIONSHIP
        partner_name: values.partner_name || "",
        partner_gender: values.partner_gender || "female",
        partner_birth_year: values.partner_birth_year || undefined,
        partner_birth_month: values.partner_birth_month || undefined,
        partner_birth_day: values.partner_birth_day || undefined,
        partner_birth_hour: values.partner_birth_hour || undefined,
        partner_birth_minute: values.partner_birth_minute || 0,
        partner_birth_city: values.partner_birth_city || "",
        partner_latitude: typeof values.partner_latitude === "number" ? values.partner_latitude : undefined,
        partner_longitude: typeof values.partner_longitude === "number" ? values.partner_longitude : undefined,
        partner_face_raw_text: partnerFaceText || undefined,
        partner_palm_raw_text: partnerPalmText || undefined,
        relationship_type: values.relationship_type || "",
      }

      const result = await runAnalysisStream(payload, (event) => {
        // Progress events — reading page handles the main display
        console.debug("[Analysis]", event.type)
      })

      if (!result?.session_id) {
        throw new Error("Server returned no session_id — analysis may not have started")
      }

      // Save to reading history for anonymous users
      addReadingToHistory(result.session_id, values.user_question || undefined)

      clearSavedProgress()
      toast.success(t("new.readingStarted"))
      router.push(localeHref(`/reading/${result.session_id}`))
    } catch (err: any) {
      console.error("[Reading submit] Full error:", err)
      console.error("[Reading submit] Error details:", {
        status: err?.response?.status,
        data: err?.response?.data,
        code: err?.code,
        message: err?.message,
      })
      let msg: string
      const status = err?.response?.status
      if (err?.code === "ECONNABORTED" || err?.message?.includes("timeout")) {
        msg = t("new.timeoutError")
      } else if (status === 422) {
        const details = err?.response?.data?.detail
        msg = Array.isArray(details)
          ? details.map((d: any) => d.msg).join("; ")
          : t("new.inputError")
      } else if (status === 400) {
        // 400 usually means malformed request body — include server detail
        const detail = err?.response?.data?.detail
        msg = detail ? `${t("new.parseError")}: ${detail}` : t("new.parseError")
      } else if (status === 502 || status === 503) {
        msg = t("new.serverBusy")
      } else if (status === 429) {
        msg = t("new.rateLimitError")
      } else if (!err?.response) {
        const code = err?.code || "UNKNOWN"
        const detail = err?.message || t("new.unknownError")
        msg = t("new.networkErrorMsg").replace("{code}", code).replace("{detail}", detail)
      } else {
        msg = err?.response?.data?.detail ?? t("new.submitErrorMsg").replace("{status}", String(status))
      }
      toast.error(msg, { duration: 6000 })
      setLoading(false)
    }
  }

  // Key face features for summary display
  const FACE_KEY_FEATURES: { key: string; label: string }[] = useMemo(() => [
    { key: "face_shape", label: t("new.face.faceShape") },
    { key: "three_zones_ratio", label: t("new.face.threeZones") },
    { key: "zhun_tou", label: t("new.face.noseTip") },
    { key: "shan_gen", label: t("new.face.noseBridge") },
    { key: "di_ge", label: t("new.face.jawline") },
    { key: "e_tou", label: t("new.face.forehead") },
    { key: "liang_quan", label: t("new.face.cheekbones") },
    { key: "yan_shen", label: t("new.face.eyes") },
  ], [t])

  // Key palm features for summary display
  const PALM_KEY_FEATURES: { key: string; label: string }[] = useMemo(() => [
    { key: "hand_shape", label: t("new.handShape") },
    { key: "life_line", label: t("new.palm.lifeLine") },
    { key: "head_line", label: t("new.palm.headLine") },
    { key: "heart_line", label: t("new.palm.heartLine") },
    { key: "fate_line", label: t("new.palm.fateLine") },
  ], [t])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 z-30 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold-light transition-all duration-500 ease-out shadow-[0_0_12px_rgba(201,168,76,0.4)]"
          style={{
            width: `${((step + 1) / STEPS.length) * 100}%`
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto">

        {/* Disclaimer banner */}
        <div className="mb-6 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
          <p className="text-amber-200/70 text-xs leading-relaxed">
            {t("new.disclaimer")}
            <a href={localeHref("/disclaimer")} className="text-gold/60 hover:text-gold ml-1 underline">{t("new.viewDetails")}</a>
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <Sparkles className="text-gold mx-auto mb-3" size={32} />
          <h1 className="text-3xl font-serif font-bold text-gold mb-2">{t("new.startTitle")}</h1>
          <p className="text-white/50 text-sm">{t("new.startSubtitle")}</p>
        </div>

        {/* Step indicators — step is now a logical index */}
        <div className="flex items-center justify-between mb-10 px-1">
          {STEPS.map((label, i) => {
            return (
              <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center w-full">
                  <div className="flex-1 flex justify-end">
                    {i > 0 && (
                      <div className={`h-px flex-1 mr-2 transition-all duration-500
                        ${i < step ? "bg-gold/60" : "bg-white/10"}`} />
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
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Clear progress button — show when past the first logical step */}
        {step > 0 && (
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={handleClearProgress}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} /> {t("new.clearProgress")}
            </button>
          </div>
        )}

        <form onSubmit={async (e) => {
          e.preventDefault()
          const vals = watch()
          if (!vals.birth_year || vals.birth_year < 1920) {
            toast.error(t("new.dateRequired"))
            return
          }
          if (!vals.user_question || vals.user_question.trim().length < 2) {
            toast.error(t("new.questionMinChars"))
            return
          }
          if (!currentIntent && (!vals.birth_city || vals.birth_city.trim().length === 0)) {
            toast.error(t("new.cityRequired"))
            return
          }
          await onSubmit(vals as FormValues)
        }}>
          {/* All steps rendered simultaneously — hidden ones stay in DOM so
              react-hook-form register() references survive step transitions */}
          <div className="relative">
            {/* ── Step 0: Birth Info ─────────────────────────── */}
            <div className={STEPS[step] !== t("new.step1") ? 'hidden' : ''}>
              <FortuneGuide step={0} intent={currentIntent} />
              <div
              >
                <div className="card-glass p-6 md:p-8 space-y-6">
                  <h2 className="font-serif text-xl text-gold">{t("new.birthInfoTitle")}</h2>

              <div>
                <label className="label">{t("new.genderLabel")}</label>
                <div className="flex gap-3">
                  {([["female", t("new.genderFemale")], ["male", t("new.genderMale")], ["other", t("new.genderOther")]] as [string,string][]).map(([v,l]) => (
                    <label key={v} className="flex-1 cursor-pointer">
                      <input type="radio" value={v} {...register("gender")} className="sr-only peer" />
 <div className="text-center py-2.5 rounded-xl border border-white/20 text-white/60 peer-checked:border-gold peer-checked:text-gold peer-checked:bg-gold/10 hover:border-white/40 transition-all text-sm">{l}</div>
                    </label>
                  ))}
                </div>
              </div>

              <Suspense fallback={<div className="h-10 bg-white/5 rounded animate-pulse" />}>
                <DateSelector
                  year={watch("birth_year") || 0}
                  month={watch("birth_month") || 0}
                  day={watch("birth_day") || 0}
                  onYearChange={v => setValue("birth_year", v)}
                  onMonthChange={v => setValue("birth_month", v)}
                  onDayChange={v => setValue("birth_day", v)}
                  calendarType={calendarType}
                  onCalendarTypeChange={setCalendarType}
                />
              </Suspense>
              {(errors.birth_year || errors.birth_month || errors.birth_day) && (
                <p className="text-red-400 text-xs mt-1">{t("new.dateRequired")}</p>
              )}

              {/* Shichen selector replaces hour input */}
              <Suspense fallback={<div className="h-10 bg-white/5 rounded animate-pulse" />}>
                <ShichenSelector
                  value={watchedHour ?? 0}
                  onChange={(h) => setValue("birth_hour", h)}
                />
              </Suspense>
              {errors.birth_hour && <p className="text-red-400 text-xs mt-1">{t("new.hourRequired")}</p>}

              <Suspense fallback={<div className="h-10 bg-white/5 rounded animate-pulse" />}>
                <LocationSelector
                  value={watch("birth_city") || ""}
                  onChange={(v) => setValue("birth_city", v)}
                  placeholder={t("new.cityPlaceholder")}
                />
              </Suspense>
              {errors.birth_city && <p className="text-red-400 text-xs mt-1">{errors.birth_city.message}</p>}

              {/* Advanced: coordinates */}
              <details className="group">
                <summary className="text-xs text-white/30 cursor-pointer hover:text-white/50 transition-colors select-none">
                  {t("new.advancedSettings")}
                </summary>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="label text-xs">{t("new.longitude")}</label>
                    <input {...register("longitude")} type="number" step="any" placeholder="116.4" className="input-field text-sm" />
                    <p className="text-white/20 text-[10px] mt-1">{t("new.lngHint")}</p>
                  </div>
                  <div>
                    <label className="label text-xs">{t("new.latitude")}</label>
                    <input {...register("latitude")} type="number" step="any" placeholder="39.9" className="input-field text-sm" />
                    <p className="text-white/20 text-[10px] mt-1">{t("new.latHint")}</p>
                  </div>
                </div>
              </details>
            </div> {/* end card-glass */}
              </div>
            </div>

          {/* ── Step 1b: Partner Info (RELATIONSHIP only) ────── */}
          {currentIntent === "RELATIONSHIP" && (
            <div className={STEPS[step] !== t("new.stepPartner") ? 'hidden' : ''}>
              <div className="card-glass p-6 md:p-8 space-y-6">
                <h2 className="font-serif text-xl text-gold">{t("new.partnerTitle")}</h2>
                <p className="text-white/40 text-sm">{t("new.partnerDesc")}</p>

                {/* Relationship type */}
                <div>
                  <label className="label">{t("new.relationshipType")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["lover", t("new.relLover")],
                      ["friend", t("new.relFriend")],
                      ["colleague", t("new.relColleague")],
                      ["family", t("new.relFamily")],
                    ].map(([v, l]) => (
                      <label key={v} className="cursor-pointer">
                        <input type="radio" value={v} {...register("relationship_type")} className="sr-only peer" />
                        <div className="text-center py-2.5 rounded-xl border border-white/20 text-white/60 peer-checked:border-gold peer-checked:text-gold peer-checked:bg-gold/10 hover:border-white/40 transition-all text-sm">{l}</div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Partner name */}
                <div>
                  <label className="label">{t("new.partnerName")}</label>
                  <input {...register("partner_name")} placeholder={t("new.partnerNamePlaceholder")} className="input-field" />
                </div>

                {/* Partner gender */}
                <div>
                  <label className="label">{t("new.partnerGender")}</label>
                  <div className="flex gap-3">
                    {([["female", t("new.genderFemale")], ["male", t("new.genderMale")], ["other", t("new.genderOther")]] as [string,string][]).map(([v,l]) => (
                      <label key={v} className="flex-1 cursor-pointer">
                        <input type="radio" value={v} {...register("partner_gender")} className="sr-only peer" />
                        <div className="text-center py-2.5 rounded-xl border border-white/20 text-white/60 peer-checked:border-gold peer-checked:text-gold peer-checked:bg-gold/10 hover:border-white/40 transition-all text-sm">{l}</div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Partner birth date */}
                <div>
                  <label className="label">{t("new.partnerBirthDate")}</label>
                  <Suspense fallback={<div className="h-10 bg-white/5 rounded animate-pulse" />}>
                    <DateSelector
                      year={watch("partner_birth_year") || 0}
                      month={watch("partner_birth_month") || 0}
                      day={watch("partner_birth_day") || 0}
                      onYearChange={v => setValue("partner_birth_year", v)}
                      onMonthChange={v => setValue("partner_birth_month", v)}
                      onDayChange={v => setValue("partner_birth_day", v)}
                      calendarType={partnerCalendarType}
                      onCalendarTypeChange={setPartnerCalendarType}
                    />
                  </Suspense>
                </div>

                {/* Partner birth hour */}
                <div>
                  <label className="label">{t("new.partnerBirthHour")}</label>
                  <Suspense fallback={<div className="h-10 bg-white/5 rounded animate-pulse" />}>
                    <ShichenSelector
                      value={watch("partner_birth_hour") ?? 0}
                      onChange={(h) => setValue("partner_birth_hour", h)}
                    />
                  </Suspense>
                </div>

                {/* Partner birth city */}
                <div>
                  <label className="label">{t("new.partnerBirthCity")}</label>
                  <Suspense fallback={<div className="h-10 bg-white/5 rounded animate-pulse" />}>
                    <LocationSelector
                      value={watch("partner_birth_city") || ""}
                      onChange={(v) => setValue("partner_birth_city", v)}
                      placeholder={t("new.partnerCityPlaceholder")}
                    />
                  </Suspense>
                </div>

                {/* Partner Face Photo */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Camera size={18} className="text-gold" />
                    <h3 className="font-serif text-lg text-gold">{t("new.partnerFaceTitle")}</h3>
                    <span className="text-white/30 text-sm font-sans">{t("new.faceRecommended")}</span>
                  </div>
                  <p className="text-white/40 text-xs mb-4">{t("new.partnerFaceDesc")}</p>

                  {partnerIsFaceScanning && partnerFacePreview ? (
                    <FaceScanAnimation
                      imageUrl={partnerFacePreview}
                      isScanning={true}
                      onComplete={handlePartnerFaceScanComplete}
                    />
                  ) : (
                    <div onClick={() => partnerFaceRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-gold/40 rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all group">
                      {partnerFacePreview ? (
                        <div className="relative inline-block">
                          <img src={partnerFacePreview} alt="partner face preview"
                            className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-full mx-auto border-2 border-gold/40" />
                          {partnerFaceText && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle size={14} className="text-white" />
                            </div>
                          )}
                          {partnerFaceV2TError && (
                            <div className="mt-2 space-y-1">
                              <p className="text-amber-400 text-xs">{t("new.faceScanFail")}</p>
                              <p className="text-white/30 text-[10px]">{t("new.clickToRetry")}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <Camera size={36} className="mx-auto text-white/20 group-hover:text-gold/50 mb-2 transition-colors" />
                          <p className="text-white/40 text-sm">{t("new.partnerFaceClickUpload")}</p>
                          <p className="text-white/20 text-xs mt-1">{t("new.faceAutoScan")}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <input ref={partnerFaceRef} type="file" accept="image/*" className="sr-only" onChange={handlePartnerFacePick} />

                  {partnerFaceFeatures && !partnerIsFaceScanning && (
                    <div className="mt-4 flex items-center gap-2 text-green-400/80 text-xs">
                      <CheckCircle size={14} />
                      <span>{t("new.faceScanComplete")}</span>
                    </div>
                  )}
                </div>

                {/* Partner Palm Photo */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Hand size={18} className="text-gold" />
                    <h3 className="font-serif text-lg text-gold">{t("new.partnerPalmTitle")}</h3>
                    <span className="text-white/30 text-sm font-sans">{t("new.faceRecommended")}</span>
                  </div>
                  <p className="text-white/40 text-xs mb-4">{t("new.partnerPalmDesc")}</p>

                  {partnerIsPalmScanning && partnerPalmPreview ? (
                    <FaceScanAnimation
                      imageUrl={partnerPalmPreview}
                      isScanning={true}
                      onComplete={handlePartnerPalmScanComplete}
                    />
                  ) : (
                    <div onClick={() => partnerPalmRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-gold/40 rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all group">
                      {partnerPalmPreview ? (
                        <div className="relative inline-block">
                          <img src={partnerPalmPreview} alt="partner palm preview"
                            className="w-32 h-32 md:w-36 md:h-36 object-contain rounded-xl mx-auto border-2 border-gold/40" />
                          {partnerPalmText && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle size={14} className="text-white" />
                            </div>
                          )}
                          {partnerPalmV2TError && (
                            <div className="mt-2 space-y-1">
                              <p className="text-amber-400 text-xs">{t("new.palmScanFail")}</p>
                              <p className="text-white/30 text-[10px]">{t("new.clickToRetry")}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <Hand size={36} className="mx-auto text-white/20 group-hover:text-gold/50 mb-2 transition-colors" />
                          <p className="text-white/40 text-sm">{t("new.partnerPalmClickUpload")}</p>
                          <p className="text-white/20 text-xs mt-1">{t("new.palmAutoScan")}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <input ref={partnerPalmRef} type="file" accept="image/*" className="sr-only" onChange={handlePartnerPalmPick} />

                  {partnerPalmFeatures && !partnerIsPalmScanning && (
                    <div className="mt-4 flex items-center gap-2 text-green-400/80 text-xs">
                      <CheckCircle size={14} />
                      <span>{t("new.palmScanComplete")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Tarot & Question ─────────────────────── */}
          <div className={STEPS[step] !== t("new.step2") ? 'hidden' : ''}>
            <FortuneGuide step={1} intent={currentIntent} />
            <div
            >
              <div className="card-glass p-6 md:p-8 space-y-6">
                <h2 className="font-serif text-xl text-gold">{t("new.taroTitle")}</h2>

              {/* Hot question templates */}
              <Suspense fallback={<div className="h-8 bg-white/5 rounded animate-pulse" />}>
                <HotQuestions
                  value={watchedQuestion}
                  onChange={(q) => setValue("user_question", q)}
                  intent={currentIntent}
                />
              </Suspense>

              <div>
                <label className="label">{t("new.questionLabel")}</label>
                <textarea {...register("user_question")} rows={3}
                  placeholder={t("new.questionPlaceholder")}
                  className="input-field resize-none" />
                {errors.user_question && <p className="text-red-400 text-xs mt-1">{errors.user_question.message}</p>}
              </div>

              {/* Divider */}
              <div className="star-divider">
                <span className="text-gold/40 text-xs tracking-widest">{t("new.tarotSpread")}</span>
              </div>

              <Suspense fallback={<div className="h-40 bg-white/5 rounded-xl animate-pulse" />}>
                <TarotPicker onSelect={setTarotCards} />
              </Suspense>
            </div> {/* end card-glass */}
              </div>
            </div>

          {/* ── Step 2: Face & Palm ──────────────────────────── */}
          <div className={STEPS[step] !== t("new.step3") ? 'hidden' : ''}>
            <FortuneGuide step={2} intent={currentIntent} />
            <div
            >
              <div className="card-glass p-6 md:p-8 space-y-8">
                {/* ── Face Photo ───────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Camera size={18} className="text-gold" />
                  <h2 className="font-serif text-xl text-gold">{t("new.faceScanTitle")}</h2>
                  <span className="text-white/30 text-sm font-sans">{t("new.faceRecommended")}</span>
                </div>
                <p className="text-white/40 text-xs mb-4">{t("new.faceDesc")}</p>

                {/* Pre-scan guide overlay */}
                {showFaceGuide && facePreview && !isFaceScanning && !faceScanDone && (
                  <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 mb-4 text-sm text-gold/80 flex items-center gap-2 animate-pulse-slow">
                    <AlertCircle size={14} />
                    {t("new.faceGuide")}
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
                          <div className="mt-2 space-y-1">
                            <p className="text-amber-400 text-xs">{t("new.faceScanFail")}</p>
                            <p className="text-white/30 text-[10px]">{t("new.clickToRetry")}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Camera size={36} className="mx-auto text-white/20 group-hover:text-gold/50 mb-2 transition-colors" />
                        <p className="text-white/40 text-sm">{t("new.faceClickUpload")}</p>
                        <p className="text-white/20 text-xs mt-1">{t("new.faceAutoScan")}</p>
                      </div>
                    )}
                  </div>
                )}
                <input ref={faceRef} type="file" accept="image/*" className="sr-only" onChange={handleFacePick} />

                {/* Face scan success indicator — results only shown in final report */}
                {faceFeatures && !isFaceScanning && (
                  <div className="mt-4 flex items-center gap-2 text-green-400/80 text-xs">
                    <CheckCircle size={14} />
                    <span>{t("new.faceScanComplete")}</span>
                  </div>
                )}
              </div>

              {/* ── Palm Photo ───────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Hand size={18} className="text-gold" />
                  <h2 className="font-serif text-xl text-gold">{t("new.palmScanTitle")}</h2>
                  <span className="text-white/30 text-sm font-sans">{t("new.faceRecommended")}</span>
                </div>
                <p className="text-white/40 text-xs mb-4">{t("new.palmDesc")}</p>

                {/* Pre-scan guide overlay */}
                {showPalmGuide && palmPreview && !isPalmScanning && !palmScanDone && (
                  <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 mb-4 text-sm text-gold/80 flex items-center gap-2 animate-pulse-slow">
                    <AlertCircle size={14} />
                    {t("new.palmGuide")}
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
                          <div className="mt-2 space-y-1">
                            <p className="text-amber-400 text-xs">{t("new.palmScanFail")}</p>
                            <p className="text-white/30 text-[10px]">{t("new.clickToRetry")}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Hand size={36} className="mx-auto text-white/20 group-hover:text-gold/50 mb-2 transition-colors" />
                        <p className="text-white/40 text-sm">{t("new.palmClickUpload")}</p>
                        <p className="text-white/20 text-xs mt-1">{t("new.palmAutoScan")}</p>
                      </div>
                    )}
                  </div>
                )}
                <input ref={palmRef} type="file" accept="image/*" className="sr-only" onChange={handlePalmPick} />

                {/* Palm scan success indicator — results only shown in final report */}
                {palmFeatures && !isPalmScanning && (
                  <div className="mt-4 flex items-center gap-2 text-green-400/80 text-xs">
                    <CheckCircle size={14} />
                    <span>{t("new.palmScanComplete")}</span>
                  </div>
                )}
              </div>

              {/* Skip face/palm option */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (step < STEPS.length - 1) setStep(step + 1)
                  }}
                  className="text-white/30 text-xs hover:text-white/50 transition-colors underline underline-offset-2"
                >
                  {t("new.skipFacePalm")}
                </button>
              </div>
            </div> {/* end card-glass */}
              </div>
            </div>

          {/* ── Step 3: Confirm ─────────────────────────────── */}
          <div className={STEPS[step] !== t("new.step4") ? 'hidden' : ''}>
            <FortuneGuide step={3} intent={currentIntent} />
            <div
            >
              <div className="card-glass p-6 md:p-8 text-center space-y-6">
              <div className="text-6xl animate-float">🔮</div>
              <h2 className="font-serif text-2xl text-gold">{t("new.confirmTitle")}</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                {t("new.confirmDesc1")}<br />
                {t("new.confirmDesc2")} <span className="text-gold font-semibold">{t("new.confirmDesc3")}</span> {t("new.confirmDesc4")}
              </p>
              <div className="card-glass p-4 text-left space-y-2">
                {[
                  ["☯", t("new.baziFull")],
                  ["✦", t("new.astrologyFull")],
                  ["🃏", t("new.tarotFull")],
                  ["👁", `${t("new.faceSystem")} — ${faceText ? t("new.faceV2TReady") : facePreview ? t("new.faceV2TFailed") : t("new.faceNoPhotoProvided")}`],
                  ["🤚", `${t("new.palmSystem")} — ${palmText ? t("new.palmV2TReady") : palmPreview ? t("new.palmV2TFailed") : t("new.palmNoData")}`],
                  ["🌟", t("new.masterFull")],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="flex-shrink-0">{icon}</span> {text}
                  </div>
                ))}
              </div>

              {/* ── Unlock Report Button ───────────────────────── */}
              <div className="border-t border-white/10 pt-5">
                <button type="submit" disabled={loading}
                  className="w-full btn-gold py-3 text-sm">
                  {loading
                    ? <span className="flex items-center justify-center gap-1"><Loader2 size={14} className="animate-spin" /> {t("new.starting")}</span>
                    : t("new.unlockFull")}
                </button>
              </div>
            </div> {/* end card-glass */}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)}
 className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 text-white/60 hover:border-white/40 transition-all">
                <ChevronLeft size={16} /> {t("new.prevStep")}
              </button>
            )}

            {step < STEPS.length - 1 && (
              <button type="button" onClick={() => setStep(step + 1)}
                className="btn-gold flex items-center gap-2">
                {t("new.nextStep")} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
