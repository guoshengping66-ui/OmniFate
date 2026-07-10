import { create } from "zustand"
import type { BirthProfile, BirthProfileFormData } from "@/lib/birth-profile-api"
import {
  listBirthProfiles,
  createBirthProfile as apiCreate,
  updateBirthProfile as apiUpdate,
  deleteBirthProfile as apiDelete,
} from "@/lib/birth-profile-api"

const PROFILES_CACHE_KEY = "alpha_mirror_profiles"

let fetchingProfiles = false

function isSelfProfile(profile?: BirthProfile | null): boolean {
  if (!profile) return false
  return profile.nickname === "Self" || profile.nickname === "Myself" || /[\u4e00-\u9fff]/.test(profile.nickname)
}

function loadCachedProfiles(): BirthProfile[] | null {
  try {
    const raw = sessionStorage.getItem(PROFILES_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveCachedProfiles(profiles: BirthProfile[]) {
  try {
    sessionStorage.setItem(PROFILES_CACHE_KEY, JSON.stringify(profiles))
  } catch {}
}

function findMainProfile(profiles: BirthProfile[]): BirthProfile | null {
  return profiles.find(isSelfProfile) || profiles[0] || null
}

interface UserStore {
  userProfile: BirthProfile | null
  activeTestTarget: BirthProfile | null
  birthProfiles: BirthProfile[]
  loading: boolean
  fetchBirthProfiles: () => Promise<void>
  setActiveTestTarget: (profile: BirthProfile) => void
  resetToSelf: () => void
  createBirthProfile: (data: BirthProfileFormData) => Promise<BirthProfile>
  updateBirthProfile: (id: string, data: BirthProfileFormData) => Promise<void>
  deleteBirthProfile: (id: string) => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  userProfile: null,
  activeTestTarget: null,
  birthProfiles: [],
  loading: false,

  fetchBirthProfiles: async () => {
    if (fetchingProfiles) return
    fetchingProfiles = true

    const cached = loadCachedProfiles()
    if (cached && cached.length > 0) {
      const mainProfile = findMainProfile(cached)
      set({
        birthProfiles: cached,
        userProfile: mainProfile,
        activeTestTarget: get().activeTestTarget || mainProfile,
      })
    }

    set({ loading: true })
    try {
      const profiles = await listBirthProfiles()
      const mainProfile = findMainProfile(profiles)
      set({
        birthProfiles: profiles,
        userProfile: mainProfile,
        activeTestTarget: get().activeTestTarget || mainProfile,
      })
      saveCachedProfiles(profiles)
    } catch {
      // Keep cached profiles when the user is offline or the session is expired.
    } finally {
      fetchingProfiles = false
      set({ loading: false })
    }
  },

  setActiveTestTarget: (profile) => {
    set({ activeTestTarget: profile })
  },

  resetToSelf: () => {
    set({ activeTestTarget: get().userProfile })
  },

  createBirthProfile: async (data) => {
    const profile = await apiCreate(data)
    set((s) => {
      const profiles = [...s.birthProfiles, profile]
      const shouldBecomeMain = !s.userProfile || isSelfProfile(profile)
      const nextMain = shouldBecomeMain ? profile : s.userProfile
      saveCachedProfiles(profiles)
      return {
        birthProfiles: profiles,
        userProfile: nextMain,
        activeTestTarget: shouldBecomeMain ? profile : s.activeTestTarget || nextMain,
      }
    })
    return profile
  },

  updateBirthProfile: async (id, data) => {
    const updated = await apiUpdate(id, data)
    set((s) => {
      const profiles = s.birthProfiles.map((p) => (p.id === id ? updated : p))
      const isMain = s.userProfile?.id === id
      const isActive = s.activeTestTarget?.id === id
      saveCachedProfiles(profiles)
      return {
        birthProfiles: profiles,
        userProfile: isMain ? updated : s.userProfile,
        activeTestTarget: isActive ? updated : s.activeTestTarget,
      }
    })
  },

  deleteBirthProfile: async (id) => {
    await apiDelete(id)
    set((s) => {
      const profiles = s.birthProfiles.filter((p) => p.id !== id)
      const isMain = s.userProfile?.id === id
      const isActive = s.activeTestTarget?.id === id
      const mainProfile = findMainProfile(profiles)
      saveCachedProfiles(profiles)
      return {
        birthProfiles: profiles,
        userProfile: isMain ? mainProfile : s.userProfile,
        activeTestTarget: isActive ? mainProfile : s.activeTestTarget,
      }
    })
  },
}))
