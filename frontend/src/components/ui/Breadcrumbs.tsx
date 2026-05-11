"use client"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-6 overflow-x-auto scrollbar-none">
      <Link href="/" className="flex items-center gap-1 hover:text-gold transition-colors whitespace-nowrap">
        <Home size={12} />
        <span>首页</span>
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
  )
}
