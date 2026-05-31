"use client"
import { useEffect } from "react"

/**
 * Aggressively unregisters ALL service workers and purges ALL caches.
 *
 * The old SW (destiny-mirror-v1) used a cache-first strategy that always
 * returned `cached || fetched` — since a Response object is truthy, it
 * always served stale HTML after deployments, causing blank pages because
 * the old JS chunk hashes no longer matched the new server.
 *
 * We remove it entirely and never re-register a SW.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // 1. Unregister every service worker (old, new, or rogue)
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          for (const reg of regs) {
            reg.unregister()
          }
        })
        .catch(() => {})

      // 2. Nuke all Cache API storage (SW caches, prefetch caches, etc.)
      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => {
            return Promise.all(keys.map((k) => caches.delete(k)))
          })
          .catch(() => {})
      }

      // 3. If there's still an active controller, force it to stop
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage("SKIP_WAITING")
      }
    }
  }, [])

  return null
}
