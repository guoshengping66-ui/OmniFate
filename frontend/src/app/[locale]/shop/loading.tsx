"use client"

export default function ShopLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 bg-white/5 rounded w-1/4 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse" />
        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card-glass overflow-hidden animate-pulse">
              <div className="aspect-square bg-white/[0.03]" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-5 bg-gold/10 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
