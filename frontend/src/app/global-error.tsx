"use client"

import { useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLanguage()

  useEffect(() => {
    console.error("[GlobalError-ROOT]", error)
  }, [error])

  return (
    <html lang="zh-CN">
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
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t("globalError.title")}</h2>
            <p style={{ opacity: 0.5, fontSize: "0.875rem", marginBottom: "1rem" }}>
              {t("globalError.desc")}
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
                {error.stack && `\n\n${error.stack}`}
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
              {t("globalError.retry")}
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
