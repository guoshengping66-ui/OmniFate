"use client"
import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * Tracks page views in Google Analytics on route changes.
 * Requires NEXT_PUBLIC_GA_ID env var to be set.
 */
export function RouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GA_ID) return
    if (typeof window === "undefined" || typeof window.gtag !== "function") return

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")

    window.gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  return null
}

// Extend Window for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}
