"use client"
import { useState } from "react"
import { memo } from "react"

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

// Map size to pixel values for Next.js sizes attribute
const SIZE_PX = { sm: 64, md: 80, lg: 256 }

export const ProductImage = memo(function ProductImage({ src, alt, category, className = "", size = "md" }: ProductImageProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const icon = CATEGORY_ICONS[category || ""] || DEFAULT_ICON
  const showImage = !!src && !imgError
  const px = SIZE_PX[size]

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${icon.gradient} border border-white/10 ${SIZE_CLASSES[size]} ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          width={px}
          height={px}
          loading="lazy"
          className={`object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="select-none">{icon.emoji}</span>
      )}
    </div>
  )
})
