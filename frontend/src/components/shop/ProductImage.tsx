"use client"
import { useState } from "react"
import Image from "next/image"

const CATEGORY_ICONS: Record<string, { emoji: string; gradient: string }> = {
  crystal: { emoji: "💎", gradient: "from-purple-500/20 to-purple-600/5" },
  jewelry: { emoji: "💍", gradient: "from-amber-500/20 to-amber-600/5" },
  incense: { emoji: "🕯️", gradient: "from-orange-500/20 to-orange-600/5" },
  talisman: { emoji: "📜", gradient: "from-red-500/20 to-red-600/5" },
  book: { emoji: "📖", gradient: "from-blue-500/20 to-blue-600/5" },
  service: { emoji: "✨", gradient: "from-gold/20 to-gold/5" },
  other: { emoji: "🔮", gradient: "from-violet-500/20 to-violet-600/5" },
}

const DEFAULT_ICON = { emoji: "🔮", gradient: "from-violet-500/20 to-violet-600/5" }

interface ProductImageProps {
  src?: string
  alt: string
  category?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

const SIZE_CLASSES = {
  sm: "w-16 h-16 text-2xl",
  md: "w-20 h-20 text-3xl",
  lg: "w-64 h-64 text-7xl",
}

export function ProductImage({ src, alt, category, className = "", size = "md" }: ProductImageProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoading, setImgLoading] = useState(true)
  const icon = CATEGORY_ICONS[category || ""] || DEFAULT_ICON
  const showImage = src && !imgError

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${icon.gradient} border border-white/10 ${SIZE_CLASSES[size]} ${className}`}
    >
      {showImage ? (
        <>
          {imgLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          )}
          <Image
            src={src}
            alt={alt}
            fill
            className={`object-cover transition-opacity duration-300 ${imgLoading ? "opacity-0" : "opacity-100"}`}
            sizes="(max-width: 768px) 80px, 256px"
            unoptimized
            onLoad={() => setImgLoading(false)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        <span className="select-none">{icon.emoji}</span>
      )}
    </div>
  )
}
