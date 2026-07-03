"use client"
import { formatTag } from "@/lib/tagFormat"
import { useParams } from "next/navigation"

interface Props {
  tag: string
  size?: "sm" | "md"
}

export function TagBadge({ tag, size = "sm" }: Props) {
  const params = useParams()
  const lang = (params?.locale as string) || "en"
  const s = formatTag(tag, lang)
  const sizeClasses = size === "sm"
    ? "text-xs px-1.5 py-0.5"
    : "text-xs px-2.5 py-1"

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border transition-all duration-200 ${sizeClasses} ${s.bg} ${s.color} ${s.border}`}>
      <span className="leading-none">{s.icon}</span>
      <span>{s.label}</span>
    </span>
  )
}
