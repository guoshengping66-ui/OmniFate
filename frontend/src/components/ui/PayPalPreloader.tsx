"use client"
import { useEffect } from "react"
import { getPayPalConfig, getPaymentMethods } from "@/lib/api"
import { useRegion } from "@/hooks/useRegion"

/**
 * Eagerly preloads the PayPal SDK and payment methods in the background.
 * By the time the user opens the payment modal, everything is ready instantly.
 */
export function PayPalPreloader() {
  const { region } = useRegion()

  useEffect(() => {
    // Preload payment methods immediately (all users)
    getPaymentMethods().catch(() => {})

    // Only preload PayPal SDK for overseas users
    if (region !== "overseas") return

    // Preload config + SDK after 500ms (minimal delay to not block page load)
    const timer = setTimeout(() => {
      getPayPalConfig().then(cfg => {
        if (!cfg?.client_id) return
        const existing = document.querySelector(`script[src*="paypal.com/sdk/js"]`)
        if (existing) return
        const script = document.createElement("script")
        script.src = `https://www.paypal.com/sdk/js?client-id=${cfg.client_id}&currency=USD&intent=capture&components=buttons,card-fields`
        script.async = true
        document.head.appendChild(script)
      }).catch(() => {})
    }, 500)

    return () => clearTimeout(timer)
  }, [region])

  return null
}
