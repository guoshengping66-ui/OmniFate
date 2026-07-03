"use client"

export default function ShopDetailLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-white/[0.03] rounded-2xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 bg-white/[0.04] rounded w-1/4 animate-pulse" />
          <div className="h-8 bg-white/[0.04] rounded w-3/4 animate-pulse" />
          <div className="h-6 bg-gold/10 rounded w-1/3 animate-pulse" />
          <div className="space-y-2 mt-6">
            <div className="h-3 bg-white/[0.04] rounded animate-pulse" />
            <div className="h-3 bg-white/[0.04] rounded w-5/6 animate-pulse" />
            <div className="h-3 bg-white/[0.04] rounded w-2/3 animate-pulse" />
          </div>
          <div className="h-12 bg-gold/10 rounded-xl animate-pulse mt-6" />
        </div>
      </div>
    </div>
  )
}
