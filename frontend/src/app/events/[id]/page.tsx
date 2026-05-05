"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, Sparkles, ShoppingBag, AlertCircle, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import { api, Product } from "@/lib/api"
import { ProductCard } from "@/components/reading/ProductCard"

interface EventAnalysis {
  id: string
  event_description: string
  event_datetime: string
  emotion_score: number
  causal_analysis: string
  current_advice: string
  future_prevention: string
  remedy_keywords: string[]
  recommended_product_ids: string[]
  recommended_products?: Product[]
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<EventAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!id) return
    api.get(`/api/readings/events/${id}`)
      .then(res => {
        setData(res.data)
        // Fetch matched products if remedy keywords exist
        if (res.data?.remedy_keywords?.length > 0) {
          return api.post("/api/products/match/", {
            weakness_tags: res.data.remedy_keywords,
            top_k: 4,
            include_explain: true,
          })
        }
        return null
      })
      .then(productRes => {
        if (productRes?.data) setProducts(productRes.data)
      })
      .catch(() => toast.error("无法加载事件分析"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-gold" />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen pt-24 pb-16 px-4 text-center">
      <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
      <p className="text-white/60">事件分析未找到</p>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/40 hover:text-gold text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> 返回
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <Sparkles className="text-gold mx-auto mb-3" size={24} />
          <h1 className="text-2xl font-serif font-bold text-gold">事件复盘分析</h1>
          <p className="text-white/40 text-xs mt-1">
            {new Date(data.event_datetime).toLocaleString("zh-CN")}
          </p>
        </div>

        {/* Event description */}
        <div className="card-glass p-6 mb-6">
          <h2 className="text-white/50 text-xs uppercase tracking-wider mb-2">事件描述</h2>
          <p className="text-white/80 text-sm">{data.event_description}</p>
          {data.emotion_score > 0 && (
            <span className="inline-block mt-2 text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
              情绪值: {data.emotion_score}/10
            </span>
          )}
        </div>

        {/* Causal Analysis */}
        <div className="card-glass p-6 mb-4">
          <h2 className="font-serif text-lg text-gold mb-3">🔍 因果链分析</h2>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {data.causal_analysis || "分析中…"}
          </div>
        </div>

        {/* Current Advice */}
        <div className="card-glass p-6 mb-4">
          <h2 className="font-serif text-lg text-gold mb-3">💡 当下应对</h2>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {data.current_advice || "分析中…"}
          </div>
        </div>

        {/* Future Prevention */}
        <div className="card-glass p-6 mb-6">
          <h2 className="font-serif text-lg text-gold mb-3">🛡 未来预防</h2>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {data.future_prevention || "分析中…"}
          </div>
        </div>

        {/* Energy Prescription Products */}
        {products.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={18} className="text-gold" />
              <h2 className="font-serif text-lg text-gold">能量处方 · 推荐商品</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Remedy keywords */}
        {data.remedy_keywords?.length > 0 && (
          <div className="card-glass p-5 mt-6">
            <p className="text-white/40 text-xs mb-3">补救关键词</p>
            <div className="flex flex-wrap gap-2">
              {data.remedy_keywords.map(k => (
                <span key={k} className="text-xs px-2.5 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold/80">
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
