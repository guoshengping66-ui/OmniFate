"use client"

export default function ShopLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-white/5 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card-glass p-4 space-y-3">
              <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
