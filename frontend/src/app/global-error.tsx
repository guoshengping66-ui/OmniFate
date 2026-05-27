"use client"

import { useEffect, useMemo } from "react"

// NOTE: global-error.tsx runs OUTSIDE the React Provider tree,
// so we cannot use useLanguage() or any context hooks here.
// We detect language from the browser and use inline translations.

const TRANSLATIONS: Record<string, { title: string; desc: string; retry: string }> = {
  zh: { title: "出了点问题", desc: "发生了意外错误，请尝试刷新页面。", retry: "重试" },
  en: { title: "Something went wrong", desc: "An unexpected error occurred. Please try refreshing the page.", retry: "Try Again" },
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[GlobalError-ROOT]", error)
  }, [error])

  const lang = useMemo(() => {
    try {
      const stored = localStorage.getItem("destiny_mirror_lang")
      if (stored === "en" || stored === "zh") return stored
    } catch {}
    return navigator.language.startsWith("zh") ? "zh" : "en"
  }, [])

  const t = TRANSLATIONS[lang] || TRANSLATIONS.zh

  return (
    <html lang={lang === "en" ? "en" : "zh-CN"}>
      <body style={{ background: "#0d0a1a", color: "#E8CB7A", fontFamily: "serif" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}>
          <div style={{
            maxWidth: "28rem",
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t.title}</h2>
            <p style={{ opacity: 0.5, fontSize: "0.875rem", marginBottom: "1rem" }}>
              {t.desc}
            </p>
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.5rem",
              padding: "1rem",
              marginBottom: "1.5rem",
              textAlign: "left",
              overflow: "auto",
              maxHeight: "12rem",
            }}>
              <code style={{
                color: "#f87171",
                fontSize: "0.75rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}>
                {error.message}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </code>
            </div>
            <button
              onClick={reset}
              style={{
                background: "linear-gradient(135deg, #C9A84C, #B8942E)",
                color: "#0d0a1a",
                border: "none",
                borderRadius: "9999px",
                padding: "0.5rem 1.5rem",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.875rem",
              }}
            >
              {t.retry}
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
