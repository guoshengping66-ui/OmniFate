"use client"

export default function ReadingDetailLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gold/10 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 bg-white/5 rounded w-48 animate-pulse" />
            <div className="h-3 bg-white/5 rounded w-32 animate-pulse" />
          </div>
        </div>
        {/* Progress skeleton */}
        <div className="card-glass p-4 space-y-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="flex-1 h-2 rounded-full bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="card-glass p-6 space-y-4">
          <div className="h-5 bg-white/5 rounded w-1/4 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-white/5 rounded animate-pulse" />
            <div className="h-3 bg-white/5 rounded w-5/6 animate-pulse" />
            <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
