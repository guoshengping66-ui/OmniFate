"use client"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import toast from "react-hot-toast"
import { addFavorite, removeFavorite, getFavorites } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  productId: string
  size?: number
}

export function FavoriteButton({ productId, size = 16 }: Props) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [isFav, setIsFav] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) {
      setChecking(false)
      return
    }
    getFavorites()
      .then(favs => setIsFav(favs.some(f => f.id === productId)))
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [user, productId])

  const toggle = async () => {
    if (!user) {
      toast.error(t("fav.loginRequired"))
      return
    }
    try {
      if (isFav) {
        await removeFavorite(productId)
        setIsFav(false)
        toast.success(t("fav.removed"))
      } else {
        await addFavorite(productId)
        setIsFav(true)
        toast.success(t("fav.added"))
      }
    } catch {
      toast.error(t("fav.error"))
    }
  }

  if (checking) return null

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-full transition-all ${
        isFav
          ? "text-rose-400 hover:text-rose-300"
          : "text-white/20 hover:text-rose-400"
      }`}
      title={isFav ? t("fav.remove") : t("fav.add")}
    >
      <Heart size={size} className={isFav ? "fill-current" : ""} />
    </button>
  )
}
