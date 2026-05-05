"use client"
import { useEffect, useState } from "react"
import { Star, MessageSquare, Send, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { getProductReviews, createProductReview, type ProductReview } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  productId: string
}

export function ProductReviews({ productId }: Props) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getProductReviews(productId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error(t("reviews.contentRequired"))
      return
    }
    setSubmitting(true)
    try {
      const review = await createProductReview(productId, { rating, content: content.trim() })
      setReviews(prev => [review, ...prev])
      setContent("")
      setRating(5)
      setShowForm(false)
      toast.success(t("reviews.submitSuccess"))
    } catch {
      toast.error(t("reviews.submitFail"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-gold" />
          <h2 className="font-serif text-lg text-gold">{t("reviews.title")}</h2>
          {reviews.length > 0 && (
            <span className="text-white/30 text-xs">({reviews.length})</span>
          )}
        </div>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-gold/70 hover:text-gold transition-colors"
          >
            {showForm ? t("reviews.cancel") : t("reviews.write")}
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="card-glass p-4 mb-4 space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)}>
                <Star size={18} className={s <= rating ? "text-gold fill-gold" : "text-white/20"} />
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t("reviews.placeholder")}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 resize-none focus:border-gold/40 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 text-xs px-4 py-2 bg-gold/10 border border-gold/30 text-gold rounded-full hover:bg-gold/20 transition-all"
          >
            {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {t("reviews.submit")}
          </button>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="text-gold/40 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-white/20 text-sm text-center py-8">{t("reviews.empty")}</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="card-glass p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                    {r.user_name[0]}
                  </div>
                  <span className="text-white/60 text-sm">{r.user_name}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={10} className={s <= r.rating ? "text-gold fill-gold" : "text-white/10"} />
                  ))}
                </div>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">{r.content}</p>
              <p className="text-white/20 text-[10px] mt-2">{new Date(r.created_at).toLocaleDateString("zh-CN")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
