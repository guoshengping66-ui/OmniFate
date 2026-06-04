"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function FloatingCTA() {
  const [visible, setVisible] = useState(false)
  const { t, localeHref } = useLanguage()

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="bg-ink/95 backdrop-blur-xl border-t border-gold/20 px-4 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}>
        <Link
          href={localeHref("/shop")}
          className="btn-gold flex items-center justify-center gap-2 w-full py-3 text-sm"
        >
          <ShoppingBag size={16} />
          {t("floatingCta.shopText") || "查看改运好物"}
        </Link>
      </div>
    </div>
  )
}
