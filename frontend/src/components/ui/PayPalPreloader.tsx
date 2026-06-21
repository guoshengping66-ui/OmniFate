"use client"
import { useEffect } from "react"
import { getPayPalConfig } from "@/lib/api"
import { useRegion } from "@/hooks/useRegion"

/**
 * Eagerly preloads the PayPal SDK in the background for overseas users.
 * By the time the user opens the payment modal, the SDK is already loaded
 * or nearly loaded, making payment buttons appear instantly.
 */
export function PayPalPreloader() {
  const { region } = useRegion()

  useEffect(() => {
    // Only preload for overseas users
    if (region !== "overseas") return

    // Preload config + SDK after 2s delay (don't compete with page load)
    const timer = setTimeout(() => {
      getPayPalConfig().then(cfg => {
        if (!cfg?.client_id) return
        // Check if SDK is already loaded
        const existing = document.querySelector(`script[src*="paypal.com/sdk/js"]`)
        if (existing) return
        // Inject SDK script
        const script = document.createElement("script")
        script.src = `https://www.paypal.com/sdk/js?client-id=${cfg.client_id}&currency=USD&intent=capture&components=buttons,card-fields`
        script.async = true
        document.head.appendChild(script)
      }).catch(() => {})
    }, 2000)

    return () => clearTimeout(timer)
  }, [region])

  return null
}
