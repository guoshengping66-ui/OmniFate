"use client"

export default function PricingLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="h-8 bg-white/[0.04] rounded w-1/3 mx-auto animate-pulse" />
          <div className="h-4 bg-white/[0.04] rounded w-1/2 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-solid p-6 space-y-4">
              <div className="h-6 bg-white/[0.04] rounded w-1/3 animate-pulse" />
              <div className="h-8 bg-white/[0.04] rounded w-1/2 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 bg-white/[0.04] rounded animate-pulse" />
                <div className="h-3 bg-white/[0.04] rounded w-5/6 animate-pulse" />
              </div>
              <div className="h-10 bg-gold/10 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
