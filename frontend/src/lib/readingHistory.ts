/**
 * Reading history management for anonymous users.
 * Stores reading session IDs in localStorage so users can view past readings.
 */

const HISTORY_KEY = "profile_reading_history"
const MAX_HISTORY = 20 // Maximum number of readings to store

export interface ReadingHistoryItem {
  sessionId: string
  createdAt: string
  userQuestion?: string
  status: string
}

/**
 * Get reading history from localStorage
 */
export function getReadingHistory(): ReadingHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ReadingHistoryItem[]
  } catch {
    return []
  }
}

/**
 * Add a reading to history
 */
export function addReadingToHistory(
  sessionId: string,
  userQuestion?: string,
  status: string = "processing"
): void {
  try {
    const history = getReadingHistory()

    // Avoid duplicates
    const existing = history.findIndex(h => h.sessionId === sessionId)
    if (existing >= 0) {
      // Update existing entry
      history[existing].status = status
      if (userQuestion) history[existing].userQuestion = userQuestion
    } else {
      // Add new entry at the beginning
      history.unshift({
        sessionId,
        createdAt: new Date().toISOString(),
        userQuestion,
        status,
      })
    }

    // Limit history size
    const trimmed = history.slice(0, MAX_HISTORY)

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
  } catch {
    // Silently fail - history is optional
  }
}

/**
 * Update reading status in history
 */
export function updateReadingStatus(sessionId: string, status: string): void {
  try {
    const history = getReadingHistory()
    const item = history.find(h => h.sessionId === sessionId)
    if (item) {
      item.status = status
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    }
  } catch {
    // Silently fail
  }
}

/**
 * Remove a reading from history
 */
export function removeReadingFromHistory(sessionId: string): void {
  try {
    const history = getReadingHistory()
    const filtered = history.filter(h => h.sessionId !== sessionId)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered))
  } catch {
    // Silently fail
  }
}

/**
 * Clear all reading history
 */
export function clearReadingHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    // Silently fail
  }
}
