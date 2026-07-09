"use client"

export default function LocaleLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-white/5 rounded-lg w-1/3 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
        </div>
        {/* Content skeleton */}
        <div className="card-glass p-6 space-y-4">
          <div className="h-5 bg-white/5 rounded w-1/4 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-[#030918] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        <div className="card-glass p-6 space-y-4">
          <div className="h-5 bg-white/5 rounded w-1/3 animate-pulse" />
          <div className="h-32 bg-[#030918] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
