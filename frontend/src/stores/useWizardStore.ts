import { create } from "zustand"
import type { BirthProfile } from "@/lib/birth-profile-api"
import type { Gender } from "@/lib/api"

export type Intent = "GENERAL_DAILY" | "SPECIFIC_EVENT" | "FULL_MULTIMODAL" | "RELATIONSHIP"

export interface WizardFormData {
  gender: Gender
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number
  birth_minute: number
  birth_city: string
  latitude?: number
  longitude?: number
  user_question: string
  // Partner info for RELATIONSHIP intent
  partner_name: string
  partner_gender: Gender
  partner_birth_year: number
  partner_birth_month: number
  partner_birth_day: number
  partner_birth_hour: number
  partner_birth_minute: number
  partner_birth_city: string
  partner_latitude?: number
  partner_longitude?: number
  relationship_type: string  // lover/friend/colleague/family
}

interface WizardStore {
  currentIntent: Intent | null
  formData: WizardFormData
  startStep: number

  setIntent: (intent: Intent) => void
  prefillFromProfile: (profile: BirthProfile) => void
  updateField: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void
  reset: () => void
}

const DEFAULT_FORM: WizardFormData = {
  gender: "female",
  birth_year: 0,
  birth_month: 0,
  birth_day: 0,
  birth_hour: 0,
  birth_minute: 0,
  birth_city: "",
  user_question: "",
  partner_name: "",
  partner_gender: "female",
  partner_birth_year: 0,
  partner_birth_month: 0,
  partner_birth_day: 0,
  partner_birth_hour: 0,
  partner_birth_minute: 0,
  partner_birth_city: "",
  relationship_type: "",
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  currentIntent: null,
  formData: { ...DEFAULT_FORM },
  startStep: 0,

  setIntent: (intent) => set({ currentIntent: intent }),

  prefillFromProfile: (profile) => {
    const intent = get().currentIntent
    set({
      formData: {
        ...get().formData,
        gender: profile.gender,
        birth_year: profile.birth_year,
        birth_month: profile.birth_month,
        birth_day: profile.birth_day,
        birth_hour: profile.birth_hour,
        birth_minute: profile.birth_minute,
        birth_city: profile.birth_city,
        latitude: profile.latitude ?? undefined,
        longitude: profile.longitude ?? undefined,
      },
      // FULL_MULTIMODAL: skip birth info, go to tarot (step 1)
      // GENERAL_DAILY: skip birth info, go to tarot (step 1)
      // SPECIFIC_EVENT: skip everything, go to confirm (step 3)
      // RELATIONSHIP: start at birth info (step 0) — need user's own info
      startStep:
        intent === "SPECIFIC_EVENT"
          ? 3
          : intent === "GENERAL_DAILY"
            ? 1
            : 0, // FULL_MULTIMODAL and RELATIONSHIP start at birth info
    })
  },

  updateField: (key, value) =>
    set((s) => ({
      formData: { ...s.formData, [key]: value },
    })),

  reset: () => {
    // Also clear any saved wizard progress from localStorage
    try { localStorage.removeItem("destiny_reading_progress") } catch {}
    set({
      currentIntent: null,
      formData: { ...DEFAULT_FORM },
      startStep: 0,
    })
  },
}))
