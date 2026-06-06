"use client"
import Link from "next/link"
import { useMemo } from "react"

const MESSAGES: Record<string, { title: string; desc: string; home: string }> = {
  zh: { title: "页面不存在", desc: "你访问的页面不存在或已被移除。", home: "返回首页" },
  en: { title: "Page Not Found", desc: "The page you visited does not exist or has been removed.", home: "Back to Home" },
}

export default function NotFound() {
  const lang = useMemo(() => {
    try {
      const stored = localStorage.getItem("destiny_mirror_lang")
      if (stored === "en" || stored === "zh") return stored
    } catch {}
    return navigator.language.startsWith("zh") ? "zh" : "en"
  }, [])

  const m = MESSAGES[lang] || MESSAGES.en

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🌌</p>
        <h1 className="text-2xl font-serif font-bold text-gold mb-2">{m.title}</h1>
        <p className="text-white/40 text-sm mb-6">{m.desc}</p>
        <Link href={`/${lang}`} className="btn-gold inline-block px-8 py-3">
          {m.home}
        </Link>
      </div>
    </div>
  )
}
