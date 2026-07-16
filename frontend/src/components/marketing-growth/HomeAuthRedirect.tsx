"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

export function HomeAuthRedirect() {
  const router = useRouter()
  const { user } = useAuth()
  const { localeHref } = useLanguage()

  useEffect(() => {
    if (user) router.replace(localeHref("/dashboard"))
  }, [localeHref, router, user])

  return null
}
