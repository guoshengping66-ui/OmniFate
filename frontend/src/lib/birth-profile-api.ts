import { api } from "./api"

export interface BirthProfile {
  id: string
  nickname: string
  gender: "male" | "female" | "other"
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number
  birth_minute: number
  birth_city: string
  latitude?: number | null
  longitude?: number | null
  created_at: string
}

export interface BirthProfileFormData {
  nickname?: string
  gender: string
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number
  birth_minute?: number
  birth_city?: string
  latitude?: number | null
  longitude?: number | null
}

export async function listBirthProfiles(): Promise<BirthProfile[]> {
  const res = await api.get<BirthProfile[]>("/api/users/birth-profiles")
  return res.data
}

export async function getActiveBirthProfile(): Promise<BirthProfile> {
  const res = await api.get<BirthProfile>("/api/users/birth-profiles/active")
  return res.data
}

export async function createBirthProfile(data: BirthProfileFormData): Promise<BirthProfile> {
  const res = await api.post<BirthProfile>("/api/users/birth-profiles", data)
  return res.data
}

export async function updateBirthProfile(id: string, data: BirthProfileFormData): Promise<BirthProfile> {
  const res = await api.put<BirthProfile>(`/api/users/birth-profiles/${id}`, data)
  return res.data
}

export async function deleteBirthProfile(id: string): Promise<void> {
  await api.delete(`/api/users/birth-profiles/${id}`)
}
