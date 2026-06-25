/**
 * PayPal SDK preloader — shared module-level cache across all components.
 *
 * Without preloading, the PayPal SDK (200KB+) starts downloading only when
 * the payment modal opens, causing a 3-5s visible delay before the user
 * can interact with the payment UI.
 *
 * Usage:
 *   import { preloadPayPalSDK, getPayPalConfigCached } from "@/lib/paypalPreload"
 *
 *   // Start preloading as early as possible (page load / method selection)
 *   useEffect(() => { preloadPayPalSDK() }, [])
 *
 *   // Get config (always cached after first call)
 *   const config = await getPayPalConfigCached()
 */

let _configCache: { client_id: string; mode: string } | null = null
let _configPromise: Promise<{ client_id: string; mode: string }> | null = null
let _scriptLoading = false
let _scriptLoaded = false

export function getPayPalConfigCached(): Promise<{ client_id: string; mode: string }> {
  if (_configCache) return Promise.resolve(_configCache)
  if (_configPromise) return _configPromise

  _configPromise = import("./api")
    .then((m) => m.getPayPalConfig())
    .then((cfg) => {
      _configCache = cfg
      return cfg
    })
    .catch((e) => {
      _configPromise = null
      throw e
    })
  return _configPromise
}

/**
 * Start preloading the PayPal SDK (config fetch + script injection).
 * Safe to call multiple times — deduplicates automatically.
 */
export function preloadPayPalSDK(): void {
  if (typeof document === "undefined") return // SSR guard

  if (_scriptLoading || _scriptLoaded) return
  _scriptLoading = true

  getPayPalConfigCached()
    .then((cfg) => {
      injectPayPalScript(cfg.client_id)
    })
    .catch(() => {
      _scriptLoading = false
    })
}

function injectPayPalScript(clientId: string): void {
  if (document.querySelector('script[src*="paypal.com/sdk/js"]')) {
    _scriptLoaded = true
    _scriptLoading = false
    return
  }
  const script = document.createElement("script")
  script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons,card-fields`
  script.async = true
  script.onload = () => {
    _scriptLoaded = true
    _scriptLoading = false
  }
  script.onerror = () => {
    _scriptLoading = false
  }
  document.head.appendChild(script)
}
