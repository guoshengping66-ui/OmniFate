"use client"

/**
 * Google Analytics (GA4) event helpers.
 *
 * The gtag.js loader itself lives in app/[locale]/layout.tsx (<head>), so the
 * measurement ID below must stay in sync with the one there.
 */

export const GA_MEASUREMENT_ID = "G-SFYNMRF8CB"

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

/** Fire a GA4 event. No-ops when gtag is unavailable (SSR, blockers, GFW). */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  try {
    window.gtag("event", name, params)
  } catch {
    // Never let analytics break the user flow
  }
}

// ── Purchase tracking ────────────────────────────────────────────
// Stripe Checkout leaves the site and returns to /payment?stripe=success.
// sessionStorage survives the redirect within the same tab, so the checkout
// page stashes order details here and the result page fires the event once.

const PENDING_PURCHASE_KEY = "ga_pending_purchase"

export interface PendingPurchase {
  transaction_id?: string
  value?: number
  currency?: string
  item_name?: string
}

/** Call right before redirecting to Stripe Checkout. */
export function stashPendingPurchase(purchase: PendingPurchase): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(purchase))
  } catch {}
}

/** Read and clear the stashed purchase (null when absent/expired). */
export function popPendingPurchase(): PendingPurchase | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(PENDING_PURCHASE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(PENDING_PURCHASE_KEY)
    return JSON.parse(raw) as PendingPurchase
  } catch {
    return null
  }
}

/** Fire the GA4 `purchase` conversion event. */
export function trackPurchase(purchase: PendingPurchase): void {
  trackEvent("purchase", {
    ...(purchase.transaction_id ? { transaction_id: purchase.transaction_id } : {}),
    ...(purchase.value != null ? { value: purchase.value } : {}),
    ...(purchase.currency ? { currency: purchase.currency } : {}),
    ...(purchase.item_name ? { items: [{ item_name: purchase.item_name }] } : {}),
  })
}

/** Fire the GA4 `sign_up` conversion event. */
export function trackSignUp(method: "email" | "google" = "email"): void {
  trackEvent("sign_up", { method })
}
