import { create } from "zustand"
import type { BirthProfile, BirthProfileFormData } from "@/lib/birth-profile-api"
import {
  listBirthProfiles,
  createBirthProfile as apiCreate,
  updateBirthProfile as apiUpdate,
  deleteBirthProfile as apiDelete,
} from "@/lib/birth-profile-api"

const PROFILES_CACHE_KEY = "alpha_mirror_profiles"

// Guard against redundant concurrent fetchBirthProfiles() calls.
// Multiple components (page.tsx, UserDashboard) may call this on mount.
let _fetching = false

function loadCachedProfiles(): BirthProfile[] | null {
  try {
    const raw = sessionStorage.getItem(PROFILES_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveCachedProfiles(profiles: BirthProfile[]) {
  try { sessionStorage.setItem(PROFILES_CACHE_KEY, JSON.stringify(profiles)) } catch {}
}

function clearCachedProfiles() {
  try { sessionStorage.removeItem(PROFILES_CACHE_KEY) } catch {}
}

interface UserStore {
  // 永久底座：用户自己的出生档案
  userProfile: BirthProfile | null
  // 活跃测试目标：可以是自己或朋友
  activeTestTarget: BirthProfile | null
  // 所有出生档案列表
  birthProfiles: BirthProfile[]
  // Loading state
  loading: boolean

  // Actions
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
    // Prevent redundant concurrent API calls from multiple components
    if (_fetching) return
    _fetching = true

    // Instant restore from cache
    const cached = loadCachedProfiles()
    if (cached && cached.length > 0) {
      const mainProfile = cached.find(p => (p.nickname === "本命" || p.nickname === "Myself" || p.nickname === "Self")) || cached[0] || null
      set({
        birthProfiles: cached,
        userProfile: mainProfile,
        activeTestTarget: get().activeTestTarget || mainProfile,
      })
    }

    set({ loading: true })
    try {
      const profiles = await listBirthProfiles()
      const mainProfile = profiles.find(p => (p.nickname === "本命" || p.nickname === "Myself" || p.nickname === "Self")) || profiles[0] || null
      set({
        birthProfiles: profiles,
        userProfile: mainProfile,
        activeTestTarget: get().activeTestTarget || mainProfile,
      })
      saveCachedProfiles(profiles)
    } catch {
      // Not logged in or error — keep cached data if available
    } finally {
      _fetching = false
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
    set(s => ({
      birthProfiles: [...s.birthProfiles, profile],
    }))
    return profile
  },

  updateBirthProfile: async (id, data) => {
    const updated = await apiUpdate(id, data)
    set(s => {
      const profiles = s.birthProfiles.map(p => p.id === id ? updated : p)
      const isMain = s.userProfile?.id === id
      const isActive = s.activeTestTarget?.id === id
      return {
        birthProfiles: profiles,
        userProfile: isMain ? updated : s.userProfile,
        activeTestTarget: isActive ? updated : s.activeTestTarget,
      }
    })
  },

  deleteBirthProfile: async (id) => {
    await apiDelete(id)
    set(s => {
      const profiles = s.birthProfiles.filter(p => p.id !== id)
      const isMain = s.userProfile?.id === id
      const isActive = s.activeTestTarget?.id === id
      const mainProfile = profiles.find(p => (p.nickname === "本命" || p.nickname === "Myself" || p.nickname === "Self")) || profiles[0] || null
      return {
        birthProfiles: profiles,
        userProfile: isMain ? mainProfile : s.userProfile,
        activeTestTarget: isActive ? mainProfile : s.activeTestTarget,
      }
    })
  },
}))
