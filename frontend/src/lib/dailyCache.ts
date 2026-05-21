/**
 * Date-keyed localStorage cache for daily fortune & almanac data.
 * Auto-expires at midnight (new day = new data).
 */

const PREFIX = "df_"

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed._date !== todayKey()) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return parsed.data as T
  } catch {
    return null
  }
}

export function setCached<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ _date: todayKey(), data }))
  } catch {
    // storage full or unavailable — silently ignore
  }
}
