"use client"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"

export function FloatingCTA() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [300, 600], [0, 1])
  const y = useTransform(scrollY, [300, 600], [20, 0])
  const { t } = useLanguage()

  return (
    <motion.div
      style={{ opacity, y }}
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
    >
      <div className="bg-ink/90 backdrop-blur-xl border-t border-gold/20 px-4 py-3">
        <Link
          href="/reading/new"
          className="btn-gold flex items-center justify-center gap-2 w-full py-3 text-sm"
        >
          <Sparkles size={16} />
          {t("floatingCta.text")}
        </Link>
      </div>
    </motion.div>
  )
}
