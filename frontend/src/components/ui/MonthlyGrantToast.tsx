"use client"
import { useEffect, useRef } from "react"
import toast from "react-hot-toast"
import { Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"

const STORAGE_KEY = "stardust_grant_shown"

export function MonthlyGrantToast() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const shownRef = useRef(false)

  useEffect(() => {
    if (!user || shownRef.current) return

    const today = new Date().toISOString().slice(0, 10)
    const lastShown = localStorage.getItem(STORAGE_KEY)
    if (lastShown === today) return

    // Stagger to avoid 429 burst with homepage components
    const timer = setTimeout(() => {
    // Check balance and show toast if user has stardust
    api.get("/api/credits/balance")
      .then(res => {
        const balance = res.data.balance
        if (balance > 0) {
          shownRef.current = true
          localStorage.setItem(STORAGE_KEY, today)
          toast.custom(
            (toastState) => (
              <div
                className={`${
                  toastState.visible ? "animate-enter" : "animate-leave"
                } max-w-sm w-full bg-gradient-to-r from-[#1a1507] to-[#0d0b04]
                border border-gold/20 rounded-xl p-4 shadow-lg shadow-gold/10`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <Sparkles size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-gold font-medium text-sm">{t("monthlyGrant.title")}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {t("monthlyGrant.balance").replace("{balance}", String(balance))}
                    </p>
                  </div>
                </div>
              </div>
            ),
            { duration: 4000 }
          )
        }
      })
      .catch(() => {})
    }, 500) // 500ms stagger — after homepage API calls
    return () => clearTimeout(timer)
  }, [user])

  return null
}
