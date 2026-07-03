"use client"

export default function EventDetailLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-4 bg-white/[0.04] rounded w-1/4 animate-pulse" />
        <div className="h-8 bg-white/[0.04] rounded w-2/3 animate-pulse" />
        <div className="card-solid p-6 space-y-4">
          <div className="h-4 bg-white/[0.04] rounded w-1/3 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-white/[0.04] rounded animate-pulse" />
            <div className="h-3 bg-white/[0.04] rounded w-5/6 animate-pulse" />
          </div>
          <div className="h-12 bg-gold/10 rounded-xl animate-pulse mt-4" />
        </div>
      </div>
    </div>
  )
}
