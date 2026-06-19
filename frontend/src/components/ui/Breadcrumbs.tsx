"use client"
import { useMemo } from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

function safeJsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  /** Optional current path for SSR-compatible JSON-LD (e.g. "/seo/bazi") */
  currentPath?: string
}

export function Breadcrumbs({ items, currentPath }: BreadcrumbsProps) {
  const { t, localeHref } = useLanguage()

  // BreadcrumbList JSON-LD for rich snippets
  const jsonLd = useMemo(() => {
    const baseUrl = "https://www.khanfate.com"
    const pathname = currentPath || (typeof window !== "undefined" ? window.location.pathname : "/")
    const pathParts = pathname.split("/").filter(Boolean)
    const locale = pathParts[0] || "en"

    const listItems = [
      {
        "@type": "ListItem",
        position: 1,
        name: t("breadcrumb.home"),
        item: `${baseUrl}/${locale}`,
      },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        item: item.href ? `${baseUrl}${item.href}` : undefined,
      })),
    ]

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: listItems,
    }
  }, [items, t, currentPath])

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      )}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-6 overflow-x-auto scrollbar-none">
        <Link href={localeHref("/")} className="flex items-center gap-1 hover:text-gold transition-colors whitespace-nowrap">
          <Home size={12} />
          <span>{t("breadcrumb.home")}</span>
        </Link>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            <ChevronRight size={10} className="text-white/20" />
            {item.href ? (
              <Link href={item.href} className="hover:text-gold transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-white/60">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
