"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { localeHref } = useLanguage()
  useEffect(() => {
    router.replace(localeHref("/forgot-password"))
  }, [router, localeHref])
  return null
}
