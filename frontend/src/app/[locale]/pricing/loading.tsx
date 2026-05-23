"use client"

export default function PricingLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-3 mb-10">
          <div className="h-8 bg-white/5 rounded-lg w-1/4 mx-auto animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-1/3 mx-auto animate-pulse" />
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
