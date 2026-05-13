"use client"
import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Unregister ALL service workers and clear SW caches.
      // The old SW had a cache-first bug that served stale HTML after
      // deployments, causing blank pages. Removing it entirely for now.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister()
        }
      })
      // Also clear any leftover SW caches
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key)
          }
        })
      }
    }
  }, [])

  return null
}
